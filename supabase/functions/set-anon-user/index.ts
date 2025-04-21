
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { anonId } = await req.json();
    
    if (!anonId) {
      return new Response(
        JSON.stringify({ error: "Anonymous ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("Setting anonymous user ID:", anonId);
    
    // Call the SQL function to set the anonymous user ID
    const { data, error } = await fetch(
      `${req.url.split('/functions/')[0]}/rest/v1/rpc/set_anon_user_id`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.get('Authorization') || '',
          'apikey': req.headers.get('apikey') || '',
        },
        body: JSON.stringify({ anon_id: anonId }),
      }
    ).then(res => res.json());

    if (error) {
      throw new Error(`Error setting anonymous user ID: ${JSON.stringify(error)}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Anonymous ID set successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
