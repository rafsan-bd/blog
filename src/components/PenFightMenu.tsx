import React, { useState } from 'react';
import { PenId, PenStyle, InkColor, getPenSvg } from '../game/penAssets';
import {
  PEN_ORDER,
  PEN_ROSTER,
  AiLevel,
  ArenaLayoutId,
  SurfaceThemeId,
} from '../game/rules';

export type MenuSubScreen = 'home' | 'mode' | 'picker';
export type PlayMode = 'computer' | 'hotseat';

export interface MatchSettings {
  mode: PlayMode;
  p0Pen: PenId;
  p1Pen: PenId;
  p0Ink: InkColor;
  p1Ink: InkColor;
  penStyle: PenStyle;
  aiLevel: AiLevel;
  equalLevels: boolean;
  mirrorMatch: boolean;
  arenaLayout: ArenaLayoutId;
  surfaceTheme: SurfaceThemeId;
}

export interface PlayerRecord {
  played: number;
  won: number;
  lost: number;
  draws: number;
  streak: number;
  bestStreak: number;
}

interface PenFightMenuProps {
  subScreen: MenuSubScreen;
  onChangeSubScreen: (s: MenuSubScreen) => void;
  settings: MatchSettings;
  onUpdateSettings: (next: Partial<MatchSettings>) => void;
  onStartMatch: () => void;
  onBackToPortal: () => void;
  record: PlayerRecord;
  muted: boolean;
  onToggleMute: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isSignedIn: boolean;
  playerCallsign: string;
  avatarColor: string;
  onOpenProfile: () => void;
}

const STAT_LABELS = ['Weight', 'Speed', 'Spin', 'Grip', 'Reach'];

const INK_OPTIONS: { id: InkColor; label: string; hex: string }[] = [
  { id: 'blue', label: 'Cobalt', hex: '#38bdf8' },
  { id: 'violet', label: 'Amethyst', hex: '#a78bfa' },
  { id: 'green', label: 'Emerald', hex: '#34d399' },
];

export const PenFightMenu: React.FC<PenFightMenuProps> = ({
  subScreen,
  onChangeSubScreen,
  settings,
  onUpdateSettings,
  onStartMatch,
  onBackToPortal,
  record,
  muted,
  onToggleMute,
  theme,
  onToggleTheme,
  isSignedIn,
  playerCallsign,
  avatarColor,
  onOpenProfile,
}) => {
  const [activePlayerPick, setActivePlayerPick] = useState<0 | 1>(0);
  const [modalOpen, setModalOpen] = useState<
    null | 'info' | 'leaderboard' | 'stats' | 'settings' | 'rights'
  >(null);

  const currentPenId = activePlayerPick === 0 ? settings.p0Pen : settings.p1Pen;
  const currentInk = activePlayerPick === 0 ? settings.p0Ink : settings.p1Ink;
  const currentPenIdx = PEN_ORDER.indexOf(currentPenId);
  const currentPenCfg = PEN_ROSTER[currentPenId];

  const cyclePen = (delta: number) => {
    const nextIdx = (currentPenIdx + delta + PEN_ORDER.length) % PEN_ORDER.length;
    const nextPen = PEN_ORDER[nextIdx];
    if (activePlayerPick === 0) {
      onUpdateSettings({
        p0Pen: nextPen,
        ...(settings.mirrorMatch ? { p1Pen: nextPen } : {}),
      });
    } else {
      onUpdateSettings({ p1Pen: nextPen });
    }
  };

  const selectInk = (ink: InkColor) => {
    if (activePlayerPick === 0) {
      onUpdateSettings({ p0Ink: ink });
    } else {
      onUpdateSettings({ p1Ink: ink });
    }
  };

  return (
    <div className="pf-wood-screen" data-surface={settings.surfaceTheme}>
      {subScreen === 'home' && (
        <div className="pf-home-layout">
          {/* Top-left Studio Return & Record */}
          <div className="pf-home-top-left">
            <button
              type="button"
              className="pf-avatar-btn"
              aria-label={isSignedIn ? `${playerCallsign} Cloud Dossier` : 'Sign In & Player Dossier'}
              onClick={onOpenProfile}
            >
              <svg viewBox="0 0 40 40" width="38" height="38" aria-hidden="true">
                <circle cx="20" cy="20" r="18" fill="#1e293b" stroke={avatarColor} strokeWidth="2.5" />
                <circle cx="20" cy="15" r="6" fill="#f7f2e7" />
                <path d="M9 33 C9 25 31 25 31 33" fill="#f7f2e7" />
                <circle
                  cx="32"
                  cy="8"
                  r="4.5"
                  fill={isSignedIn ? '#34d399' : '#e5a93c'}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
            <button
              type="button"
              className="pf-portal-return-btn"
              onClick={onOpenProfile}
            >
              {isSignedIn ? `● ${playerCallsign}` : 'Sign In · Sync'}
            </button>
            <button
              type="button"
              className="pf-portal-return-btn"
              onClick={onBackToPortal}
            >
              ← Studio Stage
            </button>
          </div>

          {/* Top-right Settings button */}
          <button
            type="button"
            className="pf-home-more-btn"
            aria-label="Studio Settings"
            onClick={() => setModalOpen('settings')}
          >
            <svg viewBox="0 0 44 44" width="42" height="42" aria-hidden="true">
              <circle cx="22" cy="22" r="19" fill="#f7f2e7" stroke="#0f172a" strokeWidth="3" />
              <circle cx="22" cy="22" r="12" fill="none" stroke="#0f172a" strokeWidth="2.5" />
              <circle cx="17.5" cy="22" r="1.8" fill="#d9534f" />
              <circle cx="22" cy="22" r="1.8" fill="#e5a93c" />
              <circle cx="26.5" cy="22" r="1.8" fill="#2a6f57" />
            </svg>
          </button>

          {/* Right-side Architect Blueprint & Vellum Sheet */}
          <div className="pf-notebook-sheet" aria-hidden="true">
            <div className="pf-notebook-hole h1" />
            <div className="pf-notebook-hole h2" />
            <div className="pf-notebook-margin-top" />
          </div>

          {/* Center Title Crest + Colliding Instruments + Menu Buttons */}
          <div className="pf-home-center">
            <div className="pf-crest-lockup">
              <div className="pf-taped-tile" aria-hidden="true">
                <span className="pf-tape t-left" />
                <span className="pf-tape t-right" />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="92"
                  height="92"
                  viewBox="0 0 128 128"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="6" y="10" width="116" height="112" rx="24" fill="#c5a23d" />
                  <rect x="6" y="5" width="116" height="112" rx="24" fill="#162235" stroke="#e5a93c" />
                  <circle cx="64" cy="61" r="38" stroke="rgba(229,169,60,0.4)" strokeWidth="2" strokeDasharray="6 4" />
                  <g transform="rotate(-38 64 58)">
                    <rect x="57" y="18" width="14" height="56" rx="5" fill="#38bdf8" stroke="#0f172a" />
                    <path d="M57 70 H71 L64 86 Z" fill="#f4cf5a" stroke="#0f172a" />
                  </g>
                  <g transform="rotate(38 64 58)">
                    <rect x="57" y="18" width="14" height="56" rx="5" fill="#fb923c" stroke="#0f172a" />
                    <path d="M57 70 H71 L64 86 Z" fill="#f7f2e7" stroke="#0f172a" />
                  </g>
                </svg>
              </div>

              <h1 className="pf-wordmark">
                <span className="pf-word-pen">Nib &amp;</span>{' '}
                <span className="pf-word-fight">Knock</span>
              </h1>
              <div className="pf-series-ribbon">ORIGINAL CREATOR EDITION</div>
            </div>

            {/* Center Colliding Pens Showcase */}
            <div className="pf-bump-showcase" aria-hidden="true">
              <div
                className="pf-bump-pen pf-bump-gel"
                dangerouslySetInnerHTML={{
                  __html: getPenSvg(settings.p0Pen, settings.penStyle, settings.p0Ink, true),
                }}
              />
              <div
                className="pf-bump-pen pf-bump-ballpoint"
                dangerouslySetInnerHTML={{
                  __html: getPenSvg(settings.p1Pen, settings.penStyle, settings.p1Ink, true),
                }}
              />
              <svg viewBox="0 0 74 74" className="pf-bump-rays">
                <path
                  d="M37 9 V18 M58 16 L51 23 M66 37 H57 M16 16 L23 23 M10 37 H19 M57 57 L50 50"
                  stroke="#fde047"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Primary Actions Stack */}
            <div className="pf-home-actions">
              <button
                type="button"
                className="pf-play-cta"
                data-start="true"
                onClick={() => onChangeSubScreen('mode')}
              >
                <svg viewBox="0 0 28 28" width="24" height="24" aria-hidden="true">
                  <path
                    d="M7 5 L22 14 L7 23 Z"
                    fill="#0f172a"
                    stroke="#0f172a"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Select Mode &amp; Duel</span>
              </button>

              <div className="pf-home-tri-grid">
                <button
                  type="button"
                  className="pf-tile-btn"
                  onClick={() => setModalOpen('leaderboard')}
                >
                  <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
                    <path d="M16 4 L18 9 L23 9 L19 12 L20 17 L16 14 L12 17 L13 12 L9 9 L14 9 Z" fill="#f4cf5a" stroke="#2f3b4b" strokeWidth="2" />
                    <rect x="11" y="19" width="10" height="9" fill="#f4cf5a" stroke="#2f3b4b" strokeWidth="2" />
                    <rect x="4" y="22" width="7" height="6" fill="#9dc8ea" stroke="#2f3b4b" strokeWidth="2" />
                    <rect x="21" y="23" width="7" height="5" fill="#efa16a" stroke="#2f3b4b" strokeWidth="2" />
                  </svg>
                  <span>Hall of Fame</span>
                </button>

                <button
                  type="button"
                  className="pf-tile-btn"
                  onClick={onOpenProfile}
                >
                  <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
                    <rect x="5" y="18" width="5" height="9" rx="1.5" fill="#f4cf5a" stroke="#2f3b4b" strokeWidth="2" />
                    <rect x="13.5" y="12" width="5" height="15" rx="1.5" fill="#9dc8ea" stroke="#2f3b4b" strokeWidth="2" />
                    <rect x="22" y="7" width="5" height="20" rx="1.5" fill="#cfdf9c" stroke="#2f3b4b" strokeWidth="2" />
                  </svg>
                  <span>{isSignedIn ? 'Cloud Dossier' : 'Sign In / Record'}</span>
                </button>

                <button
                  type="button"
                  className="pf-tile-btn"
                  onClick={() => setModalOpen('settings')}
                >
                  <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
                    <circle cx="16" cy="16" r="9" fill="#cfdf9c" stroke="#2f3b4b" strokeWidth="2.2" />
                    <circle cx="16" cy="16" r="4" fill="#f6eedb" stroke="#2f3b4b" strokeWidth="2" />
                  </svg>
                  <span>Studio Audio</span>
                </button>
              </div>

              <button
                type="button"
                className="pf-feedback-bar"
                onClick={() => setModalOpen('rights')}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" fill="none" stroke="#2f3b4b" strokeWidth="2.2" />
                  <path d="M14.5 9.5 A3.5 3.5 0 1 0 14.5 14.5" fill="none" stroke="#2f3b4b" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
                <span>Original Creator Rights &amp; Open License</span>
                <span className="pf-new-badge" aria-hidden="true">
                  100% YOURS
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {subScreen === 'mode' && (
        <div className="pf-sub-container">
          <div className="pf-sub-header">
            <button
              type="button"
              className="pf-back-square"
              aria-label="Back"
              onClick={() => onChangeSubScreen('home')}
            >
              <svg viewBox="0 0 28 28" width="22" height="22" aria-hidden="true">
                <path
                  d="M21 14 H7 M13 8 L7 14 L13 20"
                  fill="none"
                  stroke="#2f3b4b"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h1 className="pf-sub-title">Choose Duel Format</h1>
          </div>

          <div className="pf-mode-cards">
            <button
              type="button"
              className="pf-mode-card"
              onClick={() => {
                onUpdateSettings({ mode: 'computer' });
                setActivePlayerPick(0);
                onChangeSubScreen('picker');
              }}
            >
              <span className="pf-mode-icon bg-blue">
                <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
                  <circle cx="24" cy="20" r="9" fill="#f6eedb" stroke="#2f3b4b" strokeWidth="2.8" />
                  <path d="M15 17 C15 11 33 11 33 17" fill="#e0661b" stroke="#2f3b4b" strokeWidth="2.5" />
                  <rect x="17" y="18" width="6" height="4" rx="1" fill="#9dc8ea" stroke="#2f3b4b" strokeWidth="2" />
                  <rect x="25" y="18" width="6" height="4" rx="1" fill="#9dc8ea" stroke="#2f3b4b" strokeWidth="2" />
                  <path d="M12 38 C12 30 36 30 36 38 Z" fill="#f6eedb" stroke="#2f3b4b" strokeWidth="2.8" />
                </svg>
              </span>
              <span className="pf-mode-text">
                <strong>vs Studio Automaton</strong>
                <span>Solo challenge against the tactical AI draftsman.</span>
              </span>
            </button>

            <button
              type="button"
              className="pf-mode-card"
              onClick={() => {
                onUpdateSettings({ mode: 'computer', arenaLayout: 'bumpers', mirrorMatch: false });
                setActivePlayerPick(0);
                onChangeSubScreen('picker');
              }}
            >
              <span className="pf-mode-icon" style={{ background: '#f4cf5a' }}>
                <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
                  <circle cx="24" cy="24" r="12" fill="#e0661b" stroke="#2f3b4b" strokeWidth="2.8" />
                  <circle cx="24" cy="24" r="5" fill="#f6eedb" stroke="#2f3b4b" strokeWidth="2" />
                  <path d="M24 6 V11 M24 37 V42 M6 24 H11 M37 24 H42" stroke="#2f3b4b" strokeWidth="2.8" strokeLinecap="round" />
                </svg>
              </span>
              <span className="pf-mode-text">
                <strong>Bumper Hazard Gauntlet</strong>
                <span>Bank shots off Brass Weights &amp; Gum Erasers.</span>
              </span>
            </button>

            <button
              type="button"
              className="pf-mode-card"
              onClick={() => {
                onUpdateSettings({ mode: 'hotseat', mirrorMatch: false });
                setActivePlayerPick(0);
                onChangeSubScreen('picker');
              }}
            >
              <span className="pf-mode-icon bg-sage">
                <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
                  <circle cx="19" cy="19" r="7" fill="#f6eedb" stroke="#2f3b4b" strokeWidth="2.6" />
                  <path d="M9 36 C9 29 29 29 29 36 Z" fill="#cfdf9c" stroke="#2f3b4b" strokeWidth="2.6" />
                  <circle cx="31" cy="21" r="6" fill="#f6eedb" stroke="#2f3b4b" strokeWidth="2.6" />
                  <path d="M23 36 C23 30 39 30 39 36 Z" fill="#9dc8ea" stroke="#2f3b4b" strokeWidth="2.6" />
                </svg>
              </span>
              <span className="pf-mode-text">
                <strong>2-Player Pass &amp; Flick</strong>
                <span>Shared tabletop on one device. Take turns to strike.</span>
              </span>
            </button>
          </div>
        </div>
      )}

      {subScreen === 'picker' && (
        <div className="pf-sub-container pf-picker-container" role="region" aria-label="Armory and Table Setup">
          <div className="pf-sub-header pf-picker-header">
            <div className="pf-sub-header-left">
              <button
                type="button"
                className="pf-back-square"
                aria-label="Back"
                onClick={() => onChangeSubScreen('mode')}
              >
                <svg viewBox="0 0 28 28" width="22" height="22" aria-hidden="true">
                  <path
                    d="M21 14 H7 M13 8 L7 14 L13 20"
                    fill="none"
                    stroke="#2f3b4b"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <h1 className="pf-sub-title">Armory &amp; Tabletop Loadout</h1>
            </div>

            <div className="pf-mode-pill-badge">
              <span>{settings.mode === 'computer' ? 'vs Automaton' : '2 Players Local'}</span>
            </div>
          </div>

          <div className="pf-picker-grid">
            {/* Left Card: Instrument Showcase, Style & Ink Customizer */}
            <article className="pf-pen-card" aria-label="Choose an instrument">
              <div className="pf-pen-card-top">
                <span className="pf-lv-pill">{currentPenCfg.codename}</span>
                <div className="pf-pen-dots" aria-hidden="true">
                  {PEN_ORDER.map((pid, idx) => (
                    <span
                      key={pid}
                      className={`pf-pen-dot ${idx === currentPenIdx ? 'is-active' : ''}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="pf-info-btn"
                  aria-label={`${currentPenCfg.name} specs`}
                  onClick={() => setModalOpen('info')}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" fill="#9dc8ea" stroke="#2f3b4b" strokeWidth="2.2" />
                    <path d="M12 11 V16 M12 8 V8.5" stroke="#2f3b4b" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="pf-pen-wood-stage" data-surface={settings.surfaceTheme}>
                <button
                  type="button"
                  className="pf-arrow-btn prev"
                  aria-label="Previous instrument"
                  onClick={() => cyclePen(-1)}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M15 6 L9 12 L15 18" fill="none" stroke="#2f3b4b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <div
                  className="pf-pen-stage-svg"
                  dangerouslySetInnerHTML={{
                    __html: getPenSvg(currentPenId, settings.penStyle, currentInk, true),
                  }}
                />

                <button
                  type="button"
                  className="pf-arrow-btn next"
                  aria-label="Next instrument"
                  onClick={() => cyclePen(1)}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M9 6 L15 12 L9 18" fill="none" stroke="#2f3b4b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <h2 className="pf-pen-name">{currentPenCfg.name}</h2>
              <p className="pf-pen-role">{currentPenCfg.role}</p>

              {/* Inline Compact Stat Bar Preview */}
              <div className="pf-inline-stats">
                {STAT_LABELS.map((lbl, idx) => (
                  <div key={lbl} className="pf-inline-stat-chip">
                    <span>{lbl}</span>
                    <strong>{currentPenCfg.stats[idx]}/5</strong>
                  </div>
                ))}
              </div>

              {/* Finish Style & Ink Color Row */}
              <div className="pf-customizer-bar">
                <div className="pf-style-toggle" role="radiogroup" aria-label="Visual finish">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={settings.penStyle === 'real'}
                    className={`pf-style-opt ${settings.penStyle === 'real' ? 'active' : ''}`}
                    onClick={() => onUpdateSettings({ penStyle: 'real' })}
                  >
                    Artisan 3D
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={settings.penStyle === 'classic'}
                    className={`pf-style-opt ${settings.penStyle === 'classic' ? 'active' : ''}`}
                    onClick={() => onUpdateSettings({ penStyle: 'classic' })}
                  >
                    Cel-Vector
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={settings.penStyle === 'blueprint'}
                    className={`pf-style-opt ${settings.penStyle === 'blueprint' ? 'active' : ''}`}
                    onClick={() => onUpdateSettings({ penStyle: 'blueprint' })}
                  >
                    Blueprint
                  </button>
                </div>

                <div className="pf-ink-swatches" role="radiogroup" aria-label="Ink trail color">
                  {INK_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={currentInk === opt.id}
                      aria-label={`${opt.label} Ink`}
                      title={`${opt.label} Ink`}
                      className={`pf-ink-swatch ${currentInk === opt.id ? 'active' : ''}`}
                      style={{ backgroundColor: opt.hex }}
                      onClick={() => selectInk(opt.id)}
                    />
                  ))}
                </div>
              </div>
            </article>

            {/* Right Column: Opponent / Surface / Arena Hazards / Launch Duel */}
            <div className="pf-picker-side">
              {settings.mode === 'computer' ? (
                <div className="pf-side-group">
                  <div className="pf-side-label">AUTOMATON PRECISION</div>
                  <div className="pf-level-row" role="group" aria-label="AI Precision Level">
                    {(['easy', 'normal', 'hard', 'master'] as AiLevel[]).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        aria-pressed={settings.aiLevel === lvl}
                        className={`pf-level-btn ${settings.aiLevel === lvl ? 'active' : ''}`}
                        onClick={() => onUpdateSettings({ aiLevel: lvl })}
                      >
                        {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pf-side-group">
                  <div className="pf-side-label">ACTIVE DRAFTSMAN SLOT</div>
                  <div className="pf-level-row">
                    <button
                      type="button"
                      className={`pf-level-btn ${activePlayerPick === 0 ? 'active' : ''}`}
                      onClick={() => setActivePlayerPick(0)}
                    >
                      P1 ({PEN_ROSTER[settings.p0Pen].name})
                    </button>
                    <button
                      type="button"
                      className={`pf-level-btn ${activePlayerPick === 1 ? 'active' : ''}`}
                      onClick={() => setActivePlayerPick(1)}
                    >
                      P2 ({PEN_ROSTER[settings.p1Pen].name})
                    </button>
                  </div>
                </div>
              )}

              {/* Tabletop Surface & Hazard Layout Selectors */}
              <div className="pf-side-group">
                <div className="pf-side-label">TABLETOP SURFACE</div>
                <div className="pf-level-row" role="group" aria-label="Tabletop surface">
                  {(
                    [
                      { id: 'walnut', label: 'Walnut' },
                      { id: 'blueprint', label: 'Blueprint' },
                      { id: 'cuttingmat', label: 'Cutting Mat' },
                    ] as { id: SurfaceThemeId; label: string }[]
                  ).map((surf) => (
                    <button
                      key={surf.id}
                      type="button"
                      aria-pressed={settings.surfaceTheme === surf.id}
                      className={`pf-level-btn ${settings.surfaceTheme === surf.id ? 'active' : ''}`}
                      onClick={() => onUpdateSettings({ surfaceTheme: surf.id })}
                    >
                      {surf.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pf-side-group">
                <div className="pf-side-label">ARENA HAZARD OBSTACLES</div>
                <div className="pf-level-row" role="group" aria-label="Arena hazard obstacles">
                  {(
                    [
                      { id: 'classic', label: 'Open Table' },
                      { id: 'bumpers', label: 'Brass Bumpers' },
                      { id: 'fortress', label: 'Corner Pins' },
                    ] as { id: ArenaLayoutId; label: string }[]
                  ).map((lay) => (
                    <button
                      key={lay.id}
                      type="button"
                      aria-pressed={settings.arenaLayout === lay.id}
                      className={`pf-level-btn ${settings.arenaLayout === lay.id ? 'active' : ''}`}
                      onClick={() => onUpdateSettings({ arenaLayout: lay.id })}
                    >
                      {lay.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pf-side-group">
                <div className="pf-side-label">DUEL CONDITIONS</div>
                <div className="pf-rules-stack">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.mirrorMatch}
                    className="pf-rule-row"
                    onClick={() => {
                      const nextMirror = !settings.mirrorMatch;
                      onUpdateSettings({
                        mirrorMatch: nextMirror,
                        p1Pen: nextMirror
                          ? settings.p0Pen
                          : settings.p0Pen === 'ballpoint'
                          ? 'gel'
                          : 'ballpoint',
                      });
                    }}
                  >
                    <span className="pf-rule-icon" aria-hidden="true">
                      <svg viewBox="0 0 28 28" width="24" height="24">
                        <rect x="6" y="5" width="4" height="16" rx="1.5" transform="rotate(-20 8 13)" fill="#efa16a" stroke="#2f3b4b" strokeWidth="2" />
                        <rect x="18" y="5" width="4" height="16" rx="1.5" transform="rotate(20 20 13)" fill="#9dc8ea" stroke="#2f3b4b" strokeWidth="2" />
                      </svg>
                    </span>
                    <span className="pf-rule-copy">
                      <strong>Identical Instruments</strong>
                      <span>Both duelists wield the same pen chassis.</span>
                    </span>
                    <span className={`pf-switch-pill ${settings.mirrorMatch ? 'on' : ''}`}>
                      <i />
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="pf-fight-cta"
                data-start="true"
                onClick={onStartMatch}
              >
                <svg viewBox="0 0 28 28" width="24" height="24" aria-hidden="true">
                  <path
                    d="M7 5 L22 14 L7 23 Z"
                    fill="#0f172a"
                    stroke="#0f172a"
                    strokeWidth="2.4"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Enter Tabletop Arena</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pen Info Modal */}
      {modalOpen === 'info' && (
        <div
          className="pf-modal-backdrop"
          onClick={() => setModalOpen(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pen-info-title"
        >
          <div className="pf-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 id="pen-info-title" className="pf-modal-title">
              {currentPenCfg.name} · {currentPenCfg.codename}
            </h2>
            <p className="pf-modal-sub">{currentPenCfg.role}</p>

            <div className="pf-stat-bars">
              {STAT_LABELS.map((label, i) => (
                <div key={label} className="pf-stat-row">
                  <span className="pf-stat-name">{label}</span>
                  <div className="pf-stat-pips" aria-label={`${label}: ${currentPenCfg.stats[i]} of 5`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className={`pf-stat-pip ${n <= currentPenCfg.stats[i] ? 'filled' : ''}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pf-info-notes">
              <p>
                <strong>Strength:</strong> {currentPenCfg.strength}
              </p>
              <p>
                <strong>Weakness:</strong> {currentPenCfg.weakness}
              </p>
              <p>
                <strong>Spin Technique:</strong> {currentPenCfg.spinTip}
              </p>
            </div>

            <div className="pf-modal-actions">
              <button type="button" className="pf-chunky-btn primary" onClick={() => setModalOpen(null)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hall of Fame Modal */}
      {modalOpen === 'leaderboard' && (
        <div
          className="pf-modal-backdrop"
          onClick={() => setModalOpen(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lb-title"
        >
          <div className="pf-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 id="lb-title" className="pf-modal-title">
              Atelier Draft Hall of Fame
            </h2>
            <p className="pf-modal-sub">Longest unbeaten tabletop streaks</p>
            <div className="pf-lb-table">
              {[
                { rank: 1, name: 'MasterKuro', pen: 'Titanium Billet Mk.IV', streak: 19 },
                { rank: 2, name: 'VellumFox', pen: 'Aero-Hex 0.7', streak: 15 },
                { rank: 3, name: 'Calipers_9', pen: 'Kuro-Gel Roller', streak: 12 },
                { rank: 4, name: 'SovereignInk', pen: 'Sovereign Gold Nib', streak: 9 },
                {
                  rank: 5,
                  name: `${playerCallsign} (You)`,
                  pen: PEN_ROSTER[settings.p0Pen].name,
                  streak: Math.max(record.bestStreak, 1),
                },
              ].map((r) => (
                <div key={r.rank} className="pf-lb-row">
                  <span className="pf-lb-rank">#{r.rank}</span>
                  <span className="pf-lb-name">{r.name}</span>
                  <span className="pf-lb-pen">{r.pen}</span>
                  <span className="pf-lb-score">{r.streak} wins</span>
                </div>
              ))}
            </div>
            <div className="pf-modal-actions">
              <button type="button" className="pf-chunky-btn primary" onClick={() => setModalOpen(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Career Stats Modal */}
      {modalOpen === 'stats' && (
        <div
          className="pf-modal-backdrop"
          onClick={() => setModalOpen(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="stats-title"
        >
          <div className="pf-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 id="stats-title" className="pf-modal-title">
              Draftsman Career Record
            </h2>
            <div className="pf-stats-grid">
              <div className="pf-stat-box">
                <span className="pf-stat-num">{record.played}</span>
                <span className="pf-stat-lbl">Duels</span>
              </div>
              <div className="pf-stat-box">
                <span className="pf-stat-num">{record.won}</span>
                <span className="pf-stat-lbl">Victories</span>
              </div>
              <div className="pf-stat-box">
                <span className="pf-stat-num">{record.streak}</span>
                <span className="pf-stat-lbl">Current Streak</span>
              </div>
              <div className="pf-stat-box">
                <span className="pf-stat-num">{record.bestStreak}</span>
                <span className="pf-stat-lbl">Best Streak</span>
              </div>
            </div>
            <div className="pf-modal-actions">
              <button type="button" className="pf-chunky-btn primary" onClick={() => setModalOpen(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Studio Settings Modal */}
      {modalOpen === 'settings' && (
        <div
          className="pf-modal-backdrop"
          onClick={() => setModalOpen(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
        >
          <div className="pf-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 id="settings-title" className="pf-modal-title">
              Studio Configuration
            </h2>
            <div className="pf-rules-stack" style={{ margin: '16px 0' }}>
              <button
                type="button"
                className="pf-rule-row"
                onClick={onToggleMute}
              >
                <span className="pf-rule-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M4 9 H8 L14 4 V20 L8 15 H4 Z" fill="#2f3b4b" />
                  </svg>
                </span>
                <span className="pf-rule-copy">
                  <strong>Tactile Sound Effects</strong>
                  <span>{muted ? 'Muted' : 'Timber clicks & clash synth enabled'}</span>
                </span>
                <span className={`pf-switch-pill ${!muted ? 'on' : ''}`}>
                  <i />
                </span>
              </button>

              <button
                type="button"
                className="pf-rule-row"
                onClick={onToggleTheme}
              >
                <span className="pf-rule-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <circle cx="12" cy="12" r="6" fill="#e5a93c" stroke="#2f3b4b" strokeWidth="2" />
                  </svg>
                </span>
                <span className="pf-rule-copy">
                  <strong>Studio Lighting ({theme === 'dark' ? 'Night Lamp' : 'Daylight'})</strong>
                  <span>Switch ambient drafting room illumination</span>
                </span>
                <span className={`pf-switch-pill ${theme === 'dark' ? 'on' : ''}`}>
                  <i />
                </span>
              </button>
            </div>
            <div className="pf-modal-actions">
              <button type="button" className="pf-chunky-btn" onClick={onBackToPortal}>
                Main Stage
              </button>
              <button type="button" className="pf-chunky-btn primary" onClick={() => setModalOpen(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creator Rights Modal */}
      {modalOpen === 'rights' && (
        <div
          className="pf-modal-backdrop"
          onClick={() => setModalOpen(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="rights-modal-title"
        >
          <div className="pf-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 id="rights-modal-title" className="pf-modal-title">
              100% Creator Rights Certificate
            </h2>
            <p className="pf-modal-sub">
              <strong>Nib &amp; Knock</strong> is an original work with full creator ownership.
            </p>
            <div className="pf-info-notes">
              <p>
                <strong>Bespoke Identity:</strong> Original Atelier Drafting Studio aesthetic, custom instrument
                names, and Cyanotype Blueprint mode.
              </p>
              <p>
                <strong>Original Mechanics:</strong> Custom 2D rigid-body physics with Brass Compass Weights, Gum
                Eraser bumpers, Corner Pins, and Momentum Overdrive strikes.
              </p>
              <p>
                <strong>Unrestricted Rights:</strong> Free of any third-party trademarks, external trackers, or
                proprietary branding.
              </p>
            </div>
            <div className="pf-modal-actions">
              <button type="button" className="pf-chunky-btn primary" onClick={() => setModalOpen(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
