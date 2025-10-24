import React from 'react'
import { ShoppingCart } from 'lucide-react'
import type { Wine } from '../../types'
import WineDetailModal from './WineDetailModal'
import { useKioskState } from '../hooks/useKioskState'

interface Props {
  wine: Wine
}

// 국가명에 따른 국기 이모지 매핑
const getCountryFlag = (country: string): string => {
  const flagMap: Record<string, string> = {
    'France': '🇫🇷',
    'Italy': '🇮🇹',
    'Spain': '🇪🇸',
    'United States': '🇺🇸',
    'Chile': '🇨🇱',
    'Argentina': '🇦🇷',
    'Australia': '🇦🇺',
    'Germany': '🇩🇪',
    'Portugal': '🇵🇹',
    'South Africa': '🇿🇦',
    'New Zealand': '🇳🇿',
  }
  return flagMap[country] || '🌍'
}

export default function WineCard({ wine }: Props) {
  const [showModal, setShowModal] = React.useState(false)
  const [flyingCard, setFlyingCard] = React.useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const cardRef = React.useRef<HTMLDivElement>(null)
  const { addToCart, viewMode } = useKioskState()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()

    // 카드의 현재 위치와 크기 저장
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      setFlyingCard({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      })
    }

    // 장바구니에 추가
    addToCart(wine)

    // 애니메이션 종료 후 상태 리셋
    setTimeout(() => {
      setFlyingCard(null)
    }, 700)
  }

  return (
    <>
      <div
        ref={cardRef}
        className="bg-[#f5f0e8] rounded-lg overflow-hidden flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow relative"
        onClick={() => setShowModal(true)}
      >
      {/* Wine Image - 1:1 정사각형 비율 */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="aspect-square mb-3 overflow-hidden rounded-md bg-white flex items-center justify-center relative">
          {wine.image ? (
            <img
              src={wine.image}
              alt={wine.title}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full bg-[#e5dfd1] flex items-center justify-center text-6xl">
              🍷
            </div>
          )}

          {/* Vivino 평점 - 이미지 위 좌측 상단 */}
          {wine.points && (
            <div className="absolute flex items-center gap-1.5" style={{ top: '-2px', left: '6px' }}>
              <img
                src="https://vectorseek.com/wp-content/uploads/2023/10/Vivino-Logo-Vector.svg-.png"
                alt="Vivino"
                className="w-10 h-10 object-contain"
              />
              <span className="text-[#3d2618] text-base font-roboto" style={{ fontWeight: 500 }}>
                {wine.points.toFixed(1)}
              </span>
            </div>
          )}

          {/* 재고 개수 - 이미지 위 우측 상단 */}
          {wine.stock !== undefined && (
            <div className="absolute flex items-center" style={{ top: '6px', right: '6px' }}>
              <span
                className="text-base font-bodoni"
                style={{
                  fontWeight: 500,
                  color: wine.stock > 0 ? '#4a7c2c' : '#8a8a8a'
                }}
              >
                store {wine.stock}
              </span>
            </div>
          )}

          {/* 알콜 도수 - 이미지 하단 우측 */}
          {wine.abv !== undefined && (
            <div className="absolute flex items-center" style={{ bottom: '6px', right: '6px' }}>
              <span className="text-[#8a8a8a] text-base font-bodoni" style={{ fontWeight: 500 }}>
                {wine.abv}%
              </span>
            </div>
          )}
        </div>

        {/* Wine Info */}
        <div className="flex-1 flex flex-col font-bodoni">
          {/* 와인명 - 고정 높이 */}
          <h3 className="text-[#3d2618] font-bold mb-1 line-clamp-2 text-lg" style={{ minHeight: '3.5rem' }}>
            {wine.title}
          </h3>

          {/* 국가명, 타입, 품종 */}
          <div className="text-base text-[#8b6f47] mb-2">
            {wine.country && (
              <div className="flex items-center gap-1.5">
                <span>{getCountryFlag(wine.country)}</span>
                <span>{wine.country}</span>
              </div>
            )}
            {wine.type && <div>{wine.type}</div>}
            {wine.variety && <div>{wine.variety}</div>}
          </div>

          {/* 가격 */}
          {wine.price && (
            <div className="text-[#3d2618] font-bold mt-auto mb-3 text-2xl">
              ₩{wine.price.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* 장바구니 추가 버튼 */}
      <div className="px-3 pb-3">
        <button
          onClick={handleAddToCart}
          className="w-full bg-[#6b2c2c] text-[#f5f0e8] py-3 rounded-lg hover:bg-[#8b3a3a] transition-colors flex items-center justify-center gap-2 font-medium font-bodoni"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>ADD TO CART</span>
        </button>
      </div>
    </div>

    {/* 날아가는 카드 애니메이션 */}
    {flyingCard && (
      <div
        className="fixed pointer-events-none z-[9999] bg-[#f5f0e8] rounded-lg overflow-hidden shadow-2xl"
        style={{
          left: `${flyingCard.x}px`,
          top: `${flyingCard.y}px`,
          width: `${flyingCard.width}px`,
          height: `${flyingCard.height}px`,
          animation: `flyToCart-${wine.id} 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`
        }}
      >
        {/* 와인 이미지 복제 */}
        <div className="p-4">
          <div className="aspect-square mb-3 overflow-hidden rounded-md bg-white flex items-center justify-center">
            {wine.image ? (
              <img
                src={wine.image}
                alt={wine.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-[#e5dfd1] flex items-center justify-center text-6xl">
                🍷
              </div>
            )}
          </div>

          {/* 와인 정보 복제 */}
          <div className="font-bodoni">
            <h3 className="text-[#3d2618] font-bold mb-1 line-clamp-2 text-lg" style={{ minHeight: '3.5rem' }}>
              {wine.title}
            </h3>

            <div className="text-base text-[#8b6f47] mb-2">
              {wine.country && (
                <div className="flex items-center gap-1.5">
                  <span>{getCountryFlag(wine.country)}</span>
                  <span>{wine.country}</span>
                </div>
              )}
              {wine.type && <div>{wine.type}</div>}
              {wine.variety && <div>{wine.variety}</div>}
            </div>

            {wine.price && (
              <div className="text-[#3d2618] font-bold text-2xl">
                ₩{wine.price.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Wine Detail Modal */}
    {showModal && (
      <WineDetailModal wine={wine} onClose={() => setShowModal(false)} viewMode={viewMode} />
    )}

    {flyingCard && (
      <style>{`
        @keyframes flyToCart-${wine.id} {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          70% {
            transform: translate(calc(100vw - ${flyingCard.x}px - ${flyingCard.width / 2}px - 72px), calc(100vh - ${flyingCard.y}px - ${flyingCard.height / 2}px - 160px)) scale(0.1);
            opacity: 0.6;
          }
          85% {
            transform: translate(calc(100vw - ${flyingCard.x}px - ${flyingCard.width / 2}px - 72px), calc(100vh - ${flyingCard.y}px - ${flyingCard.height / 2}px - 160px)) scale(0.03);
            opacity: 0.3;
          }
          100% {
            transform: translate(calc(100vw - ${flyingCard.x}px - ${flyingCard.width / 2}px - 72px), calc(100vh - ${flyingCard.y}px - ${flyingCard.height / 2}px - 160px)) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    )}
    </>
  )
}
