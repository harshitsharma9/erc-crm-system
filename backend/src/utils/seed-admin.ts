import bcrypt from 'bcryptjs';
import pool from '../config/postgres';

/**
 * Seeds one ADMIN user if none exists.
 * Email:    admin@erp.com
 * Password: Admin@123
 */
async function seedAdmin() {
  const email = 'admin@erp.com';
  const password = 'Admin@123';
  const name = 'Administrator';

  // Check if an admin already exists
  const existing = await pool.query('SELECT id FROM "User" WHERE role = $1', ['ADMIN']);
  if (existing.rowCount && existing.rowCount > 0) {
    console.log('✅ Admin account already exists — skipping seed.');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query(
    'INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4::"Role", NOW(), NOW())',
    [email, hashedPassword, name, 'ADMIN']
  );

  console.log('✅ Admin account seeded successfully.');
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Failed to seed admin:', err);
    process.exit(1);
  });
