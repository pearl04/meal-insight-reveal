
import { Button } from "@/components/ui/button";

interface MealHistoryHeaderProps {
  isAnonymous: boolean;
  onSyncAnonData?: () => void;
  isLoading?: boolean;
}

export default function MealHistoryHeader({ 
  isAnonymous, 
  onSyncAnonData,
  isLoading = false 
}: MealHistoryHeaderProps) {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">My Meal History</h1>

      {isAnonymous !== undefined && (
        <div className="mb-4">
          <div className="text-sm mb-2 text-muted-foreground">
            {isAnonymous ? 
              'Viewing as anonymous user. Sign in to save your history across devices.' :
              'Viewing as authenticated user'
            }
          </div>
          
          {isAnonymous && onSyncAnonData && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onSyncAnonData}
              disabled={isLoading}
              className="text-xs"
            >
              {isLoading ? "Syncing..." : "Sync Anonymous Data"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
