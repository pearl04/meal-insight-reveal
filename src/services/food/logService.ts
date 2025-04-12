
import { FoodItem, FoodWithNutrition } from "@/types/nutrition";
import { MealLogInsert } from '@/types';
import { supabase } from "@/integrations/supabase/client";
import { calculateTotals } from "./utils";

/**
 * Saves a meal log to the database
 */
export const saveMealLog = async (
  foodItems: FoodItem[], 
  itemsWithNutrition: FoodWithNutrition[]
): Promise<void> => {
  try {
    // Prepare data for saving to database
    const mealLogData: MealLogInsert = {
      user_id: 'anonymous', // Replace with actual user ID when authentication is implemented
      food_items: foodItems,
      nutrition_summary: {
        items: itemsWithNutrition,
        totals: calculateTotals(itemsWithNutrition)
      },
      mock_data: false
    };
    
    // Send to Supabase database
    const { error } = await supabase
      .from('meal_logs')
      .insert([mealLogData]);
      
    if (error) {
      throw error;
    }
    
    console.log("Meal log saved successfully");
  } catch (err) {
    console.error("Failed to save meal log:", err);
    // We're not throwing here to avoid breaking the user flow if saving fails
  }
};
