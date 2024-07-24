import { useEffect } from 'react';
import '../../static/CSS/homepage.css';
import Monkey from '../../static/graphics/Monkey.wav'
import React from 'react'
import Header from '../header/Header';


// layout {
//     display: flex;
//     width: 100vw;
//     height: 100vh;
//     overflow: hidden;
// }

// .layout-container {
//     padding: 2rem;
//     width: 100%;
//     overflow: auto;
// }
export default function HomePage() {
    const monkey = new Audio(Monkey);



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
                            <div class="data-buttons">
                                <a href="#" class="btn details-btn">Details</a>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </>
    )
}