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

const mockAnalyzeImage = async (imageFile: File): Promise<FoodItem[]> => {
  return [
    {
      id: `mock-${Date.now()}`,
      name: "Sample Food",
      nutrition: {
        calories: 300,
        protein: 10,
        carbs: 40,
        fat: 8
      },
      healthy_swap: "Consider a salad instead",
      rating: 4
    }
  ];
};

// === Main Analyzer ===
export const analyzeImage = async (imageFile: File, apiKey?: string): Promise<FoodItem[]> => {
  const base64Image = await fileToBase64(imageFile);
  const key = apiKey || import.meta.env.VITE_OPENROUTER_API_KEY;
  const model = "openrouter/optimus-alpha";

  if (!key) {
    console.warn("❗ No API key found. Falling back to mock.");
    return mockAnalyzeImage(imageFile);
  }

  try {
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
      }),
    });

    const raw = await response.text();
    console.log("📦 Full raw response (status", response.status, "):", raw);

    if (!response.ok) {
      throw new Error(`❌ OpenRouter API returned status ${response.status}`);
    }

    // Clean unpredictable text before/after the array
    const cleanedContent = raw.replace(/^[^{\[]+/, "").replace(/[\n\r\t]+$/, "");
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
  } catch (err) {
    console.error("❌ AI parse failed:", err);
  }

  return mockAnalyzeImage(imageFile);
};

// === Nutrition Extractor (fallback for name-only items) ===
export const getNutritionInfo = async (foodItems: FoodItem[]): Promise<FoodWithNutrition[]> => {
  return foodItems
    .filter(item => item.nutrition)
    .map(item => ({
      ...item,
      nutrition: item.nutrition!
    }));
};
