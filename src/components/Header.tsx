
import { Link } from "react-router-dom";
import UserProfile from "./UserProfile";
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Header session check:", !!session);
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Header auth state changed:", event, !!session);
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const redirectTo = window.location.origin;
      console.log("Header login redirecting to:", redirectTo);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });
      
      if (error) throw error;
    } catch (error) {
      console.error("Header login error:", error);
    }
  };

  return (
    <header className="bg-background border-b py-4">
      <div className="container flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          MealCheck
        </Link>
        
        {isLoading ? (
          <div className="animate-pulse rounded-full h-8 w-8 bg-muted"></div>
        ) : isAuthenticated ? (
          <UserProfile />
        ) : (
          <Button 
            onClick={handleGoogleLogin}
            variant="outline"
            size="sm"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
