import { useEffect, useState, useRef } from "react"
import '../../static/CSS/login.css'
import { Link } from "react-router-dom";

export default function Login() {

    const [user, setUser] = useState({});

    const [values, setValues] = useState({
        _id: '',
        username: '',
        password: '',
        rePassword: '',
        email: '',
    });


    const onChange = (e) => {
        setValues(oldValues => ({ ...oldValues, [e.target.name]: e.target.value }));
    }

    const onLoginClick = (e) => {
        e.preventDefault()
        const user = { ...values };
        setUser(user)
        console.log(user);
    }

    return (
        <>
            <div className="container">
                <div className="center">
                    <h1>Login</h1>
                    <form action="POST" >

                        <div className="form-login-password">
                            <div className="form-login-password">
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

                            <div className="form-login-password">
                                <label htmlFor=""></label>
                                <input
                                    type="text"
                                    name="password"
                                    id="password"
                                    placeholder="Password"
                                    value={values.password}
                                    onChange={onChange}
                                />
                            </div>

                            <div className="form-login-password">
                                <label htmlFor="rePassword"></label>
                                <input
                                    type="text"
                                    name="rePassword"
                                    placeholder="Repeat Password"
                                    id="rePassword"
                                    value={values.rePassword}
                                    onChange={onChange}
                                />
                            </div>


                            <input name="submit" type="submit" value="Login" onClick={onLoginClick} />

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