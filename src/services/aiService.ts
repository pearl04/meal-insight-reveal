import { supabase } from "@/integrations/supabase/client";
import { FoodItem, FoodWithNutrition } from "@/types/nutrition";

// === Helpers ===
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const mockAnalyzeImage = async (): Promise<FoodItem[]> => {
  console.log("⚠️ Using mock data for food detection");
  return [
    {
      id: `food-${Date.now()}-1`,
      name: "Avocado",
      nutrition: { calories: 160, protein: 2, carbs: 9, fat: 15 },
      healthy_swap: "Use as a spread instead of butter",
      rating: 9,
    },
    {
      id: `food-${Date.now()}-2`,
      name: "Tofu",
      nutrition: { calories: 76, protein: 8, carbs: 2, fat: 5 },
      healthy_swap: "Great protein source",
      rating: 8,
    },
  ];
};

export const analyzeImage = async (imageFile: File): Promise<FoodItem[]> => {
  try {
    const base64Image = await fileToBase64(imageFile);

    // ✅ use Supabase Edge Function
    const { data, error } = await supabase.functions.invoke("get-nutrition", {
      body: { image: base64Image },
    });

    if (error) {
      console.error("❌ Supabase function error:", error);
      throw new Error("Supabase function failed");
    }

    const raw = data as string;
    console.log("📦 Supabase Edge Function response:", raw);

    // Clean & extract valid JSON
    const cleaned = raw.replace(/^[^{\[]+/, "").replace(/[\n\r\t\s]*$/, "");
    const contentMatch = cleaned.match(/\[\s*\{.*\}\s*\]/s);
    const jsonStr = contentMatch ? contentMatch[0] : cleaned;
    const foodItems = JSON.parse(jsonStr);

    if (Array.isArray(foodItems) && foodItems.length > 0) {
      return foodItems.map(item => ({
        id: item.id || `food-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        name: item.name,
        nutrition: item.nutrition,
        healthy_swap: item.healthy_swap,
        rating: item.rating,
      }));
    }

    throw new Error("Invalid response format from Supabase function");
  } catch (err) {
    console.error("❌ analyzeImage failed:", err);
    return mockAnalyzeImage();
  }
};

export const getNutritionInfo = async (foodItems: FoodItem[]): Promise<FoodWithNutrition[]> => {
  return foodItems
    .filter(item => item.nutrition)
    .map(item => ({
      ...item,
      nutrition: item.nutrition!,
    }));
};

export const saveMealLog = async (
  foodItems: FoodItem[], 
  nutritionSummary: FoodWithNutrition[], 
  isMockData: boolean = false
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return null;
    }

    // Fix: Insert as a single object, not as part of an array
    const { data, error } = await supabase
      .from('meal_logs')
      .insert({
        user_id: user.id,
        food_items: foodItems,
        nutrition_summary: nutritionSummary,
        mock_data: isMockData
      })
      .select();

    if (error) {
      console.error("Error saving meal log:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Unexpected error saving meal log:", err);
    return null;
  }
};
