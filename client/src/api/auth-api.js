import { useAuthContext } from "../contexts/AuthContext";
import requester from "./requester";
import bcryptjs from 'bcryptjs';

const BASE_URL = 'http://localhost:3030/users';

export const login = async (email, password,) => requester.post(`${BASE_URL}/login`, { email, password });



// const isMatch = await bcryptjs.compare(password, user.password);
// console.log(isMatch)

// if (!isMatch) {
//     return new Error('Passwords do not match!')
// }


export const register = async (email, password) => {

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt)

    const newUser = {
        email: email,
        password: hashedPassword,
    };

    console.log(newUser);

    return requester.post(`${BASE_URL}/register`,
        newUser);

};

export const logout = () => {
    return requester.get(`${BASE_URL}/logout`);
};

