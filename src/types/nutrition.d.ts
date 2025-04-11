
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
