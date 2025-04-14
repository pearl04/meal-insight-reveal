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
  itemsWithNutrition: FoodWithNutrition[]
): Promise<void> => {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    const uuid = user?.id || getAnonUserId(); // Always track by uuid (device or auth)

    const mealLogData: MealLogInsert = {
      user_id: uuid, // Use user_id instead of uuid to match Supabase schema
      food_items: foodItems,
      nutrition_summary: {
        items: itemsWithNutrition,
        totals: calculateTotals(itemsWithNutrition),
      },
      mock_data: !user, // true only if user not logged in
    };

    console.log("Saving meal log:", mealLogData);

    const { error } = await supabase.from("meal_logs").insert([mealLogData]);

    if (error) {
      console.error("❌ Failed to save meal log:", error);
      toast.error("Failed to save meal log");
      throw error;
    }

    console.log("✅ Meal log saved successfully");
  } catch (err) {
    console.error("❌ Error in saveMealLog:", err);
    // Don't throw to avoid crashing UX
  }
};

/**
 * Fetches the last 7 meal logs for the current user (by user_id or anon UUID)
 */
// export const getMealHistory = async () => {
//   const { data: { user } } = await supabase.auth.getUser();
//   const uuid = user?.id || getAnonUserId();

//   const { data, error } = await supabase
//     .from("meal_logs")
//     .select("*")
//     .eq("user_id", uuid)
//     .order("created_at", { ascending: false })
//     .limit(7);

//   if (error) {
//     console.error("❌ Error fetching meal history:", error);
//     return [];
//   }

//   return data;
// };
