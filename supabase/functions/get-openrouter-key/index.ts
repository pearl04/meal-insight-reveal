// @ts-ignore
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// @ts-ignore
serve(async (req) => {
  // secure and store your key in Supabase secrets
  // @ts-ignore
  const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

  if (!OPENROUTER_API_KEY) {
    return new Response("API key not found", { status: 500 });
  }

  return new Response(
    JSON.stringify({ key: OPENROUTER_API_KEY }),
    {
      headers: { "Content-Type": "application/json" }
    }
  );
});
