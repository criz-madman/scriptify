-- ==============================================================================
-- SCRIPTIFY - PostgreSQL 3NF Database Schema
-- Compatible with Supabase and Standard PostgreSQL 13+
-- ==============================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- D1: Users Table
-- Third Normal Form (3NF): Atomic columns, email unique index, no transitive deps
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Users" (
    "userId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON "Users" (LOWER("email"));

-- ------------------------------------------------------------------------------
-- D2: CreditWallet Table
-- 1:1 Relationship with Users table via unique constraint on "userId"
-- CHECK constraint guarantees balancePoints can never be negative (< 0)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "CreditWallet" (
    "walletId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL UNIQUE REFERENCES "Users"("userId") ON DELETE CASCADE,
    "balancePoints" INTEGER NOT NULL DEFAULT 100 CHECK ("balancePoints" >= 0),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_credit_wallet_user_id ON "CreditWallet" ("userId");

-- ------------------------------------------------------------------------------
-- D3: HistoryLog Table
-- Records every script generated and credit deduction event with rich JSONB details
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "HistoryLog" (
    "historyId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "Users"("userId") ON DELETE CASCADE,
    "actionDetails" JSONB NOT NULL,
    "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_history_log_user_id ON "HistoryLog" ("userId");
CREATE INDEX IF NOT EXISTS idx_history_log_timestamp ON "HistoryLog" ("timestamp" DESC);
CREATE INDEX IF NOT EXISTS idx_history_log_action_type ON "HistoryLog" (("actionDetails"->>'scriptType'));

-- ------------------------------------------------------------------------------
-- D4: Transactions Table
-- Immutable financial audit log for credit top-ups, grant credits, and payment methods
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Transactions" (
    "transactionId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "Users"("userId") ON DELETE CASCADE,
    "amountPaid" NUMERIC(10, 2) NOT NULL CHECK ("amountPaid" >= 0),
    "paymentMethod" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK ("status" IN ('pending', 'completed', 'failed', 'refunded')),
    "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON "Transactions" ("userId");
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON "Transactions" ("timestamp" DESC);

-- ------------------------------------------------------------------------------
-- Supporting Table: AuthOtpTokens
-- Manages short-lived, single-use 6-digit OTP codes for passwordless authentication
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AuthOtpTokens" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "otpHash" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "consumed" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_otp_email ON "AuthOtpTokens" (LOWER("email"));

-- ------------------------------------------------------------------------------
-- D5: MarketplaceProducts Table
-- Digital shop catalog of scripts, CEP plugins, and AE project templates
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "MarketplaceProducts" (
    "productId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "category" VARCHAR(50) NOT NULL CHECK ("category" IN ('script', 'plugin', 'project_file')),
    "creditPrice" INTEGER NOT NULL CHECK ("creditPrice" >= 0),
    "instructions" TEXT NOT NULL,
    "payloadCode" TEXT,
    "version" VARCHAR(50) DEFAULT '1.0.0',
    "author" VARCHAR(100) DEFAULT 'Scriptify Official',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_marketplace_category ON "MarketplaceProducts" ("category");
CREATE INDEX IF NOT EXISTS idx_marketplace_created_at ON "MarketplaceProducts" ("createdAt" DESC);

-- ------------------------------------------------------------------------------
-- D6: MarketplacePurchases Table
-- Records user acquisitions of digital goods with 3NF referential integrity
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "MarketplacePurchases" (
    "purchaseId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "Users"("userId") ON DELETE CASCADE,
    "productId" UUID NOT NULL REFERENCES "MarketplaceProducts"("productId") ON DELETE CASCADE,
    "creditsSpent" INTEGER NOT NULL CHECK ("creditsSpent" >= 0),
    "purchasedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_product UNIQUE ("userId", "productId")
);

CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON "MarketplacePurchases" ("userId");
CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON "MarketplacePurchases" ("productId");

