# Apollo Workbench — Vercel Deploy

Static lead-intelligence + CRM tool. No backend, no build step. Pure HTML + JSON.

## What's here

```
.
├── index.html                              Landing page (picks dashboard or CRM)
├── beautiful-dashboard.html                Executive analytics dashboard
├── marketing-tool.html                     CRM workbench (browse / pipeline / reminders)
├── dashboard/static/apollo/
│   ├── _index.json                         Full contact index (~18 MB, 115,664 rows)
│   └── summary.json                        Aggregated stats by market
├── vercel.json                             Cache + security headers
└── .gitignore
```

## WARNING — Privacy

This deployment exposes **115,664 contact emails** to anyone with the URL. Before you make it public, decide:

| Audience | Recommendation |
|---|---|
| Just you | Keep it local (`python -m http.server`) or use Vercel password protection |
| Your team | Vercel Pro password protection (~$20/mo) or Cloudflare Access (free tier) |
| Public | Don't. GDPR / data-protection risk. |

See "Adding password protection" below.

---

## Deploy to Vercel

### Option A — via Vercel CLI (fastest)

```bash
npm i -g vercel
vercel login
cd vercel-deploy
vercel --prod
```

First run asks a few questions; accept defaults. Subsequent runs just redeploy.

### Option B — via GitHub (recommended for ongoing work)

1. Create a new **private** GitHub repo (keep it private — it contains your contacts).
2. Push this folder:
   ```bash
   cd vercel-deploy
   git init
   git add .
   git commit -m "Initial deploy"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
3. In Vercel dashboard → **Add New Project** → import the repo.
4. Framework preset: **Other** (it's plain static). Build command: none. Output dir: `.` (default).
5. Deploy.

---

## Adding password protection

### Free: client-side password gate

Add this script before `</body>` in every HTML file (index, dashboard, marketing-tool):

```html
<script>
(function(){
  var hash = '<PASTE_SHA256_OF_YOUR_PASSWORD>';
  async function sha256(s){
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  var ok = sessionStorage.getItem('apollo_ok') === '1';
  if (!ok) {
    (async () => {
      const p = prompt('Password:');
      if (!p || await sha256(p) !== hash) { document.body.innerHTML = ''; return; }
      sessionStorage.setItem('apollo_ok','1');
    })();
  }
})();
</script>
```

To compute the SHA-256 of your password in the browser console:
```js
crypto.subtle.digest('SHA-256', new TextEncoder().encode('your-password')).then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
```

This is obfuscation, not security — the data files are still reachable at their URLs for anyone who guesses them. It stops casual visitors.

### Real: Vercel password protection

Vercel → Project → Settings → **Deployment Protection** → enable (requires Pro plan).

### Real: Cloudflare Access (free tier, 50 users)

Put Cloudflare in front of your Vercel domain → Zero Trust → Access → Applications → Self-hosted → require login. Google/Microsoft/email OTP supported.

---

## Keeping data fresh

The JSON files are baked into each deploy. To update after you've scraped new leads:

1. Run your processing script locally (regenerates `_index.json` + `summary.json`).
2. Copy the new files to `vercel-deploy/dashboard/static/apollo/`.
3. Commit + push (if using GitHub), or `vercel --prod` (CLI) — Vercel redeploys.

Cache headers serve the JSON for 1 hour with 1-day stale-while-revalidate, so fresh visitors may see old data briefly after a deploy.

---

## Local preview before deploying

```bash
cd vercel-deploy
python -m http.server 8000
# open http://127.0.0.1:8000/
```

Or use `npx vercel dev` for Vercel-identical behavior including the headers from `vercel.json`.
