# Required Environment Variables

Create a `.env` file in `apps/api/` with the following variables:

## Application Configuration
```env
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
FRONTEND_URL=http://localhost:5137
CORS_ORIGINS=http://localhost:5137,http://localhost:3000
LOG_LEVEL=info
```

## Supabase (Database & Auth)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres
```

## Upstash Redis (Idempotency & Caching)
```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

**Required for:**
- ✅ Idempotency protection (preventing duplicate sends)
- ✅ Result caching (24h TTL)
- ⏭️ Rate limiting (to be implemented)

[Get credentials at upstash.com](https://upstash.com)

## Email Transport (Resend)
```env
RESEND_API_KEY=re_your_api_key_here
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
```

**Required for:**
- ✅ **Actual email delivery** via Resend
- Subject line from `template.subjectLines[0]`
- HTML + plaintext rendering via React Email

[Get API key at resend.com](https://resend.com)

## Email Sending Flow

The endpoint now **actually sends emails**:

1. ✅ Validates variables (AJV + template.variablesSchema)
2. ✅ Renders HTML + plaintext (React Email)
3. ✅ **Sends via Resend transport**
4. ✅ Stores real messageId from Resend
5. ✅ Updates recipient status (sent/failed)

Transport errors are caught and recipients marked as `failed` with `errorCode: TRANSPORT_ERROR`.

