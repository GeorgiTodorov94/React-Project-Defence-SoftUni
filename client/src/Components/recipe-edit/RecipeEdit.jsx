import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from '../../hooks/useForm'
import '../../static/CSS/recipeEdit.css'
import { useGetOneRecipes } from '../../hooks/useRecipes';
import { useEffect } from 'react';
import recipesAPI from '../../api/recipes-Api';



const initialValues = {
    name: '',
    servings: '',
    category: '',
    dietary: '',
    imageUrl: '',
    method: '',
    notes: '',
}

export default function RecipeEdit() {
    const { recipeId } = useParams();
    const [recipe, setRecipe] = useGetOneRecipes(recipeId);
    const navigate = useNavigate()


    const {
        changeHandler,
        submitHandler,
        values
    } = useForm((Object.assign(initialValues, recipe)), async (values) => {
        await recipesAPI.update(recipeId, values)
        navigate(`/recipes/${recipeId}/details`)
    });


    return (
        <>
            <div className='layout'>

                <div className='layout-container'>

                    <h1 className="add-recipe-title">Recipe Form</h1>

                    <div className="add-recipe-form-container">

                        <form className="recipe-form" method="post" id="recipe-form" onSubmit={submitHandler} >
                            <label htmlFor="name">Name:</label>
                            <input
                                className="input-add-recipe"
                                type="name"
                                id="name"
                                name='name'
                                value={values.name}
                                onChange={changeHandler}
                                required
                            />
                            <label htmlFor="servings">Servings:</label>
                            <input
                                className="input-add-recipe"
                                type="number"
                                id="servings"
                                name='servings'
                                value={values.servings}
                                onChange={changeHandler}
                            />
                            <label htmlFor="category">Category:</label>
                            <div>
                                <select
                                    className="select-option-recipe"
                                    type="text"
                                    id="category"
                                    name="category"
                                    value={values.category}
                                    onChange={changeHandler}
                                >
                                    <option value={undefined}></option>
                                    <option value="breakfast">breakfast</option>
                                    <option value="dinner">dinner</option>
                                    <option value="lunch">lunch</option>
                                    <option value="snack">snack</option>
                                    <option value="sweet">sweet</option>
                                </select>
                            </div>
                            <label htmlFor="dietary">Dietary:</label>
                            <div>
                                <select
                                    className="select-option-recipe"
                                    type="text"
                                    id="dietary"
                                    name="dietary"
                                    value={values.dietary}
                                    onChange={changeHandler}
                                >
                                    <option value={undefined}></option>
                                    <option value="dairy-free">dairy-free</option>
                                    <option value="gluten-free">gluten-free</option>
                                    <option value="protein">protein</option>
                                    <option value="vegan">vegan</option>
                                    <option value="vegetarian">vegetarian</option>
                                </select>
                            </div>
                            <label htmlFor="image">Image URL:</label>
                            <input
                                className="input-add-recipe-imageUrl"
                                type="text"
                                value={values.imageUrl}
                                onChange={changeHandler}
                                id="image"
                                name='imageUrl'
                            />
                            <label htmlFor="method">Write Method and Recipe Here</label>
                            <textarea
                                type="text"
                                cols="30"
                                rows="10"
                                id="method"
                                name="method"
                                value={values.method}
                                onChange={changeHandler}
                            />
                            <label htmlFor="notes">Notes:</label>
                            <textarea
                                type="text"
                                cols="30"
                                rows="10"
                                id="notes"
                                name="notes"
                                onChange={changeHandler}
                                value={values.notes}
                            />
                            <div className="save" colSpan="2"></div>
                            <div className="add-recipe-save">
                                <input
                                    type="submit"
                                    value="Edit"
                                    id="save"
                                />
                            </div>
                        </form>
                    </div >
                </div >
            </div >
        </>

    )
}
