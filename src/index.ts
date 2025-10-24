import indexHtml from "./frontend/index.html"
import { getWines, getWineById, getMaxPrice } from "./api/wines"
import { getInventoryByWineId } from "./api/inventory"
import { generateQueryEmbedding } from "./api/embeddings"
import { rerankWines } from "./api/rerank"
import { getGeminiRecommendations } from "./api/gemini"
import { parseQuery, hasConditions, formatConditions } from "./api/queryParser"
import { filterWines } from "./api/filterWines"
import { supabase } from "./db/supabase"

const PORT = Number(Bun.env.PORT) || 4000

// SSE clients management
const sseClients = new Set<ReadableStreamDefaultController>()

Bun.serve({
  port: PORT,
  idleTimeout: 255, // SSE 연결 유지를 위해 긴 타임아웃 설정

  // Static file serving
  async fetch(req) {
    const url = new URL(req.url)

    // Serve images from src/frontend/img/
    if (url.pathname.startsWith('/img/')) {
      const filePath = `./src/frontend${url.pathname}`
      const file = Bun.file(filePath)
      if (await file.exists()) {
        return new Response(file)
      }
      return new Response('Image not found', { status: 404 })
    }

    return new Response('Not found', { status: 404 })
  },

  routes: {
    // Frontend
    "/": indexHtml,

    // Health check
    "/api/health": {
      GET: () => new Response(JSON.stringify({ status: "ok", service: "kiosk" }), {
        headers: { "Content-Type": "application/json" }
      })
    },

    // Get max price
    "/api/wines/max-price": {
      GET: async () => {
        try {
          const maxPrice = await getMaxPrice()
          return new Response(JSON.stringify({ maxPrice }), {
            headers: { "Content-Type": "application/json" }
          })
        } catch (error: any) {
          console.error('Error fetching max price:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          })
        }
      }
    },

    // Get all wines with filters
    "/api/wines": {
      GET: async (req) => {
        try {
          const url = new URL(req.url)
          const filters = {
            type: url.searchParams.get('type') || undefined,
            country: url.searchParams.get('country') || undefined,
            variety: url.searchParams.get('variety') || undefined,
            minPrice: url.searchParams.get('minPrice') ? Number(url.searchParams.get('minPrice')) : undefined,
            maxPrice: url.searchParams.get('maxPrice') ? Number(url.searchParams.get('maxPrice')) : undefined,
            search: url.searchParams.get('search') || undefined,
          }

          const wines = await getWines(filters)

          return new Response(JSON.stringify(wines), {
            headers: { "Content-Type": "application/json" }
          })
        } catch (error: any) {
          console.error('Error fetching wines:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          })
        }
      }
    },

    // Get wine by ID
    "/api/wines/:id": {
      GET: async (req) => {
        try {
          const id = Number(req.params.id)

          if (isNaN(id)) {
            return new Response(JSON.stringify({ error: "Invalid wine ID" }), {
              status: 400,
              headers: { "Content-Type": "application/json" }
            })
          }

          const wine = await getWineById(id)

          if (!wine) {
            return new Response(JSON.stringify({ error: "Wine not found" }), {
              status: 404,
              headers: { "Content-Type": "application/json" }
            })
          }

          return new Response(JSON.stringify(wine), {
            headers: { "Content-Type": "application/json" }
          })
        } catch (error: any) {
          console.error('Error fetching wine:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          })
        }
      }
    },

    // Get inventory by wine ID
    "/api/inventory/:wine_id": {
      GET: async (req) => {
        try {
          const wineId = Number(req.params.wine_id)

          if (isNaN(wineId)) {
            return new Response(JSON.stringify({ error: "Invalid wine ID" }), {
              status: 400,
              headers: { "Content-Type": "application/json" }
            })
          }

          const inventory = await getInventoryByWineId(wineId)

          return new Response(JSON.stringify(inventory), {
            headers: { "Content-Type": "application/json" }
          })
        } catch (error: any) {
          console.error('Error fetching inventory:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          })
        }
      }
    },

    // ElevenLabs configuration for client
    "/api/elevenlabs/config": {
      GET: async () => {
        return new Response(JSON.stringify({
          agentId: Bun.env.ELEVENLABS_AGENT_ID
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        })
      }
    },

    // SSE endpoint for wine recommendations
    "/api/wine-recommendations/stream": {
      GET: async (req) => {
        const stream = new ReadableStream({
          start(controller) {
            sseClients.add(controller)

            // Send initial connection message
            const encoder = new TextEncoder()
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`))

            // Send keepalive ping every 15 seconds to prevent timeout
            const keepaliveInterval = setInterval(() => {
              try {
                controller.enqueue(encoder.encode(`: keepalive\n\n`))
              } catch (error) {
                clearInterval(keepaliveInterval)
                sseClients.delete(controller)
              }
            }, 15000)

            // Handle client disconnect
            req.signal?.addEventListener('abort', () => {
              clearInterval(keepaliveInterval)
              sseClients.delete(controller)
              try {
                controller.close()
              } catch (e) {
                // Ignore close errors
              }
            })
          }
        })

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
          }
        })
      }
    },

    // Semantic search for voice assistant
    "/api/search/semantic": {
      POST: async (req) => {
        try {
          const { query, limit = 3 } = await req.json()

          if (!query) {
            return new Response(JSON.stringify({ error: "Query is required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" }
            })
          }

          console.log(`Semantic search query: "${query}", limit: ${limit}`)

          // 1. Generate query embedding
          const queryEmbedding = await generateQueryEmbedding(query)

          // 2. Search similar wines using pgvector
          const { data: candidates, error } = await supabase.rpc('match_wines', {
            query_embedding: queryEmbedding,
            match_threshold: 0.3,
            match_count: 50
          })

          if (error) {
            console.error('Supabase RPC error:', error)
            throw error
          }

          if (!candidates || candidates.length === 0) {
            console.log('✗ No wines found')
            return new Response(JSON.stringify({
              success: true,
              wines: [],
              count: 0
            }), {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              }
            })
          }

          // 3. Rerank with Cohere
          const wines = await rerankWines(query, candidates, limit)

          // Log search results
          console.log(`✓ Found ${wines.length} wines:`)
          wines.forEach((wine, index) => {
            console.log(`  ${index + 1}. ${wine.title} ${wine.vintage || ''} | ${wine.country} | ₩${wine.price.toLocaleString('ko-KR')}`)
          })

          // Simplify wine data for ElevenLabs (only necessary fields)
          const simplifiedWines = wines.map(wine => ({
            id: wine.id,
            title: wine.title,
            vintage: wine.vintage,
            type: wine.type,
            variety: wine.variety,
            country: wine.country,
            winery: wine.winery,
            price: wine.price,
            abv: wine.abv,
            points: wine.points,
            description: wine.description
          }))

          // Broadcast wine IDs via SSE
          const wineIds = simplifiedWines.map(w => w.id)
          const encoder = new TextEncoder()
          const message = encoder.encode(`data: ${JSON.stringify({
            type: 'wine_recommendations',
            wineIds
          })}\n\n`)

          sseClients.forEach(controller => {
            try {
              controller.enqueue(message)
            } catch (error) {
              sseClients.delete(controller)
            }
          })

          return new Response(JSON.stringify({
            success: true,
            wines: simplifiedWines,
            count: simplifiedWines.length
          }), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*" // ElevenLabs Agent 호출 허용
            }
          })
        } catch (error: any) {
          console.error('Semantic search error:', error)
          return new Response(JSON.stringify({
            success: false,
            error: error.message
          }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          })
        }
      }
    },

    // Gemini LLM-based search
    "/api/search/llm": {
      POST: async (req) => {
        try {
          const { query, limit = 3 } = await req.json()

          if (!query) {
            return new Response(JSON.stringify({ error: "Query is required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" }
            })
          }

          console.log(`🤖 Gemini LLM search: "${query}", limit: ${limit}`)

          // 1. 전체 와인 로드
          const { data: allWines, error } = await supabase
            .from('wines')
            .select('*')
            .order('points', { ascending: false })

          if (error) {
            console.error('Supabase error:', error)
            throw error
          }

          if (!allWines || allWines.length === 0) {
            console.log('✗ No wines in database')
            return new Response(JSON.stringify({
              success: true,
              wines: [],
              count: 0
            }), {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              }
            })
          }

          console.log(`📊 Loaded ${allWines.length} wines from database`)

          // 2. Gemini에게 추천 요청
          const recommendations = await getGeminiRecommendations(query, allWines, limit)

          console.log(`✓ Gemini recommended ${recommendations.length} wines:`)
          recommendations.forEach((rec, index) => {
            const wine = allWines.find(w => w.id === rec.id)
            if (wine) {
              console.log(`  ${index + 1}. ${wine.title} ${wine.vintage || ''} | ${wine.country} | ₩${wine.price.toLocaleString('ko-KR')}`)
              console.log(`     → ${rec.reason}`)
            }
          })

          // 3. 추천된 와인 상세 정보 가져오기 (순서 유지)
          const wines = recommendations
            .map(rec => {
              const wine = allWines.find(w => w.id === rec.id)
              if (!wine) return null
              return { ...wine, recommendation_reason: rec.reason }
            })
            .filter(Boolean)

          // 4. 간소화된 와인 데이터 (일레븐랩스용)
          const simplifiedWines = wines.map(wine => ({
            id: wine.id,
            title: wine.title,
            vintage: wine.vintage,
            type: wine.type,
            variety: wine.variety,
            country: wine.country,
            winery: wine.winery,
            price: wine.price,
            abv: wine.abv,
            points: wine.points,
            description: wine.description,
            recommendation_reason: wine.recommendation_reason
          }))

          // 5. SSE 브로드캐스트
          const wineIds = simplifiedWines.map(w => w.id)
          const encoder = new TextEncoder()
          const message = encoder.encode(`data: ${JSON.stringify({
            type: 'wine_recommendations',
            wineIds
          })}\n\n`)

          sseClients.forEach(controller => {
            try {
              controller.enqueue(message)
            } catch (error) {
              sseClients.delete(controller)
            }
          })

          // 6. 응답
          return new Response(JSON.stringify({
            success: true,
            wines: simplifiedWines,
            count: simplifiedWines.length
          }), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          })
        } catch (error: any) {
          console.error('❌ Gemini LLM search error:', error)
          return new Response(JSON.stringify({
            success: false,
            error: error.message
          }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          })
        }
      }
    },

    // Hybrid semantic search (Query Parsing + Filtering + Reranking)
    "/api/search/semantic-hybrid": {
      POST: async (req) => {
        try {
          const { query, limit = 3 } = await req.json()

          if (!query) {
            return new Response(JSON.stringify({ error: "Query is required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" }
            })
          }

          console.log(`🔍 Hybrid search: "${query}", limit: ${limit}`)

          // 1. 쿼리 파싱 (숫자 조건 추출)
          const conditions = parseQuery(query)
          const hasFilter = hasConditions(conditions)

          if (hasFilter) {
            console.log(`📋 Parsed conditions: ${formatConditions(conditions)}`)
          } else {
            console.log(`📋 No specific conditions found, using semantic search`)
          }

          // 2. 후보군 생성
          let candidates

          if (hasFilter) {
            // 조건이 있으면: SQL 필터링으로 후보군 좁히기
            candidates = await filterWines(conditions)
            console.log(`✓ Filtered to ${candidates.length} candidates`)

            if (candidates.length === 0) {
              console.log('✗ No wines match the conditions')
              return new Response(JSON.stringify({
                success: true,
                wines: [],
                count: 0
              }), {
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*"
                }
              })
            }
          } else {
            // 조건이 없으면: 기존 임베딩 검색
            const queryEmbedding = await generateQueryEmbedding(query)
            const { data, error } = await supabase.rpc('match_wines', {
              query_embedding: queryEmbedding,
              match_threshold: 0.3,
              match_count: 50
            })

            if (error) {
              console.error('Supabase RPC error:', error)
              throw error
            }

            candidates = data || []
            console.log(`✓ Semantic search found ${candidates.length} candidates`)
          }

          if (candidates.length === 0) {
            return new Response(JSON.stringify({
              success: true,
              wines: [],
              count: 0
            }), {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              }
            })
          }

          // 3. Cohere로 재랭킹 (의미적 관련성 보정)
          // 단, 정렬 조건이 있으면 SQL 정렬 결과 그대로 사용
          let wines
          if (conditions.sortBy) {
            // 정렬 조건이 있으면 리랭킹 건너뛰고 상위 N개만 선택
            wines = candidates.slice(0, limit)
            console.log(`✓ Sorted ${wines.length} wines (skipped reranking due to sortBy):`)
          } else {
            // 정렬 조건이 없으면 Cohere 리랭킹 수행
            wines = await rerankWines(query, candidates, limit)
            console.log(`✓ Reranked to ${wines.length} wines:`)
          }

          wines.forEach((wine, index) => {
            console.log(`  ${index + 1}. ${wine.title} ${wine.vintage || ''} | ${wine.country} | ₩${wine.price.toLocaleString('ko-KR')} | ${wine.points}⭐`)
          })

          // 4. 간소화된 와인 데이터 (일레븐랩스용)
          const simplifiedWines = wines.map(wine => ({
            id: wine.id,
            title: wine.title,
            vintage: wine.vintage,
            type: wine.type,
            variety: wine.variety,
            country: wine.country,
            winery: wine.winery,
            price: wine.price,
            abv: wine.abv,
            points: wine.points,
            description: wine.description
          }))

          // 5. SSE 브로드캐스트
          const wineIds = simplifiedWines.map(w => w.id)
          const encoder = new TextEncoder()
          const message = encoder.encode(`data: ${JSON.stringify({
            type: 'wine_recommendations',
            wineIds
          })}\n\n`)

          sseClients.forEach(controller => {
            try {
              controller.enqueue(message)
            } catch (error) {
              sseClients.delete(controller)
            }
          })

          // 6. 응답
          return new Response(JSON.stringify({
            success: true,
            wines: simplifiedWines,
            count: simplifiedWines.length
          }), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          })
        } catch (error: any) {
          console.error('❌ Hybrid search error:', error)
          return new Response(JSON.stringify({
            success: false,
            error: error.message
          }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          })
        }
      }
    }
  },

  development: {
    hmr: true,
    console: true,
  }
})

console.log(`🍷 Podoring Kiosk running on http://localhost:${PORT}`)
