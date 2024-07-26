import Header from "../navigation/Navigation"
import { useParams } from "react-router-dom";
import { useGetOneRecipes } from "../../hooks/useRecipes";


export default function RecipeDetails() {
    const { recipeId } = useParams();
    const [recipe, setRecipe] = useGetOneRecipes(recipeId)


    return (
        <>
            <section id="recipe-details">
                <h1>Recipe Details</h1>
                <div className="info-section">

                    <div className="recipe-header">
                        <img className="recipe-img" src={recipe.imageUrl} />
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
                                <p>Content: The best recipe.</p>
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