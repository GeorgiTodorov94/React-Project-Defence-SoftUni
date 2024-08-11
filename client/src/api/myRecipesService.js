import { getAccessToken } from "../utils/authUtils";

export const baseURL = `http://localhost:3030/data`;

const accessToken = getAccessToken();

const MealPlannerService = {

    getById(recipeId, userId) {
        return fetch(`${baseURL}/${userId}/${recipeId}`)
            .then(result => result.json())
    },

    getAll(userId) {
        return fetch(`${baseURL}/${userId}`)
            .then(result => result.json())
    },

    create(recipe, userId) {
        const plannerRecipe = {
            _id: recipe._id,
            name: recipe.name,
            servings: recipe.servings,
            category: recipe.category,
            dietary: recipe.dietary,
            ingredients: recipe.ingredients,
            imageUrl: recipe.imageUrl,
            method: recipe.method,
            notes: recipe.notes,
        };

        return fetch(`${baseURL}/${userId}/`, {
            method: 'POST',
            body: JSON.stringify(plannerRecipe),
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': accessToken
            },
        })
            .then(res => res.json())
    },


    delete(recipeId, userId) {
        return fetch(`${baseURL}/${userId}/${recipeId}`, {
            method: 'DELETE',
            headers: {
                'X-Authorization': accessToken
            }
        })
    },

    update(recipeId, userId) {
        return fetch(`${baseURL}/${userId}/${recipeId}`, {
            method: 'PUT',
            headers: {
                'X-Authorization': accessToken
            }
        })
    }
}
export default MealPlannerService;





// import { getAccessToken } from "../utils/authUtils";

// const baseURL = `http://localhost:3030/data/recipes/`


// const accessToken = getAccessToken();


// const MealPlannerService = {
//     getById(recipeId) {
//         return fetch(`${baseURL}/${recipeId}`)
//             .then(result => result.json())
//     },

//     getAll() {
//         return fetch(baseURL)
//             .then(result => result.json())
//     },

//     create(recipe) {
//         const plannerRecipe = {
//             recipeId: recipe._id,
//             name: recipe.name,
//             servings: recipe.servings,
//             category: recipe.category,
//             dietary: recipe.dietary,
//             ingredients: recipe.ingredients,
//             imageUrl: recipe.imageUrl,
//             method: recipe.method,
//             notes: recipe.notes,
//         }

//         return fetch(baseURL, {
//             method: 'POST',
//             body: JSON.stringify(plannerRecipe),
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-Authorization': accessToken
//             }
//         })
//             .then(res => res.json())
//     },

//     delete(id) {
//         return fetch(baseURL + id, {
//             method: 'DELETE',
//             headers: {
//                 'X-Authorization': accessToken
//             }
//         })
//     },

//     update(id) {
//         return fetch(baseURL + id, {
//             method: 'PUT'
//         })
//     }
// }
// export default MealPlannerService;

// VANILLA JAVASCRIPT IS THE BEST!!!

// No, its not. It's just quite handy and quick but much more ugly code-wise than modern React/JavaScript code. :D


