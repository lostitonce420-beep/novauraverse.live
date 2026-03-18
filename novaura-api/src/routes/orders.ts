import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { createSql } from '../db';
import { requireAuth } from '../middleware/jwt';
import type { Bindings } from '../index';

const orders = new Hono<{ Bindings: Bindings }>();

function toOrder(row: Record<string, any>) {
  return {
    id: row.id,
    buyerId: row.buyer_id,
    assetId: row.asset_id,
    creatorId: row.creator_id,
    pricePaid: parseFloat(row.price_paid),
    platformFee: parseFloat(row.platform_fee),
    creatorPayout: parseFloat(row.creator_payout),
    royaltyRate: parseFloat(row.royalty_rate),
    stripePaymentId: row.stripe_payment_id ?? undefined,
    status: row.status,
    licenseKey: row.license_key,
    eulaVersion: row.eula_version ?? undefined,
    eulaAcceptedAt: row.eula_accepted_at ?? undefined,
    createdAt: row.created_at,
    // Joined fields
    assetTitle: row.asset_title ?? undefined,
    assetThumbnail: row.asset_thumbnail ?? undefined,
    downloadUrl: row.download_url ?? undefined,
    creatorUsername: row.creator_username ?? undefined,
  };
}

// ── POST /orders — purchase an asset ─────────────────────────────────────────
orders.post('/', requireAuth, async (c) => {
  const buyerId = c.get('userId');
  const { assetId, eulaVersion, stripePaymentId } = await c.req.json();

  if (!assetId) return c.json({ error: 'Asset ID required.' }, 400);

  const { DATABASE_URL } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);

  // Get asset
  const assetRows = await sql`SELECT * FROM assets WHERE id = ${assetId} AND status = 'approved' LIMIT 1`;
  if (assetRows.length === 0) return c.json({ error: 'Asset not found or not available.' }, 404);
  const asset = assetRows[0];

  // Check not already purchased
  const existing = await sql`
    SELECT id FROM orders WHERE buyer_id = ${buyerId} AND asset_id = ${assetId} AND status = 'completed' LIMIT 1
  `;
  if (existing.length > 0) return c.json({ error: 'You already own this asset.' }, 409);

  const price = parseFloat(asset.price);
  const platformFee = price * 0.10;
  const creatorPayout = price * 0.90;
  const licenseKey = crypto.randomUUID().toUpperCase().replace(/-/g, '').slice(0, 20);

  const rows = await sql`
    INSERT INTO orders (
      buyer_id, asset_id, creator_id, price_paid, platform_fee,
      creator_payout, royalty_rate, stripe_payment_id, status,
      license_key, eula_version, eula_accepted_at
    ) VALUES (
      ${buyerId}, ${assetId}, ${asset.creator_id},
      ${price}, ${platformFee}, ${creatorPayout}, ${asset.royalty_rate},
      ${stripePaymentId ?? null}, ${price === 0 ? 'completed' : 'pending'},
      ${licenseKey}, ${eulaVersion ?? null},
      ${eulaVersion ? new Date().toISOString() : null}
    ) RETURNING *
  `;

  // If free, also increment download count
  if (price === 0) {
    await sql`UPDATE assets SET download_count = download_count + 1 WHERE id = ${assetId}`;
  }

  return c.json({ order: toOrder(rows[0]) }, 201);
});

// ── GET /orders/my — buyer's purchase history ─────────────────────────────────
orders.get('/my', requireAuth, async (c) => {
  const buyerId = c.get('userId');
  const { DATABASE_URL } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);

  const rows = await sql`
    SELECT o.*,
      a.title AS asset_title,
      a.thumbnail_url AS asset_thumbnail,
      a.download_url AS download_url,
      u.username AS creator_username
    FROM orders o
    JOIN assets a ON a.id = o.asset_id
    JOIN users u ON u.id = o.creator_id
    WHERE o.buyer_id = ${buyerId}
    ORDER BY o.created_at DESC
  `;

  return c.json({ orders: rows.map(toOrder) });
});

// ── GET /orders/earnings — creator's sales ───────────────────────────────────
orders.get('/earnings', requireAuth, async (c) => {
  const creatorId = c.get('userId');
  const { DATABASE_URL } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);

  const rows = await sql`
    SELECT o.*,
      a.title AS asset_title,
      a.thumbnail_url AS asset_thumbnail,
      u.username AS creator_username
    FROM orders o
    JOIN assets a ON a.id = o.asset_id
    JOIN users u ON u.id = o.buyer_id
    WHERE o.creator_id = ${creatorId} AND o.status = 'completed'
    ORDER BY o.created_at DESC
  `;

  const totalEarned = rows.reduce((sum, r) => sum + parseFloat(r.creator_payout), 0);
  const totalSales = rows.length;
  const totalRoyaltiesOwed = await sql`
    SELECT COALESCE(SUM(royalty_owed), 0) AS total
    FROM royalty_payments
    WHERE creator_id = ${creatorId} AND status = 'pending'
  `;

  return c.json({
    orders: rows.map(toOrder),
    summary: {
      totalEarned: parseFloat(totalEarned.toFixed(2)),
      totalSales,
      pendingRoyalties: parseFloat(totalRoyaltiesOwed[0]?.total ?? '0'),
    },
  });
});

// ── GET /orders/admin — all orders (admin only) ───────────────────────────────
orders.get('/admin', requireAuth, async (c) => {
  const userId = c.get('userId');
  const { DATABASE_URL } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);

  const user = await sql`SELECT role FROM users WHERE id = ${userId} LIMIT 1`;
  if (!user[0] || user[0].role !== 'admin') return c.json({ error: 'Unauthorized' }, 403);

  const rows = await sql`
    SELECT o.*,
      a.title AS asset_title,
      buyer.username AS buyer_username,
      creator.username AS creator_username
    FROM orders o
    JOIN assets a ON a.id = o.asset_id
    JOIN users buyer ON buyer.id = o.buyer_id
    JOIN users creator ON creator.id = o.creator_id
    ORDER BY o.created_at DESC
    LIMIT 200
  `;

  return c.json({ orders: rows.map(toOrder) });
});

// ── POST /orders/:id/complete — mark paid (webhook or admin) ─────────────────
orders.post('/:id/complete', requireAuth, async (c) => {
  const userId = c.get('userId');
  const { id } = c.req.param();
  const { DATABASE_URL } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);

  const user = await sql`SELECT role FROM users WHERE id = ${userId} LIMIT 1`;
  if (!user[0] || user[0].role !== 'admin') return c.json({ error: 'Unauthorized' }, 403);

  const rows = await sql`UPDATE orders SET status = 'completed' WHERE id = ${id} RETURNING *`;
  if (rows.length === 0) return c.json({ error: 'Order not found' }, 404);

  await sql`UPDATE assets SET download_count = download_count + 1 WHERE id = ${rows[0].asset_id}`;
  return c.json({ order: toOrder(rows[0]) });
});

// ── POST /orders/royalty-report — buyer reports commercial use ────────────────
orders.post('/royalty-report', requireAuth, async (c) => {
  const buyerId = c.get('userId');
  const { orderId, reportedRevenue, notes } = await c.req.json();

  if (!orderId || !reportedRevenue) {
    return c.json({ error: 'Order ID and reported revenue are required.' }, 400);
  }

  const { DATABASE_URL } = env<Bindings>(c);
  const sql = createSql(DATABASE_URL);

  const orderRows = await sql`
    SELECT * FROM orders WHERE id = ${orderId} AND buyer_id = ${buyerId} AND status = 'completed' LIMIT 1
  `;
  if (orderRows.length === 0) return c.json({ error: 'Order not found.' }, 404);

  const order = orderRows[0];
  const revenue = parseFloat(reportedRevenue);
  const royaltyOwed = revenue * parseFloat(order.royalty_rate);

  await sql`
    INSERT INTO royalty_payments (
      order_id, creator_id, buyer_id, asset_id,
      reported_revenue, royalty_rate, royalty_owed, notes
    ) VALUES (
      ${orderId}, ${order.creator_id}, ${buyerId}, ${order.asset_id},
      ${revenue}, ${order.royalty_rate}, ${royaltyOwed}, ${notes ?? null}
    )
  `;

  return c.json({
    ok: true,
    royaltyOwed: parseFloat(royaltyOwed.toFixed(2)),
    message: `Royalty of $${royaltyOwed.toFixed(2)} reported. Creator will be notified.`,
  });
});

export default orders;
