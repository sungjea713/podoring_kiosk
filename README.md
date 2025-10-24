# Podoring Wine Kiosk 🍷

A modern, AI-powered wine recommendation kiosk built with Bun, React, and ElevenLabs voice AI.

## Features

### 🎤 Voice Assistant
- **ElevenLabs AI Agent Integration**: Natural voice conversations for wine recommendations
- **Real-time SSE Updates**: Wine cards appear instantly as the AI agent searches
- **Multilingual Support**: Example phrases in 14+ languages
- **Animated Background**: Physics-based floating text with ambient color transitions
- **Voice Recording** (🚧 Temporarily Disabled): MediaRecorder API for capturing user audio sessions

### 🍷 Wine Catalog
- **Smart Search & Filtering**: Search by name, filter by type, country, variety, price range
- **Hybrid Semantic Search**: Advanced AI-powered search combining query parsing, SQL filtering, and semantic reranking
  - **50% faster** than pure vector search (0.4s vs 0.9s average)
  - **100% accuracy** on numerical queries (price, ratings, attributes)
  - Automatic fallback to semantic search for descriptive queries
- **Detailed Wine Information**: Ratings, descriptions, tasting notes, food pairings
- **Inventory Management**: Real-time stock tracking

### 🛒 Shopping Experience
- **Smooth Animations**: Flying cart animations when adding items
- **Interactive Wine Cards**: Click to view detailed information
- **Shopping Cart**: Persistent cart state with Zustand
- **Responsive Design**: Optimized for kiosk displays

## Tech Stack

### Backend
- **Runtime**: [Bun](https://bun.com) - Fast all-in-one JavaScript runtime
- **Server**: Bun.serve with built-in routing
- **Database**: Supabase (PostgreSQL + pgvector)
- **AI/ML**:
  - OpenAI text-embedding-3-small for embeddings
  - Cohere for semantic reranking
  - ElevenLabs Conversational AI
  - Gemini 2.5 Flash for LLM-based recommendations (optional)

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) v1.2.22 or higher
- Supabase account
- OpenAI API key
- Cohere API key
- ElevenLabs API key and Agent ID

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sungjea713/podoring_kiosk.git
cd podoring_kiosk
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys:
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (for embeddings)
OPENAI_API_KEY=your_openai_api_key

# Cohere (for reranking)
COHERE_API_KEY=your_cohere_api_key

# ElevenLabs (for voice AI)
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_AGENT_ID=your_agent_id

# Server
PORT=4000
```

4. Run development server:
```bash
bun run dev
```

The kiosk will be available at `http://localhost:4000`

## Project Structure

```
podoring_kiosk/
├── src/
│   ├── api/              # API utilities
│   │   ├── embeddings.ts # OpenAI embedding generation
│   │   ├── rerank.ts     # Cohere reranking
│   │   ├── wines.ts      # Wine data access
│   │   ├── inventory.ts  # Inventory management
│   │   ├── queryParser.ts   # Natural language query parsing (NEW)
│   │   └── filterWines.ts   # SQL filtering for hybrid search (NEW)
│   ├── db/
│   │   └── supabase.ts   # Supabase client
│   ├── frontend/
│   │   ├── components/   # React components
│   │   │   ├── VoiceModal.tsx       # Voice assistant UI
│   │   │   ├── WineCard.tsx         # Wine card with animations
│   │   │   ├── WineDetailModal.tsx  # Wine details popup
│   │   │   └── ...
│   │   ├── hooks/        # Custom React hooks
│   │   │   └── useKioskState.ts    # Global state management
│   │   └── index.html    # Entry point
│   ├── types/
│   │   └── index.ts      # TypeScript type definitions
│   └── index.ts          # Server entry point
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── SEARCH_API_COMPARISON.md  # Performance analysis (NEW)
```

## Key Features Explained

### Voice Assistant (SSE + ElevenLabs)

The voice assistant uses Server-Sent Events (SSE) to stream wine recommendations in real-time:

1. User opens voice modal → SSE connection established
2. User speaks wine preference → ElevenLabs Agent processes request
3. Agent calls `/api/search/semantic` webhook with query
4. Backend performs semantic search and broadcasts wine IDs via SSE
5. Frontend receives IDs and fetches wine details
6. Wine cards appear on screen with smooth animations

**Key files:**
- Backend SSE: [src/index.ts](src/index.ts) - `/api/wine-recommendations/stream`
- Frontend SSE: [src/frontend/components/VoiceModal.tsx](src/frontend/components/VoiceModal.tsx)
- Semantic Search: [src/index.ts](src/index.ts) - `/api/search/semantic`

### Hybrid Semantic Wine Search

Advanced multi-stage search combining query parsing, SQL filtering, and AI semantic search:

#### Architecture

```typescript
User Query → Query Parser (NLP)
           ↓
      Has Conditions?
      ↙           ↘
    YES            NO
     ↓              ↓
 SQL Filter    Vector Search
 (price, type,   (embeddings)
  attributes)        ↓
     ↓              ↓
 Candidates ← ← ← ← ←
     ↓
 Cohere Rerank
     ↓
  Results
```

#### Example Queries

**Numerical queries** (parsed and filtered):
- "5만원 이하 레드 와인" → SQL: `price ≤ 50000 AND type = 'Red wine'`
- "가장 비싼 와인 3개" → SQL: `ORDER BY price DESC LIMIT 3`
- "탄닌 낮은 프랑스 와인" → SQL: `tannin ≤ 2 AND country = 'France'`

**Descriptive queries** (semantic search):
- "Red wine for steak dinner" → Embeddings + Vector search
- "스테이크와 어울리는 와인" → Embeddings + Vector search

#### Performance

See [SEARCH_API_COMPARISON.md](SEARCH_API_COMPARISON.md) for detailed performance analysis:
- **50% faster** than pure vector search (0.443s vs 0.896s)
- **100% accuracy** on numerical conditions
- **69% cost reduction** (fewer API calls for reranking)

#### Implementation Files

- [src/api/queryParser.ts](src/api/queryParser.ts) - NLP query parsing (price, type, attributes, countries, sorting)
- [src/api/filterWines.ts](src/api/filterWines.ts) - SQL filtering based on parsed conditions
- [src/index.ts](src/index.ts) - `/api/search/semantic-hybrid` endpoint

### Cart Animations

Smooth flying animations when adding wines to cart:

1. Card position/size captured
2. Clone created with same appearance
3. CSS animation flies card to bottom-right cart icon
4. Card shrinks and fades out
5. Cleanup after 0.7s

## Deployment

### Railway (Configured)

The project is configured for Railway deployment:

```bash
# Deploy to Railway
railway up
```

Required environment variables (set in Railway dashboard):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `COHERE_API_KEY`
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_AGENT_ID`
- `PORT` (default: 3000)

**Build config**: See [nixpacks.toml](nixpacks.toml)

### Render.com (Currently Deployed)

Live demo: https://podoring-kiosk.onrender.com

Auto-deploys from `main` branch on GitHub.

## API Endpoints

### Public Endpoints

- `GET /` - Kiosk frontend
- `GET /api/health` - Health check
- `GET /api/wines` - List all wines (with filters)
- `GET /api/wines/:id` - Get wine details
- `GET /api/wines/max-price` - Get maximum wine price
- `GET /api/inventory/:wine_id` - Get wine inventory

### Search Endpoints

- `POST /api/search/semantic` - Pure semantic search (vector embeddings)
- `POST /api/search/semantic-hybrid` - **Hybrid search** (query parsing + SQL + semantic)
- `POST /api/search/llm` - LLM-based search using Gemini (experimental, 30x slower)

### Voice Assistant Endpoints

- `GET /api/elevenlabs/config` - Get ElevenLabs Agent ID
- `GET /api/wine-recommendations/stream` - SSE stream for real-time updates

## Development

### Running Tests
```bash
bun test
```

### Building for Production
```bash
bun build src/index.html src/index.ts
```

### Linting
```bash
bun run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Voice Recording & Analytics (Temporarily Disabled)

### Overview

The voice assistant includes MediaRecorder API integration for capturing user audio during voice sessions. This feature is currently disabled but can be easily reactivated for future analytics.

### Implementation Details

**Location**: [src/frontend/components/VoiceModal.tsx](src/frontend/components/VoiceModal.tsx)

**Features**:
- Parallel recording alongside ElevenLabs RTC (independent microphone streams)
- Automatic start when voice modal opens
- Automatic stop and file generation when modal closes
- WebM format with Opus codec
- Recording duration timer
- Visual recording indicator (red dot with timer)

**Current Status**: 🚧 **Disabled**
- Recording functions are commented out (lines 324, 329)
- UI indicator is commented out (lines 445-452)
- Code preserved for future reactivation

### Planned Integration (Future)

**Voice Analytics Server**: https://podoring-voice-analyzer.onrender.com

**Database Tables** (Already created in Supabase):
- `voice_sessions`: Session metadata + voice analysis results (gender, age group)
- `voice_interactions`: User utterances and recommended wines
- `voice_cart_actions`: Cart additions during voice sessions

**Data Flow** (When reactivated):
1. User opens voice modal → Recording starts
2. User utterances tracked with timestamps
3. Cart actions recorded with wine IDs
4. Modal closes → Send to Python server:
   - Session data (JSON)
   - Audio file (WebM)
5. Python server:
   - Saves session/interaction/cart data to Supabase
   - Analyzes audio (removes silence, detects gender/age)
   - Updates session with analysis results
6. Audio file discarded (not stored, only analysis results saved)

### Reactivation Steps

To enable voice recording:

1. **Uncomment recording calls** in VoiceModal.tsx:
   ```typescript
   // Line 324: Uncomment
   startRecording()

   // Line 329: Uncomment
   stopRecording()
   ```

2. **Uncomment UI indicator** (lines 445-452):
   ```typescript
   {isRecording && (
     <div className="absolute top-8 left-8...">
       Recording timer display
     </div>
   )}
   ```

3. **Modify stopRecording()** to send data to Python server instead of auto-download:
   ```typescript
   // Replace auto-download with API call
   const formData = new FormData()
   formData.append('session_data', JSON.stringify({...}))
   formData.append('audio', audioBlob)

   await fetch('https://podoring-voice-analyzer.onrender.com/api/analyze-session', {
     method: 'POST',
     body: formData
   })
   ```

4. **Collect session data** during voice interaction:
   - Track user utterances from ElevenLabs onMessage
   - Track cart actions in handleAddToCart
   - Track recommended wine IDs from SSE

### Privacy Considerations

- Audio files are **NOT stored** - only analyzed and discarded
- Only gender, age group, and session metadata saved
- Complies with minimal data retention principles
- Session data can be anonymized

### Testing Without Audio

The Python server supports mock mode for testing without actual audio files:
```bash
curl -X POST "https://podoring-voice-analyzer.onrender.com/api/analyze-session" \
  -F "session_data={...}" \
  # No audio file = mock analysis results
```

---

## Acknowledgments

- Built with [Bun](https://bun.sh)
- Voice AI powered by [ElevenLabs](https://elevenlabs.io)
- Vector search by [Supabase](https://supabase.com)
- AI models by [OpenAI](https://openai.com) and [Cohere](https://cohere.ai)
- Voice analysis by custom Python server (Flask/FastAPI)
