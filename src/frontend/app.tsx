import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ShoppingCart, Mic } from 'lucide-react'
import { useWines, useMaxPrice } from './hooks/useWines'
import { useKioskState } from './hooks/useKioskState'
import WineCard from './components/WineCard'
import CartModal from './components/CartModal'
import VoiceModal from './components/VoiceModal'
import './styles/kiosk.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  const [activeFilter, setActiveFilter] = React.useState<{ type?: string; country?: string; variety?: string }>({})
  const { data: maxPrice } = useMaxPrice()
  const [priceRange, setPriceRange] = React.useState<[number, number] | null>(null)
  const [isVoiceOpen, setIsVoiceOpen] = React.useState(false)

  // maxPrice가 로드되면 priceRange 초기화 (MIN, MAX)
  React.useEffect(() => {
    if (maxPrice && priceRange === null) {
      setPriceRange([0, maxPrice])
    }
  }, [maxPrice, priceRange])

  const filterParams = {
    ...(activeFilter.type && activeFilter.type !== 'all' ? { type: activeFilter.type } : {}),
    ...(activeFilter.country && activeFilter.country !== 'all' ? { country: activeFilter.country } : {}),
    ...(activeFilter.variety && activeFilter.variety !== 'all' ? { variety: activeFilter.variety } : {}),
    ...(priceRange && priceRange[0] > 0 ? { minPrice: priceRange[0] } : {}),
    ...(priceRange && maxPrice && priceRange[1] < maxPrice ? { maxPrice: priceRange[1] } : {}),
  }

  const { data: wines = [], isLoading } = useWines(filterParams)
  const { cart, isCartOpen, setIsCartOpen } = useKioskState()

  const filters = [
    { id: 'all', label: 'ALL', filterType: 'reset' },
    { id: 'Red wine', label: 'RED', filterType: 'type' },
    { id: 'White wine', label: 'WHITE', filterType: 'type' },
    { id: 'Cabernet Sauvignon', label: 'CABERNET SAUVIGNON', filterType: 'variety' },
    { id: 'Pinot Noir', label: 'PINOT NOIR', filterType: 'variety' },
    { id: 'Sauvignon Blanc', label: 'SAUVIGNON BLANC', filterType: 'variety' },
    { id: 'Chardonnay', label: 'CHARDONNAY', filterType: 'variety' },
    { id: 'France', label: 'FRANCE', filterType: 'country' },
    { id: 'Italy', label: 'ITALY', filterType: 'country' },
    { id: 'Spain', label: 'SPAIN', filterType: 'country' },
    { id: 'United States', label: 'UNITED STATES', filterType: 'country' },
    { id: 'Chile', label: 'CHILE', filterType: 'country' },
  ]

  const handleFilterClick = (filter: typeof filters[0]) => {
    if (filter.filterType === 'reset') {
      setActiveFilter({})
    } else if (filter.filterType === 'type') {
      setActiveFilter({ type: filter.id })
    } else if (filter.filterType === 'country') {
      setActiveFilter({ country: filter.id })
    } else if (filter.filterType === 'variety') {
      setActiveFilter({ variety: filter.id })
    }
  }

  const isFilterActive = (filter: typeof filters[0]) => {
    if (filter.filterType === 'reset') {
      return Object.keys(activeFilter).length === 0
    } else if (filter.filterType === 'type') {
      return activeFilter.type === filter.id
    } else if (filter.filterType === 'country') {
      return activeFilter.country === filter.id
    } else if (filter.filterType === 'variety') {
      return activeFilter.variety === filter.id
    }
    return false
  }

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-radial" />
      <div className="fixed inset-0 noise-overlay" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="bg-gradient-radial-header absolute inset-0" />
          <div className="noise-overlay-header absolute inset-0" />
          {/* 그라데이션 하단 선 */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{
            background: 'linear-gradient(to right, transparent 0%, #c4a87a 20%, #c4a87a 80%, transparent 100%)'
          }} />

          <div className="max-w-[1080px] mx-auto relative z-10">
            {/* Logo */}
            <div className="text-center py-6 mb-6">
              <div className="flex justify-center mb-3">
                <img
                  src="/img/logo.png"
                  alt="Podoring Logo"
                  className="h-16 w-auto object-contain"
                />
              </div>
              <h1 className="header-title-font text-header-text mb-1 text-6xl">
                FINE WINE SELECTION
              </h1>
              <p className="header-subtitle-font text-sub-text text-lg">
                Our finest choice, Affordable
              </p>
            </div>

            {/* Filters - 2:1 aspect ratio */}
            <div className="px-6 pb-4">
              <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => handleFilterClick(filter)}
                    className={`
                      flex-shrink-0 rounded-lg transition-all w-44 h-20 flex items-center justify-center overflow-hidden relative
                      ${isFilterActive(filter)
                        ? 'border-2 border-gold'
                        : 'border-none'
                      }
                      ${filter.id === 'all' && !isFilterActive(filter) ? 'wine-bottles-bg' : ''}
                      ${filter.id === 'all' && isFilterActive(filter) ? 'wine-bottles-bg-active' : ''}
                      ${(filter.id === 'Red wine' || filter.id === 'White wine' || filter.id === 'Cabernet Sauvignon' || filter.id === 'Pinot Noir' || filter.id === 'Sauvignon Blanc' || filter.id === 'Chardonnay' || filter.id === 'France' || filter.id === 'Italy' || filter.id === 'Spain' || filter.id === 'United States' || filter.id === 'Chile') && !isFilterActive(filter) ? 'wine-card-bg' : ''}
                      ${(filter.id === 'Red wine' || filter.id === 'White wine' || filter.id === 'Cabernet Sauvignon' || filter.id === 'Pinot Noir' || filter.id === 'Sauvignon Blanc' || filter.id === 'Chardonnay' || filter.id === 'France' || filter.id === 'Italy' || filter.id === 'Spain' || filter.id === 'United States' || filter.id === 'Chile') && isFilterActive(filter) ? 'wine-card-bg-active' : ''}
                      ${filter.id !== 'all' && filter.id !== 'Red wine' && filter.id !== 'White wine' && filter.id !== 'Cabernet Sauvignon' && filter.id !== 'Pinot Noir' && filter.id !== 'Sauvignon Blanc' && filter.id !== 'Chardonnay' && filter.id !== 'France' && filter.id !== 'Italy' && filter.id !== 'Spain' && filter.id !== 'United States' && filter.id !== 'Chile' && isFilterActive(filter) ? 'filter-active-bg' : ''}
                      ${filter.id !== 'all' && filter.id !== 'Red wine' && filter.id !== 'White wine' && filter.id !== 'Cabernet Sauvignon' && filter.id !== 'Pinot Noir' && filter.id !== 'Sauvignon Blanc' && filter.id !== 'Chardonnay' && filter.id !== 'France' && filter.id !== 'Italy' && filter.id !== 'Spain' && filter.id !== 'United States' && filter.id !== 'Chile' && !isFilterActive(filter) ? 'bg-dark-brown' : ''}
                    `}
                    style={
                      filter.id === 'all' ? {
                        backgroundImage: 'url(/img/all_card.png)',
                      } : filter.id === 'Red wine' ? {
                        backgroundImage: 'url(/img/redwine_card.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      } : filter.id === 'White wine' ? {
                        backgroundImage: 'url(/img/whitewine_card.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      } : filter.id === 'Cabernet Sauvignon' ? {
                        backgroundImage: 'url(/img/cabernet_sauvignon.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      } : filter.id === 'Pinot Noir' ? {
                        backgroundImage: 'url(/img/pinot_noir.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      } : filter.id === 'Sauvignon Blanc' ? {
                        backgroundImage: 'url(/img/sauvignon_blanc.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      } : filter.id === 'Chardonnay' ? {
                        backgroundImage: 'url(/img/chardonnay.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      } : filter.id === 'France' ? {
                        backgroundImage: 'url(/img/france_wine.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      } : filter.id === 'Italy' ? {
                        backgroundImage: 'url(/img/italy_wine.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      } : filter.id === 'Spain' ? {
                        backgroundImage: 'url(/img/spain_wine.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      } : filter.id === 'United States' ? {
                        backgroundImage: 'url(/img/us_wine.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      } : filter.id === 'Chile' ? {
                        backgroundImage: 'url(/img/chile_wine.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      } : {}
                    }
                  >
                    <span className={`uppercase tracking-wider text-xl font-bold leading-tight text-center px-3 relative z-10 font-bodoni ${
                      filter.id === 'all' || filter.id === 'Red wine' || filter.id === 'White wine' || filter.id === 'Cabernet Sauvignon' || filter.id === 'Pinot Noir' || filter.id === 'Sauvignon Blanc' || filter.id === 'Chardonnay' || filter.id === 'France' || filter.id === 'Italy' || filter.id === 'Spain' || filter.id === 'United States' || filter.id === 'Chile' ? (isFilterActive(filter) ? 'text-[#8b6f47]' : 'text-white drop-shadow-lg') : isFilterActive(filter) ? 'text-[#8b6f47]' : 'text-header-text'
                    }`} style={isFilterActive(filter) ? {
                      WebkitTextStroke: '1px white',
                      textShadow: '0 0 8px rgba(255,255,255,0.8)'
                    } : {}}>
                      {filter.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="pt-[380px] pb-[160px] px-6">
          <div className="max-w-[1080px] mx-auto">
            {isLoading ? (
              <div className="text-center text-header-text text-xl py-20 font-cormorant">
                Loading wine list...
              </div>
            ) : wines.length === 0 ? (
              <div className="text-center text-header-text text-xl py-20 font-cormorant">
                와인이 없습니다
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                {wines.map((wine) => (
                  <WineCard
                    key={wine.id}
                    wine={wine}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Footer - Price Range Slider */}
        {priceRange && maxPrice && (
          <footer className="fixed bottom-0 left-0 right-0 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-40 backdrop-blur-sm" style={{ backgroundColor: 'rgba(47, 22, 26, 0.7)' }}>
            <div className="max-w-[1080px] mx-auto px-6 py-6">
              <div className="font-bodoni">
                {/* Price Labels */}
                <div className="relative mb-4 h-6">
                  <div
                    className="absolute transform -translate-x-1/2 text-white text-base font-medium whitespace-nowrap"
                    style={{ left: `${(priceRange[0] / maxPrice) * 100}%` }}
                  >
                    ₩{priceRange[0].toLocaleString()}
                  </div>
                  <div
                    className="absolute transform -translate-x-1/2 text-white text-base font-medium whitespace-nowrap"
                    style={{ left: `${(priceRange[1] / maxPrice) * 100}%` }}
                  >
                    ₩{priceRange[1].toLocaleString()}
                  </div>
                </div>

                {/* Slider Container */}
                <div className="relative" style={{ height: '16px' }}>
                  {/* Background Track */}
                  <div className="absolute w-full bg-white bg-opacity-30 rounded-full" style={{ top: '7px', height: '2px' }} />
                  {/* Active Range */}
                  <div
                    className="absolute bg-white rounded-full"
                    style={{
                      top: '7px',
                      height: '2px',
                      left: `${(priceRange[0] / maxPrice) * 100}%`,
                      right: `${100 - (priceRange[1] / maxPrice) * 100}%`
                    }}
                  />
                  {/* Min Slider */}
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    step={1000}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const newMin = Number(e.target.value)
                      if (newMin <= priceRange[1]) {
                        setPriceRange([newMin, priceRange[1]])
                      }
                    }}
                    className="absolute top-0 left-0 w-full pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto"
                  />
                  {/* Max Slider */}
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    step={1000}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const newMax = Number(e.target.value)
                      if (newMax >= priceRange[0]) {
                        setPriceRange([priceRange[0], newMax])
                      }
                    }}
                    className="absolute top-0 left-0 w-full pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto"
                  />
                </div>
              </div>
            </div>
          </footer>
        )}

        {/* Floating Voice Assistant Button */}
        <button
          onClick={() => setIsVoiceOpen(true)}
          className="fixed bottom-32 left-8 w-20 h-20 text-white rounded-full transition-all flex items-center justify-center z-50 hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, #a89968 0%, #8a7850 100%)',
            boxShadow: '0 8px 32px rgba(168, 153, 104, 0.6), 0 0 20px rgba(168, 153, 104, 0.3)'
          }}
        >
          <Mic className="w-12 h-12" />
        </button>

        {/* Floating Cart Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-32 right-8 w-20 h-20 text-white rounded-full transition-all flex items-center justify-center z-50 hover:scale-110 cart-button-gradient"
          style={{
            boxShadow: '0 8px 32px rgba(196, 30, 58, 0.6), 0 0 20px rgba(255, 215, 0, 0.3)'
          }}
        >
          <ShoppingCart className="w-12 h-12" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-br from-[#ffd700] to-[#ffed4e] text-[#1C0E10] text-sm w-8 h-8 rounded-full flex items-center justify-center shadow-lg font-bold">
              +{cart.length}
            </span>
          )}
        </button>

        {/* Cart Modal */}
        <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

        {/* Voice Modal */}
        <VoiceModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />
      </div>
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
