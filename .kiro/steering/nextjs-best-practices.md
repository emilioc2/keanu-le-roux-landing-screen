---
inclusion: manual
---

# Next.js Best Practices

## 1. Use the app/ Directory (App Router)

With the App Router introduced in Next.js 13 and enhanced in 14, you get:

- Server components by default
- Layouts, nested routing, and better loading/error handling
- Native support for Streaming, Suspense, and SEO-friendly metadata

Folder structure:

```
/app
  ├── layout.tsx       # Shared layout for all routes
  ├── page.tsx         # Home page
  ├── loading.tsx      # Loading state (SSR/streaming)
  ├── error.tsx        # Error fallback
  └── dashboard/
        ├── layout.tsx
        └── page.tsx
```

Define SEO metadata directly in your route files:

```ts
export const metadata = {
  title: "Dashboard | MyApp",
  description: "Your personalized dashboard experience.",
};
```

## 2. Keep a Scalable Project Structure

Maintain separation of concerns:

```
/components      → Reusable UI components
/lib             → Utility functions & logic
/hooks           → Custom React hooks
/services        → External API calls
/constants       → Shared constants
/styles          → Global and modular styles
```

For large apps, consider domain-based foldering:

```
/features/user/
  ├── pages/
  ├── components/
  ├── hooks/
  └── services/
```

## 3. Performance Optimisation

Next.js gives you incredible performance out of the box. A few tips go a long way:

### Image Optimisation

Use the built-in `next/image`:

```tsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={800}
  height={400}
  priority
/>
```

### Lazy Loading & Dynamic Imports

Split large components or third-party libraries:

```tsx
const Chart = dynamic(() => import('@/components/Chart'), { ssr: false });
```

### Choose the Right Rendering Strategy

- Static Generation (SSG) for marketing/blog pages
- Incremental Static Regeneration (ISR) for semi-dynamic pages
- Server-Side Rendering (SSR) for auth/gated content

Example:

```ts
export const revalidate = 60; // ISR (regenerates every 60s)
```

## 4. Authentication & Route Protection

Use NextAuth.js, Clerk, or Auth0 for modern authentication.

Protect routes using middleware:

```ts
// middleware.ts
export { default } from "next-auth/middleware";
export const config = {
  matcher: ["/dashboard/:path*"],
};
```

In components, access session:

```ts
const { data: session } = useSession();
```

## 5. API Routes & Server Actions

For internal API needs, create routes under `/app/api`.

```ts
// app/api/hello/route.ts
export async function GET() {
  return NextResponse.json({ message: "Hello from API" });
}
```

External APIs or database logic should go in `/services`.

## 6. Custom Hooks & Utilities

Avoid duplicating logic by creating hooks like:

```ts
// hooks/useAuth.ts
export function useAuth() {
  const { data: session } = useSession();
  return session?.user;
}
```

Utility files like `formatDate`, `capitalize`, etc., should live in `/lib`.

## 7. Clean, Type-Safe Components

- Use TypeScript everywhere
- Avoid prop drilling by using context only where necessary
- Prefer small, stateless components
- Use `'use client'` directive only when needed

## 8. SEO, Analytics & Monitoring

### SEO
- Use `metadata` export
- Use `next-sitemap` for automatic sitemaps

### Analytics
- Integrate Vercel Analytics, Plausible, or Google Analytics

### Error Monitoring
- Use Sentry or LogRocket to monitor user sessions and errors

## 9. Linting, Formatting, and Type Checking

ESLint + Prettier + TypeScript:

```bash
npm install --save-dev eslint prettier eslint-config-next
```

Add a lint script:

```json
"scripts": {
  "lint": "next lint"
}
```
