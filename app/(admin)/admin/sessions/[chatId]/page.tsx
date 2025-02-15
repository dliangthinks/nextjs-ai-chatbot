'use client';

import { useEffect, useState, use } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  chatId: string;
  role: string;
  content: any; // Adjust type as needed (e.g., string if content is text)
  createdAt: Date;
}

export default function SessionMessagesPage({ params }: { params: Promise<{ chatId: string }> }) {
  // Unwrap the params Promise
  const { chatId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/admin/chats/${chatId}/messages`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Failed to load messages', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadMessages();
  }, [chatId]);

  if (isLoading) {
    return <div className="p-4">Loading messages...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Session Messages</h1>
        <Button variant="outline" asChild>
          <Link href="/admin">Back to Admin</Link>
        </Button>
      </div>
      <div className="space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className="border p-2 rounded">
            <div className="text-sm font-medium">Role: {msg.role}</div>
            <div className="text-sm">Content: {JSON.stringify(msg.content)}</div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(msg.createdAt), 'PPpp')}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground">
            No messages in this session.
          </div>
        )}
      </div>
    </div>
  );
} 