
import { useState } from "react";
import { FoodItem } from "@/types/nutrition";
import { analyzeImage, getNutritionInfo } from "@/services/aiService";
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
  const [openRouterKey, setOpenRouterKey] = useState<string>("");
  const [showApiInput, setShowApiInput] = useState<boolean>(false);
  const [hasErrored, setHasErrored] = useState<boolean>(false);
  const [isMockData, setIsMockData] = useState<boolean>(false);
  const { toast: uiToast } = useToast();

  const handleImageSelect = async (file: File) => {
    setSelectedImage(file);
    setAppState(AppState.ANALYZING);
    setHasErrored(false);
    setIsMockData(false);

    try {
      console.log("Analyzing image with API key:", openRouterKey ? "Provided" : "Not provided");
      const items = await analyzeImage(file, openRouterKey || undefined);
      setFoodItems(items);

      // Check if this is mock data
      if (!openRouterKey && !import.meta.env.VITE_OPENROUTER_API_KEY) {
        console.log("Using mock data as no API key is available");
        setIsMockData(true);
      }

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
        description: "We couldn't analyze your image. Please try again or check your API key.",
      });
      setAppState(AppState.UPLOAD);
    }
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
    setAppState(AppState.UPLOAD);
  };

  const toggleApiInput = () => {
    setShowApiInput(!showApiInput);
  };

  const saveApiKey = () => {
    if (openRouterKey.trim()) {
      toast.success("API key saved for this session");
    }
    setShowApiInput(false);
  };

  return {
    appState,
    selectedImage,
    foodItems,
    nutritionResults,
    openRouterKey,
    showApiInput,
    hasErrored,
    isMockData,
    setOpenRouterKey,
    handleImageSelect,
    handleItemsConfirmed,
    resetApp,
    toggleApiInput,
    saveApiKey,
    setShowApiInput
  };
};
