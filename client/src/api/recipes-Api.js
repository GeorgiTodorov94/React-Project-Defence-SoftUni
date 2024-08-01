import * as request from './requester';
const BASE_URL = 'http://localhost:3030/data/recipes'

export const fetchAllRecipes = async () => {
    const result = await request.get(BASE_URL);

    const recipes = Object.values(result);

    return recipes;
}

export const getOne = (recipeId) => request.get(`${BASE_URL}/${recipeId}`);

export const create = (recipeData) => request.post(`${BASE_URL}`, recipeData)

export const remove = (recipeId) => request.del(`${BASE_URL}/${recipeId}`)

const recipesAPI = {
    fetchAllRecipes,
    getOne,
    create,
    remove
};

export default recipesAPI;