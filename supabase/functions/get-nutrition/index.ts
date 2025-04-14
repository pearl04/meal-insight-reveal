
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    const openRouterKey = Deno.env.get("OPENROUTER_API_KEY") || "";

    console.log("🔐 API KEY PRESENT?", !!openRouterKey);

    if (!openRouterKey) {
      return new Response(JSON.stringify({
        error: "Missing API key",
        message: "No OpenRouter API key provided in environment"
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const selectedModel = "google/gemini-2.5-pro-exp-03-25:free";
    console.log("🧠 Using model:", selectedModel);

    if (!text) {
      return new Response(JSON.stringify({
        error: "Invalid input",
        message: "Text must be provided"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openRouterKey}`,
        "HTTP-Referer": "http://localhost:8080", // Must match registered domain
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: "system",
            content: `
You are a nutritionist AI that analyzes food items.
Return ONLY a JSON array like:

[
  {
    "id": "1",
    "name": "Pasta",
    "nutrition": {
      "calories": "450–550 kcal",
      "protein": "15–20g",
      "carbs": "50–60g",
      "fat": "20–25g"
    },
    "healthy_swap": "Use whole wheat pasta",
    "rating": 6
  }
]

- Include units: "kcal" for calories, "g" for macros.
- Add ONE assumptions line after JSON like:
"Exact values depend on portion size, cheese, and ingredients."

Do NOT include explanations, intro, markdown, or formatting.`.trim()

          },
          {
            role: "user",
            content: `Analyze these food items and return JSON as instructed: ${text}`
          }
        ]
      }),
    });

    if (!openRouterRes.ok) {
      const errorText = await openRouterRes.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = errorText;
      }

      console.error("❌ OpenRouter API error:", errorJson);

      return new Response(JSON.stringify({
        error: "OpenRouter API error",
        message: errorJson,
      }), {
        status: openRouterRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await openRouterRes.json();
    console.log("📦 Raw OpenRouter response:", JSON.stringify(data, null, 2));

    const rawContent = data.choices?.[0]?.message?.content?.trim();
    console.log("🧪 rawContent from Gemini:", rawContent);


    const match = rawContent?.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!match) {
      console.error("❌ No valid JSON array found in AI response:", rawContent);
      return new Response(JSON.stringify({
        error: "Invalid AI response format",
        raw: rawContent,
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanedJsonArray = match[0];

    return new Response(cleanedJsonArray, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("❌ Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Something went wrong";
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      message: errorMessage,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
