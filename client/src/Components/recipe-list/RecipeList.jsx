import '../../static/CSS/recipeList.css'

import logo from '../../static/graphics/MonkeyChefLogo.png'
import RecipeListItem from "./recipe-list-item/RecipeListItem"

import useGetAllRecipes from '../../hooks/useRecipes'

import { useState, useEffect } from 'react'


export default function RecipeList() {
    const [recipes, setRecipes] = useGetAllRecipes()
    return (
        <>
            <div>
                <h1 className="recipebook-title">Your Recipes</h1>
                <div className="recipebook-search-container">
                    <input className="recipe-search-bar" type="searchTerm" id="searchTerm" />
                    <button id="search-button" >Search</button>
                    <button >Reset</button>
                </div>
                <div className="recipebook-filters-container">
                    <button >A - Z</button>
                    <button >Newest</button>
                    <img className="recipebook-monkey" src={logo} />
                    <button >Breakfast</button>
                    <button >Lunch</button>
                    <button >Dinner</button>
                    <button >Sweet</button>
                    <img className="recipebook-monkey" src={logo} />
                    <button >Vegetarian</button>
                    <button >Vegan</button>
                    <button >Gluten-Free</button>
                </div>


            </div>
            <div className="recipes-wrapper">
                {recipes.length > 0
                    ? recipes.map(recipe => <RecipeListItem key={recipe._id} {...recipe} />)
                    : <h3 className="no-articles">No Recipes yet</h3>
                }
            </div>
        </>
    );

}

