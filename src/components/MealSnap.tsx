import React, { useRef } from "react";
import { useMealSnapState, AppState } from "@/hooks/useMealSnapState";
import { saveMealLog } from "@/services/food/logService";
import UploadState from "./meal-snap/UploadState";
import AnalyzingState from "./meal-snap/AnalyzingState";
import CalculatingState from "./meal-snap/CalculatingState";
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

  // 🔒 Prevent confirm from running multiple times
  const hasConfirmed = useRef(false);

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
          <UploadState
            onImageSelect={handleImageSelect}
            onTextAnalysisClick={openTextInput}
            hasErrored={hasErrored}
          />
        );

      case AppState.ANALYZING:
        return <AnalyzingState isTextAnalysis={textInputOpen} />;

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
