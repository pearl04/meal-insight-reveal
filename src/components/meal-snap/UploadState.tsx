
import React from "react";
import { AlertTriangle, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import ImageUploader from "../ImageUploader";

interface UploadStateProps {
  onImageSelect: (file: File) => void;
  hasErrored: boolean;
  showApiInput: boolean;
  toggleApiInput: () => void;
  openRouterKey: string;
  setOpenRouterKey: (key: string) => void;
  saveApiKey: () => void;
  setShowApiInput: (show: boolean) => void;
}

const UploadState: React.FC<UploadStateProps> = ({
  onImageSelect,
  hasErrored,
  showApiInput,
  toggleApiInput,
  openRouterKey,
  setOpenRouterKey,
  saveApiKey,
  setShowApiInput
}) => {
  const renderApiKeyInput = () => {
    if (!showApiInput) {
      return (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleApiInput}
            className="text-xs flex items-center gap-1"
          >
            <Key size={12} />
            Use OpenRouter AI
          </Button>
        </div>
      );
    }

    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Key size={14} />
            OpenRouter API Key
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle size={16} className="text-slate-500 mt-1 flex-shrink-0" />
            <p className="text-xs text-slate-600">
              Enter your OpenRouter API key for better food detection. Your key is only used in this session and not stored.
              <a 
                href="https://openrouter.ai/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 block hover:underline mt-1"
              >
                Get an API key
              </a>
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="OpenRouter API Key"
              value={openRouterKey}
              onChange={(e) => setOpenRouterKey(e.target.value)}
              className="text-sm"
            />
            <Button size="sm" variant="default" onClick={saveApiKey}>
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <ImageUploader onImageSelect={onImageSelect} />
      {hasErrored && (
        <div className="mt-4 p-3 border border-red-200 rounded-lg bg-red-50 flex items-start gap-2">
          <AlertTriangle size={16} className="text-red-500 mt-1 flex-shrink-0" />
          <p className="text-xs text-red-600">
            There was an error analyzing your last image. Please try again or check your API key.
          </p>
        </div>
      )}
      {renderApiKeyInput()}
    </>
  );
};

export default UploadState;
