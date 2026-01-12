# Fix: "no matching decryption secret" Error

## The Error

```
Error: no matching decryption secret
```

This means NextAuth is trying to decrypt a JWT token but can't find the matching secret that was used to sign it.

## Cause

The token was signed with one secret, but NextAuth is trying to decrypt it with a different secret. This happens when:

1. **`NEXTAUTH_SECRET` and `AUTH_SECRET` have different values**
   - NextAuth might use one to sign, and another to decrypt
   - They should be the SAME value

2. **Secret changed after token was created**
   - Token was signed with old secret
   - New deployment uses different secret
   - Token can't be decrypted

3. **Missing secret in some places**
   - Some code uses `NEXTAUTH_SECRET`
   - Other code uses `AUTH_SECRET`
   - They have different values

## Solution

**Ensure `NEXTAUTH_SECRET` and `AUTH_SECRET` are the SAME value:**

1. Go to: Vercel Dashboard → Settings → Environment Variables

2. Check both values:
   - `NEXTAUTH_SECRET` = Your secret value
   - `AUTH_SECRET` = Should be the SAME as `NEXTAUTH_SECRET`

3. **If they're different:**
   - Generate a new secret: `openssl rand -base64 32`
   - Set BOTH `NEXTAUTH_SECRET` AND `AUTH_SECRET` to the SAME value
   - Save both

4. **After updating:**
   - Redeploy: Deployments → Latest → ⋮ → Redeploy
   - Clear browser cookies (or use incognito/private window)
   - Try logging in again

The error happens because NextAuth uses one secret to sign tokens, but then tries to decrypt with a different secret. They must match!

