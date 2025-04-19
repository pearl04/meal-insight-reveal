
import React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src={user.user_metadata.avatar_url} />
        <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{user.email}</span>
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
