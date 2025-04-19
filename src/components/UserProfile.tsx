
import React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        console.log("User metadata:", session?.user?.user_metadata);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN') {
          toast.success('Signed in successfully!');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log("Initial session check:", session?.user?.id);
      if (error) {
        console.error("Session error:", error);
        setError(error.message);
        setLoading(false);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check URL for errors after login redirect
      const url = new URL(window.location.href);
      const errorParam = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');
      
      if (errorParam) {
        console.error("Auth error in URL:", errorParam, errorDescription);
        toast.error(`Authentication error: ${errorDescription || errorParam}`);
        // Clear the error params from URL
        url.searchParams.delete('error');
        url.searchParams.delete('error_description');
        window.history.replaceState({}, document.title, url.toString());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(`Logout failed: ${error.message}`);
        console.error("Logout error:", error);
        return;
      }
      toast.success('Logged out successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Logout failed: ${errorMessage}`);
      console.error("Logout error:", error);
    }
  };

  // Show loading state
  if (loading) return <div className="animate-pulse rounded-full h-8 w-8 bg-muted"></div>;
  
  // Show error state
  if (error) {
    console.error("Auth error state:", error);
    return (
      <div className="text-red-500">
        <Button variant="ghost" size="sm" onClick={() => setError(null)}>
          Retry
        </Button>
      </div>
    );
  }
  
  // If not logged in, don't render anything
  if (!user) return null;

  const userInitial = user.email ? user.email.charAt(0).toUpperCase() : 'U';
  const avatarUrl = user.user_metadata?.avatar_url;
  const displayName = user.user_metadata?.full_name || user.email;

  return (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>{userInitial}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{displayName}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-xs"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
