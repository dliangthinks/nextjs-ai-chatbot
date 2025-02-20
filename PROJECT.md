# Technology Training AI Playground Project Documentation

This document provides an overview of the Technology Training AI Playground project, including technical specifications, available features, key areas for customization, and a changelog for all future updates.

---

## Specifications of the Stack
- **AI sdk cookbook:** https://sdk.vercel.ai/cookbook
  pay attention to the following topics:
  - generate image with chat prompt: https://sdk.vercel.ai/cookbook/next/generate-image-with-chat-prompt
  - stream text with image prompt: https://sdk.vercel.ai/cookbook/next/stream-text-with-image-prompt
  - chat with PDFs: https://sdk.vercel.ai/cookbook/next/chat-with-pdf
  - generate object: https://sdk.vercel.ai/cookbook/next/generate-object
  - multimodal input: https://sdk.vercel.ai/docs/guides/multi-modal-chatbot
  - call tools: https://sdk.vercel.ai/cookbook/next/call-tools
- **Framework:** Next.js (React-based framework for server-side rendering, routing, etc.)
- **Language:** TypeScript for static type checking and improved developer experience
- **UI Library:** React with [Shadcn UI](https://ui.shadcn.com/) components, Radix UI, and [Tailwind CSS](https://tailwindcss.com/) for styling and responsive design
- **Animations:** Framer Motion for smooth and performant animations
- **Data Layer:** Drizzle ORM connected to PostgreSQL, with support for migrations and schema management using `drizzle-kit`
- **Authentication & Session Management:** NextAuth for user authentication (supports multiple providers)
- **State Management & Data Fetching:** React hooks and SWR where applicable
- **Utilities:**   
  - `bcrypt-ts` for password hashing  
  - `nanoid` for unique identifiers  
  - Various icon libraries (like lucide-react) for UI embellishments
  
---
**Folder structure:


## Features

### 1. Chat Interface and Sessions
- **Message Component Implementation**
  - Uses AnimatePresence and Framer Motion for smooth transitions
  - Supports different message roles (user/assistant) with distinct styling
  - Reference: 
  ```typescript:components/message.tsx
  startLine: 29
  endLine: 124
  ```

### 2. File Handling and Attachments
- **Multimodal Input System**
  - Supports file uploads through a hidden input element
  - Handles multiple file uploads simultaneously
  - Shows upload progress with PreviewAttachment component
  - Reference:
  ```typescript:components/multimodal-input.tsx
  startLine: 143
  endLine: 194
  ```

### 3. Image Generation and Handling
- **Image Artifact System**
  - Implements streaming image generation with status updates
  - Uses base64 encoding for image display
  - Supports both inline and full-view modes
  - Reference:
  ```typescript:artifacts/image/server.ts
  startLine: 1
  endLine: 43
  ```

### 4. Image Editor Component
- **Interactive Image Display**
  - Supports loading states with spinner animation
  - Handles both streaming and static image content
  - Responsive design with conditional padding
  - Reference:
  ```typescript:components/image-editor.tsx
  startLine: 13
  endLine: 48
  ```

### 5. Console Output System
- **Multi-format Console Display**
  - Supports both text and image outputs
  - Implements scrollable interface
  - Handles different content types with conditional rendering
  - Reference:
  ```typescript:components/console.tsx
  startLine: 152
  endLine: 170
  ```

### 6. Artifact Management
- **Flexible Artifact System**
  - Supports multiple artifact types (images, code)
  - Implements version control with undo/redo functionality
  - Handles streaming updates and state management
  - Reference:
  ```typescript:artifacts/image/client.tsx
  startLine: 6
  endLine: 20
  ```

### 7. File Upload System
- **Secure File Processing**
  - Implements server-side validation
  - Supports multiple file types
  - Handles public access permissions
  - Reference:
  ```typescript:app/(chat)/api/files/upload/route.ts
  startLine: 32
  endLine: 70
  ```

### 8. Admin Interface
- **Session Management**
  - Displays message history with timestamps
  - Shows message roles and content
  - Implements pagination and filtering
  - Reference:
  ```typescript:app/(admin)/admin/sessions/[chatId]/page.tsx
  startLine: 16
  endLine: 69
  ```

### 9. Responsive Layout System
- **Adaptive UI Components**
  - Implements mobile-first design
  - Uses Tailwind CSS for responsive styling
  - Handles different screen sizes with dynamic layouts
  - Reference:
  ```typescript:components/artifact.tsx
  startLine: 357
  endLine: 412
  ```

### 10. Suggested Actions
- **Interactive Guidance System**
  - Displays contextual suggestions
  - Implements smooth animations for each action
  - Handles user interactions and state updates
  - Reference:
  ```typescript:components/suggested-actions.tsx
  startLine: 1
  endLine: 124
  ```

### 11. Message Reasoning
- **AI Explanation System**
  - Shows reasoning process for AI responses
  - Implements collapsible interface
  - Supports markdown formatting
  - Reference:
  ```typescript:components/message-reasoning.tsx
  startLine: 1
  endLine: 179
  ```

Each feature is built with TypeScript and follows React best practices, utilizing server components where possible and implementing proper error handling. The system is designed to be modular and extensible, allowing for easy addition of new features and modifications to existing ones.

---

## Key Areas for Customization

- **Suggestion Questions:**
  - suggested-actions.tsx
  
- **Model Names and Chat Models:**
  - lib/ai/models.ts
    languageModels: {
    'chat-model-small': openai('gpt-4o-mini'),
    'chat-model-flash': google('gemini-2.0-flash-exp'),
    'chat-model-large': anthropic('claude-3-5-sonnet-latest'),
    'chat-model-reasoning': openai('o1-mini'),
    'chat-model-deepseek': deepseek('deepseek-reasoner'),

- **Logos and Branding:**
  - app-sidebar.tsx: technology training AI playground
  

---

## Change Log

Future changes to the project will produce entries in this changelog section. For example:


### [v1.0.0] - 2025-02-19
- Initial project setup with Next.js, Tailwind CSS, and Drizzle ORM.
- Admin dashboard, user management, and dynamic chat session handling implemented.
- Authentication via NextAuth added.

### [v1.1.0] - 2024-03-XX
#### Added
- PDF Artifact Support
  - Added PDF viewer component for artifact mode
  - Implemented PDF file upload and preview
  - Added PDF document type to artifact system

#### Changed
- File Upload System
  - Enhanced PDF file handling with proper content type detection
  - Added special handling for PDFs to trigger artifact mode
  - Improved file preview UI for PDFs

#### Technical Details
- Added new components:
  - `components/pdf-viewer.tsx`: Simple iframe-based PDF viewer
  - `artifacts/pdf/client.tsx`: PDF artifact configuration
  - `artifacts/pdf/server.ts`: PDF document handler

- Modified components:
  - `components/preview-attachment.tsx`: Improved PDF preview with better styling
  - `components/multimodal-input.tsx`: Added PDF artifact trigger
  - `app/(chat)/api/files/upload/route.ts`: Enhanced PDF file handling

- Database changes:
  - Added 'pdf' to document kind enum in schema
  - Updated artifact types to include PDF support

#### UI/UX Improvements
- PDF files now show a cleaner preview in chat
- PDFs open in artifact viewer for better readability
- Improved preview styling with proper padding and text alignment

---

## Future Roadmap

- **Feature Enhancements:** 
  Show model with each message. This requires a change to the backend to store the model name with each message.
  Investigate the mechanism of switching models on the fly: does it automatically feed previous context?
  
- **Image generation:**
  Add image generation to the playground.
  Possible to use Flux or imagen 3 via API.
  
- **Extensibility:** 
  Search and tools.
  
- **User Management:**
  Expiration logic: delete user after 30 days of inactivity.
  Mass import users from a CSV file.

---

*This document will be maintained and updated alongside the project to reflect architectural changes, newly added features, and other improvements.* 