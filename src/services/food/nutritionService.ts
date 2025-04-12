import { FoodItem, FoodWithNutrition } from "@/types/nutrition";
import { calculateTotals } from "./utils";
import { getMockNutrition } from "./mockData";

/**
 * Gets nutrition information for a list of food items
 */
export const getNutritionInfo = async (foodItems: FoodItem[]): Promise<FoodWithNutrition[]> => {
  try {
    // This would typically call an API to get nutrition info
    // For now, we'll return mock data based on the food items
    const results: FoodWithNutrition[] = foodItems.map(item => {
      // If the item already has nutrition info, use it
      if (item.nutrition) {
        return item as FoodWithNutrition;
      }
      
      // Otherwise generate nutrition data
      return {
        ...item,
        nutrition: getMockNutrition(item.name)
      };
    });
    
    return results;
  } catch (err) {
    console.error("Failed to get nutrition info:", err);
    throw err;
  }
};
