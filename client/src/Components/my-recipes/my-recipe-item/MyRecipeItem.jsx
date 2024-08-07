import { useNavigate } from "react-router-dom";
import recipesAPI from "../../../api/recipes-Api";
import swal from "sweetalert";
// import sadMonkey from '../../../static/graphics/SadMonkey.png';

export default function MyRecipeItem({ recipes }) {
    const navigate = useNavigate()
    // console.log(recipes)

    let listOfRecipes = recipes?.map(recipe => {

        const recipeId = recipe._id;


        return (
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
                }} src="https://icons.iconarchive.com/icons/martz90/circle-addon1/48/text-plus-icon.png" width="25px" />
            </div>
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


