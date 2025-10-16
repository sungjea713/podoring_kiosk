import { Star, ShoppingCart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface WineCardProps {
  id: string;
  name: string;
  image: string;
  rating: number;
  price: number;
  type: string;
  grape: string;
  onAddToCart?: () => void;
}

export function WineCard({ name, image, rating, price, type, grape, onAddToCart }: WineCardProps) {
  return (
    <div className="bg-[#f5f0e8] rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 flex-1 flex flex-col">
        {/* Wine Image */}
        <div className="aspect-square mb-3 overflow-hidden">
          <ImageWithFallback
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Wine Info */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-[#3d2618] mb-1 line-clamp-2">{name}</h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-4 h-4 fill-[#d4af37] text-[#d4af37]" />
            <span className="text-[#3d2618]">{rating.toFixed(1)}</span>
          </div>
          
          {/* Type & Grape */}
          <div className="text-xs text-[#8b6f47] mb-2">
            <div>{type}</div>
            <div>{grape}</div>
          </div>
          
          {/* Price */}
          <div className="text-[#3d2618] mt-auto mb-3">${price.toFixed(2)}</div>
        </div>
      </div>
      
      {/* Add to Cart Button */}
      <div className="px-3 pb-3">
        <button
          onClick={onAddToCart}
          className="w-full bg-[#6b2c2c] text-[#f5f0e8] py-3 rounded-lg hover:bg-[#8b3a3a] transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>ADD TO CART</span>
        </button>
      </div>
    </div>
  );
}
