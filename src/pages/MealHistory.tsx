
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealHistory } from '@/hooks/useMealHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Utensils } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const MealHistoryPage = () => {
  const navigate = useNavigate();
  const { mealLogs, isLoading, error, isHistoryLocked } = useMealHistory();

  const handleGoBack = () => {
    navigate('/');
  };

  const renderNutritionSummary = (nutritionSummary: any) => {
    if (!nutritionSummary || !nutritionSummary.totals) return "No data";
    
    const { totals } = nutritionSummary;
    return (
      <div className="space-y-1 text-sm">
        <p>Calories: {totals.calories}</p>
        <p>Protein: {totals.protein}g</p>
        <p>Carbs: {totals.carbs}g</p>
        <p>Fat: {totals.fat}g</p>
      </div>
    );
  };

  const renderFoodItems = (items: any[]) => {
    if (!items || !items.length) return "No items";
    return items.map(item => item.name).join(", ");
  };

  const renderLockedView = () => (
    <div className="text-center p-6 bg-muted/30 rounded-lg">
      <h2 className="text-2xl font-bold mb-2">Meal Insights Locked</h2>
      <p className="text-muted-foreground mb-6">
        Your meal insights history is now part of our Premium Plan.
      </p>
      <Button variant="default" className="w-full">
        Upgrade to Unlock History
      </Button>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center p-12 bg-muted/30 rounded-lg">
      <Utensils className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold mb-2">No meals logged yet</h2>
      <p className="text-muted-foreground mb-6">
        Start by uploading your first meal!
      </p>
      <Button variant="default" onClick={handleGoBack} className="w-48">
        Analyze Meals
      </Button>
    </div>
  );

  const renderMealHistory = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Filter logs to only show the last 7 days
    const recentLogs = mealLogs.filter(log => 
      new Date(log.created_at) >= oneWeekAgo
    );

    if (recentLogs.length === 0) {
      return renderEmptyState();
    }

    // Group logs by date
    const groupedLogs: { [key: string]: any[] } = {};
    
    recentLogs.forEach(log => {
      const date = new Date(log.created_at).toDateString();
      if (!groupedLogs[date]) {
        groupedLogs[date] = [];
      }
      groupedLogs[date].push(log);
    });

    return (
      <div className="space-y-6">
        {Object.entries(groupedLogs).map(([date, logs]) => (
          <Card key={date} className="overflow-hidden">
            <CardHeader className="bg-muted/30 py-3">
              <CardTitle className="text-lg">{formatDate(new Date(date))}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2">Food Items</TableHead>
                    <TableHead className="w-1/2">Nutrition Summary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="align-top">
                        {renderFoodItems(log.food_items)}
                      </TableCell>
                      <TableCell>
                        {renderNutritionSummary(log.nutrition_summary)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="animate-pulse text-lg">Loading meal history...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          onClick={handleGoBack} 
          className="mr-auto flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Analyze Meals
        </Button>
      </div>
      
      <h1 className="text-4xl font-bold text-center mb-8 mt-4">Meal History</h1>
      
      {isHistoryLocked 
        ? renderLockedView() 
        : renderMealHistory()
      }
    </div>
  );
};

export default MealHistoryPage;
