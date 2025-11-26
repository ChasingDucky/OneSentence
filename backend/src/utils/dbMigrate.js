const db = require('../../config/database');

const migrations = [
  // Users table
  `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    is_guest BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    preferences JSONB DEFAULT '{}'::jsonb,
    is_banned BOOLEAN DEFAULT false
  );
  `,

  // Anonymous profiles table
  `
  CREATE TABLE IF NOT EXISTS anonymous_profiles (
    anon_id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `,

  // Messages table
  `
  CREATE TABLE IF NOT EXISTS messages (
    msg_id SERIAL PRIMARY KEY,
    anon_id VARCHAR(36) REFERENCES anonymous_profiles(anon_id),
    text TEXT NOT NULL CHECK (length(text) <= 140),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    language VARCHAR(10) DEFAULT 'zh',
    metadata JSONB DEFAULT '{}'::jsonb,
    is_filtered BOOLEAN DEFAULT false,
    filter_reason VARCHAR(255)
  );
  `,

  // Pairings table
  `
  CREATE TABLE IF NOT EXISTS pairings (
    pairing_id SERIAL PRIMARY KEY,
    msg_id_from INTEGER REFERENCES messages(msg_id),
    msg_id_to INTEGER REFERENCES messages(msg_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT false
  );
  `,

  // Reactions table
  `
  CREATE TABLE IF NOT EXISTS reactions (
    reaction_id SERIAL PRIMARY KEY,
    msg_id INTEGER REFERENCES messages(msg_id),
    anon_id VARCHAR(36) REFERENCES anonymous_profiles(anon_id),
    reaction_type VARCHAR(20) CHECK (reaction_type IN ('resonate', 'curious', 'applause', 'want_more')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(msg_id, anon_id)
  );
  `,

  // Favorites table
  `
  CREATE TABLE IF NOT EXISTS favorites (
    favorite_id SERIAL PRIMARY KEY,
    msg_id INTEGER REFERENCES messages(msg_id),
    anon_id VARCHAR(36) REFERENCES anonymous_profiles(anon_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(msg_id, anon_id)
  );
  `,

  // Reports table
  `
  CREATE TABLE IF NOT EXISTS reports (
    report_id SERIAL PRIMARY KEY,
    msg_id INTEGER REFERENCES messages(msg_id),
    reporter_anon_id VARCHAR(36) REFERENCES anonymous_profiles(anon_id),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewer_notes TEXT
  );
  `,

  // Indexes for performance
  `
  CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_messages_anon_id ON messages(anon_id);
  CREATE INDEX IF NOT EXISTS idx_pairings_msg_from ON pairings(msg_id_from);
  CREATE INDEX IF NOT EXISTS idx_pairings_msg_to ON pairings(msg_id_to);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
  `,
];

async function runMigrations() {
  console.log('Starting database migrations...');

  try {
    for (let i = 0; i < migrations.length; i++) {
      console.log(`Running migration ${i + 1}/${migrations.length}...`);
      await db.query(migrations[i]);
    }

    console.log('✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
