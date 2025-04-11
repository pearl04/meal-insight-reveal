
import React from "react";
import LoadingSpinner from "../LoadingSpinner";

const CalculatingState: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col items-center">
      <LoadingSpinner size="large" className="mb-4" />
      <h2 className="text-xl font-semibold mb-2">Calculating nutrition info...</h2>
      <p className="text-muted-foreground text-center animate-pulse-opacity">
        Getting nutrition details for your meal
      </p>
    </div>
  );
};

export default CalculatingState;
