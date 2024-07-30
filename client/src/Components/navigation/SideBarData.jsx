import add from '../../static/graphics/AddRecipeIcon.png'
import book from '../../static/graphics/RecipeBookIcon.png'
import planner from '../../static/graphics/WeeklyPlannerIcon.png'
import homepage from '../../static/graphics/ShoppingListIcon.png'
import logo from '../../static/graphics/MonkeyChefLogoIcon.png'


const SidebarData =

    [
        {
            onClick: (navigate) => navigate('/login'),
            icon: logo,
            cName: 'nav-text'
        },
        {
            onClick: (navigate) => navigate('/register'),
            icon: add,
            cName: 'nav-text'
        },
        {
            onClick: (navigate) => navigate('/recipes'),
            icon: book,
            cName: 'nav-text'
        },
        {
            onClick: (navigate) => navigate('/planner'),
            icon: planner,
            cName: 'nav-text'
        },
        {
            onClick: (navigate) => navigate('/'),
            icon: homepage,
            cName: 'nav-text'
        },
        {
            onClick: (navigate) => navigate('/logout'),
            icon: logo,
            cName: 'nav-text'
        }
    ]

export default SidebarData;