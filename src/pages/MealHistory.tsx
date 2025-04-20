import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

interface MealLog {
  id: string;
  created_at: string;
  food_items: any;
  nutrition_summary: any;
}

export default function MealHistory() {
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMealLogs() {
      const { data, error } = await supabase
        .from("meal_logs")
        .select("*")
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

  function formatDateTime(dateTimeString: string) {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-10">
      <button
        onClick={() => navigate("/")}
        className="mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        ← Back to Home
      </button>

      <h2 className="text-3xl font-bold mb-8">My Meal History</h2>

      <div className="w-full max-w-5xl overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Time</th>
              <th className="py-3 px-4 text-left">Meal</th>
              <th className="py-3 px-4 text-left">Feedback</th>
              <th className="py-3 px-4 text-left">Rating</th>
              <th className="py-3 px-4 text-left">Swap Suggestion</th>
            </tr>
          </thead>
          <tbody>
            {mealLogs.map((log) => {
              const { date, time } = formatDateTime(log.created_at);
              return (
                <tr key={log.id} className="border-b hover:bg-gray-100">
                  <td className="py-3 px-4">{date}</td>
                  <td className="py-3 px-4">{time}</td>
                  <td className="py-3 px-4">
                    {log.food_items?.map((item: any, index: number) => (
                      <div key={index}>{item.name}</div>
                    ))}
                  </td>
                  <td className="py-3 px-4">
                    {log.nutrition_summary?.feedback || "-"}
                  </td>
                  <td className="py-3 px-4">
                    {log.nutrition_summary?.rating || "-"}
                  </td>
                  <td className="py-3 px-4">
                    {log.nutrition_summary?.healthy_swap || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
