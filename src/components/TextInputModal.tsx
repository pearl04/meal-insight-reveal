
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
import { X } from "lucide-react";

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
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Enter food items to analyze</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
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
