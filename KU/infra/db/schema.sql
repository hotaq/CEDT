CREATE TABLE IF NOT EXISTS medical_staff_accounts (
    id UUID PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    language_preferences TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY,
    external_ref VARCHAR(100),
    source_language VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS triage_sessions (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id),
    translated_language VARCHAR(20) NOT NULL DEFAULT 'en',
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS triage_messages (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES triage_sessions(id),
    sender VARCHAR(20) NOT NULL,
    source_language VARCHAR(20) NOT NULL,
    source_text TEXT NOT NULL,
    translated_text TEXT,
    translation_confidence NUMERIC(4,3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS triage_results (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES triage_sessions(id),
    model_level VARCHAR(20),
    final_level VARCHAR(20) NOT NULL,
    rule_override BOOLEAN NOT NULL DEFAULT FALSE,
    rationale JSONB NOT NULL,
    reviewed_by UUID REFERENCES medical_staff_accounts(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS triage_logs (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES triage_sessions(id),
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
