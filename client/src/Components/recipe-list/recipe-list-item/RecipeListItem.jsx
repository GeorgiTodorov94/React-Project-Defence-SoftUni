import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import swal from 'sweetalert';
import { useAuthContext } from "../../../contexts/AuthContext";
import MealPlannerService from "../../../api/myRecipesService";

export default function RecipeListItem({
    recipes,
}) {
    const navigate = useNavigate();
    const { userId } = useAuthContext();

    let listOfRecipes = recipes?.map(recipe => {

        const recipeId = recipe._id;
        const currentRecipe = recipe;
        console.log(currentRecipe);

        const createAndNavigate = async () => {

            await MealPlannerService.create(currentRecipe, userId);
            navigate(`/myrecipes/${userId}`)
        }

        return (
            <>
                <div className="recipe-button-group" key={recipe._id}>
                    <img onClick={() => navigate(`/recipes/${recipe._id}/details`)} className="button-image" src={recipe.imageUrl} width="100px" />
                    <p className="recipe-button-text" >{recipe.name}</p>
                    <img className="recipe-button-image" onClick={() => {
                        {
                            return swal({
                                title: "Recipe added to meal planner!",
                                icon: "success",
                                timer: 1500,
                                buttons: false,
                                className: "swal",
                                create: createAndNavigate()
                            });
                        }

                    }} src="https://icons.iconarchive.com/icons/martz90/circle-addon1/48/text-plus-icon.png" width="25px" />

                </div>
            </>
        )
    });



    return (
        <>
            {listOfRecipes.map(recipe => {
                return <div className="recipe-book-link-container" key={recipe._id}>
                    {recipe}
                </div>
            })}

        </>
    );
};



