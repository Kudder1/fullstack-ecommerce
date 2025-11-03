# Safe Production Migration Guide

## ⚠️ CRITICAL: Backup First!

Before running ANY migrations on production:

```bash
# PostgreSQL backup
pg_dump -U your_user -d your_database > backup_$(date +%Y%m%d_%H%M%S).sql

# Or using environment variables
pg_dump -U $DB_USER -h $DB_HOST -d $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Migration Strategy for Existing Production Database

### Option 1: Mark Existing Schema as Migrated (Recommended)

If your production database already has all tables (created by `sync()`), you need to tell Sequelize that migrations are already applied:

```bash
# 1. First, check what tables exist in production
# Connect to your production DB and verify all tables are there

# 2. Mark all migrations as completed WITHOUT running them
npm run migrate -- --to 20250101000011-create-order-item.js
```

This creates the `SequelizeMeta` table and marks migrations as done without changing your schema.

### Option 2: Fresh Migration (Only for New Databases)

For completely new databases:

```bash
npm run migrate
```

## Testing Migration Safety

### Test on Development First

1. **Create a backup of your dev database**:
   ```bash
   pg_dump -U postgres -d online_store > dev_backup.sql
   ```

2. **Test the migration**:
   ```bash
   npm run migrate
   ```

3. **Verify data is intact**:
   - Check row counts: `SELECT COUNT(*) FROM users;`
   - Verify sample records
   - Test application functionality

4. **If something goes wrong**:
   ```bash
   # Restore from backup
   dropdb -U postgres online_store
   createdb -U postgres online_store
   psql -U postgres -d online_store < dev_backup.sql
   ```

### Test Rollback

```bash
# Undo last migration
npm run migrate:undo

# Verify data is still intact
# Then re-apply
npm run migrate
```

## Production Deployment Steps

1. ✅ **Schedule maintenance window** (or ensure low traffic)
2. ✅ **Backup production database**
3. ✅ **Test migrations on staging/dev environment**
4. ✅ **Verify backup can be restored**
5. ✅ **Stop application** (optional but safer)
6. ✅ **Run migrations**:
   ```bash
   NODE_ENV=production npm run migrate
   ```
7. ✅ **Verify data integrity**:
   ```bash
   npm run migrate:status
   ```
8. ✅ **Test critical application features**
9. ✅ **Start application**

## If You Already Have Data in Production

Since your production DB was created with `sync({ alter: true })`, you have two choices:

### Choice A: Initialize Migration State (Recommended)

This tells Sequelize "these migrations are already applied":

```bash
# Connect to production database
psql -U $DB_USER -h $DB_HOST -d $DB_NAME

# Create SequelizeMeta table manually
CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
  name VARCHAR(255) NOT NULL PRIMARY KEY
);

# Mark all migrations as completed
INSERT INTO "SequelizeMeta" (name) VALUES
('20250101000001-create-user.js'),
('20250101000002-create-type.js'),
('20250101000003-create-brand.js'),
('20250101000004-create-device.js'),
('20250101000005-create-basket.js'),
('20250101000006-create-basket-device.js'),
('20250101000007-create-rating.js'),
('20250101000008-create-device-info.js'),
('20250101000009-create-type-brand.js'),
('20250101000010-create-order.js'),
('20250101000011-create-order-item.js');

# Verify
SELECT * FROM "SequelizeMeta";
```

Now future migrations will work normally without touching existing tables.

### Choice B: Create Initial State Migration

Create a migration that checks if tables exist before creating them:

```javascript
// Add to each migration's up() function:
const tables = await queryInterface.showAllTables();
if (!tables.includes('users')) {
  // create table...
}
```

## Monitoring During Migration

```bash
# Watch table counts before/after
psql -U $DB_USER -d $DB_NAME -c "
SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
"
```

## Emergency Rollback

If migration fails:

```bash
# 1. Restore from backup
psql -U $DB_USER -d $DB_NAME < backup_file.sql

# 2. Or undo migrations
npm run migrate:undo:all

# 3. Restore from backup again (safest)
```

## Key Points

- ✅ Migrations **preserve data** by default
- ✅ They only modify **schema** (tables, columns, indexes)
- ✅ **Always backup before migrating**
- ❌ Never run `sync()` in production
- ❌ Never run `sync({ force: true })` - this DROPS tables!
- ❌ Never run `sync({ alter: true })` in production - unpredictable

## Current Setup

Your `index.js` has been updated to NOT run `sync()` anymore. This is correct!

```javascript
// OLD (dangerous in production):
await sequelize.sync({ alter: true })

// NEW (safe):
// Database schema managed by migrations only
```
