
import { Link } from "react-router-dom";
import UserProfile from "./UserProfile";
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { toast } from "sonner";

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Header auth state changed:", event, !!session);
      setIsAuthenticated(!!session);
      setIsLoading(false);
      
      if (event === 'SIGNED_IN') {
        toast.success('Signed in successfully!');
      }
    });

    // THEN check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Header session check:", !!session);
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const currentURL = new URL(window.location.href);
      const redirectTo = currentURL.hostname === 'localhost' 
        ? `${currentURL.protocol}//${currentURL.hostname}:${currentURL.port}`
        : `${currentURL.protocol}//${currentURL.hostname}`;
      
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
      
      if (error) {
        toast.error(`Login error: ${error.message}`);
        console.error("Header login error:", error);
      }
    } catch (error) {
      console.error("Header login error:", error);
      toast.error(`Login failed: ${error instanceof Error ? error.message : "Unknown error"}`);
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
