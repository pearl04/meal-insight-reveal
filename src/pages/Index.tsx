import React from "react";
import Header from "@/components/Header";
import MealCheck from "../components/MealCheck";
import { Leaf, Apple } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-meal-700 flex items-center justify-center gap-2">
              <Apple className="h-8 w-8" />
              MealCheck
              <Leaf className="h-6 w-6" />
            </h1>
            <p className="text-xl text-muted-foreground">
              Type your meals and get instant nutrition insights powered by AI
            </p>
          </div>

          {/* Meal input component */}
          <MealCheck />

          {/* New Button to navigate to Meal History */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/meal-history")}
              className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition duration-300"
            >
              View My Meal History
            </button>
          </div>

          {/* Footer note */}
          <div className="mt-16 text-center text-sm text-muted-foreground">
            <p>
              MealCheck estimates nutritional values based on your input. Results are approximate and intended for general guidance.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
