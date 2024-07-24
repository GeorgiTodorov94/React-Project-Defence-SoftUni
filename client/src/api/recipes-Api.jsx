import * as request from './requester';
const BASE_URL = 'http://localhost:3030/jsonstore/recipes'

export const fetchAllRecipes = async () => await request.get(BASE_URL);
