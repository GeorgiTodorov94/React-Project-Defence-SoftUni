import useGetAllRecipes from '../../hooks/useRecipes'
import { useAuthContext } from "../../contexts/AuthContext";
import RecipeListItem from "../recipe-list/recipe-list-item/RecipeListItem";
import { useEffect, useState } from 'react';
import '../../static/CSS/my-recipes.css'
import { useNavigate } from 'react-router-dom';
import MyRecipeItem from './my-recipe-item/MyRecipeItem';

export default function MyRecipes() {
    const [recipes, setRecipes] = useGetAllRecipes();
    const { userId } = useAuthContext();
    const [ownedRecipes, setOwnedRecipes] = useState([]);
    const [searchInputValue, setSearchInputValue] = useState('');

    useEffect(() => {
        const ownedRecipesArray = recipes.filter(obj => obj._ownerId === userId);
        setOwnedRecipes(ownedRecipesArray);

        // console.log(ownedRecipesArray);
    }, [recipes, searchInputValue])

    const onChange = (e) => {
        e.preventDefault();

        setSearchInputValue(oldSearchInputValue => ({
            ...oldSearchInputValue,
            [e.target.name]: e.target.value
        }));
    };

    const onSearch = () => {
        console.log(searchInputValue);
    }


    return (
        <div>
            <div className="planner-overall-container">
                <div className="search">
                    <div className="searchInput">
                        <input
                            type="text"
                            id='searchInput'
                            name="searchInput"
                            value={searchInputValue.searchInput}
                            onChange={onChange}
                            placeholder="Enter a recipe to search ..." /><button onClick={onSearch} id="clear-button" >X</button>
                    </div>

                    <div className="data-result">
                        {/* recipes Search List */}
                    </div>
                </div>

                <div className="planner-overall">
                    <h1 className="planner-pagetitle">My Recipes</h1>
                    <div className="planner-link-container">
                        {
                            ownedRecipes.length > 0 &&
                            (
                                <div className="recipe-book-link-container">
                                    {ownedRecipes.map(recipe => <MyRecipeItem key={recipe._id} recipe={recipe} />)}
                                </div>
                            )
                        }

                    </div>
                </div>

            </div>
        </div>
    )
};



// ? ownedRecipes.map(recipe => <RecipeListItem key={recipe._id} {...recipe} />)
// : <h3 className="no-articles">No Recipes yet</h3>
