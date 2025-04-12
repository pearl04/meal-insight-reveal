import { createClient } from '@supabase/supabase-js';
import { FoodItem, FoodWithNutrition } from "@/types/nutrition";
import { MealLogInsert } from '@/types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    return mockAnalyzeText();
  }
};

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
    return mockAnalyzeImage();
  }
};

export const getNutritionInfo = async (foodItems: FoodItem[]): Promise<FoodWithNutrition[]> => {
  try {
    // This would typically call an API to get nutrition info
    // For now, we'll return mock data based on the food items
    const results: FoodWithNutrition[] = foodItems.map(item => {
      // If the item already has nutrition info, use it
      if (item.nutrition) {
        return item as FoodWithNutrition;
      }
      
      // Otherwise generate mock nutrition data
      return {
        ...item,
        nutrition: getMockNutrition(item.name)
      };
    });
    
    return results;
  } catch (err) {
    console.error("Failed to get nutrition info:", err);
    throw err;
  }
};

export const saveMealLog = async (
  foodItems: FoodItem[], 
  itemsWithNutrition: FoodWithNutrition[]
): Promise<void> => {
  try {
    // Prepare data for saving to database
    const mealLogData: MealLogInsert = {
      user_id: 'anonymous', // Replace with actual user ID when authentication is implemented
      food_items: foodItems,
      nutrition_summary: {
        items: itemsWithNutrition,
        totals: calculateTotals(itemsWithNutrition)
      },
      mock_data: false
    };
    
    // Send to Supabase database
    const { error } = await supabase
      .from('meal_logs')
      .insert([mealLogData]);
      
    if (error) {
      throw error;
    }
    
    console.log("Meal log saved successfully");
  } catch (err) {
    console.error("Failed to save meal log:", err);
    // We're not throwing here to avoid breaking the user flow if saving fails
  }
};

// Helper functions
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

const calculateTotals = (items: FoodWithNutrition[]) => {
  return {
    calories: items.reduce((sum, item) => sum + parseFloat(item.nutrition.calories), 0).toFixed(1),
    protein: items.reduce((sum, item) => sum + parseFloat(item.nutrition.protein), 0).toFixed(1),
    carbs: items.reduce((sum, item) => sum + parseFloat(item.nutrition.carbs), 0).toFixed(1),
    fat: items.reduce((sum, item) => sum + parseFloat(item.nutrition.fat), 0).toFixed(1),
  };
};

// Mock data generators
const mockAnalyzeText = (): FoodItem[] => {
  const mockItems = [
    { id: 'mock-1', name: 'Salad', rating: 9 },
    { id: 'mock-2', name: 'Grilled Chicken', rating: 8 },
    { id: 'mock-3', name: 'Brown Rice', rating: 7 }
  ];
  
  return mockItems;
};

const mockAnalyzeImage = (): FoodItem[] => {
  const mockFoods = [
    { id: 'mock-1', name: 'Apple', rating: 9 },
    { id: 'mock-2', name: 'Chicken Breast', rating: 8 },
    { id: 'mock-3', name: 'Mixed Vegetables', rating: 9 }
  ];
  
  return mockFoods;
};

const getMockNutrition = (foodName: string) => {
  // Hardcoded nutrition data for common foods
  const nutritionData: Record<string, { calories: string, protein: string, carbs: string, fat: string }> = {
    'apple': { calories: '52', protein: '0.3', carbs: '14', fat: '0.2' },
    'chicken breast': { calories: '165', protein: '31', carbs: '0', fat: '3.6' },
    'mixed vegetables': { calories: '45', protein: '2.5', carbs: '9', fat: '0.3' },
    'salad': { calories: '20', protein: '1', carbs: '3', fat: '0.5' },
    'grilled chicken': { calories: '165', protein: '31', carbs: '0', fat: '3.6' },
    'brown rice': { calories: '112', protein: '2.3', carbs: '23', fat: '0.8' },
  };
  
  // Search for the food in our database (case-insensitive)
  const lowerName = foodName.toLowerCase();
  for (const [key, value] of Object.entries(nutritionData)) {
    if (lowerName.includes(key)) {
      return value;
    }
  }
  
  // Generate random nutrition data for unknown foods
  return {
    calories: Math.floor(50 + Math.random() * 300).toString(),
    protein: (1 + Math.random() * 15).toFixed(1),
    carbs: (5 + Math.random() * 30).toFixed(1),
    fat: (1 + Math.random() * 10).toFixed(1)
  };
};
