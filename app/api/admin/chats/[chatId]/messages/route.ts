// app/api/admin/chats/[chatId]/messages/route.ts
import { auth } from '@/app/(auth)/auth';
import { getMessagesByChatId } from '@/lib/db/queries';
import { NextResponse } from 'next/server'; // Import NextResponse

export async function GET(
  request: Request,
  { params }: { params: Promise<{chatId: string}> }
) { 
  const { chatId } = await params;
  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 }); // Use NextResponse
  }
  try {
    const messages = await getMessagesByChatId(chatId);
    console.log("Retrieved messages for chat:", chatId, messages);
    return NextResponse.json(messages); // Use NextResponse
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 }); // Use NextResponse
  }
}