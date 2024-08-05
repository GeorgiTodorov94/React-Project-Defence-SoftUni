import { useNavigate } from "react-router-dom";
import recipesAPI from "../../../api/recipes-Api";


export default function MyRecipeItem({ recipe }) {
    const navigate = useNavigate()
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
}