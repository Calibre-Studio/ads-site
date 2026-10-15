// AI agents that ask for Markdown (Accept: text/markdown, or ?md) get index.md instead of the HTML page.
export const config = { matcher: '/' };

export default function middleware(request) {
  const url = new URL(request.url);
  const accept = request.headers.get('accept') || '';
  if (accept.includes('text/markdown') || url.searchParams.has('md')) {
    return new Response(null, {
      headers: { 'x-middleware-rewrite': new URL('/index.md', request.url).toString() },
    });
  }
  return new Response(null, { headers: { 'x-middleware-next': '1' } });
}
