import { NextResponse } from 'next/server';
import { toggleSave } from '@/lib/server-store';

type SaveBody = {
  game_id?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as SaveBody;

  if (!body.game_id) {
    return NextResponse.json({ error: 'game_id is required' }, { status: 400 });
  }

  try {
    return NextResponse.json(toggleSave(body.game_id));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'save failed' },
      { status: 401 }
    );
  }
}
