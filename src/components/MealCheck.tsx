
import React, { useRef, useEffect, useState } from "react";
import { useMealCheckState, AppState } from "../hooks/useMealCheckState";
import { saveMealLog } from "@/services/food/logService";
import { supabase } from "@/integrations/supabase/client";
import AnalyzingState from "./meal-check/AnalyzingState";
import CalculatingState from "./meal-check/CalculatingState";
import NutritionDisplay from "./NutritionDisplay";
import { FoodItem, FoodWithNutrition } from "@/types/nutrition";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { MessageCircle } from "lucide-react";

const MealCheck = () => {
  const {
    appState,
    foodItems,
    nutritionResults,
    handleTextAnalysis,
    handleItemsConfirmed,
    resetApp,
  } = useMealCheckState();

  const [inputText, setInputText] = useState("");
  const hasConfirmed = useRef(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (appState !== AppState.CONFIRMING_ITEMS) {
      hasConfirmed.current = false;
    }
  }, [appState]);

  // Helper function to check if an item has valid nutrition data
  const hasValidNutrition = (item: FoodItem): boolean => {
    return !!item.nutrition && 
      typeof item.nutrition === 'object' &&
      'calories' in item.nutrition &&
      'protein' in item.nutrition &&
      'carbs' in item.nutrition &&
      'fat' in item.nutrition;
  };

  const handleNutritionConfirm = async (foodItems: FoodItem[]) => {
    if (hasConfirmed.current) {
      console.log("Already confirmed, skipping duplicate save");
      return;
    }
    
    try {
      console.log("🔄 Beginning confirmation process for food items:", foodItems);
      console.log("Current nutrition results:", JSON.stringify(nutritionResults));
      setIsSaving(true);
      hasConfirmed.current = true;
      await handleItemsConfirmed(foodItems);

      // Explicitly filter items that have valid nutrition data
      const itemsWithNutrition = nutritionResults.filter(
        (item): item is FoodWithNutrition => hasValidNutrition(item)
      );

      console.log(`Found ${itemsWithNutrition.length} items with valid nutrition data out of ${nutritionResults.length}`);
      
      if (itemsWithNutrition.length === 0) {
        console.warn("⚠️ No items with valid nutrition data to save");
        toast.warning("No nutritional data available to save");
        return;
      }

      console.log("Checking authentication status...");
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error checking authentication:", userError);
        toast.error("Authentication error, saving as anonymous");
      }

      // Deep copy to prevent mutation issues - use JSON stringify/parse for complete deep copy
      const foodItemsCopy = JSON.parse(JSON.stringify(foodItems));
      const nutritionItemsCopy = JSON.parse(JSON.stringify(itemsWithNutrition));
      
      console.log("🔍 BEFORE SAVE - Food items:", JSON.stringify(foodItemsCopy));
      console.log("🔍 BEFORE SAVE - Nutrition items:", JSON.stringify(nutritionItemsCopy));

      if (!user) {
        console.log("No authenticated user found, using anonymous ID");
        toast.info("Saving meal as anonymous user");
        await saveMealLog(foodItemsCopy, nutritionItemsCopy);
      } else {
        console.log("📦 Saving meal log for user id:", user.id);
        toast.info("Saving meal to your account");
        await saveMealLog(foodItemsCopy, nutritionItemsCopy, user.id);
      }
      
      // Additional debug to verify meal was logged
      console.log("Meal saving process completed");
    } catch (error) {
      console.error("❌ Error saving meal log:", error);
      toast.error("Failed to save meal log");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (appState === AppState.CONFIRMING_ITEMS && !hasConfirmed.current) {
      console.log("Auto-confirming nutrition items in CONFIRMING_ITEMS state");
      handleNutritionConfirm(foodItems);
    }
  }, [appState, foodItems]);

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
