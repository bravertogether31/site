import { createFileRoute } from "@tanstack/react-router";

const origin = "https://bravertogether.site";
// Public pages are deliberately static so crawlers are never blocked by the
// database, Neon auth, a cold compute, or a temporary upstream outage.
// New competition slugs should be added here as part of publication.
const paths = [
  "/", "/about", "/team", "/resources", "/advisors",
  "/competitions", "/events", "/news", "/decoder",
  "/privacy", "/safety", "/community-guidelines",
  "/competitions/digital-legal-rights-essay-2026",
  "/competitions/voice-on-trial-vidolo-bravertogether-2026",
] as const;
const xml = '<?xml version="1.0" encoding="UTF-8"?>' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
  paths.map((path) => `<url><loc>${origin}${path}</loc></url>`).join("") +
  "</urlset>";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => new Response(xml, {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=1800, s-maxage=3600",
          "X-Content-Type-Options": "nosniff",
        },
      }),
    },
  },
});
