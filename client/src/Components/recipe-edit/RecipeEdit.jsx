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
    const navigate = useNavigate();
    const customMargin = {
        marginLeft: '25em'
    }


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


            <h1 className="add-recipe-title">Recipe Edit Form</h1>

            <div className="add-recipe-form-container" style={customMargin}>

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
                            <option value="breakfast">Breakfast</option>
                            <option value="dinner">Dinner</option>
                            <option value="lunch">Lunch</option>
                            <option value="snack">Snack</option>
                            <option value="sweet">Sweet</option>
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
                            <option value="dairy-free">Dairy-free</option>
                            <option value="gluten-free">Gluten-free</option>
                            <option value="protein">Protein</option>
                            <option value="vegan">Vegan</option>
                            <option value="vegetarian">Vegetarian</option>
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
                        className='methodName'
                        type="text"
                        cols="30"
                        rows="10"
                        id="methodName"
                        name="method"
                        value={values.method}
                        onChange={changeHandler}
                    />
                    <label htmlFor="notes">Notes:</label>
                    <textarea className='notesName'
                        type="text"
                        cols="30"
                        rows="10"
                        id="notesName"
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

        </>

    )
}
