# Restart Dev Server to Pick Up Proxy Changes

If you're seeing the middleware deprecation warning in your local dev server:

1. **Stop the dev server** (Ctrl+C or Cmd+C)

2. **Clear the Next.js cache**:
   ```bash
   rm -rf .next
   ```

3. **Restart the dev server**:
   ```bash
   npm run dev
   ```

The warning should now be gone! The `proxy.ts` file is already in place with the correct `proxy` function.

