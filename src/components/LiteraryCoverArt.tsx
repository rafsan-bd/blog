import React from 'react';
import type { LiteraryArticle, AnthologyVolume } from '../store/literaryCatalog';
import { toBengaliDigits } from '../store/catalog';

interface ArticleCoverProps {
  motif: LiteraryArticle['coverMotif'];
  customCoverUrl?: string;
  categoryBn: string;
  volumeTitle: string;
  className?: string;
}

export const ArticleCoverArt: React.FC<ArticleCoverProps> = ({
  motif,
  customCoverUrl,
  categoryBn,
  volumeTitle,
  className = 'h-64',
}) => {
  if (customCoverUrl && customCoverUrl.trim().length > 5) {
    return (
      <div className={`relative w-full overflow-hidden bg-[#E2E8F0] ${className}`}>
        <img
          src={customCoverUrl}
          alt={categoryBn}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-[11px] text-white/95 font-medium">
          <span>{categoryBn}</span>
          <span>{volumeTitle}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden select-none border-b border-[#E2E8F0] ${className}`}
    >
      {motif === 'manuscript-lantern' && (
        <svg viewBox="0 0 480 300" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="ml-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0F766E" />
              <stop offset="55%" stopColor="#115E59" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <radialGradient id="ml-glow" cx="68%" cy="42%" r="42%">
              <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.55" />
              <stop offset="55%" stopColor="#38BDF8" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0F766E" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="480" height="300" fill="url(#ml-bg)" />
          <rect width="480" height="300" fill="url(#ml-glow)" />
          {/* Archival geometric frame */}
          <rect x="18" y="18" width="444" height="264" rx="4" fill="none" stroke="#38BDF8" strokeOpacity="0.35" strokeWidth="1" />
          <rect x="24" y="24" width="432" height="252" rx="2" fill="none" stroke="#E0F2FE" strokeOpacity="0.18" strokeWidth="0.75" />
          {/* Islamic Arch silhouette */}
          <path
            d="M260 276 V125 C260 78 326 52 326 52 C326 52 392 78 392 125 V276 Z"
            fill="#042F2E"
            fillOpacity="0.6"
            stroke="#5EEAD4"
            strokeOpacity="0.38"
            strokeWidth="1.2"
          />
          {/* Hanging Brass Lantern */}
          <line x1="326" y1="24" x2="326" y2="82" stroke="#FCD34D" strokeWidth="1.5" strokeOpacity="0.8" />
          <path d="M308 82 H344 L352 100 H300 Z" fill="#D97706" />
          <rect x="304" y="100" width="44" height="58" rx="6" fill="#FEF08A" fillOpacity="0.9" stroke="#F59E0B" strokeWidth="2" />
          <path d="M300 158 H352 L338 174 H314 Z" fill="#B45309" />
          {/* Open Manuscript Book on Rehal */}
          <path d="M76 226 L168 206 L260 226 L168 242 Z" fill="#0F172A" />
          <path d="M82 216 Q125 196 168 214 L168 158 Q125 140 82 158 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
          <path d="M254 216 Q211 196 168 214 L168 158 Q211 140 254 158 Z" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.2" />
          {/* Manuscript Ruling Lines */}
          <line x1="96" y1="170" x2="154" y2="166" stroke="#0F766E" strokeWidth="1.4" strokeOpacity="0.6" />
          <line x1="96" y1="182" x2="154" y2="178" stroke="#475569" strokeWidth="1.4" strokeOpacity="0.6" />
          <line x1="96" y1="194" x2="146" y2="191" stroke="#475569" strokeWidth="1.4" strokeOpacity="0.6" />
          <line x1="182" y1="166" x2="240" y2="170" stroke="#0284C7" strokeWidth="1.4" strokeOpacity="0.6" />
          <line x1="182" y1="178" x2="240" y2="182" stroke="#475569" strokeWidth="1.4" strokeOpacity="0.6" />
          <line x1="182" y1="191" x2="232" y2="194" stroke="#475569" strokeWidth="1.4" strokeOpacity="0.6" />
        </svg>
      )}

      {motif === 'inkwell-scroll' && (
        <svg viewBox="0 0 480 300" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="is-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ECFEFF" />
              <stop offset="100%" stopColor="#E0F2FE" />
            </linearGradient>
          </defs>
          <rect width="480" height="300" fill="url(#is-bg)" />
          <rect x="18" y="18" width="444" height="264" fill="none" stroke="#0284C7" strokeOpacity="0.24" strokeWidth="1" />
          {/* Decorative Rosette */}
          <circle cx="370" cy="110" r="64" fill="#0F766E" fillOpacity="0.08" stroke="#0F766E" strokeOpacity="0.25" strokeWidth="1" />
          <circle cx="370" cy="110" r="44" fill="none" stroke="#0284C7" strokeOpacity="0.28" strokeDasharray="3 3" />
          {/* Unrolled Scroll */}
          <rect x="64" y="64" width="220" height="168" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          <rect x="54" y="58" width="240" height="14" rx="7" fill="#0F766E" />
          <rect x="54" y="224" width="240" height="14" rx="7" fill="#115E59" />
          <line x1="88" y1="98" x2="246" y2="98" stroke="#0F766E" strokeWidth="2" strokeOpacity="0.65" />
          <line x1="88" y1="118" x2="256" y2="118" stroke="#475569" strokeWidth="1.5" strokeOpacity="0.45" />
          <line x1="88" y1="136" x2="248" y2="136" stroke="#475569" strokeWidth="1.5" strokeOpacity="0.45" />
          <line x1="88" y1="154" x2="236" y2="154" stroke="#475569" strokeWidth="1.5" strokeOpacity="0.45" />
          <line x1="88" y1="172" x2="210" y2="172" stroke="#0284C7" strokeWidth="1.5" strokeOpacity="0.45" />
          {/* Inkwell & Qalam */}
          <path d="M322 198 H378 L388 238 H312 Z" fill="#0F766E" stroke="#115E59" strokeWidth="1.5" />
          <rect x="332" y="184" width="36" height="14" rx="3" fill="#0284C7" />
          <path d="M352 184 L416 78 L424 83 L360 186 Z" fill="#0F172A" />
        </svg>
      )}

      {motif === 'jasmine-notebook' && (
        <svg viewBox="0 0 480 300" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="jn-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0F766E" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
          <rect width="480" height="300" fill="url(#jn-bg)" />
          <rect x="20" y="20" width="440" height="260" fill="none" stroke="#E2E8F0" strokeOpacity="0.22" />
          {/* Crescent Moon & Dawn Window */}
          <path d="M295 45 H415 V225 H295 Z" fill="#1E293B" stroke="#38BDF8" strokeOpacity="0.38" />
          <path d="M366 78 A24 24 0 1 0 390 112 A19 19 0 1 1 366 78 Z" fill="#FDE68A" fillOpacity="0.9" />
          {/* Poetry Notebook */}
          <rect x="64" y="76" width="186" height="156" rx="5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          <line x1="157" y1="76" x2="157" y2="232" stroke="#CBD5E1" strokeWidth="1.2" />
          <line x1="82" y1="108" x2="140" y2="108" stroke="#0F766E" strokeWidth="1.6" strokeOpacity="0.7" />
          <line x1="82" y1="124" x2="136" y2="124" stroke="#475569" strokeWidth="1.3" strokeOpacity="0.45" />
          <line x1="82" y1="140" x2="142" y2="140" stroke="#475569" strokeWidth="1.3" strokeOpacity="0.45" />
          <line x1="172" y1="108" x2="232" y2="108" stroke="#0284C7" strokeWidth="1.6" strokeOpacity="0.7" />
          <line x1="172" y1="124" x2="226" y2="124" stroke="#475569" strokeWidth="1.3" strokeOpacity="0.45" />
          <line x1="172" y1="140" x2="230" y2="140" stroke="#475569" strokeWidth="1.3" strokeOpacity="0.45" />
          {/* White Shiuli / Jasmine Blossoms */}
          <circle cx="235" cy="212" r="11" fill="#FFFFFF" />
          <circle cx="235" cy="212" r="4" fill="#F59E0B" />
          <circle cx="262" cy="224" r="9" fill="#FFFFFF" />
          <circle cx="262" cy="224" r="3.5" fill="#F59E0B" />
        </svg>
      )}

      {motif === 'archway-dome' && (
        <svg viewBox="0 0 480 300" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
          <rect width="480" height="300" fill="#F0FDFA" />
          <rect x="18" y="18" width="444" height="264" fill="none" stroke="#0F766E" strokeOpacity="0.25" />
          {/* Modern Teal & Sky Courtyard Archways */}
          <path d="M70 264 V130 C70 82 140 58 140 58 C140 58 210 82 210 130 V264 Z" fill="#CCFBF1" stroke="#0F766E" strokeOpacity="0.4" strokeWidth="1.5" />
          <path d="M170 264 V110 C170 54 250 32 250 32 C250 32 330 54 330 110 V264 Z" fill="#E0F2FE" stroke="#0284C7" strokeOpacity="0.45" strokeWidth="1.5" />
          <path d="M290 264 V136 C290 88 355 64 355 64 C355 64 420 88 420 136 V264 Z" fill="#CCFBF1" stroke="#0F766E" strokeOpacity="0.4" strokeWidth="1.5" />
          <circle cx="250" cy="115" r="22" fill="#0284C7" fillOpacity="0.18" />
        </svg>
      )}

      {motif === 'compass-chronicle' && (
        <svg viewBox="0 0 480 300" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
          <rect width="480" height="300" fill="#0F172A" />
          <rect x="18" y="18" width="444" height="264" fill="none" stroke="#38BDF8" strokeOpacity="0.3" />
          {/* Astrolabe / Compass */}
          <circle cx="240" cy="150" r="88" fill="none" stroke="#2DD4BF" strokeOpacity="0.45" strokeWidth="1.5" />
          <circle cx="240" cy="150" r="64" fill="none" stroke="#38BDF8" strokeOpacity="0.35" strokeDasharray="4 4" />
          <polygon points="240,70 252,142 240,132 228,142" fill="#2DD4BF" />
          <polygon points="240,230 252,158 240,168 228,158" fill="#0284C7" />
          <circle cx="240" cy="150" r="8" fill="#FFFFFF" />
        </svg>
      )}

      {motif === 'olive-branch' && (
        <svg viewBox="0 0 480 300" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
          <rect width="480" height="300" fill="#F1F5F9" />
          <rect x="18" y="18" width="444" height="264" fill="none" stroke="#0F766E" strokeOpacity="0.22" />
          {/* Botanical Olive Branch & Manuscript Card */}
          <rect x="92" y="54" width="296" height="192" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
          <path d="M140 198 Q240 130 340 96" fill="none" stroke="#0F766E" strokeWidth="2.5" />
          <ellipse cx="190" cy="155" rx="18" ry="8" transform="rotate(-28 190 155)" fill="#0F766E" fillOpacity="0.8" />
          <ellipse cx="235" cy="130" rx="18" ry="8" transform="rotate(-25 235 130)" fill="#0D9488" fillOpacity="0.88" />
          <ellipse cx="285" cy="110" rx="18" ry="8" transform="rotate(-20 285 110)" fill="#0F766E" fillOpacity="0.8" />
          <ellipse cx="220" cy="162" rx="17" ry="7.5" transform="rotate(20 220 162)" fill="#0284C7" fillOpacity="0.65" />
          <ellipse cx="270" cy="138" rx="17" ry="7.5" transform="rotate(18 270 138)" fill="#0284C7" fillOpacity="0.65" />
        </svg>
      )}

      {/* Subtle caption footer */}
      <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-[11px] tracking-wide px-2.5 py-1 rounded bg-[#0F172A]/75 text-white backdrop-blur-[2px]">
        <span>{categoryBn}</span>
        <span className="opacity-85">{volumeTitle}</span>
      </div>
    </div>
  );
};

interface VolumeCoverVisualProps {
  volume: AnthologyVolume;
}

export const VolumeCoverVisual: React.FC<VolumeCoverVisualProps> = ({ volume }) => {
  const paletteMap = {
    'emerald-gold': {
      bg: 'from-[#0F766E] via-[#115E59] to-[#042F2E]',
      border: 'border-[#5EEAD4]/40',
      accent: 'text-[#99F6E4]',
      badgeBg: 'bg-[#5EEAD4]/15 text-[#CCFBF1]',
    },
    'terracotta-arch': {
      bg: 'from-[#0369A1] via-[#075985] to-[#0C4A6E]',
      border: 'border-[#7DD3FC]/40',
      accent: 'text-[#BAE6FD]',
      badgeBg: 'bg-[#7DD3FC]/15 text-[#E0F2FE]',
    },
    'midnight-lantern': {
      bg: 'from-[#1E293B] via-[#0F172A] to-[#020617]',
      border: 'border-[#38BDF8]/40',
      accent: 'text-[#7DD3FC]',
      badgeBg: 'bg-[#38BDF8]/15 text-[#E0F2FE]',
    },
    'parchment-classic': {
      bg: 'from-[#312E81] via-[#1E1B4B] to-[#0F172A]',
      border: 'border-[#A5B4FC]/40',
      accent: 'text-[#C7D2FE]',
      badgeBg: 'bg-[#A5B4FC]/15 text-[#E0E7FF]',
    },
  };

  const theme = paletteMap[volume.coverTheme] || paletteMap['emerald-gold'];

  return (
    <div className="relative mx-auto w-full max-w-[230px] aspect-[3/4.2] rounded-r-lg rounded-l-[3px] shadow-[0_14px_28px_-8px_rgba(15,23,42,0.32)] overflow-hidden select-none group-hover:-translate-y-1 transition-transform duration-300">
      {/* Hardcover Book Spine Crease */}
      <div className="absolute inset-y-0 left-0 w-3.5 bg-gradient-to-r from-black/45 via-white/10 to-black/20 z-20" />

      {/* Cover Canvas */}
      <div className={`w-full h-full bg-gradient-to-br ${theme.bg} p-4 pl-6 flex flex-col justify-between text-white relative`}>
        {/* Inner Filigree Frame */}
        <div className={` inset-3 left-5 absolute border ${theme.border} rounded-[2px] pointer-events-none`} />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between text-[10px] tracking-wider uppercase opacity-90">
          <span>একটুখানি সাহিত্যের পরশ</span>
          <span className={`px-1.5 py-0.5 rounded text-[9px] ${theme.badgeBg}`}>
            {volume.volumeNumberBn}
          </span>
        </div>

        {/* Center Title Plate */}
        <div className="relative z-10 my-auto py-3 text-center border-y border-white/15">
          <p className={`text-[10px] mb-1 ${theme.accent}`}>{volume.themeTaglineBn}</p>
          <h4 className="font-editorial text-lg font-bold leading-snug text-white">
            {volume.titleBn}
          </h4>
          <p className="text-[11px] text-white/75 mt-1.5 line-clamp-2 leading-relaxed">
            {volume.subtitleBn}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 text-center">
          <p className="text-[10px] text-white/80">
            মোট পৃষ্ঠা: {toBengaliDigits(volume.pageCount)} · {volume.publishedSeasonBn}
          </p>
        </div>
      </div>
    </div>
  );
};
