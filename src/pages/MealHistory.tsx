
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client"; // changed import here
import { useNavigate } from "react-router-dom";

interface MealLog {
  id: string;
  created_at: string;
  food_items: any[];
  nutrition_summary: {
    items: {
      feedback?: string;
      rating?: string;
      healthy_swap?: string;
    }[];
  };
}

export default function MealHistory() {
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMealLogs() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("No user found");
        return;
      }

      const { data, error } = await supabase
        .from("meal_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(7);

      if (error) {
        console.error("Error fetching meal logs:", error);
      } else {
        setMealLogs(data || []);
      }
    }

    fetchMealLogs();
  }, []);

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
            {mealLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-muted-foreground">
                  No meal history yet. Start logging meals!
                </td>
              </tr>
            ) : (
              mealLogs.map((log) => {
                const mealName = log.food_items?.[0] || "N/A";
                const feedback = log.nutrition_summary?.items?.[0]?.feedback || "N/A";
                const rating = log.nutrition_summary?.items?.[0]?.rating || "N/A";
                const swapSuggestion = log.nutrition_summary?.items?.[0]?.healthy_swap || "N/A";
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
