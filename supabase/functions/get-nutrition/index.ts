
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
    const { image, text, pro } = await req.json();
    const openRouterKey = Deno.env.get("OPENROUTER_API_KEY") || "";

    if (!openRouterKey) {
      console.error("❌ No OpenRouter API key found");
      return new Response(JSON.stringify({
        error: "Missing API key",
        message: "No OpenRouter API key provided in environment"
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const selectedModel = pro
      ? "openai/gpt-4-vision-preview"
      : "openrouter/optimus-alpha";

    console.log("🧠 Using model:", selectedModel);

    // Prepare the message content based on whether we have image or text
    let messageContent;
    if (image) {
      messageContent = [
        { type: "text", text: "Analyze this meal image and return JSON as instructed." },
        { type: "image_url", image_url: { url: image } }
      ];
    } else if (text) {
      messageContent = [
        { type: "text", text: `Analyze these food items and return JSON as instructed: ${text}` }
      ];
    } else {
      return new Response(JSON.stringify({
        error: "Invalid input",
        message: "Either image or text must be provided"
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
        "HTTP-Referer": "https://mealsnap.app", // must match registered domain
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: "system",
            content: `
You are a nutritionist AI that analyzes food images. 
Only return a pure JSON array like this:

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

✅ Add units: "kcal" for calories and "g" for macros.
✅ Add a brief assumptions section after the array.
For example: "Exact values depend on portion size, cheese quantity, sauce ingredients, and drink type."
Do not return anything else. No markdown. No explanation. Just the JSON array and a string line below it.`.trim(),
          },
          {
            role: "user",
            content: messageContent
          }
        ]
      }),
    });

    if (!openRouterRes.ok) {
      const errorText = await openRouterRes.text();
      console.error("❌ OpenRouter API error:", errorText);
      return new Response(JSON.stringify({
        error: "OpenRouter API error",
        message: errorText,
      }), {
        status: openRouterRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await openRouterRes.json();
    console.log("📦 Raw OpenRouter response:", JSON.stringify(data, null, 2));

    const rawContent = data.choices?.[0]?.message?.content?.trim();

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
