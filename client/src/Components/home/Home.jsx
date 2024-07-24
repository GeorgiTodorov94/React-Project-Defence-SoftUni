import { useEffect, useState } from 'react';
import '../../static/CSS/homepage.css';
import Monkey from '../../static/graphics/Monkey.wav'
import React from 'react'
import Header from '../header/Header';
import { recipesAPI } from '../../api/recipes-Api';

export default function HomePage() {
    const monkey = new Audio(Monkey);
    const [latest, setLatestRecipes] = useState([])

    useEffect(() => {
        (async () => {
            const result = await recipesAPI.fetchAllRecipes();
            setLatestRecipes(result.reverse().slice(0, 3));
        })()
    }, [])


    return (
        <>
            <Header />
            <div className='layout'>

                <div className='layout-container'>
                    <div className="homepage-banner">
                        <img className="banner-image" src={('./src/static/graphics/MonkeyChefLogo-Small.png')} />
                        <div className="banner-message">
                            Welcome to Meal Planner Application
                        </div>
                    </div>

                    <div className="link-container">
                        <div className="home-button-group" >
                            <img className="home-button-image" src={('./src/static/graphics/AddRecipe.png')} />
                            <p className="home-button-title" >Recipe <br />Name</p>
                            <div className="data-buttons">
                                <a href="#" className="btn details-btn">Details</a>
                            </div>
                        </div>

                        {/* <!-- Display paragraph: If there is no games  --> */}
                        {/* <p class="no-articles">No recipes yet</p> */}
                    </div>
                </div>
            </div>

        </>
    )
}