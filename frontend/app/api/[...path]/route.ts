import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:4000';

async function proxyToBackend(req: NextRequest, path: string[]) {
  const backendPath = path.join('/');
  const search = req.nextUrl.search;
  const backendUrl = `${BACKEND}/api/${backendPath}${search}`;

  const forwardHeaders = new Headers();
  const contentType = req.headers.get('content-type');
  if (contentType) forwardHeaders.set('content-type', contentType);
  const auth = req.headers.get('authorization');
  if (auth) forwardHeaders.set('authorization', auth);

  const init: RequestInit = { method: req.method, headers: forwardHeaders };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const text = await req.text();
    if (text) init.body = text;
  }

  const upstream = await fetch(backendUrl, init);

  // Stream SSE responses without buffering
  const contentTypeHeader = upstream.headers.get('content-type') || '';
  if (contentTypeHeader.includes('text/event-stream')) {
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  }

  // Forward files / binary streams with original Content-Disposition filename
  const contentDisposition = upstream.headers.get('content-disposition');
  if (contentDisposition || !contentTypeHeader.includes('application/json')) {
    const responseHeaders = new Headers();
    if (contentDisposition) responseHeaders.set('Content-Disposition', contentDisposition);
    if (contentTypeHeader) responseHeaders.set('Content-Type', contentTypeHeader);
    const contentLength = upstream.headers.get('content-length');
    if (contentLength) responseHeaders.set('Content-Length', contentLength);

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  }

  const body = await upstream.text();
  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
    },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyToBackend(req, path);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyToBackend(req, path);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyToBackend(req, path);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyToBackend(req, path);
}
