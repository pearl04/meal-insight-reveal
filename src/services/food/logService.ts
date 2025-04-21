
import { FoodItem, FoodWithNutrition } from "@/types/nutrition";
import { MealLogInsert } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { calculateTotals } from "./utils";
import { toast } from "sonner";
import { getAnonUserId } from "@/lib/getAnonUserId";

/**
 * Saves a meal log to the database
 */
export const saveMealLog = async (
  foodItems: FoodItem[],
  itemsWithNutrition: FoodWithNutrition[],
  userId?: string
): Promise<void> => {
  try {
    // Important: Debug logs for meal logging flow
    console.log("💾 saveMealLog CALLED with userId:", userId);
    
    // CRITICAL DEBUG: Show food items being saved
    console.log("Food items to save:", foodItems);
    console.log("Items with nutrition:", itemsWithNutrition);

    let effectiveUserId = userId;
    let isMockData = false;
    
    if (!effectiveUserId) {
      // For anonymous users, use the full ID with anon_ prefix
      effectiveUserId = getAnonUserId();
      isMockData = true; // Flag as mock data for anonymous users
      console.log("Using anonymous ID for meal log:", effectiveUserId);
    }
    
    if (!effectiveUserId) {
      console.error("❌ No valid user ID for meal logging");
      toast.error("Failed to save meal log: No valid user ID");
      return;
    }
    
    // Format the food items to ensure they're properly saved
    const formattedFoodItems = foodItems.map(item => ({
      id: item.id,
      name: item.name,
      ...(item.nutrition && { nutrition: item.nutrition }),
      ...(item.healthy_swap && { healthy_swap: item.healthy_swap }),
      ...(item.rating && { rating: item.rating })
    }));

    // Format the nutrition summary to ensure it's properly saved
    const formattedNutritionSummary = {
      items: itemsWithNutrition.map(item => ({
        id: item.id,
        name: item.name,
        nutrition: item.nutrition,
        healthy_swap: item.healthy_swap || null,
        rating: item.rating || null,
        feedback: item.nutrition ? `${item.name} contains approximately ${item.nutrition.calories} calories` : null
      })),
      totals: calculateTotals(itemsWithNutrition),
    };

    const mealLogData: MealLogInsert = {
      user_id: effectiveUserId,
      food_items: formattedFoodItems,
      nutrition_summary: formattedNutritionSummary,
      mock_data: isMockData, // true for anonymous users
    };

    console.log("🛠 Meal log object to insert:", JSON.stringify(mealLogData, null, 2));

    // Insert the meal log into Supabase
    const { data, error } = await supabase.from("meal_logs").insert([mealLogData]).select();

    if (error) {
      console.error("❌ Supabase insert error:", error);
      toast.error("Failed to save meal log: " + error.message);
      throw error;
    }

    console.log("✅ Meal log inserted successfully:", data);
    toast.success("Meal logged successfully");
    
    // VALIDATION: Immediately check if we can retrieve the saved log
    const { data: verifyData, error: verifyError } = await supabase
      .from("meal_logs")
      .select("*")
      .eq("user_id", effectiveUserId)
      .order("created_at", { ascending: false })
      .limit(1);
      
    if (verifyError) {
      console.error("⚠️ Verification query error:", verifyError);
    } else {
      console.log(`Verification found ${verifyData?.length || 0} logs:`, verifyData);
    }
  } catch (err) {
    console.error("❌ saveMealLog caught an unexpected error:", err);
    toast.error("Failed to save your meal log");
  }
};
