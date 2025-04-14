
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MockDataAlertProps {
  resetApp?: () => void;
  setShowApiInput?: (show: boolean) => void;
}

const MockDataAlert: React.FC<MockDataAlertProps> = ({ 
  resetApp, 
  setShowApiInput 
}) => {
  return (
    <div className="mt-4 p-3 border border-yellow-200 rounded-lg bg-yellow-50 flex items-start gap-2">
      <AlertTriangle size={16} className="text-yellow-500 mt-1 flex-shrink-0" />
      <p className="text-xs text-yellow-600">
        This is sample data as no OpenRouter API key was found. For accurate food detection, please add an OpenRouter API key.
        {resetApp && setShowApiInput && (
          <Button
            variant="link"
            className="text-xs text-blue-600 p-0 h-auto"
            onClick={() => {
              resetApp();
              setShowApiInput(true);
            }}
          >
            Add API key
          </Button>
        )}
      </p>
    </div>
  );
};

export default MockDataAlert;
