
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import ImageUploader from "./ImageUploader";
import FoodItemEditor, { FoodItem } from "./FoodItemEditor";
import NutritionDisplay, { FoodWithNutrition } from "./NutritionDisplay";
import { analyzeImage, getNutritionInfo } from "@/services/aiService";
import LoadingSpinner from "./LoadingSpinner";

enum AppState {
  UPLOAD,
  ANALYZING,
  EDIT,
  CALCULATING,
  RESULTS
}

const MealSnap = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [detectedItems, setDetectedItems] = useState<FoodItem[]>([]);
  const [nutritionResults, setNutritionResults] = useState<FoodWithNutrition[]>([]);
  const { toast } = useToast();

  const handleImageSelect = async (file: File) => {
    setSelectedImage(file);
    setAppState(AppState.ANALYZING);
    
    try {
      const items = await analyzeImage(file);
      setDetectedItems(items);
      setAppState(AppState.EDIT);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "We couldn't analyze your image. Please try again.",
      });
      setAppState(AppState.UPLOAD);
    }
  };

  const handleConfirmItems = async (confirmedItems: FoodItem[]) => {
    if (confirmedItems.length === 0) {
      toast({
        variant: "destructive",
        title: "No food items",
        description: "Please add at least one food item to analyze.",
      });
      return;
    }

    setAppState(AppState.CALCULATING);
    
    try {
      const nutritionData = await getNutritionInfo(confirmedItems);
      setNutritionResults(nutritionData);
      setAppState(AppState.RESULTS);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Calculation failed",
        description: "We couldn't calculate nutrition information. Please try again.",
      });
      setAppState(AppState.EDIT);
    }
  };

  const resetApp = () => {
    setSelectedImage(null);
    setDetectedItems([]);
    setNutritionResults([]);
    setAppState(AppState.UPLOAD);
  };

  const renderStep = () => {
    switch (appState) {
      case AppState.UPLOAD:
        return <ImageUploader onImageSelect={handleImageSelect} />;
        
      case AppState.ANALYZING:
        return (
          <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col items-center">
            <LoadingSpinner size="large" className="mb-4" />
            <h2 className="text-xl font-semibold mb-2">Analyzing your meal...</h2>
            <p className="text-muted-foreground text-center animate-pulse-opacity">
              Our AI is identifying the food items in your image
            </p>
          </div>
        );
        
      case AppState.EDIT:
        return <FoodItemEditor detectedItems={detectedItems} onConfirm={handleConfirmItems} />;
        
      case AppState.CALCULATING:
        return (
          <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col items-center">
            <LoadingSpinner size="large" className="mb-4" />
            <h2 className="text-xl font-semibold mb-2">Calculating nutrition info...</h2>
            <p className="text-muted-foreground text-center animate-pulse-opacity">
              Getting nutrition details for your meal
            </p>
          </div>
        );
        
      case AppState.RESULTS:
        return <NutritionDisplay foodItems={nutritionResults} onReset={resetApp} />;
        
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {renderStep()}
    </div>
  );
};

export default MealSnap;
