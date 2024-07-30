import requester from "./requester";

const BASE_URL = 'http://localhost:3030/users';

export const login = (email, password, rePassword) =>
    requester.post(`${BASE_URL}/login`,
        { email, password, rePassword })



export const register = (email, username, password, rePassword) =>
    requester.post(`${BASE_URL}/register`,
        { email, username, password, rePassword });



export const logout = () => {
    requester.get(`${BASE_URL}/logout`)
}

