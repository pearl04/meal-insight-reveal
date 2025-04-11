
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
    const requestBody = await req.json();
    const { image, apiKey } = requestBody;
    
    // First try to use API key from the request body
    let openRouterKey = apiKey || "";
    
    // If no API key in request, try environment variable
    if (!openRouterKey) {
      console.log("No API key in request body, checking environment variable");
      openRouterKey = Deno.env.get("OPENROUTER_API_KEY") || "";
      if (openRouterKey) {
        console.log("Found API key in environment variable");
      }
    } else {
      console.log("Using API key from request body");
    }
    
    if (!openRouterKey) {
      console.error("No OpenRouter API key found from any source");
      return new Response(
        JSON.stringify({ 
          error: "Missing API key", 
          message: "No OpenRouter API key provided in request or environment" 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Making request to OpenRouter API");
    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openRouterKey}`,
        "HTTP-Referer": "https://mealsnap.app", 
      },
      body: JSON.stringify({
        model: "openrouter/optimus-alpha",
        messages: [
          {
            role: "system",
            content: `
You are a nutritionist AI that analyzes food images. Only return a pure JSON array like this:

[
  {
    "id": "1",
    "name": "Pasta",
    "nutrition": { "calories": 400, "protein": 10, "carbs": 50, "fat": 15 },
    "healthy_swap": "Use whole wheat pasta",
    "rating": 6
  }
]
No explanation, markdown, or text. Only JSON array.`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this meal and return JSON." },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
      }),
    });

    if (!openRouterRes.ok) {
      const errorData = await openRouterRes.text();
      console.error(`OpenRouter API error (${openRouterRes.status}): ${errorData}`);
      return new Response(
        JSON.stringify({ 
          error: "OpenRouter API error", 
          status: openRouterRes.status,
          details: errorData
        }),
        { 
          status: openRouterRes.status, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    const raw = await openRouterRes.text();
    console.log("OpenRouter API response received successfully");

    return new Response(raw, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error in get-nutrition function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
