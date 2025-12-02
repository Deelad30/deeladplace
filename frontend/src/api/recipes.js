import api from './axios';

// Recipe for a specific product
export const getRecipe = (productId) =>
  api.get(`/recipes/${productId}`);

export const saveRecipe = (productId, body) =>
  api.post(`/recipes/${productId}`, body);

export const deleteRecipeItem = (recipeId) =>
  api.delete(`/recipes/item/${recipeId}`);
