
import React from "react";
import { useMealSnapState, AppState } from "@/hooks/useMealSnapState";
import { saveMealLog } from "@/services/aiService";
import UploadState from "./meal-snap/UploadState";
import AnalyzingState from "./meal-snap/AnalyzingState";
import CalculatingState from "./meal-snap/CalculatingState";
import FoodItemDisplay from "./FoodItemDisplay";
import NutritionDisplay from "./NutritionDisplay";
import MockDataAlert from "./meal-snap/MockDataAlert";
import { FoodItem, FoodWithNutrition } from "@/types/nutrition";

const MealSnap = () => {
  const {
    appState,
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
  } = useMealSnapState();

  const handleNutritionConfirm = async (foodItems: FoodItem[]) => {
    try {
      // Get the nutrition data by confirming items
      await handleItemsConfirmed(foodItems);
      
      // Then save the meal log with the nutrition results after they've been calculated
      // We can access the results from the state since handleItemsConfirmed updates it
      // Make sure we're only sending items that have complete nutrition information
      const itemsWithNutrition = nutritionResults.filter(
        (item): item is FoodWithNutrition => !!item.nutrition
      );
      
      await saveMealLog(foodItems, itemsWithNutrition, isMockData);
    } catch (error) {
      console.error("Error saving meal log:", error);
    }
  };

  const renderStep = () => {
    switch (appState) {
      case AppState.UPLOAD:
        return (
          <UploadState
            onImageSelect={handleImageSelect}
            hasErrored={hasErrored}
            showApiInput={showApiInput}
            toggleApiInput={toggleApiInput}
            openRouterKey={openRouterKey}
            setOpenRouterKey={setOpenRouterKey}
            saveApiKey={saveApiKey}
            setShowApiInput={setShowApiInput}
          />
        );

      case AppState.ANALYZING:
        return <AnalyzingState usingCustomApiKey={!!openRouterKey} />;

      case AppState.CONFIRMING_ITEMS:
        return (
          <>
            <FoodItemDisplay items={foodItems} onConfirm={handleNutritionConfirm} />
            {isMockData && <MockDataAlert resetApp={resetApp} setShowApiInput={setShowApiInput} />}
          </>
        );

      case AppState.CALCULATING:
        return <CalculatingState />;

      case AppState.RESULTS:
        return (
          <>
            <NutritionDisplay foodItems={nutritionResults} onReset={resetApp} />
            {isMockData && <MockDataAlert />}
          </>
        );

      default:
        return null;
    }
  };

  return <div className="w-full max-w-md mx-auto">{renderStep()}</div>;
};

export default MealSnap;
