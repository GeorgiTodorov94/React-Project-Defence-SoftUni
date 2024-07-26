import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import '../../static/CSS/navigation.css';
import { Link } from 'react-router-dom';
import SidebarData from './SideBarData';
import { useNavigate } from 'react-router-dom';

export default function Navigation() {
    const { isAuthenticated } = useContext(AuthContext);

    const navigate = useNavigate();
    return (
        <>
            <nav className="nav-menu">
                <ul className="nav-menu-items">
                    {SidebarData.map((item, index) => {
                        return (
                            <li onClick={() => item.onClick(navigate)} key={index} className={item.cName}>
                                <img className="navIcon" src={item.icon} />
                            </li>
                        )
                    })
                    }
                </ul>
            </nav>
        </>
    )
}