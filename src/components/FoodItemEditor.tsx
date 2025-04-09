
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Check, Plus } from "lucide-react";

export interface FoodItem {
  id: string;
  name: string;
}

interface FoodItemEditorProps {
  detectedItems: FoodItem[];
  onConfirm: (items: FoodItem[]) => void;
}

const FoodItemEditor = ({ detectedItems, onConfirm }: FoodItemEditorProps) => {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    setItems(detectedItems);
  }, [detectedItems]);

  const handleAddItem = () => {
    if (newItem.trim()) {
      setItems([...items, { id: Date.now().toString(), name: newItem.trim() }]);
      setNewItem("");
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  return (
    <div className="w-full bg-white rounded-xl border p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">We detected these food items:</h2>
      
      <div className="space-y-3 mb-6">
        {items.map(item => (
          <div 
            key={item.id} 
            className="flex items-center justify-between p-3 bg-secondary rounded-lg"
          >
            <span>{item.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => handleRemoveItem(item.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Input
          placeholder="Add another item..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button 
          onClick={handleAddItem}
          className="bg-meal-500 hover:bg-meal-600"
        >
          <Plus className="h-4 w-4 mr-2" /> Add
        </Button>
      </div>

      <div className="pt-4 border-t">
        <Button 
          className="w-full bg-meal-500 hover:bg-meal-600 text-white" 
          onClick={() => onConfirm(items)}
        >
          <Check className="h-4 w-4 mr-2" /> Confirm Items
        </Button>
      </div>
    </div>
  );
};

export default FoodItemEditor;
