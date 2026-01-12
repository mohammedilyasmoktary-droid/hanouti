# Check Vercel Logs for Proxy Debug Info

After deploying, check Vercel logs to see what's happening:

1. **Go to**: Vercel Dashboard → Your Project → **Logs**
2. **Try logging in** (to generate new logs)
3. **Look for logs** that start with `[Proxy]`
4. **Check for**:
   - `[Proxy] Token check:` - Shows if token exists and what role it has
   - `[Proxy] No token or not ADMIN` - Shows if token check fails
   - `[Proxy] Error getting token:` - Shows any errors

**What to look for:**
- Does `hasToken: true` or `hasToken: false`?
- What is `tokenRole`? (should be "ADMIN")
- Is `cookieHeader` present? (should show cookie string)

**Share the logs with me** so we can see what's happening!

