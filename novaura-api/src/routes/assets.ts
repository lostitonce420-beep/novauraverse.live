import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { createSql } from '../db';
import { requireAuth } from '../middleware/jwt';
import type { Bindings } from '../index';

const assets = new Hono<{ Bindings: Bindings }>();

function toAsset(row: Record<string, any>) {
  return {
    id: row.id,
    creatorId: row.creator_id,
    title: row.title,
    description: row.description,
    category: row.category,
    tags: row.tags ?? [],
    engine: row.engine ?? undefined,
    price: parseFloat(row.price),
    isFree: row.is_free,
    royaltyRate: parseFloat(row.royalty_rate),
    licenseTier: row.license_tier,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    previewUrls: row.preview_urls ?? [],
    downloadUrl: row.download_url ?? undefined,
    fileSizeBytes: row.file_size_bytes ?? undefined,
    fileFormat: row.file_format ?? undefined,
    status: row.status,
    rejectionReason: row.rejection_reason ?? undefined,
    downloadCount: row.download_count,
    viewCount: row.view_count,
    ratingSum: row.rating_sum,
    ratingCount: row.rating_count,
    isFeatured: row.is_featured,
    isNsfw: row.is_nsfw,
    isStaffPick: row.is_staff_pick,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    creator: row.creator_username ? {
      id: row.creator_id,
      username: row.creator_username,
      avatar: row.creator_avatar,
    } : undefined,
  };
}

// ── GET /assets — browse approved assets ─────────────────────────────────────
assets.get('/', async (c) => {
  const { category, engine, search, sort = 'newest', page = '1', limit = '24', featured } = c.req.query();
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let whereClause = `WHERE a.status = 'approved'`;
  const params: any[] = [];
  let idx = 1;

  if (category) { whereClause += ` AND a.category = $${idx++}`; params.push(category); }
  if (engine)   { whereClause += ` AND a.engine = $${idx++}`;   params.push(engine); }
  if (search) {
    whereClause += ` AND (a.title ILIKE $${idx} OR a.description ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }
  if (featured === 'true') whereClause += ` AND a.is_featured = TRUE`;

  const orderBy =
    sort === 'price_asc'  ? 'a.price ASC' :
    sort === 'price_desc' ? 'a.price DESC' :
    sort === 'popular'    ? 'a.download_count DESC' :
    sort === 'top_rated'  ? '(a.rating_sum::float / NULLIF(a.rating_count, 0)) DESC NULLS LAST' :
    'a.created_at DESC';

  const query = `
    SELECT a.*, u.username AS creator_username, u.avatar AS creator_avatar
    FROM assets a
    JOIN users u ON u.id = a.creator_id
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT $${idx++} OFFSET $${idx++}
  `;
  const countQuery = `SELECT COUNT(*) FROM assets a ${whereClause}`;
  const countParams = [...params];
  params.push(parseInt(limit), offset);

  const { DATABASE_URL } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);

  const [rows, countRows] = await Promise.all([
    sql(query, params),
    sql(countQuery, countParams),
  ]);

  return c.json({
    assets: rows.map(toAsset),
    total: parseInt((countRows[0] as any).count),
    page: parseInt(page),
    limit: parseInt(limit),
  });
});

// ── GET /assets/featured ──────────────────────────────────────────────────────
assets.get('/featured', async (c) => {
  const { DATABASE_URL } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);
  const rows = await sql`
    SELECT a.*, u.username AS creator_username, u.avatar AS creator_avatar
    FROM assets a JOIN users u ON u.id = a.creator_id
    WHERE a.status = 'approved' AND a.is_featured = TRUE
    ORDER BY a.created_at DESC LIMIT 12
  `;
  return c.json({ assets: rows.map(toAsset) });
});

// ── GET /assets/pending — admin only ──────────────────────────────────────────
assets.get('/pending', requireAuth, async (c) => {
  const userId = c.get('userId');
  const { DATABASE_URL } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);

  const user = await sql`SELECT role FROM users WHERE id = ${userId} LIMIT 1`;
  if (!user[0] || user[0].role !== 'admin') return c.json({ error: 'Unauthorized' }, 403);

  const rows = await sql`
    SELECT a.*, u.username AS creator_username, u.avatar AS creator_avatar
    FROM assets a JOIN users u ON u.id = a.creator_id
    WHERE a.status = 'pending'
    ORDER BY a.created_at ASC
  `;
  return c.json({ assets: rows.map(toAsset) });
});

// ── GET /assets/:id ───────────────────────────────────────────────────────────
assets.get('/:id', async (c) => {
  const { id } = c.req.param();
  const { DATABASE_URL } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);

  const rows = await sql`
    SELECT a.*, u.username AS creator_username, u.avatar AS creator_avatar
    FROM assets a JOIN users u ON u.id = a.creator_id
    WHERE a.id = ${id} LIMIT 1
  `;
  if (rows.length === 0) return c.json({ error: 'Asset not found' }, 404);

  await sql`UPDATE assets SET view_count = view_count + 1 WHERE id = ${id}`;
  return c.json({ asset: toAsset(rows[0]) });
});

// ── POST /assets — create listing ─────────────────────────────────────────────
assets.post('/', requireAuth, async (c) => {
  const userId = c.get('userId');
  const { DATABASE_URL } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);

  const user = await sql`SELECT role FROM users WHERE id = ${userId} LIMIT 1`;
  if (!user[0] || !['creator', 'admin'].includes(user[0].role)) {
    return c.json({ error: 'Creator or admin account required to list assets.' }, 403);
  }

  const {
    title, description, category, tags, engine,
    price, isFree, licenseTier, thumbnailUrl, previewUrls,
    downloadUrl, fileSizeBytes, fileFormat, isNsfw,
  } = await c.req.json();

  if (!title || !category) return c.json({ error: 'Title and category are required.' }, 400);

  const royaltyMap: Record<string, number> = {
    art_3pct: 0.03, music_1pct: 0.01, integration_10pct: 0.10,
    functional_15pct: 0.15, source_20pct: 0.20, opensource: 0,
  };
  const royaltyRate = royaltyMap[licenseTier ?? 'art_3pct'] ?? 0.03;
  const assetPrice = isFree ? 0 : (parseFloat(price) || 0);

  const rows = await sql`
    INSERT INTO assets (
      creator_id, title, description, category, tags, engine,
      price, is_free, royalty_rate, license_tier,
      thumbnail_url, preview_urls, download_url,
      file_size_bytes, file_format, is_nsfw, status
    ) VALUES (
      ${userId}, ${title}, ${description ?? null}, ${category},
      ${tags ?? []}, ${engine ?? null},
      ${assetPrice}, ${isFree ?? false}, ${royaltyRate}, ${licenseTier ?? 'art_3pct'},
      ${thumbnailUrl ?? null}, ${previewUrls ?? []}, ${downloadUrl ?? null},
      ${fileSizeBytes ?? null}, ${fileFormat ?? null}, ${isNsfw ?? false},
      'pending'
    ) RETURNING *
  `;

  return c.json({ asset: toAsset(rows[0]) }, 201);
});

// ── PATCH /assets/:id — update listing ───────────────────────────────────────
assets.patch('/:id', requireAuth, async (c) => {
  const userId = c.get('userId');
  const { id } = c.req.param();
  const data = await c.req.json();
  const { DATABASE_URL } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);

  const asset = await sql`SELECT creator_id, status FROM assets WHERE id = ${id} LIMIT 1`;
  if (asset.length === 0) return c.json({ error: 'Asset not found' }, 404);

  const user = await sql`SELECT role FROM users WHERE id = ${userId} LIMIT 1`;
  const isOwner = asset[0].creator_id === userId;
  const isAdmin = user[0]?.role === 'admin';
  if (!isOwner && !isAdmin) return c.json({ error: 'Unauthorized' }, 403);

  const allowed = ['title','description','category','tags','engine','price','is_free',
    'license_tier','thumbnail_url','preview_urls','download_url','file_size_bytes',
    'file_format','is_nsfw','is_featured','is_staff_pick','status','rejection_reason'];

  const camelToSnake: Record<string, string> = {
    isFree: 'is_free', licenseTier: 'license_tier', thumbnailUrl: 'thumbnail_url',
    previewUrls: 'preview_urls', downloadUrl: 'download_url',
    fileSizeBytes: 'file_size_bytes', fileFormat: 'file_format',
    isNsfw: 'is_nsfw', isFeatured: 'is_featured', isStaffPick: 'is_staff_pick',
    rejectionReason: 'rejection_reason',
  };

  const updates: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(data)) {
    const col = camelToSnake[key] ?? key;
    if (allowed.includes(col)) {
      updates.push(`${col} = $${idx++}`);
      values.push(value);
    }
  }

  if (updates.length === 0) return c.json({ error: 'No valid fields to update.' }, 400);

  values.push(id);
  const rows = await sql(
    `UPDATE assets SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );

  return c.json({ asset: toAsset(rows[0]) });
});

// ── POST /assets/:id/approve — admin only ────────────────────────────────────
assets.post('/:id/approve', requireAuth, async (c) => {
  const userId = c.get('userId');
  const { id } = c.req.param();
  const { DATABASE_URL } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);

  const user = await sql`SELECT role FROM users WHERE id = ${userId} LIMIT 1`;
  if (!user[0] || user[0].role !== 'admin') return c.json({ error: 'Unauthorized' }, 403);

  await sql`UPDATE assets SET status = 'approved', reviewed_by = ${userId}, reviewed_at = NOW() WHERE id = ${id}`;
  return c.json({ ok: true });
});

// ── POST /assets/:id/reject — admin only ─────────────────────────────────────
assets.post('/:id/reject', requireAuth, async (c) => {
  const userId = c.get('userId');
  const { id } = c.req.param();
  const { reason } = await c.req.json();
  const { DATABASE_URL } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);

  const user = await sql`SELECT role FROM users WHERE id = ${userId} LIMIT 1`;
  if (!user[0] || user[0].role !== 'admin') return c.json({ error: 'Unauthorized' }, 403);

  await sql`
    UPDATE assets SET status = 'rejected', rejection_reason = ${reason ?? 'Does not meet guidelines'},
    reviewed_by = ${userId}, reviewed_at = NOW()
    WHERE id = ${id}
  `;
  return c.json({ ok: true });
});

// ── GET /assets/creator/:creatorId ───────────────────────────────────────────
assets.get('/creator/:creatorId', async (c) => {
  const { creatorId } = c.req.param();
  const { DATABASE_URL } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);

  const rows = await sql`
    SELECT a.*, u.username AS creator_username, u.avatar AS creator_avatar
    FROM assets a JOIN users u ON u.id = a.creator_id
    WHERE a.creator_id = ${creatorId} AND a.status = 'approved'
    ORDER BY a.created_at DESC
  `;
  return c.json({ assets: rows.map(toAsset) });
});

export default assets;
