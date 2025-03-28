-- PostgreSQL schema for Retell AI Chat/Voice Widget

-- Organizations table (existing)
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table (existing)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agents table (existing)
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    retell_agent_id VARCHAR(100),
    voice_id VARCHAR(100),
    llm_model VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Calls table (existing)
CREATE TABLE IF NOT EXISTS calls (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
    retell_call_id VARCHAR(100),
    phone_number VARCHAR(20),
    status VARCHAR(20),
    duration INTEGER,
    recording_url VARCHAR(255),
    transcript TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat Sessions table (new)
CREATE TABLE IF NOT EXISTS chat_sessions (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    visitor_id VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

-- Chat Messages table (new)
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    chat_session_id INTEGER NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- 'user', 'agent', 'system'
    message_type VARCHAR(20) NOT NULL, -- 'text', 'voice', 'system'
    content TEXT NOT NULL,
    voice_url VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Widget Configurations table (new)
CREATE TABLE IF NOT EXISTS widget_configurations (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    theme_color VARCHAR(20) DEFAULT '#0088FF',
    header_text VARCHAR(100) DEFAULT 'Chat with us',
    welcome_message TEXT,
    allowed_domains TEXT[], -- Domains where widget can be embedded
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data for testing
INSERT INTO organizations (id, name) VALUES (1, 'Demo Organization') ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, organization_id, email, password, first_name, last_name, role) 
VALUES (1, 1, 'admin@example.com', '$2a$10$eCQDz8.5iBfcH8uZZwKsROlR3Ktu7Iuz9PK4UfVEJQQhvN3fAr8Wy', 'Admin', 'User', 'admin') 
ON CONFLICT (id) DO NOTHING;

INSERT INTO agents (id, organization_id, name, description, retell_agent_id, voice_id, llm_model) 
VALUES (1, 1, 'Customer Support Agent', 'A helpful customer support agent', 'retell-agent-123', 'eleven-labs-voice-1', 'gpt-4') 
ON CONFLICT (id) DO NOTHING;

INSERT INTO widget_configurations (id, organization_id, name, agent_id, theme_color, header_text, welcome_message, allowed_domains, is_active) 
VALUES (1, 1, 'Website Chat Widget', 1, '#0088FF', 'Chat with our AI Assistant', 'Hello! How can I help you today?', ARRAY['localhost', '127.0.0.1'], TRUE) 
ON CONFLICT (id) DO NOTHING;
