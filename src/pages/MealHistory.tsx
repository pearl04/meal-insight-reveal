
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealHistory } from '@/hooks/useMealHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Utensils } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

const MealHistoryPage = () => {
  const navigate = useNavigate();
  const { mealLogs, isLoading, error } = useMealHistory();

  const handleGoBack = () => {
    navigate('/');
  };

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
    if (mealLogs.length === 0) {
      return renderEmptyState();
    }

    // Group logs by date
    const groupedLogs: { [key: string]: any[] } = {};
    
    mealLogs.forEach(log => {
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
              <ScrollArea className="w-full max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">Food Items</TableHead>
                      <TableHead className="w-1/6">Calories</TableHead>
                      <TableHead className="w-1/6">Protein</TableHead>
                      <TableHead className="w-1/6">Carbs</TableHead>
                      <TableHead className="w-1/6">Fat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="align-top">
                          {log.food_items.map(item => item.name).join(", ")}
                        </TableCell>
                        <TableCell>{log.nutrition_summary.totals.calories}</TableCell>
                        <TableCell>{log.nutrition_summary.totals.protein}</TableCell>
                        <TableCell>{log.nutrition_summary.totals.carbs}</TableCell>
                        <TableCell>{log.nutrition_summary.totals.fat}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            onClick={handleGoBack} 
            className="flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Analyze Meals
          </Button>
        </div>
        <h1 className="text-4xl font-bold text-center mb-8">Meal History</h1>
        <div className="text-center animate-pulse">Loading meal history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            onClick={handleGoBack} 
            className="flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Analyze Meals
          </Button>
        </div>
        <h1 className="text-4xl font-bold text-center mb-8">Meal History</h1>
        <div className="text-center text-red-500">Error loading meal history</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          onClick={handleGoBack} 
          className="flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Analyze Meals
        </Button>
      </div>
      
      <h1 className="text-4xl font-bold text-center mb-8">Meal History</h1>
      
      {renderMealHistory()}
    </div>
  );
};

export default MealHistoryPage;
