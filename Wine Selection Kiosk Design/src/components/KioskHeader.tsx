import { FilterCard } from "./FilterCard";

interface KioskHeaderProps {
  filters: Array<{ id: string; label: string; image: string }>;
  activeFilter: string | null;
  onFilterClick: (filterId: string) => void;
}

export function KioskHeader({
  filters,
  activeFilter,
  onFilterClick,
}: KioskHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#d4af37] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      {/* Background with gradient and noise */}
      <div className="absolute inset-0 bg-gradient-radial-header" />
      <div className="absolute inset-0 noise-overlay-header" />

      <div className="max-w-[1080px] mx-auto relative z-10">
        {/* Logo Section */}
        <div className="text-center py-6">
          <div className="mb-2">
            <svg
              width="60"
              height="40"
              viewBox="0 0 60 40"
              className="mx-auto"
            >
              <path
                d="M30 5 L25 15 L20 10 L15 15 L20 20 L25 15 L30 25 L35 15 L40 20 L45 15 L40 10 L35 15 L30 5 Z"
                fill="#d4af37"
              />
            </svg>
          </div>
          <h1 className="text-[#f5f0e8] tracking-[0.3em] mb-1 text-4xl header-title-font">
            FINE WINE SELECTION
          </h1>
          <p className="text-[#a08967] text-sm italic">
            Our finest choice, Affordable
          </p>
        </div>

        {/* Filter Cards - Horizontal Scroll */}
        <div className="px-6 pb-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter) => (
              <FilterCard
                key={filter.id}
                label={filter.label}
                image={filter.image}
                active={activeFilter === filter.id}
                onClick={() => onFilterClick(filter.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
        
        .header-title-font {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
        }
        
        .bg-gradient-radial-header {
          background: radial-gradient(ellipse at center, #2F161A 0%, #1C0E10 100%);
        }
        
        .noise-overlay-header {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.3' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.35'/%3E%3C/svg%3E");
          pointer-events: none;
          mix-blend-mode: overlay;
        }
      `}</style>
    </header>
  );
}