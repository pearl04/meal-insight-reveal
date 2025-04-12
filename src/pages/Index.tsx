import React from "react";
import Header from "@/components/Header";
import MealSnap from "@/components/MealSnap";
import { Leaf, Apple } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-meal-700 flex items-center justify-center gap-2">
              <Apple className="h-8 w-8" />
              MealSnap
              <Leaf className="h-6 w-6" />
            </h1>
            <p className="text-xl text-muted-foreground">
              Snap a photo of your meal and get instant nutrition insights
            </p>
          </div>
          
          <MealSnap />
          
          <div className="mt-16 text-center text-sm text-muted-foreground">
            <p>MealSnap analyzes your food using AI to provide nutrition estimates.</p>
            <p>Nutrition estimates are approximate and based on the entire dish in the image. Use as an indicative guide only.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
