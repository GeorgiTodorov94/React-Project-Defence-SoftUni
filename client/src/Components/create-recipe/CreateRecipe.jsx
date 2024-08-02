import '../../static/CSS/createRecipe.css'
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from '../../hooks/useForm'
import { useRecipeCreate } from '../../hooks/useRecipes'
import { useEffect, useState } from 'react'

const initialValues = {
    name: '',
    servings: '',
    category: '',
    dietary: '',
    ingredients: [],
    imageUrl: '',
    method: '',
    notes: '',
}


export default function CreateRecipe() {
    const navigate = useNavigate()
    const createRecipe = useRecipeCreate();

    const createHandler = async (values) => {
        try {
            const { _id: recipeId, ...recipe } = await createRecipe(values)
            navigate(`/recipes/${recipeId}/details`)
        } catch (error) {
            console.log(error.message)
        }
    }

    const { changeHandler, values, submitHandler } = useForm(initialValues, createHandler);

    const [firstFormValues, setFirstFormValues] = useState([]);
    const onChange = (e) => {
        e.preventDefault();
        setFirstFormValues(firstFormValues => ({ ...firstFormValues, [e.target.name]: e.target.value }));
    }

    const [ingredients, setIngredients] = useState([]);
    const [newIngredient, setNewIngredient] = useState([])

    const onClickAddNewIngredientHandler = (e) => {
        e.preventDefault();
        setNewIngredient(firstFormValues)
        initialValues.ingredients.push(newIngredient);
        console.log(initialValues.ingredients);
    };




    return (
        <>
            

                    <h1 className="add-recipe-title">Recipe Form</h1>

                    <div className="add-recipe-form-container">


                        <form className="ingredient-form" id="ingredient-form" onSubmit={onClickAddNewIngredientHandler}>
                            <label className="ingredients" htmlFor="ingredients">Ingredients:</label>

                            <label htmlFor="amount">Amount:</label>
                            <input
                                className="input-add-recipe"
                                type="number"
                                step="any"
                                id="amount"
                                name="amount"
                                value={values.amount}
                                onChange={onChange}
                                required placeholder="Enter amount" />



                            <label htmlFor="unit">Unit:</label>
                            <select
                                className="select-option-recipe"
                                type="text"
                                id="unit"
                                name='unit'
                                value={values.unit}
                                onChange={onChange}
                            >
                                <option value={undefined}></option>
                                <option value="cup">cup</option>
                                <option value="g">g</option>
                                <option value="kg">kg</option>
                                <option value="l">l</option>
                                <option value="ml">ml</option>
                                <option value="tbsp">tbsp</option>
                                <option value="tsp">tsp</option>
                            </select>

                            <label htmlFor="ingredient">Ingredient:</label>
                            <input
                                className="input-add-recipe-ingredient"
                                type="text"
                                id="ingredient"
                                name='ingredient'
                                value={values.ingredient}
                                onChange={onChange}
                            />
                            <a className="plus">
                                <input type="submit" value="+" id="save" />
                            </a>
                            {/* TO DO: To properly display each added ingredient */}
                            {
                                initialValues.ingredients.map((item, index) => (
                                    <p className="ingredient-text" key={index}>
                                        {Object.entries(item).map(([key, value]) => (
                                            `${key}: ${value} `
                                        ))}
                                    </p>
                                ))
                            }
                        </form>


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
                                    value="Save"
                                    id="save"
                                />
                            </div>
                        </form>
                    </div >
              
        </>

    )
}
