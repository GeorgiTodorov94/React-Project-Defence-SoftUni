import '../../static/CSS/createRecipe.css'
import { useNavigate, useParams } from "react-router-dom"
import Header from '../header/Header'
import { useForm } from '../../hooks/useForm'
import { useRecipeCreate } from '../../hooks/useRecipes'

const initialValues = {
    name: '',
    servings: '',
    category: '',
    dietary: '',
    imageUrl: '',
    method: '',
    notes: '',
}

export default function CreateRecipe() {
    const navigate = useNavigate()
    const createRecipe = useRecipeCreate();

    const createHandler = async (values) => {
        try {
            const { _id: recipeId } = await createRecipe(values)
            navigate(`/recipes/${recipeId}/details`)
        } catch (error) {
            console.log(error.message)
        }


    }

    const { changeHandler, values, submitHandler } = useForm(initialValues, createHandler)
    // const { recipeId } = useParams();
    // const [amount, setAmount] = useState('');
    // const [unit, setUnit] = useState('');
    // const [ingredient, setIngredient] = useState('');
    // const [name, setName] = useState('');
    // const [servings, setServings] = useState('');
    // const [category, setCategory] = useState('');
    // const [dietary, setDietary] = useState('');
    // const [imageUrl, setImageUrl] = useState('');
    // const [method, setMethod] = useState('');
    // const [notes, setNotes] = useState('');
    // const [recipe, setRecipe] = useState({});
    // const [ingredients, setIngredients] = useState({});
    // const [error, setError] = useState('')
    // const [id, setId] = useState('')

    // const recipeURL = `http://localhost:3030/jsonstore/recipes`;


    // const [values, setValues] = useState({
    //     _id: id,
    //     // amount,
    //     // unit,
    //     // ingredient,
    //     // ingredients,
    //     name,
    //     servings,
    //     category,
    //     dietary,
    //     imageUrl,
    //     method,
    //     notes
    // });

    const onChange = (e) => {
        //     e.preventDefault();
        //     setValues(oldValues => ({ ...values, [e.target.name]: e.target.value }))
        //     console.log(values)
        //     setRecipe(values)
    }


    const onSaveClickCreateRecipe = async (e) => {
        // e.preventDefault()
        // console.log(recipe)
        // const postRecipe = await axios.post(`http://localhost:3030/jsonstore/recipes/`, recipe)
    }



    const onClickNewIngredientAddClickHandler = (e) => {
        // e.preventDefault()

        // const newIngredient = {
        //     amount: values.amount,
        //     unit: values.unit,
        //     ingredient: values.ingredient
        // }

        // setIngredients(newIngredient);
        // recipe.ingredients = newIngredient;

        // console.log(newIngredient)
        // console.log(recipe)
        // if (recipe._id) {
        //     s
        //     recipe.ingredients = {
        //         ...recipe.ingredients,
        //         ...newIngredient,
        //     }
        //     setIngredients(null)
        // }

    };

    // const onClickUpdateRecipeById = async (e) => {

    // }

    // const allRecipes = (Object.values(data)).map(object => object);
    // console.log(allRecipes)


    // const AllIngredients = () => {
    //     Object.values(ingredients).map(ingredient => {
    //         console.log(ingredient)
    //         return (
    //             <p className="ingredient-text">{ingredient}</p>
    //         )
    //     })
    // };


    return (
        <>
            <Header />
            <div className='layout'>

                <div className='layout-container'>

                    <h1 className="add-recipe-title">Recipe Form</h1>

                    <div className="add-recipe-form-container">


                        {/* <form className="ingredient-form" onSubmit={onClickNewIngredientAddClickHandler} id="ingredient-form" >
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
                            <a className="plus" colSpan="2"><input type="submit" value="+" id="save" border="0" onClick={onClickNewIngredientAddClickHandler} /></a>
                            <AllIngredients />

                        </form> */}

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
                </div >
            </div >
        </>

    )
}
