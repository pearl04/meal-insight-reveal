
import { FoodItem } from "@/components/FoodItemEditor";
import { FoodWithNutrition } from "@/components/NutritionDisplay";

// OpenRouter integration for better AI image analysis
export const analyzeImage = async (imageFile: File, apiKey?: string): Promise<FoodItem[]> => {
  // If no API key is provided, fall back to the mock service
  if (!apiKey) {
    return mockAnalyzeImage(imageFile);
  }
  
  try {
    // Convert the image to base64
    const base64Image = await fileToBase64(imageFile);
    
    // Call OpenRouter API to analyze the image
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-opus:beta",
        messages: [
          {
            role: "system",
            content: "You are a nutritional expert that identifies food items in images. Respond with ONLY a JSON array of food items that you can identify in the image. Each food item should have an 'id' (a unique string) and 'name' property. Don't include any explanation, just the JSON array."
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Identify all the food items in this image:" },
              { type: "image_url", image_url: { url: base64Image } }
            ]
          }
        ]
      }),
    });
    
    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Parse the AI response to extract food items
    try {
      const content = data.choices[0]?.message?.content || '';
      // Extract JSON array from response if needed
      const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      const foodItems = JSON.parse(jsonStr);
      
      // Ensure the response has the correct format
      if (Array.isArray(foodItems) && foodItems.length > 0) {
        return foodItems.map(item => ({
          id: item.id || `food-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: item.name
        }));
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
    }
    
    // Fallback to mock data if parsing fails
    return mockAnalyzeImage(imageFile);
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    // Fallback to mock data if the API call fails
    return mockAnalyzeImage(imageFile);
  }
};

// Convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Original mock service as fallback
const mockAnalyzeImage = async (imageFile: File): Promise<FoodItem[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock data - in a real app, this would be actual AI analysis
  // For demo purposes, we'll return random food items based on a simple hash of the file name
  const hash = imageFile.name.length + imageFile.size % 100;
  
  // Selection of common food items
  const foodOptions = [
    { id: "1", name: "Grilled Chicken Breast" },
    { id: "2", name: "Brown Rice" },
    { id: "3", name: "Broccoli" },
    { id: "4", name: "Salmon Fillet" },
    { id: "5", name: "Sweet Potato" },
    { id: "6", name: "Quinoa" },
    { id: "7", name: "Avocado" },
    { id: "8", name: "Spinach" },
    { id: "9", name: "Greek Yogurt" },
    { id: "10", name: "Strawberries" },
    { id: "11", name: "Bananas" },
    { id: "12", name: "Almonds" },
    { id: "13", name: "Eggs" },
    { id: "14", name: "Tofu" },
    { id: "15", name: "Lettuce" }
  ];
  
  // Select 2-4 random food items based on the hash
  const numItems = (hash % 3) + 2; // 2 to 4 items
  const selectedItems: FoodItem[] = [];
  
  for (let i = 0; i < numItems; i++) {
    const index = (hash + i * 7) % foodOptions.length;
    selectedItems.push({
      id: Date.now() + i.toString(),
      name: foodOptions[index].name
    });
  }
  
  return selectedItems;
};

export const getNutritionInfo = async (foodItems: FoodItem[]): Promise<FoodWithNutrition[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock nutrition database
  const nutritionDatabase: Record<string, { calories: number, protein: number, carbs: number, fat: number }> = {
    "Grilled Chicken Breast": { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    "Brown Rice": { calories: 112, protein: 2.3, carbs: 23.5, fat: 0.8 },
    "Broccoli": { calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4 },
    "Salmon Fillet": { calories: 208, protein: 20.4, carbs: 0, fat: 13.4 },
    "Sweet Potato": { calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1 },
    "Quinoa": { calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9 },
    "Avocado": { calories: 160, protein: 2, carbs: 8.5, fat: 14.7 },
    "Spinach": { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
    "Greek Yogurt": { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
    "Strawberries": { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
    "Bananas": { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
    "Almonds": { calories: 579, protein: 21.2, carbs: 21.7, fat: 49.9 },
    "Eggs": { calories: 155, protein: 12.6, carbs: 0.6, fat: 10.6 },
    "Tofu": { calories: 76, protein: 8, carbs: 1.9, fat: 4.8 },
    "Lettuce": { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 }
  };
  
  // Get nutrition information for each food item
  return foodItems.map(item => {
    // If item exists in our database, use that data, otherwise generate random values
    const defaultNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const itemName = Object.keys(nutritionDatabase).find(key => 
      item.name.toLowerCase().includes(key.toLowerCase())
    );
    
    const nutrition = itemName 
      ? nutritionDatabase[itemName] 
      : {
          calories: Math.floor(Math.random() * 300) + 50,
          protein: Math.floor(Math.random() * 15) + 1,
          carbs: Math.floor(Math.random() * 30) + 5,
          fat: Math.floor(Math.random() * 10) + 1
        };
    
    return {
      ...item,
      nutrition
    };
  });
};
