import React, { useState, useEffect } from 'react';
import {
  AVATAR_COLORS,
  CloudMatchLog,
  CloudPlayerProfile,
} from '../firebase';
import { PEN_ROSTER } from '../game/rules';
import { PlayerRecord } from './PenFightMenu';
import { PenId, InkColor } from '../game/penAssets';

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSignedIn: boolean;
  authLoading: boolean;
  authError: string | null;
  profile: CloudPlayerProfile | null;
  record: PlayerRecord;
  recentMatches: CloudMatchLog[];
  currentPen: PenId;
  currentInk: InkColor;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onSaveProfile: (patch: {
    callsign: string;
    avatarColor: string;
    favoritePen: PenId;
    favoriteInk: InkColor;
  }) => Promise<void>;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  isOpen,
  onClose,
  isSignedIn,
  authLoading,
  authError,
  profile,
  record,
  recentMatches,
  currentPen,
  currentInk,
  onSignIn,
  onSignOut,
  onSaveProfile,
}) => {
  const [callsignInput, setCallsignInput] = useState(
    profile?.callsign || 'Draftsman'
  );
  const [selectedColor, setSelectedColor] = useState(
    profile?.avatarColor || '#e5a93c'
  );
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setCallsignInput(profile.callsign);
      setSelectedColor(profile.avatarColor || '#e5a93c');
    } else {
      setCallsignInput('Draftsman');
      setSelectedColor('#e5a93c');
    }
    setSaveMessage(null);
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      await onSaveProfile({
        callsign: callsignInput.trim() || 'Draftsman',
        avatarColor: selectedColor,
        favoritePen: currentPen,
        favoriteInk: currentInk,
      });
      setSaveMessage('Callsign & loadout synced to Atelier Cloud.');
    } catch {
      setSaveMessage('Could not sync profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const winRate =
    record.played > 0 ? Math.round((record.won / record.played) * 100) : 0;

  return (
    <div
      className="pf-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-profile-title"
    >
      <div
        className="pf-modal-card nk-profile-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="nk-profile-header">
          <div
            className="nk-profile-crest"
            style={{ borderColor: selectedColor }}
            aria-hidden="true"
          >
            <span>
              {(callsignInput.trim() || 'D').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="nk-profile-heading">
            <h2 id="player-profile-title" className="pf-modal-title">
              {isSignedIn
                ? `${profile?.callsign || 'Draftsman'} · Dossier`
                : 'Draftsman Cloud Dossier'}
            </h2>
            <p className="pf-modal-sub" style={{ margin: 0, textAlign: 'left' }}>
              {isSignedIn
                ? 'Cloud sync active · Career stats & match history recorded'
                : 'Sign in with Google to record your callsign, stats & duel history'}
            </p>
          </div>
        </div>

        {authError && (
          <div className="nk-auth-alert" role="alert">
            {authError}
          </div>
        )}

        {/* Auth Action / Profile Editor */}
        {!isSignedIn ? (
          <div className="nk-signin-banner">
            <p>
              Keep your unbeaten streaks, favorite instrument loadout, and match
              history synced across sessions.
            </p>
            <button
              type="button"
              className="pf-chunky-btn primary nk-google-btn"
              disabled={authLoading}
              onClick={onSignIn}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  d="M21.35 11.1H12v2.9h5.35c-.25 1.4-1.05 2.6-2.25 3.4v2.8h3.6c2.1-1.95 3.3-4.8 3.3-8.15 0-.65-.05-1.3-.15-1.95z"
                  fill="#1e293b"
                />
                <path
                  d="M12 21c2.7 0 4.95-.9 6.6-2.4l-3.2-2.5c-.9.6-2.05.95-3.4.95-2.6 0-4.8-1.75-5.6-4.1H3.1v2.55C4.75 18.75 8.1 21 12 21z"
                  fill="#0f172a"
                />
              </svg>
              <span>
                {authLoading ? 'Connecting...' : 'Sign In with Google'}
              </span>
            </button>
          </div>
        ) : (
          <form className="nk-profile-form" onSubmit={handleSave}>
            <div className="nk-form-row">
              <label htmlFor="nk-callsign-input" className="nk-form-label">
                Studio Callsign
              </label>
              <input
                id="nk-callsign-input"
                type="text"
                maxLength={28}
                value={callsignInput}
                onChange={(e) => setCallsignInput(e.target.value)}
                className="nk-callsign-input"
                placeholder="Enter callsign..."
              />
            </div>

            <div className="nk-form-row">
              <span className="nk-form-label">Crest Seal Color</span>
              <div
                className="nk-color-swatches"
                role="radiogroup"
                aria-label="Crest Seal Color"
              >
                {AVATAR_COLORS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    role="radio"
                    aria-checked={selectedColor === hex}
                    aria-label={`Color ${hex}`}
                    className={`pf-ink-swatch ${
                      selectedColor === hex ? 'active' : ''
                    }`}
                    style={{ backgroundColor: hex }}
                    onClick={() => setSelectedColor(hex)}
                  />
                ))}
              </div>
            </div>

            <div className="nk-profile-form-footer">
              <span className="nk-fav-pen-tag">
                Signature Pen:{' '}
                <strong>{PEN_ROSTER[currentPen]?.name || currentPen}</strong>
              </span>
              <button
                type="submit"
                className="pf-chunky-btn primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Dossier'}
              </button>
            </div>
            {saveMessage && (
              <p className="nk-save-feedback" role="status">
                {saveMessage}
              </p>
            )}
          </form>
        )}

        {/* Career Stats Summary Grid */}
        <div className="pf-stats-grid" style={{ marginTop: 14 }}>
          <div className="pf-stat-box">
            <span className="pf-stat-num">{record.played}</span>
            <span className="pf-stat-lbl">Duels</span>
          </div>
          <div className="pf-stat-box">
            <span className="pf-stat-num">{record.won}</span>
            <span className="pf-stat-lbl">Victories ({winRate}%)</span>
          </div>
          <div className="pf-stat-box">
            <span className="pf-stat-num">{record.streak}</span>
            <span className="pf-stat-lbl">Active Streak</span>
          </div>
          <div className="pf-stat-box">
            <span className="pf-stat-num">{record.bestStreak}</span>
            <span className="pf-stat-lbl">Best Streak</span>
          </div>
        </div>

        {/* Cloud Match Log */}
        {isSignedIn && (
          <div className="nk-match-history">
            <h3 className="nk-history-title">Recent Cloud Duel Log</h3>
            {recentMatches.length === 0 ? (
              <p className="nk-history-empty">
                Complete a tabletop duel to record your first cloud match entry.
              </p>
            ) : (
              <div className="nk-history-list">
                {recentMatches.slice(0, 5).map((m) => (
                  <div key={m.id} className="nk-history-row">
                    <span className={`nk-outcome-pill ${m.outcome}`}>
                      {m.outcome.toUpperCase()}
                    </span>
                    <span className="nk-history-matchup">
                      {PEN_ROSTER[m.playerPen]?.name || m.playerPen}{' '}
                      <small>vs</small>{' '}
                      {PEN_ROSTER[m.opponentPen]?.name || m.opponentPen}
                    </span>
                    <span className="nk-history-meta">
                      {m.shots} strikes · {m.arenaLayout}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="pf-modal-actions" style={{ justifyContent: 'space-between' }}>
          {isSignedIn ? (
            <button
              type="button"
              className="pf-chunky-btn"
              onClick={onSignOut}
              disabled={authLoading}
            >
              Sign Out
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            className="pf-chunky-btn primary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
