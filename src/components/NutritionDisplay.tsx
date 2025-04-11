
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info } from "lucide-react";
import { FoodItem } from "@/types/nutrition";

interface NutritionDisplayProps {
  foodItems: FoodItem[];
  onReset: () => void;
}

const NutritionDisplay = ({ foodItems, onReset }: NutritionDisplayProps) => {
  return (
    <div className="w-full bg-white rounded-xl border p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-2">Nutrition Analysis</h2>
      <p className="text-sm text-muted-foreground mb-6 flex items-center">
        <Info className="h-4 w-4 mr-1" /> Per item based on AI estimation
      </p>

      <div className="space-y-4 mb-6">
        {foodItems.map((item) => (
          <div key={item.id} className="p-4 bg-secondary rounded-lg space-y-2">
            <div className="font-medium text-meal-700">{item.name}</div>

            {item.nutrition ? (
              <div className="text-sm text-muted-foreground grid grid-cols-2 gap-3">
                <div>Calories: {item.nutrition.calories} kcal</div>
                <div>Protein: {item.nutrition.protein} g</div>
                <div>Carbs: {item.nutrition.carbs} g</div>
                <div>Fat: {item.nutrition.fat} g</div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No nutrition data found</div>
            )}

            {item.rating && (
              <div className="text-sm text-yellow-700">Rating: {item.rating}/10</div>
            )}
            {item.healthy_swap && (
              <div className="text-sm text-green-700">
                💡 Swap Suggestion: {item.healthy_swap}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-4 border-t">
        <Button className="w-full" variant="outline" onClick={onReset}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Analyze Another Meal
        </Button>
      </div>
    </div>
  );
};

export default NutritionDisplay;
