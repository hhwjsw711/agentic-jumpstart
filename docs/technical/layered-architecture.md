# Layered Architecture Documentation

This document outlines the layered architecture pattern used in the agentic-jumpstart codebase. The architecture follows a clean separation of concerns with distinct layers for data access, business logic, and server-side operations.

## Architecture Overview

The codebase implements a **3-layer architecture** that promotes:

- **Separation of concerns** - Each layer has a specific responsibility
- **Testability** - Business logic can be tested independently
- **Maintainability** - Changes in one layer don't affect others
- **Reusability** - Business logic can be reused across different interfaces

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  (Routes, Components, API Endpoints)                       │
├─────────────────────────────────────────────────────────────┤
│                    Server Functions Layer                   │
│  (React Start Server Functions)                            │
├─────────────────────────────────────────────────────────────┤
│                    Use Cases Layer                         │
│  (Business Logic, Validation, Orchestration)               │
├─────────────────────────────────────────────────────────────┤
│                    Data Access Layer                       │
│  (Database Operations, External APIs)                      │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                              │
│  (Database Schema, Storage)                                │
└─────────────────────────────────────────────────────────────┘
```

## Layer 1: Data Layer

The foundation layer containing database schemas and storage configurations.

### Database Schema (`src/db/schema.ts`)

Uses **Drizzle ORM** with PostgreSQL and follows a table naming convention with `app_` prefix:

```typescript
// Example: User table definition
export const users = tableCreator("user", {
  id: serial("id").primaryKey(),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  isPremium: boolean("isPremium").notNull().default(false),
  isAdmin: boolean("isAdmin").notNull().default(false),
});

// Relationships defined using Drizzle relations
export const profiles = tableCreator("profile", {
  id: serial("id").primaryKey(),
  userId: serial("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  displayName: text("displayName"),
  imageId: text("imageId"),
  image: text("image"),
  bio: text("bio").notNull().default(""),
});
```

### Key Features:

- **Table prefixing** (`app_`) for multi-tenant isolation
- **Cascade deletes** for referential integrity
- **Indexes** for performance optimization
- **Type-safe** schema definitions

## Layer 2: Data Access Layer (`src/data-access/`)

Thin layer responsible for database operations and external API calls. Each entity has its own file.

### Structure:

```
src/data-access/
├── users.ts          # User CRUD operations
├── profiles.ts       # Profile CRUD operations
├── segments.ts       # Segment CRUD operations
├── modules.ts        # Module CRUD operations
├── accounts.ts       # Authentication account operations
├── sessions.ts       # Session management
├── progress.ts       # User progress tracking
├── comments.ts       # Comment operations
├── attachments.ts    # File attachment operations
└── testimonials.ts   # Testimonial operations
```

### Example: `src/data-access/users.ts`

```typescript
import { database } from "~/db";
import { User, users } from "~/db/schema";
import { eq } from "drizzle-orm";
import { UserId } from "~/use-cases/types";

export async function deleteUser(userId: UserId) {
  await database.delete(users).where(eq(users.id, userId));
}

export async function getUser(userId: UserId) {
  const user = await database.query.users.findFirst({
    where: eq(users.id, userId),
  });
  return user;
}

export async function createUser(email: string) {
  const [user] = await database.insert(users).values({ email }).returning();
  return user;
}
```

### Key Characteristics:

- **Pure functions** - No business logic, just data operations
- **Type safety** - Uses TypeScript types from use-cases layer
- **Drizzle ORM** - Leverages Drizzle's query builder and type safety
- **Single responsibility** - Each function does one thing well

## Layer 3: Use Cases Layer (`src/use-cases/`)

The business logic layer that orchestrates operations, enforces business rules, and coordinates between different data access functions.

### Structure:

```
src/use-cases/
├── types.ts          # Shared type definitions
├── errors.ts         # Custom error classes
├── users.ts          # User business logic
├── segments.ts       # Segment business logic
├── modules.ts        # Module business logic
├── progress.ts       # Progress tracking logic
├── comments.ts       # Comment business logic
├── attachments.ts    # File handling logic
├── accounts.ts       # Authentication logic
├── sessions.ts       # Session management logic
└── testimonials.ts   # Testimonial business logic
```

### Example: `src/use-cases/users.ts`

```typescript
import { createUser, deleteUser, getUserByEmail } from "~/data-access/users";
import { PublicError } from "./errors";
import { GoogleUser, UserId, UserSession } from "./types";

export async function deleteUserUseCase(
  authenticatedUser: UserSession,
  userToDeleteId: UserId
): Promise<void> {
  // Business rule: Users can only delete their own account
  if (authenticatedUser.id !== userToDeleteId) {
    throw new PublicError("You can only delete your own account");
  }

  await deleteUser(userToDeleteId);
}

export async function createGoogleUserUseCase(googleUser: GoogleUser) {
  // Business logic: Check for existing user, create if needed
  let existingUser = await getUserByEmail(googleUser.email);

  if (!existingUser) {
    existingUser = await createUser(googleUser.email);
  }

  // Orchestrate multiple operations
  await createAccountViaGoogle(existingUser.id, googleUser.sub);
  await createProfile(existingUser.id, googleUser.name, googleUser.picture);

  return existingUser.id;
}
```

### Key Characteristics:

- **Business rules enforcement** - Validates permissions, business constraints
- **Orchestration** - Coordinates multiple data access operations
- **Error handling** - Throws domain-specific errors
- **Type safety** - Uses shared types and enforces contracts
- **Pure business logic** - No UI or infrastructure concerns

### Example: `src/use-cases/segments.ts`

```typescript
export async function updateSegmentUseCase(
  segmentId: number,
  data: SegmentUpdate & { moduleTitle: string }
) {
  const { storage } = getStorage();
  const segment = await getSegmentById(segmentId);
  if (!segment) throw new Error("Segment not found");

  // Business logic: Handle video file cleanup
  if (segment.videoKey && data.videoKey) {
    await storage.delete(segment.videoKey);
  }

  // Orchestrate module creation/retrieval
  const module = await getOrCreateModuleUseCase(data.moduleTitle);

  return await updateSegment(segmentId, { ...data, moduleId: module.id });
}
```

## Layer 4: Server Functions Layer (`src/fn/`)

Uses **React Start** server functions to expose business logic as API endpoints with middleware support.

### Structure:

```
src/fn/
├── users.ts          # User-related server functions
├── auth.ts           # Authentication functions
├── comments.ts       # Comment functions
├── early-access.ts   # Early access functions
├── modules.ts        # Module functions
├── segments.ts       # Segment functions
├── storage.ts        # File storage functions
└── testimonials.ts   # Testimonial functions
```

### Example: `src/fn/users.ts`

```typescript
import { createServerFn } from "@tanstack/react-start";
import { unauthenticatedMiddleware } from "~/lib/auth";
import { getProfile } from "~/data-access/profiles";

export const getUserProfileFn = createServerFn({
  method: "GET",
})
  .middleware([unauthenticatedMiddleware])
  .handler(async ({ context }) => {
    if (!context.userId) {
      return null;
    }
    return getProfile(context.userId);
  });
```

### Key Characteristics:

- **Middleware support** - Authentication, validation, rate limiting
- **Type safety** - Full TypeScript support
- **HTTP method specification** - GET, POST, PUT, DELETE
- **Context injection** - User authentication, request data
- **Direct data access** - Can call data access layer directly for simple operations

## Layer 5: Presentation Layer

The top layer that handles HTTP requests, renders UI, and manages user interactions.

### API Routes (`src/routes/api/`)

```typescript
// Example: src/routes/api/segments/$segmentId/video.ts
export const ServerRoute = createServerFileRoute(
  "/api/segments/$segmentId/video"
).methods({
  GET: async ({ request, params }) => {
    // Authentication and authorization
    const user = await getAuthenticatedUser();

    // Business logic through use cases
    const segment = await getSegmentByIdUseCase(segmentId);

    // Business rules enforcement
    if (segment.isPremium && (!user || (!user.isPremium && !user.isAdmin))) {
      throw new Error("You don't have permission to access this video");
    }

    // Infrastructure concerns (file streaming)
    const { storage } = getStorage();
    const { stream, contentLength, contentType } =
      await storage.getStream(segment.videoKey, rangeHeader);

    return new Response(stream, { headers: { ... } });
  },
});
```

### React Components (`src/components/`)

Components consume server functions and use cases through hooks and direct calls.

## Data Flow

### Typical Request Flow:

1. **HTTP Request** → API Route or Server Function
2. **Authentication/Authorization** → Middleware or route-level checks
3. **Business Logic** → Use case functions
4. **Data Operations** → Data access layer
5. **Database** → Drizzle ORM operations
6. **Response** → Back through the layers

### Example Flow for Creating a Segment:

```
POST /api/segments
    ↓
Server Function (fn/segments.ts)
    ↓
addSegmentUseCase (use-cases/segments.ts)
    ↓
getOrCreateModuleUseCase (use-cases/modules.ts)
    ↓
createSegment (data-access/segments.ts)
    ↓
database.insert(segments) (Drizzle ORM)
    ↓
Database Response
```

## Benefits of This Architecture

### 1. **Separation of Concerns**

- Data access logic is isolated from business rules
- Business logic is independent of UI and infrastructure
- Server functions handle HTTP concerns separately

### 2. **Testability**

- Use cases can be unit tested without database
- Data access functions can be mocked
- Business logic is pure and predictable

### 3. **Maintainability**

- Changes in one layer don't cascade to others
- Clear interfaces between layers
- Easy to add new features or modify existing ones

### 4. **Reusability**

- Business logic can be reused across different interfaces
- Data access functions can be called from multiple use cases
- Server functions can be consumed by different clients

### 5. **Type Safety**

- Full TypeScript support across all layers
- Shared types ensure consistency
- Compile-time error checking

## Best Practices

### 1. **Layer Dependencies**

- Higher layers can depend on lower layers
- Lower layers should never depend on higher layers
- Use cases should not import from routes or components

### 2. **Error Handling**

- Use custom error classes in use cases
- Handle infrastructure errors at the server function level
- Provide meaningful error messages to users

### 3. **Type Definitions**

- Keep shared types in `use-cases/types.ts`
- Use specific types for function parameters and return values
- Avoid `any` types and use proper TypeScript features

### 4. **Function Naming**

- Use cases: `verbNounUseCase` (e.g., `createUserUseCase`)
- Data access: `verbNoun` (e.g., `createUser`)
- Server functions: `verbNounFn` (e.g., `createUserFn`)

### 5. **Middleware Usage**

- Use middleware for cross-cutting concerns
- Keep business logic in use cases, not middleware
- Use middleware for authentication, validation, logging

## Conclusion

This layered architecture provides a solid foundation for building maintainable, testable, and scalable applications. The clear separation of concerns makes it easy to understand the codebase structure and modify individual components without affecting others.

The combination of React Start server functions, use cases, and data access layers creates a powerful and flexible system that can handle complex business requirements while maintaining clean, readable code.
