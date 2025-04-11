import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import ImageUploader from "./ImageUploader";
import NutritionDisplay from "./NutritionDisplay";
import { FoodItem, analyzeImage, getNutritionInfo } from "@/services/aiService";
import LoadingSpinner from "./LoadingSpinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Key, Info } from "lucide-react";

enum AppState {
  UPLOAD,
  ANALYZING,
  CALCULATING,
  RESULTS
}

const MealSnap = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [nutritionResults, setNutritionResults] = useState<FoodItem[]>([]);
  const [openRouterKey, setOpenRouterKey] = useState<string>("");
  const [showApiInput, setShowApiInput] = useState<boolean>(false);
  const { toast } = useToast();

  const handleImageSelect = async (file: File) => {
    setSelectedImage(file);
    setAppState(AppState.ANALYZING);

    try {
      const items = await analyzeImage(file, openRouterKey || undefined);

      setAppState(AppState.CALCULATING);
      const nutritionData = await getNutritionInfo(items);
      setNutritionResults(nutritionData);
      setAppState(AppState.RESULTS);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "We couldn't analyze your image. Please try again.",
      });
      setAppState(AppState.UPLOAD);
    }
  };

  const resetApp = () => {
    setSelectedImage(null);
    setNutritionResults([]);
    setAppState(AppState.UPLOAD);
  };

  const toggleApiInput = () => {
    setShowApiInput(!showApiInput);
  };

  const renderApiKeyInput = () => {
    if (!showApiInput) {
      return (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleApiInput}
            className="text-xs flex items-center gap-1"
          >
            <Key size={12} />
            Use OpenRouter AI
          </Button>
        </div>
      );
    }

    return (
      <div className="mt-4 p-3 border rounded-lg bg-slate-50">
        <div className="flex items-start gap-2 mb-2">
          <Info size={16} className="text-slate-500 mt-1 flex-shrink-0" />
          <p className="text-xs text-slate-600">
            Enter your OpenRouter API key for better food detection. Your key is only used in this session and not stored.
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            type="password"
            placeholder="OpenRouter API Key"
            value={openRouterKey}
            onChange={(e) => setOpenRouterKey(e.target.value)}
            className="text-sm"
          />
          <Button size="sm" variant="outline" onClick={toggleApiInput}>
            Done
          </Button>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (appState) {
      case AppState.UPLOAD:
        return (
          <>
            <ImageUploader onImageSelect={handleImageSelect} />
            {renderApiKeyInput()}
          </>
        );

      case AppState.ANALYZING:
        return (
          <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col items-center">
            <LoadingSpinner size="large" className="mb-4" />
            <h2 className="text-xl font-semibold mb-2">Analyzing your meal...</h2>
            <p className="text-muted-foreground text-center animate-pulse-opacity">
              {openRouterKey
                ? "Using OpenRouter AI to identify food items"
                : "Our AI is identifying the food items in your image"}
            </p>
          </div>
        );

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

  return <div className="w-full max-w-md mx-auto">{renderStep()}</div>;
};

export default MealSnap;
