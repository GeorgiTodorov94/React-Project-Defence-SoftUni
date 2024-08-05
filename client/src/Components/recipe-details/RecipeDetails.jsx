import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetOneRecipes } from "../../hooks/useRecipes";
import { useAuthContext } from "../../contexts/AuthContext";

import '../../static/CSS/recipe.css';
import recipesAPI from "../../api/recipes-Api";


export default function RecipeDetails() {
    const navigate = useNavigate();
    const { recipeId } = useParams();
    const [recipe, setRecipe] = useGetOneRecipes(recipeId);
    const { userId } = useAuthContext();
    const isOwner = userId === recipe._ownerId;

    const recipeDeleteHandler = async () => {
        try {
            await recipesAPI.remove(recipeId)
            navigate('/recipes')

        } catch (error) {
            console.log(error.message)
        }
    }


    return (
        <div className="recipe">
            <h1><img className="arrow"
                onClick={() => { navigate(-1) }}
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Back_Arrow.svg/768px-Back_Arrow.svg.png" width="35px"
            /> {recipe.name}</h1>

            <div className="core-recipe-details">
                <img className="recipe-avatar" src={recipe.imageUrl} />
            </div>
            <div className="ingredients">
                Ingredients: {/** To do the CSS here. */}
                {
                    recipe.ingredients.map((item, index) => (
                        <p className="ingredient-text" key={index}>
                            {Object.entries(item).map(([key, value]) => {
                                return (
                                    <span> <strong> {`${value}`}</strong></span>
                                );
                            })}
                        </p>
                    ))
                }
            </div>
            <div width="70%">
                <p className="info-p"><b>Method: </b> {recipe.method}</p>
                <p className="info-p"><b>Notes: </b>{recipe.notes}</p>
                <p className="info-p"><b>Category: </b>{recipe.category} </p>
                <p className="info-p"><b>Dietary: </b>{recipe.dietary} </p>
                <p className="info-p"><b>Recommended Servings: </b>{recipe.servings} </p>
            </div>

            {isOwner && (
                <div className="buttons">
                    <Link to={`/recipes`} onClick={recipeDeleteHandler} className="button">Delete Recipe</Link>
                    <Link to={`/recipes/${recipeId}/edit`} className="button">Update Recipe</Link>
                </div>
            )}
            <div className="buttons">
                <Link className="button">Add Recipe to Meal Plan</Link>
            </div>

            {/*  create mealAddedToPlanner functionality */}
        </div>
    )
}