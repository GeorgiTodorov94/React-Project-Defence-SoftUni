import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MealPlannerService from "../../../api/myRecipesService";
import { useAuthContext } from "../../../contexts/AuthContext";

export default function MyRecipeItem({ }) {
    const navigate = useNavigate();
    const { userId } = useAuthContext()
    const [recipesInPlannerList, setRecipesInPlannerList] = useState([]);
    const { recipeId } = useParams();
    const [recipe, setRecipe] = useState({})

    const getUserRecipes = async () => {

        const result = await MealPlannerService.getAll(userId);

        return setRecipesInPlannerList(result);
    };

    // console.log(recipesInPlannerList)
    const currentRecipe = recipesInPlannerList.find(recipe => recipe._id === recipeId);
    console.log(currentRecipe);


    useEffect(() => {
        getUserRecipes()
    }, []);


    const recipeDeleteHandler = async () => {
        return await MealPlannerService.delete(recipeId);
    }

    return (
        <div className="recipe">
            <h1><img className="arrow"
                onClick={() => { navigate(-1) }}
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Back_Arrow.svg/768px-Back_Arrow.svg.png" width="35px"
            /> {currentRecipe?.name}</h1>

            <div className="core-recipe-details">
                <img className="recipe-avatar" src={currentRecipe?.imageUrl} />
            </div>
            <div className="ingredients">
                Ingredients: {/** To do the CSS here. */}

                {
                    currentRecipe?.ingredients?.map((item, index) => (
                        <p className="ingredient-text" key={currentRecipe._id}>
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
                <p className="info-p"><b>Method: </b> {currentRecipe?.method}</p>
                <p className="info-p"><b>Notes: </b>{currentRecipe?.notes}</p>
                <p className="info-p"><b>Category: </b>{currentRecipe?.category} </p>
                <p className="info-p"><b>Dietary: </b>{currentRecipe?.dietary} </p>
                <p className="info-p"><b>Recommended Servings: </b>{currentRecipe?.servings} </p>
            </div>

            <div className="buttons">
                <Link to={`/recipes`} onClick={recipeDeleteHandler} className="button">Delete Recipe</Link>
                <Link to={`/recipes/${currentRecipe?._id}/edit`} className="button">Update Recipe</Link>
            </div>
            
        </div>
    )
}


