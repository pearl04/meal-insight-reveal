
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  onTextAnalysisClick: () => void;
}

const ImageUploader = ({ onImageSelect, onTextAnalysisClick }: ImageUploaderProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.match("image.*")) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      onImageSelect(file);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <div
        onClick={triggerFileInput}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all",
          isDragging
            ? "border-meal-500 bg-meal-100"
            : "border-gray-300 hover:border-meal-400 hover:bg-meal-50",
          selectedImage ? "p-4" : "p-8"
        )}
      >
        {selectedImage ? (
          <div className="relative w-full h-full">
            <img
              src={selectedImage}
              alt="Selected meal"
              className="w-full h-full object-contain rounded-lg"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 p-4 bg-meal-100 rounded-full">
              <Camera className="h-8 w-8 text-meal-500" />
            </div>
            <p className="text-lg font-medium mb-2">Upload your meal photo</p>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Drag and drop an image here, or click to select a file
            </p>
            <div className="flex gap-4">
              <Button className="bg-meal-500 hover:bg-meal-600">
                <Upload className="h-4 w-4 mr-2" /> Select Image
              </Button>
              <Button 
                className="bg-meal-500 hover:bg-meal-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onTextAnalysisClick();
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2" /> Add Food to Analyse
              </Button>
            </div>
          </>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default ImageUploader;
