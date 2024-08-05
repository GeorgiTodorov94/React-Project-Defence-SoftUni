import requester from "./requester";
import bcryptjs from 'bcryptjs';

const BASE_URL = 'http://localhost:3030/users';

export const login = (email, password, rePassword) =>
    requester.post(`${BASE_URL}/login`,
        { email, password, rePassword });



export const register = (email, username, password, rePassword) => {

    const salt = bcryptjs.genSalt();

    const newUser = {
        email,
        username,
        password,
        rePassword,
    };
    console.log('...............................................');
    console.log(newUser);

    return requester.post(`${BASE_URL}/register`,
        newUser);

};

export const logout = () => {
    return requester.get(`${BASE_URL}/logout`);
};

