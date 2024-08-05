import '../../static/CSS/login.css'
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "../../hooks/useForm";
import { useLogin } from "../../hooks/useAuth";
import { useState } from 'react';
const initialValues = { email: '', password: '' }

export default function Login() {

    const login = useLogin();
    const navigate = useNavigate();
    const [error, setError] = useState('')
    const loginHandler = async ({ email, password }) => {

        try {
            await login(email, password)
            navigate('/')

        } catch (error) {
            setError(error.message)
        }
    }
    const { changeHandler, submitHandler, values } = useForm(initialValues, loginHandler);


    // const [user, setUser] = useState({});

    // const [values, setValues] = useState({
    //     _id: '',
    //     username: '',
    //     password: '',
    //     rePassword: '',
    //     email: '',
    // });


    // const onChange = (e) => {
    // setValues(oldValues => ({ ...oldValues, [e.target.name]: e.target.value }));
    // }

    // const onLoginClick = (e) => {
    // e.preventDefault()
    // const user = { ...values };
    // setUser(user)
    // console.log(user);
    // }

    return (
        <>
            <div className="container">
                <div className="center">
                    <h1>Login</h1>
                    <form onSubmit={submitHandler}>

                        <div className="form-login-password">
                            <div className="form-login-password">
                                <label htmlFor="email"></label>
                                <input
                                    type="text"
                                    name="email"
                                    id="email"
                                    placeholder="Email"
                                    value={values.email}
                                    onChange={changeHandler}
                                />
                            </div>


                            <div className="form-login-password">
                                <label htmlFor="password"></label>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    placeholder="Password"
                                    value={values.password}
                                    onChange={changeHandler}
                                />
                            </div>

                            <input name="submit" type="submit" value="Login" />

                            <div className="signUp_link">
                                Not a Member ? <Link to={`/register`}>Sign-Up</Link>
                            </div>

                            <div className="signUp_link">
                                <Link to={'/'} >Go to Home Page</Link>
                            </div>
                        </div>

                    </form>
                </div>
            </div>

        </>
    )
}