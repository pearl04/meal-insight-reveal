
import { FoodWithNutrition } from "@/types/nutrition";

/**
 * Calculates the total nutrition values from a list of food items
 */
export const calculateTotals = (items: FoodWithNutrition[]) => {
  return {
    calories: items.reduce((sum, item) => sum + parseFloat(item.nutrition.calories), 0).toFixed(1),
    protein: items.reduce((sum, item) => sum + parseFloat(item.nutrition.protein), 0).toFixed(1),
    carbs: items.reduce((sum, item) => sum + parseFloat(item.nutrition.carbs), 0).toFixed(1),
    fat: items.reduce((sum, item) => sum + parseFloat(item.nutrition.fat), 0).toFixed(1),
  };
};
