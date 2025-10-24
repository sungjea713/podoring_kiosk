import React from 'react'
import { X, ShoppingCart } from 'lucide-react'
import { Conversation } from '@11labs/client'
import type { Wine } from '../../types'
import { useKioskState } from '../hooks/useKioskState'
import WineDetailModal from './WineDetailModal'

interface VoiceModalProps {
  isOpen: boolean
  onClose: () => void
  viewMode: 'desktop' | 'mobile'
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

export default function VoiceModal({ isOpen, onClose, viewMode }: VoiceModalProps) {
  const responsive = (mobileClass: string, desktopClass: string) => {
    return viewMode === 'mobile' ? mobileClass : desktopClass
  }
  const [phrases, setPhrases] = React.useState<FloatingPhrase[]>([])
  const [screenHeight, setScreenHeight] = React.useState(window.innerHeight)
  const [screenWidth, setScreenWidth] = React.useState(window.innerWidth)
  const [recommendedWines, setRecommendedWines] = React.useState<Wine[]>([])
  const [flyingCards, setFlyingCards] = React.useState<Map<number, { x: number; y: number; width: number; height: number; wine: Wine }>>(new Map())
  const [selectedWine, setSelectedWine] = React.useState<Wine | null>(null)
  const [isRecording, setIsRecording] = React.useState(false)
  const [recordingDuration, setRecordingDuration] = React.useState(0)

  const conversationRef = React.useRef<Conversation | null>(null)
  const eventSourceRef = React.useRef<EventSource | null>(null)
  const cardRefs = React.useRef<Map<number, HTMLDivElement>>(new Map())
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
  const audioChunksRef = React.useRef<Blob[]>([])
  const audioStreamRef = React.useRef<MediaStream | null>(null)
  const recordingStartTimeRef = React.useRef<number | null>(null)
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

    const eventSource = new EventSource('/api/wine-recommendations/stream')

    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'wine_recommendations') {
          const wineIds = data.wineIds as number[]

          // 먼저 기존 카드를 초기화 (새 추천 시작)
          setRecommendedWines([])

          // Fetch wine details for each ID
          try {
            const winePromises = wineIds.map(id =>
              fetch(`/api/wines/${id}`).then(res => res.json())
            )

            const wines = await Promise.all(winePromises)
            setRecommendedWines(wines)
          } catch (error) {
            console.error('Failed to fetch wine details:', error)
          }
        }
      } catch (parseError) {
        console.error('Failed to parse SSE message:', parseError)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error)
    }

    eventSourceRef.current = eventSource

    return () => {
      eventSource.close()
    }
  }, [isOpen])

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

  // 음성 녹음 시작
  const startRecording = async () => {
    try {
      console.log('🎙️ Requesting microphone access for recording...')

      // 마이크 접근 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })

      audioStreamRef.current = stream
      audioChunksRef.current = []

      // MediaRecorder 생성 (webm 포맷)
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const mediaRecorder = new MediaRecorder(stream, { mimeType })

      // 데이터 수집
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          console.log(`📦 Audio chunk received: ${event.data.size} bytes`)
        }
      }

      // 녹음 시작
      mediaRecorder.start(1000) // 1초마다 chunk 생성
      mediaRecorderRef.current = mediaRecorder
      recordingStartTimeRef.current = Date.now()
      setIsRecording(true)

      console.log('✅ Recording started')
    } catch (error) {
      console.error('❌ Failed to start recording:', error)
      alert('마이크 접근 권한이 필요합니다. 브라우저 설정에서 마이크를 허용해주세요.')
    }
  }

  // 음성 녹음 중지 및 자동 다운로드
  const stopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      return
    }

    console.log('🛑 Stopping recording...')

    const mediaRecorder = mediaRecorderRef.current

    // 녹음 중지 이벤트 처리
    mediaRecorder.onstop = () => {
      console.log(`📦 Total chunks: ${audioChunksRef.current.length}`)

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      const totalSize = audioBlob.size
      const durationSec = recordingStartTimeRef.current
        ? Math.round((Date.now() - recordingStartTimeRef.current) / 1000)
        : 0

      console.log(`✅ Recording complete: ${totalSize} bytes, ${durationSec}s`)

      // 자동 다운로드
      if (totalSize > 0) {
        const url = URL.createObjectURL(audioBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `voice-recording-${Date.now()}.webm`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        console.log('💾 Recording downloaded automatically')
      } else {
        console.warn('⚠️ Recording is empty, skipping download')
      }

      // 리소스 정리
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop())
        audioStreamRef.current = null
      }

      audioChunksRef.current = []
      mediaRecorderRef.current = null
      recordingStartTimeRef.current = null
      setIsRecording(false)
      setRecordingDuration(0)
    }

    mediaRecorder.stop()
  }

  // 모달 열릴 때 자동으로 연결, 닫을 때 연결 종료
  React.useEffect(() => {
    if (isOpen && !conversationRef.current) {
      // 모달 열릴 때 자동 연결
      connectToAssistant()
      // 녹음 시작 (일시적으로 비활성화)
      // startRecording()
    } else if (!isOpen && conversationRef.current) {
      // 모달 닫힐 때 연결 종료
      disconnect()
      // 녹음 중지 및 다운로드 (일시적으로 비활성화)
      // stopRecording()
    }

    // cleanup
    return () => {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [isOpen])

  // 녹음 시간 타이머 업데이트
  React.useEffect(() => {
    if (!isRecording || !recordingStartTimeRef.current) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current!) / 1000)
      setRecordingDuration(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRecording])

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

        {/* Recording indicator (일시적으로 비활성화) */}
        {/* {isRecording && (
          <div className="absolute top-8 left-8 flex items-center gap-3 bg-red-500/90 backdrop-blur-md px-4 py-2 rounded-full z-[200]">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-white font-semibold text-sm">
              Recording {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )} */}

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
            <div className={`text-center ${responsive('mb-8 px-4', 'mb-12 px-4')}`}>
              <h1 className={`text-white ${responsive('text-4xl mb-3', 'text-7xl mb-4')} font-cormorant font-bold`}>
                Voice Assistant
              </h1>
              <p className={`text-white ${responsive('text-xl', 'text-3xl')} font-cormorant opacity-80`}>
                Say something to start
              </p>
            </div>
          )}

          {/* Recommended Wines Cards */}
          {recommendedWines.length > 0 && (
            <div className={`grid ${responsive('grid-cols-1 gap-4 mt-6 px-4', 'grid-cols-3 gap-6 mt-8')} max-w-6xl`}>
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
                  className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl transition-all hover:scale-105 hover:shadow-2xl cursor-pointer flex flex-col"
                  onClick={() => setSelectedWine(wine)}
                >
                  {/* Wine Image */}
                  <div className="w-full h-48 mb-4 flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
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

                  {/* Wine Info - 고정 높이 영역 */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2" style={{ minHeight: '3.5rem' }}>
                      {wine.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {wine.vintage && `${wine.vintage} • `}{wine.winery}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      {wine.country} • {wine.type}
                    </p>

                    {/* Price - 항상 버튼 위에 위치 */}
                    <div className="mt-auto">
                      <p className="text-2xl font-bold text-blue-600 mb-4">
                        ₩{wine.price.toLocaleString('ko-KR')}
                      </p>

                      {/* Add to Cart Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddToCart(wine)
                        }}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
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

        {/* Wine Detail Modal */}
        {selectedWine && (
          <WineDetailModal
            wine={selectedWine}
            onClose={() => setSelectedWine(null)}
            viewMode={viewMode}
          />
        )}
      </div>
    </div>
  )
}
