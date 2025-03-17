# Database Schema for Retell AI Integration

## Overview
This document outlines the database schema for storing user data and Retell AI voice agent information. The schema is designed to support the creation and management of AI voice agents through Retell AI's API while maintaining user data in our own database.

## Tables

### 1. Users
Stores information about registered users of the application.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

### 2. Agents
Stores information about AI voice agents created by users.

```sql
CREATE TABLE agents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    retell_agent_id VARCHAR(100) NOT NULL UNIQUE,
    voice_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 3. LLM_Configurations
Stores LLM configurations for agents.

```sql
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
```

### 4. Phone_Numbers
Stores phone numbers associated with agents.

```sql
CREATE TABLE phone_numbers (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_agent FOREIGN KEY (agent_id) REFERENCES agents(id)
);
```

### 5. Calls
Stores information about calls made through the agents.

```sql
CREATE TABLE calls (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    retell_call_id VARCHAR(100) NOT NULL UNIQUE,
    from_number VARCHAR(20) NOT NULL,
    to_number VARCHAR(20) NOT NULL,
    direction VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    duration INTEGER,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_agent FOREIGN KEY (agent_id) REFERENCES agents(id)
);
```

### 6. Agent_Tools
Stores tools/capabilities associated with agents.

```sql
CREATE TABLE agent_tools (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tool_type VARCHAR(50) NOT NULL,
    tool_config JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_agent FOREIGN KEY (agent_id) REFERENCES agents(id)
);
```

### 7. API_Keys
Stores API keys for users to interact with our API.

```sql
CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_name VARCHAR(50) NOT NULL,
    api_key VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Relationships

1. A User can have multiple Agents (one-to-many)
2. An Agent has one LLM Configuration (one-to-one)
3. An Agent can have multiple Phone Numbers (one-to-many)
4. An Agent can have multiple Calls (one-to-many)
5. An Agent can have multiple Tools (one-to-many)
6. A User can have multiple API Keys (one-to-many)

## Notes

- The `retell_agent_id`, `retell_llm_id`, and `retell_call_id` fields store the corresponding IDs returned by Retell AI's API.
- The `tool_config` field in the `agent_tools` table uses JSONB to store flexible configuration data for different types of tools.
- Timestamps are used to track creation and update times for all records.
- Foreign key constraints ensure referential integrity between related tables.
