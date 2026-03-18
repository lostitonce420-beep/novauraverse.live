-- NovAura Platform — Neon Postgres Schema v2
-- Run this in your Neon SQL editor to set up the full database.
-- Safe to re-run (IF NOT EXISTS on all tables/indexes).

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                    VARCHAR(255) UNIQUE NOT NULL,
  username                 VARCHAR(100) UNIQUE NOT NULL,
  password_hash            VARCHAR(255) NOT NULL,
  role                     VARCHAR(50)  NOT NULL DEFAULT 'buyer',
  avatar                   TEXT,
  bio                      TEXT,
  location                 VARCHAR(255),
  website                  VARCHAR(500),
  twitter                  VARCHAR(100),
  github                   VARCHAR(100),
  discord                  VARCHAR(100),

  membership_tier          VARCHAR(50)  NOT NULL DEFAULT 'free',
  consciousness_coins      INTEGER      NOT NULL DEFAULT 50,
  is_subscriber            BOOLEAN      NOT NULL DEFAULT FALSE,
  last_daily_claim         TIMESTAMPTZ,
  rank                     VARCHAR(100) DEFAULT 'Member',
  badges                   TEXT[]       DEFAULT '{}',

  training_consent_given   BOOLEAN,
  training_consent_at      TIMESTAMPTZ,
  training_consent_version VARCHAR(20),

  stripe_connect_id        VARCHAR(255),

  preferences JSONB NOT NULL DEFAULT '{
    "showNsfw": false,
    "ageVerified": false,
    "emailNotifications": true,
    "marketingEmails": false,
    "publicProfile": true,
    "showActivity": true
  }',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Sessions ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Staff Allowlist ───────────────────────────────────────────────────────────
-- Owner pre-approves emails before staff can register at /staff-login
CREATE TABLE IF NOT EXISTS staff_allowlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name  VARCHAR(100) NOT NULL,
  title      VARCHAR(150) NOT NULL,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  used       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Assets ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Listing info
  title            VARCHAR(255) NOT NULL,
  description      TEXT,
  category         VARCHAR(100) NOT NULL DEFAULT 'other',
  tags             TEXT[]       DEFAULT '{}',
  engine           VARCHAR(100),  -- e.g. 'unreal', 'unity', 'godot', 'blender'

  -- Pricing & royalties
  price            DECIMAL(10,2) NOT NULL DEFAULT 0.00,  -- USD
  is_free          BOOLEAN NOT NULL DEFAULT FALSE,
  royalty_rate     DECIMAL(5,4) NOT NULL DEFAULT 0.03,   -- e.g. 0.03 = 3%
  license_tier     VARCHAR(50) NOT NULL DEFAULT 'art_3pct',
  -- License tiers: art_3pct | music_1pct | integration_10pct | functional_15pct

  -- Files & media
  thumbnail_url    TEXT,
  preview_urls     TEXT[]  DEFAULT '{}',
  download_url     TEXT,   -- set after upload
  file_size_bytes  BIGINT,
  file_format      VARCHAR(50),

  -- Status
  status           VARCHAR(50) NOT NULL DEFAULT 'draft',
  -- draft | pending | approved | rejected
  rejection_reason TEXT,
  reviewed_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at      TIMESTAMPTZ,

  -- Stats
  download_count   INTEGER NOT NULL DEFAULT 0,
  view_count       INTEGER NOT NULL DEFAULT 0,
  rating_sum       INTEGER NOT NULL DEFAULT 0,
  rating_count     INTEGER NOT NULL DEFAULT 0,

  -- Flags
  is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
  is_nsfw          BOOLEAN NOT NULL DEFAULT FALSE,
  is_staff_pick    BOOLEAN NOT NULL DEFAULT FALSE,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Orders ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_id           UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  creator_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Financials
  price_paid         DECIMAL(10,2) NOT NULL,
  platform_fee       DECIMAL(10,2) NOT NULL,   -- NovAura cut (20%)
  creator_payout     DECIMAL(10,2) NOT NULL,   -- Creator gets 80%
  royalty_rate       DECIMAL(5,4)  NOT NULL,   -- Rate locked at time of purchase

  -- Payment
  stripe_payment_id  VARCHAR(255),
  status             VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- pending | completed | refunded | disputed

  -- License
  license_key        VARCHAR(255) UNIQUE,
  eula_version       VARCHAR(20),
  eula_accepted_at   TIMESTAMPTZ,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Royalty Payments ──────────────────────────────────────────────────────────
-- Tracks royalty owed when a buyer's commercial project earns revenue
CREATE TABLE IF NOT EXISTS royalty_payments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  creator_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_id         UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,

  reported_revenue DECIMAL(12,2) NOT NULL,  -- Buyer's declared commercial revenue
  royalty_rate     DECIMAL(5,4)  NOT NULL,
  royalty_owed     DECIMAL(10,2) NOT NULL,  -- reported_revenue * royalty_rate

  status           VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- pending | paid | waived | disputed

  stripe_payment_id VARCHAR(255),
  notes            TEXT,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Reviews ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id   UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (asset_id, reviewer_id)
);

-- ── Wishlist ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_id   UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, asset_id)
);

-- ── Agreements / EULAs ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agreements (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_id     UUID REFERENCES assets(id) ON DELETE SET NULL,
  order_id     UUID REFERENCES orders(id) ON DELETE SET NULL,
  eula_version VARCHAR(20) NOT NULL,
  eula_type    VARCHAR(50) NOT NULL,  -- 'purchase' | 'creator' | 'platform'
  accepted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address   VARCHAR(45),
  user_agent   TEXT
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email          ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username       ON users(username);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id     ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token       ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_assets_creator       ON assets(creator_id);
CREATE INDEX IF NOT EXISTS idx_assets_status        ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_category      ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_featured      ON assets(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_orders_buyer         ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_creator       ON orders(creator_id);
CREATE INDEX IF NOT EXISTS idx_orders_asset         ON orders(asset_id);
CREATE INDEX IF NOT EXISTS idx_royalties_creator    ON royalty_payments(creator_id);
CREATE INDEX IF NOT EXISTS idx_staff_allowlist_email ON staff_allowlist(email);

-- ── Auto-update updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER royalties_updated_at
  BEFORE UPDATE ON royalty_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
