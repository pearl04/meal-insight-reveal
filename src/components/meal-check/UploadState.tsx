import React from "react";
import { AlertTriangle } from "lucide-react";

interface UploadStateProps {
  mealText: string;
  setMealText: (text: string) => void;
  onTextAnalysisClick: () => void;
  hasErrored: boolean;
}

const UploadState: React.FC<UploadStateProps> = ({
  mealText,
  setMealText,
  onTextAnalysisClick,
  hasErrored,
}) => {
  return (
    <>
      <div className="w-full flex flex-col gap-3">
        <textarea
          placeholder="Type your meal (e.g. idli, chutney, tea)"
          value={mealText}
          onChange={(e) => setMealText(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md"
        />
        <button
          onClick={onTextAnalysisClick}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Analyze This Meal
        </button>
      </div>

      {hasErrored && (
        <div className="mt-4 p-3 border border-red-200 rounded-lg bg-red-50 flex items-start gap-2">
          <AlertTriangle size={16} className="text-red-500 mt-1 flex-shrink-0" />
          <p className="text-xs text-red-600">
            There was an error analyzing your last input. Please try again.
          </p>
        </div>
      )}
    </>
  );
};

export default UploadState;
