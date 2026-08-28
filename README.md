# Tutoria - Premier Home Tutoring in West Bengal

Verified Home Tutors for KG to Class 12 across West Bengal (Kolkata, Howrah, Siliguri, Durgapur, Asansol, and more).

## Tech Stack
- React 18+
- TypeScript
- Vite
- Tailwind CSS

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Copy the env file and fill in your key:**
   ```bash
   cp .env.example .env
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

## Deployment

This project was originally scaffolded for Google AI Studio (server-injected
`GEMINI_API_KEY`, Cloud Run). It's now a plain static Vite build, so it can
ship to either GitHub Pages or Cloudflare Pages with no server required.

### Cloudflare Pages
1. Push this repo to GitHub/GitLab and connect it in the Cloudflare Pages dashboard.
2. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
3. Add `VITE_GEMINI_API_KEY` under Settings → Environment variables (or
   `GEMINI_API_KEY` if you use the `functions/api/gemini.ts` proxy instead —
   see that file for details).
4. Deploy. Cloudflare rebuilds automatically on every push.

### GitHub Pages
1. In your repo, go to Settings → Pages → Source → "GitHub Actions".
2. Add a repo secret named `VITE_GEMINI_API_KEY` (Settings → Secrets and
   variables → Actions).
3. Push to `main` — `.github/workflows/deploy.yml` builds and publishes
   `dist` automatically.
4. If this will live at `https://<user>.github.io/<repo-name>/` (a project
   site, not a custom domain or user/org site), update `base` in
   `vite.config.ts` to `'/<repo-name>/'` before deploying — otherwise assets
   will 404.

## Note on the Gemini API key
Static hosts can't keep a server-side secret hidden from the browser unless
you use a serverless function (Cloudflare Pages Functions support this;
GitHub Pages does not). See `.env.example` for both options.

## Project Structure
- `/src/components` - UI components (Header, Footer, Modals, etc.)
- `/src/pages` - Application pages (Home, Apply, Contact, Review, Join Tutor)
- `/src/data.ts` - Configuration, pricing, areas, and initial data
- `/src/types.ts` - TypeScript interfaces & models
- `/src/index.css` - Global styling and design system
- `/public` - Static assets (logo, photos)
