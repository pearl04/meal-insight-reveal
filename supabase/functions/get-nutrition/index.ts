// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { image } = await req.json();

  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) {
    return new Response("Missing API key", { status: 500 });
  }

  const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://yourdomain.com", // update with your frontend domain
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

  const raw = await openRouterRes.text();

  return new Response(raw, {
    headers: { "Content-Type": "application/json" },
    status: openRouterRes.status,
  });
});
