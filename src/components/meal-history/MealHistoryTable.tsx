
import { Json } from "@/integrations/supabase/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

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

interface MealHistoryTableProps {
  mealLogs: MealLog[];
  isLoading: boolean;
}

export default function MealHistoryTable({ mealLogs, isLoading }: MealHistoryTableProps) {
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-green-600 text-white">Date</TableHead>
            <TableHead className="bg-green-600 text-white">Time</TableHead>
            <TableHead className="bg-green-600 text-white">Meal</TableHead>
            <TableHead className="bg-green-600 text-white">Feedback</TableHead>
            <TableHead className="bg-green-600 text-white">Rating</TableHead>
            <TableHead className="bg-green-600 text-white">Swap Suggestion</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center p-8">
                Loading your meal history...
              </TableCell>
            </TableRow>
          ) : mealLogs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center p-8 text-muted-foreground">
                No meal history yet. Start logging meals!
              </TableCell>
            </TableRow>
          ) : (
            mealLogs.map((log) => {
              const mealName = extractMealName(log.food_items);
              const feedback = extractNutritionInfo(log, 'feedback');
              const rating = extractNutritionInfo(log, 'rating');
              const swapSuggestion = extractNutritionInfo(log, 'healthy_swap');
              
              const dateObj = new Date(log.created_at);

              return (
                <TableRow key={log.id}>
                  <TableCell className="border border-green-200">
                    {dateObj.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="border border-green-200">
                    {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell className="border border-green-200">{mealName}</TableCell>
                  <TableCell className="border border-green-200">{feedback}</TableCell>
                  <TableCell className="border border-green-200">{rating}</TableCell>
                  <TableCell className="border border-green-200">{swapSuggestion}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
