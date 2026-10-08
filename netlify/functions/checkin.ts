// Netlify-Version des digitalen Check-ins (/api/checkin); nutzt dieselbe Logik wie die Cloudflare-Funktion.
import { onRequestPost } from '../../functions/api/checkin';

export default async (request: Request) => {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  }
  return onRequestPost({ request });
};

export const config = { path: '/api/checkin' };
