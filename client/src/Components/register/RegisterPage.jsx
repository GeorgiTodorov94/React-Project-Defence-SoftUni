import { useEffect, useState, useRef } from "react"
import axios from 'axios'
import { Link } from "react-router-dom";
import '../../static/CSS/registerPage.css'



export default function RegisterPage() {
    const baseURL = ('http://localhost:3030')
    const [user, setUser] = useState({});

    const [values, setValues] = useState({
        _id: null,
        username: '',
        password: '',
        rePassword: '',
        email: '',
    });



    const onChange = (e) => {
        setValues(oldValues => ({ ...oldValues, [e.target.name]: e.target.value }));

    };

    const onRegisterClick = (e) => {
        e.preventDefault()
        const user = { ...values };
        setUser(user);
        console.log(user)
        axios.post(`${baseURL}/jsonstore/users`, user);
    }

    return (

        <>
            <div className="container">
                <div className="center">
                    <h1>Register</h1>
                    <form action='POST' onSubmit={onRegisterClick}>

                        <div className="form-register">
                            <div className="email">
                                <label htmlFor="email"></label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    placeholder="Email"
                                    value={values.email}
                                    onChange={onChange}
                                />
                            </div>

                            <div className="form-register">
                                <label htmlFor="username"></label>
                                <input
                                    type="text"
                                    name="username"
                                    id="username"
                                    placeholder="Username"
                                    value={values.username}
                                    onChange={onChange}
                                />
                            </div>

                            <div className="form-register">
                                <label htmlFor="password"></label>
                                <input
                                    type="text"
                                    name="password"
                                    id="password"
                                    placeholder="Password"
                                    value={values.password}
                                    onChange={onChange}
                                />
                            </div>


                            <div className="form-register">
                                <label htmlFor="rePassword"></label>
                                <input
                                    type="text"
                                    name="rePassword"
                                    id="rePassword"
                                    placeholder="Re-Password"
                                    value={values.rePassword}
                                    onChange={onChange}
                                />
                            </div>

                            {/* <div className="forgot-password">
                        <Link to={'/'} className="forgot-password-register-form">Forgot Password?</Link>
                    </div> */}

                            <div className="signUp_link">
                                <Link to={'/login'} >Already have an account?</Link>
                            </div>

                            <div className="signUp_link">
                                <Link to={'/'} >Go to Home Page</Link>
                            </div>

                            <div className="signUp_link">
                                <button type="submit" onClick={onRegisterClick}>Register</button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </>
    )
}