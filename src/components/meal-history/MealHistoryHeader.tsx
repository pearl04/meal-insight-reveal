
interface MealHistoryHeaderProps {
  isAnonymous: boolean;
}

export default function MealHistoryHeader({ isAnonymous }: MealHistoryHeaderProps) {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-center">My Meal History</h1>

      {isAnonymous !== undefined && (
        <div className="text-sm mb-4 text-center text-muted-foreground">
          {isAnonymous ? 
            'Viewing as anonymous user. Sign in to save your history across devices.' :
            'Viewing as authenticated user'
          }
        </div>
      )}
    </>
  );
}
