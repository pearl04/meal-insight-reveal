
import React, { useRef, useEffect } from "react";
import { useMealSnapState, AppState } from "@/hooks/useMealSnapState";
import { saveMealLog } from "@/services/food/logService";
import AnalyzingState from "./meal-snap/AnalyzingState";
import CalculatingState from "./meal-snap/CalculatingState";
import NutritionDisplay from "./NutritionDisplay";
import TextInputModal from "./TextInputModal";
import { FoodItem, FoodWithNutrition } from "@/types/nutrition";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { MessageCircle } from "lucide-react";

const MealSnap = () => {
  const {
    appState,
    foodItems,
    nutritionResults,
    textInputOpen,
    handleTextAnalysis,
    openTextInput,
    closeTextInput,
    handleItemsConfirmed,
    resetApp,
  } = useMealSnapState();

  // 🔒 Prevent confirm from running multiple times
  const hasConfirmed = useRef(false);
  
  // Reset the hasConfirmed ref when app state changes
  useEffect(() => {
    if (appState !== AppState.CONFIRMING_ITEMS) {
      hasConfirmed.current = false;
    }
  }, [appState]);

  const handleNutritionConfirm = async (foodItems: FoodItem[]) => {
    try {
      await handleItemsConfirmed(foodItems);

      // Small delay to ensure nutritionResults is updated
      setTimeout(async () => {
        const itemsWithNutrition = nutritionResults.filter(
          (item): item is FoodWithNutrition => !!item.nutrition
        );

        if (itemsWithNutrition.length > 0) {
          await saveMealLog(foodItems, itemsWithNutrition);
          toast.success("Meal logged successfully");
        }
      }, 500);
    } catch (error) {
      console.error("❌ Error saving meal log:", error);
      toast.error("Failed to save meal log");
    }
  };

  const renderStep = () => {
    switch (appState) {
      case AppState.UPLOAD:
        return (
          <div className="bg-white rounded-xl border p-6 shadow-sm text-center">
            <h2 className="text-xl font-semibold mb-4">Enter Food Items to Analyze</h2>
            <p className="text-muted-foreground mb-6">
              Type in your meal items to get nutrition information and healthy suggestions.
            </p>
            <Button 
              className="bg-meal-500 hover:bg-meal-600 mx-auto"
              onClick={openTextInput}
            >
              <MessageCircle className="h-4 w-4 mr-2" /> Add Food to Analyse
            </Button>
          </div>
        );

      case AppState.ANALYZING:
        return <AnalyzingState />;

      case AppState.CONFIRMING_ITEMS:
        if (!hasConfirmed.current) {
          hasConfirmed.current = true;
          handleNutritionConfirm(foodItems);
        }
        return <CalculatingState />;

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
