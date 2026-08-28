// Optional — Cloudflare Pages Function.
// Only active if you deploy on Cloudflare Pages (ignored by GitHub Pages,
// which has no serverless function support).
//
// Keeps GEMINI_API_KEY server-side instead of shipping it in the browser
// bundle. Set GEMINI_API_KEY as a secret in the Cloudflare Pages dashboard:
// Settings → Environment variables.
//
// Your frontend code would call this as: fetch('/api/gemini', { method: 'POST', body: ... })
// instead of calling the @google/genai SDK directly in the browser.

interface Env {
  GEMINI_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = await request.json();

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    const data = await upstream.text();

    return new Response(data, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Proxy request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
