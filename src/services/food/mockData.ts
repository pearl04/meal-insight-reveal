import { FoodItem } from "@/types/nutrition";

/**
 * Returns mock food items for when the API fails
 */
export const getMockFoodItems = (): FoodItem[] => {
  return [
    { id: 'mock-1', name: 'Salad', rating: 9 },
    { id: 'mock-2', name: 'Grilled Chicken', rating: 8 },
    { id: 'mock-3', name: 'Brown Rice', rating: 7 }
  ];
};

/**
 * Returns mock nutrition data for a food item
 */
export const getMockNutrition = (foodName: string) => {
  // Hardcoded nutrition data for common foods
  const nutritionData: Record<string, { calories: string, protein: string, carbs: string, fat: string }> = {
    'apple': { calories: '52 kcal', protein: '0.3g', carbs: '14g', fat: '0.2g' },
    'chicken breast': { calories: '165 kcal', protein: '31g', carbs: '0g', fat: '3.6g' },
    'mixed vegetables': { calories: '45 kcal', protein: '2.5g', carbs: '9g', fat: '0.3g' },
    'salad': { calories: '20 kcal', protein: '1g', carbs: '3g', fat: '0.5g' },
    'grilled chicken': { calories: '165 kcal', protein: '31g', carbs: '0g', fat: '3.6g' },
    'brown rice': { calories: '112 kcal', protein: '2.3g', carbs: '23g', fat: '0.8g' },
  };

  const lowerName = foodName.toLowerCase();
  for (const [key, value] of Object.entries(nutritionData)) {
    if (lowerName.includes(key)) {
      return value;
    }
  }

  // Return generated values with units for unknown items
  return {
    calories: `${Math.floor(50 + Math.random() * 300)} kcal`,
    protein: `${(1 + Math.random() * 15).toFixed(1)}g`,
    carbs: `${(5 + Math.random() * 30).toFixed(1)}g`,
    fat: `${(1 + Math.random() * 10).toFixed(1)}g`
  };
};
