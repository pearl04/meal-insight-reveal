
import React from "react";
import LoadingSpinner from "../LoadingSpinner";

interface AnalyzingStateProps {
  isTextAnalysis?: boolean;
}

const AnalyzingState: React.FC<AnalyzingStateProps> = ({ isTextAnalysis }) => {
  return (
    <div className="text-center space-y-2">
      <div className="animate-spin w-6 h-6 border-t-2 border-green-500 rounded-full mx-auto" />
      <h2 className="text-xl font-semibold mb-2">
        {isTextAnalysis ? "Analyzing your input..." : "Analyzing your image..."}
      </h2>
      <p className="text-sm text-gray-500">
        {isTextAnalysis
          ? "Our AI is analyzing the food items you entered."
          : "Our AI is identifying the food items in your image."}
      </p>
    </div>
  );
};

export default AnalyzingState;
