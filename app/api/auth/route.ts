import { NextResponse } from 'next/server';
import { loginUser, logoutUser, registerUser } from '@/lib/server-store';

type AuthBody = {
  action?: 'login' | 'register' | 'logout';
  phone?: string;
  nickname?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as AuthBody;

  if (body.action === 'logout') {
    return NextResponse.json(logoutUser());
  }

  if (body.action === 'register') {
    const result = registerUser(body.phone ?? '', body.nickname ?? '', body.password ?? '');

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.state);
  }

  if (body.action === 'login') {
    const result = loginUser(body.phone ?? '', body.password ?? '');

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.state);
  }

  return NextResponse.json({ error: 'invalid auth action' }, { status: 400 });
}
