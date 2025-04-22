'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { memo } from 'react';

interface SuggestedActionsProps {
  chatId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
}

function PureSuggestedActions({ chatId, append }: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: 'Weather in Cupertino',
      label: 'What is the weather in Cupertino?',
      action: 'What is the weather in Cupertino?',
    },
    {
      title: 'Counting',
      label: `How many 'r's are in the word strawberry?`,
      action: `How many 'r's are in the word strawberry?`,
    },
    {
      title: 'Writing with constrains',
      label: `Write a short story of exactly 100 characters long and using only the first 100 Chinese characters.`,
      action: `Write a short story of exactly 100 characters long and using only the first 100 Chinese characters.`,
    },
    {
      title: 'Math with strong reasoning',
      label: 'Three different pairs of shoes are placed in a row so that no left shoe is next to a right shoe from a different pair. In how many ways can these six shoes be lined up?',
      action: 'Three different pairs of shoes are placed in a row so that no left shoe is next to a right shoe from a different pair. In how many ways can these six shoes be lined up?',
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 gap-2 w-full">
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              window.history.replaceState({}, '', `/chat/${chatId}`);

              append({
                role: 'user',
                content: suggestedAction.action,
              });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm w-full h-auto justify-start items-start whitespace-normal"
          >
            <div className="flex flex-col gap-1 w-full">
              <span className="font-medium">{suggestedAction.title}</span>
              <span className="text-muted-foreground break-words">
                {suggestedAction.label}
              </span>
            </div>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
