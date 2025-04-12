
import { FoodItem } from "@/types/nutrition";

/**
 * Returns mock food items for when the API fails
 */
export const getMockFoodItems = (type: 'text' | 'image'): FoodItem[] => {
  if (type === 'text') {
    return [
      { id: 'mock-1', name: 'Salad', rating: 9 },
      { id: 'mock-2', name: 'Grilled Chicken', rating: 8 },
      { id: 'mock-3', name: 'Brown Rice', rating: 7 }
    ];
  } else {
    return [
      { id: 'mock-1', name: 'Apple', rating: 9 },
      { id: 'mock-2', name: 'Chicken Breast', rating: 8 },
      { id: 'mock-3', name: 'Mixed Vegetables', rating: 9 }
    ];
  }
};

/**
 * Returns mock nutrition data for a food item
 */
export const getMockNutrition = (foodName: string) => {
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
