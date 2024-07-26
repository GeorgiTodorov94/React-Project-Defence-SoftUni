import '../../static/CSS/recipeList.css'
import Header from '../header/Header'
import RecipeListItem from "./recipe-list-item/RecipeListItem"
import useGetAllRecipes from '../../hooks/useRecipes'

export default function RecipeList() {
    const [recipes, setRecipes] = useGetAllRecipes()
    return (
        <>
            <Header />
            <h1 className="recipebook-title">All Recipes</h1>
            <section className="recipe-book-link-container">

                {recipes.length > 0
                    ? recipes.map(recipe => <RecipeListItem key={recipe._id} {...recipe} />)
                    : <h3 className="no-articles">No Recipes yet</h3> // to do here the css
                }
            </section>

        </>)
}