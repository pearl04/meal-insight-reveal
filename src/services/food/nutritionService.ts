import { FoodItem, FoodWithNutrition } from "@/types/nutrition";
import { calculateTotals } from "./utils";
import { getMockNutrition } from "./mockData";

/**
 * Gets nutrition information for a list of food items
 */
export const getNutritionInfo = async (foodItems: FoodItem[]): Promise<FoodWithNutrition[]> => {
  try {
    console.log("Getting nutrition info for food items:", foodItems);
    
    // This would typically call an API to get nutrition info
    // For now, we'll return mock data based on the food items
    const results: FoodWithNutrition[] = foodItems
      .map(item => {
        console.log("Processing food item:", item.name);
        
        // If the item already has nutrition info, validate it
        if (item.nutrition && 
            typeof item.nutrition === 'object' &&
            'calories' in item.nutrition &&
            'protein' in item.nutrition && 
            'carbs' in item.nutrition && 
            'fat' in item.nutrition) {
          console.log("Item already has valid nutrition data:", item.name);
          return item as FoodWithNutrition;
        }
        
        // Otherwise generate nutrition data
        const nutrition = getMockNutrition(item.name);
        console.log(`Generated mock nutrition for ${item.name}:`, nutrition);
        
        return {
          ...item,
          nutrition: nutrition
        };
      })
      .filter((item): item is FoodWithNutrition => {
        const isValid = !!item.nutrition && 
                      typeof item.nutrition === 'object' &&
                      'calories' in item.nutrition && 
                      'protein' in item.nutrition && 
                      'carbs' in item.nutrition && 
                      'fat' in item.nutrition;
        
        if (!isValid) {
          console.warn(`Filtered out item with invalid nutrition: ${item.name}`);
        }
        
        return isValid;
      });
    
    console.log("Final nutrition results:", results);
    return results;
  } catch (err) {
    console.error("Failed to get nutrition info:", err);
    throw err;
  }
};
