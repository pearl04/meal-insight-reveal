
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MealHistoryDebugInfoProps {
  userId: string | null;
  isAnonymous: boolean;
  logsCount: number;
}

export default function MealHistoryDebugInfo({ 
  userId, 
  isAnonymous, 
  logsCount 
}: MealHistoryDebugInfoProps) {
  return (
    <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
      <div>User ID: {userId || 'None'}</div>
      <div>Is Anonymous: {isAnonymous ? 'Yes' : 'No'}</div>
      <div>Database Records: {logsCount}</div>
      <div className="mt-2">
        <Button 
          variant="outline"
          size="sm"
          onClick={() => {
            toast.info("Refreshing meal history...");
            window.location.reload();
          }}
        >
          Refresh Data
        </Button>
      </div>
    </div>
  );
}
