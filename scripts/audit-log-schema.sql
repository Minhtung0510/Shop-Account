-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, etc.
    entity_type VARCHAR(100) NOT NULL, -- users, products, orders, settings, etc.
    entity_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB, -- additional context
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]', -- array of permission strings
    is_system BOOLEAN DEFAULT FALSE, -- system roles cannot be deleted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- USER ROLES TABLE (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- ============================================
-- INSERT DEFAULT ROLES
-- ============================================
INSERT INTO roles (name, description, permissions, is_system) VALUES
    ('super_admin', 'Super Administrator - Full access', 
     '["users:read", "users:create", "users:update", "users:delete", "products:read", "products:create", "products:update", "products:delete", "orders:read", "orders:update", "orders:delete", "settings:read", "settings:update", "audit_logs:read", "reports:read", "reports:export"]',
     TRUE),
    ('admin', 'Administrator - Manage users and content',
     '["users:read", "users:update", "products:read", "products:create", "products:update", "products:delete", "orders:read", "orders:update", "audit_logs:read"]',
     TRUE),
    ('moderator', 'Moderator - Limited management access',
     '["products:read", "products:update", "orders:read", "orders:update"]',
     TRUE),
    ('user', 'Regular User - Basic access',
     '["products:read", "orders:read", "orders:create"]',
     TRUE)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- ADD ROLE COLUMN TO USERS (if not exists)
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';
    END IF;
END $$;

-- Add role foreign key constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_role_fkey'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_role_fkey 
        FOREIGN KEY (role) REFERENCES roles(name) ON DELETE SET NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Constraint might already exist differently named
    NULL;
END $$;
