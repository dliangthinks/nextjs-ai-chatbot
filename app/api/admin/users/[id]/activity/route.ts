import { auth } from '@/app/(auth)/auth';
import { getUserActivity, getUserById, getMessagesByChatId } from '@/lib/db/queries';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const [user] = await getUserById(params.id);
    if (!user) {
      return new Response('User not found', { status: 404 });
    }
    const chats = await getUserActivity(params.id) as any[];
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
    return new Response('Failed to get user activity', { status: 500 });
  }
} 