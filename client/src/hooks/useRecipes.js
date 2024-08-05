import { useState, useEffect } from "react";
import recipesAPI from "../api/recipes-Api"

export default function useGetAllRecipes() {

    const [recipes, setRecipes] = useState([])

    useEffect(() => {

        (async () => {
            const result = await recipesAPI.fetchAllRecipes();
            setRecipes(result)
        })();
    }, [])


    return [recipes, setRecipes]
};

// export function useGetPersonalRecipes() {

//     const [personalRecipes, setPersonalRecipes] = useState([]);

//     useEffect(() => {

//         (async () => {

//             const result = await recipesAPI.fetchAllFromPersonalList();
//             setPersonalRecipes(result);
//         })();

//     }, []);

//     return [personalRecipes, setPersonalRecipes]
// }


export function useGetOneRecipes(recipeId) {
    const [recipe, setRecipe] = useState({
        name: '',
        servings: '',
        category: '',
        dietary: '',
        ingredients: [],
        imageUrl: '',
        method: '',
        notes: '',
    });

    useEffect(() => {
        (async () => {
            const response = await recipesAPI.getOne(recipeId)
            setRecipe(response)
        })()
    }, [recipeId])

    return [
        recipe,
        setRecipe
    ]

}

export function useRecipeCreate() {
    const recipeCreateHandler = (recipeData) => recipesAPI.create(recipeData);


    return recipeCreateHandler;

}