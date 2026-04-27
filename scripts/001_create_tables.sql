-- Quiz Sessions Table
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY,
  start_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_at TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  result_phase VARCHAR(50),
  
  -- UTM tracking
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  utm_content VARCHAR(255),
  
  -- Device info
  device VARCHAR(50),
  user_agent TEXT,
  ip_address VARCHAR(45),
  
  -- Progress tracking
  last_question_seen INTEGER DEFAULT 0,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Lead info
  email VARCHAR(255),
  whatsapp VARCHAR(20),
  first_name VARCHAR(100),
  age_range VARCHAR(20),
  
  -- Checkout tracking
  checkout_clicked BOOLEAN DEFAULT FALSE
);

-- Quiz Answers Table
CREATE TABLE IF NOT EXISTS quiz_answers (
  id SERIAL PRIMARY KEY,
  session_id UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id VARCHAR(100),
  question_order INTEGER,
  answer JSONB,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Events Table
CREATE TABLE IF NOT EXISTS quiz_events (
  id SERIAL PRIMARY KEY,
  session_id UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  event_type VARCHAR(100),
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_start_at ON quiz_sessions(start_at);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_completed ON quiz_sessions(completed);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_utm_source ON quiz_sessions(utm_source);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_session_id ON quiz_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_events_session_id ON quiz_events(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_events_event_type ON quiz_events(event_type);
