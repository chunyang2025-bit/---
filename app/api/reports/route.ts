import { NextResponse } from 'next/server';
import { reportGame } from '@/lib/server-store';

type ReportBody = {
  game_id?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as ReportBody;

  if (!body.game_id) {
    return NextResponse.json({ error: 'game_id is required' }, { status: 400 });
  }

  try {
    return NextResponse.json(reportGame(body.game_id));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'report failed' },
      { status: 401 }
    );
  }
}
