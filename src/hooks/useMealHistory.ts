
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { FoodItem, FoodWithNutrition } from "@/types/nutrition";
import { toast } from "sonner";

interface MealLog {
  id: string;
  created_at: string;
  food_items: FoodItem[];
  nutrition_summary: FoodWithNutrition[];
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
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError("User not authenticated");
          return;
        }

        // Check if history is locked (7 days from first use)
        const { data: firstLog } = await supabase
          .from('meal_logs')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        if (firstLog) {
          const firstLogDate = new Date(firstLog.created_at);
          const sevenDaysLater = new Date(firstLogDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          
          setIsHistoryLocked(new Date() > sevenDaysLater);
        }

        const { data, error } = await supabase
          .from('meal_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          setError(error.message);
          return;
        }

        setMealLogs(data || []);
      } catch (err) {
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
