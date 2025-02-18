import { auth } from '@/app/(auth)/auth';
import { getUsers } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  try {
    const users = await getUsers();
    return Response.json(users);
  } catch (error) {
    return new NextResponse('Failed to get users', { status: 500 });
  }
} 