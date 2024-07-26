import { useContext } from "react"
import { login, register } from "../api/auth-api"
import { AuthContext } from "../contexts/AuthContext"

export const useLogin = () => {

    const { changeAuthState } = useContext(AuthContext)

    const loginHandler = async (email, password) => {

        const { password: _, ...authData } = await login(email, password)

        changeAuthState(authData)
        return authData;
    }

    return loginHandler;
};

export const useRegister = () => {
    const { changeAuthState } = useContext(AuthContext);

    const registerHandler = async (email, password, rePassword, username) => {
        const { password: _, ...authData } = await register(email, password, rePassword, username)

        changeAuthState(authData);
        return authData
    }

    return registerHandler;

}