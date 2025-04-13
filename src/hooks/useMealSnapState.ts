
import { useState } from "react";
import { FoodItem, FoodWithNutrition } from "@/types/nutrition";
import { analyzeText } from "@/services/food/analyzeService";
import { getNutritionInfo } from "@/services/food/nutritionService";
import { toast } from "sonner";

export enum AppState {
  UPLOAD,
  ANALYZING,
  CONFIRMING_ITEMS,
  CALCULATING,
  RESULTS
}

export const useMealSnapState = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [nutritionResults, setNutritionResults] = useState<FoodWithNutrition[]>([]);
  const [textInputOpen, setTextInputOpen] = useState(false);

  const handleTextAnalysis = async (text: string) => {
    setAppState(AppState.ANALYZING);
    
    try {
      const items = await analyzeText(text);
      setFoodItems(items);
      
      if (items.length > 0) {
        setAppState(AppState.CONFIRMING_ITEMS);
      } else {
        toast.error("No food items were detected in your text. Please try again.");
        resetApp();
      }
    } catch (error) {
      console.error("Text analysis error:", error);
      toast.error("We couldn't analyze your text. Please try again.");
      setAppState(AppState.UPLOAD);
    }
  };

  const handleItemsConfirmed = async (confirmedItems: FoodItem[]) => {
    if (confirmedItems.length === 0) {
      toast.error("Please select at least one food item to analyze");
      return;
    }
    
    setAppState(AppState.CALCULATING);
    
    try {
      const nutritionData = await getNutritionInfo(confirmedItems);
      setNutritionResults(nutritionData);
      setAppState(AppState.RESULTS);
    } catch (error) {
      console.error("Nutrition calculation error:", error);
      toast.error("We couldn't calculate nutrition information. Please try again.");
      setAppState(AppState.CONFIRMING_ITEMS);
    }
  };

  const openTextInput = () => {
    setTextInputOpen(true);
  };

  const closeTextInput = () => {
    setTextInputOpen(false);
  };

  const resetApp = () => {
    setAppState(AppState.UPLOAD);
    setFoodItems([]);
    setNutritionResults([]);
  };

  return {
    appState,
    foodItems,
    nutritionResults,
    textInputOpen,
    handleTextAnalysis,
    handleItemsConfirmed,
    openTextInput,
    closeTextInput,
    resetApp,
  };
};
