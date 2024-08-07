import { useContext } from "react"
import { login, register, logout } from "../api/auth-api"
import { AuthContext } from "../contexts/AuthContext"
import bcryptjs from 'bcryptjs';


export const useLogin = () => {
    const { changeAuthState } = useContext(AuthContext);


    const loginHandler = async (email, password) => {

        const { password: _, ...authData } = await login(email, password);
        changeAuthState(authData);
        return authData;

    };

    return loginHandler;
};

export const useRegister = () => {
    const { changeAuthState } = useContext(AuthContext);

    const registerHandler = async (email, username, password, rePassword) => {

        if (password !== rePassword) {
            return setError('Password mismatch!');
        };

        const salt = bcryptjs.genSaltSync(15);
        const hashedPassword = bcryptjs.hashSync(password, salt);

        const newUser = {
            email: email,
            username: username,
            password: hashedPassword,
            rePassword: hashedPassword,
        };

        if (!newUser.email || !newUser.password || !newUser.username || !newUser.rePassword) {
            return res.status(400).json({ message: 'Wrong wrong wrong!' });
        };
        const { password: _, ...authData } = await register(newUser.email, newUser.username, newUser.password, newUser.rePassword);
        console.log(newUser);
        console.log(authData);
        changeAuthState(Object.assign(authData, newUser));
        console.log(authData);

        return authData;
    }

    return registerHandler;

}

export const useLogout = () => {
    const { logout: localLogout } = useContext(AuthContext);

    const logoutHandler = async () => {
        localLogout();
        await logout()
    }

    return logoutHandler;

}