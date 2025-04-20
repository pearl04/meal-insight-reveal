
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Json } from "@/integrations/supabase/types";
import { getAnonUserId, isAnonUser } from "@/lib/getAnonUserId";
import { toast } from "sonner";

interface MealLog {
  id: string;
  created_at: string;
  food_items: Json;
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
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMealLogs() {
      setIsLoading(true);
      
      try {
        // First, check for authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        // Initialize the currentUserId to null
        let currentUserId = null;
        let isAnon = false;
        
        if (user?.id) {
          currentUserId = user.id;
          console.log("Using authenticated user ID:", currentUserId);
        } else {
          // If not logged in, use anonymous ID from localStorage (clean format)
          currentUserId = getAnonUserId();
          isAnon = true;
          console.log("Using anonymous ID:", currentUserId);
        }

        setUserId(currentUserId);

        if (!currentUserId) {
          console.log("No user ID found, showing empty meal history");
          setIsLoading(false);
          return;
        }

        // For debugging - try to get ALL logs first to see what's actually in the database
        const { data: allLogs, error: allLogsError } = await supabase
          .from("meal_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
          
        console.log(`DEBUG: Found ${allLogs?.length || 0} total logs in database:`, allLogs);
        
        if (allLogsError) {
          console.error("Error fetching all logs:", allLogsError);
        }

        // Now fetch the specific user's logs
        console.log(`Fetching meal logs for user: ${currentUserId}`);
        
        // Build query based on user type
        let query;
        if (isAnon) {
          // For anonymous users, try to find by the clean ID or prefixed ID in localStorage
          const anonStoredId = localStorage.getItem("anon_user_id");
          console.log("Looking for anonymous logs with stored ID:", anonStoredId);
          
          // Look for logs where user_id is either the clean ID or the prefixed version
          query = supabase
            .from("meal_logs")
            .select("*")
            .eq("mock_data", true)
            .or(`user_id.eq.${currentUserId},user_id.eq.anon_${currentUserId}`);
            
          if (anonStoredId && anonStoredId !== `anon_${currentUserId}`) {
            // Also try with the stored ID without anon_ prefix
            const cleanStoredId = anonStoredId.replace("anon_", "");
            console.log("Also trying with stored ID (no prefix):", cleanStoredId);
            query = query.or(`user_id.eq.${cleanStoredId}`);
          }
        } else {
          // For authenticated users, query is simpler
          query = supabase
            .from("meal_logs")
            .select("*")
            .eq("user_id", currentUserId);
        }
        
        // Add ordering and limit
        const { data, error } = await query
          .order("created_at", { ascending: false })
          .limit(15);

        if (error) {
          console.error("Error fetching meal logs:", error);
          toast.error("Failed to load meal history");
        } else {
          console.log(`Received ${data?.length || 0} meal logs:`, data);
          setMealLogs(data as MealLog[] || []);
        }
      } catch (err) {
        console.error("Unexpected error fetching meal logs:", err);
        toast.error("An error occurred while loading meal history");
      } finally {
        setIsLoading(false);
      }
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

  // Helper function to safely extract meal name from food_items
  const extractMealName = (foodItems: Json): string => {
    // If foodItems is an array
    if (Array.isArray(foodItems) && foodItems.length > 0) {
      // Check if the first item has a name property
      if (typeof foodItems[0] === 'object' && foodItems[0] !== null && 'name' in foodItems[0]) {
        return String(foodItems[0].name);
      }
      // If the first item is a string
      else if (typeof foodItems[0] === 'string') {
        return foodItems[0];
      }
    } 
    // If foodItems is an object with names
    else if (typeof foodItems === 'object' && foodItems !== null) {
      // Try to access a name property
      // @ts-ignore - we're being flexible to handle potential structures
      if ('name' in foodItems) return String(foodItems.name);
      
      // If it's an object but no direct name, try to stringify a portion
      return JSON.stringify(foodItems).slice(0, 30) + '...';
    }
    
    // Fallback for strings or unknown formats
    return typeof foodItems === 'string' ? foodItems : "N/A";
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

      {userId && (
        <div className="text-sm mb-4 text-center text-muted-foreground">
          {isAnonUser(userId) ? 
            'Viewing as anonymous user. Sign in to save your history across devices.' :
            'Viewing as authenticated user'
          }
        </div>
      )}

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
                const mealName = extractMealName(log.food_items);
                    
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
                    <td className="border border-green-600 px-4 py-2">{mealName}</td>
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
