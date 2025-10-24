import React from 'react'
import { X, Trash2 } from 'lucide-react'
import type { Wine } from '../../types'
import { useKioskState } from '../hooks/useKioskState'

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  viewMode: 'desktop' | 'mobile'
}

export default function CartModal({ isOpen, onClose, viewMode }: CartModalProps) {
  const responsive = (mobileClass: string, desktopClass: string) => {
    return viewMode === 'mobile' ? mobileClass : desktopClass
  }
  const { cart, removeFromCart } = useKioskState()
  const [comparisonSlots, setComparisonSlots] = React.useState<[Wine | null, Wine | null]>([null, null])

  if (!isOpen) return null

  const handleWineClick = (wine: Wine) => {
    // 첫 번째 슬롯이 비어있으면 첫 번째에 추가
    if (!comparisonSlots[0]) {
      setComparisonSlots([wine, comparisonSlots[1]])
    }
    // 두 번째 슬롯이 비어있으면 두 번째에 추가
    else if (!comparisonSlots[1]) {
      setComparisonSlots([comparisonSlots[0], wine])
    }
    // 둘 다 차있으면 무시
  }

  const handleSlotClick = (index: 0 | 1) => {
    if (index === 0) {
      setComparisonSlots([null, comparisonSlots[1]])
    } else {
      setComparisonSlots([comparisonSlots[0], null])
    }
  }

  const handleRemoveFromCart = (wineId: number) => {
    removeFromCart(wineId)
    // 비교 슬롯에서도 제거
    if (comparisonSlots[0]?.id === wineId) {
      setComparisonSlots([null, comparisonSlots[1]])
    }
    if (comparisonSlots[1]?.id === wineId) {
      setComparisonSlots([comparisonSlots[0], null])
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${responsive('p-0', 'p-8')}`}
      style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      onClick={onClose}
    >
      <div
        className={`${responsive('rounded-none w-full h-full', 'rounded-2xl w-[900px] max-h-[calc(100vh-64px)]')} shadow-2xl overflow-hidden backdrop-blur-md`}
        style={{
          background: 'linear-gradient(135deg, rgba(245, 235, 224, 0.75) 0%, rgba(232, 220, 200, 0.75) 50%, rgba(225, 210, 190, 0.75) 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className={`relative ${responsive('p-4 pb-2', 'p-6 pb-3')}`}>
          <h2 className={`${responsive('text-2xl', 'text-4xl')} font-bold text-center font-bodoni text-[#3d2618]`}>
            Wine Cart
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full transition-all duration-300 text-[#8b6f47] hover:text-[#3d2618] hover:bg-white/50 hover:scale-110 backdrop-blur-sm"
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            <X className="w-8 h-8" strokeWidth={2.5} />
          </button>
        </div>

        <div className="h-full overflow-y-auto pb-32" style={{ maxHeight: 'calc(100vh - 160px)' }}>
          {/* 비교 영역 */}
          <div className={`${responsive('px-4 pt-2 pb-4', 'px-6 pt-2 pb-6')} relative`}>
            {/* 방사형 그래프 - 두 와인이 모두 선택되었을 때만 표시 */}
            {comparisonSlots[0] && comparisonSlots[1] && (
              <div className={`absolute left-1/2 ${responsive('top-12', 'top-20')} transform -translate-x-1/2 z-50 pointer-events-none`}>
                <svg width={viewMode === 'mobile' ? 180 : 220} height={viewMode === 'mobile' ? 180 : 220} viewBox="0 0 300 300" className="mx-auto drop-shadow-lg">
                  {/* 방사형 그라데이션 정의 */}
                  <defs>
                    <radialGradient id="leftWineGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#a8c8e1" stopOpacity="0.1" />
                      <stop offset="50%" stopColor="#6a9bc3" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#3a6ea5" stopOpacity="0.3" />
                    </radialGradient>
                    <radialGradient id="rightWineGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#b8e6b8" stopOpacity="0.1" />
                      <stop offset="50%" stopColor="#7ac97a" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#4a9d4a" stopOpacity="0.3" />
                    </radialGradient>
                  </defs>

                  {/* 배경 오각형들 (5단계) */}
                  {[5, 4, 3, 2, 1].map((level) => {
                    const points = [0, 1, 2, 3, 4].map(i => {
                      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
                      const radius = (level / 5) * 110
                      const x = 150 + radius * Math.cos(angle)
                      const y = 150 + radius * Math.sin(angle)
                      return `${x},${y}`
                    }).join(' ')
                    return (
                      <polygon
                        key={level}
                        points={points}
                        fill="rgba(255, 255, 255, 0.7)"
                        stroke="#d4c4a8"
                        strokeWidth="1"
                        opacity="0.5"
                      />
                    )
                  })}

                  {/* 중심에서 각 꼭지점으로 선 */}
                  {[0, 1, 2, 3, 4].map(i => {
                    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
                    const x = 150 + 110 * Math.cos(angle)
                    const y = 150 + 110 * Math.sin(angle)
                    return (
                      <line
                        key={i}
                        x1="150"
                        y1="150"
                        x2={x}
                        y2={y}
                        stroke="#d4c4a8"
                        strokeWidth="1"
                        opacity="0.4"
                      />
                    )
                  })}

                  {/* 왼쪽 와인 데이터 (파란색) */}
                  {(() => {
                    const wine = comparisonSlots[0]!
                    const values = [
                      wine.sweetness || 0,
                      wine.acidity || 0,
                      wine.tannin || 0,
                      wine.body || 0,
                      wine.cost_effectiveness || 0
                    ]
                    const points = values.map((value, i) => {
                      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
                      const radius = (value / 5) * 110
                      const x = 150 + radius * Math.cos(angle)
                      const y = 150 + radius * Math.sin(angle)
                      return `${x},${y}`
                    }).join(' ')
                    return (
                      <>
                        <polygon
                          points={points}
                          fill="url(#leftWineGradient)"
                          stroke="#3a6ea5"
                          strokeWidth="2"
                        />
                        {values.map((value, i) => {
                          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
                          const radius = (value / 5) * 110
                          const x = 150 + radius * Math.cos(angle)
                          const y = 150 + radius * Math.sin(angle)
                          return <circle key={i} cx={x} cy={y} r="4" fill="#3a6ea5" />
                        })}
                      </>
                    )
                  })()}

                  {/* 오른쪽 와인 데이터 (초록색) */}
                  {(() => {
                    const wine = comparisonSlots[1]!
                    const values = [
                      wine.sweetness || 0,
                      wine.acidity || 0,
                      wine.tannin || 0,
                      wine.body || 0,
                      wine.cost_effectiveness || 0
                    ]
                    const points = values.map((value, i) => {
                      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
                      const radius = (value / 5) * 110
                      const x = 150 + radius * Math.cos(angle)
                      const y = 150 + radius * Math.sin(angle)
                      return `${x},${y}`
                    }).join(' ')
                    return (
                      <>
                        <polygon
                          points={points}
                          fill="url(#rightWineGradient)"
                          stroke="#4a9d4a"
                          strokeWidth="2"
                        />
                        {values.map((value, i) => {
                          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
                          const radius = (value / 5) * 110
                          const x = 150 + radius * Math.cos(angle)
                          const y = 150 + radius * Math.sin(angle)
                          return <circle key={i} cx={x} cy={y} r="4" fill="#4a9d4a" />
                        })}
                      </>
                    )
                  })()}

                  {/* 라벨 */}
                  {['Sweetness', 'Acidity', 'Tannin', 'Body', 'C/E'].map((label, i) => {
                    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
                    const x = 150 + 130 * Math.cos(angle)
                    const y = 150 + 130 * Math.sin(angle)
                    return (
                      <text
                        key={i}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs font-bodoni fill-[#8b6f47]"
                      >
                        {label}
                      </text>
                    )
                  })}
                </svg>
              </div>
            )}

            <div className={`grid ${responsive('grid-cols-1 gap-4', 'grid-cols-2 gap-6')}`}>
              {[0, 1].map((index) => {
                const wine = comparisonSlots[index as 0 | 1]
                return (
                  <div
                    key={index}
                    onClick={() => wine && handleSlotClick(index as 0 | 1)}
                    className={`relative bg-white/50 rounded-xl p-4 ${wine ? 'cursor-pointer hover:bg-white/70' : ''} transition-colors`}
                    style={{ minHeight: '550px' }}
                  >
                    {wine ? (
                      <div>
                        {/* 와인 이미지 */}
                        <div className="mb-3">
                          <img
                            src={wine.image || 'https://via.placeholder.com/200x300?text=No+Image'}
                            alt={wine.title}
                            className="w-full h-48 object-contain mx-auto"
                          />
                        </div>

                        {/* 가격 */}
                        {wine.price && (
                          <div className="text-[#3d2618] font-bold text-2xl text-center mb-2 font-bodoni">
                            ₩{wine.price.toLocaleString()}
                          </div>
                        )}

                        {/* Vivino 점수 */}
                        {wine.points && (
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <img src="https://vectorseek.com/wp-content/uploads/2023/10/Vivino-Logo-Vector.svg-.png"
                                 alt="Vivino" className="w-16 h-16 object-contain" />
                            <span className="text-[#3d2618] text-lg font-roboto" style={{ fontWeight: 500 }}>
                              {wine.points.toFixed(1)}
                            </span>
                          </div>
                        )}

                        {/* 알콜 도수 */}
                        {wine.abv !== undefined && (
                          <div className="text-sm text-[#8b6f47] mb-1 text-center font-bodoni" style={{ fontWeight: 500 }}>
                            {wine.abv}% ABV
                          </div>
                        )}

                        {/* 국가 */}
                        {wine.country && (
                          <div className="text-sm text-[#8b6f47] mb-1 text-center font-bodoni">
                            {wine.country}
                          </div>
                        )}

                        {/* 와이너리 */}
                        {wine.winery && (
                          <div className="text-sm text-[#8b6f47] mb-1 text-center font-bodoni">
                            {wine.winery}
                          </div>
                        )}

                        {/* Location */}
                        <div className="text-sm text-[#8b6f47] mb-3 text-center font-bodoni">
                          <span className="font-medium">Location:</span>{' '}
                          {wine.locations && wine.locations.length > 0 ? (
                            wine.locations.map((loc, idx) => (
                              <span key={idx}>
                                {idx > 0 && ', '}
                                {loc.shelf}/{loc.row},{loc.col}
                              </span>
                            ))
                          ) : (
                            <span>Out of Stock</span>
                          )}
                        </div>

                        {/* 와인 5대 지수 막대 */}
                        <div className="space-y-1.5">
                          {wine.sweetness !== undefined && (
                            <div>
                              <div className="flex justify-between mb-1 text-sm font-bodoni">
                                <span className="text-[#8b6f47] font-medium">Sweetness</span>
                                <span className="text-[#3d2618] font-bold">{wine.sweetness}/5</span>
                              </div>
                              <div className="w-full bg-white/50 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${index === 0 ? 'bg-gradient-to-r from-[#6a9bc3] to-[#3a6ea5]' : 'bg-gradient-to-r from-[#7ac97a] to-[#4a9d4a]'}`}
                                  style={{ width: `${(wine.sweetness / 5) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {wine.acidity !== undefined && (
                            <div>
                              <div className="flex justify-between mb-1 text-sm font-bodoni">
                                <span className="text-[#8b6f47] font-medium">Acidity</span>
                                <span className="text-[#3d2618] font-bold">{wine.acidity}/5</span>
                              </div>
                              <div className="w-full bg-white/50 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${index === 0 ? 'bg-gradient-to-r from-[#6a9bc3] to-[#3a6ea5]' : 'bg-gradient-to-r from-[#7ac97a] to-[#4a9d4a]'}`}
                                  style={{ width: `${(wine.acidity / 5) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {wine.tannin !== undefined && (
                            <div>
                              <div className="flex justify-between mb-1 text-sm font-bodoni">
                                <span className="text-[#8b6f47] font-medium">Tannin</span>
                                <span className="text-[#3d2618] font-bold">{wine.tannin}/5</span>
                              </div>
                              <div className="w-full bg-white/50 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${index === 0 ? 'bg-gradient-to-r from-[#6a9bc3] to-[#3a6ea5]' : 'bg-gradient-to-r from-[#7ac97a] to-[#4a9d4a]'}`}
                                  style={{ width: `${(wine.tannin / 5) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {wine.body !== undefined && (
                            <div>
                              <div className="flex justify-between mb-1 text-sm font-bodoni">
                                <span className="text-[#8b6f47] font-medium">Body</span>
                                <span className="text-[#3d2618] font-bold">{wine.body}/5</span>
                              </div>
                              <div className="w-full bg-white/50 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${index === 0 ? 'bg-gradient-to-r from-[#6a9bc3] to-[#3a6ea5]' : 'bg-gradient-to-r from-[#7ac97a] to-[#4a9d4a]'}`}
                                  style={{ width: `${(wine.body / 5) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {wine.cost_effectiveness !== undefined && (
                            <div>
                              <div className="flex justify-between mb-1 text-sm font-bodoni">
                                <span className="text-[#8b6f47] font-medium">Cost Effectiveness</span>
                                <span className="text-[#3d2618] font-bold">{wine.cost_effectiveness}/5</span>
                              </div>
                              <div className="w-full bg-white/50 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${index === 0 ? 'bg-gradient-to-r from-[#6a9bc3] to-[#3a6ea5]' : 'bg-gradient-to-r from-[#7ac97a] to-[#4a9d4a]'}`}
                                  style={{ width: `${(wine.cost_effectiveness / 5) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-[#8b6f47] text-xl font-bodoni">
                          Click a wine below to compare
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 장바구니 와인 목록 */}
          <div className={`${responsive('px-4 pb-6', 'px-8 pb-8')}`}>
            <h3 className={`${responsive('text-xl mb-4', 'text-2xl mb-6')} font-bold text-[#3d2618] font-bodoni`}>Cart Items</h3>
            <div className={`flex ${responsive('gap-3', 'gap-4')} overflow-x-auto pb-4`}>
              {cart.map((wine) => (
                <div
                  key={wine.id}
                  className={`flex-shrink-0 cursor-pointer ${responsive('w-[150px]', 'w-[200px]')}`}
                  onClick={() => handleWineClick(wine)}
                >
                  {/* 와인 이미지 박스 */}
                  <div className="relative bg-white rounded-xl p-4 mb-3 h-52 flex items-center justify-center">
                    <img
                      src={wine.image || 'https://via.placeholder.com/150x200?text=No+Image'}
                      alt={wine.title}
                      className="max-h-full max-w-full object-contain"
                    />
                    {/* 쓰레기통 아이콘 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFromCart(wine.id)
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 와인 이름 */}
                  <p className="text-[#3d2618] text-sm font-medium text-center line-clamp-2 px-2">
                    {wine.title}
                  </p>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="w-full text-center py-20">
                  <p className="text-[#8b6f47] text-xl font-bodoni">Your cart is empty</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
