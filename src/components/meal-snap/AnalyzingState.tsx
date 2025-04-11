
import React from "react";
import LoadingSpinner from "../LoadingSpinner";

interface AnalyzingStateProps {
  usingCustomApiKey: boolean;
}

const AnalyzingState: React.FC<AnalyzingStateProps> = ({ usingCustomApiKey }) => {
  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col items-center">
      <LoadingSpinner size="large" className="mb-4" />
      <h2 className="text-xl font-semibold mb-2">Analyzing your meal...</h2>
      <p className="text-muted-foreground text-center animate-pulse-opacity">
        {usingCustomApiKey
          ? "Using OpenRouter AI to identify food items"
          : "Our AI is identifying the food items in your image"}
      </p>
    </div>
  );
};

export default AnalyzingState;
