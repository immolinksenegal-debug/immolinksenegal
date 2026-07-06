/// <reference types="node" />
import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "search_properties",
  title: "Search properties",
  description:
    "Search approved property listings on Immo Link Sénégal. Filter by city, type, price range, bedrooms, and more.",
  inputSchema: {
    city: z.string().optional().describe("Filter by city (e.g. Dakar, Thiès, Saly)."),
    type: z
      .string()
      .optional()
      .describe("Property type (e.g. villa, appartement, maison, terrain, bureau)."),
    minPrice: z.number().optional().describe("Minimum price in FCFA."),
    maxPrice: z.number().optional().describe("Maximum price in FCFA."),
    minBedrooms: z.number().int().optional().describe("Minimum number of bedrooms."),
    status: z
      .string()
      .optional()
      .describe("Listing status (e.g. 'à vendre', 'à louer'). Defaults to all."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false } }
    );
    let q = supabase
      .from("properties")
      .select(
        "id,title,type,city,location,price,bedrooms,bathrooms,surface,status,is_featured,is_premium,images,created_at"
      )
      .eq("approval_status", "approved")
      .order("created_at", { ascending: false })
      .limit(input.limit ?? 20);

    if (input.city) q = q.ilike("city", `%${input.city}%`);
    if (input.type) q = q.ilike("type", `%${input.type}%`);
    if (input.status) q = q.ilike("status", `%${input.status}%`);
    if (input.minPrice != null) q = q.gte("price", input.minPrice);
    if (input.maxPrice != null) q = q.lte("price", input.maxPrice);
    if (input.minBedrooms != null) q = q.gte("bedrooms", input.minBedrooms);

    const { data, error } = await q;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { properties: data ?? [] },
    };
  },
});
