/**
 * Cloudflare Worker: Universal Media Stream & Proxy Gateway
 * 
 * Free tier: 100,000 requests/day.
 * Deploy with Wrangler: `npx wrangler deploy`
 */

export default {
  async fetch(request) {
    // Enable CORS for frontend and backend
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, User-Agent',
        },
      });
    }

    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'Missing ?url= query parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Forward request from Cloudflare edge IP with clean Android/Desktop browser headers
    const headers = new Headers();
    headers.set(
      'User-Agent',
      'Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/UD1A.230803.041) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36'
    );
    headers.set('Accept-Language', 'en-US,en;q=0.9');

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers,
      });

      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');

      return new Response(response.body, {
        status: response.status,
        headers: responseHeaders,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return new Response(JSON.stringify({ error: 'Edge fetch failed', details: msg }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  },
};
