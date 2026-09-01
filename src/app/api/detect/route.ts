import { NextRequest, NextResponse } from 'next/server';

const BACKEND = 'https://cosmo-care.onrender.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const upstream = await fetch(`${BACKEND}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upstream request failed';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
