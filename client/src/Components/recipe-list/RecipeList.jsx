import { useAuthContext } from '../../contexts/AuthContext';
import useGetAllRecipes from '../../hooks/useRecipes';
import '../../static/CSS/recipeList.css';
import logo from '../../static/graphics/MonkeyChefLogo.png';
import sadMonkey from '../../static/graphics/SadMonkey.png';
import RecipeListItem from "./recipe-list-item/RecipeListItem";
import { nanoid } from 'nanoid'
import { useState, useEffect } from 'react';

export default function RecipeList() {
    const [recipes, setRecipes] = useGetAllRecipes();
    const { isAuthenticated } = useAuthContext()
    const RecipesApi = [
        {
            name: "recipes",
            url: "http://localhost:3030/data/recipes"
        }
    ];

    const [displayedRecipesList, setDisplayedRecipesList] = useState([]);
    const [permanentRecipesList, setPermanentRecipesList] = useState([]);

    const [searchTerm, setSearchTerm] = useState([]);
    const [noResults, setNoResults] = useState(false);


    const handleSearch = (e) => setSearchTerm(e.target.value);



    useEffect(() => {
        loadRecipes(RecipesApi[0].url);
    }, []);

    const loadRecipes = (url) => {
        fetch(url)
            .then(result => result.json())
            .then(recipesJson => {
                setDisplayedRecipesList(recipesJson);
                setPermanentRecipesList(recipesJson);
            });
    };
    // console.log(displayedRecipesList.slice())

    const reloadRecipes = () => {
        setDisplayedRecipesList(permanentRecipesList);
        setNoResults(false);
        setSearchTerm("");
    };

    const recipeByTitle = displayedRecipesList.slice();
    // console.log(recipeByTitle)

    recipeByTitle.sort(function (a, b) {
        let x = a?.name?.toLowerCase();
        let y = b?.name?.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });

    const recipeByDefault = displayedRecipesList?.slice(0);
    recipeByDefault.sort(function (a, b) {
        let x = a._id;
        let y = b._id;
        return x < y ? -1 : x > y ? 1 : 0;
    });

    const sortName = function () {
        setDisplayedRecipesList(recipeByTitle);
        // console.log(recipeByTitle)
    };

    const sortDefault = function () {
        setDisplayedRecipesList(recipeByDefault?.reverse());
    };

    let foundItems = [];

    const search = function () {

        foundItems = [];
        displayedRecipesList?.map(recipe => {
            if (recipe?.name?.toLowerCase().includes(searchTerm?.toLowerCase()) === true) {
                // console.log(searchTerm)
                foundItems.push(recipe)
                // console.log(foundItems)
                // console.log(displayedRecipesList)
            };

            setDisplayedRecipesList(foundItems);
            document.getElementById('searchTerm').value = "";
        });
    };

    // console.log(displayedRecipesList);

    const filterByCategory = function (filterBy) {
        foundItems = [];

        permanentRecipesList?.map(recipe => {
            if (recipe.category.toLowerCase() === filterBy) {
                foundItems.push(recipe);
            }
        })
        // console.log("FoundItems", foundItems);
        setDisplayedRecipesList(foundItems);
    };

    const filterByDiet = function (filterBy) {
        foundItems = [];
        permanentRecipesList?.map(recipe => {
            if (recipe?.dietary?.toLowerCase() === filterBy) {
                foundItems.push(recipe)
            }
        })
        setDisplayedRecipesList(foundItems)
    };
    const filterByBreakfast = function () {
        filterByCategory("breakfast");
    };


    const filterByLunch = function () {
        filterByCategory("lunch");
    };


    const filterByDinner = function () {
        filterByCategory("dinner");
    };


    const filterBySweet = function () {
        filterByCategory("sweet");
    };


    const filterByVegan = function () {
        filterByDiet("vegan");
    };


    const filterByVegetarian = function () {
        filterByDiet("vegetarian");
    };


    const filterByGlutenFree = function () {
        filterByDiet("gluten-free");
    };

    return (
        <>
            <div>
                <h1 className="recipebook-title">Your Recipes</h1>
                <div className="recipebook-search-container">
                    <input className="recipe-search-bar" onChange={handleSearch} value={searchTerm} type="searchTerm" id="searchTerm" />
                    <button id="search-button" onClick={search}>Search</button>
                    <button onClick={reloadRecipes}>Reset</button>
                </div>
                <div className="recipebook-filters-container">
                    <button onClick={sortName}>A - Z</button>
                    <button onClick={sortDefault}>Newest</button>
                    <img className="recipebook-monkey" src={logo} width="50px" />
                    <button onClick={filterByBreakfast}>Breakfast</button>
                    <button onClick={filterByLunch}>Lunch</button>
                    <button onClick={filterByDinner}>Dinner</button>
                    <button onClick={filterBySweet}>Sweet</button>
                    <img className="recipebook-monkey" src={logo} width="50px" />
                    <button onClick={filterByVegetarian}>Vegetarian</button>
                    <button onClick={filterByVegan}>Vegan</button>
                    <button onClick={filterByGlutenFree}>Gluten-Free</button>
                </div>


            </div>
            {isAuthenticated && (
                <div className="recipes-wrapper">
                    {displayedRecipesList.length > 0
                        ? <RecipeListItem key={nanoid()} recipes={displayedRecipesList} />
                        : (<div className="no-results">
                            <img className="no-results-image" src={sadMonkey} />
                            <h1>No results</h1>Your search didn't find <br />any recipes
                        </div>)
                    }
                </div>
            )}

            {!isAuthenticated && (
                <div className="recipes-wrapper">
                    <div className="no-results">
                        <img className="no-results-image" src={sadMonkey} />
                        <h1>No results</h1>You need to login. <br />
                    </div>

                </div>
            )}

        </>
    );

}

