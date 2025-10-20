import React from 'react'
import { X, ShoppingCart } from 'lucide-react'
import { Conversation } from '@11labs/client'
import type { Wine } from '../../types'
import { useKioskState } from '../hooks/useKioskState'

interface VoiceModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FloatingPhrase {
  text: string
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

export default function VoiceModal({ isOpen, onClose }: VoiceModalProps) {
  const [phrases, setPhrases] = React.useState<FloatingPhrase[]>([])
  const [screenHeight, setScreenHeight] = React.useState(window.innerHeight)
  const [screenWidth, setScreenWidth] = React.useState(window.innerWidth)
  const [recommendedWines, setRecommendedWines] = React.useState<Wine[]>([])
  const [flyingCards, setFlyingCards] = React.useState<Map<number, { x: number; y: number; width: number; height: number; wine: Wine }>>(new Map())

  const conversationRef = React.useRef<Conversation | null>(null)
  const eventSourceRef = React.useRef<EventSource | null>(null)
  const cardRefs = React.useRef<Map<number, HTMLDivElement>>(new Map())
  const { addToCart } = useKioskState()

  // 화면 크기 감지
  React.useEffect(() => {
    const handleResize = () => {
      setScreenHeight(window.innerHeight)
      setScreenWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // SSE 연결 - 모달이 열릴 때 연결
  React.useEffect(() => {
    if (!isOpen) return

    console.log('📡 [SSE] Connecting to /api/wine-recommendations/stream...')
    const eventSource = new EventSource('/api/wine-recommendations/stream')

    eventSource.onopen = () => {
      console.log('✅ [SSE] Connected successfully')
    }

    eventSource.onmessage = async (event) => {
      console.log('📡 [SSE] Raw message received:', event.data)

      try {
        const data = JSON.parse(event.data)
        console.log('📡 [SSE] Parsed message:', data)

        if (data.type === 'connected') {
          console.log('✅ [SSE] Connection confirmed by server')
        } else if (data.type === 'wine_recommendations') {
          const wineIds = data.wineIds as number[]
          console.log(`🍷 [SSE] Received ${wineIds.length} wine IDs:`, wineIds)

          // Fetch wine details for each ID
          try {
            console.log('🔍 [API] Fetching wine details...')
            const winePromises = wineIds.map(id =>
              fetch(`/api/wines/${id}`).then(res => {
                console.log(`✅ [API] Fetched wine ${id}`)
                return res.json()
              })
            )

            const wines = await Promise.all(winePromises)
            console.log('✅ [API] Got all wine details:', wines)
            console.log('🎨 [UI] Setting recommendedWines state...')

            setRecommendedWines(wines)

            console.log('🎉 [UI] Wine cards should now be visible!')
          } catch (error) {
            console.error('❌ [API] Failed to fetch wine details:', error)
          }
        }
      } catch (parseError) {
        console.error('❌ [SSE] Failed to parse message:', parseError, 'Raw data:', event.data)
      }
    }

    eventSource.onerror = (error) => {
      console.error('❌ [SSE] Connection error:', error)
      console.log('⚠️ [SSE] ReadyState:', eventSource.readyState)
    }

    eventSourceRef.current = eventSource

    return () => {
      console.log('📡 [SSE] Closing connection')
      eventSource.close()
    }
  }, [isOpen])

  // recommendedWines 상태 변경 추적
  React.useEffect(() => {
    console.log('🔄 [STATE] recommendedWines changed:', recommendedWines.length, 'wines')
    if (recommendedWines.length > 0) {
      console.log('🍷 [STATE] Wine IDs in state:', recommendedWines.map(w => w.id))
    }
  }, [recommendedWines])

  // 초기화 - 모달이 열릴 때만 실행
  React.useEffect(() => {
    if (!isOpen) {
      // 모달이 닫히면 문장들 초기화
      setPhrases([])
      setRecommendedWines([]) // 추천 와인도 초기화
      return
    }

    const phraseTexts = [
      "오늘 저녁 스테이크와 함께 마실 레드 와인을 추천해 주세요.",
      "Is there a wine that pairs well with spicy Asian food?",
      "友達との気軽なパーティーに持っていく、コストパフォーマンスの良いワインを探してください",
      "Quel vin facile à boire serait un bon cadeau pour un ami qui débute dans le vin ?",
      "Quisiera un vino tinto que no sea muy pesado y que tenga un rico aroma afrutado.",
      "Potrebbe consigliarmi un vino bianco da tutti i giorni che costi meno di 40.000 won?",
      "Qual é um bom vinho para acompanhar uma tábua de queijos?",
      "Please recommend a suitable wine for my girlfriend's birthday.",
      "Please recommend a daily white wine that I can buy for under 40,000 won.",
      "4만원에서 7만원 사이의 레드 와인을 추천해줘",
      "오늘 친구에게 선물로 줄 와인 추천해줘",
      "알콜 도수가 높은 와인들 찾아줘.",
      "かのじょへのプレゼントにおすすめのワインはありますか？",
      "رشح لي أغلى أنواع النبيذ."
    ]

    const initialPhrases = phraseTexts.map((text) => ({
      text,
      x: Math.random() * screenWidth,
      y: Math.random() * screenHeight,
      vx: (Math.random() - 0.5) * 0.6 + (Math.random() > 0.5 ? 0.7 : -0.7),
      vy: (Math.random() - 0.5) * 0.6 + (Math.random() > 0.5 ? 0.7 : -0.7),
      size: 40 + Math.random() * 110,
      opacity: 0.12 + Math.random() * 0.18,
    }))

    setPhrases(initialPhrases)
  }, [isOpen, screenHeight, screenWidth])

  // 애니메이션 루프
  React.useEffect(() => {
    if (!isOpen || phrases.length === 0) return

    const interval = setInterval(() => {
      setPhrases((prev) =>
        prev.map((phrase) => {
          let newX = phrase.x + phrase.vx
          let newY = phrase.y + phrase.vy
          let newVx = phrase.vx
          let newVy = phrase.vy

          if (newX < 0) {
            newX = 0
            newVx = Math.abs(newVx)
          } else if (newX > screenWidth) {
            newX = screenWidth
            newVx = -Math.abs(newVx)
          }

          if (newY < 0) {
            newY = 0
            newVy = Math.abs(newVy)
          } else if (newY > screenHeight) {
            newY = screenHeight
            newVy = -Math.abs(newVy)
          }

          return {
            ...phrase,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
          }
        })
      )
    }, 16)

    return () => clearInterval(interval)
  }, [isOpen, phrases.length, screenHeight, screenWidth])

  // ElevenLabs 음성 어시스턴트 연결
  const connectToAssistant = async () => {
    try {
      // 백엔드에서 Agent ID 가져오기
      const configRes = await fetch('/api/elevenlabs/config')
      const config = await configRes.json()

      if (!config.agentId) {
        throw new Error('Agent ID not configured')
      }

      const conversation = await Conversation.startSession({
        agentId: config.agentId,
        onConnect: () => {
          console.log('✅ Connected to ElevenLabs Agent')
        },
        onDisconnect: () => {
          console.log('❌ Disconnected from Agent')
        },
        onMessage: (message) => {
          console.log('🎤 Agent message:', message)
          // SSE가 와인 카드를 처리하므로 여기서는 UI 업데이트 불필요
        },
        onError: (error) => {
          console.error('Voice assistant error:', error)
        }
      })

      conversationRef.current = conversation
    } catch (error) {
      console.error('Failed to connect:', error)
    }
  }

  // 연결 종료
  const disconnect = async () => {
    if (conversationRef.current) {
      await conversationRef.current.endSession()
      conversationRef.current = null
    }
  }

  // 모달 열릴 때 자동으로 연결, 닫을 때 연결 종료
  React.useEffect(() => {
    if (isOpen && !conversationRef.current) {
      // 모달 열릴 때 자동 연결
      connectToAssistant()
    } else if (!isOpen && conversationRef.current) {
      // 모달 닫힐 때 연결 종료
      disconnect()
    }
  }, [isOpen])

  // 장바구니에 추가
  const handleAddToCart = (wine: Wine) => {
    // 카드의 현재 위치와 크기 저장
    const cardElement = cardRefs.current.get(wine.id)
    if (cardElement) {
      const rect = cardElement.getBoundingClientRect()
      setFlyingCards(prev => {
        const newMap = new Map(prev)
        newMap.set(wine.id, {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          wine
        })
        return newMap
      })

      // 애니메이션 종료 후 상태 리셋
      setTimeout(() => {
        setFlyingCards(prev => {
          const newMap = new Map(prev)
          newMap.delete(wine.id)
          return newMap
        })
      }, 700)
    }

    // 장바구니에 추가
    addToCart(wine)
    console.log(`✅ Added "${wine.title}" to cart`)
  }

  // 모달 닫기 (모든 상태 초기화)
  const handleClose = () => {
    disconnect()
    setRecommendedWines([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full h-full overflow-hidden">
        {/* Ambient light effect background */}
        <style>{`
          @keyframes ambient-hue {
            0% { filter: hue-rotate(0deg) brightness(1); }
            5% { filter: hue-rotate(8deg) brightness(1.05); }
            10% { filter: hue-rotate(-12deg) brightness(0.9); }
            15% { filter: hue-rotate(20deg) brightness(1.1); }
            20% { filter: hue-rotate(-5deg) brightness(0.95); }
            25% { filter: hue-rotate(28deg) brightness(1.08); }
            30% { filter: hue-rotate(15deg) brightness(0.88); }
            35% { filter: hue-rotate(-18deg) brightness(1.12); }
            40% { filter: hue-rotate(35deg) brightness(1.02); }
            45% { filter: hue-rotate(10deg) brightness(0.92); }
            50% { filter: hue-rotate(-22deg) brightness(1.15); }
            55% { filter: hue-rotate(32deg) brightness(0.98); }
            60% { filter: hue-rotate(-8deg) brightness(1.06); }
            65% { filter: hue-rotate(25deg) brightness(0.94); }
            70% { filter: hue-rotate(5deg) brightness(1.09); }
            75% { filter: hue-rotate(-15deg) brightness(0.91); }
            80% { filter: hue-rotate(18deg) brightness(1.13); }
            85% { filter: hue-rotate(-10deg) brightness(0.96); }
            90% { filter: hue-rotate(22deg) brightness(1.04); }
            95% { filter: hue-rotate(12deg) brightness(0.99); }
            100% { filter: hue-rotate(0deg) brightness(1); }
          }
          .ambient-gradient {
            animation: ambient-hue 90s ease-in-out infinite;
          }
        `}</style>
        <div className="absolute inset-0 ambient-gradient" style={{
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          background: `
            radial-gradient(ellipse 800px 600px at 20% 30%, rgba(100, 200, 255, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse 700px 500px at 80% 70%, rgba(80, 150, 255, 0.25) 0%, transparent 50%),
            radial-gradient(ellipse 600px 600px at 50% 50%, rgba(120, 180, 255, 0.2) 0%, transparent 60%),
            linear-gradient(135deg, rgba(60, 120, 200, 0.4) 0%, rgba(100, 160, 240, 0.3) 50%, rgba(80, 140, 220, 0.35) 100%)
          `
        }} />

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
          }}
          className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transition-all hover:bg-white/30 hover:scale-110 z-[200]"
        >
          <X className="w-6 h-6 text-white" strokeWidth={2.5} />
        </button>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-12">
          {/* Title - Always visible */}
          {recommendedWines.length === 0 && (
            <div className="text-center mb-12">
              <h1 className="text-white text-7xl font-cormorant font-bold mb-4">
                Voice Assistant
              </h1>
              <p className="text-white text-3xl font-cormorant opacity-80">
                Say something to start
              </p>
            </div>
          )}

          {/* Recommended Wines Cards */}
          {recommendedWines.length > 0 && (
            <div className="grid grid-cols-3 gap-6 mt-8 max-w-6xl">
              {recommendedWines.map((wine) => (
                <div
                  key={wine.id}
                  ref={(el) => {
                    if (el) {
                      cardRefs.current.set(wine.id, el)
                    } else {
                      cardRefs.current.delete(wine.id)
                    }
                  }}
                  className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                >
                  {/* Wine Image */}
                  <div className="w-full h-48 mb-4 flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden">
                    {wine.image ? (
                      <img
                        src={wine.image}
                        alt={wine.title}
                        className="h-full object-contain"
                      />
                    ) : (
                      <div className="text-gray-400 text-4xl">🍷</div>
                    )}
                  </div>

                  {/* Wine Info */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {wine.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {wine.vintage && `${wine.vintage} • `}{wine.winery}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    {wine.country} • {wine.type}
                  </p>

                  {/* Price */}
                  <p className="text-2xl font-bold text-blue-600 mb-4">
                    ₩{wine.price.toLocaleString('ko-KR')}
                  </p>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(wine)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating example phrases with physics */}
        {recommendedWines.length === 0 && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]">
            {phrases.map((phrase, index) => (
              <div
                key={index}
                className="absolute font-cormorant whitespace-nowrap"
                style={{
                  transform: `translate(${phrase.x}px, ${phrase.y}px)`,
                  fontSize: `${phrase.size}px`,
                  color: `rgba(255, 255, 255, ${phrase.opacity})`,
                  willChange: 'transform',
                  backfaceVisibility: 'hidden',
                  WebkitFontSmoothing: 'antialiased',
                }}
              >
                {phrase.text}
              </div>
            ))}
          </div>
        )}

        {/* 날아가는 카드 애니메이션 */}
        {Array.from(flyingCards.entries()).map(([wineId, cardData]) => (
          <React.Fragment key={`flying-${wineId}`}>
            <div
              className="fixed pointer-events-none z-[9999] bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl"
              style={{
                left: `${cardData.x}px`,
                top: `${cardData.y}px`,
                width: `${cardData.width}px`,
                height: `${cardData.height}px`,
                animation: `flyToCart-${wineId} 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`
              }}
            >
              {/* 와인 카드 내용 복제 */}
              <div className="p-6">
                <div className="w-full h-48 mb-4 flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden">
                  {cardData.wine.image ? (
                    <img
                      src={cardData.wine.image}
                      alt={cardData.wine.title}
                      className="h-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 text-4xl">🍷</div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {cardData.wine.title}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  {cardData.wine.vintage && `${cardData.wine.vintage} • `}{cardData.wine.winery}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  {cardData.wine.country} • {cardData.wine.type}
                </p>

                <p className="text-2xl font-bold text-blue-600 mb-4">
                  ₩{cardData.wine.price.toLocaleString('ko-KR')}
                </p>
              </div>
            </div>

            {/* 애니메이션 키프레임 */}
            <style>{`
              @keyframes flyToCart-${wineId} {
                0% {
                  transform: translate(0, 0) scale(1);
                  opacity: 1;
                }
                70% {
                  transform: translate(calc(100vw - ${cardData.x}px - ${cardData.width / 2}px - 72px), calc(100vh - ${cardData.y}px - ${cardData.height / 2}px - 160px)) scale(0.1);
                  opacity: 0.6;
                }
                85% {
                  transform: translate(calc(100vw - ${cardData.x}px - ${cardData.width / 2}px - 72px), calc(100vh - ${cardData.y}px - ${cardData.height / 2}px - 160px)) scale(0.03);
                  opacity: 0.3;
                }
                100% {
                  transform: translate(calc(100vw - ${cardData.x}px - ${cardData.width / 2}px - 72px), calc(100vh - ${cardData.y}px - ${cardData.height / 2}px - 160px)) scale(0);
                  opacity: 0;
                }
              }
            `}</style>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
