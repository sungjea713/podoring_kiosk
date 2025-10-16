import { ImageWithFallback } from './figma/ImageWithFallback';

interface FilterCardProps {
  label: string;
  image: string;
  active?: boolean;
  onClick?: () => void;
}

export function FilterCard({ label, image, active, onClick }: FilterCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 relative rounded-lg overflow-hidden transition-all ${
        active ? 'ring-2 ring-[#d4af37]' : ''
      }`}
      style={{ aspectRatio: '2/1', width: '160px' }}
    >
      {/* Background Image */}
      <ImageWithFallback
        src={image}
        alt={label}
        className="absolute inset-0 w-full h-full object-cover brightness-50"
      />
      
      {/* Label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[#f5f0e8] uppercase tracking-wider px-4 text-center">
          {label}
        </span>
      </div>
    </button>
  );
}
