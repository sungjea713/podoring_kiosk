# 다음 세션 작업 지침

## 현재 상태 (2025-01-20)

### ✅ 완료된 작업

1. **백엔드 Semantic Search API**
   - `/api/search/semantic` POST - OpenAI + Supabase pgvector + Cohere 리랭킹
   - `/api/elevenlabs/config` GET - Agent ID 제공
   - 서버 로그에 와인 타이틀, 가격, 나라 표시

2. **프론트엔드 Voice Assistant**
   - VoiceModal 컴포넌트 - ElevenLabs SDK 통합
   - 모달 열리면 자동으로 Agent 연결
   - 와인 카드 UI 준비 완료 (3-column grid)
   - 장바구니 추가 기능 (useKioskState.addToCart)
   - X 버튼으로 모든 상태 초기화

3. **ElevenLabs Agent 설정**
   - Custom Tool `search_wines` Webhook 설정
   - `force_pre_tool_speech: "always"` 권장
   - System Prompt에 "ALWAYS use search_wines" 강제 지시

4. **배포**
   - GitHub: https://github.com/sungjea713/podoring_kiosk
   - Render.com: https://podoring-kiosk.onrender.com
   - 환경변수 모두 설정됨

### ⚠️ 미완성 작업

**문제: 와인 카드가 화면에 표시되지 않음**

현재 VoiceModal이 ElevenLabs SDK의 이벤트를 올바르게 처리하지 못하고 있습니다.

## 🎯 다음 세션에서 해야 할 작업

### 해결 방법: Server-Sent Events (SSE) 구현 (권장)

ElevenLabs SDK 이벤트에 의존하지 않고, 백엔드에서 직접 와인 ID를 브로드캐스트합니다.

#### 1단계: 백엔드 SSE 구현 (src/index.ts)

**파일 상단에 SSE 클라이언트 관리 추가:**
```typescript
const sseClients = new Set<ReadableStreamDefaultController>()
```

**SSE 엔드포인트 추가:**
```typescript
"/api/wine-recommendations/stream": {
  GET: async (req) => {
    const stream = new ReadableStream({
      start(controller) {
        sseClients.add(controller)
        controller.enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
        
        req.signal?.addEventListener('abort', () => {
          sseClients.delete(controller)
          try { controller.close() } catch {}
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
}
```

**`/api/search/semantic` POST에서 검색 완료 시 SSE 브로드캐스트:**
```typescript
// 3. Rerank with Cohere
const wines = await rerankWines(query, candidates, limit)

// 와인 ID만 추출
const wineIds = wines.map(w => w.id)

// SSE로 브로드캐스트
const message = `data: ${JSON.stringify({ 
  type: 'wine_recommendations', 
  wineIds 
})}\n\n`

sseClients.forEach(controller => {
  try {
    controller.enqueue(message)
  } catch (error) {
    sseClients.delete(controller)
  }
})

// 기존 응답 반환 (ElevenLabs용)
return new Response(JSON.stringify({
  success: true,
  wines,
  count: wines.length
}), { ... })
```

#### 2단계: 프론트엔드 SSE 구독 (VoiceModal.tsx)

**SSE 연결 상태 추가:**
```typescript
const eventSourceRef = React.useRef<EventSource | null>(null)
```

**모달 열릴 때 SSE 연결:**
```typescript
React.useEffect(() => {
  if (!isOpen) return

  // SSE 연결
  const eventSource = new EventSource('/api/wine-recommendations/stream')
  
  eventSource.onmessage = async (event) => {
    const data = JSON.parse(event.data)
    console.log('📡 SSE message:', data)
    
    if (data.type === 'wine_recommendations') {
      // 와인 ID 받음 [94, 81, 77]
      const wineIds = data.wineIds
      
      // 각 ID로 상세정보 가져오기
      const winePromises = wineIds.map(id => 
        fetch(`/api/wines/${id}`).then(res => res.json())
      )
      
      const wines = await Promise.all(winePromises)
      setRecommendedWines(wines)
      setStatus('Found wines! Agent is describing them...')
    }
  }
  
  eventSource.onerror = () => {
    console.error('❌ SSE connection error')
  }
  
  eventSourceRef.current = eventSource
  
  return () => {
    eventSource.close()
  }
}, [isOpen])
```

**onMessage 단순화:**
```typescript
onMessage: (message) => {
  console.log('🎤 Agent:', message.type)
  
  if (message.type === 'user_transcript') {
    setUserMessage(message.message)
    setStatus(`You said: "${message.message}"`)
  } else if (message.type === 'agent_response') {
    setStatus(`Agent: "${message.message}"`)
  }
  // SSE가 와인 카드 처리하므로 tool_response 불필요!
}
```

## 📋 구현 순서

1. **src/index.ts 수정**
   - SSE 클라이언트 Set 추가
   - `/api/wine-recommendations/stream` 엔드포인트 추가
   - `/api/search/semantic`에서 SSE 브로드캐스트 추가

2. **src/frontend/components/VoiceModal.tsx 수정**
   - EventSource로 SSE 구독
   - 와인 ID 받으면 `/api/wines/:id`로 상세정보 가져오기
   - 와인 카드 표시

3. **테스트**
   - 로컬: `unset OPENAI_API_KEY && unset COHERE_API_KEY && bun run dev`
   - 음성으로 와인 추천 요청
   - 브라우저 콘솔에서 `📡 SSE message:` 로그 확인
   - 와인 카드 3개 표시 확인

4. **Git 커밋 & 배포**
   ```bash
   git add .
   git commit -m "Implement SSE for wine card synchronization"
   git push origin main
   ```

5. **Render.com 배포 확인**
   - https://podoring-kiosk.onrender.com 접속
   - 음성 추천 테스트
   - 와인 카드 표시 확인

## 🔍 디버깅 팁

### 서버 로그 확인
```
Semantic search query: "red wine pairing with steak", limit: 3
✓ Found 3 wines:
  1. Wine Title 2024 | Country | ₩40,685
  2. ...
📡 SSE broadcast: [94, 81, 77]
```

### 브라우저 콘솔 확인
```
📡 SSE message: { type: 'wine_recommendations', wineIds: [94, 81, 77] }
✅ Got wine details: [{ id: 94, title: '...', ... }, ...]
```

## 🎯 성공 기준

- ✅ 음성으로 와인 추천 요청
- ✅ Agent가 검색 → 음성 설명
- ✅ 동시에 화면에 와인 카드 3개 표시
- ✅ "Add to Cart" 버튼으로 장바구니 추가 가능
- ✅ X 버튼으로 모달 닫기

## 📞 참고 사항

### 현재 파일 상태

- **src/index.ts** - SSE 추가 필요
- **src/frontend/components/VoiceModal.tsx** - SSE 구독 추가 필요
- **src/api/embeddings.ts** - 완료
- **src/api/rerank.ts** - 완료
- **.env.local** - 모든 API 키 설정됨

### 중요 명령어

```bash
# 서버 실행 (환경변수 문제 회피)
unset OPENAI_API_KEY && unset COHERE_API_KEY && bun run dev

# Git 커밋
git add . && git commit -m "message" && git push origin main
```

---

**작업 시작 명령어:**

```
SSE (Server-Sent Events)를 구현하여 백엔드 semantic search 결과를 프론트엔드로 실시간 브로드캐스트하고, VoiceModal에서 와인 카드가 표시되도록 수정해줘. NEXT_SESSION_INSTRUCTIONS.md 파일을 참고해줘.
```
