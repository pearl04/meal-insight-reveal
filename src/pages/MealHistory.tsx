import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface MealLog {
  id: string;
  created_at: string;
  food_items: any[];
  nutrition_summary: any;
}

const MealHistory: React.FC = () => {
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchMealLogs = async () => {
    setLoading(true);
    try {
      console.log("📚 Fetching meal logs...");

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("❌ User not found:", userError);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("meal_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(7);

      if (error) {
        console.error("❌ Error fetching meal logs:", error);
      } else {
        console.log("✅ Meal logs fetched:", data);
        setMealLogs(data || []);
      }
    } catch (err) {
      console.error("❌ Unexpected error fetching meal logs:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMealLogs();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Button
        className="mb-6 bg-green-600 hover:bg-green-700"
        onClick={() => navigate("/")}
      >
        ← Back to Home
      </Button>

      <h1 className="text-2xl font-bold mb-6 text-center">My Meal History</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-green-600 text-white">
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Time</th>
              <th className="p-3 border">Meal</th>
              <th className="p-3 border">Feedback</th>
              <th className="p-3 border">Rating</th>
              <th className="p-3 border">Swap Suggestion</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : mealLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-6 text-muted-foreground">
                  No meal history yet. Start logging meals!
                </td>
              </tr>
            ) : (
              mealLogs.map((log) => {
                const firstItem = log.nutrition_summary?.items?.[0] || {};

                return (
                  <tr key={log.id} className="border-t">
                    <td className="p-3 border">{formatDate(log.created_at)}</td>
                    <td className="p-3 border">{formatTime(log.created_at)}</td>
                    <td className="p-3 border">{firstItem.name || "—"}</td>
                    <td className="p-3 border">{firstItem.feedback || "—"}</td>
                    <td className="p-3 border">{firstItem.rating ? `${firstItem.rating}/10` : "—"}</td>
                    <td className="p-3 border">{firstItem.healthy_swap || "—"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-6">
        <Button onClick={fetchMealLogs} className="bg-green-500 hover:bg-green-600">
          Refresh Data
        </Button>
      </div>
    </div>
  );
};

export default MealHistory;
