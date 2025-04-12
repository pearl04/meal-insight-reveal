import { supabase } from "@/integrations/supabase/client";
import { FoodItem, FoodWithNutrition } from "@/types/nutrition";
import { MealLogInsert } from "@/types";

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

const mockAnalyzeImage = async (): Promise<FoodItem[]> => {
  console.log("⚠️ Using mock data for food detection");
  return [
    {
      id: `food-${Date.now()}-1`,
      name: "Avocado",
      nutrition: { calories: "160-200", protein: "2-5", carbs: "9-10", fat: "15-20" },
      healthy_swap: "Use as a spread instead of butter",
      rating: 9,
    },
    {
      id: `food-${Date.now()}-2`,
      name: "Tofu",
      nutrition: { calories: "76-100", protein: "8-10", carbs: "2-5", fat: "5-10" },
      healthy_swap: "Great protein source",
      rating: 8,
    },
  ];
};

export const analyzeImage = async (imageFile: File, proUser = false): Promise<FoodItem[]> => {
  try {
    const base64Image = await fileToBase64(imageFile);
    const { data, error } = await supabase.functions.invoke("get-nutrition", {
      body: JSON.stringify({
        image: base64Image,
        pro: proUser
      }),
    });
    if (error) {
      throw new Error("Supabase function failed");
    }

    console.log("📦 Supabase Edge Function response:", data);

    if (!Array.isArray(data)) {
      throw new Error("Invalid AI response format");
    }

    return data.map((item) => ({
      id: item.id || `food-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: item.name,
      nutrition: item.nutrition,
      healthy_swap: item.healthy_swap,
      rating: item.rating,
    }));
  } catch (err) {
    console.error("❌ analyzeImage failed:", err);
    return mockAnalyzeImage();
  }
};

export const getNutritionInfo = async (foodItems: FoodItem[]): Promise<FoodWithNutrition[]> =>
  foodItems.filter((item) => item.nutrition).map((item) => ({ ...item, nutrition: item.nutrition! }));

export const saveMealLog = async (
  foodItems: FoodItem[],
  nutritionSummary: FoodWithNutrition[],
  isMockData = false
) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      console.error("❌ No authenticated user found");
      return null;
    }

    const { data, error } = await supabase.from("meal_logs").insert([
      {
        user_id: user.id,
        food_items: foodItems,
        nutrition_summary: nutritionSummary,
        mock_data: isMockData,
      } as MealLogInsert,
    ]).select();

    if (error) {
      console.error("❌ Error saving meal log:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("❌ Unexpected error saving meal log:", err);
    return null;
  }
};
