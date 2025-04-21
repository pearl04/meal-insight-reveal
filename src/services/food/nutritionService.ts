import { FoodItem, FoodWithNutrition } from "@/types/nutrition";
import { calculateTotals } from "./utils";
import { getMockNutrition } from "./mockData";

/**
 * Gets nutrition information for a list of food items
 */
export const getNutritionInfo = async (foodItems: FoodItem[]): Promise<FoodWithNutrition[]> => {
  try {
    console.log("Getting nutrition info for food items:", foodItems);
    
    // Validate input
    if (!foodItems || foodItems.length === 0) {
      console.warn("Empty food items array provided to getNutritionInfo");
      return [];
    }
    
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
          // Ensure nutrition values are strings for consistency
          const validatedNutrition = {
            calories: String(item.nutrition.calories),
            protein: String(item.nutrition.protein),
            carbs: String(item.nutrition.carbs),
            fat: String(item.nutrition.fat)
          };
          
          return {
            ...item,
            nutrition: validatedNutrition
          } as FoodWithNutrition;
        }
        
        // Otherwise generate nutrition data
        const nutrition = getMockNutrition(item.name);
        console.log(`Generated mock nutrition for ${item.name}:`, nutrition);
        
        // Create a complete item with nutrition data
        const itemWithNutrition: FoodWithNutrition = {
          ...item,
          nutrition: nutrition
        };
        
        // Validate the newly created nutrition data
        if (!itemWithNutrition.nutrition || 
            !itemWithNutrition.nutrition.calories || 
            !itemWithNutrition.nutrition.protein || 
            !itemWithNutrition.nutrition.carbs || 
            !itemWithNutrition.nutrition.fat) {
          console.warn(`Generated incomplete nutrition for ${item.name}`, itemWithNutrition.nutrition);
        }
        
        return itemWithNutrition;
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
    
    // Final validation
    if (results.length === 0) {
      console.warn("No valid nutrition results were generated");
    } else {
      console.log("Final nutrition results:", JSON.stringify(results));
      console.log("Total nutrition:", calculateTotals(results));
    }
    return results;
  } catch (err) {
    console.error("Failed to get nutrition info:", err);
    throw err;
  }
};
