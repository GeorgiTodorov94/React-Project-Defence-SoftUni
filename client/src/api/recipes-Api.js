import * as request from './requester';
const BASE_URL = 'http://localhost:3030/data/recipes'

export const fetchAllRecipes = async () => {
    const result = await request.get(BASE_URL);

    const recipes = Object.values(result);

    return recipes;
}

export const getOne = (recipeId) => request.get(`${BASE_URL}/${recipeId}`);

export const create = (recipeData) => request.post(`${BASE_URL}`, recipeData);

export const remove = (recipeId) => request.del(`${BASE_URL}/${recipeId}`);

export const update = (recipeId, recipeData) => request.put(`${BASE_URL}/${recipeId}`, recipeData);

// export const addToPersonalList = (recipeData) => request.post(`http://localhost:3030/data/ideas`, recipeData);

// export const fetchAllFromPersonalList = async () => {
//     const result = await request.get(`http://localhost:3030/data/ideas`);

//     const personalRecipes = Object.values(result);

//     return personalRecipes;
// };

// export const deleteFromPersonalList = (recipeId) => request.del(`http://localhost:3030/data/ideas/${recipeId}`);


const recipesAPI = {
    fetchAllRecipes,
    getOne,
    create,
    remove,
    update,
    // addToPersonalList,
    // fetchAllFromPersonalList,
    // deleteFromPersonalList,
};

export default recipesAPI;