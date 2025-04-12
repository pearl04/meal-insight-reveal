
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface TextInputModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

const TextInputModal = ({ open, onClose, onSubmit }: TextInputModalProps) => {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text);
      setText("");
      onClose(); // Close the modal after submission
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Enter food items to analyze</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            placeholder="Enter food items separated by commas (e.g., apple, chicken breast, rice)"
            className="min-h-[120px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        
        <DialogFooter>
          <Button
            type="submit"
            className="bg-meal-500 hover:bg-meal-600 w-full"
            onClick={handleSubmit}
          >
            Analyze Food Items
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TextInputModal;
