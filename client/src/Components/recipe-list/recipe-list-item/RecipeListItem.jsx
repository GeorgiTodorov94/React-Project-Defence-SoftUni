import React, { useEffect } from "react";
import recipesAPI from "../../../api/recipes-Api";
import useGetAllRecipes, { useGetOneRecipes } from "../../../hooks/useRecipes";
import { useNavigate, useParams } from "react-router-dom";
import swal from 'sweetalert';
import { useAuthContext } from "../../../contexts/AuthContext";
import { useState } from "react";


export default function RecipeListItem({
    recipes,
    recipe
}) {
    // const navigate = useNavigate();
    // const { recipeId } = useParams()
    // const { userId } = useAuthContext();
    // const [user, setUser] = useState({})
    // const getUser = async () => {
    //     const currentUser = await requester.get(`http://localhost:3030/users/me/${userId}`);
    //     setUser(currentUser);
    // }





    let listOfRecipes = recipes?.map(recipe => {

        const recipeId = recipe._id;


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
                                className: "swal"
                            });
                        }
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



