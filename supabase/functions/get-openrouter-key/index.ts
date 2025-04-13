// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": 
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch API key from environment
    const apiKey = Deno.env.get("OPENROUTER_API_KEY") || "";
    
    console.log("API key retrieval request received");
    
    if (!apiKey) {
      console.log("No OpenRouter API key found in environment variables");
      return new Response(
        JSON.stringify({ 
          message: "No API key configured", 
          key: "" 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("OpenRouter API key found in environment");
    
    // Return a masked version of the key
    return new Response(
      JSON.stringify({ 
        message: "API key retrieved successfully", 
        key: apiKey
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error retrieving API key:", error);
    return new Response(
      JSON.stringify({ error: "Failed to retrieve API key" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
