import * as request from './requester';
import { useParams } from 'react-router-dom';
const BASE_URL = 'http://localhost:3030/jsonstore/recipes'

export const fetchAllRecipes = async () => {
    const result = await request.get(BASE_URL);

    const recipes = Object.values(result);

    return recipes;
}

export const getOne = (recipeId) => request.get(`${BASE_URL}/${recipeId}`);

export const recipesAPI = {
    getOne,
    fetchAllRecipes
}