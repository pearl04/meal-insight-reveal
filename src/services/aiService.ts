
// === Types ===
export interface FoodItem {
  id: string;
  name: string;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  healthy_swap?: string;
  rating?: number;
}

export interface FoodWithNutrition extends FoodItem {
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

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
  return [
    {
      id: `food-${Date.now()}-1`,
      name: "Avocado",
      nutrition: {
        calories: 160,
        protein: 2,
        carbs: 9,
        fat: 15
      },
      healthy_swap: "Use as a spread instead of butter",
      rating: 9
    },
    {
      id: `food-${Date.now()}-2`,
      name: "Tofu",
      nutrition: {
        calories: 76,
        protein: 8,
        carbs: 2,
        fat: 5
      },
      healthy_swap: "Great protein source",
      rating: 8
    }
  ];
};

// === Get API Key from Supabase Edge Function ===
const getOpenRouterKey = async (): Promise<string | null> => {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase.functions.invoke('get-openrouter-key', {});
    
    if (error) {
      console.error("Error fetching API key from edge function:", error);
      return null;
    }
    
    return data?.key || null;
  } catch (error) {
    console.error("Failed to fetch API key:", error);
    return null;
  }
};

// === Main Analyzer ===
export const analyzeImage = async (imageFile: File, manualApiKey?: string): Promise<FoodItem[]> => {
  try {
    const base64Image = await fileToBase64(imageFile);
    
    // Try to get key from different sources in order of priority
    const manualKey = manualApiKey && manualApiKey.trim() !== "" ? manualApiKey : null;
    const edgeFunctionKey = await getOpenRouterKey();
    const envKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    const key = manualKey || edgeFunctionKey || envKey;
    
    console.log("Key sources available:", {
      manualKeyProvided: !!manualKey,
      edgeFunctionKeyProvided: !!edgeFunctionKey,
      envKeyProvided: !!envKey
    });
    
    if (!key) {
      console.warn("❗ No API key found from any source. Falling back to mock data.");
      return mockAnalyzeImage();
    }
    
    const model = "openrouter/optimus-alpha";

    console.log("Sending request to OpenRouter API...");
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "HTTP-Referer": window.location.origin,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `
You are a nutritionist AI that analyzes food photos.

Your job is to return ONLY a valid JSON array — NO explanations, markdown, or text.

Each item must follow this format:
[
  {
    "id": "item-1",
    "name": "Pasta",
    "nutrition": { "calories": 400, "protein": 10, "carbs": 50, "fat": 15 },
    "healthy_swap": "Use whole wheat pasta",
    "rating": 6
  }
]

Strict rule: Respond with nothing else except the valid JSON array.
            `.trim(),
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this meal and return JSON." },
              { type: "image_url", image_url: { url: base64Image } },
            ],
          },
        ],
        temperature: 0.2, // Lower temperature for more consistent outputs
        max_tokens: 1000
      }),
    });

    const raw = await response.text();
    console.log("📦 Full raw response (status", response.status, "):", raw);

    if (!response.ok) {
      throw new Error(`❌ OpenRouter API returned status ${response.status}: ${raw}`);
    }

    // Clean unpredictable text before/after the array
    try {
      const cleanedContent = raw.replace(/^[^{\[]+/, "").replace(/[\n\r\t\s]*$/, "");
      const contentMatch = cleanedContent.match(/\[\s*\{.*\}\s*\]/s);
      const jsonStr = contentMatch ? contentMatch[0] : cleanedContent;
      const foodItems = JSON.parse(jsonStr);

      if (Array.isArray(foodItems) && foodItems.length > 0) {
        return foodItems.map(item => ({
          id: item.id || `food-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: item.name,
          nutrition: item.nutrition,
          healthy_swap: item.healthy_swap,
          rating: item.rating
        }));
      }
      
      throw new Error("Invalid response format from OpenRouter API");
    } catch (parseError) {
      console.error("❌ Failed to parse API response:", parseError);
      throw new Error(`Failed to parse API response: ${parseError.message}`);
    }
  } catch (err) {
    console.error("❌ AI analysis failed:", err);
    console.log("Falling back to mock data due to error");
    return mockAnalyzeImage();
  }
};

// === Nutrition Extractor (fallback for name-only items) ===
export const getNutritionInfo = async (foodItems: FoodItem[]): Promise<FoodWithNutrition[]> => {
  // Filter out items that already have nutrition info
  const itemsWithNutrition = foodItems.filter(item => item.nutrition);
  
  // Convert to FoodWithNutrition type
  return itemsWithNutrition.map(item => ({
    ...item,
    nutrition: item.nutrition!
  }));
};
