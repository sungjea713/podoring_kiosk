import { useState } from 'react';
import { KioskHeader } from './components/KioskHeader';
import { WineCard } from './components/WineCard';
import { ShoppingCart } from 'lucide-react';

// Filter Categories
const filters = [
  { id: 'all', label: 'ALL', image: 'https://images.unsplash.com/photo-1606920301459-d66500c43ff6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5lJTIwY29sbGVjdGlvbnxlbnwxfHx8fDE3NjA1Mjk5Njh8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'red', label: 'Red Wine', image: 'https://images.unsplash.com/photo-1700893417207-99da24343476?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjB3aW5lJTIwYm90dGxlfGVufDF8fHx8MTc2MDUwNzAwMnww&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'white', label: 'White Wine', image: 'https://images.unsplash.com/photo-1534409385199-b60aa1bcffa0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHdpbmUlMjBib3R0bGV8ZW58MXx8fHwxNzYwNTE4OTI5fDA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'cabernet', label: 'Cabernet Sauvignon', image: 'https://images.unsplash.com/photo-1607720336444-7990bedc2bf9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWJlcm5ldCUyMHdpbmV8ZW58MXx8fHwxNzYwNjExMjMyfDA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'pinot', label: 'Pinot Noir', image: 'https://images.unsplash.com/photo-1423483641154-5411ec9c0ddf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5lJTIwZ3JhcGVzfGVufDF8fHx8MTc2MDU5MzA1MHww&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'sauvignon', label: 'Sauvignon Blanc', image: 'https://images.unsplash.com/photo-1534409385199-b60aa1bcffa0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHdpbmUlMjBib3R0bGV8ZW58MXx8fHwxNzYwNTE4OTI5fDA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'chardonnay', label: 'Chardonnay', image: 'https://images.unsplash.com/photo-1534409385199-b60aa1bcffa0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHdpbmUlMjBib3R0bGV8ZW58MXx8fHwxNzYwNTE4OTI5fDA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'france', label: 'France', image: 'https://images.unsplash.com/photo-1508471608746-b7f6b8a5b0b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjB3aW5lfGVufDF8fHx8MTc2MDYxMTIzMnww&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'italy', label: 'Italy', image: 'https://images.unsplash.com/photo-1659004418358-5c47e4c9b945?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwd2luZXxlbnwxfHx8fDE3NjA2MTEyMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'spain', label: 'Spain', image: 'https://images.unsplash.com/photo-1423483641154-5411ec9c0ddf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5lJTIwZ3JhcGVzfGVufDF8fHx8MTc2MDU5MzA1MHww&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'usa', label: 'USA', image: 'https://images.unsplash.com/photo-1700893417207-99da24343476?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjB3aW5lJTIwYm90dGxlfGVufDF8fHx8MTc2MDUwNzAwMnww&ixlib=rb-4.1.0&q=80&w=1080' },
];

// Mock Wine Data
const wineData = [
  {
    id: '1',
    name: 'Château Lafite Rothschild',
    image: 'https://images.unsplash.com/photo-1682805628697-2a6cc3ee879e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5lJTIwYm90dGxlJTIwc3F1YXJlfGVufDF8fHx8MTc2MDYxMTY3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    price: 650.00,
    type: 'Red Wine',
    grape: 'Cabernet Sauvignon',
  },
  {
    id: '2',
    name: 'Domaine de la Romanée-Conti',
    image: 'https://images.unsplash.com/photo-1586124288020-1d7436afd010?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjB3aW5lJTIwYm90dGxlJTIwbWluaW1hbHxlbnwxfHx8fDE3NjA2MTE2Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    price: 850.00,
    type: 'Red Wine',
    grape: 'Pinot Noir',
  },
  {
    id: '3',
    name: 'Screaming Eagle Cabernet',
    image: 'https://images.unsplash.com/photo-1708148259810-636dd0906f1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3JkZWF1eCUyMHdpbmUlMjBib3R0bGV8ZW58MXx8fHwxNzYwNjExNjc5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.7,
    price: 380.00,
    type: 'Red Wine',
    grape: 'Cabernet Sauvignon',
  },
  {
    id: '4',
    name: 'Cloudy Bay Sauvignon Blanc',
    image: 'https://images.unsplash.com/photo-1610639538258-95eadbed7406?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHdpbmUlMjBib3R0bGUlMjBtaW5pbWFsfGVufDF8fHx8MTc2MDYxMTY3OHww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.5,
    price: 45.00,
    type: 'White Wine',
    grape: 'Sauvignon Blanc',
  },
  {
    id: '5',
    name: 'Penfolds Grange',
    image: 'https://images.unsplash.com/photo-1672140940042-1f2e27cf64df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5lJTIwYm90dGxlJTIwaXNvbGF0ZWR8ZW58MXx8fHwxNzYwNTk0NDM1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.6,
    price: 280.00,
    type: 'Red Wine',
    grape: 'Shiraz',
  },
  {
    id: '6',
    name: 'Opus One',
    image: 'https://images.unsplash.com/photo-1682805628697-2a6cc3ee879e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5lJTIwYm90dGxlJTIwc3F1YXJlfGVufDF8fHx8MTc2MDYxMTY3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.7,
    price: 420.00,
    type: 'Red Wine',
    grape: 'Cabernet Sauvignon',
  },
  {
    id: '7',
    name: 'Krug Grande Cuvée',
    image: 'https://images.unsplash.com/photo-1630771496884-46ce7c270a52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGFtcGFnbmUlMjBib3R0bGV8ZW58MXx8fHwxNzYwNTc5NjA0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    price: 220.00,
    type: 'Sparkling Wine',
    grape: 'Chardonnay',
  },
  {
    id: '8',
    name: 'Caymus Vineyards Cabernet',
    image: 'https://images.unsplash.com/photo-1586124288020-1d7436afd010?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjB3aW5lJTIwYm90dGxlJTIwbWluaW1hbHxlbnwxfHx8fDE3NjA2MTE2Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.4,
    price: 95.00,
    type: 'Red Wine',
    grape: 'Cabernet Sauvignon',
  },
  {
    id: '9',
    name: 'Antinori Tignanello',
    image: 'https://images.unsplash.com/photo-1708148259810-636dd0906f1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3JkZWF1eCUyMHdpbmUlMjBib3R0bGV8ZW58MXx8fHwxNzYwNjExNjc5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.6,
    price: 125.00,
    type: 'Red Wine',
    grape: 'Sangiovese',
  },
  {
    id: '10',
    name: 'Chablis Grand Cru',
    image: 'https://images.unsplash.com/photo-1610639538258-95eadbed7406?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHdpbmUlMjBib3R0bGUlMjBtaW5pbWFsfGVufDF8fHx8MTc2MDYxMTY3OHww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.5,
    price: 85.00,
    type: 'White Wine',
    grape: 'Chardonnay',
  },
  {
    id: '11',
    name: 'Silver Oak Cabernet',
    image: 'https://images.unsplash.com/photo-1672140940042-1f2e27cf64df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5lJTIwYm90dGxlJTIwaXNvbGF0ZWR8ZW58MXx8fHwxNzYwNTk0NDM1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.3,
    price: 110.00,
    type: 'Red Wine',
    grape: 'Cabernet Sauvignon',
  },
  {
    id: '12',
    name: 'Vega Sicilia Unico',
    image: 'https://images.unsplash.com/photo-1682805628697-2a6cc3ee879e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5lJTIwYm90dGxlJTIwc3F1YXJlfGVufDF8fHx8MTc2MDYxMTY3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    price: 350.00,
    type: 'Red Wine',
    grape: 'Tempranillo',
  },
  {
    id: '13',
    name: 'Trimbach Riesling',
    image: 'https://images.unsplash.com/photo-1610639538258-95eadbed7406?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHdpbmUlMjBib3R0bGUlMjBtaW5pbWFsfGVufDF8fHx8MTc2MDYxMTY3OHww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.4,
    price: 42.00,
    type: 'White Wine',
    grape: 'Riesling',
  },
  {
    id: '14',
    name: 'Barolo Riserva',
    image: 'https://images.unsplash.com/photo-1586124288020-1d7436afd010?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjB3aW5lJTIwYm90dGxlJTIwbWluaW1hbHxlbnwxfHx8fDE3NjA2MTE2Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.7,
    price: 165.00,
    type: 'Red Wine',
    grape: 'Nebbiolo',
  },
  {
    id: '15',
    name: 'Pouilly-Fumé',
    image: 'https://images.unsplash.com/photo-1630771496884-46ce7c270a52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGFtcGFnbmUlMjBib3R0bGV8ZW58MXx8fHwxNzYwNTc5NjA0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.3,
    price: 52.00,
    type: 'White Wine',
    grape: 'Sauvignon Blanc',
  },
  {
    id: '16',
    name: 'Ridge Monte Bello',
    image: 'https://images.unsplash.com/photo-1672140940042-1f2e27cf64df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5lJTIwYm90dGxlJTIwaXNvbGF0ZWR8ZW58MXx8fHwxNzYwNTk0NDM1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.6,
    price: 195.00,
    type: 'Red Wine',
    grape: 'Cabernet Sauvignon',
  },
];

export default function App() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [cart, setCart] = useState<string[]>([]);

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(activeFilter === filterId ? null : filterId);
  };

  const handleAddToCart = (wineId: string) => {
    setCart([...cart, wineId]);
  };

  const handleCartClick = () => {
    alert(`장바구니에 ${cart.length}개의 상품이 있습니다.`);
  };

  const cartTotal = cart.reduce((total, wineId) => {
    const wine = wineData.find(w => w.id === wineId);
    return total + (wine?.price || 0);
  }, 0);

  return (
    <div className="min-h-screen relative" style={{ width: '1080px', margin: '0 auto' }}>
      {/* Background with gradient and noise */}
      <div className="fixed inset-0 bg-gradient-radial" style={{ width: '1080px', margin: '0 auto' }} />
      <div className="fixed inset-0 noise-overlay" style={{ width: '1080px', margin: '0 auto' }} />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <KioskHeader
          filters={filters}
          activeFilter={activeFilter}
          onFilterClick={handleFilterClick}
        />

        {/* Main Content */}
        <main className="pt-[260px] pb-[40px] px-6">
          <div className="grid grid-cols-4 gap-2.5">
            {wineData.map((wine) => (
              <WineCard
                key={wine.id}
                {...wine}
                onAddToCart={() => handleAddToCart(wine.id)}
              />
            ))}
          </div>
        </main>

        {/* Floating Cart Button */}
        <button
          onClick={handleCartClick}
          className="fixed bottom-8 right-8 w-20 h-20 text-white rounded-full transition-all flex items-center justify-center z-50 hover:scale-110 cart-button-gradient"
          style={{
            boxShadow: '0 8px 32px rgba(196, 30, 58, 0.6), 0 0 20px rgba(255, 215, 0, 0.3)'
          }}
        >
          <ShoppingCart className="w-9 h-9" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-br from-[#ffd700] to-[#ffed4e] text-[#1C0E10] text-xs w-7 h-7 rounded-full flex items-center justify-center shadow-lg">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .bg-gradient-radial {
          background: radial-gradient(ellipse at center, #2F161A 0%, #1C0E10 100%);
        }
        
        .noise-overlay {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E");
          pointer-events: none;
          mix-blend-mode: overlay;
        }
        
        .cart-button-gradient {
          background: linear-gradient(135deg, #c41e3a 0%, #8b1538 50%, #c41e3a 100%);
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
        }
        
        .cart-button-gradient:hover {
          background: linear-gradient(135deg, #e0284d 0%, #a01d44 50%, #e0284d 100%);
          background-size: 200% 200%;
        }
        
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
