import '../../static/CSS/navigation.css'
export default function Header() {
    return (
        <header>
            <h1><a className="home" href="#"></a>Recipes</h1>
            <nav>
                <a href="#">All Recipes</a>

                <div id="user">
                    <a href="#">Create Recipe</a>
                    <a href="#">Logout</a>
                </div>

                <div id="guest">
                    <a href="#">Login</a>
                    <a href="#">Register</a>
                </div>
            </nav>
        </header>
    )
}