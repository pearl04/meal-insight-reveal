
import React from 'react';
import { useMealHistory } from '@/hooks/useMealHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import { LockKeyhole } from 'lucide-react';

const MealHistoryPage = () => {
  const { mealLogs, isLoading, isHistoryLocked } = useMealHistory();

  const renderMealLogDetails = (log: any) => {
    const totalCalories = log.nutrition_summary.reduce(
      (sum: number, item: any) => sum + (item.nutrition?.calories || 0), 
      0
    );

    return (
      <div className="mb-4 bg-muted/50 p-3 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold">
              {log.food_items.map((item: any) => item.name).join(', ')}
            </p>
            <p className="text-sm text-muted-foreground">
              {totalCalories.toFixed(0)} calories
            </p>
          </div>
          {log.nutrition_summary[0]?.rating && (
            <div className="text-yellow-500 font-bold">
              ★ {log.nutrition_summary[0].rating}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLockedView = () => (
    <div className="text-center p-6">
      <LockKeyhole className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold mb-2">Meal Insights Locked</h2>
      <p className="text-muted-foreground mb-6">
        Your meal insights history is now part of our Premium Plan.
      </p>
      <Button variant="default" className="w-full">
        Upgrade to Unlock History
      </Button>
    </div>
  );

  const renderMealHistory = () => {
    const groupedLogs: { [key: string]: any[] } = {};
    
    mealLogs.forEach(log => {
      const date = new Date(log.created_at).toDateString();
      if (!groupedLogs[date]) {
        groupedLogs[date] = [];
      }
      groupedLogs[date].push(log);
    });

    return Object.entries(groupedLogs).map(([date, logs]) => (
      <Card key={date} className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">{formatDate(new Date(date))}</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.map(log => renderMealLogDetails(log))}
        </CardContent>
      </Card>
    ));
  };

  if (isLoading) {
    return <div>Loading meal history...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Meal History</h1>
      
      {isHistoryLocked ? renderLockedView() : renderMealHistory()}
    </div>
  );
};

export default MealHistoryPage;
