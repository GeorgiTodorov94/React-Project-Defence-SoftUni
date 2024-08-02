import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import '../../static/CSS/homepage.css';
import Monkey from '../../static/graphics/Monkey.wav'
import React from 'react'
import { useNavigate } from 'react-router-dom';
import logo from '../../static/graphics/MonkeyChefLogo.png'
import addRecipe from '../../static/graphics/AddRecipe.png'
import RecipeBook from '../../static/graphics/RecipeBook.png'
import WeeklyPlanner from '../../static/graphics/WeeklyPlanner.png'
import ShoppingList from '../../static/graphics/ShoppingList.png'

export default function HomePage() {
    const { isAuthenticated } = useContext(AuthContext);
    const monkey = new Audio(Monkey);


    const navigate = useNavigate();

    const handleClick = (url) => {
        navigate(url);
        monkey.play()
    }


    return (
        <>
            <div className="homepage-banner">
                <img className="banner-image" src={logo} />
                <div className="banner-message">
                    Welcome to Your Meal Planner Application
                </div>
            </div>

            <div className="link-container">
                <div className="home-button-group" onClick={() => handleClick("/create")}>
                    <img className="home-button-image" src={addRecipe} />
                    <p className="home-button-title" >Add <br />Recipe</p>
                </div>

                <div className="home-button-group" onClick={() => handleClick("/recipes")}>
                    <img className="home-button-image" src={RecipeBook} />
                    <p className="home-button-title" >Recipe <br />Book</p>
                </div>
        {/* to fix the CSS here. */}
                {isAuthenticated && (
                    <div className='link-container'>
                        <div className="home-button-group" onClick={() => handleClick("/planner")}>
                            <img className="home-button-image" src={WeeklyPlanner} />
                            <p className="home-button-title" >Weekly <br />Planner</p>
                        </div>

                        <div className="home-button-group" onClick={() => handleClick("/shoppingList")}>
                            <img className="home-button-image" src={ShoppingList} />
                            <p className="home-button-title" >Shopping <br />List</p>
                        </div>
                    </div>
                )}
            </div>

        </>
    )
}