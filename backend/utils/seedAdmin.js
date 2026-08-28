/**
 * Seed script — creates the default admin account and a demo user
 * account with bcrypt-hashed passwords. Run with: npm run seed
 *
 * Credentials come from .env (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD /
 * SEED_DEMO_USER_EMAIL / SEED_DEMO_USER_PASSWORD) so nothing is
 * hard-coded in source. Change these in .env before running in
 * anything resembling a production environment.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function upsertUser({ name, email, password, role }) {
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  const hash = await bcrypt.hash(password, 12);

  if (existing.length) {
    await pool.query('UPDATE users SET password_hash = ?, role = ?, status = "active" WHERE email = ?', [hash, role, email]);
    console.log(`[seed] Updated existing account: ${email} (${role})`);
  } else {
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, "active")',
      [name, email, hash, role]
    );
    console.log(`[seed] Created account: ${email} (${role})`);
  }
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@cybershield.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe_Admin123!';
  const demoEmail = process.env.SEED_DEMO_USER_EMAIL || 'demo@cybershield.local';
  const demoPassword = process.env.SEED_DEMO_USER_PASSWORD || 'ChangeMe_Demo123!';

  await upsertUser({ name: 'Platform Administrator', email: adminEmail, password: adminPassword, role: 'admin' });
  await upsertUser({ name: 'Demo User', email: demoEmail, password: demoPassword, role: 'user' });

  console.log('\n[seed] Done. Login credentials (CHANGE THESE before production):');
  console.log(`  Admin -> ${adminEmail} / ${adminPassword}`);
  console.log(`  Demo  -> ${demoEmail} / ${demoPassword}`);

  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
