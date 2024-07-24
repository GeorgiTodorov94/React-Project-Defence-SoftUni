import './App.css'
import HomePage from './Components/home/Home'
import CreateRecipe from './Components/create-recipe/CreateRecipe'
import { Routes, Route } from 'react-router-dom'
import Header from './Components/header/Header'
import Login from './Components/login/LoginPage'
import RegisterPage from './Components/register/RegisterPage'
import RecipeDetails from './Components/recipe-details/RecipeDetails'
import RecipeEdit from './Components/recipe-edit/RecipeEdit'
import RecipeList from './Components/recipe-list/RecipeList'

function App() {

    return (
        <>
            <div className='layout'>
                <main className='layout-container'>
                    <Routes>
                        <Route path='/' element={<HomePage />} />
                        <Route path='/login' element={<Login />} />
                        <Route path='/register' element={<RegisterPage />} />
                        <Route path='/create' element={<CreateRecipe />} />
                        <Route path='/recipes' element={<RecipeList />} />
                    </Routes>


                </main>

            </div>
        </>
    )
}

export default App
