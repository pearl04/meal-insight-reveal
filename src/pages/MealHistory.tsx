
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Json } from "@/integrations/supabase/types";

interface MealLog {
  id: string;
  created_at: string;
  food_items: Json;
  // Update the nutrition_summary type to accept the Json type from Supabase
  nutrition_summary: Json | {
    items?: {
      feedback?: string;
      rating?: string;
      healthy_swap?: string;
    }[];
  };
  mock_data?: boolean;
  user_id?: string;
}

export default function MealHistory() {
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMealLogs() {
      setIsLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      let userId = user?.id;
      
      // If not logged in, use local storage ID
      if (!userId) {
        const localId = localStorage.getItem('anonymousId');
        if (localId) {
          userId = localId;
          console.log("Using anonymous ID from localStorage:", localId);
        }
      }

      if (!userId) {
        console.log("No user ID found, showing empty meal history");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("meal_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(7);

      if (error) {
        console.error("Error fetching meal logs:", error);
      } else {
        // Cast the data to MealLog[] to ensure TypeScript is happy
        setMealLogs(data as MealLog[] || []);
      }
      
      setIsLoading(false);
    }

    fetchMealLogs();
  }, []);

  // Helper function to safely extract values from nutrition_summary
  const extractNutritionInfo = (log: MealLog, key: string, defaultValue: string = "N/A"): string => {
    // Check if it's the expected object structure
    if (typeof log.nutrition_summary === 'object' && 
        log.nutrition_summary !== null && 
        'items' in log.nutrition_summary && 
        Array.isArray(log.nutrition_summary.items) && 
        log.nutrition_summary.items.length > 0) {
      return log.nutrition_summary.items[0]?.[key as keyof typeof log.nutrition_summary.items[0]] || defaultValue;
    }
    
    // Try to access as generic JSON if it doesn't match our expected structure
    try {
      // @ts-ignore - we're intentionally being flexible here
      return log.nutrition_summary?.items?.[0]?.[key] || defaultValue;
    } catch {
      return defaultValue;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <button
        onClick={() => navigate("/")}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        ← Back to Home
      </button>
      <h1 className="text-2xl font-bold mb-6 text-center">My Meal History</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-green-600">
          <thead>
            <tr className="bg-green-600 text-white">
              <th className="border border-green-600 px-4 py-2">Date</th>
              <th className="border border-green-600 px-4 py-2">Time</th>
              <th className="border border-green-600 px-4 py-2">Meal</th>
              <th className="border border-green-600 px-4 py-2">Feedback</th>
              <th className="border border-green-600 px-4 py-2">Rating</th>
              <th className="border border-green-600 px-4 py-2">Swap Suggestion</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center p-8">
                  Loading your meal history...
                </td>
              </tr>
            ) : mealLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-muted-foreground">
                  No meal history yet. Start logging meals!
                </td>
              </tr>
            ) : (
              mealLogs.map((log) => {
                // Handle food_items as it might be a Json type now
                const mealName = Array.isArray(log.food_items) && log.food_items.length > 0 
                  ? log.food_items[0].name || log.food_items[0] 
                  : typeof log.food_items === 'object' && log.food_items !== null 
                    ? Array.isArray(log.food_items) 
                      ? log.food_items.map((item: any) => item.name || item).join(', ')
                      : JSON.stringify(log.food_items).slice(0, 30) + '...'
                    : typeof log.food_items === 'string'
                      ? log.food_items
                      : "N/A";
                    
                // Use our helper function to safely extract values
                const feedback = extractNutritionInfo(log, 'feedback');
                const rating = extractNutritionInfo(log, 'rating');
                const swapSuggestion = extractNutritionInfo(log, 'healthy_swap');
                
                const dateObj = new Date(log.created_at);

                return (
                  <tr key={log.id} className="border-b border-green-200">
                    <td className="border border-green-600 px-4 py-2">
                      {dateObj.toLocaleDateString()}
                    </td>
                    <td className="border border-green-600 px-4 py-2">
                      {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="border border-green-600 px-4 py-2">{String(mealName)}</td>
                    <td className="border border-green-600 px-4 py-2">{feedback}</td>
                    <td className="border border-green-600 px-4 py-2">{rating}</td>
                    <td className="border border-green-600 px-4 py-2">{swapSuggestion}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
