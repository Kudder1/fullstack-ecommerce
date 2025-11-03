require('dotenv').config({ path: process.env.NODE_ENV !== 'development' ? '/etc/app.env' : undefined, quiet: true });
const sequelize = require('./db');

/**
 * This script marks all existing migrations as completed WITHOUT running them.
 * Use this ONLY if your database was created with sync() and already has all tables.
 * 
 * This prevents migrations from trying to recreate existing tables.
 */

const migrations = [
  '20250101000001-create-user.js',
  '20250101000002-create-type.js',
  '20250101000003-create-brand.js',
  '20250101000004-create-device.js',
  '20250101000005-create-basket.js',
  '20250101000006-create-basket-device.js',
  '20250101000007-create-rating.js',
  '20250101000008-create-device-info.js',
  '20250101000009-create-type-brand.js',
  '20250101000010-create-order.js',
  '20250101000011-create-order-item.js'
];

async function initializeMigrationState() {
  try {
    console.log('🔍 Checking database connection...');
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Create SequelizeMeta table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        name VARCHAR(255) NOT NULL PRIMARY KEY
      );
    `);
    console.log('✅ SequelizeMeta table ready');

    // Check which migrations are already marked
    const [existingMigrations] = await sequelize.query(
      'SELECT name FROM "SequelizeMeta"'
    );
    const existingNames = existingMigrations.map(m => m.name);
    
    console.log('\n📋 Current migration state:');
    console.log('Already applied:', existingNames.length);

    // Insert missing migrations
    let inserted = 0;
    for (const migration of migrations) {
      if (!existingNames.includes(migration)) {
        await sequelize.query(
          'INSERT INTO "SequelizeMeta" (name) VALUES (?)',
          { replacements: [migration] }
        );
        console.log(`  ✓ Marked as applied: ${migration}`);
        inserted++;
      } else {
        console.log(`  - Already marked: ${migration}`);
      }
    }

    console.log(`\n✅ Done! Marked ${inserted} migrations as applied`);
    console.log('\n💡 Your database schema is now tracked by migrations.');
    console.log('   Future schema changes should be done through new migration files.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Confirm before running
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('⚠️  WARNING: This script will mark all migrations as completed.');
console.log('   Only run this if your database was created with sync() and has all tables.\n');

readline.question('Are you sure you want to continue? (yes/no): ', (answer) => {
  readline.close();
  
  if (answer.toLowerCase() === 'yes') {
    initializeMigrationState();
  } else {
    console.log('❌ Cancelled');
    process.exit(0);
  }
});
