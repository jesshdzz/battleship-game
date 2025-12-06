// client/src/components/ShipIcons.tsx
import { type ShipType } from '../types';

export const ShipIcon = ({ type, className }: { type: ShipType, className?: string }) => {
  // SVG simples que representan los barcos visto desde arriba
  const getPath = () => {
    switch (type) {
      case 'carrier': // 5 celdas
        return <path d="M2 10 L5 2 L25 2 L28 10 L25 18 L5 18 Z M10 5 L10 15 M20 5 L20 15" />;
      case 'battleship': // 4 celdas
        return <path d="M2 10 L8 2 L24 2 L28 10 L24 18 L8 18 Z M12 6 L12 14 M18 6 L18 14" />;
      case 'cruiser': // 3 celdas
        return <path d="M2 10 L6 4 L24 4 L28 10 L24 16 L6 16 Z M14 4 L14 16" />;
      case 'submarine': // 3 celdas
        return <path d="M4 10 C4 4 10 4 12 4 L26 4 C28 4 28 16 26 16 L12 16 C10 16 4 16 4 10 Z M12 2 L12 8" />;
      case 'destroyer': // 2 celdas
        return <path d="M2 10 L8 4 L24 4 L24 16 L8 16 Z" />;
      default: return null;
    }
  };

  return (
    <svg viewBox="0 0 30 20" className={`fill-current ${className}`} xmlns="http://www.w3.org/2000/svg">
      {getPath()}
    </svg>
  );
};