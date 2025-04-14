
import React from "react";
import LoadingSpinner from "../LoadingSpinner";

const AnalyzingState: React.FC = () => {
  return (
    <div className="text-center space-y-2">
      <div className="animate-spin w-6 h-6 border-t-2 border-green-500 rounded-full mx-auto" />
      <h2 className="text-xl font-semibold mb-2">
        Analyzing your input...
      </h2>
      <p className="text-sm text-gray-500">
        Our AI is analyzing the food items you entered.
      </p>
    </div>
  );
};

export default AnalyzingState;
