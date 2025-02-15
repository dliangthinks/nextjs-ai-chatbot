'use client';

import { useEffect, useState, use } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  messageCount: number;
  model?: string;
}

interface Message {
  id: string;
  chatId: string;
  role: string;
  content: any;
  createdAt: Date;
}

// Expect params to be a Promise that resolves to an object with "id" (user id)
export default function UserActivityPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params using React.use()
  const { id } = use(params);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');
  
  // State for toggling expanded chat sessions
  const [expandedChats, setExpandedChats] = useState<string[]>([]);
  // State for storing messages keyed by chat id
  const [messagesByChat, setMessagesByChat] = useState<{ [key: string]: Message[] }>({});
  // Loading state for individual chat messages
  const [loadingChats, setLoadingChats] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const loadActivity = async () => {
      try {
        // Assume the API returns an object: { chats: Chat[], userEmail: string }
        const response = await fetch(`/api/admin/users/${id}/activity`);
        if (response.ok) {
          const data = await response.json();
          setChats(data.chats);
          setUserEmail(data.userEmail);
        }
      } catch (error) {
        console.error('Failed to load activity', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadActivity();
  }, [id]);

  // Function to toggle the display of messages for a chat session
  const toggleChat = async (chatId: string) => {
    if (expandedChats.includes(chatId)) {
      setExpandedChats(expandedChats.filter(item => item !== chatId));
    } else {
      setExpandedChats([...expandedChats, chatId]);
      // Only fetch messages if not already fetched
      if (!messagesByChat[chatId]) {
        setLoadingChats(prev => ({ ...prev, [chatId]: true }));
        try {
          const res = await fetch(`/api/admin/chats/${chatId}/messages`);
          if (res.ok) {
            const msgs = await res.json();
            setMessagesByChat(prev => ({ ...prev, [chatId]: msgs }));
          }
        } catch (err) {
          console.error('Failed to fetch messages for chat', chatId, err);
        } finally {
          setLoadingChats(prev => ({ ...prev, [chatId]: false }));
        }
      }
    }
  };

  if (isLoading) {
    return <div className="p-4 bg-background text-primary">Loading activity...</div>;
  }

  return (
    <div className="p-4 space-y-4 bg-background text-primary">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Activity for {userEmail}</h1>
        <Button variant="outline" asChild>
          <Link href="/admin">Back to Admin</Link>
        </Button>
      </div>
      {chats.map(chat => (
        <div key={chat.id} className="border rounded bg-card p-4 transition-colors hover:bg-accent">
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleChat(chat.id)}
          >
            <div className="font-semibold">{chat.title}</div>
            <div className="text-sm">Messages: {chat.messageCount}</div>
          </div>
          {chat.model && (
            <div className="text-xs text-muted-foreground">
              Model: {chat.model}
            </div>
          )}
          <div className="mt-2 text-xs text-muted-foreground">
            Created: {format(new Date(chat.createdAt), 'PPpp')}
          </div>
          {expandedChats.includes(chat.id) && (
            <div className="mt-4">
              {loadingChats[chat.id] ? (
                <div>Loading messages...</div>
              ) : messagesByChat[chat.id] && messagesByChat[chat.id].length > 0 ? (
                messagesByChat[chat.id].map(msg => (
                  <div key={msg.id} className="border p-2 rounded mb-2">
                    <div className="text-sm font-medium">
                      {msg.role === 'assistant' ? 'Assistant:' : 'User:'}
                    </div>
                    <div className="text-sm">
                      <pre className="whitespace-pre-wrap p-2 bg-black text-white rounded mt-1">
                        {(() => {
                          if (typeof msg.content === 'string') {
                            return msg.content;
                          } else if (Array.isArray(msg.content)) {
                            // If it's an array of segments, extract the 'text' property if available
                            return msg.content
                              .map(item =>
                                typeof item === 'object' && item.text ? item.text : JSON.stringify(item, null, 2)
                              )
                              .join('\n');
                          } else {
                            return JSON.stringify(msg.content, null, 2);
                          }
                        })()}
                      </pre>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(msg.createdAt), 'PPpp')}
                    </div>
                  </div>
                ))
              ) : (
                <div>No messages in this session.</div>
              )}
            </div>
          )}
        </div>
      ))}
      {chats.length === 0 && <div className="text-center">No activity found</div>}
    </div>
  );
} 