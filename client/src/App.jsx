import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import HomePage from './Components/home/Home'
import CreateRecipe from './Components/create-recipe/CreateRecipe'
import Header from './Components/header/Header'
import Login from './Components/login/LoginPage'
import RegisterPage from './Components/register/RegisterPage'
import RecipeDetails from './Components/recipe-details/RecipeDetails'
import RecipeEdit from './Components/recipe-edit/RecipeEdit'
import RecipeList from './Components/recipe-list/RecipeList'
import { AuthContext } from './contexts/AuthContext'
import './App.css'

function App() {
    const [authState, setAuthState] = useState({});

    const changeAuthState = (state) => {
        localStorage.setItem('accessToken', state.accessToken)

        setAuthState(state)
    }

    const contextData = {
        userId: authState._id,
        email: authState.email,
        accessToken: authState.accessToken,
        isAuthenticated: !!authState.email,
        changeAuthState,
    }

    return (
        <AuthContext.Provider value={contextData}>
            <div className='layout'>
                <main className='layout-container'>
                    <Routes>
                        <Route path='/' element={<HomePage />} />
                        <Route path='/login' element={<Login />} />
                        <Route path='/register' element={<RegisterPage />} />
                        <Route path='/create' element={<CreateRecipe />} />
                        <Route path='/recipes' element={<RecipeList />} />
                        <Route path='/recipes/:recipeId/details' element={<RecipeDetails />} />
                    </Routes>
                </main>
            </div>
        </AuthContext.Provider>
    )
}

export default App
