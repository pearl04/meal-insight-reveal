
import { FoodItem } from "@/types/nutrition";
import { supabase } from "@/integrations/supabase/client";
import { getMockFoodItems } from "./mockData";

/**
 * Analyzes food items from text input using the nutrition edge function
 */
export const analyzeText = async (text: string): Promise<FoodItem[]> => {
  try {
    const { data, error } = await supabase.functions.invoke("get-nutrition", {
      body: JSON.stringify({
        text: text,
        pro: false  // You can adjust this based on user's pro status if needed
      }),
    });

    if (error) {
      throw new Error("Supabase function failed for text analysis");
    }

    console.log("📦 Supabase Edge Function text response:", data);

    if (!Array.isArray(data)) {
      throw new Error("Invalid text AI response format");
    }

    return data.map((item) => ({
      id: item.id || `food-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: item.name,
      nutrition: item.nutrition,
      healthy_swap: item.healthy_swap,
      rating: item.rating,
    }));
  } catch (err) {
    console.error("❌ analyzeText failed:", err);
    return getMockFoodItems('text');
  }
};

/**
 * Analyzes food items from an image using the nutrition edge function
 */
export const analyzeImage = async (file: File): Promise<FoodItem[]> => {
  try {
    // Convert file to base64
    const base64 = await fileToBase64(file);
    
    const { data, error } = await supabase.functions.invoke("get-nutrition", {
      body: JSON.stringify({
        image: base64,
        pro: false
      }),
    });

    if (error) {
      throw new Error("Supabase function failed for image analysis");
    }

    console.log("📦 Supabase Edge Function image response:", data);

    if (!Array.isArray(data)) {
      throw new Error("Invalid image AI response format");
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
    return getMockFoodItems('image');
  }
};

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:image/jpeg;base64, prefix if present
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};
