import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchProperties from "./tools/search-properties";
import getProperty from "./tools/get-property";
import listArticles from "./tools/list-articles";
import getArticle from "./tools/get-article";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "immo-link-senegal-mcp",
  title: "Immo Link Sénégal MCP",
  version: "0.1.0",
  instructions:
    "Tools to search and read public real-estate listings and articles from Immo Link Sénégal (immolinksenegal.com). Use `search_properties` to find listings, `get_property` for full details, `list_articles` and `get_article` for the blog.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchProperties, getProperty, listArticles, getArticle],
});
