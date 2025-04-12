
export const analyzeText = async (text: string): Promise<FoodItem[]> => {
  try {
    const { data, error } = await supabase.functions.invoke("get-nutrition", {
      body: JSON.stringify({
        text: text,
        pro: false  // You can adjust this based on user's pro status if needed
      }),
    });

    if (error) {
      throw new Error("Supabase function failed for text analysis");
    }

    console.log("📦 Supabase Edge Function text response:", data);

    if (!Array.isArray(data)) {
      throw new Error("Invalid text AI response format");
    }

    return data.map((item) => ({
      id: item.id || `food-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: item.name,
      nutrition: item.nutrition,
      healthy_swap: item.healthy_swap,
      rating: item.rating,
    }));
  } catch (err) {
    console.error("❌ analyzeText failed:", err);
    return mockAnalyzeImage();
  }
};
