import '../../static/CSS/createRecipe.css'
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from '../../hooks/useForm'
import { useRecipeCreate } from '../../hooks/useRecipes'
import { useEffect, useState } from 'react'
import NewIngredientItem from './new-ingredient-item/NewIngredientItem'

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
    const navigate = useNavigate();
    const createRecipe = useRecipeCreate();
    const [error, setError] = useState('')

    const [ingredients, setIngredients] = useState([]);
    const [render, setRender] = useState(true);
    const [newIngredient, setNewIngredient] = useState({
        amount: '',
        unit: '',
        ingredient: ''
    });

    const createHandler = async (values) => {
        console.log(values)
        try {
            const { _id: recipeId, ...recipe } = await createRecipe(values);
            navigate(`/recipes/${recipeId}/details`);
        } catch (error) {
            setError(error.message);
        }
    }

    const { changeHandler, values, submitHandler } = useForm(initialValues, createHandler);
    const [firstFormValues, setFirstFormValues] = useState([]);
    const onChange = (e) => {
        e.preventDefault();
        setFirstFormValues(firstFormValues => ({ ...firstFormValues, [e.target.name]: e.target.value }));
    };


    const onClickAddNewIngredientHandler = (e) => {
        e.preventDefault();
        initialValues.ingredients.push(newIngredient);
        setRender(false);
    };

    useEffect(() => {
        setNewIngredient(firstFormValues);
        setIngredients(initialValues.ingredients);
        setRender(true);
        console.log(ingredients);
    }, [newIngredient, firstFormValues, ingredients]);

    return (
        <>
            <h1 className="add-recipe-title">Recipe Form</h1>

            <div className="add-recipe-form-container">

                <form className="ingredient-form" id="ingredient-form" onSubmit={(e) => onClickAddNewIngredientHandler(e)}>
                    <label className="ingredients-label" htmlFor="ingredients">Ingredients:</label>

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
                        <option value={null}></option>
                        <option value="Cup">Cups</option>
                        <option value="Grams">Grams</option>
                        <option value="Kilograms">Kilograms</option>
                        <option value="Litres">Litres</option>
                        <option value="Milliliters">Milliliters</option>
                        <option value="Table spoons">Table spoons</option>
                        <option value="Tea spoons">Tea spoons</option>
                        <option value="Pieces">Pieces</option>
                        <option value="Slices">Slices</option>
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

                    <>
                        {ingredients.map((item, index) => {
                            return <p className="ingredient-text" key={index || 0}>
                                {Object.entries(item).map(([name, value]) => {
                                    return (
                                        <NewIngredientItem item={item} name={name} value={value} />
                                    )
                                })}
                            </p>
                        })}
                    </>
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
                            <option value="Breakfast">Breakfast</option>
                            <option value="Dinner">Dinner</option>
                            <option value="Lunch">Lunch</option>
                            <option value="Snack">Snack</option>
                            <option value="Sweet">Sweet</option>
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
                            <option value="Dairy-free">Dairy-free</option>
                            <option value="Gluten-free">Gluten-free</option>
                            <option value="Protein">Protein</option>
                            <option value="Vegan">Vegan</option>
                            <option value="Vegetarian">Vegetarian</option>
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
                    <label htmlFor="method">Cooking Methodology</label>
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
                    <div>
                        <div className="add-recipe-save">
                            <input
                                type="submit"
                                value="Save"
                                id="save"
                            />
                        </div>
                        <p className='error'>
                            {error}
                        </p>
                    </div>
                </form>
            </div >
        </>
    );
};
