(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('http'), require('fs'), require('crypto')) :
        typeof define === 'function' && define.amd ? define(['http', 'fs', 'crypto'], factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Server = factory(global.http, global.fs, global.crypto));
}(this, (function (http, fs, crypto) {
    'use strict';

    function _interopDefaultLegacy(e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var http__default = /*#__PURE__*/_interopDefaultLegacy(http);
    var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
    var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);

    class ServiceError extends Error {
        constructor(message = 'Service Error') {
            super(message);
            this.name = 'ServiceError';
        }
    }

    class NotFoundError extends ServiceError {
        constructor(message = 'Resource not found') {
            super(message);
            this.name = 'NotFoundError';
            this.status = 404;
        }
    }

    class RequestError extends ServiceError {
        constructor(message = 'Request error') {
            super(message);
            this.name = 'RequestError';
            this.status = 400;
        }
    }

    class ConflictError extends ServiceError {
        constructor(message = 'Resource conflict') {
            super(message);
            this.name = 'ConflictError';
            this.status = 409;
        }
    }

    class AuthorizationError extends ServiceError {
        constructor(message = 'Unauthorized') {
            super(message);
            this.name = 'AuthorizationError';
            this.status = 401;
        }
    }

    class CredentialError extends ServiceError {
        constructor(message = 'Forbidden') {
            super(message);
            this.name = 'CredentialError';
            this.status = 403;
        }
    }

    var errors = {
        ServiceError,
        NotFoundError,
        RequestError,
        ConflictError,
        AuthorizationError,
        CredentialError
    };

    const { ServiceError: ServiceError$1 } = errors;


    function createHandler(plugins, services) {
        return async function handler(req, res) {
            const method = req.method;
            console.info(`<< ${req.method} ${req.url}`);

            // Redirect fix for admin panel relative paths
            if (req.url.slice(-6) == '/admin') {
                res.writeHead(302, {
                    'Location': `http://${req.headers.host}/admin/`
                });
                return res.end();
            }

            let status = 200;
            let headers = {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            };
            let result = '';
            let context;

            // NOTE: the OPTIONS method results in undefined result and also it never processes plugins - keep this in mind
            if (method == 'OPTIONS') {
                Object.assign(headers, {
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Credentials': false,
                    'Access-Control-Max-Age': '86400',
                    'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, X-Authorization, X-Admin'
                });
            } else {
                try {
                    context = processPlugins();
                    await handle(context);
                } catch (err) {
                    if (err instanceof ServiceError$1) {
                        status = err.status || 400;
                        result = composeErrorObject(err.code || status, err.message);
                    } else {
                        // Unhandled exception, this is due to an error in the service code - REST consumers should never have to encounter this;
                        // If it happens, it must be debugged in a future version of the server
                        console.error(err);
                        status = 500;
                        result = composeErrorObject(500, 'Server Error');
                    }
                }
            }

            res.writeHead(status, headers);
            if (context != undefined && context.util != undefined && context.util.throttle) {
                await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
            }
            res.end(result);

            function processPlugins() {
                const context = { params: {} };
                plugins.forEach(decorate => decorate(context, req));
                return context;
            }

            async function handle(context) {
                const { serviceName, tokens, query, body } = await parseRequest(req);
                if (serviceName == 'admin') {
                    return ({ headers, result } = services['admin'](method, tokens, query, body));
                } else if (serviceName == 'favicon.ico') {
                    return ({ headers, result } = services['favicon'](method, tokens, query, body));
                }

                const service = services[serviceName];

                if (service === undefined) {
                    status = 400;
                    result = composeErrorObject(400, `Service "${serviceName}" is not supported`);
                    console.error('Missing service ' + serviceName);
                } else {
                    result = await service(context, { method, tokens, query, body });
                }

                // NOTE: logout does not return a result
                // in this case the content type header should be omitted, to allow checks on the client
                if (result !== undefined) {
                    result = JSON.stringify(result);
                } else {
                    status = 204;
                    delete headers['Content-Type'];
                }
            }
        };
    }



    function composeErrorObject(code, message) {
        return JSON.stringify({
            code,
            message
        });
    }

    async function parseRequest(req) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const tokens = url.pathname.split('/').filter(x => x.length > 0);
        const serviceName = tokens.shift();
        const queryString = url.search.split('?')[1] || '';
        const query = queryString
            .split('&')
            .filter(s => s != '')
            .map(x => x.split('='))
            .reduce((p, [k, v]) => Object.assign(p, { [k]: decodeURIComponent(v) }), {});
        const body = await parseBody(req);

        return {
            serviceName,
            tokens,
            query,
            body
        };
    }

    function parseBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (chunk) => body += chunk.toString());
            req.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (err) {
                    resolve(body);
                }
            });
        });
    }

    var requestHandler = createHandler;

    class Service {
        constructor() {
            this._actions = [];
            this.parseRequest = this.parseRequest.bind(this);
        }

        /**
         * Handle service request, after it has been processed by a request handler
         * @param {*} context Execution context, contains result of middleware processing
         * @param {{method: string, tokens: string[], query: *, body: *}} request Request parameters
         */
        async parseRequest(context, request) {
            for (let { method, name, handler } of this._actions) {
                if (method === request.method && matchAndAssignParams(context, request.tokens[0], name)) {
                    return await handler(context, request.tokens.slice(1), request.query, request.body);
                }
            }
        }

        /**
         * Register service action
         * @param {string} method HTTP method
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        registerAction(method, name, handler) {
            this._actions.push({ method, name, handler });
        }

        /**
         * Register GET action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        get(name, handler) {
            this.registerAction('GET', name, handler);
        }

        /**
         * Register POST action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        post(name, handler) {
            this.registerAction('POST', name, handler);
        }

        /**
         * Register PUT action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        put(name, handler) {
            this.registerAction('PUT', name, handler);
        }

        /**
         * Register PATCH action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        patch(name, handler) {
            this.registerAction('PATCH', name, handler);
        }

        /**
         * Register DELETE action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        delete(name, handler) {
            this.registerAction('DELETE', name, handler);
        }
    }

    function matchAndAssignParams(context, name, pattern) {
        if (pattern == '*') {
            return true;
        } else if (pattern[0] == ':') {
            context.params[pattern.slice(1)] = name;
            return true;
        } else if (name == pattern) {
            return true;
        } else {
            return false;
        }
    }

    var Service_1 = Service;

    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    var util = {
        uuid
    };

    const uuid$1 = util.uuid;


    const data = fs__default['default'].existsSync('./data') ? fs__default['default'].readdirSync('./data').reduce((p, c) => {
        const content = JSON.parse(fs__default['default'].readFileSync('./data/' + c));
        const collection = c.slice(0, -5);
        p[collection] = {};
        for (let endpoint in content) {
            p[collection][endpoint] = content[endpoint];
        }
        return p;
    }, {}) : {};

    const actions = {
        get: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            let responseData = data;
            for (let token of tokens) {
                if (responseData !== undefined) {
                    responseData = responseData[token];
                }
            }
            return responseData;
        },
        post: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            console.log('Request body:\n', body);

            // TODO handle collisions, replacement
            let responseData = data;
            for (let token of tokens) {
                if (responseData.hasOwnProperty(token) == false) {
                    responseData[token] = {};
                }
                responseData = responseData[token];
            }

            const newId = uuid$1();
            responseData[newId] = Object.assign({}, body, { _id: newId });
            return responseData[newId];
        },
        put: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            console.log('Request body:\n', body);

            let responseData = data;
            for (let token of tokens.slice(0, -1)) {
                if (responseData !== undefined) {
                    responseData = responseData[token];
                }
            }
            if (responseData !== undefined && responseData[tokens.slice(-1)] !== undefined) {
                responseData[tokens.slice(-1)] = body;
            }
            return responseData[tokens.slice(-1)];
        },
        patch: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            console.log('Request body:\n', body);

            let responseData = data;
            for (let token of tokens) {
                if (responseData !== undefined) {
                    responseData = responseData[token];
                }
            }
            if (responseData !== undefined) {
                Object.assign(responseData, body);
            }
            return responseData;
        },
        delete: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            let responseData = data;

            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                if (responseData.hasOwnProperty(token) == false) {
                    return null;
                }
                if (i == tokens.length - 1) {
                    const body = responseData[token];
                    delete responseData[token];
                    return body;
                } else {
                    responseData = responseData[token];
                }
            }
        }
    };

    const dataService = new Service_1();
    dataService.get(':collection', actions.get);
    dataService.post(':collection', actions.post);
    dataService.put(':collection', actions.put);
    dataService.patch(':collection', actions.patch);
    dataService.delete(':collection', actions.delete);


    var jsonstore = dataService.parseRequest;

    /*
     * This service requires storage and auth plugins
     */

    const { AuthorizationError: AuthorizationError$1 } = errors;



    const userService = new Service_1();

    userService.get('me', getSelf);
    userService.post('register', onRegister);
    userService.post('login', onLogin);
    userService.get('logout', onLogout);


    function getSelf(context, tokens, query, body) {
        if (context.user) {
            const result = Object.assign({}, context.user);
            delete result.hashedPassword;
            return result;
        } else {
            throw new AuthorizationError$1();
        }
    }

    function onRegister(context, tokens, query, body) {
        return context.auth.register(body);
    }

    function onLogin(context, tokens, query, body) {
        return context.auth.login(body);
    }

    function onLogout(context, tokens, query, body) {
        return context.auth.logout();
    }

    var users = userService.parseRequest;

    const { NotFoundError: NotFoundError$1, RequestError: RequestError$1 } = errors;


    var crud = {
        get,
        post,
        put,
        patch,
        delete: del
    };


    function validateRequest(context, tokens, query) {
        /*
        if (context.params.collection == undefined) {
            throw new RequestError('Please, specify collection name');
        }
        */
        if (tokens.length > 1) {
            throw new RequestError$1();
        }
    }

    function parseWhere(query) {
        const operators = {
            '<=': (prop, value) => record => record[prop] <= JSON.parse(value),
            '<': (prop, value) => record => record[prop] < JSON.parse(value),
            '>=': (prop, value) => record => record[prop] >= JSON.parse(value),
            '>': (prop, value) => record => record[prop] > JSON.parse(value),
            '=': (prop, value) => record => record[prop] == JSON.parse(value),
            ' like ': (prop, value) => record => record[prop].toLowerCase().includes(JSON.parse(value).toLowerCase()),
            ' in ': (prop, value) => record => JSON.parse(`[${/\((.+?)\)/.exec(value)[1]}]`).includes(record[prop]),
        };
        const pattern = new RegExp(`^(.+?)(${Object.keys(operators).join('|')})(.+?)$`, 'i');

        try {
            let clauses = [query.trim()];
            let check = (a, b) => b;
            let acc = true;
            if (query.match(/ and /gi)) {
                // inclusive
                clauses = query.split(/ and /gi);
                check = (a, b) => a && b;
                acc = true;
            } else if (query.match(/ or /gi)) {
                // optional
                clauses = query.split(/ or /gi);
                check = (a, b) => a || b;
                acc = false;
            }
            clauses = clauses.map(createChecker);

            return (record) => clauses
                .map(c => c(record))
                .reduce(check, acc);
        } catch (err) {
            throw new Error('Could not parse WHERE clause, check your syntax.');
        }

        function createChecker(clause) {
            let [match, prop, operator, value] = pattern.exec(clause);
            [prop, value] = [prop.trim(), value.trim()];

            return operators[operator.toLowerCase()](prop, value);
        }
    }


    function get(context, tokens, query, body) {
        validateRequest(context, tokens);

        let responseData;

        try {
            if (query.where) {
                responseData = context.storage.get(context.params.collection).filter(parseWhere(query.where));
            } else if (context.params.collection) {
                responseData = context.storage.get(context.params.collection, tokens[0]);
            } else {
                // Get list of collections
                return context.storage.get();
            }

            if (query.sortBy) {
                const props = query.sortBy
                    .split(',')
                    .filter(p => p != '')
                    .map(p => p.split(' ').filter(p => p != ''))
                    .map(([p, desc]) => ({ prop: p, desc: desc ? true : false }));

                // Sorting priority is from first to last, therefore we sort from last to first
                for (let i = props.length - 1; i >= 0; i--) {
                    let { prop, desc } = props[i];
                    responseData.sort(({ [prop]: propA }, { [prop]: propB }) => {
                        if (typeof propA == 'number' && typeof propB == 'number') {
                            return (propA - propB) * (desc ? -1 : 1);
                        } else {
                            return propA.localeCompare(propB) * (desc ? -1 : 1);
                        }
                    });
                }
            }

            if (query.offset) {
                responseData = responseData.slice(Number(query.offset) || 0);
            }
            const pageSize = Number(query.pageSize) || 10;
            if (query.pageSize) {
                responseData = responseData.slice(0, pageSize);
            }

            if (query.distinct) {
                const props = query.distinct.split(',').filter(p => p != '');
                responseData = Object.values(responseData.reduce((distinct, c) => {
                    const key = props.map(p => c[p]).join('::');
                    if (distinct.hasOwnProperty(key) == false) {
                        distinct[key] = c;
                    }
                    return distinct;
                }, {}));
            }

            if (query.count) {
                return responseData.length;
            }

            if (query.select) {
                const props = query.select.split(',').filter(p => p != '');
                responseData = Array.isArray(responseData) ? responseData.map(transform) : transform(responseData);

                function transform(r) {
                    const result = {};
                    props.forEach(p => result[p] = r[p]);
                    return result;
                }
            }

            if (query.load) {
                const props = query.load.split(',').filter(p => p != '');
                props.map(prop => {
                    const [propName, relationTokens] = prop.split('=');
                    const [idSource, collection] = relationTokens.split(':');
                    console.log(`Loading related records from "${collection}" into "${propName}", joined on "_id"="${idSource}"`);
                    const storageSource = collection == 'users' ? context.protectedStorage : context.storage;
                    responseData = Array.isArray(responseData) ? responseData.map(transform) : transform(responseData);

                    function transform(r) {
                        const seekId = r[idSource];
                        const related = storageSource.get(collection, seekId);
                        delete related.hashedPassword;
                        r[propName] = related;
                        return r;
                    }
                });
            }

        } catch (err) {
            console.error(err);
            if (err.message.includes('does not exist')) {
                throw new NotFoundError$1();
            } else {
                throw new RequestError$1(err.message);
            }
        }

        context.canAccess(responseData);

        return responseData;
    }

    function post(context, tokens, query, body) {
        console.log('Request body:\n', body);

        validateRequest(context, tokens);
        if (tokens.length > 0) {
            throw new RequestError$1('Use PUT to update records');
        }
        context.canAccess(undefined, body);

        body._ownerId = context.user._id;
        let responseData;

        try {
            responseData = context.storage.add(context.params.collection, body);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    function put(context, tokens, query, body) {
        console.log('Request body:\n', body);

        validateRequest(context, tokens);
        if (tokens.length != 1) {
            throw new RequestError$1('Missing entry ID');
        }

        let responseData;
        let existing;

        try {
            existing = context.storage.get(context.params.collection, tokens[0]);
        } catch (err) {
            throw new NotFoundError$1();
        }

        context.canAccess(existing, body);

        try {
            responseData = context.storage.set(context.params.collection, tokens[0], body);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    function patch(context, tokens, query, body) {
        console.log('Request body:\n', body);

        validateRequest(context, tokens);
        if (tokens.length != 1) {
            throw new RequestError$1('Missing entry ID');
        }

        let responseData;
        let existing;

        try {
            existing = context.storage.get(context.params.collection, tokens[0]);
        } catch (err) {
            throw new NotFoundError$1();
        }

        context.canAccess(existing, body);

        try {
            responseData = context.storage.merge(context.params.collection, tokens[0], body);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    function del(context, tokens, query, body) {
        validateRequest(context, tokens);
        if (tokens.length != 1) {
            throw new RequestError$1('Missing entry ID');
        }

        let responseData;
        let existing;

        try {
            existing = context.storage.get(context.params.collection, tokens[0]);
        } catch (err) {
            throw new NotFoundError$1();
        }

        context.canAccess(existing);

        try {
            responseData = context.storage.delete(context.params.collection, tokens[0]);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    /*
     * This service requires storage and auth plugins
     */

    const dataService$1 = new Service_1();
    dataService$1.get(':collection', crud.get);
    dataService$1.post(':collection', crud.post);
    dataService$1.put(':collection', crud.put);
    dataService$1.patch(':collection', crud.patch);
    dataService$1.delete(':collection', crud.delete);

    var data$1 = dataService$1.parseRequest;

    const imgdata = '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Td4DLneAwSddMiRH8tMU8nng/Yy+KQsM3AKBNbe35j5OH4A0dbV8AxwcAqMFyl73eHd3e2//nmn29wOGi3Kv+RixSgAAEkxpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOmlwdGNFeHQ9Imh0dHA6Ly9pcHRjLm9yZy9zdGQvSXB0YzR4bXBFeHQvMjAwOC0wMi0yOS8iCiAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiCiAgICB4bWxuczpwbHVzPSJodHRwOi8vbnMudXNlcGx1cy5vcmcvbGRmL3htcC8xLjAvIgogICAgeG1sbnM6R0lNUD0iaHR0cDovL3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgeG1sbnM6eG1wUmlnaHRzPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvcmlnaHRzLyIKICAgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOjdjZDM3NWM3LTcwNmItNDlkMy1hOWRkLWNmM2Q3MmMwY2I4ZCIKICAgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2NGY2YTJlYy04ZjA5LTRkZTMtOTY3ZC05MTUyY2U5NjYxNTAiCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxMmE1NzI5Mi1kNmJkLTRlYjQtOGUxNi1hODEzYjMwZjU0NWYiCiAgIEdJTVA6QVBJPSIyLjAiCiAgIEdJTVA6UGxhdGZvcm09IldpbmRvd3MiCiAgIEdJTVA6VGltZVN0YW1wPSIxNjEzMzAwNzI5NTMwNjQzIgogICBHSU1QOlZlcnNpb249IjIuMTAuMTIiCiAgIGRjOkZvcm1hdD0iaW1hZ2UvcG5nIgogICBwaG90b3Nob3A6Q3JlZGl0PSJHZXR0eSBJbWFnZXMvaVN0b2NrcGhvdG8iCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIgogICB4bXBSaWdodHM6V2ViU3RhdGVtZW50PSJodHRwczovL3d3dy5pc3RvY2twaG90by5jb20vbGVnYWwvbGljZW5zZS1hZ3JlZW1lbnQ/dXRtX21lZGl1bT1vcmdhbmljJmFtcDt1dG1fc291cmNlPWdvb2dsZSZhbXA7dXRtX2NhbXBhaWduPWlwdGN1cmwiPgogICA8aXB0Y0V4dDpMb2NhdGlvbkNyZWF0ZWQ+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpMb2NhdGlvbkNyZWF0ZWQ+CiAgIDxpcHRjRXh0OkxvY2F0aW9uU2hvd24+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpMb2NhdGlvblNob3duPgogICA8aXB0Y0V4dDpBcnR3b3JrT3JPYmplY3Q+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpBcnR3b3JrT3JPYmplY3Q+CiAgIDxpcHRjRXh0OlJlZ2lzdHJ5SWQ+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpSZWdpc3RyeUlkPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpjOTQ2M2MxMC05OWE4LTQ1NDQtYmRlOS1mNzY0ZjdhODJlZDkiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkdpbXAgMi4xMCAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjEtMDItMTRUMTM6MDU6MjkiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogICA8cGx1czpJbWFnZVN1cHBsaWVyPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6SW1hZ2VTdXBwbGllcj4KICAgPHBsdXM6SW1hZ2VDcmVhdG9yPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6SW1hZ2VDcmVhdG9yPgogICA8cGx1czpDb3B5cmlnaHRPd25lcj4KICAgIDxyZGY6U2VxLz4KICAgPC9wbHVzOkNvcHlyaWdodE93bmVyPgogICA8cGx1czpMaWNlbnNvcj4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgcGx1czpMaWNlbnNvclVSTD0iaHR0cHM6Ly93d3cuaXN0b2NrcGhvdG8uY29tL3Bob3RvL2xpY2Vuc2UtZ20xMTUwMzQ1MzQxLT91dG1fbWVkaXVtPW9yZ2FuaWMmYW1wO3V0bV9zb3VyY2U9Z29vZ2xlJmFtcDt1dG1fY2FtcGFpZ249aXB0Y3VybCIvPgogICAgPC9yZGY6U2VxPgogICA8L3BsdXM6TGljZW5zb3I+CiAgIDxkYzpjcmVhdG9yPgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaT5WbGFkeXNsYXYgU2VyZWRhPC9yZGY6bGk+CiAgICA8L3JkZjpTZXE+CiAgIDwvZGM6Y3JlYXRvcj4KICAgPGRjOmRlc2NyaXB0aW9uPgogICAgPHJkZjpBbHQ+CiAgICAgPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ij5TZXJ2aWNlIHRvb2xzIGljb24gb24gd2hpdGUgYmFja2dyb3VuZC4gVmVjdG9yIGlsbHVzdHJhdGlvbi48L3JkZjpsaT4KICAgIDwvcmRmOkFsdD4KICAgPC9kYzpkZXNjcmlwdGlvbj4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PmWJCnkAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQflAg4LBR0CZnO/AAAARHRFWHRDb21tZW50AFNlcnZpY2UgdG9vbHMgaWNvbiBvbiB3aGl0ZSBiYWNrZ3JvdW5kLiBWZWN0b3IgaWxsdXN0cmF0aW9uLlwvEeIAAAMxSURBVHja7Z1bcuQwCEX7qrLQXlp2ynxNVWbK7dgWj3sl9JvYRhxACD369erW7UMzx/cYaychonAQvXM5ABYkpynoYIiEGdoQog6AYfywBrCxF4zNrX/7McBbuXJe8rXx/KBDULcGsMREzCbeZ4J6ME/9wVH5d95rogZp3npEgPLP3m2iUSGqXBJS5Dr6hmLm8kRuZABYti5TMaailV8LodNQwTTUWk4/WZk75l0kM0aZQdaZjMqkrQDAuyMVJWFjMB4GANXr0lbZBxQKr7IjI7QvVWkok/Jn5UHVh61CYPs+/i7eL9j3y/Au8WqoAIC34k8/9k7N8miLcaGWHwgjZXE/awyYX7h41wKMCskZM2HXAddDkTdglpSjz5bcKPbcCEKwT3+DhxtVpJvkEC7rZSgq32NMSBoXaCdiahDCKrND0fpX8oQlVsQ8IFQZ1VARdIF5wroekAjB07gsAgDUIbQHFENIDEX4CQANIVe8Iw/ASiACLXl28eaf579OPuBa9/mrELUYHQ1t3KHlZZnRcXb2/c7ygXIQZqjDMEzeSrOgCAhqYMvTUE+FKXoVxTxgk3DEPREjGzj3nAk/VaKyB9GVIu4oMyOlrQZgrBBEFG9PAZTfs3amYDGrP9Wl964IeFvtz9JFluIvlEvcdoXDOdxggbDxGwTXcxFRi/LdirKgZUBm7SUdJG69IwSUzAMWgOAq/4hyrZVaJISSNWHFVbEoCFEhyBrCtXS9L+so9oTy8wGqxbQDD350WTjNESVFEB5hdKzUGcV5QtYxVWR2Ssl4Mg9qI9u6FCBInJRXgfEEgtS9Cgrg7kKouq4mdcDNBnEHQvWFTdgdgsqP+MiluVeBM13ahx09AYSWi50gsF+I6vn7BmCEoHR3NBzkpIOw4+XdVBBGQUioblaZHbGlodtB+N/jxqwLX/x/NARfD8ADxTOCKIcwE4Lw0OIbguMYcGTlymEpHYLXIKx8zQEqIfS2lGJPaADFEBR/PMH79ErqtpnZmTBlvM4wgihPWDEEhXn1LISj50crNgfCp+dWHYQRCfb2zgfnBZmKGAyi914anK9Coi4LOMhoAn3uVtn+AGnLKxPUZnCuAAAAAElFTkSuQmCC';
    const img = Buffer.from(imgdata, 'base64');

    var favicon = (method, tokens, query, body) => {
        console.log('serving favicon...');
        const headers = {
            'Content-Type': 'image/png',
            'Content-Length': img.length
        };
        let result = img;

        return {
            headers,
            result
        };
    };

    var require$$0 = "<!DOCTYPE html>\r\n<html lang=\"en\">\r\n<head>\r\n    <meta charset=\"UTF-8\">\r\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\r\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\r\n    <title>SUPS Admin Panel</title>\r\n    <style>\r\n        * {\r\n            padding: 0;\r\n            margin: 0;\r\n        }\r\n\r\n        body {\r\n            padding: 32px;\r\n            font-size: 16px;\r\n        }\r\n\r\n        .layout::after {\r\n            content: '';\r\n            clear: both;\r\n            display: table;\r\n        }\r\n\r\n        .col {\r\n            display: block;\r\n            float: left;\r\n        }\r\n\r\n        p {\r\n            padding: 8px 16px;\r\n        }\r\n\r\n        table {\r\n            border-collapse: collapse;\r\n        }\r\n\r\n        caption {\r\n            font-size: 120%;\r\n            text-align: left;\r\n            padding: 4px 8px;\r\n            font-weight: bold;\r\n            background-color: #ddd;\r\n        }\r\n\r\n        table, tr, th, td {\r\n            border: 1px solid #ddd;\r\n        }\r\n\r\n        th, td {\r\n            padding: 4px 8px;\r\n        }\r\n\r\n        ul {\r\n            list-style: none;\r\n        }\r\n\r\n        .collection-list a {\r\n            display: block;\r\n            width: 120px;\r\n            padding: 4px 8px;\r\n            text-decoration: none;\r\n            color: black;\r\n            background-color: #ccc;\r\n        }\r\n        .collection-list a:hover {\r\n            background-color: #ddd;\r\n        }\r\n        .collection-list a:visited {\r\n            color: black;\r\n        }\r\n    </style>\r\n    <script type=\"module\">\nimport { html, render } from 'https://unpkg.com/lit-html@1.3.0?module';\nimport { until } from 'https://unpkg.com/lit-html@1.3.0/directives/until?module';\n\nconst api = {\r\n    async get(url) {\r\n        return json(url);\r\n    },\r\n    async post(url, body) {\r\n        return json(url, {\r\n            method: 'POST',\r\n            headers: { 'Content-Type': 'application/json' },\r\n            body: JSON.stringify(body)\r\n        });\r\n    }\r\n};\r\n\r\nasync function json(url, options) {\r\n    return await (await fetch('/' + url, options)).json();\r\n}\r\n\r\nasync function getCollections() {\r\n    return api.get('data');\r\n}\r\n\r\nasync function getRecords(collection) {\r\n    return api.get('data/' + collection);\r\n}\r\n\r\nasync function getThrottling() {\r\n    return api.get('util/throttle');\r\n}\r\n\r\nasync function setThrottling(throttle) {\r\n    return api.post('util', { throttle });\r\n}\n\nasync function collectionList(onSelect) {\r\n    const collections = await getCollections();\r\n\r\n    return html`\r\n    <ul class=\"collection-list\">\r\n        ${collections.map(collectionLi)}\r\n    </ul>`;\r\n\r\n    function collectionLi(name) {\r\n        return html`<li><a href=\"javascript:void(0)\" @click=${(ev) => onSelect(ev, name)}>${name}</a></li>`;\r\n    }\r\n}\n\nasync function recordTable(collectionName) {\r\n    const records = await getRecords(collectionName);\r\n    const layout = getLayout(records);\r\n\r\n    return html`\r\n    <table>\r\n        <caption>${collectionName}</caption>\r\n        <thead>\r\n            <tr>${layout.map(f => html`<th>${f}</th>`)}</tr>\r\n        </thead>\r\n        <tbody>\r\n            ${records.map(r => recordRow(r, layout))}\r\n        </tbody>\r\n    </table>`;\r\n}\r\n\r\nfunction getLayout(records) {\r\n    const result = new Set(['_id']);\r\n    records.forEach(r => Object.keys(r).forEach(k => result.add(k)));\r\n\r\n    return [...result.keys()];\r\n}\r\n\r\nfunction recordRow(record, layout) {\r\n    return html`\r\n    <tr>\r\n        ${layout.map(f => html`<td>${JSON.stringify(record[f]) || html`<span>(missing)</span>`}</td>`)}\r\n    </tr>`;\r\n}\n\nasync function throttlePanel(display) {\r\n    const active = await getThrottling();\r\n\r\n    return html`\r\n    <p>\r\n        Request throttling: </span>${active}</span>\r\n        <button @click=${(ev) => set(ev, true)}>Enable</button>\r\n        <button @click=${(ev) => set(ev, false)}>Disable</button>\r\n    </p>`;\r\n\r\n    async function set(ev, state) {\r\n        ev.target.disabled = true;\r\n        await setThrottling(state);\r\n        display();\r\n    }\r\n}\n\n//import page from '//unpkg.com/page/page.mjs';\r\n\r\n\r\nfunction start() {\r\n    const main = document.querySelector('main');\r\n    editor(main);\r\n}\r\n\r\nasync function editor(main) {\r\n    let list = html`<div class=\"col\">Loading&hellip;</div>`;\r\n    let viewer = html`<div class=\"col\">\r\n    <p>Select collection to view records</p>\r\n</div>`;\r\n    display();\r\n\r\n    list = html`<div class=\"col\">${await collectionList(onSelect)}</div>`;\r\n    display();\r\n\r\n    async function display() {\r\n        render(html`\r\n        <section class=\"layout\">\r\n            ${until(throttlePanel(display), html`<p>Loading</p>`)}\r\n        </section>\r\n        <section class=\"layout\">\r\n            ${list}\r\n            ${viewer}\r\n        </section>`, main);\r\n    }\r\n\r\n    async function onSelect(ev, name) {\r\n        ev.preventDefault();\r\n        viewer = html`<div class=\"col\">${await recordTable(name)}</div>`;\r\n        display();\r\n    }\r\n}\r\n\r\nstart();\n\n</script>\r\n</head>\r\n<body>\r\n    <main>\r\n        Loading&hellip;\r\n    </main>\r\n</body>\r\n</html>";

    const mode = process.argv[2] == '-dev' ? 'dev' : 'prod';

    const files = {
        index: mode == 'prod' ? require$$0 : fs__default['default'].readFileSync('./client/index.html', 'utf-8')
    };

    var admin = (method, tokens, query, body) => {
        const headers = {
            'Content-Type': 'text/html'
        };
        let result = '';

        const resource = tokens.join('/');
        if (resource && resource.split('.').pop() == 'js') {
            headers['Content-Type'] = 'application/javascript';

            files[resource] = files[resource] || fs__default['default'].readFileSync('./client/' + resource, 'utf-8');
            result = files[resource];
        } else {
            result = files.index;
        }

        return {
            headers,
            result
        };
    };

    /*
     * This service requires util plugin
     */

    const utilService = new Service_1();

    utilService.post('*', onRequest);
    utilService.get(':service', getStatus);

    function getStatus(context, tokens, query, body) {
        return context.util[context.params.service];
    }

    function onRequest(context, tokens, query, body) {
        Object.entries(body).forEach(([k, v]) => {
            console.log(`${k} ${v ? 'enabled' : 'disabled'}`);
            context.util[k] = v;
        });
        return '';
    }

    var util$1 = utilService.parseRequest;

    var services = {
        jsonstore,
        users,
        data: data$1,
        favicon,
        admin,
        util: util$1
    };

    const { uuid: uuid$2 } = util;


    function initPlugin(settings) {
        const storage = createInstance(settings.seedData);
        const protectedStorage = createInstance(settings.protectedData);

        return function decoreateContext(context, request) {
            context.storage = storage;
            context.protectedStorage = protectedStorage;
        };
    }


    /**
     * Create storage instance and populate with seed data
     * @param {Object=} seedData Associative array with data. Each property is an object with properties in format {key: value}
     */
    function createInstance(seedData = {}) {
        const collections = new Map();

        // Initialize seed data from file    
        for (let collectionName in seedData) {
            if (seedData.hasOwnProperty(collectionName)) {
                const collection = new Map();
                for (let recordId in seedData[collectionName]) {
                    if (seedData.hasOwnProperty(collectionName)) {
                        collection.set(recordId, seedData[collectionName][recordId]);
                    }
                }
                collections.set(collectionName, collection);
            }
        }


        // Manipulation

        /**
         * Get entry by ID or list of all entries from collection or list of all collections
         * @param {string=} collection Name of collection to access. Throws error if not found. If omitted, returns list of all collections.
         * @param {number|string=} id ID of requested entry. Throws error if not found. If omitted, returns of list all entries in collection.
         * @return {Object} Matching entry.
         */
        function get(collection, id) {
            if (!collection) {
                return [...collections.keys()];
            }
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!id) {
                const entries = [...targetCollection.entries()];
                let result = entries.map(([k, v]) => {
                    return Object.assign(deepCopy(v), { _id: k });
                });
                return result;
            }
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }
            const entry = targetCollection.get(id);
            return Object.assign(deepCopy(entry), { _id: id });
        }

        /**
         * Add new entry to collection. ID will be auto-generated
         * @param {string} collection Name of collection to access. If the collection does not exist, it will be created.
         * @param {Object} data Value to store.
         * @return {Object} Original value with resulting ID under _id property.
         */
        function add(collection, data) {
            const record = assignClean({ _ownerId: data._ownerId }, data);

            let targetCollection = collections.get(collection);
            if (!targetCollection) {
                targetCollection = new Map();
                collections.set(collection, targetCollection);
            }
            let id = uuid$2();
            // Make sure new ID does not match existing value
            while (targetCollection.has(id)) {
                id = uuid$2();
            }

            record._createdOn = Date.now();
            targetCollection.set(id, record);
            return Object.assign(deepCopy(record), { _id: id });
        }

        /**
         * Replace entry by ID
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {number|string} id ID of entry to update. Throws error if not found.
         * @param {Object} data Value to store. Record will be replaced!
         * @return {Object} Updated entry.
         */
        function set(collection, id, data) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }

            const existing = targetCollection.get(id);
            const record = assignSystemProps(deepCopy(data), existing);
            record._updatedOn = Date.now();
            targetCollection.set(id, record);
            return Object.assign(deepCopy(record), { _id: id });
        }

        /**
         * Modify entry by ID
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {number|string} id ID of entry to update. Throws error if not found.
         * @param {Object} data Value to store. Shallow merge will be performed!
         * @return {Object} Updated entry.
         */
        function merge(collection, id, data) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }

            const existing = deepCopy(targetCollection.get(id));
            const record = assignClean(existing, data);
            record._updatedOn = Date.now();
            targetCollection.set(id, record);
            return Object.assign(deepCopy(record), { _id: id });
        }

        /**
         * Delete entry by ID
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {number|string} id ID of entry to update. Throws error if not found.
         * @return {{_deletedOn: number}} Server time of deletion.
         */
        function del(collection, id) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }
            targetCollection.delete(id);

            return { _deletedOn: Date.now() };
        }

        /**
         * Search in collection by query object
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {Object} query Query object. Format {prop: value}.
         * @return {Object[]} Array of matching entries.
         */
        function query(collection, query) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            const result = [];
            // Iterate entries of target collection and compare each property with the given query
            for (let [key, entry] of [...targetCollection.entries()]) {
                let match = true;
                for (let prop in entry) {
                    if (query.hasOwnProperty(prop)) {
                        const targetValue = query[prop];
                        // Perform lowercase search, if value is string
                        if (typeof targetValue === 'string' && typeof entry[prop] === 'string') {
                            if (targetValue.toLocaleLowerCase() !== entry[prop].toLocaleLowerCase()) {
                                match = false;
                                break;
                            }
                        } else if (targetValue != entry[prop]) {
                            match = false;
                            break;
                        }
                    }
                }

                if (match) {
                    result.push(Object.assign(deepCopy(entry), { _id: key }));
                }
            }

            return result;
        }

        return { get, add, set, merge, delete: del, query };
    }


    function assignSystemProps(target, entry, ...rest) {
        const whitelist = [
            '_id',
            '_createdOn',
            '_updatedOn',
            '_ownerId'
        ];
        for (let prop of whitelist) {
            if (entry.hasOwnProperty(prop)) {
                target[prop] = deepCopy(entry[prop]);
            }
        }
        if (rest.length > 0) {
            Object.assign(target, ...rest);
        }

        return target;
    }


    function assignClean(target, entry, ...rest) {
        const blacklist = [
            '_id',
            '_createdOn',
            '_updatedOn',
            '_ownerId'
        ];
        for (let key in entry) {
            if (blacklist.includes(key) == false) {
                target[key] = deepCopy(entry[key]);
            }
        }
        if (rest.length > 0) {
            Object.assign(target, ...rest);
        }

        return target;
    }

    function deepCopy(value) {
        if (Array.isArray(value)) {
            return value.map(deepCopy);
        } else if (typeof value == 'object') {
            return [...Object.entries(value)].reduce((p, [k, v]) => Object.assign(p, { [k]: deepCopy(v) }), {});
        } else {
            return value;
        }
    }

    var storage = initPlugin;

    const { ConflictError: ConflictError$1, CredentialError: CredentialError$1, RequestError: RequestError$2 } = errors;

    function initPlugin$1(settings) {
        const identity = settings.identity;

        return function decorateContext(context, request) {
            context.auth = {
                register,
                login,
                logout
            };

            const userToken = request.headers['x-authorization'];
            if (userToken !== undefined) {
                let user;
                const session = findSessionByToken(userToken);
                if (session !== undefined) {
                    const userData = context.protectedStorage.get('users', session.userId);
                    if (userData !== undefined) {
                        console.log('Authorized as ' + userData[identity]);
                        user = userData;
                    }
                }
                if (user !== undefined) {
                    context.user = user;
                } else {
                    throw new CredentialError$1('Invalid access token');
                }
            }

            function register(body) {
                if (body.hasOwnProperty(identity) === false ||
                    body.hasOwnProperty('password') === false ||
                    body[identity].length == 0 ||
                    body.password.length == 0) {
                    throw new RequestError$2('Missing fields');
                } else if (context.protectedStorage.query('users', { [identity]: body[identity] }).length !== 0) {
                    throw new ConflictError$1(`A user with the same ${identity} already exists`);
                } else {
                    const newUser = Object.assign({}, body, {
                        [identity]: body[identity],
                        hashedPassword: hash(body.password)
                    });
                    const result = context.protectedStorage.add('users', newUser);
                    delete result.hashedPassword;

                    const session = saveSession(result._id);
                    result.accessToken = session.accessToken;

                    return result;
                }
            }

            function login(body) {
                const targetUser = context.protectedStorage.query('users', { [identity]: body[identity] });
                if (targetUser.length == 1) {
                    if (hash(body.password) === targetUser[0].hashedPassword) {
                        const result = targetUser[0];
                        delete result.hashedPassword;

                        const session = saveSession(result._id);
                        result.accessToken = session.accessToken;

                        return result;
                    } else {
                        throw new CredentialError$1('Login or password don\'t match');
                    }
                } else {
                    throw new CredentialError$1('Login or password don\'t match');
                }
            }

            function logout() {
                if (context.user !== undefined) {
                    const session = findSessionByUserId(context.user._id);
                    if (session !== undefined) {
                        context.protectedStorage.delete('sessions', session._id);
                    }
                } else {
                    throw new CredentialError$1('User session does not exist');
                }
            }

            function saveSession(userId) {
                let session = context.protectedStorage.add('sessions', { userId });
                const accessToken = hash(session._id);
                session = context.protectedStorage.set('sessions', session._id, Object.assign({ accessToken }, session));
                return session;
            }

            function findSessionByToken(userToken) {
                return context.protectedStorage.query('sessions', { accessToken: userToken })[0];
            }

            function findSessionByUserId(userId) {
                return context.protectedStorage.query('sessions', { userId })[0];
            }
        };
    }


    const secret = 'This is not a production server';

    function hash(string) {
        const hash = crypto__default['default'].createHmac('sha256', secret);
        hash.update(string);
        return hash.digest('hex');
    }

    var auth = initPlugin$1;

    function initPlugin$2(settings) {
        const util = {
            throttle: false
        };

        return function decoreateContext(context, request) {
            context.util = util;
        };
    }

    var util$2 = initPlugin$2;

    /*
     * This plugin requires auth and storage plugins
     */

    const { RequestError: RequestError$3, ConflictError: ConflictError$2, CredentialError: CredentialError$2, AuthorizationError: AuthorizationError$2 } = errors;

    function initPlugin$3(settings) {
        const actions = {
            'GET': '.read',
            'POST': '.create',
            'PUT': '.update',
            'PATCH': '.update',
            'DELETE': '.delete'
        };
        const rules = Object.assign({
            '*': {
                '.create': ['User'],
                '.update': ['Owner'],
                '.delete': ['Owner']
            }
        }, settings.rules);

        return function decorateContext(context, request) {
            // special rules (evaluated at run-time)
            const get = (collectionName, id) => {
                return context.storage.get(collectionName, id);
            };
            const isOwner = (user, object) => {
                return user._id == object._ownerId;
            };
            context.rules = {
                get,
                isOwner
            };
            const isAdmin = request.headers.hasOwnProperty('x-admin');

            context.canAccess = canAccess;

            function canAccess(data, newData) {
                const user = context.user;
                const action = actions[request.method];
                let { rule, propRules } = getRule(action, context.params.collection, data);

                if (Array.isArray(rule)) {
                    rule = checkRoles(rule, data);
                } else if (typeof rule == 'string') {
                    rule = !!(eval(rule));
                }
                if (!rule && !isAdmin) {
                    throw new CredentialError$2();
                }
                propRules.map(r => applyPropRule(action, r, user, data, newData));
            }

            function applyPropRule(action, [prop, rule], user, data, newData) {
                // NOTE: user needs to be in scope for eval to work on certain rules
                if (typeof rule == 'string') {
                    rule = !!eval(rule);
                }

                if (rule == false) {
                    if (action == '.create' || action == '.update') {
                        delete newData[prop];
                    } else if (action == '.read') {
                        delete data[prop];
                    }
                }
            }

            function checkRoles(roles, data, newData) {
                if (roles.includes('Guest')) {
                    return true;
                } else if (!context.user && !isAdmin) {
                    throw new AuthorizationError$2();
                } else if (roles.includes('User')) {
                    return true;
                } else if (context.user && roles.includes('Owner')) {
                    return context.user._id == data._ownerId;
                } else {
                    return false;
                }
            }
        };



        function getRule(action, collection, data = {}) {
            let currentRule = ruleOrDefault(true, rules['*'][action]);
            let propRules = [];

            // Top-level rules for the collection
            const collectionRules = rules[collection];
            if (collectionRules !== undefined) {
                // Top-level rule for the specific action for the collection
                currentRule = ruleOrDefault(currentRule, collectionRules[action]);

                // Prop rules
                const allPropRules = collectionRules['*'];
                if (allPropRules !== undefined) {
                    propRules = ruleOrDefault(propRules, getPropRule(allPropRules, action));
                }

                // Rules by record id 
                const recordRules = collectionRules[data._id];
                if (recordRules !== undefined) {
                    currentRule = ruleOrDefault(currentRule, recordRules[action]);
                    propRules = ruleOrDefault(propRules, getPropRule(recordRules, action));
                }
            }

            return {
                rule: currentRule,
                propRules
            };
        }

        function ruleOrDefault(current, rule) {
            return (rule === undefined || rule.length === 0) ? current : rule;
        }

        function getPropRule(record, action) {
            const props = Object
                .entries(record)
                .filter(([k]) => k[0] != '.')
                .filter(([k, v]) => v.hasOwnProperty(action))
                .map(([k, v]) => [k, v[action]]);

            return props;
        }
    }

    var rules = initPlugin$3;

    var identity = "email";
    var protectedData = {
        users: {
            "35c62d76-8152-4626-8712-eeb96381bea8": {
                email: "peter@abv.bg",
                username: "Peter",
                hashedPassword: "83313014ed3e2391aa1332615d2f053cf5c1bfe05ca1cbcb5582443822df6eb1"
            },
            "847ec027-f659-4086-8032-5173e2f9c93a": {
                email: "george@abv.bg",
                username: "George",
                hashedPassword: "83313014ed3e2391aa1332615d2f053cf5c1bfe05ca1cbcb5582443822df6eb1"
            },
            "60f0cf0b-34b0-4abd-9769-8c42f830dffc": {
                email: "admin@abv.bg",
                username: "Admin",
                hashedPassword: "fac7060c3e17e6f151f247eacb2cd5ae80b8c36aedb8764e18a41bbdc16aa302"
            }
        },
        sessions: {
        }
    };
    var seedData = {
        personalList: {
            "dc7b12d4-a68e-4390-8da7-56e6c00e3a33": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "dc7b12d4-a68e-4390-8da7-56e6c00e3a33",
                name: "French Toast",
                servings: "6",
                category: "dinner",
                dietary: "gluten-free",
                ingredients: [
                    [],
                    {
                        "amount": "150",
                        "unit": "g",
                        "ingredient": "Sugar"
                    },
                    {
                        "amount": "5",
                        "unit": "",
                        "ingredient": "Eggs"
                    },
                    {
                        "amount": "200",
                        "unit": "g",
                        "ingredient": "Butter"
                    },
                    {
                        "amount": "10",
                        "unit": "units",
                        "ingredient": "Bread"
                    }

                ],
                imageUrl: "https://img.freepik.com/free-photo/colorful-design-with-spiral-design_188544-9588.jpg",
                method: "Stir The eggs, Melt the butter, Melt The sugar, Add everything together.",
                notes: "Make sure its tasty",
                _createdOn: 1613551388703
            },
            "dc7b12d4-a68e-4390-8da7-56e6c00e3a33": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "dc7b12d4-a68e-4390-8da7-56e6c00e3a33",
                name: "French Toast",
                servings: "6",
                category: "dinner",
                dietary: "gluten-free",
                ingredients: [
                    [],
                    {
                        "amount": "150",
                        "unit": "g",
                        "ingredient": "Sugar"
                    },
                    {
                        "amount": "5",
                        "unit": "",
                        "ingredient": "Eggs"
                    },
                    {
                        "amount": "200",
                        "unit": "g",
                        "ingredient": "Butter"
                    },
                    {
                        "amount": "10",
                        "unit": "units",
                        "ingredient": "Bread"
                    }

                ],
                imageUrl: "https://img.freepik.com/free-photo/colorful-design-with-spiral-design_188544-9588.jpg",
                method: "Stir The eggs, Melt the butter, Melt The sugar, Add everything together.",
                notes: "Make sure its tasty",
                _createdOn: 1613551388703
            },
            "dc7b12d4-a68e-4390-8da7-56e6c00e3a33": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "dc7b12d4-a68e-4390-8da7-56e6c00e3a33",
                name: "French Toast",
                servings: "6",
                category: "dinner",
                dietary: "gluten-free",
                ingredients: [
                    [],
                    {
                        "amount": "150",
                        "unit": "g",
                        "ingredient": "Sugar"
                    },
                    {
                        "amount": "5",
                        "unit": "",
                        "ingredient": "Eggs"
                    },
                    {
                        "amount": "200",
                        "unit": "g",
                        "ingredient": "Butter"
                    },
                    {
                        "amount": "10",
                        "unit": "units",
                        "ingredient": "Bread"
                    }

                ],
                imageUrl: "https://img.freepik.com/free-photo/colorful-design-with-spiral-design_188544-9588.jpg",
                method: "Stir The eggs, Melt the butter, Melt The sugar, Add everything together.",
                notes: "Make sure its tasty",
                _createdOn: 1613551388703
            },
        },
        recipes: {

            "dc7b12d4-a68e-4390-8da7-56e6c00e3a33": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "dc7b12d4-a68e-4390-8da7-56e6c00e3a33",
                name: "French Toast",
                servings: "6",
                category: "dinner",
                dietary: "gluten-free",
                ingredients: [
                    [],
                    {
                        "amount": "150",
                        "unit": "g",
                        "ingredient": "Sugar"
                    },
                    {
                        "amount": "5",
                        "unit": "",
                        "ingredient": "Eggs"
                    },
                    {
                        "amount": "200",
                        "unit": "g",
                        "ingredient": "Butter"
                    },
                    {
                        "amount": "10",
                        "unit": "units",
                        "ingredient": "Bread"
                    }

                ],
                imageUrl: "https://img.freepik.com/free-photo/colorful-design-with-spiral-design_188544-9588.jpg",
                method: "Stir The eggs, Melt the butter, Melt The sugar, Add everything together.",
                notes: "Make sure its tasty",
                _createdOn: 1613551388703
            }, "dc7b12d4-a68e-4390-8da7-56e6c00e3a45": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "dc7b12d4-a68e-4390-8da7-56e6c00e3a45",
                name: "French Toast",
                servings: "6",
                category: "dinner",
                dietary: "gluten-free",
                ingredients: [
                    [],
                    {
                        "amount": "150",
                        "unit": "g",
                        "ingredient": "Sugar"
                    },
                    {
                        "amount": "5",
                        "unit": "",
                        "ingredient": "Eggs"
                    },
                    {
                        "amount": "200",
                        "unit": "g",
                        "ingredient": "Butter"
                    }
                ],
                imageUrl: "https://img.freepik.com/free-photo/colorful-design-with-spiral-design_188544-9588.jpg",
                method: "Stir The eggs, Melt the butter, Melt The sugar, Add everything together.",
                notes: "Make sure its tasty",
                _createdOn: 1613551388703
            },

            "0f20eabc-e0ae-4534-b545-e2d8094e9c8f": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "0f20eabc-e0ae-4534-b545-e2d8094e9c8f",
                name: "Scrambled Eggs",
                servings: "1",
                category: "breakfast",
                dietary: "vegetarian",
                ingredients: [
                    {
                        amount: "3",
                        unit: "tsp",
                        ingredient: "Eggs"
                    },
                    {
                        amount: "3",
                        unit: "g",
                        ingredient: "Oregano"
                    },
                    {
                        amount: "1",
                        unit: "tsp",
                        ingredient: "Salt"
                    },
                    {
                        amount: "25",
                        unit: "ml",
                        ingredient: "Olive Oil"
                    },
                ],
                imageUrl: "data:image/jpeg;base64,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",
                method: "Warm up the olive oil in a frying pan. Meanwhile, break the eggs in a small bowl. Stir until the yolk and the egg white (albumen) are mixed well.  Add the oregano and the salt to the eggs and stir again. Pour the well mixed raw eggs over the frying pan and stir with a wooden spoon until the mixture becomes solid and a bit creamy.",
                notes: "Eat while warm.",
                _createdOn: 1722815084761,

            },
            "dc7b12d4-a68e-4390-8da7-56e6c00e3a44": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "dc7b12d4-a68e-4390-8da7-56e6c00e3a44",
                name: "French Toast",
                servings: "6",
                category: "dinner",
                dietary: "gluten-free",
                ingredients: [
                    [],
                    {
                        "amount": "150",
                        "unit": "g",
                        "ingredient": "Sugar"
                    },
                    {
                        "amount": "5",
                        "unit": "",
                        "ingredient": "Eggs"
                    },
                    {
                        "amount": "200",
                        "unit": "g",
                        "ingredient": "Butter"
                    }
                ],
                imageUrl: "https://img.freepik.com/free-photo/colorful-design-with-spiral-design_188544-9588.jpg",
                method: "Stir The eggs, Melt the butter, Melt The sugar, Add everything together.",
                notes: "Make sure its tasty",
                _createdOn: 1613551388703
            },

        },

        records: {
            i01: {
                name: "John1",
                val: 1,
                _createdOn: 1613551388703
            },
            i02: {
                name: "John2",
                val: 1,
                _createdOn: 1613551388713
            },
            i03: {
                name: "John3",
                val: 2,
                _createdOn: 1613551388723
            },
            i04: {
                name: "John4",
                val: 2,
                _createdOn: 1613551388733
            },
            i05: {
                name: "John5",
                val: 2,
                _createdOn: 1613551388743
            },
            i06: {
                name: "John6",
                val: 3,
                _createdOn: 1613551388753
            },
            i07: {
                name: "John7",
                val: 3,
                _createdOn: 1613551388763
            },
            i08: {
                name: "John8",
                val: 2,
                _createdOn: 1613551388773
            },
            i09: {
                name: "John9",
                val: 3,
                _createdOn: 1613551388783
            },
            i10: {
                name: "John10",
                val: 1,
                _createdOn: 1613551388793
            }
        },
        catches: {
            "07f260f4-466c-4607-9a33-f7273b24f1b4": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                angler: "Paulo Admorim",
                weight: 636,
                species: "Atlantic Blue Marlin",
                location: "Vitoria, Brazil",
                bait: "trolled pink",
                captureTime: 80,
                _createdOn: 1614760714812,
                _id: "07f260f4-466c-4607-9a33-f7273b24f1b4"
            },
            "bdabf5e9-23be-40a1-9f14-9117b6702a9d": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                angler: "John Does",
                weight: 554,
                species: "Atlantic Blue Marlin",
                location: "Buenos Aires, Argentina",
                bait: "trolled pink",
                captureTime: 120,
                _createdOn: 1614760782277,
                _id: "bdabf5e9-23be-40a1-9f14-9117b6702a9d"
            }
        },
        furniture: {
        },
        orders: {
        },
        movies: {
            "1240549d-f0e0-497e-ab99-eb8f703713d7": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                title: "Black Widow",
                description: "Natasha Romanoff aka Black Widow confronts the darker parts of her ledger when a dangerous conspiracy with ties to her past arises. Comes on the screens 2020.",
                img: "https://miro.medium.com/max/735/1*akkAa2CcbKqHsvqVusF3-w.jpeg",
                _createdOn: 1614935055353,
                _id: "1240549d-f0e0-497e-ab99-eb8f703713d7"
            },
            "143e5265-333e-4150-80e4-16b61de31aa0": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                title: "Wonder Woman 1984",
                description: "Diana must contend with a work colleague and businessman, whose desire for extreme wealth sends the world down a path of destruction, after an ancient artifact that grants wishes goes missing.",
                img: "https://pbs.twimg.com/media/ETINgKwWAAAyA4r.jpg",
                _createdOn: 1614935181470,
                _id: "143e5265-333e-4150-80e4-16b61de31aa0"
            },
            "a9bae6d8-793e-46c4-a9db-deb9e3484909": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                title: "Top Gun 2",
                description: "After more than thirty years of service as one of the Navy's top aviators, Pete Mitchell is where he belongs, pushing the envelope as a courageous test pilot and dodging the advancement in rank that would ground him.",
                img: "https://i.pinimg.com/originals/f2/a4/58/f2a458048757bc6914d559c9e4dc962a.jpg",
                _createdOn: 1614935268135,
                _id: "a9bae6d8-793e-46c4-a9db-deb9e3484909"
            }
        },
        likes: {
        },
        ideas: {
            "833e0e57-71dc-42c0-b387-0ce0caf5225e": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                title: "Best Pilates Workout To Do At Home",
                description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Minima possimus eveniet ullam aspernatur corporis tempore quia nesciunt nostrum mollitia consequatur. At ducimus amet aliquid magnam nulla sed totam blanditiis ullam atque facilis corrupti quidem nisi iusto saepe, consectetur culpa possimus quos? Repellendus, dicta pariatur! Delectus, placeat debitis error dignissimos nesciunt magni possimus quo nulla, fuga corporis maxime minus nihil doloremque aliquam quia recusandae harum. Molestias dolorum recusandae commodi velit cum sapiente placeat alias rerum illum repudiandae? Suscipit tempore dolore autem, neque debitis quisquam molestias officia hic nesciunt? Obcaecati optio fugit blanditiis, explicabo odio at dicta asperiores distinctio expedita dolor est aperiam earum! Molestias sequi aliquid molestiae, voluptatum doloremque saepe dignissimos quidem quas harum quo. Eum nemo voluptatem hic corrupti officiis eaque et temporibus error totam numquam sequi nostrum assumenda eius voluptatibus quia sed vel, rerum, excepturi maxime? Pariatur, provident hic? Soluta corrupti aspernatur exercitationem vitae accusantium ut ullam dolor quod!",
                img: "./images/best-pilates-youtube-workouts-2__medium_4x3.jpg",
                _createdOn: 1615033373504,
                _id: "833e0e57-71dc-42c0-b387-0ce0caf5225e"
            },
            "247efaa7-8a3e-48a7-813f-b5bfdad0f46c": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                title: "4 Eady DIY Idea To Try!",
                description: "Similique rem culpa nemo hic recusandae perspiciatis quidem, quia expedita, sapiente est itaque optio enim placeat voluptates sit, fugit dignissimos tenetur temporibus exercitationem in quis magni sunt vel. Corporis officiis ut sapiente exercitationem consectetur debitis suscipit laborum quo enim iusto, labore, quod quam libero aliquid accusantium! Voluptatum quos porro fugit soluta tempore praesentium ratione dolorum impedit sunt dolores quod labore laudantium beatae architecto perspiciatis natus cupiditate, iure quia aliquid, iusto modi esse!",
                img: "./images/brightideacropped.jpg",
                _createdOn: 1615033452480,
                _id: "247efaa7-8a3e-48a7-813f-b5bfdad0f46c"
            },
            "b8608c22-dd57-4b24-948e-b358f536b958": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                title: "Dinner Recipe",
                description: "Consectetur labore et corporis nihil, officiis tempora, hic ex commodi sit aspernatur ad minima? Voluptas nesciunt, blanditiis ex nulla incidunt facere tempora laborum ut aliquid beatae obcaecati quidem reprehenderit consequatur quis iure natus quia totam vel. Amet explicabo quidem repellat unde tempore et totam minima mollitia, adipisci vel autem, enim voluptatem quasi exercitationem dolor cum repudiandae dolores nostrum sit ullam atque dicta, tempora iusto eaque! Rerum debitis voluptate impedit corrupti quibusdam consequatur minima, earum asperiores soluta. A provident reiciendis voluptates et numquam totam eveniet! Dolorum corporis libero dicta laborum illum accusamus ullam?",
                img: "./images/dinner.jpg",
                _createdOn: 1615033491967,
                _id: "b8608c22-dd57-4b24-948e-b358f536b958"
            }
        },
        catalog: {
            "53d4dbf5-7f41-47ba-b485-43eccb91cb95": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                make: "Table",
                model: "Swedish",
                year: 2015,
                description: "Medium table",
                price: 235,
                img: "./images/table.png",
                material: "Hardwood",
                _createdOn: 1615545143015,
                _id: "53d4dbf5-7f41-47ba-b485-43eccb91cb95"
            },
            "f5929b5c-bca4-4026-8e6e-c09e73908f77": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                make: "Sofa",
                model: "ES-549-M",
                year: 2018,
                description: "Three-person sofa, blue",
                price: 1200,
                img: "./images/sofa.jpg",
                material: "Frame - steel, plastic; Upholstery - fabric",
                _createdOn: 1615545572296,
                _id: "f5929b5c-bca4-4026-8e6e-c09e73908f77"
            },
            "c7f51805-242b-45ed-ae3e-80b68605141b": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                make: "Chair",
                model: "Bright Dining Collection",
                year: 2017,
                description: "Dining chair",
                price: 180,
                img: "./images/chair.jpg",
                material: "Wood laminate; leather",
                _createdOn: 1615546332126,
                _id: "c7f51805-242b-45ed-ae3e-80b68605141b"
            }
        },
        teams: {
            "34a1cab1-81f1-47e5-aec3-ab6c9810efe1": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                name: "Storm Troopers",
                logoUrl: "/assets/atat.png",
                description: "These ARE the droids we're looking for",
                _createdOn: 1615737591748,
                _id: "34a1cab1-81f1-47e5-aec3-ab6c9810efe1"
            },
            "dc888b1a-400f-47f3-9619-07607966feb8": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                name: "Team Rocket",
                logoUrl: "/assets/rocket.png",
                description: "Gotta catch 'em all!",
                _createdOn: 1615737655083,
                _id: "dc888b1a-400f-47f3-9619-07607966feb8"
            },
            "733fa9a1-26b6-490d-b299-21f120b2f53a": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                name: "Minions",
                logoUrl: "/assets/hydrant.png",
                description: "Friendly neighbourhood jelly beans, helping evil-doers succeed.",
                _createdOn: 1615737688036,
                _id: "733fa9a1-26b6-490d-b299-21f120b2f53a"
            }
        },
        members: {
            "cc9b0a0f-655d-45d7-9857-0a61c6bb2c4d": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                teamId: "34a1cab1-81f1-47e5-aec3-ab6c9810efe1",
                status: "member",
                _createdOn: 1616236790262,
                _updatedOn: 1616236792930
            },
            "61a19986-3b86-4347-8ca4-8c074ed87591": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                teamId: "dc888b1a-400f-47f3-9619-07607966feb8",
                status: "member",
                _createdOn: 1616237188183,
                _updatedOn: 1616237189016
            },
            "8a03aa56-7a82-4a6b-9821-91349fbc552f": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                teamId: "733fa9a1-26b6-490d-b299-21f120b2f53a",
                status: "member",
                _createdOn: 1616237193355,
                _updatedOn: 1616237195145
            },
            "9be3ac7d-2c6e-4d74-b187-04105ab7e3d6": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                teamId: "dc888b1a-400f-47f3-9619-07607966feb8",
                status: "member",
                _createdOn: 1616237231299,
                _updatedOn: 1616237235713
            },
            "280b4a1a-d0f3-4639-aa54-6d9158365152": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                teamId: "dc888b1a-400f-47f3-9619-07607966feb8",
                status: "member",
                _createdOn: 1616237257265,
                _updatedOn: 1616237278248
            },
            "e797fa57-bf0a-4749-8028-72dba715e5f8": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                teamId: "34a1cab1-81f1-47e5-aec3-ab6c9810efe1",
                status: "member",
                _createdOn: 1616237272948,
                _updatedOn: 1616237293676
            }
        }
    };
    var rules$1 = {
        users: {
            ".create": false,
            ".read": [
                "Owner"
            ],
            ".update": false,
            ".delete": false
        },
        members: {
            ".update": "isOwner(user, get('teams', data.teamId))",
            ".delete": "isOwner(user, get('teams', data.teamId)) || isOwner(user, data)",
            "*": {
                teamId: {
                    ".update": "newData.teamId = data.teamId"
                },
                status: {
                    ".create": "newData.status = 'pending'"
                }
            }
        }
    };
    var settings = {
        identity: identity,
        protectedData: protectedData,
        seedData: seedData,
        rules: rules$1
    };

    const plugins = [
        storage(settings),
        auth(settings),
        util$2(),
        rules(settings)
    ];

    const server = http__default['default'].createServer(requestHandler(plugins, services));

    const port = 3030;
    server.listen(port);
    console.log(`Server started on port ${port}. You can make requests to http://localhost:${port}/`);
    console.log(`Admin panel located at http://localhost:${port}/admin`);

    var softuniPracticeServer = {

    };

    return softuniPracticeServer;

})));
