
// @ts-ignore
import { serve } from "std/http/server.ts";

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
    // Check for OpenRouter API key in environment variables
    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    console.log("Checking for OPENROUTER_API_KEY:", apiKey ? "Key found" : "No key found");

    // Return the API key if available
    if (apiKey) {
      return new Response(
        JSON.stringify({ key: apiKey }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // If no API key is found
    return new Response(
      JSON.stringify({ error: "No API key found" }),
      { 
        status: 404, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
    
  } catch (error) {
    console.error("Error in get-openrouter-key function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
