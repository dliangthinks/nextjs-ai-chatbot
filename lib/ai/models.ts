import { openai } from '@ai-sdk/openai';
import { anthropic } from "@ai-sdk/anthropic";
import { google } from '@ai-sdk/google';
import { deepseek } from '@ai-sdk/deepseek';
//import { fireworks } from '@ai-sdk/fireworks';
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';

export const DEFAULT_CHAT_MODEL: string = 'chat-model-small';

export const myProvider = customProvider({
  languageModels: {
    'chat-model-small': openai('gpt-4o-mini'),
    'chat-model-flash': google('gemini-2.0-flash-exp'),
    'chat-model-large': anthropic('claude-3-7-sonnet-20250219'),
    'chat-model-reasoning': openai('o1-mini'),
    //'chat-model-deepseek': deepseek('deepseek-reasoner'),
   
    'title-model': openai('gpt-4o-mini'),
    'artifact-model': openai('gpt-4o-mini'),
  },
  imageModels: {
    'small-model': openai.image('dall-e-2'),
    'dalle': openai.image('dall-e-3'),
  },
});

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model-small',
    name: 'GPT 4o-mini',
    description: 'Fast and furious, for quick chats',
  },
  {
    id: 'chat-model-flash',
    name: 'Gemini Flash 2.0',
    description: 'Multimodal for everyday tasks',
  },
  {
    id: 'chat-model-large',
    name: 'Claude Sonnet 3.7',
    description: 'Excellent model for writing stuff',
  },
  {
    id: 'chat-model-reasoning',
    name: 'GPT o1-mini',
    description: 'When advanced reasoning is needed...',
  },
/*   {
    id: 'chat-model-deepseek',
    name: "DeepSeek R1",
    description: "Experience Chinese reasonining..."
  } */
];
