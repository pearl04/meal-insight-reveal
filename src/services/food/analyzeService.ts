import { FoodItem } from "@/types/nutrition";
import { supabase } from "@/integrations/supabase/client";

/**
 * Analyzes food items from text input using the nutrition edge function
 */
export const analyzeText = async (text: string): Promise<FoodItem[]> => {
  const { data, error } = await supabase.functions.invoke("get-nutrition", {
    body: JSON.stringify({
      text: text,
      pro: false
    }),
  });

  if (error) {
    console.error("❌ Supabase function failed for text analysis:", error);
    throw new Error("AI is taking a break 😴 Please try again.");
  }

  console.log("📦 Supabase Edge Function text response:", data);

  if (!Array.isArray(data)) {
    console.error("❌ Invalid AI response format (text):", data);
    throw new Error("AI gave an unexpected response 🤖 Please try again.");
  }

  return data.map((item) => ({
    id: item.id || `food-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    name: item.name,
    nutrition: item.nutrition,
    healthy_swap: item.healthy_swap,
    rating: item.rating,
  }));
};

/**
 * Analyzes food items from an image using the nutrition edge function
 */
export const analyzeImage = async (file: File): Promise<FoodItem[]> => {
  const base64 = await fileToBase64(file);

  const { data, error } = await supabase.functions.invoke("get-nutrition", {
    body: JSON.stringify({
      image: base64,
      pro: false
    }),
  });

  if (error) {
    console.error("❌ Supabase function failed for image analysis:", error);
    throw new Error("AI is taking a break 😴 Please try again.");
  }

  console.log("📦 Supabase Edge Function image response:", data);

  if (!Array.isArray(data)) {
    console.error("❌ Invalid AI response format (image):", data);
    throw new Error("AI gave an unexpected response 🤖 Please try again.");
  }

  return data.map((item) => ({
    id: item.id || `food-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    name: item.name,
    nutrition: item.nutrition,
    healthy_swap: item.healthy_swap,
    rating: item.rating,
  }));
};

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};
