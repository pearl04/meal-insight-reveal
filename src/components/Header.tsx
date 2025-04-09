
import React from "react";
import { Utensils } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full py-4 border-b">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Utensils className="h-6 w-6 text-meal-500" />
          <h1 className="text-xl font-semibold">MealSnap</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          Nutrition at a glance
        </div>
      </div>
    </header>
  );
};

export default Header;
