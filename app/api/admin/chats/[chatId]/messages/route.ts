import { auth } from '@/app/(auth)/auth';
import { getMessagesByChatId } from '@/lib/db/queries';

export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return new Response('Unauthorized', { status: 401 });
  }
  try {
    const messages = await getMessagesByChatId(params.chatId);
    console.log("Retrieved messages for chat:", params.chatId, messages);
    return Response.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new Response('Failed to get messages', { status: 500 });
  }
} 