import React from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Textarea } from "./ui/textarea";

interface FoodInputModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

const FoodInputModal: React.FC<FoodInputModalProps> = ({ open, onClose, onSubmit }) => {
  const [text, setText] = React.useState("");

  const handleSubmit = () => {
    onSubmit(text);
    setText("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Food Items</DialogTitle>
        </DialogHeader>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter food items separated by commas (e.g., apple, chicken breast, rice)"
          className="min-h-[150px]"
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FoodInputModal; 