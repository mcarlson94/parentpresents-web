# ParentPresents

Marketing site for ParentPresents — gift guides that help adult children find
thoughtful gifts for their parents.

The brand promise is emotional trust, not search volume: short guides, honest
caveats, and no paid placement. Content decisions should be made against that
standard rather than against traffic.

## Getting started

```bash
npm install
npm run dev
```

The site runs at http://localhost:3000.

## Scripts

| Command         | What it does                                   |
| --------------- | ---------------------------------------------- |
| `npm run dev`   | Dev server with hot reload                     |
| `npm run build` | Production build (also the strictest TS check) |
| `npm start`     | Serve the production build                     |
| `npm run lint`  | ESLint via `eslint-config-next`                |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4.

## Content

Guides live as typed data in [`src/content/guides.ts`](src/content/guides.ts)
and render through a single dynamic route at `/guides/[slug]`. Adding a guide
means adding an entry to that array — not building a new page.
