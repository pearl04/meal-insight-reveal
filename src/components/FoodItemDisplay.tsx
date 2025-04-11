
import React from "react";
import { FoodItem } from "@/types/nutrition";

interface Props {
  items: FoodItem[];
  onConfirm: (confirmedItems: FoodItem[]) => void;
}

const FoodItemDisplay = ({ items, onConfirm }: Props) => {
  return (
    <div className="w-full bg-white rounded-xl border p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">We detected these food items:</h2>

      <div className="space-y-4 mb-6">
        {items.map(item => (
          <div key={item.id} className="p-4 border rounded-md bg-gray-50">
            <div className="font-medium text-lg mb-2">{item.name}</div>
            {item.nutrition && (
              <ul className="text-sm text-gray-700 mb-2">
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

      <button 
        className="w-full bg-meal-500 hover:bg-meal-600 text-white px-4 py-2 rounded"
        onClick={() => onConfirm(items)}
      >
        Confirm Items
      </button>
    </div>
  );
};

export default FoodItemDisplay;
