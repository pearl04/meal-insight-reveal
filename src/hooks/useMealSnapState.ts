
import { useState } from "react";
import { FoodItem } from "@/types/nutrition";
import { analyzeImage, analyzeText, getNutritionInfo } from "@/services/aiService";
import { useToast } from "@/components/ui/use-toast";
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]); 
  const [nutritionResults, setNutritionResults] = useState<FoodItem[]>([]);
  const [hasErrored, setHasErrored] = useState<boolean>(false);
  const [isMockData, setIsMockData] = useState<boolean>(false);
  const [textInputOpen, setTextInputOpen] = useState<boolean>(false);
  const { toast: uiToast } = useToast();

  const handleImageSelect = async (file: File) => {
    setSelectedImage(file);
    setAppState(AppState.ANALYZING);
    setHasErrored(false);
    setIsMockData(false);

    try {
      const items = await analyzeImage(file);
      setFoodItems(items);

      if (items.length > 0) {
        setAppState(AppState.CONFIRMING_ITEMS);
      } else {
        toast.error("No food items were detected in the image");
        resetApp();
      }
    } catch (error) {
      console.error("Analysis error:", error);
      setHasErrored(true);
      uiToast({
        variant: "destructive",
        title: "Analysis failed",
        description: "We couldn't analyze your image. Please try again.",
      });
      setAppState(AppState.UPLOAD);
    }
  };

  const handleTextAnalysis = (text: string) => {
    setAppState(AppState.ANALYZING);
    setHasErrored(false);
    setIsMockData(false);
    
    try {
      const items = analyzeText(text);
      setFoodItems(items);
      
      if (items.length > 0) {
        setAppState(AppState.CONFIRMING_ITEMS);
      } else {
        toast.error("No food items were detected in the text");
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

  const openTextInput = () => {
    setTextInputOpen(true);
  };

  const closeTextInput = () => {
    setTextInputOpen(false);
  };

  const handleItemsConfirmed = async (confirmedItems: FoodItem[]) => {
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
      setAppState(AppState.UPLOAD);
    }
  };

  const resetApp = () => {
    setSelectedImage(null);
    setFoodItems([]);
    setNutritionResults([]);
    setIsMockData(false);
    setTextInputOpen(false);
    setAppState(AppState.UPLOAD);
  };

  return {
    appState,
    selectedImage,
    foodItems,
    nutritionResults,
    hasErrored,
    isMockData,
    textInputOpen,
    handleImageSelect,
    handleTextAnalysis,
    openTextInput,
    closeTextInput,
    handleItemsConfirmed,
    resetApp,
  };
};
