
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info } from "lucide-react";
import { FoodItem } from "./FoodItemEditor";

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodWithNutrition extends FoodItem {
  nutrition: NutritionInfo;
}

interface NutritionDisplayProps {
  foodItems: FoodWithNutrition[];
  onReset: () => void;
}

const NutritionDisplay = ({ foodItems, onReset }: NutritionDisplayProps) => {
  // Calculate total nutrition values
  const totalNutrition = foodItems.reduce(
    (acc, item) => {
      return {
        calories: acc.calories + item.nutrition.calories,
        protein: acc.protein + item.nutrition.protein,
        carbs: acc.carbs + item.nutrition.carbs,
        fat: acc.fat + item.nutrition.fat,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Calculate average for display purposes (per 100g)
  const averageNutrition = {
    calories: Math.round(totalNutrition.calories / foodItems.length),
    protein: Math.round(totalNutrition.protein / foodItems.length * 10) / 10,
    carbs: Math.round(totalNutrition.carbs / foodItems.length * 10) / 10,
    fat: Math.round(totalNutrition.fat / foodItems.length * 10) / 10,
  };

  return (
    <div className="w-full bg-white rounded-xl border p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-2">Nutrition Analysis</h2>
      <p className="text-sm text-muted-foreground mb-6 flex items-center">
        <Info className="h-4 w-4 mr-1" /> Estimated values per 100g
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-secondary p-4 rounded-lg">
          <div className="text-sm text-muted-foreground">Calories</div>
          <div className="text-3xl font-bold text-meal-700">
            {averageNutrition.calories}
            <span className="text-sm font-normal text-muted-foreground ml-1">kcal</span>
          </div>
        </div>
        
        <div className="bg-secondary p-4 rounded-lg">
          <div className="text-sm text-muted-foreground">Protein</div>
          <div className="text-3xl font-bold text-meal-700">
            {averageNutrition.protein}
            <span className="text-sm font-normal text-muted-foreground ml-1">g</span>
          </div>
        </div>
        
        <div className="bg-secondary p-4 rounded-lg">
          <div className="text-sm text-muted-foreground">Carbs</div>
          <div className="text-3xl font-bold text-meal-700">
            {averageNutrition.carbs}
            <span className="text-sm font-normal text-muted-foreground ml-1">g</span>
          </div>
        </div>
        
        <div className="bg-secondary p-4 rounded-lg">
          <div className="text-sm text-muted-foreground">Fat</div>
          <div className="text-3xl font-bold text-meal-700">
            {averageNutrition.fat}
            <span className="text-sm font-normal text-muted-foreground ml-1">g</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <h3 className="font-medium">Items in your meal:</h3>
        {foodItems.map((item) => (
          <div key={item.id} className="flex justify-between p-3 bg-secondary rounded-lg">
            <span>{item.name}</span>
            <span className="text-muted-foreground">{item.nutrition.calories} kcal</span>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t">
        <Button 
          className="w-full" 
          variant="outline"
          onClick={onReset}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Analyze Another Meal
        </Button>
      </div>
    </div>
  );
};

export default NutritionDisplay;
