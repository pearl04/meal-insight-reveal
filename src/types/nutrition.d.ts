
export interface FoodItem {
  id: string;
  name: string;
  nutrition?: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
  healthy_swap?: string;
  rating?: number;
}

export interface FoodWithNutrition extends FoodItem {
  nutrition: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
}
