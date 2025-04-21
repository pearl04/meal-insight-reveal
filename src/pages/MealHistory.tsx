
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Json, Database } from "@/integrations/supabase/types";
import { getAnonUserId, isAnonUser } from "@/lib/getAnonUserId";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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

type TestMealLogAccess = boolean | null;

export default function MealHistory() {
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMealLogs() {
      console.log("==========================================");
      console.log("🔍 MealHistory: Starting fetch meal logs process");
      setIsLoading(true);
      
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        let currentUserId: string | null = null;
        let anonUserId: string | null = null;
        
        if (user?.id) {
          currentUserId = user.id;
          setIsAnonymous(false);
          console.log("✅ AUTHENTICATED user with ID:", currentUserId);
        } else {
          anonUserId = getAnonUserId();
          currentUserId = anonUserId;
          setIsAnonymous(true);
          console.log("👤 ANONYMOUS user with ID:", anonUserId);
        }

        setUserId(currentUserId);

        if (!currentUserId) {
          console.log("❌ No user ID found, showing empty meal history");
          setIsLoading(false);
          return;
        }

        console.log("🔑 Testing RLS permissions...");
        // Fix: Add the second type parameter (empty object) for input parameters
        const { data: permissionTest, error: permissionError } = await supabase.rpc<TestMealLogAccess, {}>('test_meal_log_access');
        console.log("Permission test result:", permissionTest);
        if (permissionError) {
          console.error("RLS permission test error:", permissionError);
        }

        console.log("-------- DEBUGGING CRITICAL --------");
        const { data: allLogs } = await supabase
          .from('meal_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
          
        console.log(`DEBUG: Found ${allLogs?.length || 0} total logs in database:`, allLogs);

        if (allLogs && allLogs.length > 0) {
          console.log("Available user IDs in database:", allLogs.map(log => log.user_id));
        }
        
        console.log(`Current user ID (${isAnonymous ? 'anon' : 'auth'}):"${currentUserId}"`);
        
        let logs: MealLog[] = [];
        
        if (user?.id) {
          console.log("Fetching meal logs for authenticated user:", user.id);
          console.log("SQL equivalent: SELECT * FROM meal_logs WHERE user_id = '" + user.id + "'");
          
          const { data: authLogs, error } = await supabase
            .from('meal_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (error) {
            console.error("Error fetching authenticated logs:", error);
          } else if (authLogs) {
            console.log(`Received ${authLogs?.length || 0} authenticated meal logs`);
            logs = [...(authLogs as MealLog[] || [])];
          }

          if (logs.length === 0) {
            anonUserId = getAnonUserId();
            console.log("No authenticated logs found. Checking anonymous logs with ID:", anonUserId);
            
            const { data: anonLogs, error: anonError } = await supabase
              .from('meal_logs')
              .select('*') 
              .eq('user_id', anonUserId)
              .order('created_at', { ascending: false });
              
            if (anonError) {
              console.error("Error fetching anonymous logs:", anonError);
            } else if (anonLogs && anonLogs.length > 0) {
              console.log(`Found ${anonLogs.length} anonymous logs`);
              logs = [...(anonLogs as MealLog[])];
              toast.info("Showing your previous anonymous meal logs. Future logs will be saved to your account.");
            }
          }
        } else if (anonUserId) {
          console.log("Fetching meal logs for anonymous user:", anonUserId);
          console.log("SQL equivalent: SELECT * FROM meal_logs WHERE user_id = '" + anonUserId + "'");
          
          const { data: anonLogs, error } = await supabase
            .from('meal_logs')
            .select('*')
            .eq('user_id', anonUserId)
            .order('created_at', { ascending: false });
          
          if (error) {
            console.error("Error fetching anonymous logs:", error);
          } else if (anonLogs) {
            console.log(`Received ${anonLogs?.length || 0} anonymous meal logs`);
            logs = [...(anonLogs as MealLog[] || [])];
          }
        }
        
        console.log("Final logs to display:", logs);
        setMealLogs(logs || []);
        console.log("-------- END DEBUGGING --------");
      } catch (err) {
        console.error("Unexpected error fetching meal logs:", err);
        toast.error("An error occurred while loading meal history");
      } finally {
        setIsLoading(false);
        console.log("==========================================");
      }
    }

    fetchMealLogs();
  }, []);

  const extractNutritionInfo = (log: MealLog, key: string, defaultValue: string = "N/A"): string => {
    if (typeof log.nutrition_summary === 'object' && 
        log.nutrition_summary !== null && 
        'items' in log.nutrition_summary && 
        Array.isArray(log.nutrition_summary.items) && 
        log.nutrition_summary.items.length > 0) {
      return log.nutrition_summary.items[0]?.[key as keyof typeof log.nutrition_summary.items[0]] || defaultValue;
    }
    
    try {
      // @ts-ignore 
      return log.nutrition_summary?.items?.[0]?.[key] || defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const extractMealName = (foodItems: Json): string => {
    if (Array.isArray(foodItems) && foodItems.length > 0) {
      if (typeof foodItems[0] === 'object' && foodItems[0] !== null && 'name' in foodItems[0]) {
        return String(foodItems[0].name);
      } else if (typeof foodItems[0] === 'string') {
        return foodItems[0];
      }
    } else if (typeof foodItems === 'object' && foodItems !== null) {
      // @ts-ignore 
      if ('name' in foodItems) return String(foodItems.name);
      return JSON.stringify(foodItems).slice(0, 30) + '...';
    }
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
          {isAnonymous ? 
            'Viewing as anonymous user. Sign in to save your history across devices.' :
            'Viewing as authenticated user'
          }
        </div>
      )}

      <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
        <div>User ID: {userId || 'None'}</div>
        <div>Is Anonymous: {isAnonymous ? 'Yes' : 'No'}</div>
        <div>Database Records: {mealLogs.length}</div>
        <div className="mt-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => {
              toast.info("Refreshing meal history...");
              window.location.reload();
            }}
          >
            Refresh Data
          </Button>
        </div>
      </div>

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
