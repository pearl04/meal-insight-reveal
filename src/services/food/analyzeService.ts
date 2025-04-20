
import { FoodItem } from "@/types/nutrition";
import { supabase } from "@/integrations/supabase/client"; // corrected path here
import posthog from 'posthog-js';


/**
 * Analyzes food items from text input using the nutrition edge function
 */
export const analyzeText = async (text: string): Promise<FoodItem[]> => {
  const { data, error } = await supabase.functions.invoke("get-nutrition", {
    body: JSON.stringify({
      text: text,
    }),
  });

  if (error) {
    console.error("❌ Supabase function failed for text analysis:", error);
    posthog.capture("meal_feedback_error", {
      source: "supabase.invoke",
      message: error.message,
    });
    throw new Error("AI is taking a break 😴 Please try again.");
  }

  console.log("📦 Supabase Edge Function text response:", data);

  if (!Array.isArray(data)) {
    console.error("❌ Invalid AI response format (text):", data);
    posthog.capture("meal_feedback_error", {
      source: "invalid_format",
      raw: JSON.stringify(data),
    });
    throw new Error("AI gave an unexpected response 🤖 Please try again.");
  }
  posthog.capture("meal_feedback_success", {
    inputLength: text.length,
  });
  return data.map((item) => ({
    id: item.id || `food-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    name: item.name,
    nutrition: item.nutrition,
    healthy_swap: item.healthy_swap,
    rating: item.rating,
  }));
};
