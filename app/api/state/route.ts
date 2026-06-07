import { NextResponse } from 'next/server';
import { snapshot } from '@/lib/server-store';

export async function GET() {
  return NextResponse.json(snapshot());
}
