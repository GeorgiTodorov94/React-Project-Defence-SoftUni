import { useEffect, useState, useRef } from "react"
import { Link, useNavigate } from "react-router-dom";
import '../../static/CSS/registerPage.css';
import { useRegister } from "../../hooks/useAuth";
import { useForm } from "../../hooks/useForm";



const initialValues = { email: '', username: '', password: '', rePassword: '' };
export default function RegisterPage() {
    const [error, setError] = useState('');
    const register = useRegister();
    const navigate = useNavigate();

    const registerHandler = async ({ email, username, password, rePassword }) => {


        try {
            
            await register(email, username, password, rePassword);
            alert('You have successfully Registered')
            navigate('/');
        } catch (error) {
            setError(error.message);
        };
    };


    const { values,
        changeHandler,
        submitHandler
    } = useForm(initialValues, registerHandler);


    // const baseURL = ('http://localhost:3030')
    // const [user, setUser] = useState({});

    // const [values, setValues] = useState({
    //     _id: null,
    //     username: '',
    //     password: '',
    //     rePassword: '',
    //     email: '',
    // });



    const onChange = (e) => {
        // setValues(oldValues => ({ ...oldValues, [e.target.name]: e.target.value }));

    };

    const onRegisterClick = (e) => {
        // e.preventDefault()
        // const user = { ...values };
        // setUser(user);
        // console.log(user)
        // axios.post(`${baseURL}/jsonstore/users`, user);
    }

    return (

        <>
            <div className="container">
                <div className="center">
                    <h1>Register</h1>
                    <form onSubmit={submitHandler}>

                        <div className="form-register">
                            <div className="email">
                                <label htmlFor="email"></label>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    id="email"
                                    placeholder="Email"
                                    value={values.email}
                                    onChange={changeHandler}
                                />
                            </div>

                            <div className="form-register">
                                <label htmlFor="username"></label>
                                <input
                                    required
                                    type="username"
                                    name="username"
                                    id="username"
                                    placeholder="Username"
                                    value={values.username}
                                    onChange={changeHandler}
                                />
                            </div>

                            <div className="form-register">
                                <label htmlFor="password"></label>
                                <input
                                    required
                                    type="password"
                                    name="password"
                                    id="password"
                                    placeholder="Password"
                                    value={values.password}
                                    onChange={changeHandler}
                                />
                            </div>


                            <div className="form-register">
                                <label htmlFor="rePassword"></label>
                                <input
                                    required
                                    type="password"
                                    name="rePassword"
                                    id="rePassword"
                                    placeholder="Re-Password"
                                    value={values.rePassword}
                                    onChange={changeHandler}
                                />
                            </div>

                            {/* <div className="forgot-password">
                        <Link to={'/'} className="forgot-password-register-form">Forgot Password?</Link>
                    </div> */}
                            {error && (
                                <p>
                                    <span> {error}</span>
                                </p>
                            )}


                            <div className="signUp_link">
                                <Link to={'/login'} >Already have an account?</Link>
                            </div>

                            <div className="signUp_link">
                                <Link to={'/'} >Go to Home Page</Link>
                            </div>

                            <div className="signUp_link">
                                <button type="submit" >Register</button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </>
    )
}