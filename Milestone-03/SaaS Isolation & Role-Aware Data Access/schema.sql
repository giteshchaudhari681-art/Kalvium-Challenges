-- CorpFlow v2.0 Database Schema
-- Multi-tenant isolation with role-aware access support.

DROP TABLE IF EXISTS billing_details;
DROP TABLE IF EXISTS project_assignments;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS tenants;

CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    salary DECIMAL(10,2),
    manager_id INTEGER,
    CONSTRAINT users_tenant_id_id_unique UNIQUE (tenant_id, id),
    CONSTRAINT users_tenant_email_unique UNIQUE (tenant_id, email),
    CONSTRAINT users_manager_same_tenant_fk
        FOREIGN KEY (tenant_id, manager_id) REFERENCES users(tenant_id, id)
        ON DELETE SET NULL,
    CONSTRAINT users_no_self_manager CHECK (manager_id IS NULL OR manager_id <> id)
);

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    budget DECIMAL(12,2),
    owner_user_id INTEGER NOT NULL,
    CONSTRAINT projects_tenant_id_id_unique UNIQUE (tenant_id, id),
    CONSTRAINT projects_owner_same_tenant_fk
        FOREIGN KEY (tenant_id, owner_user_id) REFERENCES users(tenant_id, id)
        ON DELETE RESTRICT
);

CREATE TABLE project_assignments (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT project_assignments_tenant_id_id_unique UNIQUE (tenant_id, id),
    CONSTRAINT project_assignments_project_same_tenant_fk
        FOREIGN KEY (tenant_id, project_id) REFERENCES projects(tenant_id, id)
        ON DELETE CASCADE,
    CONSTRAINT project_assignments_user_same_tenant_fk
        FOREIGN KEY (tenant_id, user_id) REFERENCES users(tenant_id, id)
        ON DELETE CASCADE,
    CONSTRAINT project_assignments_unique UNIQUE (tenant_id, project_id, user_id)
);

CREATE TABLE billing_details (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    card_holder_name VARCHAR(100),
    card_last4 VARCHAR(4),
    expiry_date VARCHAR(5),
    billing_address TEXT,
    CONSTRAINT billing_details_tenant_id_id_unique UNIQUE (tenant_id, id),
    CONSTRAINT billing_details_user_same_tenant_fk
        FOREIGN KEY (tenant_id, user_id) REFERENCES users(tenant_id, id)
        ON DELETE CASCADE,
    CONSTRAINT billing_details_user_unique UNIQUE (tenant_id, user_id)
);

CREATE INDEX idx_users_tenant_id_id ON users (tenant_id, id);
CREATE INDEX idx_users_tenant_id_role ON users (tenant_id, role);
CREATE INDEX idx_users_tenant_id_manager_id ON users (tenant_id, manager_id);
CREATE INDEX idx_projects_tenant_id_id ON projects (tenant_id, id);
CREATE INDEX idx_projects_tenant_id_owner_user_id ON projects (tenant_id, owner_user_id);
CREATE INDEX idx_project_assignments_tenant_id_project_id ON project_assignments (tenant_id, project_id);
CREATE INDEX idx_project_assignments_tenant_id_user_id ON project_assignments (tenant_id, user_id);
CREATE INDEX idx_billing_details_tenant_id_user_id ON billing_details (tenant_id, user_id);

-- Seed Initial Data
INSERT INTO tenants (name, slug) VALUES
('Pouch.io', 'pouch-io'),
('Velocity', 'velocity');

INSERT INTO users (tenant_id, full_name, email, password_hash, role, salary, manager_id) VALUES
(1, 'Alice Johnson', 'alice@pouch.io', 'pbkdf2:sha256:600000$hasher$81726a', 'admin', 125000.00, NULL),
(1, 'Bob Smith', 'bob@pouch.io', 'pbkdf2:sha256:600000$hasher$81726b', 'manager', 95000.00, NULL),
(2, 'Charlie Davis', 'charlie@velocity.com', 'pbkdf2:sha256:600000$hasher$81726c', 'admin', 140000.00, NULL),
(2, 'David Miller', 'david@velocity.com', 'pbkdf2:sha256:600000$hasher$81726d', 'user', 75000.00, 3);

INSERT INTO projects (tenant_id, name, description, status, budget, owner_user_id) VALUES
(1, 'Pouch Portal', 'Customer portal for Pouch.io', 'active', 50000.00, 2),
(2, 'Velocity Engine', 'Back-end engine for Velocity', 'active', 120000.00, 3),
(2, 'Secret R&D', null, 'inactive', 250000.00, 3);

INSERT INTO project_assignments (tenant_id, project_id, user_id) VALUES
(1, 1, 1),
(1, 1, 2),
(2, 2, 3),
(2, 2, 4),
(2, 3, 3);

INSERT INTO billing_details (tenant_id, user_id, card_holder_name, card_last4, expiry_date, billing_address) VALUES
(1, 1, 'Alice Johnson', '4242', '12/28', '123 Tech Lane, SF'),
(2, 3, 'Charlie Davis', '9182', '08/26', '789 Velocity Rd, NY');
