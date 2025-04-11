
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openRouterKey = Deno.env.get("OPENROUTER_API_KEY");
    
    console.log("Checking for OPENROUTER_API_KEY:", openRouterKey ? "Found key" : "No key found");
    
    if (!openRouterKey) {
      // Return a 404 to indicate the key is not found
      return new Response(
        JSON.stringify({ 
          error: "API key not found", 
          message: "Please set the OPENROUTER_API_KEY in your Supabase environment variables."
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(
      JSON.stringify({ key: openRouterKey }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching API key:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
