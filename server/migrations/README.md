# Database Migrations

This project now uses Sequelize CLI for database migrations.

## Setup

All migration files are in the `migrations/` directory and are numbered sequentially.

## Commands

### Run all pending migrations
```bash
npm run migrate
```

### Undo the last migration
```bash
npm run migrate:undo
```

### Undo all migrations (reset database)
```bash
npm run migrate:undo:all
```

### Check migration status
```bash
npm run migrate:status
```

## Migration Order

1. **20250101000001-create-user.js** - Creates users table
2. **20250101000002-create-type.js** - Creates types table
3. **20250101000003-create-brand.js** - Creates brands table
4. **20250101000004-create-device.js** - Creates devices table (depends on types, brands)
5. **20250101000005-create-basket.js** - Creates baskets table (depends on users)
6. **20250101000006-create-basket-device.js** - Creates basket_devices junction table
7. **20250101000007-create-rating.js** - Creates ratings table
8. **20250101000008-create-device-info.js** - Creates device_infos table
9. **20250101000009-create-type-brand.js** - Creates type_brands junction table
10. **20250101000010-create-order.js** - Creates orders table
11. **20250101000011-create-order-item.js** - Creates order_items table

## First Time Setup

1. Make sure your `.env` file has the correct database credentials
2. Run migrations:
   ```bash
   npm run migrate
   ```

## Creating New Migrations

To create a new migration:
```bash
npx sequelize-cli migration:generate --name your-migration-name
```

## Important Notes

- **DO NOT** use `sequelize.sync()` in production anymore
- Always use migrations to modify the database schema
- Migrations run in order based on their timestamp prefix
- Each migration has an `up` (apply changes) and `down` (revert changes) function
- The `models/models.js` file still defines the models, but the actual tables are created by migrations

## Development vs Production

- **Development**: Run `npm run migrate` after pulling new migrations
- **Production**: Migrations should be part of your deployment process
