import { Link } from "react-router-dom"
import '../../static/CSS/recipeList.css'
import Header from '../header/Header'
import { useEffect, useState } from "react"
import * as request from "../../api/requester"
import * as recipesAPI from "../../api/recipes-Api"

export default function RecipeList() {
    const [recipes, setRecipes] = useState([])

    useEffect(() => {

        recipesAPI.fetchAllRecipes()
            .then(result => setRecipes(result))

    }, [])




    // useEffect(() => {
    //     (async () => {
    //         const recipeResult = await request.get('http://localhost:3030/jsonstore/recipes')

    //         console.log(recipeResult);
    //     })();
    // }, []);
    return (
        <>
            <Header />
            <section className="recipe-book-link-container">
                <h1 className="recipebook-title">All Recipes</h1>
                <div className="recipe-book-link-container">
                    <div className="recipe-button-group">
                        <img className="recipe-button-image" src="./images/avatar-1.jpg" />
                        <h6>Action</h6>
                        <h2>Cover Fire</h2>
                        <Link to="#" className="details-button">Details</Link>
                    </div>

                </div>
                <div className="recipe-book-link-container">
                    <div className="recipe-button-group">
                        <img className="recipe-button-image" src="./images/avatar-1.jpg" />
                        <h6>Action</h6>
                        <h2>Zombie lang</h2>
                        <Link to="#" className="details-button">Details</Link>
                    </div>

                </div>
                <div className="recipe-book-link-container">
                    <div className="recipe-button-group">
                        <img className="recipe-button-image" src="./images/avatar-1.jpg" />
                        <h6>Action</h6>
                        <h2>MineCraft</h2>
                        <Link to="#" className="details-button">Details</Link>
                    </div>
                </div>

                {/* <h3 className="no-articles">No articles yet</h3> */}
            </section>

        </>)
}