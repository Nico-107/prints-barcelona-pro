# IndexNow — Manual Submission Guide

IndexNow notifies Bing, Yandex, Naver, and Seznam that pages have changed so they re-crawl faster. Google does not participate in IndexNow; use Google Search Console for Google.

## When to run

Run `npm run indexnow` manually after each Vercel deploy that **changes pages** (new content, updated copy, new routes). There is no benefit to running it on every deploy if nothing visible changed.

## How it works

`scripts/indexnow.mjs` reads `dist/sitemap.xml`, collects all `<loc>` URLs, and POSTs them as a JSON batch to `https://api.indexnow.org/indexnow`. The script prints the HTTP status for each call.

The API key file is served at `https://www.dimension3dprints.com/53a326533ad9c012c9c17143626f9eed.txt`.

## Usage

```bash
# Submit every URL in the sitemap (run after a full rebuild)
npm run build
npm run indexnow

# Submit only specific paths (e.g. after updating one page)
node scripts/indexnow.mjs /adaptador-vesa-monitor /embudo-dosificador-cafe-58mm
```

## Expected response

HTTP 200 means accepted. HTTP 202 means accepted but not yet validated. Any 4xx indicates a problem with the request (check the key file is accessible at the key location URL).

## Key details

- Key: `53a326533ad9c012c9c17143626f9eed`
- Key file: `public/53a326533ad9c012c9c17143626f9eed.txt`
- Endpoint: `https://api.indexnow.org/indexnow`
- Max URLs per call: 10,000 (the script chunks automatically if needed)
