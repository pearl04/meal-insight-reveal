
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Json } from "@/integrations/supabase/types";
import { getAnonUserId, isAnonUser } from "@/lib/getAnonUserId";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import MealHistoryHeader from "@/components/meal-history/MealHistoryHeader";
import MealHistoryDebugInfo from "@/components/meal-history/MealHistoryDebugInfo";
import MealHistoryTable from "@/components/meal-history/MealHistoryTable";

interface MealLog {
  id: string;
  created_at: string;
  food_items: Json;
  nutrition_summary: Json | {
    items?: {
      feedback?: string;
      rating?: string;
      healthy_swap?: string;
    }[];
  };
  mock_data?: boolean;
  user_id?: string;
}

export default function MealHistory() {
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const navigate = useNavigate();

  // Function to set anonymous user ID via the edge function
  const setAnonymousUserId = async (anonId: string) => {
    try {
      console.log("Setting anonymous user ID via edge function:", anonId);
      const { data, error } = await supabase.functions.invoke("set-anon-user", {
        body: { anonId }
      });
      
      if (error) {
        console.error("Error setting anonymous user ID:", error);
        throw error;
      }
      
      console.log("Anonymous user ID set result:", data);
      return data;
    } catch (err) {
      console.error("Failed to set anonymous user ID:", err);
      toast.error("Failed to sync anonymous data");
      throw err;
    }
  };

  // Function to fetch meal logs
  const fetchMealLogs = async (useAnonId = false) => {
    console.log("==========================================");
    console.log("🔍 MealHistory: Starting fetch meal logs process");
    setIsLoading(true);
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      let currentUserId: string | null = null;
      let anonUserId: string | null = null;
      
      if (user?.id) {
        // For authenticated users, store the raw UUID
        currentUserId = user.id;
        setIsAnonymous(false);
        console.log("✅ AUTHENTICATED user with ID:", currentUserId);
      } else {
        // For anonymous users, get the ID with anon_ prefix
        anonUserId = getAnonUserId();
        currentUserId = anonUserId;
        setIsAnonymous(true);
        console.log("👤 ANONYMOUS user with ID:", anonUserId);
        
        // For anonymous users, set the anonymous ID in the database session
        if (useAnonId && anonUserId) {
          await setAnonymousUserId(anonUserId);
        }
      }

      setUserId(currentUserId);

      if (!currentUserId) {
        console.log("❌ No user ID found, showing empty meal history");
        setIsLoading(false);
        return;
      }

      // Test RLS permissions
      console.log("🔑 Testing RLS permissions...");
      const { error: permissionError } = await supabase
        .from('meal_logs')
        .select('id')
        .limit(1);
        
      if (permissionError) {
        console.error("RLS permission test error:", permissionError);
        toast.error("Error checking permissions: " + permissionError.message);
      }

      console.log("-------- FETCHING DATA --------");
      
      // Fetch logs based on user type
      let logs: MealLog[] = [];
      
      if (!isAnonymous && user?.id) {
        // For authenticated users
        console.log("Fetching meal logs for authenticated user:", user.id);
        
        const { data: authLogs, error } = await supabase
          .from('meal_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching authenticated logs:", error);
          toast.error("Error loading meal logs: " + error.message);
        } else if (authLogs) {
          console.log(`Received ${authLogs?.length || 0} authenticated meal logs`);
          logs = [...(authLogs as MealLog[] || [])];
        }

        // If requested, also check for anonymous logs to merge
        if (useAnonId && logs.length === 0) {
          anonUserId = getAnonUserId();
          
          if (anonUserId) {
            await setAnonymousUserId(anonUserId);
            
            console.log("Checking anonymous logs with ID:", anonUserId);
            const { data: anonLogs, error: anonError } = await supabase
              .from('meal_logs')
              .select('*') 
              .eq('user_id', anonUserId)
              .order('created_at', { ascending: false });
              
            if (anonError) {
              console.error("Error fetching anonymous logs:", anonError);
            } else if (anonLogs && anonLogs.length > 0) {
              console.log(`Found ${anonLogs.length} anonymous logs`);
              logs = [...(anonLogs as MealLog[])];
              toast.info("Showing your previous anonymous meal logs. Future logs will be saved to your account.");
            }
          }
        }
      } else if (anonUserId) {
        // For anonymous users
        console.log("Fetching meal logs for anonymous user:", anonUserId);
        
        // Set anonymous ID in database session first
        await setAnonymousUserId(anonUserId);
        
        const { data: anonLogs, error } = await supabase
          .from('meal_logs')
          .select('*')
          .eq('user_id', anonUserId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching anonymous logs:", error);
          toast.error("Error loading anonymous logs: " + error.message);
        } else if (anonLogs) {
          console.log(`Received ${anonLogs?.length || 0} anonymous meal logs`);
          logs = [...(anonLogs as MealLog[] || [])];
        }
      }
      
      console.log("Final logs to display:", logs);
      setMealLogs(logs || []);
      console.log("-------- END FETCHING --------");
    } catch (err) {
      console.error("Unexpected error fetching meal logs:", err);
      toast.error("An error occurred while loading meal history");
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
      console.log("==========================================");
    }
  };

  useEffect(() => {
    fetchMealLogs(true);
  }, []);

  const handleSyncAnonData = async () => {
    setIsSyncing(true);
    try {
      await fetchMealLogs(true);
      toast.success("Anonymous data synced successfully");
    } catch (err) {
      console.error("Error syncing anonymous data:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <button
        onClick={() => navigate("/")}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        ← Back to Home
      </button>
      
      <MealHistoryHeader 
        isAnonymous={isAnonymous} 
        onSyncAnonData={handleSyncAnonData}
        isLoading={isSyncing}
      />
      
      <MealHistoryDebugInfo 
        userId={userId} 
        isAnonymous={isAnonymous} 
        logsCount={mealLogs.length} 
      />
      
      <MealHistoryTable 
        mealLogs={mealLogs} 
        isLoading={isLoading} 
      />
    </div>
  );
}
