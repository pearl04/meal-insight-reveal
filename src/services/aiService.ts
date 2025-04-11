
import { FoodItem, FoodWithNutrition } from "@/types/nutrition";
import { supabase } from "@/integrations/supabase/client";

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

export const analyzeImage = async (imageFile: File, manualApiKey?: string): Promise<FoodItem[]> => {
  try {
    const base64Image = await fileToBase64(imageFile);
    
    // Try to get API key from different sources
    let apiKey = manualApiKey || '';
    
    // If no manual key, try to get from edge function
    if (!apiKey) {
      try {
        console.log("No manual API key provided, trying to fetch from edge function...");
        const response = await supabase.functions.invoke('get-openrouter-key');
        
        if (response.error) {
          console.error("Error fetching API key from edge function:", response.error);
        } else if (response.data?.key) {
          apiKey = response.data.key;
          console.log("Successfully retrieved API key from edge function");
        } else {
          console.log("Edge function response did not contain a key:", response);
        }
      } catch (err) {
        console.error("Exception while fetching API key:", err);
      }
    }
    
    // If still no key, check environment variable
    const envKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey && envKey) {
      console.log("Using API key from environment variable");
      apiKey = envKey;
    }
    
    // Log the key sources for debugging
    console.info("Key sources available:", {
      manualKeyProvided: !!manualApiKey,
      edgeFunctionKeyProvided: !!apiKey && !manualApiKey && !envKey,
      envKeyProvided: !!envKey
    });
    
    // If no API key available, return mock data
    if (!apiKey) {
      console.warn("❗ No API key found from any source. Falling back to mock data.");
      return mockAnalyzeImage();
    }

    // API key is available, proceed with actual analysis
    console.log("Sending image for analysis with API key");
    const response = await fetch("https://fpwuewixgazaiikqtuwq.functions.supabase.co/get-nutrition", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Supabase function error (${response.status}):`, errorText);
      throw new Error(`Supabase function failed with status ${response.status}`);
    }

    const raw = await response.text();
    console.log("📦 Supabase Edge Function response:", raw);

    // Try parsing only the array inside
    const cleaned = raw.replace(/^[^{\[]+/, "").replace(/[\n\r\t\s]*$/, "");
    const contentMatch = cleaned.match(/\[\s*\{.*\}\s*\]/s);
    const jsonStr = contentMatch ? contentMatch[0] : cleaned;
    const foodItems = JSON.parse(jsonStr);

    if (Array.isArray(foodItems) && foodItems.length > 0) {
      return foodItems.map(item => ({
        id: item.id || `food-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
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
