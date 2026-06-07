import { NextResponse } from 'next/server';
import { recordEvent } from '@/lib/server-store';
import type { AnalyticsEvent } from '@/lib/game-types';

export async function POST(request: Request) {
  const event = (await request.json()) as AnalyticsEvent;
  return NextResponse.json(recordEvent(event));
}
