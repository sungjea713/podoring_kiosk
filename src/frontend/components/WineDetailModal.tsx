import React from 'react'
import { X } from 'lucide-react'
import type { Wine } from '../../types'

interface Props {
  wine: Wine
  onClose: () => void
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

export default function WineDetailModal({ wine, onClose }: Props) {
  // Location 정보 조합 (국가 제외)
  const locationParts = [
    wine.province,
    wine.region_1,
    wine.region_2
  ].filter(Boolean)
  const locationText = locationParts.length > 0 ? locationParts.join(' / ') : null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#f5f0e8] rounded-lg shadow-2xl relative overflow-y-auto"
        style={{
          width: '900px',
          height: '1600px',
          maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-md z-10"
        >
          <X className="w-6 h-6 text-[#3d2618]" />
        </button>

        {/* Content */}
        <div className="p-8">
          <div className="flex gap-8 mb-8">
            {/* Wine Image - 좌측 상단 */}
            <div className="flex-shrink-0">
              <div className="w-80 h-80 bg-white rounded-lg overflow-hidden flex items-center justify-center shadow-md relative">
                {wine.image ? (
                  <img
                    src={wine.image}
                    alt={wine.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-[#e5dfd1] flex items-center justify-center text-9xl">
                    🍷
                  </div>
                )}

                {/* Vivino 평점 - 좌측 상단 */}
                {wine.points && (
                  <div className="absolute flex items-center gap-2" style={{ top: '-8px', left: '12px' }}>
                    <img
                      src="https://vectorseek.com/wp-content/uploads/2023/10/Vivino-Logo-Vector.svg-.png"
                      alt="Vivino"
                      className="w-16 h-16 object-contain"
                    />
                    <span className="text-[#3d2618] text-xl font-roboto" style={{ fontWeight: 500 }}>
                      {wine.points.toFixed(1)}
                    </span>
                  </div>
                )}

                {/* 재고 - 우측 상단 */}
                {wine.stock !== undefined && (
                  <div className="absolute flex items-center" style={{ top: '8px', right: '8px' }}>
                    <span
                      className="text-lg font-bodoni"
                      style={{
                        fontWeight: 500,
                        color: wine.stock > 0 ? '#4a7c2c' : '#8a8a8a'
                      }}
                    >
                      store {wine.stock}
                    </span>
                  </div>
                )}

                {/* 알콜 도수 - 우측 하단 */}
                {wine.abv !== undefined && (
                  <div className="absolute flex items-center" style={{ bottom: '8px', right: '8px' }}>
                    <span className="text-[#8a8a8a] text-lg font-bodoni" style={{ fontWeight: 500 }}>
                      {wine.abv}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 font-bodoni">
              <h1 className="text-4xl font-bold text-[#3d2618] mb-4">
                {wine.title}
              </h1>

              <div className="space-y-3 text-lg">
                {wine.country && (
                  <div className="flex items-center gap-2 text-[#8b6f47]">
                    <span className="text-2xl">{getCountryFlag(wine.country)}</span>
                    <span className="font-medium">{wine.country}</span>
                  </div>
                )}

                {locationText && (
                  <div className="text-[#8b6f47]">
                    <span className="font-medium">Region:</span> {locationText}
                  </div>
                )}

                {wine.winery && (
                  <div className="text-[#8b6f47]">
                    <span className="font-medium">Winery:</span> {wine.winery}
                  </div>
                )}

                {wine.type && (
                  <div className="text-[#8b6f47]">
                    <span className="font-medium">Type:</span> {wine.type}
                  </div>
                )}

                {wine.variety && (
                  <div className="text-[#8b6f47]">
                    <span className="font-medium">Variety:</span> {wine.variety}
                  </div>
                )}

                <div className="text-[#8b6f47]">
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

                {wine.price && (
                  <div className="text-[#3d2618] font-bold text-3xl mt-4">
                    ₩{wine.price.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {wine.description && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#3d2618] mb-3 font-bodoni">
                Description
              </h2>
              <p className="text-[#3d2618] text-lg leading-relaxed font-bodoni">
                {wine.description}
              </p>
            </div>
          )}

          {/* Taste Notes */}
          {wine.taste && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#3d2618] mb-3 font-bodoni">
                Taste Notes
              </h2>
              <p className="text-[#3d2618] text-lg leading-relaxed font-bodoni">
                {wine.taste}
              </p>
            </div>
          )}

          {/* Wine Profile */}
          {(wine.sweetness !== undefined ||
            wine.acidity !== undefined ||
            wine.tannin !== undefined ||
            wine.body !== undefined ||
            wine.alcohol !== undefined ||
            wine.cost_effectiveness !== undefined) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#3d2618] mb-4 font-bodoni">
                Wine Profile
              </h2>
              <div className="flex gap-6">
                {/* 좌측 - 5각 방사형 그래프 */}
                <div className="flex-shrink-0">
                  <svg width="320" height="320" viewBox="0 0 320 320" className="mx-auto">
                    {/* 방사형 그라데이션 정의 */}
                    <defs>
                      <radialGradient id="wineGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#f5d0d0" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="#c47676" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#8b3a3a" stopOpacity="0.6" />
                      </radialGradient>
                    </defs>
                    {/* 배경 오각형들 (5단계) */}
                    {[5, 4, 3, 2, 1].map((level) => {
                      const points = [0, 1, 2, 3, 4].map(i => {
                        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
                        const radius = (level / 5) * 115
                        const x = 160 + radius * Math.cos(angle)
                        const y = 160 + radius * Math.sin(angle)
                        return `${x},${y}`
                      }).join(' ')
                      return (
                        <polygon
                          key={level}
                          points={points}
                          fill="none"
                          stroke="#8b3a3a"
                          strokeWidth="1"
                          opacity="0.4"
                        />
                      )
                    })}

                    {/* 중심에서 각 꼭지점으로 선 */}
                    {[0, 1, 2, 3, 4].map(i => {
                      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
                      const x = 160 + 115 * Math.cos(angle)
                      const y = 160 + 115 * Math.sin(angle)
                      return (
                        <line
                          key={i}
                          x1="160"
                          y1="160"
                          x2={x}
                          y2={y}
                          stroke="#8b3a3a"
                          strokeWidth="1"
                          opacity="0.4"
                        />
                      )
                    })}

                    {/* 데이터 오각형 */}
                    {(() => {
                      const values = [
                        wine.sweetness || 0,
                        wine.acidity || 0,
                        wine.tannin || 0,
                        wine.body || 0,
                        wine.cost_effectiveness || 0
                      ]
                      const points = values.map((value, i) => {
                        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
                        const radius = (value / 5) * 115
                        const x = 160 + radius * Math.cos(angle)
                        const y = 160 + radius * Math.sin(angle)
                        return `${x},${y}`
                      }).join(' ')
                      return (
                        <>
                          <polygon
                            points={points}
                            fill="url(#wineGradient)"
                            stroke="#8b3a3a"
                            strokeWidth="2"
                          />
                          {values.map((value, i) => {
                            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
                            const radius = (value / 5) * 115
                            const x = 160 + radius * Math.cos(angle)
                            const y = 160 + radius * Math.sin(angle)
                            return (
                              <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="4"
                                fill="#8b3a3a"
                              />
                            )
                          })}
                        </>
                      )
                    })()}

                    {/* 라벨 */}
                    {['Sweetness', 'Acidity', 'Tannin', 'Body', 'C/E'].map((label, i) => {
                      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
                      const x = 160 + 138 * Math.cos(angle)
                      const y = 160 + 138 * Math.sin(angle)
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

                {/* 우측 - 막대 그래프 */}
                <div className="flex-1 space-y-4">
                {wine.sweetness !== undefined && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-[#8b6f47] font-medium font-bodoni">Sweetness</span>
                      <span className="text-[#3d2618] font-roboto" style={{ fontWeight: 500 }}>{wine.sweetness}/5</span>
                    </div>
                    <div className="h-3 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#c4a87a] to-[#8b6f47] rounded-full"
                        style={{ width: `${(wine.sweetness / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {wine.acidity !== undefined && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-[#8b6f47] font-medium font-bodoni">Acidity</span>
                      <span className="text-[#3d2618] font-roboto" style={{ fontWeight: 500 }}>{wine.acidity}/5</span>
                    </div>
                    <div className="h-3 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#c4a87a] to-[#8b6f47] rounded-full"
                        style={{ width: `${(wine.acidity / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {wine.tannin !== undefined && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-[#8b6f47] font-medium font-bodoni">Tannin</span>
                      <span className="text-[#3d2618] font-roboto" style={{ fontWeight: 500 }}>{wine.tannin}/5</span>
                    </div>
                    <div className="h-3 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#c4a87a] to-[#8b6f47] rounded-full"
                        style={{ width: `${(wine.tannin / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {wine.body !== undefined && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-[#8b6f47] font-medium font-bodoni">Body</span>
                      <span className="text-[#3d2618] font-roboto" style={{ fontWeight: 500 }}>{wine.body}/5</span>
                    </div>
                    <div className="h-3 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#c4a87a] to-[#8b6f47] rounded-full"
                        style={{ width: `${(wine.body / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {wine.alcohol !== undefined && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-[#8b6f47] font-medium font-bodoni">Alcohol</span>
                      <span className="text-[#3d2618] font-roboto" style={{ fontWeight: 500 }}>{wine.alcohol}/5</span>
                    </div>
                    <div className="h-3 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#c4a87a] to-[#8b6f47] rounded-full"
                        style={{ width: `${(wine.alcohol / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {wine.cost_effectiveness !== undefined && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-[#8b6f47] font-medium font-bodoni">Cost Effectiveness</span>
                      <span className="text-[#3d2618] font-roboto" style={{ fontWeight: 500 }}>{wine.cost_effectiveness}/5</span>
                    </div>
                    <div className="h-3 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#c4a87a] to-[#8b6f47] rounded-full"
                        style={{ width: `${(wine.cost_effectiveness / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
