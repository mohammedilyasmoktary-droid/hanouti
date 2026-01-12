# Check /api/auth/error Logs

I see a **GET 500 to `/api/auth/error`** in the logs! This is important.

## Steps:

1. **Click on the GET 500 `/api/auth/error` entry** in the logs
   - This will show you the full error message
   - Copy the error details

2. **Also search for "Proxy" logs:**
   - In the search bar, type: `Proxy`
   - This will show any `[Proxy] Token check:` logs I added

3. **Try logging in again:**
   - This will generate fresh logs
   - Look for new `[Proxy]` entries

## What to Look For:

- **The /api/auth/error message** - This will tell us what's failing
- **Any [Proxy] Token check: logs** - This will show if the cookie is being read
- **The error details** - Copy the full error message

The `/api/auth/error` entry is key - it shows that NextAuth itself is encountering an error, which might be why the session isn't working properly.

