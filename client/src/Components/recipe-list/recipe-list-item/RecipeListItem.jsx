import React, { useEffect } from "react";
import recipesAPI from "../../../api/recipes-Api";
import useGetAllRecipes from "../../../hooks/useRecipes";
import { useNavigate } from "react-router-dom";
import swal from 'sweetalert';


export default function RecipeListItem({
    recipes,
    recipe
}) {
    const navigate = useNavigate()


    let listOfRecipes = recipes?.map(recipe => {

        const recipeId = recipe._id;


        return (
            <>
                <div className="recipe-button-group" key={recipe._id}>
                    <img onClick={() => navigate(`/recipes/${recipe._id}/details`)} className="button-image" src={recipe.imageUrl} width="100px" />
                    <p className="recipe-button-text" >{recipe.name}</p>
                    <img className="recipe-button-image" onClick={() => {
                        swal({
                            title: "Recipe added to meal planner!",
                            icon: "success",
                            timer: 1500,
                            buttons: false,
                            className: "swal"
                        });
                        recipesAPI.addToPersonalList(recipe)
                    }} src="https://icons.iconarchive.com/icons/martz90/circle-addon1/48/text-plus-icon.png" width="25px" />

                </div>
            </>
        )
    });



    return (
        <>
            <div className="recipe-book-link-container">
                {listOfRecipes}
            </div>
        </>
    );
};



