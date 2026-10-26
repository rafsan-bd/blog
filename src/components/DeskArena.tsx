import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { getPenSvg, InkColor } from '../game/penAssets';
import {
  DESK_PHYSICS,
  PEN_ROSTER,
  PenState,
  Vec2,
  SurfaceThemeId,
  createInitialPenState,
  getPenEndpoints,
  calculateFlickImpulse,
  calculateOverdriveGain,
  applyFlickToPen,
  getArenaObstacles,
  stepSimulation,
  arePensAtRest,
  resolveRoundOutcome,
  chooseAiShot,
} from '../game/rules';
import { MatchSettings } from './PenFightMenu';
import { sound } from '../game/sound';

interface DeskArenaProps {
  settings: MatchSettings;
  onUpdateSettings: (next: Partial<MatchSettings>) => void;
  scores: [number, number];
  streak: number;
  bestStreak: number;
  isPaused: boolean;
  onSetPaused: (paused: boolean) => void;
  onRoundEnd: (winner: 0 | 1 | 'draw', shotsTaken: number) => void;
  onNextMatch: () => void;
  onRestartMatch: () => void;
  onChangePens: () => void;
  onMainMenu: () => void;
  roundResult: null | {
    winner: 0 | 1 | 'draw';
    shots: number;
    scoresSnapshot: [number, number];
    streakSnapshot: number;
  };
  playerCallsign: string;
  isSignedIn: boolean;
  onOpenProfile: () => void;
}

interface BurstEffect {
  x: number;
  y: number;
  timer: number;
  isOverdrive?: boolean;
}

interface InkCrumb {
  x: number;
  y: number;
  color: string;
  alpha: number;
}

const INK_HEX: Record<InkColor, string> = {
  blue: '#38bdf8',
  violet: '#a78bfa',
  green: '#34d399',
};

const SURFACE_ORDER: SurfaceThemeId[] = ['walnut', 'blueprint', 'cuttingmat'];

export const DeskArena: React.FC<DeskArenaProps> = ({
  settings,
  onUpdateSettings,
  scores,
  streak,
  bestStreak,
  isPaused,
  onSetPaused,
  onRoundEnd,
  onNextMatch,
  onRestartMatch,
  onChangePens,
  onMainMenu,
  roundResult,
  playerCallsign,
  isSignedIn,
  onOpenProfile,
}) => {
  const deskRef = useRef<HTMLDivElement | null>(null);
  const pen0ElRef = useRef<HTMLDivElement | null>(null);
  const pen1ElRef = useRef<HTMLDivElement | null>(null);
  const label0ElRef = useRef<HTMLDivElement | null>(null);
  const label1ElRef = useRef<HTMLDivElement | null>(null);
  const overlaySvgRef = useRef<SVGSVGElement | null>(null);

  const [activeTurn, setActiveTurn] = useState<0 | 1>(0);
  const [turnPhase, setTurnPhase] = useState<'aiming' | 'moving' | 'ai_thinking' | 'ended'>('aiming');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [kbGrabIndex, setKbGrabIndex] = useState<number>(2); // 0..4 along pen
  const [kbAimAngleOffset, setKbAimAngleOffset] = useState<number>(0); // radians offset
  const [kbPower, setKbPower] = useState<number>(0.65);
  const [overdriveCharge, setOverdriveCharge] = useState<[number, number]>([60, 60]);
  const [overdriveArmed, setOverdriveArmed] = useState<boolean>(false);
  const [aiTactic, setAiTactic] = useState<string>('');

  const obstacles = useMemo(
    () => getArenaObstacles(settings.arenaLayout),
    [settings.arenaLayout]
  );

  // Pre-allocated zero-GC ring buffer for ink trail crumbs
  const inkRingRef = useRef<{ items: InkCrumb[]; head: number }>({
    items: Array.from({ length: 28 }, () => ({ x: 0, y: 0, color: '#38bdf8', alpha: 0 })),
    head: 0,
  });

  const simRef = useRef<{
    pens: [PenState, PenState];
    activeTurn: 0 | 1;
    phase: 'aiming' | 'moving' | 'ai_thinking' | 'ended';
    hitstop: number;
    shotsTaken: number;
    dragging: boolean;
    grabWorld: Vec2 | null;
    dragCurrentWorld: Vec2 | null;
    burst: BurstEffect | null;
    aiTimer: number;
    crumbAccum: number;
  }>({
    pens: [
      createInitialPenState(0, settings.p0Pen, settings.penStyle, settings.p0Ink),
      createInitialPenState(
        1,
        settings.mirrorMatch ? settings.p0Pen : settings.p1Pen,
        settings.penStyle,
        settings.p1Ink
      ),
    ],
    activeTurn: 0,
    phase: 'aiming',
    hitstop: 0,
    shotsTaken: 0,
    dragging: false,
    grabWorld: null,
    dragCurrentWorld: null,
    burst: null,
    aiTimer: 0,
    crumbAccum: 0,
  });

  const callbacksRef = useRef({
    onRoundEnd,
    isPaused,
    settings,
    obstacles,
    overdriveArmed,
    overdriveCharge,
  });
  callbacksRef.current = {
    onRoundEnd,
    isPaused,
    settings,
    obstacles,
    overdriveArmed,
    overdriveCharge,
  };

  const resetDeskPositions = useCallback(() => {
    const p1PenId = settings.mirrorMatch ? settings.p0Pen : settings.p1Pen;
    simRef.current = {
      pens: [
        createInitialPenState(0, settings.p0Pen, settings.penStyle, settings.p0Ink),
        createInitialPenState(1, p1PenId, settings.penStyle, settings.p1Ink),
      ],
      activeTurn: 0,
      phase: 'aiming',
      hitstop: 0,
      shotsTaken: 0,
      dragging: false,
      grabWorld: null,
      dragCurrentWorld: null,
      burst: null,
      aiTimer: 0,
      crumbAccum: 0,
    };
    for (const c of inkRingRef.current.items) {
      c.alpha = 0;
    }
    setActiveTurn(0);
    setTurnPhase('aiming');
    setShowLabels(true);
    setKbAimAngleOffset(0);
    setOverdriveArmed(false);
    setAiTactic('');
  }, [settings.mirrorMatch, settings.p0Pen, settings.p1Pen, settings.penStyle, settings.p0Ink, settings.p1Ink]);

  useEffect(() => {
    if (!roundResult) {
      resetDeskPositions();
    }
  }, [roundResult, resetDeskPositions]);

  // Convert client coordinates to 712x366 logical desk coordinates
  const clientToDesk = useCallback((clientX: number, clientY: number): Vec2 => {
    const el = deskRef.current;
    if (!el) return { x: DESK_PHYSICS.deskWidth / 2, y: DESK_PHYSICS.deskHeight / 2 };
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / Math.max(1, rect.width)) * DESK_PHYSICS.deskWidth;
    const y = ((clientY - rect.top) / Math.max(1, rect.height)) * DESK_PHYSICS.deskHeight;
    return { x, y };
  }, []);

  // Execute a flick on the currently active pen
  const executeFlick = useCallback(
    (grabWorld: Vec2, releaseWorld: Vec2) => {
      const st = simRef.current;
      if (st.phase !== 'aiming' && st.phase !== 'ai_thinking') return false;
      const turn = st.activeTurn;
      const pen = st.pens[turn];
      const useBoost =
        callbacksRef.current.overdriveArmed && callbacksRef.current.overdriveCharge[turn] >= 100;

      const flick = calculateFlickImpulse(pen, grabWorld, releaseWorld, DESK_PHYSICS.maxDrag, useBoost);
      if (!flick) return false;

      applyFlickToPen(pen, flick);
      sound.playFlick(flick.power);

      if (useBoost) {
        setOverdriveCharge((prev) => {
          const next: [number, number] = [...prev] as [number, number];
          next[turn] = 0;
          return next;
        });
        setOverdriveArmed(false);
      } else {
        const gain = calculateOverdriveGain(flick.power, 0);
        setOverdriveCharge((prev) => {
          const next: [number, number] = [...prev] as [number, number];
          next[turn] = Math.min(100, next[turn] + gain);
          return next;
        });
      }

      st.dragging = false;
      st.grabWorld = null;
      st.dragCurrentWorld = null;
      st.phase = 'moving';
      st.shotsTaken += 1;
      setTurnPhase('moving');
      setShowLabels(false);
      return true;
    },
    []
  );

  const cycleSurfaceTheme = useCallback(() => {
    const idx = SURFACE_ORDER.indexOf(settings.surfaceTheme);
    const next = SURFACE_ORDER[(idx + 1) % SURFACE_ORDER.length];
    onUpdateSettings({ surfaceTheme: next });
  }, [settings.surfaceTheme, onUpdateSettings]);

  // Keyboard controls for aiming, power, grab point, overdrive, surface toggle, and pausing
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        onSetPaused(!callbacksRef.current.isPaused);
        return;
      }

      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        cycleSurfaceTheme();
        return;
      }

      if (callbacksRef.current.isPaused || roundResult) {
        if ((e.key === 'Enter' || e.key === ' ') && roundResult) {
          e.preventDefault();
          onNextMatch();
        }
        return;
      }

      const st = simRef.current;
      const isHumanTurn =
        st.phase === 'aiming' && (st.activeTurn === 0 || callbacksRef.current.settings.mode === 'hotseat');
      if (!isHumanTurn) return;

      if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        if (callbacksRef.current.overdriveCharge[st.activeTurn] >= 100) {
          setOverdriveArmed((prev) => !prev);
        }
      } else if (e.key >= '1' && e.key <= '5') {
        setKbGrabIndex(Number(e.key) - 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setKbAimAngleOffset((prev) => prev - 0.1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setKbAimAngleOffset((prev) => prev + 0.1);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setKbPower((prev) => Math.min(1, prev + 0.08));
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setKbPower((prev) => Math.max(0.2, prev - 0.08));
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const activePen = st.pens[st.activeTurn];
        const otherPen = st.pens[st.activeTurn === 0 ? 1 : 0];
        const [cap, tip] = getPenEndpoints(activePen);
        const t = kbGrabIndex / 4;
        const grabPt = {
          x: cap.x + (tip.x - cap.x) * t,
          y: cap.y + (tip.y - cap.y) * t,
        };
        const baseAngle =
          Math.atan2(otherPen.position.y - grabPt.y, otherPen.position.x - grabPt.x) + kbAimAngleOffset;
        const pullDist = kbPower * DESK_PHYSICS.maxDrag;
        const releasePt = {
          x: grabPt.x - Math.cos(baseAngle) * pullDist,
          y: grabPt.y - Math.sin(baseAngle) * pullDist,
        };
        executeFlick(grabPt, releasePt);
      }
    };

    const onBlur = () => {
      simRef.current.dragging = false;
      simRef.current.grabWorld = null;
      simRef.current.dragCurrentWorld = null;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('blur', onBlur);
    };
  }, [
    cycleSurfaceTheme,
    executeFlick,
    kbAimAngleOffset,
    kbGrabIndex,
    kbPower,
    onNextMatch,
    onSetPaused,
    roundResult,
  ]);

  // 60 FPS simulation & DOM transform loop
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const updateDom = () => {
      const st = simRef.current;
      const [p0, p1] = st.pens;

      const applyTransform = (el: HTMLDivElement | null, pen: PenState, isActive: boolean) => {
        if (!el) return;
        const xPct = (pen.position.x / DESK_PHYSICS.deskWidth) * 100;
        const yPct = (pen.position.y / DESK_PHYSICS.deskHeight) * 100;
        const deg = (pen.angle * 180) / Math.PI;
        const fallScale = pen.fallen ? Math.max(0.55, 1 - pen.fallTimer * 1.1) : 1;
        const fallOpacity = pen.fallen ? Math.max(0, 1 - pen.fallTimer * 2.2) : 1;
        const wobbleDeg =
          pen.wobble && !pen.fallen ? Math.sin(performance.now() * 0.025) * 2.4 : 0;

        el.style.left = `${xPct}%`;
        el.style.top = `${yPct}%`;
        el.style.transform = `translate(-50%, -50%) rotate(${(deg + wobbleDeg).toFixed(2)}deg) scale(${fallScale.toFixed(3)})`;
        el.style.opacity = `${fallOpacity.toFixed(2)}`;
        el.dataset.active = isActive && st.phase === 'aiming' ? 'true' : 'false';
      };

      applyTransform(pen0ElRef.current, p0, st.activeTurn === 0);
      applyTransform(pen1ElRef.current, p1, st.activeTurn === 1);

      if (label0ElRef.current) {
        label0ElRef.current.style.left = `${(p0.position.x / DESK_PHYSICS.deskWidth) * 100}%`;
        label0ElRef.current.style.top = `${((p0.position.y + p0.length * 0.56) / DESK_PHYSICS.deskHeight) * 100}%`;
      }
      if (label1ElRef.current) {
        label1ElRef.current.style.left = `${(p1.position.x / DESK_PHYSICS.deskWidth) * 100}%`;
        label1ElRef.current.style.top = `${((p1.position.y + p1.length * 0.56) / DESK_PHYSICS.deskHeight) * 100}%`;
      }

      const svg = overlaySvgRef.current;
      if (svg) {
        let markup = '';

        // 1. Render fading Ink Ribbon Crumbs from ring buffer
        for (const c of inkRingRef.current.items) {
          if (c.alpha > 0.02) {
            markup += `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="3.2" fill="${c.color}" fill-opacity="${c.alpha.toFixed(2)}" />`;
          }
        }

        // 2. Render dynamic aim line when dragging
        if (st.dragging && st.grabWorld && st.dragCurrentWorld && st.phase === 'aiming') {
          const activePen = st.pens[st.activeTurn];
          const isBoost =
            callbacksRef.current.overdriveArmed &&
            callbacksRef.current.overdriveCharge[st.activeTurn] >= 100;
          const flick = calculateFlickImpulse(
            activePen,
            st.grabWorld,
            st.dragCurrentWorld,
            DESK_PHYSICS.maxDrag,
            isBoost
          );
          const gx = st.grabWorld.x;
          const gy = st.grabWorld.y;
          const cx = st.dragCurrentWorld.x;
          const cy = st.dragCurrentWorld.y;

          const bandColor = isBoost ? '#fde047' : '#f7f2e7';
          markup += `<line x1="${gx.toFixed(1)}" y1="${gy.toFixed(1)}" x2="${cx.toFixed(1)}" y2="${cy.toFixed(1)}" stroke="${bandColor}" stroke-width="3" stroke-dasharray="6 5" opacity="0.9" />`;
          markup += `<circle cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="7" fill="#f4cf5a" stroke="#0f172a" stroke-width="2.5" />`;
          markup += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="10" fill="rgba(244,207,90,0.28)" stroke="#f4cf5a" stroke-width="2.5" />`;

          if (flick) {
            const aimLen = 40 + flick.shapedPower * 125;
            const mag = Math.hypot(flick.impulse.x, flick.impulse.y) || 1;
            const dirX = flick.impulse.x / mag;
            const dirY = flick.impulse.y / mag;
            for (let i = 1; i <= 4; i++) {
              const d = (aimLen * i) / 4;
              const px = gx + dirX * d;
              const py = gy + dirY * d;
              const r = 5.5 - i * 0.8;
              const color = isBoost ? '#fde047' : flick.power > 0.75 ? '#f08a3c' : '#f4cf5a';
              markup += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${r}" fill="${color}" stroke="#0f172a" stroke-width="1.6" />`;
            }
          }
        }

        // 3. Render collision burst
        if (st.burst && st.burst.timer > 0) {
          const bx = st.burst.x;
          const by = st.burst.y;
          const s = 1 + (0.22 - st.burst.timer) * 2.4;
          markup += `<g transform="translate(${bx.toFixed(1)} ${by.toFixed(1)}) scale(${s.toFixed(2)})">
            <path d="M0 -18 L4 -6 L16 -10 L8 0 L18 9 L5 7 L2 19 L-4 8 L-15 14 L-9 2 L-19 -5 L-6 -6 Z" fill="#fde047" stroke="#0f172a" stroke-width="2.5" />
          </g>`;
        }

        svg.innerHTML = markup;
      }
    };

    const tick = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);
      const st = simRef.current;

      if (!callbacksRef.current.isPaused && st.phase !== 'ended') {
        if (st.burst && st.burst.timer > 0) {
          st.burst.timer = Math.max(0, st.burst.timer - dt);
        }

        // Decay ink trail crumbs
        for (const c of inkRingRef.current.items) {
          if (c.alpha > 0) {
            c.alpha = Math.max(0, c.alpha - dt * 0.85);
          }
        }

        if (st.hitstop > 0) {
          st.hitstop = Math.max(0, st.hitstop - dt);
        } else if (st.phase === 'moving') {
          const prevFall0 = st.pens[0].fallen;
          const prevFall1 = st.pens[1].fallen;
          const hit = stepSimulation(st.pens, dt, 0, callbacksRef.current.obstacles);

          // Sample ink trail crumbs from moving pen tips
          st.crumbAccum += dt;
          if (st.crumbAccum >= 0.025) {
            st.crumbAccum = 0;
            for (const pen of st.pens) {
              const spd = Math.hypot(pen.velocity.x, pen.velocity.y);
              if (!pen.fallen && spd > 35) {
                const [, tip] = getPenEndpoints(pen);
                const ring = inkRingRef.current;
                const item = ring.items[ring.head];
                item.x = tip.x;
                item.y = tip.y;
                item.color = INK_HEX[pen.ink] || '#38bdf8';
                item.alpha = 0.55;
                ring.head = (ring.head + 1) % ring.items.length;
              }
            }
          }

          if (hit && hit.impactSpeed > 25) {
            const isMetal =
              st.pens[0].penId === 'metal' ||
              st.pens[1].penId === 'metal' ||
              hit.kind === 'obstacle';
            sound.playCollision(hit.impactSpeed, isMetal);
            st.hitstop = 0.045;
            st.burst = { x: hit.point.x, y: hit.point.y, timer: 0.22 };

            if (hit.kind === 'pen') {
              const bonus = Math.min(35, Math.round(hit.impactSpeed / 10));
              setOverdriveCharge((prev) => [
                Math.min(100, prev[0] + bonus),
                Math.min(100, prev[1] + bonus),
              ]);
            }
          }

          if ((!prevFall0 && st.pens[0].fallen) || (!prevFall1 && st.pens[1].fallen)) {
            sound.playFallOff();
          }

          if (arePensAtRest(st.pens)) {
            const outcome = resolveRoundOutcome(st.pens);
            if (outcome !== 'ongoing') {
              st.phase = 'ended';
              setTurnPhase('ended');
              const winner =
                outcome === 'p0_win' ? 0 : outcome === 'p1_win' ? 1 : 'draw';
              if (winner === 0 || (winner === 1 && callbacksRef.current.settings.mode === 'hotseat')) {
                sound.playWin();
              } else {
                sound.playLose();
              }
              callbacksRef.current.onRoundEnd(winner, st.shotsTaken);
            } else {
              const nextTurn: 0 | 1 = st.activeTurn === 0 ? 1 : 0;
              st.activeTurn = nextTurn;
              setActiveTurn(nextTurn);
              setOverdriveArmed(false);
              sound.playTurnChange();

              if (nextTurn === 1 && callbacksRef.current.settings.mode === 'computer') {
                st.phase = 'ai_thinking';
                st.aiTimer = 0.65;
                setTurnPhase('ai_thinking');
              } else {
                st.phase = 'aiming';
                setTurnPhase('aiming');
              }
            }
          }
        } else if (st.phase === 'ai_thinking') {
          st.aiTimer -= dt;
          if (st.aiTimer <= 0) {
            const aiPen = st.pens[1];
            const playerPen = st.pens[0];
            const aiOverdriveReady = callbacksRef.current.overdriveCharge[1] >= 100;
            const shot = chooseAiShot(
              aiPen,
              playerPen,
              callbacksRef.current.settings.aiLevel,
              callbacksRef.current.obstacles,
              aiOverdriveReady
            );
            applyFlickToPen(aiPen, shot);
            sound.playFlick(shot.power);
            setAiTactic(shot.tacticName);

            if (shot.isOverdrive) {
              setOverdriveCharge((prev) => [prev[0], 0]);
              st.burst = {
                x: shot.grabPoint.x,
                y: shot.grabPoint.y,
                timer: 0.22,
                isOverdrive: true,
              };
            } else {
              const gain = calculateOverdriveGain(shot.power, 0);
              setOverdriveCharge((prev) => [
                prev[0],
                Math.min(100, prev[1] + gain),
              ]);
            }

            st.phase = 'moving';
            st.shotsTaken += 1;
            setTurnPhase('moving');
          }
        }
      }

      updateDom();
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPaused || roundResult) return;
    const st = simRef.current;
    const canControl =
      st.phase === 'aiming' && (st.activeTurn === 0 || settings.mode === 'hotseat');
    if (!canControl) return;

    const pt = clientToDesk(e.clientX, e.clientY);
    const activePen = st.pens[st.activeTurn];

    const cos = Math.cos(activePen.angle);
    const sin = Math.sin(activePen.angle);
    const half = activePen.length / 2;
    const proj = Math.max(
      -half,
      Math.min(half, (pt.x - activePen.position.x) * cos + (pt.y - activePen.position.y) * sin)
    );
    const snappedGrab = {
      x: activePen.position.x + proj * cos,
      y: activePen.position.y + proj * sin,
    };

    st.dragging = true;
    st.grabWorld = snappedGrab;
    st.dragCurrentWorld = pt;
    sound.playGrab();
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = simRef.current;
    if (!st.dragging) return;
    st.dragCurrentWorld = clientToDesk(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = simRef.current;
    if (!st.dragging || !st.grabWorld) return;
    const releasePt = clientToDesk(e.clientX, e.clientY);
    const fired = executeFlick(st.grabWorld, releasePt);
    if (!fired) {
      st.dragging = false;
      st.grabWorld = null;
      st.dragCurrentWorld = null;
    }
  };

  const p0Label = playerCallsign || 'Draftsman';
  const p1Label = settings.mode === 'computer' ? 'Automaton' : 'Draftsman 2';
  const p1PenId = settings.mirrorMatch ? settings.p0Pen : settings.p1Pen;
  const currentTurnCharge = overdriveCharge[activeTurn];

  const turnText =
    turnPhase === 'ai_thinking'
      ? 'Automaton · Computing Trajectory'
      : activeTurn === 0
      ? settings.mode === 'computer'
        ? `${p0Label}'s Turn`
        : `${p0Label} Turn`
      : settings.mode === 'computer'
      ? `Automaton · ${aiTactic || 'Tactical Strike'}`
      : 'Draftsman 2 Turn';

  return (
    <div
      className="pf-arena-page"
      data-surface={settings.surfaceTheme}
      role="region"
      aria-label="Nib and Knock Tabletop Arena"
    >
      {/* Top World-Matched HUD Bar */}
      <div className="pf-hud-top">
        <div
          className="pf-score-cluster"
          role="group"
          aria-label={`${p0Label}: ${scores[0]} wins, streak ${streak} · ${p1Label}: ${scores[1]} wins`}
        >
          <button
            type="button"
            className="pf-hud-callsign-btn"
            onClick={onOpenProfile}
            title={isSignedIn ? 'Cloud Dossier Synced' : 'Sign In to Record Stats'}
          >
            <span
              className="pf-hud-sync-dot"
              style={{ backgroundColor: isSignedIn ? '#34d399' : '#94a3b8' }}
              aria-hidden="true"
            />
            <span className="pf-score-name">{p0Label}</span>
          </button>
          <span className="pf-score-badge p0">{scores[0]}</span>
          <span className="pf-score-sep" aria-hidden="true">
            ·
          </span>
          <span className="pf-score-name">{p1Label}</span>
          <span className="pf-score-badge p1">{scores[1]}</span>
        </div>

        <div className="pf-turn-center">
          <div className="pf-turn-row">
            <div className={`pf-turn-pill player-${activeTurn}`}>
              <span className="pf-turn-dot" aria-hidden="true" />
              <span>{turnText}</span>
            </div>

            {/* Live Momentum Overdrive Meter & Trigger */}
            <button
              type="button"
              className={`pf-overdrive-btn ${currentTurnCharge >= 100 ? 'ready' : ''} ${
                overdriveArmed ? 'armed' : ''
              }`}
              disabled={currentTurnCharge < 100 || turnPhase !== 'aiming'}
              aria-label={`Overdrive Strike (${currentTurnCharge}% charged) [O]`}
              onClick={() => {
                if (currentTurnCharge >= 100) {
                  setOverdriveArmed((prev) => !prev);
                }
              }}
            >
              <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
                <path d="M11 1 L4 11 H10 L9 19 L16 9 H10 Z" fill="currentColor" />
              </svg>
              <span>
                {overdriveArmed
                  ? 'OVERDRIVE ARMED (1.28x)'
                  : `Overdrive ${currentTurnCharge}%`}
              </span>
            </button>
          </div>

          {showLabels && turnPhase === 'aiming' && (
            <div className="pf-turn-hint-box" aria-hidden="true">
              <p>
                <strong>Grab your instrument · Pull back to aim · Release to strike</strong>
              </p>
            </div>
          )}
        </div>

        <div className="pf-hud-right-actions">
          <button
            type="button"
            className="pf-hud-icon-btn"
            aria-label="Switch Tabletop Surface [T]"
            title="Switch Tabletop Surface [T]"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              cycleSurfaceTheme();
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke="#2f3b4b" strokeWidth="2.2" />
              <path d="M3 10 H21 M9 4 V20" stroke="#2f3b4b" strokeWidth="2" />
            </svg>
          </button>

          <button
            type="button"
            className="pf-hud-icon-btn"
            aria-label="Open Armory"
            title="Open Armory"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onChangePens();
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M4 20 L8 19 L19 8 L16 5 L5 16 Z" fill="#f4cf5a" stroke="#2f3b4b" strokeWidth="2.2" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            type="button"
            className="pf-pause-btn"
            aria-label="Pause menu [P]"
            title="Pause menu [P]"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onSetPaused(true);
            }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1.5" fill="none" stroke="#2f3b4b" strokeWidth="2.4" />
              <rect x="14" y="5" width="4" height="14" rx="1.5" fill="none" stroke="#2f3b4b" strokeWidth="2.4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Drafting Tabletop Frame */}
      <div className="pf-desk-outer-frame">
        <div
          ref={deskRef}
          className="pf-desk-surface"
          data-surface={settings.surfaceTheme}
          data-testid="pen-fight-desk"
          tabIndex={0}
          aria-label="Nib and Knock Tabletop. Hold your pen, drag back and release. Keyboard: 1 to 5 grab, arrows aim, W and S power, O Overdrive, Space flick."
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Left recessed groove with brass scale ruler */}
          <div className="pf-desk-groove left" aria-hidden="true">
            <div className="pf-groove-ruler">
              {Array.from({ length: 18 }).map((_, idx) => (
                <span key={idx} className={`pf-ruler-tick ${idx % 5 === 0 ? 'major' : ''}`} />
              ))}
            </div>
          </div>

          {/* Right recessed groove with drafting pencil & studio rubber */}
          <div className="pf-desk-groove right" aria-hidden="true">
            <div className="pf-groove-pencil">
              <div className="pf-pencil-eraser" />
              <div className="pf-pencil-ferrule" />
              <div className="pf-pencil-shaft" />
              <div className="pf-pencil-cone">
                <div className="pf-pencil-lead" />
              </div>
            </div>
            <div className="pf-groove-rubber">
              <div className="pf-rubber-pink" />
              <div className="pf-rubber-blue" />
            </div>
          </div>

          {/* Architect Compass Markings & Active Physical Obstacles SVG */}
          <svg
            className="pf-desk-carvings-svg"
            viewBox={`0 0 ${DESK_PHYSICS.deskWidth} ${DESK_PHYSICS.deskHeight}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Subtle Center Protractor Crosshair */}
            <g
              transform={`translate(${DESK_PHYSICS.deskWidth / 2}, ${DESK_PHYSICS.deskHeight / 2})`}
              stroke="rgba(229, 169, 60, 0.22)"
              fill="none"
            >
              <circle r="76" strokeWidth="1.4" strokeDasharray="5 5" />
              <line x1="-95" y1="0" x2="95" y2="0" strokeWidth="1" />
              <line x1="0" y1="-95" x2="0" y2="95" strokeWidth="1" />
            </g>

            {/* Physical Tabletop Obstacles (Bumpers / Fortress Pins) */}
            {obstacles.map((obs) => {
              if (obs.kind === 'brass_weight') {
                return (
                  <g key={obs.id} transform={`translate(${obs.position.x}, ${obs.position.y})`}>
                    <circle r={obs.radius + 2} fill="rgba(0,0,0,0.35)" cy="3" />
                    <circle r={obs.radius} fill="#e5a93c" stroke="#111827" strokeWidth="2.8" />
                    <circle r={obs.radius * 0.52} fill="#fef08a" stroke="#111827" strokeWidth="1.8" />
                    <circle r="2.5" fill="#111827" />
                  </g>
                );
              }
              if (obs.kind === 'eraser') {
                return (
                  <g key={obs.id} transform={`translate(${obs.position.x}, ${obs.position.y})`}>
                    <circle r={obs.radius + 2} fill="rgba(0,0,0,0.32)" cy="3" />
                    <circle r={obs.radius} fill="#f472b6" stroke="#111827" strokeWidth="2.6" />
                    <circle r={obs.radius * 0.55} fill="#38bdf8" stroke="#111827" strokeWidth="1.8" />
                  </g>
                );
              }
              return (
                <g key={obs.id} transform={`translate(${obs.position.x}, ${obs.position.y})`}>
                  <circle r={obs.radius + 1.5} fill="rgba(0,0,0,0.35)" cy="2.5" />
                  <circle r={obs.radius} fill="#f4cf5a" stroke="#111827" strokeWidth="2.4" />
                  <circle r="3.5" fill="#111827" />
                </g>
              );
            })}
          </svg>

          {/* Dynamic Ink Trail, Aim & Burst SVG Layer */}
          <svg
            ref={overlaySvgRef}
            className="pf-desk-aim-svg"
            viewBox={`0 0 ${DESK_PHYSICS.deskWidth} ${DESK_PHYSICS.deskHeight}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          />

          {/* Player 0 Pen */}
          <div
            ref={pen0ElRef}
            className="pf-desk-pen pen-p0"
            style={{
              width: `${((PEN_ROSTER[settings.p0Pen].length * 100) / DESK_PHYSICS.deskWidth) * 100}%`,
            }}
            dangerouslySetInnerHTML={{
              __html: getPenSvg(settings.p0Pen, settings.penStyle, settings.p0Ink, true),
            }}
          />

          {/* Player 1 Pen */}
          <div
            ref={pen1ElRef}
            className="pf-desk-pen pen-p1"
            style={{
              width: `${((PEN_ROSTER[p1PenId].length * 100) / DESK_PHYSICS.deskWidth) * 100}%`,
            }}
            dangerouslySetInnerHTML={{
              __html: getPenSvg(p1PenId, settings.penStyle, settings.p1Ink, true),
            }}
          />

          {/* Player Name Labels on Desk */}
          {showLabels && (
            <>
              <div ref={label0ElRef} className="pf-desk-player-label p0" aria-hidden="true">
                {p0Label}
              </div>
              <div ref={label1ElRef} className="pf-desk-player-label p1" aria-hidden="true">
                {p1Label}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Single flat borderless inline control hint bar */}
      <div className="pf-arena-footer">
        <span>
          Drag Pen to Aim &amp; Flick · Keys 1–5 Grab Point · Arrows Aim · O Overdrive · T Surface · Space Flick · Esc Pause
        </span>
      </div>

      {/* Pause Modal */}
      {isPaused && !roundResult && (
        <div
          className="pf-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pause-modal-title"
        >
          <div className="pf-modal-card">
            <h2 id="pause-modal-title" className="pf-modal-title">
              Duel Paused
            </h2>
            <p className="pf-modal-sub">Nib &amp; Knock · Tabletop physics suspended</p>

            <div className="pf-stats-grid" style={{ marginBottom: 16 }}>
              <div className="pf-stat-box">
                <span className="pf-stat-num">
                  {scores[0]} – {scores[1]}
                </span>
                <span className="pf-stat-lbl">Series Score</span>
              </div>
              <div className="pf-stat-box">
                <span className="pf-stat-num">{streak}</span>
                <span className="pf-stat-lbl">Win Streak</span>
              </div>
            </div>

            <div className="pf-modal-stack">
              <button
                type="button"
                className="pf-chunky-btn primary"
                onClick={() => onSetPaused(false)}
              >
                Resume Duel
              </button>
              <button
                type="button"
                className="pf-chunky-btn"
                onClick={() => {
                  onSetPaused(false);
                  onRestartMatch();
                  resetDeskPositions();
                }}
              >
                Reset Tabletop
              </button>
              <button
                type="button"
                className="pf-chunky-btn"
                onClick={() => {
                  onSetPaused(false);
                  onChangePens();
                }}
              >
                Armory &amp; Obstacles
              </button>
              <button
                type="button"
                className="pf-chunky-btn"
                onClick={() => {
                  onSetPaused(false);
                  onMainMenu();
                }}
              >
                Studio Title
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory / Defeat / Draw Result Modal */}
      {roundResult && (
        <div
          className="pf-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="result-modal-title"
        >
          <div className="pf-modal-card">
            <h2 id="result-modal-title" className="pf-modal-title">
              {roundResult.winner === 'draw'
                ? 'Double Ring-Out · Draw!'
                : roundResult.winner === 0
                ? 'Masterful Strike · Victory!'
                : settings.mode === 'computer'
                ? 'Automaton Claims the Board'
                : 'Draftsman 2 Wins the Duel!'}
            </h2>
            <p className="pf-modal-sub">
              {roundResult.winner === 0
                ? `${PEN_ROSTER[settings.p0Pen].name} (${PEN_ROSTER[settings.p0Pen].codename}) · +30 Mastery`
                : 'Resetting instruments on the drafting board.'}
              {isSignedIn ? ' · Cloud Record Synced' : ''}
            </p>

            <div className="pf-stats-grid" style={{ marginBottom: 18 }}>
              <div className="pf-stat-box">
                <span className="pf-stat-num">
                  {roundResult.scoresSnapshot[0]} – {roundResult.scoresSnapshot[1]}
                </span>
                <span className="pf-stat-lbl">Series Score</span>
              </div>
              <div className="pf-stat-box">
                <span className="pf-stat-num">{roundResult.streakSnapshot}</span>
                <span className="pf-stat-lbl">Streak (Best {bestStreak})</span>
              </div>
              <div className="pf-stat-box">
                <span className="pf-stat-num">{roundResult.shots}</span>
                <span className="pf-stat-lbl">Total Strikes</span>
              </div>
            </div>

            <div className="pf-modal-stack">
              <button
                type="button"
                className="pf-chunky-btn primary"
                data-start="true"
                onClick={() => {
                  onNextMatch();
                  resetDeskPositions();
                }}
              >
                Next Duel
              </button>
              <button
                type="button"
                className="pf-chunky-btn"
                onClick={onChangePens}
              >
                Armory &amp; Obstacles
              </button>
              <button
                type="button"
                className="pf-chunky-btn"
                onClick={onMainMenu}
              >
                Studio Title
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
