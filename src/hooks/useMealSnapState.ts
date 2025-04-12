
import { useState } from "react";
import { FoodItem, FoodWithNutrition } from "@/types/nutrition";
import { analyzeText, analyzeImage, getNutritionInfo, saveMealLog } from "@/services/aiService";
import { toast as uiToast } from "@/hooks/use-toast";

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
  const [hasErrored, setHasErrored] = useState(false);
  const [isMockData, setIsMockData] = useState(false);
  const [textInputOpen, setTextInputOpen] = useState(false);

  const handleTextAnalysis = async (text: string) => {
    setAppState(AppState.ANALYZING);
    setHasErrored(false);
    setIsMockData(false);
    
    try {
      const items = await analyzeText(text);
      setFoodItems(items);
      
      if (items.length > 0) {
        setAppState(AppState.CONFIRMING_ITEMS);
      } else {
        uiToast({
          variant: "destructive",
          title: "No food items",
          description: "No food items were detected in the text",
        });
        resetApp();
      }
    } catch (error) {
      console.error("Text analysis error:", error);
      setHasErrored(true);
      uiToast({
        variant: "destructive",
        title: "Analysis failed",
        description: "We couldn't analyze your text. Please try again.",
      });
      setAppState(AppState.UPLOAD);
    }
  };

  const handleImageSelect = async (file: File) => {
    setAppState(AppState.ANALYZING);
    setHasErrored(false);
    setIsMockData(false);
    
    try {
      const items = await analyzeImage(file);
      setFoodItems(items);
      
      if (items.length > 0) {
        setAppState(AppState.CONFIRMING_ITEMS);
      } else {
        uiToast({
          variant: "destructive",
          title: "No food items",
          description: "No food items were detected in the image",
        });
        resetApp();
      }
    } catch (error) {
      console.error("Image analysis error:", error);
      setHasErrored(true);
      uiToast({
        variant: "destructive",
        title: "Analysis failed",
        description: "We couldn't analyze your image. Please try again.",
      });
      setAppState(AppState.UPLOAD);
    }
  };

  const handleItemsConfirmed = async (confirmedItems: FoodItem[]) => {
    if (confirmedItems.length === 0) {
      uiToast({
        variant: "destructive",
        title: "No food items",
        description: "Please select at least one food item to analyze",
      });
      return;
    }
    
    setAppState(AppState.CALCULATING);
    
    try {
      const nutritionData = await getNutritionInfo(confirmedItems);
      setNutritionResults(nutritionData);
      setAppState(AppState.RESULTS);
    } catch (error) {
      console.error("Nutrition calculation error:", error);
      uiToast({
        variant: "destructive",
        title: "Calculation failed",
        description: "We couldn't calculate nutrition information. Please try again.",
      });
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
    setHasErrored(false);
  };

  return {
    appState,
    foodItems,
    nutritionResults,
    hasErrored,
    isMockData,
    textInputOpen,
    handleImageSelect,
    handleTextAnalysis,
    handleItemsConfirmed,
    openTextInput,
    closeTextInput,
    resetApp,
  };
};
