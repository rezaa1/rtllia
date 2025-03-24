-- PostgreSQL Database Schema for Retell AI Integration with Multi-tenancy, White Labeling, and Billing

-- Organizations Table (for multi-tenancy)
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    custom_domain VARCHAR(255) UNIQUE,
    logo_url VARCHAR(255),
    primary_color VARCHAR(20),
    secondary_color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscription Plans
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2) NOT NULL,
    features JSONB NOT NULL,
    max_agents INTEGER NOT NULL,
    max_calls_per_month INTEGER NOT NULL,
    max_users INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organization Subscriptions
CREATE TABLE organization_subscriptions (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(20) NOT NULL, -- active, canceled, past_due
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    payment_method_id VARCHAR(100),
    subscription_provider_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role VARCHAR(20) NOT NULL DEFAULT 'user', -- admin, user
    is_organization_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, username),
    UNIQUE(organization_id, email)
);

-- API Keys
CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_name VARCHAR(50) NOT NULL,
    api_key VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Agents Table
CREATE TABLE agents (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    retell_agent_id VARCHAR(100) NOT NULL UNIQUE,
    voice_id VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- LLM Configurations
CREATE TABLE llm_configurations (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    retell_llm_id VARCHAR(100) NOT NULL UNIQUE,
    model VARCHAR(50) NOT NULL,
    s2s_model VARCHAR(50),
    temperature FLOAT DEFAULT 0,
    high_priority BOOLEAN DEFAULT FALSE,
    general_prompt TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_agent FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Phone Numbers
CREATE TABLE phone_numbers (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Calls
CREATE TABLE calls (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    retell_call_id VARCHAR(100) NOT NULL UNIQUE,
    from_number VARCHAR(20) NOT NULL,
    to_number VARCHAR(20) NOT NULL,
    direction VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    duration INTEGER,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    call_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_agent FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Agent Tools
CREATE TABLE agent_tools (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tool_type VARCHAR(50) NOT NULL,
    tool_config JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_agent FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Billing Transactions
CREATE TABLE billing_transactions (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES organization_subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    invoice_url VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usage Statistics
CREATE TABLE usage_statistics (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    agents_count INTEGER DEFAULT 0,
    calls_count INTEGER DEFAULT 0,
    call_minutes INTEGER DEFAULT 0,
    users_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, year, month)
);

-- White Label Settings
CREATE TABLE white_label_settings (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    company_name VARCHAR(100),
    support_email VARCHAR(100),
    support_phone VARCHAR(20),
    privacy_policy_url VARCHAR(255),
    terms_of_service_url VARCHAR(255),
    favicon_url VARCHAR(255),
    custom_css TEXT,
    custom_js TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id)
);

-- Indexes for performance
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_agents_organization ON agents(organization_id);
CREATE INDEX idx_agents_user ON agents(user_id);
CREATE INDEX idx_calls_organization ON calls(organization_id);
CREATE INDEX idx_calls_agent ON calls(agent_id);
CREATE INDEX idx_calls_created_at ON calls(created_at);
CREATE INDEX idx_organization_subscriptions_organization ON organization_subscriptions(organization_id);
