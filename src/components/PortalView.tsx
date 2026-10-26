import React, { useState } from 'react';
import { SurfaceThemeId, ArenaLayoutId } from '../game/rules';

interface PortalViewProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  lang: 'en' | 'de';
  onToggleLang: () => void;
  surfaceTheme: SurfaceThemeId;
  onChangeSurface: (s: SurfaceThemeId) => void;
  arenaLayout: ArenaLayoutId;
  onChangeLayout: (l: ArenaLayoutId) => void;
  onPlayQuick: () => void;
  onOpenPenFightHome: () => void;
  onOpenArmoryDirect: () => void;
  isSignedIn: boolean;
  playerCallsign: string;
  avatarColor: string;
  playerStreak: number;
  onOpenProfile: () => void;
}

const COPY = {
  en: {
    studioBadge: 'ATELIER DRAFT ORIGINAL · 100% CREATOR RIGHTS',
    heroTitle: 'Nib & Knock',
    heroSub: 'Tactile Stationery Physics Duels',
    heroLead:
      'An original tabletop physics arena crafted for precision flicks, spin-torque bank shots, and high-impact stationery duels.',
    playNow: 'Launch Quick Duel',
    openArmory: 'Custom Armory & Table Setup',
    studioHub: 'Atelier Desk Mode',
    surfaceLabel: 'Tabletop Surface',
    hazardLabel: 'Arena Layout',
    rightsBtn: 'Creator Rights & License',
    surfaceWalnut: 'Luthier Walnut',
    surfaceBlueprint: 'Cyanotype Blueprint',
    surfaceMat: 'Studio Cutting Mat',
    layoutClassic: 'Open Board',
    layoutBumpers: 'Brass & Eraser Bumpers',
    layoutFortress: 'Corner Pin Fortress',
    controlsHint:
      'Drag Pen to Aim & Release to Flick · Keys 1–5 Grab Point · Arrows Aim · O Overdrive · Space Flick · Esc Pause',
    signInLabel: 'Sign In · Record Stats',
  },
  de: {
    studioBadge: 'ATELIER DRAFT ORIGINAL · 100% URHEBERRECHTE',
    heroTitle: 'Nib & Knock',
    heroSub: 'Taktile Schreibwaren-Physikduelle',
    heroLead:
      'Eine eigenständige Tabletop-Physik-Arena für präzise Schnipser, Effet-Bandenschüsse und spannende Duelle am Zeichentisch.',
    playNow: 'Schnelles Duell starten',
    openArmory: 'Waffenkammer & Tisch-Setup',
    studioHub: 'Atelier-Ansicht',
    surfaceLabel: 'Tischoberfläche',
    hazardLabel: 'Arena-Hindernisse',
    rightsBtn: 'Urheberrecht & Lizenz',
    surfaceWalnut: 'Edles Walnussholz',
    surfaceBlueprint: 'Architektur-Blaupause',
    surfaceMat: 'Studio-Schneidematte',
    layoutClassic: 'Offenes Brett',
    layoutBumpers: 'Messing- & Radierer-Bumper',
    layoutFortress: 'Eckpin-Festung',
    controlsHint:
      'Stift ziehen & loslassen · Tasten 1–5 Griffpunkt · Pfeile Zielen · O Overdrive · Leertaste Schnipsen · Esc Pause',
    signInLabel: 'Anmelden · Profil speichern',
  },
};

export const PortalView: React.FC<PortalViewProps> = ({
  theme,
  onToggleTheme,
  lang,
  onToggleLang,
  surfaceTheme,
  onChangeSurface,
  arenaLayout,
  onChangeLayout,
  onPlayQuick,
  onOpenPenFightHome,
  onOpenArmoryDirect,
  isSignedIn,
  playerCallsign,
  avatarColor,
  playerStreak,
  onOpenProfile,
}) => {
  const t = COPY[lang];
  const [showRightsModal, setShowRightsModal] = useState(false);

  return (
    <div className="nk-title-stage" data-theme={theme} data-surface={surfaceTheme}>
      {/* Top-Right Compact Utility Controls */}
      <div className="nk-stage-utilities">
        <button
          type="button"
          className={`nk-util-btn nk-auth-trigger ${isSignedIn ? 'signed-in' : ''}`}
          onClick={onOpenProfile}
          aria-label={isSignedIn ? `Open player dossier for ${playerCallsign}` : t.signInLabel}
        >
          <span
            className="nk-auth-dot"
            style={{ backgroundColor: isSignedIn ? avatarColor : '#94a3b8' }}
            aria-hidden="true"
          />
          <span>
            {isSignedIn
              ? `${playerCallsign}${playerStreak > 0 ? ` · ${playerStreak}W` : ''}`
              : t.signInLabel}
          </span>
        </button>
        <button
          type="button"
          className="nk-util-btn"
          onClick={onToggleLang}
          aria-label={lang === 'en' ? 'Switch language to German' : 'Switch language to English'}
        >
          <span>{lang === 'en' ? 'DE' : 'EN'}</span>
        </button>
        <button
          type="button"
          className="nk-util-btn"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light studio lighting' : 'Switch to dark studio lighting'}
        >
          <span>{theme === 'dark' ? 'Light Studio' : 'Night Lamp'}</span>
        </button>
        <button
          type="button"
          className="nk-util-btn nk-rights-trigger"
          onClick={() => setShowRightsModal(true)}
        >
          <span>© Creator Rights</span>
        </button>
      </div>

      {/* Main Split Stage: Left Title Lockup & Actions (Calm Negative Space) | Right Interactive Drafting Centerpiece */}
      <main className="nk-stage-grid">
        <section className="nk-stage-left" aria-labelledby="nk-main-title">
          {/* Custom Inline SVG Title Emblem Lockup */}
          <div className="nk-emblem-lockup">
            <svg
              viewBox="0 0 460 116"
              className="nk-title-svg"
              role="img"
              aria-labelledby="nk-main-title"
            >
              <title id="nk-main-title">{t.heroTitle} — {t.heroSub}</title>
              {/* Architect caliper frame */}
              <path
                d="M12 24 L28 10 H432 L448 24 V92 L432 106 H28 L12 92 Z"
                fill="#162235"
                stroke="#e5a93c"
                strokeWidth="3"
              />
              <path
                d="M20 28 L32 17 H428 L440 28 V88 L428 99 H32 L20 88 Z"
                fill="none"
                stroke="rgba(229,169,60,0.35)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              {/* Crossed Drafting Nib & Brass Compass Icon */}
              <g transform="translate(52, 58)">
                <circle cx="0" cy="0" r="28" fill="#0f172a" stroke="#e5a93c" strokeWidth="2.5" />
                <path
                  d="M-14 14 L8 -18 L18 -14 L14 -4 L-14 14 Z"
                  fill="#f4cf5a"
                  stroke="#0f172a"
                  strokeWidth="2"
                />
                <circle cx="5" cy="-7" r="2.6" fill="#0f172a" />
                <path d="M16 -15 L5 -7" stroke="#0f172a" strokeWidth="2" />
                <path
                  d="M-16 -12 L16 14"
                  stroke="#67e8f9"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </g>
              {/* Custom SVG Display Wordmark */}
              <text
                x="98"
                y="62"
                fill="#f7f2e7"
                fontFamily="var(--font-title)"
                fontSize="44"
                fontWeight="700"
                letterSpacing="1"
              >
                NIB &amp; KNOCK
              </text>
              <text
                x="100"
                y="86"
                fill="#e5a93c"
                fontFamily="var(--font-body)"
                fontSize="12.5"
                fontWeight="800"
                letterSpacing="3.2"
              >
                ATELIER TABLETOP PHYSICS DUELS
              </text>
            </svg>
          </div>

          <p className="nk-stage-lead">{t.heroLead}</p>

          {/* Interactive Surface & Hazard Quick-Selectors */}
          <div className="nk-quick-config">
            <div className="nk-config-group">
              <span className="nk-config-label">{t.surfaceLabel}</span>
              <div className="nk-seg-row" role="group" aria-label={t.surfaceLabel}>
                <button
                  type="button"
                  className={`nk-seg-btn ${surfaceTheme === 'walnut' ? 'active' : ''}`}
                  onClick={() => onChangeSurface('walnut')}
                >
                  {t.surfaceWalnut}
                </button>
                <button
                  type="button"
                  className={`nk-seg-btn ${surfaceTheme === 'blueprint' ? 'active' : ''}`}
                  onClick={() => onChangeSurface('blueprint')}
                >
                  {t.surfaceBlueprint}
                </button>
                <button
                  type="button"
                  className={`nk-seg-btn ${surfaceTheme === 'cuttingmat' ? 'active' : ''}`}
                  onClick={() => onChangeSurface('cuttingmat')}
                >
                  {t.surfaceMat}
                </button>
              </div>
            </div>

            <div className="nk-config-group">
              <span className="nk-config-label">{t.hazardLabel}</span>
              <div className="nk-seg-row" role="group" aria-label={t.hazardLabel}>
                <button
                  type="button"
                  className={`nk-seg-btn ${arenaLayout === 'classic' ? 'active' : ''}`}
                  onClick={() => onChangeLayout('classic')}
                >
                  {t.layoutClassic}
                </button>
                <button
                  type="button"
                  className={`nk-seg-btn ${arenaLayout === 'bumpers' ? 'active' : ''}`}
                  onClick={() => onChangeLayout('bumpers')}
                >
                  {t.layoutBumpers}
                </button>
                <button
                  type="button"
                  className={`nk-seg-btn ${arenaLayout === 'fortress' ? 'active' : ''}`}
                  onClick={() => onChangeLayout('fortress')}
                >
                  {t.layoutFortress}
                </button>
              </div>
            </div>
          </div>

          {/* <= 3 Primary Menu Actions */}
          <div className="nk-cta-cluster">
            <button
              type="button"
              className="nk-btn-primary"
              data-start="true"
              onClick={onPlayQuick}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path d="M6 4 L20 12 L6 20 Z" fill="#111827" />
              </svg>
              <span>{t.playNow}</span>
            </button>

            <button
              type="button"
              className="nk-btn-secondary"
              onClick={onOpenArmoryDirect}
            >
              <span>{t.openArmory}</span>
            </button>

            <button
              type="button"
              className="nk-btn-ghost"
              onClick={onOpenPenFightHome}
            >
              <span>{t.studioHub}</span>
            </button>
          </div>
        </section>

        {/* Right Column: Interactive Drafting Table Centerpiece */}
        <section className="nk-stage-right" aria-label="Interactive Drafting Table Preview">
          <div
            className="nk-centerpiece-card"
            onClick={onPlayQuick}
            role="presentation"
          >
            <svg
              viewBox="0 0 740 460"
              className="nk-drafting-svg"
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <radialGradient id="nk-lamp-glow" cx="50%" cy="46%" r="55%">
                  <stop offset="0%" stopColor="#fde68a" stopOpacity="0.28" />
                  <stop offset="65%" stopColor="#38bdf8" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#090d16" stopOpacity="0" />
                </radialGradient>
                <pattern id="nk-grid-pat" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path
                    d="M 32 0 L 0 0 0 32"
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>

              {/* Outer Studio Backdrop */}
              <rect width="740" height="460" rx="26" fill="#0d1524" />
              <rect
                x="28"
                y="26"
                width="684"
                height="408"
                rx="28"
                fill={
                  surfaceTheme === 'blueprint'
                    ? '#112a46'
                    : surfaceTheme === 'cuttingmat'
                    ? '#194538'
                    : '#4a2e1b'
                }
                stroke="#e5a93c"
                strokeWidth="4"
              />
              <rect x="28" y="26" width="684" height="408" rx="28" fill="url(#nk-grid-pat)" />
              <rect x="28" y="26" width="684" height="408" rx="28" fill="url(#nk-lamp-glow)" />

              {/* Architect Protractor & Compass Rose Inlay */}
              <g transform="translate(370, 230)" stroke="rgba(229,169,60,0.32)" fill="none">
                <circle r="138" strokeWidth="1.8" strokeDasharray="8 6" />
                <circle r="92" strokeWidth="1.4" />
                <line x1="-185" y1="0" x2="185" y2="0" strokeWidth="1.4" />
                <line x1="0" y1="-155" x2="0" y2="155" strokeWidth="1.4" />
              </g>

              {/* Preview Obstacles when selected */}
              {arenaLayout === 'bumpers' && (
                <g>
                  <circle cx="370" cy="230" r="22" fill="#e5a93c" stroke="#111827" strokeWidth="3.5" />
                  <circle cx="370" cy="230" r="9" fill="#fef08a" />
                  <circle cx="370" cy="118" r="24" fill="#f472b6" stroke="#111827" strokeWidth="3.5" />
                  <circle cx="370" cy="342" r="24" fill="#38bdf8" stroke="#111827" strokeWidth="3.5" />
                </g>
              )}
              {arenaLayout === 'fortress' && (
                <g fill="#e5a93c" stroke="#111827" strokeWidth="3">
                  <circle cx="136" cy="96" r="15" />
                  <circle cx="604" cy="96" r="15" />
                  <circle cx="136" cy="364" r="15" />
                  <circle cx="604" cy="364" r="15" />
                </g>
              )}

              {/* Left Instrument: Sovereign Gold Nib / Kuro-Gel */}
              <g transform="translate(245, 226) rotate(-22)">
                <rect x="-115" y="-13" width="210" height="26" rx="11" fill="#38bdf8" stroke="#0f172a" strokeWidth="4" />
                <rect x="45" y="-14" width="44" height="28" rx="5" fill="#1e3a8a" stroke="#0f172a" strokeWidth="3.5" />
                <path d="M95 -11 L132 0 L95 11 Z" fill="#f4cf5a" stroke="#0f172a" strokeWidth="3.5" />
                <line x1="-90" y1="-5" x2="32" y2="-5" stroke="#e0f2fe" strokeWidth="3.5" strokeLinecap="round" />
              </g>

              {/* Dynamic Clash Spark Starburst */}
              <g transform="translate(370, 210)">
                <path
                  d="M0 -32 L7 -9 L30 -16 L14 3 L28 22 L4 14 L-6 34 L-11 11 L-32 16 L-15 -3 L-26 -22 L-5 -12 Z"
                  fill="#fde047"
                  stroke="#0f172a"
                  strokeWidth="3"
                />
              </g>

              {/* Right Instrument: Aero-Hex / Titanium Billet */}
              <g transform="translate(495, 240) rotate(162)">
                <g className="wobble">
                  <rect x="-115" y="-12" width="210" height="24" rx="10" fill="#fb923c" stroke="#0f172a" strokeWidth="4" />
                  <rect x="48" y="-13" width="42" height="26" rx="5" fill="#9a3412" stroke="#0f172a" strokeWidth="3.5" />
                  <path d="M95 -10 L130 0 L95 10 Z" fill="#f7f2e7" stroke="#0f172a" strokeWidth="3.5" />
                  <line x1="-88" y1="-4" x2="35" y2="-4" stroke="#ffedd5" strokeWidth="3" strokeLinecap="round" />
                </g>
              </g>

              {/* Brass Corner Brackets */}
              <path d="M32 64 V30 H66" stroke="#e5a93c" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M708 64 V30 H674" stroke="#e5a93c" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M32 396 V430 H66" stroke="#e5a93c" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M708 396 V430 H674" stroke="#e5a93c" strokeWidth="6" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </section>
      </main>

      {/* Single flat, borderless inline control hint at bottom safe margin */}
      <footer className="nk-bottom-hint">
        <span>{t.controlsHint}</span>
      </footer>

      {/* Creator Rights & Original IP Modal */}
      {showRightsModal && (
        <div
          className="pf-modal-backdrop"
          onClick={() => setShowRightsModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="rights-title"
        >
          <div className="pf-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 id="rights-title" className="pf-modal-title">
              Original Creator Edition · 100% Creator Rights
            </h2>
            <p className="pf-modal-sub">
              <strong>Nib &amp; Knock: Atelier Tabletop Physics Duels</strong> is an original, bespoke creation with
              full creator ownership and zero third-party brand dependencies.
            </p>
            <div className="pf-info-notes">
              <p>
                <strong>Original Armory:</strong> 8 custom-engineered drafting &amp; calligraphy instruments with
                Artisan 3D, Cel-Vector, and Cyanotype Blueprint schematics.
              </p>
              <p>
                <strong>Studio Physics &amp; Hazards:</strong> Custom 2D rigid-body torque engine with Brass Compass
                Weights, Gum Eraser bumpers, Corner Fortress pins, and Momentum Overdrive strikes.
              </p>
              <p>
                <strong>Creator License:</strong> All code, rules, vector graphics, and synthesized audio belong 100%
                to the creator for unrestricted commercial or personal publishing.
              </p>
            </div>
            <div className="pf-modal-actions">
              <button
                type="button"
                className="pf-chunky-btn primary"
                onClick={() => setShowRightsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
