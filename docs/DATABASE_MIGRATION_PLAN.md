# 🔄 JORNIZ — Database Migration Strategy

## 1. Migration Guidelines
1. **Idempotency**: All DDL statements use `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE ... ADD COLUMN` inside safety try-except blocks.
2. **Zero Production Data Loss**: Table columns provide default values (`DEFAULT 'Patient'`).
3. **Double-Entry Financial Integrity**: Financial balances derive from `wallet_ledger` entries; legacy column overwrites are disabled.

## 2. Automated Migration Execution
- Run `python backend/database_schema.py` to auto-apply all 37 table DDL statements and column migrations.
