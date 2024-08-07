import { Navigate, useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext"

export default function RoutGuard({ children }) {

    const { isAuthenticated } = useAuthContext();
    if (!isAuthenticated) {
        return <Navigate to='/register' />
    }
    return (
        <>
            {children}
        </>
    )
}