
import React from "react";
import { useMealSnapState, AppState } from "@/hooks/useMealSnapState";
import { saveMealLog } from "@/services/food/logService";
import UploadState from "./meal-snap/UploadState";
import AnalyzingState from "./meal-snap/AnalyzingState";
import CalculatingState from "./meal-snap/CalculatingState";
import FoodItemDisplay from "./FoodItemDisplay";
import NutritionDisplay from "./NutritionDisplay";
import TextInputModal from "./TextInputModal";
import { FoodItem, FoodWithNutrition } from "@/types/nutrition";
import { toast } from "sonner";

const MealSnap = () => {
  const {
    appState,
    foodItems,
    nutritionResults,
    hasErrored,
    textInputOpen,
    handleImageSelect,
    handleTextAnalysis,
    openTextInput,
    closeTextInput,
    handleItemsConfirmed,
    resetApp,
  } = useMealSnapState();

  const handleNutritionConfirm = async (foodItems: FoodItem[]) => {
    try {
      // Get the nutrition data by confirming items
      await handleItemsConfirmed(foodItems);
      
      // Wait for nutrition results to be calculated
      setTimeout(async () => {
        // Make sure we're only sending items that have complete nutrition information
        const itemsWithNutrition = nutritionResults.filter(
          (item): item is FoodWithNutrition => !!item.nutrition
        );
        
        if (itemsWithNutrition.length > 0) {
          await saveMealLog(foodItems, itemsWithNutrition);
          toast.success("Meal logged successfully");
        }
      }, 500); // Small delay to ensure nutritionResults is updated
    } catch (error) {
      console.error("Error saving meal log:", error);
      toast.error("Failed to save meal log");
    }
  };

  const renderStep = () => {
    switch (appState) {
      case AppState.UPLOAD:
        return (
          <UploadState
            onImageSelect={handleImageSelect}
            onTextAnalysisClick={openTextInput}
            hasErrored={hasErrored}
          />
        );

      case AppState.ANALYZING:
        return <AnalyzingState usingCustomApiKey={false} />;

      case AppState.CONFIRMING_ITEMS:
        return (
          <FoodItemDisplay 
            items={foodItems} 
            onConfirm={handleNutritionConfirm} 
          />
        );

      case AppState.CALCULATING:
        return <CalculatingState />;

      case AppState.RESULTS:
        return (
          <NutritionDisplay 
            foodItems={nutritionResults} 
            onReset={resetApp} 
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {renderStep()}
      <TextInputModal 
        open={textInputOpen} 
        onClose={closeTextInput} 
        onSubmit={handleTextAnalysis} 
      />
    </div>
  );
};

export default MealSnap;
