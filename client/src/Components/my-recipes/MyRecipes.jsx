import useGetAllRecipes from '../../hooks/useRecipes'
import { useAuthContext } from "../../contexts/AuthContext";
import RecipeListItem from "../recipe-list/recipe-list-item/RecipeListItem";
import { useEffect, useState } from 'react';
import '../../static/CSS/my-recipes.css'

export default function MyRecipes() {
    const [recipes, setRecipes] = useGetAllRecipes();
    const { userId } = useAuthContext();
    const [ownedRecipes, setOwnedRecipes] = useState([]);

    useEffect(() => {
        const ownedRecipesArray = recipes.filter(obj => obj._ownerId === userId);
        setOwnedRecipes(ownedRecipesArray)
        console.log(ownedRecipesArray)

    }, [recipes])

    return (
        <div>
            <div className="planner-overall-container">
                <div className="search">
                    <div className="searchInput">
                        <input
                            type="text"
                            value=""
                            placeholder="Enter a recipe to search ..." /><button id="clear-button" >X</button>
                    </div>

                    <div className="data-result">
                        {/* recipes Search List */}
                    </div>
                </div>

                <div className="planner-overall">
                    <h1 className="planner-pagetitle">Planner</h1>
                    <div className="planner-link-container">
                        {ownedRecipes.length > 0
                            ? ownedRecipes.map(recipe => <RecipeListItem key={recipe._id} {...recipe} />)
                            : <h3 className="no-articles">No Recipes yet</h3>
                        }
                    </div>
                </div>

            </div>
        </div>
    )
};
