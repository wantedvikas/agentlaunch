# Deploying

Every host needs the same three things:

1. **A hosted Supabase project** with migrations applied: `pnpm exec supabase link --project-ref <ref>`, then `pnpm exec supabase db push`. This does **not** run the seed.
2. **Supabase Auth URL settings**: Site URL = your domain, and Redirect URLs include `https://your-domain/**`.
3. **Environment variables** from `.env.example`. `NEXT_PUBLIC_*` values are baked in **at build time**: change them, then rebuild.

Run `pnpm run doctor` with production values to catch mistakes before deploying. Never set the Supabase secret / service_role key on the web app; it doesn't need it.

## Vercel (reference)

1. Import the repository in Vercel. It detects Next.js and pnpm automatically.
2. Add the environment variables (Production and Preview).
3. Deploy. Add your custom domain, then update `NEXT_PUBLIC_SITE_URL` and the Supabase Auth URLs to match, and redeploy.
4. Preview deployments get random URLs. Add `https://*-your-team.vercel.app/**` to Supabase Redirect URLs if you want auth to work on previews.

## Docker (any container host)

```bash
docker build -t my-app \
  --build-arg NEXT_PUBLIC_SITE_URL=https://app.example.com \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_... \
  .
docker run -p 3000:3000 \
  -e EMAIL_TRANSPORT=resend -e RESEND_API_KEY=... -e EMAIL_FROM="App <hi@example.com>" \
  my-app
```

- Pass every `NEXT_PUBLIC_*` value with `--build-arg`. The `Dockerfile` lists them all.
- Pass server secrets (email) with `-e` at runtime, never as build args (build args are visible in image history).
- The image runs as a non-root user on port 3000, built from Next's standalone output.

## Railway

1. New project → Deploy from GitHub repo. Railway detects the `Dockerfile`.
2. Variables: add everything from `.env.example`. Railway passes service variables as Docker build args automatically, so `NEXT_PUBLIC_*` values reach the build.
3. Settings → Networking → Generate domain (or add yours), then set `NEXT_PUBLIC_SITE_URL` and redeploy.

## Fly.io

```bash
fly launch --no-deploy          # detects the Dockerfile; choose a region
fly secrets set EMAIL_TRANSPORT=resend RESEND_API_KEY=... EMAIL_FROM="App <hi@example.com>"
fly deploy \
  --build-arg NEXT_PUBLIC_SITE_URL=https://my-app.fly.dev \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Set `internal_port = 3000` in `fly.toml` if it wasn't detected. `fly secrets` are runtime-only, so public values still go through `--build-arg`.

## After any deploy

- Sign up with a real email and confirm it. If the link fails, the Site URL or Redirect URLs are wrong.
- Check `/robots.txt`, `/sitemap.xml` and `/opengraph-image` show your domain.
- Configure custom SMTP in Supabase before inviting real users.
