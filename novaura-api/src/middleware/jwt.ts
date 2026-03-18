import { createMiddleware } from 'hono/factory';
import { env } from 'hono/adapter';
import { verify } from 'hono/jwt';
import { createSql } from '../db';

export interface JWTPayload {
  userId: string;
  email: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
    userEmail: string;
  }
}

export const requireAuth = createMiddleware(async (c, next) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = auth.slice(7);
  const { JWT_SECRET, DATABASE_URL } = env<{ JWT_SECRET: string; DATABASE_URL: string }>(c);

  try {
    const payload = await verify(token, JWT_SECRET, 'HS256') as unknown as JWTPayload;

    const sql = createSql(DATABASE_URL);
    const tokenHash = btoa(token).slice(0, 255);
    const sessions = await sql`
      SELECT id FROM sessions
      WHERE user_id = ${payload.userId}
        AND token_hash = ${tokenHash}
        AND expires_at > NOW()
      LIMIT 1
    `;

    if (sessions.length === 0) {
      return c.json({ error: 'Session expired' }, 401);
    }

    c.set('userId', payload.userId);
    c.set('userEmail', payload.email);
    await next();
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
});
