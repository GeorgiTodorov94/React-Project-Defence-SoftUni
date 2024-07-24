import { useEffect, useState } from "react"
import Header from "../header/Header"
import { recipesAPI } from "../../api/recipes-Api"
import { useParams } from "react-router-dom";
import * as request from '../../api/requester'


export default function RecipeDetails() {
    const [recipe, setRecipe] = useState({});
    const { recipeId } = useParams();


    useEffect(() => {
        (async () => {
            const response = await recipesAPI.getOne(recipeId)

            setRecipe(response)
        })()
    }, [])

    return (
        <>
            <Header />
            <section id="game-details">
                <h1>Recipe Details</h1>
                <div className="info-section">

                    <div className="game-header">
                        <img className="game-img" src={recipe.imageUrl} />
                        <h1>{recipe.name}</h1>
                        <span className="levels">{recipe.category}</span>
                        <p className="type">{recipe.servings}</p>
                    </div>

                    <p className="text">
                        {recipe.method}
                    </p>

                    <div className="details-comments">
                        <h2>Comments:</h2>
                        <ul>
                            <li className="comment">
                                <p>Content: I rate this one quite highly.</p>
                            </li>
                            <li className="comment">
                                <p>Content: The best game.</p>
                            </li>
                        </ul>
                        <p className="no-comment">No comments.</p>
                    </div>

                    <div className="buttons">
                        <a href="#" className="button">Edit</a>
                        <a href="#" className="button">Delete</a>
                    </div>
                </div>

                <article className="create-comment">
                    <label>Add new comment:</label>
                    <form className="form">
                        <textarea name="comment" placeholder="Comment......"></textarea>
                        <input className="btn submit" type="submit" value="Add Comment" />
                    </form>
                </article>

            </section>

        </>
    )
}