# Debug: Proxy Not Recognizing Session Cookie

## Problem
Login succeeds (200 OK), session cookie is set, but proxy.ts redirects back to login.

## Possible Causes
1. Cookie name mismatch - NextAuth v5 uses `authjs.session-token` but proxy might be looking for different name
2. Cookie not being sent with request - domain/path/SameSite issues
3. getToken() not reading the cookie correctly
4. Edge runtime limitations - proxy runs on Edge, cookies might not work the same

## Solution: Add Debugging to Proxy

Add console logs to see what's happening:
- Is the cookie present in the request?
- Is getToken() finding the token?
- What does the token contain?

## Alternative: Temporarily Disable Proxy Check

To test if proxy is the issue, we could temporarily make proxy more lenient or check session differently.

