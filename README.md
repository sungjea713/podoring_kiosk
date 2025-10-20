# Podoring Wine Kiosk 🍷

A modern, AI-powered wine recommendation kiosk built with Bun, React, and ElevenLabs voice AI.

## Features

### 🎤 Voice Assistant
- **ElevenLabs AI Agent Integration**: Natural voice conversations for wine recommendations
- **Real-time SSE Updates**: Wine cards appear instantly as the AI agent searches
- **Multilingual Support**: Example phrases in 14+ languages
- **Animated Background**: Physics-based floating text with ambient color transitions

### 🍷 Wine Catalog
- **Smart Search & Filtering**: Search by name, filter by type, country, variety, price range
- **Semantic Search**: AI-powered wine recommendations using OpenAI embeddings + Cohere reranking
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
  - OpenAI GPT-4 for embeddings
  - Cohere for semantic reranking
  - ElevenLabs Conversational AI

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
│   │   └── inventory.ts  # Inventory management
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
└── tailwind.config.js
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

### Semantic Wine Search

Three-stage AI-powered search:

1. **Embedding**: OpenAI converts user query to vector embedding
2. **Vector Search**: Supabase pgvector finds similar wines (cosine similarity)
3. **Reranking**: Cohere reranks results for better relevance

```typescript
// Example query: "Red wine for steak dinner"
// Returns: Cabernet Sauvignon, Malbec, Syrah with high scores
```

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

### Voice Assistant Endpoints

- `GET /api/elevenlabs/config` - Get ElevenLabs Agent ID
- `POST /api/search/semantic` - Semantic wine search (ElevenLabs webhook)
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

## Acknowledgments

- Built with [Bun](https://bun.sh)
- Voice AI powered by [ElevenLabs](https://elevenlabs.io)
- Vector search by [Supabase](https://supabase.com)
- AI models by [OpenAI](https://openai.com) and [Cohere](https://cohere.ai)
