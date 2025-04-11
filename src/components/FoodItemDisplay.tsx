
import React from "react";
import { FoodItem } from "@/types/nutrition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  items: FoodItem[];
  onConfirm: (confirmedItems: FoodItem[]) => void;
}

const FoodItemDisplay = ({ items, onConfirm }: Props) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">We detected these food items:</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4 mb-6">
          {items.map(item => (
            <div key={item.id} className="p-4 border rounded-md bg-gray-50">
              <div className="font-medium text-lg mb-2">{item.name}</div>
              {item.nutrition && (
                <ul className="text-sm text-gray-700 mb-2 grid grid-cols-2 gap-x-3">
                  <li>Calories: {item.nutrition.calories}</li>
                  <li>Protein: {item.nutrition.protein}g</li>
                  <li>Carbs: {item.nutrition.carbs}g</li>
                  <li>Fat: {item.nutrition.fat}g</li>
                </ul>
              )}
              {item.healthy_swap && (
                <p className="text-sm text-green-700 italic">💡 Swap: {item.healthy_swap}</p>
              )}
              {item.rating && (
                <p className="text-sm text-yellow-700">⭐️ Rating: {item.rating}/10</p>
              )}
            </div>
          ))}
        </div>

        <Button 
          className="w-full bg-meal-500 hover:bg-meal-600 text-white"
          onClick={() => onConfirm(items)}
        >
          Confirm Items
        </Button>
      </CardContent>
    </Card>
  );
};

export default FoodItemDisplay;
