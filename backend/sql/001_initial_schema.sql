CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN CREATE TYPE "Role" AS ENUM ('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "CustomerType" AS ENUM ('RETAIL', 'WHOLESALE', 'DISTRIBUTOR'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "CustomerStatus" AS ENUM ('LEAD', 'ACTIVE', 'INACTIVE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "StockMovementType" AS ENUM ('IN', 'OUT'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ChallanStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "User" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL UNIQUE, password text NOT NULL, name text NOT NULL,
  role "Role" NOT NULL DEFAULT 'SALES', "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Category" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL UNIQUE, description text,
  "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Product" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, sku text NOT NULL UNIQUE, description text,
  "unitPrice" double precision NOT NULL, "currentStock" integer NOT NULL DEFAULT 0, "minimumStock" integer NOT NULL DEFAULT 5,
  "warehouseLocation" text, "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "categoryId" uuid NOT NULL REFERENCES "Category"(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "Customer" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), "customerName" text NOT NULL, mobile text, email text, "businessName" text,
  "gstNumber" text, "customerType" "CustomerType" NOT NULL DEFAULT 'RETAIL', address text,
  status "CustomerStatus" NOT NULL DEFAULT 'LEAD', "followUpDate" timestamptz, notes text,
  "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "assignedToId" uuid REFERENCES "User"(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "CustomerFollowUp" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), note text NOT NULL, "followUpDate" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now(), "customerId" uuid NOT NULL REFERENCES "Customer"(id) ON DELETE CASCADE,
  "createdById" uuid NOT NULL REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "StockMovement" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), "productId" uuid NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
  type "StockMovementType" NOT NULL, quantity integer NOT NULL, reason text,
  "createdById" uuid NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "SalesChallan" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), "challanNumber" text NOT NULL UNIQUE, "totalQuantity" integer NOT NULL DEFAULT 0,
  status "ChallanStatus" NOT NULL DEFAULT 'DRAFT', "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "customerId" uuid NOT NULL REFERENCES "Customer"(id) ON DELETE RESTRICT,
  "createdById" uuid NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "SalesChallanItem" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), "challanId" uuid NOT NULL REFERENCES "SalesChallan"(id) ON DELETE CASCADE,
  "productId" uuid NOT NULL REFERENCES "Product"(id) ON DELETE RESTRICT, "productName" text NOT NULL, sku text NOT NULL,
  "unitPrice" double precision NOT NULL, quantity integer NOT NULL, "totalPrice" double precision NOT NULL,
  UNIQUE ("challanId", "productId")
);

CREATE INDEX IF NOT EXISTS "Customer_mobile_idx" ON "Customer"(mobile);
CREATE INDEX IF NOT EXISTS "Customer_status_idx" ON "Customer"(status);
CREATE INDEX IF NOT EXISTS "Customer_customerType_idx" ON "Customer"("customerType");
CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "StockMovement_productId_createdAt_idx" ON "StockMovement"("productId", "createdAt");
CREATE INDEX IF NOT EXISTS "SalesChallan_customerId_status_createdAt_idx" ON "SalesChallan"("customerId", status, "createdAt");
