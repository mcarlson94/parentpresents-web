// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://parentpresents.com",
  output: "static",

  // The old site tracked /birthday-wishes-for-mom and /birthday-wishes-for-mom/
  // as separate pages for years, splitting metrics and diluting search signals.
  // `trailingSlash: never` governs dev + link generation; `build.format: file`
  // emits /foo.html, which is what makes Cloudflare Pages 301 /foo/ -> /foo at
  // the edge. Both halves are required — the config alone does not enforce it
  // in production.
  trailingSlash: "never",
  build: {
    format: "file",
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
