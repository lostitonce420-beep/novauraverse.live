import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { sign } from 'hono/jwt';
import bcrypt from 'bcryptjs';
import { createSql } from '../db';
import { requireAuth } from '../middleware/jwt';
import type { Bindings } from '../index';

const auth = new Hono<{ Bindings: Bindings }>();

function toUser(row: Record<string, any>) {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    role: row.role,
    avatar: row.avatar ?? undefined,
    bio: row.bio ?? undefined,
    location: row.location ?? undefined,
    website: row.website ?? undefined,
    twitter: row.twitter ?? undefined,
    github: row.github ?? undefined,
    discord: row.discord ?? undefined,
    membershipTier: row.membership_tier,
    consciousnessCoins: row.consciousness_coins,
    isSubscriber: row.is_subscriber,
    lastDailyClaim: row.last_daily_claim ?? undefined,
    rank: row.rank,
    badges: row.badges ?? [],
    trainingConsentGiven: row.training_consent_given ?? undefined,
    trainingConsentAt: row.training_consent_at ?? undefined,
    trainingConsentVersion: row.training_consent_version ?? undefined,
    preferences: row.preferences,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function createSession(
  sql: ReturnType<typeof createSql>,
  jwtSecret: string,
  userId: string,
  email: string,
): Promise<string> {
  const token = await sign({ userId, email, exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 }, jwtSecret);
  const tokenHash = btoa(token).slice(0, 255);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await sql`
    INSERT INTO sessions (user_id, token_hash, expires_at)
    VALUES (${userId}, ${tokenHash}, ${expiresAt.toISOString()})
  `;

  return token;
}

// ── POST /auth/signup ─────────────────────────────────────────────────────────
auth.post('/signup', async (c) => {
  const { email, password, username } = await c.req.json();

  if (!email || !password || !username) {
    return c.json({ error: 'Email, password, and username are required.' }, 400);
  }
  if (password.length < 8) return c.json({ error: 'Password must be at least 8 characters.' }, 400);
  if (username.length < 3) return c.json({ error: 'Username must be at least 3 characters.' }, 400);

  const { DATABASE_URL, JWT_SECRET } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);

  const existing = await sql`SELECT id FROM users WHERE email = ${email} OR username = ${username} LIMIT 1`;
  if (existing.length > 0) return c.json({ error: 'Email or username already taken.' }, 409);

  const passwordHash = await bcrypt.hash(password, 12);

  const rows = await sql`
    INSERT INTO users (email, username, password_hash, role, membership_tier, consciousness_coins)
    VALUES (${email}, ${username}, ${passwordHash}, 'buyer', 'free', 50)
    RETURNING *
  `;

  const user = rows[0];
  const token = await createSession(sql, JWT_SECRET, user.id, user.email);
  return c.json({ token, user: toUser(user) }, 201);
});

// ── POST /auth/login ──────────────────────────────────────────────────────────
auth.post('/login', async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) return c.json({ error: 'Email and password are required.' }, 400);

  const { DATABASE_URL, JWT_SECRET } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);

  const rows = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
  if (rows.length === 0) return c.json({ error: 'Account not found. Please check your email or sign up.' }, 401);

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return c.json({ error: 'Invalid password. Please try again.' }, 401);

  const token = await createSession(sql, JWT_SECRET, user.id, user.email);
  return c.json({ token, user: toUser(user) });
});

// ── GET /auth/me ──────────────────────────────────────────────────────────────
auth.get('/me', requireAuth, async (c) => {
  const userId = c.get('userId');
  const { DATABASE_URL } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);
  const rows = await sql`SELECT * FROM users WHERE id = ${userId} LIMIT 1`;
  if (rows.length === 0) return c.json({ error: 'User not found' }, 404);
  return c.json({ user: toUser(rows[0]) });
});

// ── POST /auth/logout ─────────────────────────────────────────────────────────
auth.post('/logout', requireAuth, async (c) => {
  const authHeader = c.req.header('Authorization')!;
  const token = authHeader.slice(7);
  const tokenHash = btoa(token).slice(0, 255);
  const { DATABASE_URL } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);
  await sql`DELETE FROM sessions WHERE token_hash = ${tokenHash}`;
  return c.json({ ok: true });
});

// ── PATCH /auth/profile ───────────────────────────────────────────────────────
auth.patch('/profile', requireAuth, async (c) => {
  const userId = c.get('userId');
  const data = await c.req.json();
  const { DATABASE_URL } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);

  const allowed = ['username', 'avatar', 'bio', 'location', 'website',
    'twitter', 'github', 'discord', 'preferences',
    'training_consent_given', 'training_consent_at', 'training_consent_version',
    'consciousness_coins', 'last_daily_claim', 'rank', 'badges',
    'membership_tier', 'is_subscriber'];

  const camelToSnake: Record<string, string> = {
    trainingConsentGiven: 'training_consent_given',
    trainingConsentAt: 'training_consent_at',
    trainingConsentVersion: 'training_consent_version',
    consciousnessCoins: 'consciousness_coins',
    lastDailyClaim: 'last_daily_claim',
    membershipTier: 'membership_tier',
    isSubscriber: 'is_subscriber',
  };

  const updates: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(data)) {
    const col = camelToSnake[key] ?? key;
    if (allowed.includes(col)) {
      updates.push(`${col} = $${idx}`);
      values.push(typeof value === 'object' && value !== null && !Array.isArray(value)
        ? JSON.stringify(value)
        : value);
      idx++;
    }
  }

  if (updates.length === 0) return c.json({ error: 'No valid fields to update.' }, 400);

  values.push(userId);
  const rows = await sql(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );

  if (rows.length === 0) return c.json({ error: 'User not found' }, 404);
  return c.json({ user: toUser(rows[0]) });
});

// ── POST /auth/admin-setup ────────────────────────────────────────────────────
auth.post('/admin-setup', async (c) => {
  const { DATABASE_URL, JWT_SECRET } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);

  const existing = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`;
  if (existing.length > 0) return c.json({ error: 'Admin already exists.' }, 403);

  const { email, password, username } = await c.req.json();
  if (!email || !password || !username) return c.json({ error: 'All fields required.' }, 400);

  const passwordHash = await bcrypt.hash(password, 12);
  const rows = await sql`
    INSERT INTO users (email, username, password_hash, role, membership_tier, consciousness_coins, rank)
    VALUES (${email}, ${username}, ${passwordHash}, 'admin', 'catalyst', 99999, 'The Catalyst')
    RETURNING *
  `;

  const user = rows[0];
  const token = await createSession(sql, JWT_SECRET, user.id, user.email);
  return c.json({ token, user: toUser(user) }, 201);
});

export default auth;

// ── POST /auth/staff-login ────────────────────────────────────────────────────
auth.post('/staff-login', async (c) => {
  const { email, password, firstName, lastName, title, isNewRegistration } = await c.req.json();
  if (!email || !password) return c.json({ error: 'Email and password are required.' }, 400);

  const { DATABASE_URL, JWT_SECRET } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);

  const allowed = await sql`SELECT * FROM staff_allowlist WHERE email = ${email.toLowerCase()} LIMIT 1`;
  if (allowed.length === 0) return c.json({ error: 'This email is not authorized for staff access.' }, 403);

  const allowEntry = allowed[0];

  if (isNewRegistration) {
    if (allowEntry.used) return c.json({ error: 'This staff invite has already been used. Please log in instead.' }, 409);
    if (!firstName || !lastName || !title) return c.json({ error: 'First name, last name, and title are required.' }, 400);
    if (password.length < 8) return c.json({ error: 'Password must be at least 8 characters.' }, 400);

    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`;
    if (existing.length > 0) return c.json({ error: 'Account already exists. Please log in.' }, 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`.replace(/\s+/g, '_');

    const rows = await sql`
      INSERT INTO users (email, username, password_hash, role, membership_tier, consciousness_coins, rank, badges)
      VALUES (${email.toLowerCase()}, ${username}, ${passwordHash}, 'admin', 'catalyst', 10000, ${title}, ARRAY['dev_core'])
      RETURNING *
    `;

    await sql`UPDATE staff_allowlist SET used = TRUE WHERE id = ${allowEntry.id}`;
    const user = rows[0];
    const token = await createSession(sql, JWT_SECRET, user.id, user.email);
    return c.json({ token, user: toUser(user) }, 201);
  } else {
    const rows = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`;
    if (rows.length === 0) return c.json({ error: 'Account not found. Complete registration first.' }, 401);

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return c.json({ error: 'Invalid password.' }, 401);
    if (user.role !== 'admin' && user.role !== 'moderator') return c.json({ error: 'This account does not have staff access.' }, 403);

    const token = await createSession(sql, JWT_SECRET, user.id, user.email);
    return c.json({ token, user: toUser(user) });
  }
});

// ── POST /auth/staff-invite ───────────────────────────────────────────────────
auth.post('/staff-invite', requireAuth, async (c) => {
  const requestingUserId = c.get('userId');
  const { DATABASE_URL } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);

  const requester = await sql`SELECT role FROM users WHERE id = ${requestingUserId} LIMIT 1`;
  if (requester.length === 0 || requester[0].role !== 'admin') return c.json({ error: 'Only admins can invite staff.' }, 403);

  const { email, firstName, lastName, title } = await c.req.json();
  if (!email || !firstName || !lastName || !title) return c.json({ error: 'Email, first name, last name, and title are required.' }, 400);

  const existing = await sql`SELECT id FROM staff_allowlist WHERE email = ${email.toLowerCase()} LIMIT 1`;
  if (existing.length > 0) return c.json({ error: 'This email is already on the staff allowlist.' }, 409);

  await sql`
    INSERT INTO staff_allowlist (email, first_name, last_name, title, invited_by)
    VALUES (${email.toLowerCase()}, ${firstName}, ${lastName}, ${title}, ${requestingUserId})
  `;
  return c.json({ ok: true, message: `${email} added to staff allowlist.` });
});

// ── GET /auth/staff-allowlist ─────────────────────────────────────────────────
auth.get('/staff-allowlist', requireAuth, async (c) => {
  const requestingUserId = c.get('userId');
  const { DATABASE_URL } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);

  const requester = await sql`SELECT role FROM users WHERE id = ${requestingUserId} LIMIT 1`;
  if (requester.length === 0 || requester[0].role !== 'admin') return c.json({ error: 'Only admins can view the staff allowlist.' }, 403);

  const list = await sql`SELECT id, email, first_name, last_name, title, used, created_at FROM staff_allowlist ORDER BY created_at DESC`;
  return c.json({ allowlist: list });
});

// ── DELETE /auth/staff-invite/:id ─────────────────────────────────────────────
auth.delete('/staff-invite/:id', requireAuth, async (c) => {
  const requestingUserId = c.get('userId');
  const { DATABASE_URL } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);

  const requester = await sql`SELECT role FROM users WHERE id = ${requestingUserId} LIMIT 1`;
  if (requester.length === 0 || requester[0].role !== 'admin') return c.json({ error: 'Only admins can remove staff invites.' }, 403);

  const { id } = c.req.param();
  await sql`DELETE FROM staff_allowlist WHERE id = ${id}`;
  return c.json({ ok: true });
});
