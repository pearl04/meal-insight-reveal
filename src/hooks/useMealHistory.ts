
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { FoodItem, FoodWithNutrition } from "@/types/nutrition";
import { toast } from "sonner";

interface MealLog {
  id: string;
  created_at: string;
  food_items: FoodItem[];
  nutrition_summary: {
    items: FoodWithNutrition[];
    totals: {
      calories: string;
      protein: string;
      carbs: string;
      fat: string;
    }
  };
  mock_data: boolean;
}

export const useMealHistory = () => {
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryLocked, setIsHistoryLocked] = useState(false);

  useEffect(() => {
    const fetchMealHistory = async () => {
      try {
        setIsLoading(true);
        
        // First check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        let query = supabase
          .from('meal_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(7); // Limit to latest 7 meals
          
        // If user is authenticated, filter by their user_id, otherwise use demo data
        if (user) {
          query = query.eq('user_id', user.id);
        } else {
          // For demo purposes when no user is logged in
          // Use a string that's a valid UUID format for demo data
          query = query.eq('mock_data', true);
        }
          
        // Limit to recent entries (last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        query = query.gte('created_at', oneWeekAgo.toISOString());

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error("Error fetching meal history:", fetchError);
          setError(fetchError.message);
          toast.error("Could not load meal history");
          return;
        }

        // Transform the data to ensure proper typing
        const typedLogs: MealLog[] = data?.map((log: any) => ({
          id: log.id,
          created_at: log.created_at,
          food_items: log.food_items as FoodItem[],
          nutrition_summary: log.nutrition_summary as {
            items: FoodWithNutrition[];
            totals: {
              calories: string;
              protein: string;
              carbs: string;
              fat: string;
            }
          },
          mock_data: log.mock_data
        })) || [];

        setMealLogs(typedLogs);
      } catch (err) {
        console.error("Error in useMealHistory hook:", err);
        setError("Error fetching meal history");
        toast.error("Could not load meal history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMealHistory();
  }, []);

  return { mealLogs, isLoading, error, isHistoryLocked };
};
