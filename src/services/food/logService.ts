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
  userId: string
): Promise<void> => {
  try {
    console.log("👉 saveMealLog CALLED with userId:", userId);

    const uuid = userId || getAnonUserId(); // fallback if needed

    const mealLogData: MealLogInsert = {
      user_id: uuid,
      food_items: foodItems,
      nutrition_summary: {
        items: itemsWithNutrition,
        totals: calculateTotals(itemsWithNutrition),
      },
      mock_data: !userId, // true if no userId (anonymous user)
    };

    console.log("🛠 Meal log object to insert:", JSON.stringify(mealLogData, null, 2));

    const { error } = await supabase.from("meal_logs").insert([mealLogData]);

    if (error) {
      console.error("❌ Supabase insert error:", error);
      toast.error("Failed to save meal log");
      throw error; // important so we can handle if needed
    }

    console.log("✅ Meal log inserted successfully");
    toast.success("Meal logged successfully");
  } catch (err) {
    console.error("❌ saveMealLog caught an unexpected error:", err);
    // no rethrow here to prevent UI crash
  }
};

/**
 * (Optional) Fetches the last 7 meal logs for the current user (by user_id or anon UUID)
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
