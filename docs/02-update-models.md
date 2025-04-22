# Update Models


To update the models, you will need to update the custom provider called `myProvider` at `/lib/ai/models.ts` shown below.


several things to do:
- install the library by bash: pnpm add @ai-sdk/anthropic, or pnpm add @ai-sdk/google
- then import it in the code: import { anthropic } from "@ai-sdk/anthropic"; import { google } from '@ai-sdk/google';
- add the model to the dropdown with new id
		id: 'chat-model-flash',
		name: 'Gemini Flash 2.0',
		id: 'chat-model-large',
		name: 'Claude Sonnet 3.5',
- set up new env variable to work with different vendor in vercel: 
	- ANTHROPIC_API_KEY
	- GOOGLE_GENERATIVE_AI_API_KEY
	- 
- vercel en pull to update the variables



| models      | image input | object generation | tool |
| ----------- | ----------- | ----------------- | ---- |
| 4o-mini     | yes         | yes               | yes  |
| sonnet      | yes         | yes               | yes  |
| flash 2.0   | yes         | yes               | yes  |
| deepseek R1 | no          | no                | no   |
| o1-mini     | yes         | no                | yes  |

In terms of image geneation, the models exhibit unreliable behavior. Claude will refine the prompt while the OpenAI models will use the original prompt.

```ts
import { customProvider } from "ai";
import { openai } from "@ai-sdk/openai";

export const myProvider = customProvider({
  languageModels: {
    "chat-model-small": openai("gpt-4o-mini"),
    "chat-model-large": openai("gpt-4o"),
    "chat-model-reasoning": wrapLanguageModel({
      model: fireworks("accounts/fireworks/models/deepseek-r1"),
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    }),
    "title-model": openai("gpt-4-turbo"),
    "artifact-model": openai("gpt-4o-mini"),
  },
  imageModels: {
    "small-model": openai.image("dall-e-3"),
  },
});
```

You can replace the `openai` models with any other provider of your choice. You will need to install the provider library and switch the models accordingly.

For example, if you want to use Anthropic's `claude-3-5-sonnet` model for `chat-model-large`, you can replace the `openai` model with the `anthropic` model as shown below.

```ts
import { customProvider } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export const myProvider = customProvider({
  languageModels: {
    "chat-model-small": openai("gpt-4o-mini"),
    "chat-model-large": anthropic("claude-3-5-sonnet"), // Replace openai with anthropic
    "chat-model-reasoning": wrapLanguageModel({
      model: fireworks("accounts/fireworks/models/deepseek-r1"),
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    }),
    "title-model": openai("gpt-4-turbo"),
    "artifact-model": openai("gpt-4o-mini"),
  },
  imageModels: {
    "small-model": openai.image("dall-e-3"),
  },
});
```

You can find the provider library and model names in the [provider](https://sdk.vercel.ai/providers/ai-sdk-providers)'s documentation. Once you have updated the models, you should be able to use the new models in your chatbot.
