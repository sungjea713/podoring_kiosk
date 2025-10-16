import { Search, ShoppingCart } from 'lucide-react';

interface KioskFooterProps {
  cartItemCount: number;
  totalPrice: number;
  onSearchClick: () => void;
  onCartClick: () => void;
}

export function KioskFooter({ cartItemCount, totalPrice, onSearchClick, onCartClick }: KioskFooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#4a3225]">
      {/* Background with gradient and noise */}
      <div className="absolute inset-0 bg-gradient-radial-footer" />
      <div className="absolute inset-0 noise-overlay-footer" />
      
      <div className="max-w-[1080px] mx-auto px-6 py-4 relative z-10">
        <div className="flex gap-4">
          {/* Search Button */}
          <button
            onClick={onSearchClick}
            className="flex-1 bg-[#3d2618] text-[#f5f0e8] py-4 rounded-lg hover:bg-[#4a3225] transition-colors flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            <span>와인 검색</span>
          </button>
          
          {/* Cart Button */}
          <button
            onClick={onCartClick}
            className="flex-1 bg-[#6b2c2c] text-[#f5f0e8] py-4 rounded-lg hover:bg-[#8b3a3a] transition-colors flex items-center justify-center gap-2 relative"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>장바구니</span>
            {cartItemCount > 0 && (
              <>
                <span className="absolute top-2 right-2 bg-[#d4af37] text-[#2b1810] text-xs w-6 h-6 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
                <span className="ml-2">${totalPrice.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <style>{`
        .bg-gradient-radial-footer {
          background: radial-gradient(ellipse at center, #2F161A 0%, #1C0E10 100%);
        }
        
        .noise-overlay-footer {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E");
          pointer-events: none;
          mix-blend-mode: overlay;
        }
      `}</style>
    </footer>
  );
}
