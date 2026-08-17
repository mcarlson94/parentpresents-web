import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export. The site is content pages with no server runtime, and the
  // deploy target is Cloudflare Pages (see public/_headers, public/_redirects).
  output: "export",

  // The old site tracked /birthday-wishes-for-mom and /birthday-wishes-for-mom/
  // as separate pages for years, splitting metrics and diluting search signals.
  // `trailingSlash: false` is Next's default; it is set explicitly because it is
  // load-bearing. With `output: "export"` it emits /foo.html rather than
  // /foo/index.html, which is what makes Cloudflare Pages 301 /foo/ -> /foo at
  // the edge. Both halves are required.
  trailingSlash: false,

  // Static export has no image optimiser at request time. Dimensions are still
  // required at every call site so this costs no layout shift.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
