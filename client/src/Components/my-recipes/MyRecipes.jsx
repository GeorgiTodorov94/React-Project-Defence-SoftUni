import { useEffect, useMemo, useState } from 'react';
import '../../static/CSS/my-recipes.css'
import MealPlannerService from '../../api/myRecipesService';
import { nanoid } from 'nanoid'
import swal from "sweetalert";
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import MyRecipeItem from './my-recipe-item/MyRecipeItem';
import sadMonkey from '../../static/graphics/SadMonkey.png'

export default function MyRecipes() {
    const navigate = useNavigate()
    const BASE_URL = 'http://localhost:3030/data/recipes';
    const [recipesInPlannerList, setRecipesInPlannerList] = useState([]);
    const [recipeBookList, setRecipeBookList] = useState([]);
    const [plannerDBList, setPlannerDBList] = useState([]);
    const [filteredRecipeBookList, setFilteredRecipeBookList] = useState([]);
    const [wordEntered, setWordEntered] = useState("");
    const { userId } = useAuthContext();
    const { recipeId } = useParams();
    console.log(userId)
    const getUserRecipes = async () => {
        const recipes = await MealPlannerService.getAll(userId);
        setRecipesInPlannerList(recipes);
        loadAllRecipes(BASE_URL);
    }

    useEffect(() => {
        getUserRecipes()
    }, []);

    const loadAllRecipesInPlanner = (url, allRecipes) => {
        fetch(url)
            .then(result => result.json())
            .then(response => {
                const allRecipesInPlanner = allRecipes
                    .filter(r => response.some((p) => p.recipeId === r._id));
                // console.log(allRecipesInPlanner)
                setPlannerDBList(response);
                // console.log(response)
                setRecipeBookList(allRecipes);
                // console.log(allRecipes)
                setFilteredRecipeBookList(allRecipes);
            });
    };
    const loadAllRecipes = url => {
        fetch(url)
            .then(result => result.json())
            .then((allRecipes) => {
                loadAllRecipesInPlanner(`http://localhost:3030/data/recipes`, allRecipes);
            });
    };

    const recipesSearchList = filteredRecipeBookList?.map(recipe => {
        const currentUser = userId;
        const currentRecipe = recipe;
        const handleAdding = async () => {
            await MealPlannerService.create(currentRecipe, currentUser);
            // console.log(currentRecipe)
            // console.log(currentRecipe._id)
        }
        // currentRecipe => setRecipesInPlannerList([...recipesInPlannerList, currentRecipe])
        return (
            <div className="planner-recipe-group" key={recipe._id}>
                <div className="planner-recipe">
                    <img className="image" src={recipe.imageUrl} />
                    <p>{recipe.name}</p>
                    <img className="planner-button-add" onClick={() => handleAdding()}
                        src="https://icons.iconarchive.com/icons/martz90/circle-addon1/48/text-plus-icon.png" width="25px" />
                </div>
            </div>
        )
    });


    const handleFilter = (event) => {
        const searchWord = event.target.value;
        setWordEntered(searchWord);
        if (searchWord === "") {
            setFilteredRecipeBookList(recipeBookList);
        } else {
            setFilteredRecipeBookList(recipeBookList.filter((value) => {
                return value.name.toLowerCase().includes(searchWord.toLowerCase());
            }));
        };
    };

    const clearInput = () => {
        setWordEntered("");
        setFilteredRecipeBookList(recipeBookList);
    };
    // console.log(recipesInPlannerList)
    const displayRecipesInPlannerList = useMemo(() => recipesInPlannerList?.map(recipe => {
        const recipeId = recipe._id

        return (
            <div className="button-group" key={nanoid()}>
                <img onClick={() => navigate(`/recipes/${recipeId}/details`)} className="button-image" src={recipe.imageUrl} width="100px" />
                <p className="button-text">{recipe.name}</p>
                <img className="planner-button-delete"
                    onClick={() => {
                        swal({
                            title: "Are you sure?",
                            icon: "warning",
                            dangerMode: true,
                            buttons: ['No!', 'Yes..'],
                            className: "swal-sure"
                        })
                            .then((willDelete) => {
                                if (willDelete) {

                                    MealPlannerService.delete(recipeId, userId)
                                        .then(() => {
                                            let array = [...recipesInPlannerList];
                                            let index = array.indexOf(recipe);
                                            if (index !== -1) {
                                                array.splice(index, 1);
                                                setRecipesInPlannerList(array);
                                            };
                                        });

                                    swal("Recipe deleted!", {
                                        icon: "error",
                                        timer: 1500,
                                        buttons: false,
                                        className: "swal-delete"
                                    });
                                }
                            });;
                    }}
                    src="https://findicons.com/files/icons/1262/amora/256/delete.png" width="25px" />
            </div>
        )
    }), [recipesInPlannerList]);
    // console.log(displayRecipesInPlannerList)

    return (
        <div>
            <div className="planner-overall-container">
                <div className="search">
                    <div className="searchInput">
                        <input onChange={handleFilter}
                            type="text"
                            value={wordEntered}
                            placeholder="Enter a recipe to search ..." /><button id="clear-button" onClick={clearInput}>X</button>
                    </div>

                    <div className="data-result">
                        {recipesSearchList}
                    </div>
                </div>

                <div className="planner-overall">
                    <h1 className="planner-pagetitle">Planner</h1>
                    <div className="planner-link-container">
                        {displayRecipesInPlannerList.length > 0
                            ? displayRecipesInPlannerList
                            : <div className="no-results">
                                <img src={sadMonkey} width='150px' />
                                <h1>No results</h1>You have no recipes.<br />
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
};

//
// {displayRecipesInPlannerList.length > 0
//     ? <MyRecipeItem key={nanoid()} recipes={displayRecipesInPlannerList} />
//     : (<div className="no-results">
//         <img src={sadMonkey} width='150px' />
//         <h1>No results</h1>You have no recipes.<br />
//     </div>)
// }
//



// {displayRecipesInPlannerList}
// ? ownedRecipes.map(recipe => <RecipeListItem key={recipe._id} {...recipe} />)
// : <h3 className="no-articles">No Recipes yet</h3>
