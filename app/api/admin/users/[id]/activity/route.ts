import { auth } from '@/app/(auth)/auth';
import { getUserActivity, getUserById, getMessagesByChatId } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{id: string}> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const [user] = await getUserById(id);
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }
    const chats = await getUserActivity(id) as any[];
    // Loop through each chat session and compute the accurate message count
    for (let chat of chats) {
      const messages = await getMessagesByChatId(chat.id);
      chat.messageCount = messages.length;
    }
    return Response.json({
      chats,
      userEmail: user.email,
    });
  } catch (error) {
    return new NextResponse('Failed to get user activity', { status: 500 });
  }
} 