import { NextRequest, NextResponse } from 'next/server';

const BACKEND = 'https://cosmo-care.onrender.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const upstream = await fetch(`${BACKEND}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // Render free-tier can cold-start; give it up to 60 s
      signal: AbortSignal.timeout(60_000),
    });

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upstream request failed';
    const isTimeout = message.includes('timed out') || message.includes('abort');
    return NextResponse.json(
      { error: isTimeout ? 'Backend is waking up — please try again in a few seconds.' : message },
      { status: 503 },
    );
  }
}
