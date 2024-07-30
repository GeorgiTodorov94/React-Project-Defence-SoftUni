import { Routes, Route } from 'react-router-dom'

import { AuthContextProvider } from './contexts/AuthContext'

import './App.css'

import HomePage from './Components/home/Home'
import CreateRecipe from './Components/create-recipe/CreateRecipe'
import Navigation from './Components/navigation/Navigation'
import Login from './Components/login/LoginPage'
import RegisterPage from './Components/register/RegisterPage'
import RecipeDetails from './Components/recipe-details/RecipeDetails'
import RecipeEdit from './Components/recipe-edit/RecipeEdit'
import RecipeList from './Components/recipe-list/RecipeList'
import Logout from './Components/logout/Logout'

function App() {


    return (
        <AuthContextProvider >
            <div className='layout'>
                <Navigation />
                <main className='layout-container'>
                    <Routes>
                        <Route path='/' element={<HomePage />} />
                        <Route path='/login' element={<Login />} />
                        <Route path='/register' element={<RegisterPage />} />
                        <Route path='/create' element={<CreateRecipe />} />
                        <Route path='/recipes' element={<RecipeList />} />
                        <Route path='/recipes/:recipeId/details' element={<RecipeDetails />} />
                        <Route path='/logout' element={<Logout />} />
                    </Routes>
                </main>
            </div>
        </AuthContextProvider>
    )
}

export default App
