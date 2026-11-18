# FSEG Wealth Consultant

Thai website and article management system for FSEG Wealth Consultant.

## Contents

- `legacy-pages.json`: original website pages, served by the Worker.
- `public/`: images, styles, and browser scripts.
- `lib/cms.ts`: article API, rendering, and server-side administrator authorization.
- `public/cms-admin.js`: article editor and management UI.
- `db/schema.ts` and `drizzle/`: database schema and append-only migrations.
- `tests/cms-flow.py`: local integration checks.

## Requirements and local development

Node.js 22.13 or newer is required.

```sh
npm install
npm run build
```

Apply the SQL files in `drizzle/` to the local database in filename order using Wrangler, then run `npm run dev`. The starter's local sign-in uses a development-only test account; production authorization is restricted server-side to the configured administrator. Never expose a local development server publicly.

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_brave_molecule_man.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_loud_nightmare.sql
npm run dev
```

## Hosting

The existing website is hosted by Sites. Its project identity and logical D1/R2 bindings are in `.openai/hosting.json`. Publish through the Sites workflow; uploading code here does not automatically deploy the website.

Live website: https://fseg-wealth-career-preview.jammyjoust.chatgpt.site/

Admin entry: `/admin/` (ChatGPT sign-in required).

This repository contains source code and static assets. Production D1 article records, uploaded R2 media, credentials, dependency folders, and local runtime state are not included. Those require separate authorized backups. Existing article records and uploads remain in the live hosting service.
