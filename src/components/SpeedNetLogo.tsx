import React from 'react';

interface SpeedNetLogoProps {
  variant?: 'mark' | 'full' | 'inline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  subtitle?: string;
}

export const SpeedNetSymbol: React.FC<{ className?: string; size?: number }> = ({ 
  className = 'w-8 h-8',
  size = 40 
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      aria-label="SpeedNet TLCOM Logo"
    >
      {/* Ponto 1: Azul Petróleo Superior Esquerdo */}
      <circle cx="39" cy="15" r="5.5" fill="#246083" />

      {/* Ponto 2: Terracota Pequeno Superior */}
      <circle cx="52" cy="16.5" r="6" fill="#BA4920" />

      {/* Ponto 3: Terracota Médio Superior Direito */}
      <circle cx="68" cy="27" r="7.5" fill="#BA4920" />

      {/* Ponto 4: Terracota Grande Lateral Direito */}
      <circle cx="76" cy="51" r="8.5" fill="#BA4920" />

      {/* Espiral Característica SpeedNet */}
      <path
        d="M 72 50
           C 72 66, 62 76, 48 76
           C 32 76, 22 64, 22 49
           C 22 34, 34 26, 48 26
           C 61 26, 68 34, 68 45
           C 68 56, 59 63, 49 63
           C 40 63, 34 56, 34 48
           C 34 40, 41 37, 47 37
           C 53 37, 56 42, 56 48
           C 56 53, 52 56, 48 56
           C 44 56, 43 53, 44 50"
        stroke="#BA4920"
        strokeWidth="6.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export const SpeedNetLogo: React.FC<SpeedNetLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  theme = 'auto',
  subtitle
}) => {
  // Tamanhos do símbolo
  const symbolSizes = {
    xs: 22,
    sm: 28,
    md: 36,
    lg: 48,
    xl: 64,
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const badgeSizes = {
    xs: 'text-[9px] px-1 py-0.2',
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1',
    xl: 'text-base px-3 py-1',
  };

  const currentSize = symbolSizes[size];

  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <SpeedNetSymbol size={currentSize} className="w-auto h-auto drop-shadow-sm" />
      </div>
    );
  }

  // Cores conforme o tema (light para fundos claros, dark para fundos escuros do sidebar)
  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Símbolo Espiral */}
      <div className="shrink-0 transition-transform duration-200 hover:scale-105">
        <SpeedNetSymbol size={currentSize} className="drop-shadow-sm" />
      </div>

      {/* Tipografia SpeedNet + TLCOM */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span 
            className={`font-extrabold tracking-tight leading-none ${textSizes[size]} ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
          >
            SpeedNet
          </span>
          <span
            className={`bg-[#BA4920] text-white font-black tracking-wider uppercase rounded-md shadow-xs leading-none ${badgeSizes[size]}`}
          >
            TLCOM
          </span>
        </div>

        {subtitle && (
          <span className={`text-[10px] uppercase font-bold tracking-widest mt-0.5 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default SpeedNetLogo;
