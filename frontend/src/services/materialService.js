// frontend/services/materialService.js
import { getMaterials } from "../api/materials"; // your existing API functions

export const materialService = {
  getAllMaterials: () => getMaterials(),
};
