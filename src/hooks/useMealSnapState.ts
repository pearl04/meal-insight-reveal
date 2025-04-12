
const handleTextAnalysis = async (text: string) => {
  setAppState(AppState.ANALYZING);
  setHasErrored(false);
  setIsMockData(false);
  
  try {
    const items = await analyzeText(text);
    setFoodItems(items);
    
    if (items.length > 0) {
      setAppState(AppState.CONFIRMING_ITEMS);
    } else {
      toast.error("No food items were detected in the text");
      resetApp();
    }
  } catch (error) {
    console.error("Text analysis error:", error);
    setHasErrored(true);
    uiToast({
      variant: "destructive",
      title: "Analysis failed",
      description: "We couldn't analyze your text. Please try again.",
    });
    setAppState(AppState.UPLOAD);
  }
};
