# File Upload and Storage Analysis

This document analyzes the current implementation of file uploads (images and PDFs) in the application and provides suggestions for enhancing the functionality with thumbnails in the chat window and addressing potential orphaned files.

## Current Implementation

### Upload Flow

1. **User Interface**
   - File uploads are handled through the `MultimodalInput` component
   - A hidden file input element allows users to select files
   - Supported file types: JPEG, PNG, and PDF
   - Maximum file size: 5MB

2. **Upload Process**
   - Files are validated for type and size on the client side
   - Valid files are sent to `/api/files/upload` endpoint via FormData
   - The server uses Vercel Blob Storage for file persistence
   - Files are stored with public access

3. **Artifact Integration**
   - Upon successful upload, files are immediately displayed in the artifact panel
   - For images:
     - Base64 content is stored in the artifact state
     - Images are displayed using the `ImageEditor` component
   - For PDFs:
     - URL to the blob storage is stored in the artifact state
     - PDFs are displayed using an iframe in the `PDFViewer` component

4. **Database Storage**
   - Files are stored in the `Document` table with:
     - `id`: UUID for the document
     - `createdAt`: Timestamp
     - `title`: Filename
     - `content`: Base64 data for images or URL for PDFs
     - `kind`: 'image' or 'pdf'
     - `userId`: Reference to the user who uploaded the file

5. **Document Handlers**
   - Each artifact type has a dedicated document handler:
     - `imageDocumentHandler`: Handles image generation and storage
     - `pdfDocumentHandler`: Handles PDF uploads

### Storage Architecture

1. **Dual Storage Approach**
   - **Blob Storage**: Files are stored in Vercel Blob Storage with public URLs
   - **Database**: File content (base64 for images, URLs for PDFs) is stored in the `Document` table

2. **Persistence Mechanism**
   - Files are saved to the database via the `saveDocument` function
   - The document handler framework ensures consistent storage across artifact types

## Analysis of Dual Storage Approach

### Current Implementation Details

The application currently uses a hybrid approach to file storage:

1. **Images**:
   - Stored in Vercel Blob Storage (for durability)
   - Also stored as base64-encoded strings in the database `Document` table
   - Displayed directly from base64 data in the `ImageEditor` component

2. **PDFs**:
   - Stored in Vercel Blob Storage
   - Only the URL is stored in the database `Document` table
   - Displayed via iframe using the URL in the `PDFViewer` component

### Reasons for the Current Approach

After analyzing the codebase, several factors likely influenced this design decision:

1. **Real-time Rendering**:
   - Base64-encoded images can be displayed immediately without additional network requests
   - This is particularly important for the streaming UI pattern used in the application
   - The `ImageEditor` component directly uses `src={data:image/png;base64,${content}}` for rendering

2. **Artifact System Architecture**:
   - The artifact system is designed around a content-first approach
   - All artifacts (text, code, sheets, images) store their content directly in the database
   - This provides a consistent pattern across different artifact types

3. **Data Ownership**:
   - Storing content in the database ensures data ownership and availability
   - If the blob storage service has issues, images can still be displayed

4. **Historical Context**:
   - The image artifact system was likely developed first for AI-generated images (DALL-E)
   - These are returned as base64 data from the API
   - The file upload system was probably added later, maintaining compatibility with the existing pattern

### Drawbacks of the Current Approach

The dual storage approach has several significant drawbacks:

1. **Storage Inefficiency**:
   - Base64 encoding increases file size by approximately 33%
   - The same image is stored twice (in blob storage and database)
   - This doubles storage costs and database size

2. **Database Performance**:
   - Storing large binary data in the database can impact performance
   - PostgreSQL has a 1GB limit per row, but even smaller images can cause issues
   - Large base64 strings can slow down queries and increase memory usage

3. **Scaling Limitations**:
   - As the application grows, the database size will increase rapidly
   - Backups and replication become more expensive and time-consuming
   - Database migrations take longer with large binary data

4. **Inconsistent Patterns**:
   - Images use base64 in the database while PDFs use URLs
   - This inconsistency makes the codebase harder to maintain

### Alternative Approaches

#### 1. URL-Only Approach

Store all files (images and PDFs) in blob storage and only keep URLs in the database:

**Advantages**:
- Reduced database size and improved performance
- Consistent pattern for all file types
- Lower storage costs
- Better scalability

**Implementation Changes**:
```typescript
// Modified Document schema
export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    url: text('url'), // URL to blob storage
    thumbnailUrl: text('thumbnailUrl'), // Optional thumbnail URL
    kind: varchar('kind', { enum: ['text', 'code', 'image', 'sheet', 'pdf'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  // ... existing configuration
);
```

```typescript
// Modified ImageEditor component
export function ImageEditor({ url, title, status }) {
  return (
    <div>
      {status === 'streaming' ? (
        <LoadingIndicator />
      ) : (
        <picture>
          <img 
            src={url} 
            alt={title}
            className="object-contain max-w-[1024px] max-h-[1024px]"
          />
        </picture>
      )}
    </div>
  );
}
```

#### 2. Hybrid Approach with Thumbnails

Store full-size images in blob storage but keep small thumbnails as base64 in the database:

**Advantages**:
- Fast thumbnail loading without additional requests
- Reduced database size compared to current approach
- Better performance for most operations

**Implementation**:
```typescript
// Document schema with thumbnail
export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    url: text('url'), // URL to full-size image
    thumbnail: text('thumbnail'), // Small base64 thumbnail
    kind: varchar('kind', { enum: ['text', 'code', 'image', 'sheet', 'pdf'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  // ... existing configuration
);
```

#### 3. Content Delivery Network (CDN) Integration

Use a CDN with Vercel Blob Storage for improved performance:

**Advantages**:
- Faster image loading globally
- Reduced bandwidth costs
- Better user experience

**Implementation**:
- Configure Vercel Blob Storage with a CDN
- Store only URLs in the database
- Use CDN URLs for image display

## Addressing the Benefits of the Current Approach

The URL-only approach must address the key benefits of the current dual storage system to be a viable replacement. Here's how we can maintain these benefits while improving overall system performance:

### 1. Maintaining Real-time Rendering Performance

**Challenge**: Base64-encoded images can be displayed immediately without additional network requests, which is crucial for the streaming UI pattern.

**Solutions**:

1. **Preloading Strategy**:
   ```typescript
   // Preload images as soon as URLs are available
   function preloadImage(url) {
     const img = new Image();
     img.src = url;
     return img;
   }
   
   // In the component that receives image URLs
   useEffect(() => {
     if (imageUrl) {
       const preloadedImage = preloadImage(imageUrl);
       // Store in ref or state if needed
     }
   }, [imageUrl]);
   ```

2. **Progressive Loading**:
   - Implement a low-quality image placeholder (LQIP) system
   - Store a tiny (e.g., 32x32px) base64 thumbnail in the database
   - Show this immediately while the full image loads from the URL

3. **Caching Headers**:
   - Configure Vercel Blob Storage with appropriate caching headers
   - Implement browser caching for frequently accessed images
   - Use `Cache-Control: immutable` for static assets

4. **Service Worker**:
   - Implement a service worker to cache images locally
   - This provides offline access and improves subsequent load times

### 2. Preserving Artifact System Architecture

**Challenge**: The artifact system is designed around a content-first approach with all content stored directly in the database.

**Solutions**:

1. **Abstraction Layer**:
   ```typescript
   // Create a content provider abstraction
   interface ContentProvider<T> {
     getContent(id: string): Promise<T>;
     storeContent(content: T): Promise<string>;
   }
   
   // Implementation for text/code (database storage)
   class DatabaseContentProvider implements ContentProvider<string> {
     async getContent(id: string) {
       const doc = await getDocumentById(id);
       return doc.content;
     }
     // ...
   }
   
   // Implementation for images/PDFs (URL storage)
   class BlobContentProvider implements ContentProvider<File> {
     async getContent(id: string) {
       const doc = await getDocumentById(id);
       return fetchFromUrl(doc.url);
     }
     // ...
   }
   ```

2. **Unified API**:
   - Maintain the same API for all artifact types
   - Abstract the storage details behind a consistent interface
   - This preserves the content-first approach while optimizing storage

3. **Content Addressing**:
   - Use content-addressed storage for all artifacts
   - Generate unique identifiers based on content hash
   - This allows for deduplication and consistent addressing

### 3. Ensuring Data Ownership and Availability

**Challenge**: Storing content in the database ensures data ownership and availability if blob storage has issues.

**Solutions**:

1. **Redundant Storage**:
   - Implement a backup system for critical blob storage data
   - Schedule regular backups of blob storage to a separate storage system
   - This provides a fallback without duplicating data in the database

2. **Health Monitoring**:
   - Implement health checks for blob storage
   - Set up alerts for any availability issues
   - Create a fallback mechanism for critical operations

3. **Contractual Guarantees**:
   - Vercel Blob Storage provides SLAs for availability
   - Document the expected availability and recovery procedures
   - Ensure compliance with data ownership requirements

### 4. Handling AI-Generated Images

**Challenge**: AI-generated images (DALL-E) are returned as base64 data from the API.

**Solutions**:

1. **Immediate Storage**:
   ```typescript
   // When receiving base64 data from DALL-E
   async function handleDalleResponse(base64Data) {
     // Convert base64 to blob
     const blob = base64ToBlob(base64Data);
     
     // Upload to blob storage
     const { url } = await uploadToBlob(blob);
     
     // Store URL in database
     await saveDocument({
       id: generateId(),
       title: 'AI Generated Image',
       url,
       kind: 'image',
       userId
     });
     
     return url;
   }
   ```

2. **Temporary Dual Approach**:
   - For streaming UI, use base64 data temporarily in memory
   - Once streaming is complete, store only the URL in the database
   - This maintains the real-time experience without permanent duplication

3. **Optimized Upload Pipeline**:
   - Implement a background job to handle the base64-to-URL conversion
   - Show the base64 image immediately to the user
   - Replace with URL-based version once upload completes

## Performance Considerations for Future Expansion

As the application scales, several performance optimizations become critical:

### 1. Image Optimization Pipeline

Implement an image processing pipeline to optimize images before storage:

```typescript
// Image optimization pipeline
async function optimizeAndStoreImage(file) {
  // Resize large images
  const optimized = await resizeIfNeeded(file, {
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 0.85
  });
  
  // Generate thumbnail
  const thumbnail = await generateThumbnail(file, {
    width: 200,
    height: 200
  });
  
  // Store both in blob storage
  const [imageUrl, thumbnailUrl] = await Promise.all([
    uploadToBlob(optimized),
    uploadToBlob(thumbnail)
  ]);
  
  return { imageUrl, thumbnailUrl };
}
```

### 2. Dynamic Image Serving

Implement dynamic image resizing based on device and viewport:

```typescript
// Component with responsive image loading
function ResponsiveImage({ documentId }) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { data: document } = useSWR(`/api/documents/${documentId}`);
  
  // Calculate appropriate image size
  const imageUrl = useMemo(() => {
    if (!document?.url) return '';
    
    // Append size parameters to URL
    const size = windowWidth < 768 ? 'small' : 
                 windowWidth < 1200 ? 'medium' : 'large';
    
    return `${document.url}?size=${size}`;
  }, [document, windowWidth]);
  
  return <img src={imageUrl} alt={document?.title} />;
}
```

### 3. Lazy Loading and Virtualization

Implement lazy loading for images and virtualization for long lists:

```typescript
// Lazy loading component
function LazyImage({ url, alt }) {
  const imgRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={imgRef} className="image-container">
      {isVisible ? (
        <img src={url} alt={alt} />
      ) : (
        <div className="placeholder" />
      )}
    </div>
  );
}
```

### 4. Database Indexing and Query Optimization

Optimize database queries for URL-based document retrieval:

```typescript
// Add appropriate indexes
export const documentIndex = index('document_url_idx').on(document.url);
export const documentKindIndex = index('document_kind_idx').on(document.kind);

// Optimize queries
async function getImageDocuments(userId) {
  return db.select()
    .from(document)
    .where(and(
      eq(document.userId, userId),
      eq(document.kind, 'image')
    ))
    .orderBy(desc(document.createdAt))
    .limit(20);
}
```

### 5. Caching Strategy

Implement a multi-level caching strategy:

```typescript
// Server-side caching with Redis
async function getCachedDocument(id) {
  // Try to get from cache first
  const cached = await redis.get(`document:${id}`);
  if (cached) return JSON.parse(cached);
  
  // If not in cache, get from database
  const doc = await getDocumentById(id);
  
  // Store in cache for future requests
  await redis.set(`document:${id}`, JSON.stringify(doc), 'EX', 3600);
  
  return doc;
}

// Client-side caching with SWR
function useDocument(id) {
  return useSWR(`/api/documents/${id}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000
  });
}
```

## Recommended Solution: Thumbnail-Based Approach

Based on our analysis and discussions, we recommend implementing a **Thumbnail-Based Approach** that efficiently addresses both artifact mode and chat window display needs with a single solution:

### Core Concept

For all file types (images and PDFs), we will:
1. Store a medium-sized thumbnail in the `content` field of the document table
2. Store a reference URL to the full-size file in blob storage
3. Use a consistent approach across all file types

This approach:
- Provides thumbnails for both images and PDFs in the chat window
- Maintains the existing database structure without schema changes
- Ensures consistent handling of all file types

### Implementation Details

#### 1. Storage Structure

We'll maintain the current `Document` table structure but standardize what we store in it:

```typescript
// Existing Document schema - no changes needed
export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'), // Always stores the thumbnail (base64)
    kind: varchar('kind', { enum: ['text', 'code', 'image', 'sheet', 'pdf'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  // ... existing configuration
);
```

#### 2. Storing the URL to Original Files

For storing the URL to the original file in blob storage, we have two options:

**Option A: JSON in Content Field**
Store both the thumbnail and URL in the content field as a JSON object:

```typescript
// Example content field for an image
{
  "thumbnail": "base64-encoded-thumbnail-data",
  "url": "https://vercel-blob.com/original-file-url"
}

// Example content field for a PDF
{
  "thumbnail": "base64-encoded-first-page-thumbnail",
  "url": "https://vercel-blob.com/original-pdf-url"
}
```

**Option B: Metadata in Document Handler**
Store the URL as metadata that's managed by the document handler:

```typescript
// When saving a document
await saveDocument({
  title: file.name,
  content: thumbnailBase64, // Just the thumbnail
  kind: fileType,
  userId,
  metadata: {
    originalUrl: blobUrl
  }
});

// The metadata is then available in the artifact system
// but not directly in the database schema
```

We recommend **Option B** as it:
- Keeps the content field focused on the thumbnail data
- Leverages the existing metadata capabilities of the artifact system
- Doesn't require parsing JSON in the content field
- Maintains backward compatibility with existing code

#### 3. Modified Upload Process

For all file types:
1. Upload original file to Vercel Blob Storage
2. Generate an appropriate thumbnail:
   - For images: Resize to 400x400px
   - For PDFs: Render the first page as an image
3. Store the thumbnail as base64 in the `content` field
4. Store the blob URL as metadata

```typescript
// Conceptual implementation for file upload
async function handleFileUpload(file) {
  // Upload original to blob storage
  const { url } = await put(`files/${generateUUID()}`, file, {
    access: 'public',
  });
  
  // Generate thumbnail based on file type
  let thumbnailBase64;
  if (file.type.startsWith('image/')) {
    // For images: resize to thumbnail
    const thumbnail = await resizeImage(file, { width: 400, height: 400 });
    thumbnailBase64 = await convertToBase64(thumbnail);
  } else if (file.type === 'application/pdf') {
    // For PDFs: render first page as thumbnail
    const thumbnail = await renderPdfFirstPage(file, { width: 400, height: 400 });
    thumbnailBase64 = await convertToBase64(thumbnail);
  }
  
  // Save document with thumbnail in content field
  const document = await saveDocument({
    title: file.name,
    content: thumbnailBase64,
    kind: file.type.startsWith('image/') ? 'image' : 'pdf',
    userId,
    metadata: { originalUrl: url }
  });
  
  return document;
}
```

#### 4. Artifact Display Enhancement

Modify the artifact components to handle both thumbnails and full-size files:

```typescript
// Enhanced ImageEditor component
export function ImageEditor({ content, title, status, metadata }) {
  const [showFullSize, setShowFullSize] = useState(false);
  const originalUrl = metadata?.originalUrl;
  
  // Use thumbnail by default (from content field)
  const thumbnailSrc = `data:image/png;base64,${content}`;
  
  // When clicked or in artifact mode, load full-size image if available
  const imageSrc = showFullSize && originalUrl ? originalUrl : thumbnailSrc;
  
  return (
    <div>
      {status === 'streaming' ? (
        <LoaderIcon className="h-8 w-8 animate-spin" />
      ) : (
        <img 
          src={imageSrc}
          alt={title}
          className="max-w-full object-contain"
          onClick={() => setShowFullSize(true)}
        />
      )}
    </div>
  );
}

// Enhanced PDFViewer component
export function PDFViewer({ content, title, status, metadata }) {
  // For PDFs, content contains the thumbnail, metadata.originalUrl contains the PDF URL
  const originalUrl = metadata?.originalUrl;
  
  return (
    <div>
      {status === 'streaming' ? (
        <LoaderIcon className="h-8 w-8 animate-spin" />
      ) : (
        <div>
          {/* Thumbnail preview (clickable) */}
          <div className="pdf-thumbnail mb-4" onClick={() => window.open(originalUrl, '_blank')}>
            <img 
              src={`data:image/png;base64,${content}`}
              alt={`${title} (first page)`}
              className="max-w-[200px] border shadow cursor-pointer"
            />
            <div className="text-sm mt-2">{title}</div>
          </div>
          
          {/* PDF viewer */}
          <iframe
            src={originalUrl}
            title={title}
            className="w-full h-[600px] border"
          />
        </div>
      )}
    </div>
  );
}
```

#### 5. Chat Message Integration

Enhance the message component to display thumbnails consistently for all file types:

```typescript
// Inside the message rendering logic
{content.type === 'file-reference' && (
  <div 
    className="file-thumbnail cursor-pointer" 
    onClick={() => openInArtifactMode(content.fileId)}
  >
    {/* Both images and PDFs display their thumbnails */}
    <img 
      src={`data:image/png;base64,${content.thumbnailContent}`} 
      alt={content.title}
      className="max-w-[200px] max-h-[200px] object-contain rounded border"
    />
    <div className="filename text-sm mt-1">
      {content.title}
      <span className="text-xs text-gray-500 ml-1">
        ({content.fileType})
      </span>
    </div>
  </div>
)}
```

### Benefits of This Approach

1. **Consistency**: Uniform handling of all file types (images and PDFs)
2. **No Schema Changes**: Utilizes existing database structure
3. **Storage Efficiency**: Significantly reduces database size compared to storing full images
4. **Performance**: Provides immediate display in both contexts without additional network requests
5. **User Experience**: Consistent visual representation across the application
6. **Implementation Simplicity**: Minimal changes to existing architecture
7. **Backward Compatibility**: Works with existing document handling code

### Considerations

1. **Thumbnail Generation**:
   - For images: Resize to 400x400px with appropriate compression
   - For PDFs: Render the first page as a 400x400px image
   - Use consistent quality settings across all file types

2. **Metadata Handling**:
   - Store the original blob URL as metadata in the document handler
   - Ensure metadata is properly passed to components that need it

3. **Migration Strategy**:
   - Process existing documents to generate thumbnails for both images and PDFs
   - Upload original files to blob storage if not already there
   - Update document metadata with original URLs

### Implementation Plan

1. **Phase 1: Standardize File Handling**
   - Create a unified file processing pipeline for both images and PDFs
   - Implement thumbnail generation for all file types
   - Update document handlers to store thumbnails and original URLs consistently

2. **Phase 2: UI Integration**
   - Enhance artifact components to handle both thumbnails and full-size files
   - Ensure consistent display of thumbnails in the chat window

3. **Phase 3: Migration**
   - Process existing documents to convert full images to thumbnails
   - Generate thumbnails for PDFs that don't have them
   - Update metadata with original URLs

This approach provides a consistent solution for all file types, maintaining the benefits of immediate display while addressing the need for visual representation in the chat window, all without requiring schema changes.

## Missing Functionality

### 1. Chat Window Thumbnails

Currently, uploaded files are displayed in the artifact panel but not represented in the chat window. This creates a disconnect between the conversation and the shared files.

**Current Limitations:**
- No visual representation of uploaded files in the chat history
- No way to reference or click on previously uploaded files from the chat
- Difficult to track which files were shared during the conversation

### 2. Orphaned Files

Files are stored in both Vercel Blob Storage and the database, but there's no clear mechanism to:
- Associate files with specific chat messages
- Clean up unused or orphaned files
- Reference files across different chat sessions

## Implementation Suggestions

### 1. Chat Window Thumbnails

#### Database Schema Updates

No schema changes are required as we can leverage the existing `Message` table's JSON content field to store file references:

```typescript
// Example message content with file reference
{
  type: 'file-reference',
  fileId: 'uuid-of-document',
  fileType: 'image' | 'pdf',
  thumbnailUrl: 'url-to-thumbnail' // Optional for optimization
}
```

#### UI Components

1. **File Reference Component**

```typescript
// components/file-reference.tsx
export function FileReference({ fileId, fileType, onClick }) {
  const [document, setDocument] = useState(null);
  
  useEffect(() => {
    // Fetch document details by ID
    fetchDocument(fileId).then(setDocument);
  }, [fileId]);
  
  if (!document) return <div>Loading file...</div>;
  
  return (
    <div 
      className="file-reference cursor-pointer" 
      onClick={() => onClick(document)}
    >
      {fileType === 'image' ? (
        <div className="thumbnail">
          <img 
            src={document.url || `data:image/png;base64,${document.content.substring(0, 100)}...`} 
            alt={document.title}
            className="w-16 h-16 object-cover rounded"
          />
        </div>
      ) : (
        <div className="pdf-thumbnail">
          <PdfIcon className="w-16 h-16" />
        </div>
      )}
      <div className="filename text-sm">{document.title}</div>
    </div>
  );
}
```

2. **Message Component Enhancement**

Modify the existing message component to render file references:

```typescript
// Inside the message rendering logic
{content.type === 'file-reference' && (
  <FileReference
    fileId={content.fileId}
    fileType={content.fileType}
    onClick={(document) => {
      // Open in artifact panel
      setArtifact({
        kind: document.kind,
        title: document.title,
        content: document.content,
        isVisible: true,
        status: 'idle',
        documentId: document.id
      });
    }}
  />
)}
```

#### Integration with Upload Flow

Modify the file upload process to add a file reference to the chat:

```typescript
// In multimodal-input.tsx, after successful upload
const fileDocument = await uploadFile(file);

// Add a message to the chat with the file reference
append({
  role: 'user',
  content: [
    { type: 'text', text: input || '' },
    { 
      type: 'file-reference', 
      fileId: fileDocument.id,
      fileType: fileDocument.kind
    }
  ]
});
```

### 2. Addressing Orphaned Files

#### File-Message Association

1. **Create a new junction table**:

```typescript
export const fileMessage = pgTable(
  'FileMessage',
  {
    fileId: uuid('fileId').notNull(),
    fileCreatedAt: timestamp('fileCreatedAt').notNull(),
    messageId: uuid('messageId').notNull().references(() => message.id),
    chatId: uuid('chatId').notNull().references(() => chat.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.fileId, table.fileCreatedAt, table.messageId] }),
      fileRef: foreignKey({
        columns: [table.fileId, table.fileCreatedAt],
        foreignColumns: [document.id, document.createdAt],
      }),
    };
  },
);
```

2. **Update the upload process** to create this association when files are referenced in messages.

#### Cleanup Strategy

1. **Retention Policy**:
   - Define a retention period for unused files (e.g., 30 days)
   - Implement a background job to identify and clean up orphaned files

2. **Cleanup Job**:
   - Create a scheduled function to run periodically
   - Identify files without message associations older than the retention period
   - Delete them from both the database and Blob storage

```typescript
// Conceptual cleanup job
async function cleanupOrphanedFiles() {
  // Find files without message associations older than retention period
  const orphanedFiles = await db.query.document.findMany({
    where: sql`
      document.id NOT IN (
        SELECT fileId FROM FileMessage
      ) AND
      document.createdAt < ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
    `
  });
  
  // Delete from blob storage and database
  for (const file of orphanedFiles) {
    await deleteBlob(file.content); // For URLs
    await db.delete(document).where(eq(document.id, file.id));
  }
}
```

## Implementation Plan

### Phase 1: Storage Optimization
1. Create a migration to add URL field to Document table
2. Update handlers to use URL-only approach
3. Modify UI components to load from URLs
4. Implement cleanup for base64 data

### Phase 2: Chat Window Thumbnails
1. Create the `FileReference` component
2. Enhance the message component to render file references
3. Modify the upload flow to add file references to messages
4. Update the UI to display thumbnails in the chat

### Phase 3: File-Message Association
1. Create the `FileMessage` junction table
2. Update the upload and message creation process to maintain associations
3. Implement a basic admin interface to view file usage

### Phase 4: Cleanup Strategy
1. Define retention policies
2. Implement the cleanup job
3. Add monitoring for storage usage

## Conclusion

The current implementation provides a solid foundation for file uploads and artifact display, but has inefficiencies in its storage approach and lacks integration with the chat interface. By transitioning to a URL-only storage approach and implementing chat thumbnails and file-message associations, we can create a more cohesive, performant, and cost-effective system.

The suggested approach leverages the existing architecture while optimizing storage and adding missing functionality with minimal changes to the core system. This ensures backward compatibility while enhancing the user experience and system maintainability. 