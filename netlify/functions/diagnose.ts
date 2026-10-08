// Netlify-Version der KI-Diagnose (/api/diagnose); nutzt dieselbe Logik wie die Cloudflare-Funktion.
import { onRequestPost } from '../../functions/api/diagnose';

export default async (request: Request) => {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  }
  return onRequestPost({ request, env: { GEMINI_API_KEY: process.env.GEMINI_API_KEY } });
};

export const config = { path: '/api/diagnose' };
