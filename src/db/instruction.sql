-- ========================================
-- 1. voice_sessions 테이블
-- ========================================
CREATE TABLE voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (end_time - start_time))::INTEGER
  ) STORED,
  
  gender TEXT CHECK (gender IN ('male', 'female')),
  age_group TEXT CHECK (age_group IN ('10s', '20s', '30s', '40s', '50s', '60s+')),
  
  analysis_confidence JSONB,
  voice_analysis_status TEXT DEFAULT 'pending' 
    CHECK (voice_analysis_status IN ('pending', 'processing', 'completed', 'failed')),
  
  processing_info JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_voice_sessions_created_at ON voice_sessions(created_at DESC);
CREATE INDEX idx_voice_sessions_status ON voice_sessions(voice_analysis_status);
CREATE INDEX idx_voice_sessions_gender_age ON voice_sessions(gender, age_group) 
  WHERE voice_analysis_status = 'completed';

-- ========================================
-- 2. voice_interactions 테이블
-- ========================================
CREATE TABLE voice_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES voice_sessions(id) ON DELETE CASCADE,
  
  user_message TEXT NOT NULL,
  assistant_response TEXT,
  recommended_wine_ids INTEGER[],
  
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_voice_interactions_session ON voice_interactions(session_id);
CREATE INDEX idx_voice_interactions_timestamp ON voice_interactions(timestamp);
CREATE INDEX idx_voice_interactions_wine_ids ON voice_interactions USING GIN(recommended_wine_ids);

-- ========================================
-- 3. voice_cart_actions 테이블
-- ========================================
CREATE TABLE voice_cart_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES voice_sessions(id) ON DELETE CASCADE,
  wine_id INTEGER NOT NULL,
  action TEXT DEFAULT 'add' CHECK (action IN ('add', 'remove')),
  
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_voice_cart_actions_session ON voice_cart_actions(session_id);
CREATE INDEX idx_voice_cart_actions_wine ON voice_cart_actions(wine_id);
CREATE INDEX idx_voice_cart_actions_timestamp ON voice_cart_actions(timestamp);

-- ========================================
-- 4. 트리거
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_voice_sessions_updated_at
  BEFORE UPDATE ON voice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 5. RLS 정책
-- ========================================
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role has full access to voice_sessions"
ON voice_sessions FOR ALL
USING (auth.role() = 'service_role');

ALTER TABLE voice_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role has full access to voice_interactions"
ON voice_interactions FOR ALL
USING (auth.role() = 'service_role');

ALTER TABLE voice_cart_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role has full access to voice_cart_actions"
ON voice_cart_actions FOR ALL
USING (auth.role() = 'service_role');

-- ========================================
-- 6. 분석용 뷰
-- ========================================
CREATE VIEW voice_sessions_summary AS
SELECT 
  vs.id,
  vs.start_time,
  vs.end_time,
  vs.duration_seconds,
  vs.gender,
  vs.age_group,
  vs.voice_analysis_status,
  COUNT(DISTINCT vi.id) as interaction_count,
  COUNT(DISTINCT vca.id) as cart_action_count,
  array_agg(DISTINCT vca.wine_id) FILTER (WHERE vca.wine_id IS NOT NULL) as wines_added_to_cart
FROM voice_sessions vs
LEFT JOIN voice_interactions vi ON vs.id = vi.session_id
LEFT JOIN voice_cart_actions vca ON vs.id = vca.session_id
GROUP BY vs.id;

CREATE VIEW wine_preferences_by_demographics AS
SELECT 
  vs.gender,
  vs.age_group,
  vca.wine_id,
  COUNT(*) as times_added_to_cart
FROM voice_cart_actions vca
JOIN voice_sessions vs ON vca.session_id = vs.id
WHERE vs.voice_analysis_status = 'completed'
GROUP BY vs.gender, vs.age_group, vca.wine_id
ORDER BY vs.gender, vs.age_group, times_added_to_cart DESC;