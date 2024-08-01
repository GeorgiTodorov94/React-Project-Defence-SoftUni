import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import '../../static/CSS/navigation.css';
import { useNavigate } from 'react-router-dom';
import add from '../../static/graphics/AddRecipeIcon.png'
import book from '../../static/graphics/RecipeBookIcon.png'
import planner from '../../static/graphics/WeeklyPlannerIcon.png'
import homepage from '../../static/graphics/ShoppingListIcon.png'
import logo from '../../static/graphics/MonkeyChefLogoIcon.png'
import logout from '../../static/graphics/SadMonkey.png'


export default function Navigation() {
    const { isAuthenticated } = useContext(AuthContext);

    const navigate = useNavigate();
    return (
        <>
            <nav className="nav-menu">
                <ul className="nav-menu-items">
                    {!isAuthenticated && (
                        <div>
                            <li className="nav-text" onClick={() => navigate('/login')}>
                                <img className="navIcon" src={logo} alt="" />
                            </li>
                            <li className="nav-text" onClick={() => navigate('/register')}>
                                <img className="navIcon" src={add} alt="" />
                            </li>
                            <li className="nav-text" onClick={() => navigate('/recipes')}>
                                <img className="navIcon" src={book} alt="" />
                            </li>
                            <li className="nav-text" onClick={() => navigate('/')}>
                                <img className="navIcon" src={homepage} alt="" />
                            </li>
                        </div>
                    )}

                    {isAuthenticated && (
                        <div>
                            <li className="nav-text" onClick={() => navigate('/planner')}>
                                <img className="navIcon" src={planner} alt="" />
                            </li>

                            <li className="nav-text" onClick={() => navigate('/logout')}>
                                <img className="navIcon" src={logout} alt="" />
                            </li>
                        </div>
                    )}

                    {/* {SidebarData.map((item, index) => {
                        return (
                            <li onClick={() => item.onClick(navigate)} key={index} className={item.cName}>
                                <img className="navIcon" src={item.icon} />
                            </li>
                        )
                    })
                    } */}
                </ul>
            </nav>
        </>
    );
};