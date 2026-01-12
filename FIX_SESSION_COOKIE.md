# Fix: Login Succeeds But Redirects Back to Login

## The Problem

1. Authentication succeeds (200 OK)
2. Session cookie is set
3. Redirect to `/admin` happens
4. But proxy.ts doesn't recognize the session cookie
5. Redirects back to `/admin/login`

## Possible Causes

1. **Cookie not being sent with redirect** - The cookie might not be included in the redirect request
2. **Cookie name mismatch** - NextAuth v5 uses `authjs.session-token` but proxy might be looking for different name
3. **Cookie domain/path/SameSite issues** - Cookie settings might prevent it from being sent
4. **Timing issue** - Cookie isn't available immediately after setting

## Solution: Let NextAuth Handle Redirect

Instead of `redirect: false` + manual redirect, let NextAuth handle the redirect automatically. This ensures cookies are properly set and sent.

Change in `app/admin/login/page.tsx`:

```typescript
// OLD (current):
const result = await signIn("credentials", {
  email,
  password,
  redirect: false,  // ❌ This might cause cookie issues
})

if (result?.ok) {
  window.location.href = "/admin"  // Manual redirect
}

// NEW (better):
await signIn("credentials", {
  email,
  password,
  redirect: true,  // ✅ Let NextAuth handle redirect
  callbackUrl: "/admin",
})
```

This ensures:
- NextAuth sets the cookie properly
- NextAuth handles the redirect
- Cookie is included in redirect request
- Session is properly established

