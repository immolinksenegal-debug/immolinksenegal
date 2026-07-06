import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_articles",
  title: "List published articles",
  description: "List published real-estate articles from the Immo Link blog.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 10)."),
    featuredOnly: z.boolean().optional().describe("Only featured articles."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, featuredOnly }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false } }
    );
    let q = supabase
      .from("articles")
      .select("id,slug,title,excerpt,featured_image,is_featured,published_at,views")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit ?? 10);
    if (featuredOnly) q = q.eq("is_featured", true);

    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { articles: data ?? [] },
    };
  },
});
