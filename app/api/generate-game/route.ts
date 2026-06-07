import { NextResponse } from 'next/server';
import { generateGame } from '@/lib/server-store';

type GenerateBody = {
  prompt?: string;
  parent_id?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as GenerateBody;
  const prompt = body.prompt ?? '';
  const result = generateGame(prompt, body.parent_id);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ game: result.game, state: result.state });
}
