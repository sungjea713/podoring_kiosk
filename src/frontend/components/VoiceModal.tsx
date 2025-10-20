import React from 'react'
import { X, Mic, MicOff } from 'lucide-react'
import { Conversation } from '@11labs/client'
import type { Wine } from '../../types'

interface VoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onWinesRecommended?: (wines: Wine[]) => void
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

export default function VoiceModal({ isOpen, onClose, onWinesRecommended }: VoiceModalProps) {
  const [phrases, setPhrases] = React.useState<FloatingPhrase[]>([])
  const [screenHeight, setScreenHeight] = React.useState(window.innerHeight)
  const [screenWidth, setScreenWidth] = React.useState(window.innerWidth)
  const [isConnected, setIsConnected] = React.useState(false)
  const [isListening, setIsListening] = React.useState(false)
  const [userMessage, setUserMessage] = React.useState('')
  const [status, setStatus] = React.useState('Ready to talk')

  const conversationRef = React.useRef<Conversation | null>(null)

  // 화면 크기 감지
  React.useEffect(() => {
    const handleResize = () => {
      setScreenHeight(window.innerHeight)
      setScreenWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 초기화 - 모달이 열릴 때만 실행
  React.useEffect(() => {
    if (!isOpen) {
      // 모달이 닫히면 문장들 초기화
      setPhrases([])
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
      setStatus('Connecting to voice assistant...')

      // 백엔드에서 Agent ID 가져오기
      const configRes = await fetch('/api/elevenlabs/config')
      const config = await configRes.json()

      if (!config.agentId) {
        throw new Error('Agent ID not configured')
      }

      const conversation = await Conversation.startSession({
        agentId: config.agentId,
        onConnect: () => {
          console.log('Connected to ElevenLabs Agent')
          setIsConnected(true)
          setStatus('Connected! Start speaking...')
        },
        onDisconnect: () => {
          console.log('Disconnected from Agent')
          setIsConnected(false)
          setIsListening(false)
          setStatus('Disconnected')
        },
        onMessage: (message) => {
          console.log('Agent message:', message)
          if (message.type === 'user_transcript') {
            setUserMessage(message.message)
            setStatus(`You said: "${message.message}"`)
          } else if (message.type === 'agent_response') {
            setStatus(`Agent: "${message.message}"`)
          }
        },
        onError: (error) => {
          console.error('Voice assistant error:', error)
          setStatus(`Error: ${error.message}`)
          setIsConnected(false)
        }
      })

      conversationRef.current = conversation
      setIsListening(true)
    } catch (error) {
      console.error('Failed to connect:', error)
      setStatus('Failed to connect. Please try again.')
    }
  }

  // 연결 종료
  const disconnect = async () => {
    if (conversationRef.current) {
      await conversationRef.current.endSession()
      conversationRef.current = null
      setIsConnected(false)
      setIsListening(false)
      setStatus('Disconnected')
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
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
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.3); }
            50% { box-shadow: 0 0 40px rgba(255, 255, 255, 0.6); }
          }
          .pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
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
            disconnect()
            onClose()
          }}
          className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transition-all hover:bg-white/30 hover:scale-110 z-[200]"
        >
          <X className="w-6 h-6 text-white" strokeWidth={2.5} />
        </button>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-12">
          <h2 className="text-white text-7xl font-bold mb-6 font-bodoni">
            Voice Assistant
          </h2>

          {/* Status */}
          <p className="text-white/80 text-3xl font-cormorant mb-8">
            {status}
          </p>

          {/* User message display */}
          {userMessage && (
            <div className="text-white text-2xl font-cormorant mb-8 max-w-3xl text-center bg-white/10 backdrop-blur-md rounded-2xl p-6">
              "{userMessage}"
            </div>
          )}

          {/* Microphone button */}
          <button
            onClick={isConnected ? disconnect : connectToAssistant}
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-500/80 hover:bg-red-600/80 pulse-glow'
                : 'bg-white/20 hover:bg-white/30'
            } backdrop-blur-md hover:scale-110`}
          >
            {isConnected ? (
              <MicOff className="w-16 h-16 text-white" strokeWidth={2} />
            ) : (
              <Mic className="w-16 h-16 text-white" strokeWidth={2} />
            )}
          </button>

          <p className="text-white/60 text-xl font-cormorant mt-6">
            {isConnected ? 'Click to stop' : 'Click to start'}
          </p>
        </div>

        {/* Floating example phrases with physics */}
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
      </div>
    </div>
  )
}
