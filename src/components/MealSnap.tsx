
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader";
import NutritionDisplay from "./NutritionDisplay";
import FoodItemDisplay from "./FoodItemDisplay";
import { FoodItem } from "@/types/nutrition";
import { analyzeImage, getNutritionInfo } from "@/services/aiService";
import LoadingSpinner from "./LoadingSpinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Key, Info, AlertTriangle, Check, Circle } from "lucide-react"; // Replaced CheckCircle2 with Check or Circle
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

enum AppState {
  UPLOAD,
  ANALYZING,
  CONFIRMING_ITEMS,
  CALCULATING,
  RESULTS
}

const MealSnap = () => {
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
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Key size={14} />
            OpenRouter API Key
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 mb-3">
            <Info size={16} className="text-slate-500 mt-1 flex-shrink-0" />
            <p className="text-xs text-slate-600">
              Enter your OpenRouter API key for better food detection. Your key is only used in this session and not stored.
              <a 
                href="https://openrouter.ai/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 block hover:underline mt-1"
              >
                Get an API key
              </a>
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
            <Button size="sm" variant="default" onClick={saveApiKey}>
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderStep = () => {
    switch (appState) {
      case AppState.UPLOAD:
        return (
          <>
            <ImageUploader onImageSelect={handleImageSelect} />
            {hasErrored && (
              <div className="mt-4 p-3 border border-red-200 rounded-lg bg-red-50 flex items-start gap-2">
                <AlertTriangle size={16} className="text-red-500 mt-1 flex-shrink-0" />
                <p className="text-xs text-red-600">
                  There was an error analyzing your last image. Please try again or check your API key.
                </p>
              </div>
            )}
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

      case AppState.CONFIRMING_ITEMS:
        return (
          <>
            <FoodItemDisplay items={foodItems} onConfirm={handleItemsConfirmed} />
            {isMockData && (
              <div className="mt-4 p-3 border border-yellow-200 rounded-lg bg-yellow-50 flex items-start gap-2">
                <AlertTriangle size={16} className="text-yellow-500 mt-1 flex-shrink-0" />
                <p className="text-xs text-yellow-600">
                  This is sample data as no OpenRouter API key was found. For accurate food detection, please add an OpenRouter API key.
                  <Button
                    variant="link"
                    className="text-xs text-blue-600 p-0 h-auto"
                    onClick={() => {
                      resetApp();
                      setShowApiInput(true);
                    }}
                  >
                    Add API key
                  </Button>
                </p>
              </div>
            )}
          </>
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
        return (
          <>
            <NutritionDisplay foodItems={nutritionResults} onReset={resetApp} />
            {isMockData && (
              <div className="mt-4 p-3 border border-yellow-200 rounded-lg bg-yellow-50 flex items-start gap-2">
                <AlertTriangle size={16} className="text-yellow-500 mt-1 flex-shrink-0" />
                <p className="text-xs text-yellow-600">
                  This is sample data as no OpenRouter API key was found. For accurate food detection, please add an OpenRouter API key.
                </p>
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return <div className="w-full max-w-md mx-auto">{renderStep()}</div>;
};

export default MealSnap;
