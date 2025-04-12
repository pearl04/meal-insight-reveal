
import React from "react";
import { AlertTriangle } from "lucide-react";
import ImageUploader from "../ImageUploader";

interface UploadStateProps {
  onImageSelect: (file: File) => void;
  onTextAnalysisClick: () => void;
  hasErrored: boolean;
}

const UploadState: React.FC<UploadStateProps> = ({
  onImageSelect,
  onTextAnalysisClick,
  hasErrored,
}) => {
  return (
    <>
      <ImageUploader 
        onImageSelect={onImageSelect} 
        onTextAnalysisClick={onTextAnalysisClick} 
      />
      {hasErrored && (
        <div className="mt-4 p-3 border border-red-200 rounded-lg bg-red-50 flex items-start gap-2">
          <AlertTriangle size={16} className="text-red-500 mt-1 flex-shrink-0" />
          <p className="text-xs text-red-600">
            There was an error analyzing your last image. Please try again.
          </p>
        </div>
      )}
    </>
  );
};

export default UploadState;
