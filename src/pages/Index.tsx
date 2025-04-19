
import React from "react";
import Header from "@/components/Header";
import MealCheck from "../components/MealCheck";
import { Leaf, Apple, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      // Get the current URL and port for proper redirects
      const currentURL = new URL(window.location.href);
      const redirectTo = `${currentURL.protocol}//${currentURL.hostname}:${currentURL.port}`;
      console.log("Index login redirecting to:", redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });
      
      if (error) {
        toast.error(`Login failed: ${error.message}`);
        console.error("Login error:", error);
        return;
      }
      
      console.log("Auth redirect data:", data);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Login failed: ${errorMessage}`);
      console.error("Login error:", error);
    }
  };

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
            <Button 
              onClick={handleGoogleLogin}
              className="mt-6 bg-meal-500 hover:bg-meal-600"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Log My Meals with Google
            </Button>
          </div>

          <MealCheck />

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
