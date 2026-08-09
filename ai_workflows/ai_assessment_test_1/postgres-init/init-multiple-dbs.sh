#!/bin/bash
# PostgreSQL init script for multiple databases
# This script creates both n8n and users databases on first container startup

set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    -- Create database for n8n workflows if it doesn't exist
    SELECT 'Creating n8n database' AS status WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${POSTGRES_DB}');
    CREATE DATABASE ${POSTGRES_DB};
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -d "${POSTGRES_DB}" <<-EOSQL
    -- Create extensions if needed
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    -- Create database for user verification if it doesn't exist
    SELECT 'Creating users database' AS status WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${USER_DB_DB}');
    CREATE DATABASE ${USER_DB_DB};
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -d "${USER_DB_DB}" <<-EOSQL
    -- Create extensions if needed
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Users table for admin and regular user verification
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'admin' or 'user'
        name VARCHAR(255),
        telegram_chat_id VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_active BOOLEAN DEFAULT true
    );

    -- Questions table for user submissions that need human intervention
    CREATE TABLE IF NOT EXISTS pending_questions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        question_text TEXT NOT NULL,
        question_source VARCHAR(50) NOT NULL, -- 'telegram', 'email', 'web'
        source_message_id VARCHAR(255), -- Original message ID from the source
        status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'answered', 'closed'
        ai_response TEXT,
        final_response TEXT, -- Human answer if AI couldn't answer
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        answered_at TIMESTAMP WITH TIME ZONE,
        metadata JSONB -- Additional data (email subject, telegram user info, etc.)
    );

    -- Cached responses table for embedding similarity caching
    CREATE TABLE IF NOT EXISTS cached_responses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        question_hash VARCHAR(64) NOT NULL, -- SHA256 hash of the question
        question_embedding VECTOR(1536), -- OpenAI embedding dimension (ada-002)
        question_text TEXT NOT NULL,
        response_text TEXT NOT NULL,
        language VARCHAR(10) DEFAULT 'es', -- 'es' or 'en'
        usage_count INTEGER DEFAULT 0,
        last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_active BOOLEAN DEFAULT true
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_cached_responses_hash ON cached_responses(question_hash);
    CREATE INDEX IF NOT EXISTS idx_cached_responses_active ON cached_responses(is_active);
    CREATE INDEX IF NOT EXISTS idx_pending_questions_status ON pending_questions(status);
    CREATE INDEX IF NOT EXISTS idx_pending_questions_source ON pending_questions(question_source);

    -- Create function to update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS \$\$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    \$\$ language 'plpgsql';

    -- Create triggers for updated_at
    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EOSQL

echo "PostgreSQL initialization completed successfully"