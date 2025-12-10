# Required Environment Variables for API

Create a `.env` file in `apps/api/` with the following variables:

## Application
```env
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
FRONTEND_URL=http://localhost:5137
CORS_ORIGINS=http://localhost:5137,http://localhost:3000
LOG_LEVEL=info
```

## Supabase
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

## Database (Supabase Postgres)
```env
DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres
```

## Upstash Redis (Required for idempotency, rate limiting, and caching)
```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

## Getting Upstash Redis Credentials

1. Sign up at [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy the REST URL and REST TOKEN from the database details page
4. Paste them into your `.env` file

These credentials are required for:
- **Idempotency**: Preventing duplicate email sends
- **Rate Limiting**: Protecting the API from abuse (to be implemented)
- **Caching**: Storing rendered templates and results

## Notes

### Email Sending
The endpoint currently:
- ✅ Validates variables using AJV against template.variablesSchema
- ✅ Renders emails using React Email (@requil/email-engine)
- ✅ Marks recipients as 'sent' (mock transport ID)
- ⏭️ TODO: Integrate actual transport delivery (@requil/transports)

### Transport Configuration
Currently using `'default'` transport (internal Resend). Future workspace-specific transport configuration will be implemented.

