# User Management for Educational Access

This document outlines the approach for implementing user management features that allow for rate limits and account expiration. These features are designed to provide temporary access to the AI playground for educational purposes.

## Current System Analysis

The existing codebase has a basic user authentication system with the following components:

1. **Authentication**: NextAuth with Credentials provider for email/password login
2. **User Model**: Simple schema with id, email, and password fields
3. **Admin Interface**: Basic admin panel for viewing users and their activity
4. **Database**: PostgreSQL with Drizzle ORM

The current implementation lacks:
- Account expiration mechanisms
- Usage tracking and rate limiting
- Detailed user metadata

## Existing Admin Dashboard

The current admin dashboard provides the following functionality:

1. **User Management**:
   - View a list of all users
   - Edit user email and password
   - Delete users
   - View user activity

2. **User Activity Tracking**:
   - List of chat sessions per user
   - Details of each chat session including:
     - Chat title
     - Creation date
     - Message count
     - Expandable view of all messages in the chat

3. **Access Control**:
   - Admin access is restricted to a single hardcoded email address (defined in environment variables)
   - Authentication is handled through the NextAuth session

## Implementation Approach: Database Schema Extension

### Schema Modifications

Extend the user schema to include fields for:
- `createdAt`: When the account was created (used to calculate expiration)
- `usageQuota`: Maximum allowed token usage
- `usageCount`: Current token usage count

```typescript
// Schema extension
export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  usageQuota: integer('usageQuota').default(1000),
  usageCount: integer('usageCount').default(0),
});
```

### Usage Tracking Implementation

1. **Token Usage Tracking**:
   - Increment `usageCount` for each API call that consumes tokens
   - Focus on tracking chat completions which are the primary resource usage

2. **Access Control**:
   - Check if `usageCount` exceeds `usageQuota` before processing requests
   - Calculate account expiration based on `createdAt` and a configurable policy (e.g., 90 days)

### Admin Dashboard Enhancements

Extend the existing admin dashboard to include:

1. **Usage Monitoring**:
   - Display current token usage and quota for each user
   - Add ability to reset usage count or modify quota

2. **Account Management**:
   - Show account creation date and calculated expiration date
   - Add ability to extend access for specific users

3. **Bulk Operations**:
   - Add functionality to manage multiple users at once
   - Support for importing users from CSV

## Implementation Steps

1. **Database Migration**:
   ```typescript
   // Migration to add new fields
   export default async function migrate() {
     await db.schema
       .alterTable('User')
       .addColumn('createdAt', timestamp('createdAt').notNull().defaultNow())
       .addColumn('usageQuota', integer('usageQuota').default(1000))
       .addColumn('usageCount', integer('usageCount').default(0))
       .execute();
   }
   ```

2. **Update User Queries**:
   - Add functions to update and check usage counts
   - Add functions to check account expiration

3. **Middleware for Access Control**:
   ```typescript
   // Conceptual middleware implementation
   export async function middleware(request: NextRequest) {
     const session = await auth();
     if (!session?.user?.id) return NextResponse.redirect(new URL('/login', request.url));
     
     const [user] = await getUserById(session.user.id);
     if (!user) return NextResponse.redirect(new URL('/login', request.url));
     
     // Check expiration
     const expirationDays = 90; // Configurable
     const expirationDate = new Date(user.createdAt);
     expirationDate.setDate(expirationDate.getDate() + expirationDays);
     
     if (new Date() > expirationDate) {
       return NextResponse.redirect(new URL('/expired', request.url));
     }
     
     // Check usage quota
     if (user.usageCount >= user.usageQuota) {
       return NextResponse.redirect(new URL('/quota-exceeded', request.url));
     }
     
     return NextResponse.next();
   }
   ```

4. **Update Admin Interface**:
   - Add fields to display and edit usage quota
   - Add visualization for usage statistics
   - Add functionality to extend account access

## Considerations

- **Performance**: Ensure usage tracking doesn't impact application performance
- **Data Privacy**: Ensure compliance with relevant regulations for storing student data
- **Graceful Degradation**: Provide clear messaging when users hit limits
- **Backup Plan**: Consider fallback options for critical educational periods

## Future Enhancements

- More granular usage tracking (by feature or model)
- Automated notifications for approaching limits
- Self-service portal for educational institutions
- Integration with learning management systems 