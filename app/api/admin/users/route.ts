import { auth } from '@/app/(auth)/auth';
import { getUsers } from '@/lib/db/queries';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return new Response('Unauthorized', { status: 401 });
  }
  try {
    const users = await getUsers();
    return Response.json(users);
  } catch (error) {
    return new Response('Failed to get users', { status: 500 });
  }
} 