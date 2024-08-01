import { useNavigate, useParams } from "react-router-dom";
import { useGetOneRecipes } from "../../hooks/useRecipes";
import '../../static/CSS/recipe.css'


export default function RecipeDetails() {
    const navigate = useNavigate()
    const { recipeId } = useParams();
    const [recipe, setRecipe] = useGetOneRecipes(recipeId)
    console.log(recipe.ingredients)
    console.log(recipe);




    // TO DO ----->>>> to Fix Full display of ingredients

    // const fullIngredients = recipe.ingredients.map(ingredient => {
    //     counter += 1;

    //     return (
    //         <div key={counter}>
    //             <p><b> {ingredient?.unit}</b> {ingredient.ingredient}</p>
    //         </div>
    //     );
    // });


    return (
        <div className="recipe">
            <h1><img
                onClick={() => { navigate(-1) }}
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Back_Arrow.svg/768px-Back_Arrow.svg.png" width="35px"
            /> {recipe?.name}</h1>

            <div className="core-recipe-details">
                <img className="recipe-avatar" src={recipe?.imageUrl} />
            </div>
            <div className="ingredients">
                Ingredients: {/** To do the CSS here. */}
                {
                    recipe?.ingredients?.map((item, index) => (
                        <p className="ingredient-text" key={index}>
                            {Object.entries(item).map(([key, value]) => (
                                <span> {`${key}: ${value} `}</span>
                            ))}
                        </p>
                    ))
                }
            </div>
            <div width="70%">
                <p><b>Method: </b> {recipe?.method}</p>
                <p><b>Notes: </b>{recipe?.notes}</p>
                <p><b>Category: </b>{recipe?.category} </p>
                <p><b>Dietary: </b>{recipe?.dietary} </p>
                <p><b>Recommended Servings: </b>{recipe?.servings} </p>
            </div>
            <button >Delete Recipe</button>
            <button >Add Recipe to Meal Plan</button>
            <button >Update Recipe</button>

            {/*  create mealAddedToPlanner functionality */}
        </div>
    )
}