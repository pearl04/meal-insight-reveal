
// @ts-ignore
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// @ts-ignore
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // secure and store your key in Supabase secrets
  // @ts-ignore
  const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

  if (!OPENROUTER_API_KEY) {
    console.error("API key not found in environment variables");
    return new Response(JSON.stringify({ error: "API key not found" }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response(
    JSON.stringify({ key: OPENROUTER_API_KEY }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
});
