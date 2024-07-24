import '../../static/CSS/navigation.css'
import { Link } from 'react-router-dom'
export default function Header() {
    return (
        <header>
            <h1><Link className="home" to="#"></Link>Meal Planning Application</h1>
            <nav>
                <Link to="/recipes">All Recipes</Link>
                <Link to="/">Home</Link>

                <div id="user">
                    <Link to="/create">Create Recipe</Link>
                    <Link to="#">Logout</Link>
                </div>

                <div id="guest">
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </div>
            </nav>
        </header>
    )
}