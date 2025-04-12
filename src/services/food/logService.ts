
import { FoodItem, FoodWithNutrition } from "@/types/nutrition";
import { MealLogInsert } from '@/types';
import { supabase } from "@/integrations/supabase/client";
import { calculateTotals } from "./utils";
import { toast } from "sonner";

/**
 * Saves a meal log to the database
 */
export const saveMealLog = async (
  foodItems: FoodItem[], 
  itemsWithNutrition: FoodWithNutrition[]
): Promise<void> => {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    // Prepare data for saving to database
    const mealLogData: MealLogInsert = {
      user_id: user?.id || 'anonymous', // Use user ID when available, otherwise use anonymous for demo
      food_items: foodItems,
      nutrition_summary: {
        items: itemsWithNutrition,
        totals: calculateTotals(itemsWithNutrition)
      },
      mock_data: user ? false : true // Mark as mock data if no user is authenticated
    };
    
    console.log("Saving meal log:", mealLogData);
    
    // Send to Supabase database
    const { error } = await supabase
      .from('meal_logs')
      .insert([mealLogData]);
      
    if (error) {
      console.error("Failed to save meal log:", error);
      toast.error("Failed to save meal log");
      throw error;
    }
    
    console.log("Meal log saved successfully");
  } catch (err) {
    console.error("Failed to save meal log:", err);
    // We're not throwing here to avoid breaking the user flow if saving fails
  }
};
