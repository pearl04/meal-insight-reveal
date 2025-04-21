import React, { useRef, useEffect, useState } from "react";
import { useMealCheckState, AppState } from "../hooks/useMealCheckState";
import { saveMealLog } from "@/services/food/logService";
import { supabase } from "@/lib/supabaseClient";
import AnalyzingState from "./meal-check/AnalyzingState";
import CalculatingState from "./meal-check/CalculatingState";
import NutritionDisplay from "./NutritionDisplay";
import { FoodItem, FoodWithNutrition } from "@/types/nutrition";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { MessageCircle } from "lucide-react";

const MealCheck: React.FC = () => {
  const {
    appState,
    foodItems,
    nutritionResults,
    handleTextAnalysis,
    handleItemsConfirmed,
    resetApp,
  } = useMealCheckState();

  const [inputText, setInputText] = useState("");
  const hasSavedRef = useRef(false);

  useEffect(() => {
    if (appState === AppState.CONFIRMING_ITEMS && !hasSavedRef.current) {
      hasSavedRef.current = true;

      (async () => {
        try {
          console.log("⚡ Starting handleItemsConfirmed...");
          await handleItemsConfirmed(foodItems);

          console.log("⚡ Rebuilding valid items after confirmation...");
          const enrichedItems = foodItems.filter(
            (item): item is FoodWithNutrition =>
              !!item.nutrition &&
              typeof item.nutrition === "object" &&
              "calories" in item.nutrition &&
              "protein" in item.nutrition &&
              "carbs" in item.nutrition &&
              "fat" in item.nutrition
          );

          if (enrichedItems.length === 0) {
            console.warn("⚠️ No valid enriched food items to save");
            return;
          }

          const {
            data: { user },
            error: userErr,
          } = await supabase.auth.getUser();

          if (userErr || !user) {
            toast.error("You must be signed in to save your meals");
            return;
          }

          console.log("🍱 Saving meal log for user:", user.id);
          await saveMealLog(foodItems, enrichedItems, user.id);
          toast.success("Meal logged successfully!");

        } catch (err) {
          console.error("❌ Error during saveMealLog:", err);
          toast.error("Failed to save meal log");
        }
      })();
    }

    if (appState !== AppState.CONFIRMING_ITEMS) {
      hasSavedRef.current = false;
    }
  }, [appState, foodItems, handleItemsConfirmed]);

  const renderStep = () => {
    switch (appState) {
      case AppState.UPLOAD:
        return (
          <div className="bg-white rounded-xl border p-6 shadow-sm text-center">
            <h2 className="text-xl font-semibold mb-4">Enter Food Items to Analyze</h2>
            <p className="text-muted-foreground mb-6">
              Type in your meal items to get nutrition information and healthy suggestions.
            </p>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g., apple, grilled chicken, brown rice"
              className="w-full p-4 border border-green-400 rounded-md mb-4"
              rows={4}
            />
            <Button
              className="bg-meal-500 hover:bg-meal-600"
              onClick={() => handleTextAnalysis(inputText)}
            >
              <MessageCircle className="h-4 w-4 mr-2" /> Analyze Food Items
            </Button>
          </div>
        );

      case AppState.ANALYZING:
        return <AnalyzingState />;

      case AppState.CONFIRMING_ITEMS:
      case AppState.CALCULATING:
        return <CalculatingState />;

      case AppState.RESULTS:
        return <NutritionDisplay foodItems={nutritionResults} onReset={resetApp} />;

      default:
        return null;
    }
  };

  return <div className="w-full max-w-md mx-auto">{renderStep()}</div>;
};

export default MealCheck;
