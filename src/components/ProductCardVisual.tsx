import React from 'react';
import { FINISH_OPTIONS, FinishId } from '../store/catalog';

interface ProductCardVisualProps {
  productId: string;
  finish: FinishId;
  customImageUrl?: string;
  altTitle?: string;
}

const KNOWN_BUILT_IN_IDS = new Set([
  'food-ajwa-01',
  'food-honey-02',
  'food-kalojira-03',
  'food-ghee-04',
  'food-talbina-05',
  'food-kacchi-06',
  'food-olive-07',
  'food-iftar-08',
]);

export const ProductCardVisual: React.FC<ProductCardVisualProps> = ({
  productId,
  finish,
  customImageUrl,
  altTitle,
}) => {
  const finishMeta = FINISH_OPTIONS[finish] || FINISH_OPTIONS.brass;
  const badgeColor = finishMeta.hex;
  const isCustomSvgFallback = !KNOWN_BUILT_IN_IDS.has(productId);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#F4FAF6] via-[#ECF5EF] to-[#E3EFE7] select-none p-4">
      {/* Subtle Islamic Geometric Rosette Watermark in Background */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none"
        aria-hidden="true"
      >
        <g stroke="#14532D" strokeWidth="1" fill="none">
          <circle cx="100" cy="100" r="82" />
          <circle cx="100" cy="100" r="58" strokeDasharray="4 3" />
          <rect x="48" y="48" width="104" height="104" rx="6" />
          <rect
            x="48"
            y="48"
            width="104"
            height="104"
            rx="6"
            transform="rotate(45 100 100)"
          />
        </g>
      </svg>

      {customImageUrl && customImageUrl.trim().length > 0 ? (
        <img
          src={customImageUrl}
          alt={altTitle || productId}
          className="relative z-10 w-full h-full max-h-44 object-contain rounded-lg drop-shadow-sm transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
      /* Main Culinary Illustration */
      <svg
        viewBox="0 0 260 200"
        className="relative z-10 w-full h-full max-h-48 drop-shadow-sm transition-transform duration-300 group-hover:scale-[1.03]"
        role="img"
        aria-label={`${altTitle || productId} illustration`}
      >
        <defs>
          <linearGradient id={`goldGrad-${productId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
          <linearGradient id={`honeyGrad-${productId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="55%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <linearGradient id={`emeraldGrad-${productId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#166534" />
            <stop offset="100%" stopColor="#0F291A" />
          </linearGradient>
          <linearGradient id={`jarGlass-${productId}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Soft Tabletop Shadow */}
        <ellipse cx="130" cy="174" rx="76" ry="11" fill="#0F2419" opacity="0.1" />

        {/* 1. MADINAH VIP AJWA DATES */}
        {productId === 'food-ajwa-01' && (
          <g>
            {/* Decorative Date Palm Frond Behind */}
            <path
              d="M52 145 Q38 92 78 52 M56 125 L38 112 M60 105 L42 90 M66 86 L50 70 M72 68 L62 52"
              stroke="#15803D"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.55"
            />
            {/* Sealed Glass Jar of Ajwa on Left */}
            <rect
              x="56"
              y="66"
              width="66"
              height="94"
              rx="12"
              fill="#2A1215"
              stroke="#D97706"
              strokeWidth="1.5"
            />
            {/* Lid */}
            <rect
              x="62"
              y="54"
              width="54"
              height="14"
              rx="4"
              fill={`url(#goldGrad-${productId})`}
            />
            {/* Dates visible inside jar */}
            <ellipse cx="76" cy="95" rx="12" ry="8" fill="#451A1C" />
            <ellipse cx="98" cy="96" rx="12" ry="8" fill="#3B1518" />
            <ellipse cx="86" cy="112" rx="13" ry="8" fill="#521E22" />
            <ellipse cx="75" cy="130" rx="12" ry="8" fill="#3B1518" />
            <ellipse cx="100" cy="132" rx="12" ry="8" fill="#451A1C" />
            {/* Front Label on Jar */}
            <rect
              x="64"
              y="92"
              width="50"
              height="38"
              rx="4"
              fill="#FAFDF8"
              stroke="#D97706"
              strokeWidth="1"
            />
            <text
              x="89"
              y="108"
              textAnchor="middle"
              fontSize="8"
              fontWeight="700"
              fill="#14532D"
            >
              AJWA VIP
            </text>
            <text
              x="89"
              y="120"
              textAnchor="middle"
              fontSize="7"
              fontWeight="600"
              fill="#92400E"
            >
              AL-MADINAH
            </text>
            {/* Glass Highlight */}
            <rect
              x="56"
              y="66"
              width="66"
              height="94"
              rx="12"
              fill={`url(#jarGlass-${productId})`}
            />

            {/* Brass Platter of Whole Jumbo Ajwa Dates on Right */}
            <ellipse
              cx="166"
              cy="154"
              rx="52"
              ry="14"
              fill={`url(#goldGrad-${productId})`}
            />
            <ellipse cx="166" cy="150" rx="46" ry="11" fill="#451A03" />
            {/* Individual Plump Dark Burgundy-Ebony Ajwa Dates */}
            <g>
              <ellipse cx="144" cy="144" rx="15" ry="9.5" fill="#2E1014" />
              <ellipse cx="141" cy="142" rx="8" ry="3" fill="#6B2730" opacity="0.55" />
              <circle cx="131" cy="144" r="2" fill="#D97706" />

              <ellipse cx="170" cy="146" rx="16" ry="10" fill="#230B0E" />
              <ellipse cx="167" cy="143" rx="9" ry="3.2" fill="#5E2028" opacity="0.55" />
              <circle cx="184" cy="146" r="2" fill="#D97706" />

              <ellipse cx="190" cy="141" rx="14" ry="9" fill="#381419" />
              <ellipse cx="188" cy="139" rx="7" ry="2.5" fill="#782E38" opacity="0.5" />

              <ellipse cx="156" cy="134" rx="15" ry="9.5" fill="#3B1519" />
              <ellipse cx="154" cy="131" rx="8" ry="3" fill="#7F323C" opacity="0.55" />
              <circle cx="143" cy="134" r="2" fill="#F59E0B" />

              <ellipse cx="178" cy="133" rx="15" ry="9.5" fill="#2A0E12" />
              <ellipse cx="176" cy="130" rx="7" ry="2.8" fill="#6B2730" opacity="0.55" />
            </g>
          </g>
        )}

        {/* 2. SUNDARBANS RAW KHALISHA HONEY */}
        {productId === 'food-honey-02' && (
          <g>
            {/* Golden Honeycomb Hexagon Accent Behind */}
            <g stroke="#D97706" strokeWidth="1.2" fill="#FEF3C7" opacity="0.75">
              <polygon points="182,62 194,55 206,62 206,76 194,83 182,76" />
              <polygon points="194,83 206,76 218,83 218,97 206,104 194,97" />
              <polygon points="170,83 182,76 194,83 194,97 182,104 170,97" />
            </g>
            {/* Honey Dipper Stick Dripping Golden Honey */}
            <line
              x1="196"
              y1="38"
              x2="152"
              y2="92"
              stroke="#92400E"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <ellipse
              cx="150"
              cy="94"
              rx="12"
              ry="8"
              transform="rotate(-38 150 94)"
              fill="#B45309"
              stroke="#FEF3C7"
              strokeWidth="1.2"
            />
            {/* Honey Drip */}
            <path
              d="M148 102 Q144 118 148 126 Q152 118 148 102 Z"
              fill="#F59E0B"
            />

            {/* Main Artisanal Glass Honey Jar */}
            <rect
              x="76"
              y="62"
              width="78"
              height="102"
              rx="18"
              fill={`url(#honeyGrad-${productId})`}
              stroke="#B45309"
              strokeWidth="1.5"
            />
            {/* Submerged Raw Honeycomb Slab Inside Jar */}
            <rect
              x="92"
              y="82"
              width="24"
              height="64"
              rx="6"
              fill="#FDE68A"
              opacity="0.45"
            />
            {/* Gold Metal Jar Lid & Cloth Tie */}
            <rect
              x="84"
              y="48"
              width="62"
              height="16"
              rx="5"
              fill={`url(#goldGrad-${productId})`}
            />
            {/* Jar Label */}
            <rect
              x="86"
              y="94"
              width="58"
              height="42"
              rx="6"
              fill="#FAFDF8"
              stroke="#D97706"
              strokeWidth="1"
            />
            <text
              x="115"
              y="111"
              textAnchor="middle"
              fontSize="8"
              fontWeight="700"
              fill="#92400E"
            >
              SUNDARBANS
            </text>
            <text
              x="115"
              y="123"
              textAnchor="middle"
              fontSize="7.5"
              fontWeight="700"
              fill="#14532D"
            >
              KHALISHA HONEY
            </text>
            {/* Glass Specular Shine */}
            <rect
              x="76"
              y="62"
              width="78"
              height="102"
              rx="18"
              fill={`url(#jarGlass-${productId})`}
            />
          </g>
        )}

        {/* 3. COLD-PRESSED KALOJIRA (BLACK SEED) OIL */}
        {productId === 'food-kalojira-03' && (
          <g>
            {/* UV Amber Apothecary Glass Bottle */}
            <path
              d="M96 42 H124 V58 L142 78 V160 C142 166 137 170 130 170 H90 C83 170 78 166 78 160 V78 L96 58 Z"
              fill="#3B1D0A"
              stroke="#B45309"
              strokeWidth="1.5"
            />
            {/* Golden Tamper-Proof Cap */}
            <rect
              x="95"
              y="30"
              width="30"
              height="14"
              rx="3"
              fill={`url(#goldGrad-${productId})`}
            />
            {/* Bottle Label */}
            <rect
              x="84"
              y="90"
              width="52"
              height="54"
              rx="5"
              fill="#FAFDF8"
              stroke="#14532D"
              strokeWidth="1.2"
            />
            <circle cx="110" cy="105" r="7" fill="#14532D" />
            <circle cx="110" cy="105" r="3" fill="#FBBF24" />
            <text
              x="110"
              y="124"
              textAnchor="middle"
              fontSize="7.5"
              fontWeight="700"
              fill="#0F2419"
            >
              KALOJIRA OIL
            </text>
            <text
              x="110"
              y="135"
              textAnchor="middle"
              fontSize="6.5"
              fontWeight="600"
              fill="#92400E"
            >
              100% COLD PRESSED
            </text>
            {/* Small Brass Bowl of Black Seeds (Kalojira) on Right */}
            <ellipse
              cx="176"
              cy="154"
              rx="34"
              ry="12"
              fill={`url(#goldGrad-${productId})`}
            />
            <ellipse cx="176" cy="149" rx="29" ry="9" fill="#111827" />
            {/* Individual Black Seed Specks */}
            <circle cx="166" cy="148" r="1.5" fill="#9CA3AF" />
            <circle cx="175" cy="146" r="1.5" fill="#9CA3AF" />
            <circle cx="184" cy="149" r="1.5" fill="#9CA3AF" />
            <circle cx="171" cy="151" r="1.5" fill="#9CA3AF" />
            <circle cx="180" cy="147" r="1.5" fill="#9CA3AF" />
            {/* Golden Oil Bowl */}
            <ellipse
              cx="178"
              cy="118"
              rx="22"
              ry="9"
              fill="#FEF3C7"
              stroke="#D97706"
              strokeWidth="1.5"
            />
            <ellipse cx="178" cy="118" rx="17" ry="6" fill="#D97706" />
          </g>
        )}

        {/* 4. PABNA ARTISANAL DANADAR GAWA GHEE */}
        {productId === 'food-ghee-04' && (
          <g>
            {/* Traditional Rounded Artisanal Ghee Jar */}
            <path
              d="M78 74 C64 94 66 144 82 164 H158 C174 144 176 94 162 74 Z"
              fill={`url(#honeyGrad-${productId})`}
              stroke="#92400E"
              strokeWidth="1.6"
            />
            {/* Granular Danadar Texture Dots */}
            <g fill="#FEF08A" opacity="0.55">
              <circle cx="90" cy="92" r="2.2" />
              <circle cx="104" cy="86" r="2" />
              <circle cx="142" cy="90" r="2.4" />
              <circle cx="152" cy="108" r="2" />
              <circle cx="84" cy="138" r="2.5" />
              <circle cx="148" cy="144" r="2.2" />
              <circle cx="118" cy="152" r="2" />
            </g>
            {/* Neck & Brass Lid */}
            <rect
              x="84"
              y="56"
              width="72"
              height="18"
              rx="6"
              fill={`url(#goldGrad-${productId})`}
            />
            {/* Wooden Spoon Resting Above */}
            <path
              d="M96 44 L182 36 C192 35 196 42 186 46 L96 50 Z"
              fill="#78350F"
            />
            <ellipse cx="102" cy="46" rx="14" ry="6" fill="#FBBF24" />
            {/* Front Emblem Label */}
            <rect
              x="86"
              y="98"
              width="68"
              height="42"
              rx="6"
              fill="#FAFDF8"
              stroke="#92400E"
              strokeWidth="1.2"
            />
            <text
              x="120"
              y="115"
              textAnchor="middle"
              fontSize="8.5"
              fontWeight="700"
              fill="#78350F"
            >
              PABNA GAWA GHEE
            </text>
            <text
              x="120"
              y="128"
              textAnchor="middle"
              fontSize="7"
              fontWeight="600"
              fill="#14532D"
            >
              100% DANADAR PURE
            </text>
          </g>
        )}

        {/* 5. PROPHETIC SUNNAH BARLEY TALBINA MIX */}
        {productId === 'food-talbina-05' && (
          <g>
            {/* Golden Barley Stalks Behind */}
            <path
              d="M56 148 Q48 96 74 48 M198 148 Q208 96 182 48"
              stroke="#D97706"
              strokeWidth="2.2"
              fill="none"
            />
            {/* Ceramic Sunnah Bowl */}
            <path
              d="M64 106 H196 C194 148 168 168 130 168 C92 168 66 148 64 106 Z"
              fill={`url(#emeraldGrad-${productId})`}
              stroke="#D97706"
              strokeWidth="2"
            />
            {/* Decorative Gold Rim Band on Bowl */}
            <line
              x1="66"
              y1="116"
              x2="194"
              y2="116"
              stroke="#FBBF24"
              strokeWidth="2"
            />
            {/* Creamy Roasted Barley Talbina Surface */}
            <ellipse
              cx="130"
              cy="106"
              rx="66"
              ry="18"
              fill="#FEF9C3"
              stroke="#D97706"
              strokeWidth="1.5"
            />
            {/* Honey Swirl on Top */}
            <path
              d="M92 106 Q115 96 132 106 T168 104"
              stroke="#D97706"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            {/* Sliced Almonds, Pistachios & Chopped Ajwa Garnish */}
            <ellipse cx="112" cy="103" rx="7" ry="3.5" fill="#B45309" />
            <ellipse cx="146" cy="108" rx="7" ry="3.5" fill="#B45309" />
            <ellipse cx="128" cy="100" rx="5" ry="2.8" fill="#15803D" />
            <ellipse cx="136" cy="111" rx="5" ry="2.8" fill="#15803D" />
            <circle cx="120" cy="109" r="3.5" fill="#451A1C" />
            <circle cx="154" cy="102" r="3.5" fill="#451A1C" />
          </g>
        )}

        {/* 6. OLD DHAKA SHAHI KACCHI & CHINIGURA FEAST KIT */}
        {productId === 'food-kacchi-06' && (
          <g>
            {/* Traditional Copper/Brass Shahi Handi (Patil) */}
            <path
              d="M68 98 H192 C202 126 184 166 130 166 C76 166 58 126 68 98 Z"
              fill={`url(#goldGrad-${productId})`}
              stroke="#78350F"
              strokeWidth="1.8"
            />
            {/* Handi Rim */}
            <ellipse
              cx="130"
              cy="98"
              rx="64"
              ry="16"
              fill="#78350F"
              stroke="#FBBF24"
              strokeWidth="1.5"
            />
            {/* Fragrant Saffron & White Chinigura Rice Mound */}
            <path
              d="M72 98 Q130 62 188 98 Z"
              fill="#FFFBEB"
              stroke="#F59E0B"
              strokeWidth="1"
            />
            {/* Saffron Rice Streaks, Golden Potato & Mutton Pieces, Star Anise */}
            <circle cx="114" cy="88" r="8" fill="#B45309" />
            <circle cx="146" cy="86" r="9" fill="#78350F" />
            <circle cx="130" cy="80" r="6" fill="#991B1B" />
            <ellipse cx="102" cy="94" rx="5" ry="2.5" fill="#15803D" />
            <ellipse cx="158" cy="93" rx="5" ry="2.5" fill="#15803D" />
            {/* Rising Aromatic Steam Waves */}
            <path
              d="M112 64 Q106 50 114 38 M132 60 Q126 46 134 34 M150 64 Q144 50 152 38"
              stroke="#D97706"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.55"
            />
          </g>
        )}

        {/* 7. PALESTINIAN EXTRA VIRGIN OLIVE OIL (ZAYTUN) */}
        {productId === 'food-olive-07' && (
          <g>
            {/* Olive Branch with Leaves & Olives */}
            <path
              d="M148 130 Q180 96 202 58"
              stroke="#14532D"
              strokeWidth="2.5"
              fill="none"
            />
            <ellipse
              cx="172"
              cy="94"
              rx="10"
              ry="4"
              transform="rotate(-30 172 94)"
              fill="#15803D"
            />
            <ellipse
              cx="188"
              cy="76"
              rx="10"
              ry="4"
              transform="rotate(-30 188 76)"
              fill="#15803D"
            />
            <ellipse cx="166" cy="108" rx="6" ry="8" fill="#3F6212" />
            <ellipse cx="182" cy="90" rx="6" ry="8" fill="#365314" />

            {/* Tall Palestinian Olive Oil Glass Decanter */}
            <path
              d="M98 36 H122 V56 L138 78 V162 C138 167 134 170 128 170 H92 C86 170 82 167 82 162 V78 L98 56 Z"
              fill="#365314"
              stroke="#D97706"
              strokeWidth="1.5"
            />
            <rect
              x="97"
              y="24"
              width="26"
              height="13"
              rx="3"
              fill={`url(#goldGrad-${productId})`}
            />
            {/* Label */}
            <rect
              x="88"
              y="88"
              width="44"
              height="56"
              rx="4"
              fill="#FAFDF8"
              stroke="#D97706"
              strokeWidth="1"
            />
            <text
              x="110"
              y="108"
              textAnchor="middle"
              fontSize="7.5"
              fontWeight="700"
              fill="#14532D"
            >
              PALESTINE
            </text>
            <text
              x="110"
              y="120"
              textAnchor="middle"
              fontSize="8"
              fontWeight="700"
              fill="#365314"
            >
              ZAYTUN
            </text>
            <text
              x="110"
              y="132"
              textAnchor="middle"
              fontSize="6.5"
              fontWeight="600"
              fill="#92400E"
            >
              EXTRA VIRGIN
            </text>
          </g>
        )}

        {/* 8. RAHMAT FAMILY IFTAR & SUNNAH GIFT HAMPER */}
        {productId === 'food-iftar-08' && (
          <g>
            {/* Open Luxury Emerald & Gold Gift Hamper Box */}
            <rect
              x="54"
              y="74"
              width="152"
              height="92"
              rx="10"
              fill={`url(#emeraldGrad-${productId})`}
              stroke="#D97706"
              strokeWidth="2"
            />
            {/* Inner Gold Partition Grid */}
            <rect
              x="62"
              y="82"
              width="136"
              height="76"
              rx="6"
              fill="#FEF9C3"
              stroke="#D97706"
              strokeWidth="1.2"
            />
            {/* 3 Visible Jars Inside Hamper */}
            {/* Left: Ajwa Jar */}
            <rect x="70" y="90" width="36" height="58" rx="6" fill="#3B1518" />
            <rect x="74" y="85" width="28" height="7" rx="2" fill="#D97706" />
            <rect x="74" y="106" width="28" height="20" rx="2" fill="#FAFDF8" />
            {/* Center: Honey Jar */}
            <rect x="112" y="90" width="36" height="58" rx="6" fill="#D97706" />
            <rect x="116" y="85" width="28" height="7" rx="2" fill="#92400E" />
            <rect x="116" y="106" width="28" height="20" rx="2" fill="#FAFDF8" />
            {/* Right: Ghee / Kalojira Jar */}
            <rect x="154" y="90" width="36" height="58" rx="6" fill="#F59E0B" />
            <rect x="158" y="85" width="28" height="7" rx="2" fill="#14532D" />
            <rect x="158" y="106" width="28" height="20" rx="2" fill="#FAFDF8" />

            {/* Golden Ribbon & Crescent Top Badge */}
            <path
              d="M104 74 L130 52 L156 74 Z"
              fill={`url(#goldGrad-${productId})`}
            />
            <circle cx="130" cy="66" r="11" fill="#14532D" stroke="#FDE68A" strokeWidth="1.5" />
            <text
              x="130"
              y="69"
              textAnchor="middle"
              fontSize="7"
              fontWeight="700"
              fill="#FDE68A"
            >
              HADIA
            </text>
          </g>
        )}

        {/* DEFAULT ARTISANAL SUNNAH FOOD JAR FOR NEW USER-ADDED PRODUCTS */}
        {isCustomSvgFallback && (
          <g>
            <rect
              x="86"
              y="58"
              width="88"
              height="106"
              rx="16"
              fill={`url(#emeraldGrad-${productId})`}
              stroke="#D97706"
              strokeWidth="1.8"
            />
            <rect
              x="96"
              y="44"
              width="68"
              height="16"
              rx="5"
              fill={`url(#goldGrad-${productId})`}
            />
            <rect
              x="98"
              y="88"
              width="64"
              height="48"
              rx="6"
              fill="#FAFDF8"
              stroke="#D97706"
              strokeWidth="1.2"
            />
            <text
              x="130"
              y="108"
              textAnchor="middle"
              fontSize="8.5"
              fontWeight="700"
              fill="#14532D"
            >
              BARAKAH
            </text>
            <text
              x="130"
              y="122"
              textAnchor="middle"
              fontSize="7.5"
              fontWeight="700"
              fill="#92400E"
            >
              HALAL FOOD
            </text>
            <rect
              x="86"
              y="58"
              width="88"
              height="106"
              rx="16"
              fill={`url(#jarGlass-${productId})`}
            />
          </g>
        )}
      </svg>
      )}

      {/* Subtle Bottom-Right Selected Pack Indicator */}
      <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 text-[11px] font-medium text-[#14532D] bg-white/90 px-2.5 py-1 rounded-md border border-[#DCE6DF]">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: badgeColor }}
        />
        <span>{finishMeta.banglaWeight}</span>
      </div>
    </div>
  );
};
