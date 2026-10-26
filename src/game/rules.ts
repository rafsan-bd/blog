import { PenId, PenStyle, InkColor } from './penAssets';

export interface Vec2 {
  x: number;
  y: number;
}

export type ArenaLayoutId = 'classic' | 'bumpers' | 'fortress';
export type SurfaceThemeId = 'walnut' | 'blueprint' | 'cuttingmat';

export interface DeskObstacle {
  id: string;
  label: string;
  kind: 'eraser' | 'brass_weight' | 'corner_pin';
  position: Vec2;
  radius: number;
  restitution: number;
}

export interface PenConfig {
  id: PenId;
  name: string;
  nameDe: string;
  codename: string;
  role: string;
  roleDe: string;
  strength: string;
  weakness: string;
  spinTip: string;
  length: number; // meters-ish (1.05 to 1.50), scaled by 100 on desk -> 105 to 150 desk units
  width: number;  // 0.08 to 0.27 -> 8 to 27 desk units
  mass: number;
  com: number;    // center of mass offset along axis
  grip: number;
  bounce: number;
  rollFactor: number;
  flickPower: number;
  stats: [number, number, number, number, number]; // weight, speed, spin, grip, reach (1-5)
  unlockLevel: number;
}

export const PEN_ROSTER: Record<PenId, PenConfig> = {
  ballpoint: {
    id: 'ballpoint',
    name: 'Aero-Hex 0.7',
    nameDe: 'Aero-Hex 0.7',
    codename: 'DRAFT-01',
    role: 'Long hexagonal barrel. Sweeping arc flicks.',
    roleDe: 'Langer Sechskantschaft. Weite Bogenschüsse.',
    strength: 'Maximum reach across the drafting board.',
    weakness: 'Featherweight frame gets shoved by heavy billets.',
    spinTip: 'Grab near the vented cap for wide, whirling blade spins.',
    length: 1.5,
    width: 0.08,
    mass: 1.04,
    com: 0.04,
    grip: 0.2,
    bounce: 0.26,
    rollFactor: 0.35,
    flickPower: 1.02,
    stats: [2, 5, 4, 2, 5],
    unlockLevel: 1,
  },
  gel: {
    id: 'gel',
    name: 'Kuro-Gel Roller',
    nameDe: 'Kuro-Gel Roller',
    codename: 'INK-05',
    role: 'Balanced silicone grip. Pinpoint placement.',
    roleDe: 'Ausgewogener Silikongriff. Punktgenaue Platzierung.',
    strength: 'High-traction grip stops cleanly near the table lip.',
    weakness: 'Cushioned barrel absorbs a fraction of raw impact.',
    spinTip: 'Pull at a 45° angle for a controlled, tight spiral.',
    length: 1.41,
    width: 0.11,
    mass: 1.04,
    com: 0.03,
    grip: 0.3,
    bounce: 0.3,
    rollFactor: 0.4,
    flickPower: 1.02,
    stats: [2, 4, 3, 3, 3],
    unlockLevel: 1,
  },
  click: {
    id: 'click',
    name: 'Chrono-Snap Retract',
    nameDe: 'Chrono-Snap Klicker',
    codename: 'MECH-07',
    role: 'Spring-loaded plunger. Helicopter tail spins.',
    roleDe: 'Federmechanik. Schnelle Helikopter-Drehungen.',
    strength: 'Fastest rotational velocity in the armory.',
    weakness: 'Narrow profile can ricochet off heavy blockers.',
    spinTip: 'Grab either tip for rapid multi-hit helicopter rotations.',
    length: 1.4,
    width: 0.09,
    mass: 1.1,
    com: 0.02,
    grip: 0.22,
    bounce: 0.28,
    rollFactor: 0.35,
    flickPower: 1.0,
    stats: [2, 5, 5, 1, 2],
    unlockLevel: 1,
  },
  four: {
    id: 'four',
    name: 'Quadra-Chroma Index',
    nameDe: 'Quadra-Chroma 4x',
    codename: 'MULTI-04',
    role: 'Four-chamber chassis. Unyielding center rams.',
    roleDe: 'Vierkammer-Gehäuse. Wuchtige Rammstöße.',
    strength: 'Wide multi-ink body walls off incoming angles.',
    weakness: 'Lower top cruise speed.',
    spinTip: 'Grab dead-center for a straight, bulldozing ram.',
    length: 1.44,
    width: 0.16,
    mass: 1.1,
    com: -0.02,
    grip: 0.34,
    bounce: 0.22,
    rollFactor: 0.6,
    flickPower: 1.02,
    stats: [2, 3, 2, 4, 4],
    unlockLevel: 2,
  },
  fountain: {
    id: 'fountain',
    name: 'Sovereign Gold Nib',
    nameDe: 'Sovereign Goldfeder',
    codename: 'CALLI-09',
    role: 'Front-weighted iridium nib. Devastating whip.',
    roleDe: 'Kopflastige Goldfeder. Wuchtiger Peitschenhieb.',
    strength: 'Offset center of mass turns cap flicks into hammers.',
    weakness: 'Needs open table space to wind up its arc.',
    spinTip: 'Snap from the rear finial to whip the weighted gold nib.',
    length: 1.44,
    width: 0.12,
    mass: 1.03,
    com: 0.04,
    grip: 0.24,
    bounce: 0.27,
    rollFactor: 0.5,
    flickPower: 1.03,
    stats: [2, 4, 5, 2, 4],
    unlockLevel: 1,
  },
  marker: {
    id: 'marker',
    name: 'Chisel-King 3mm',
    nameDe: 'Chisel-King 3mm',
    codename: 'FELT-03',
    role: 'Stout studio cylinder. High-friction anchor.',
    roleDe: 'Kompakter Studio-Marker. Hohe Bremskraft.',
    strength: 'Brakes reliably right on the brink of the abyss.',
    weakness: 'Shorter glide range across the board.',
    spinTip: 'Offset your grab slightly for a compact hook shot.',
    length: 1.37,
    width: 0.15,
    mass: 1.15,
    com: -0.06,
    grip: 0.38,
    bounce: 0.24,
    rollFactor: 0.65,
    flickPower: 1.0,
    stats: [3, 3, 3, 4, 2],
    unlockLevel: 1,
  },
  highlighter: {
    id: 'highlighter',
    name: 'Prism-Wedge Fluo',
    nameDe: 'Prism-Wedge Neon',
    codename: 'WEDGE-02',
    role: 'Flat architectural wedge. Refuses to roll.',
    roleDe: 'Flacher Keil. Rollt fast nie über die Kante.',
    strength: 'Broad flat footprint anchors against knockback.',
    weakness: 'Shortest wingspan in the collection.',
    spinTip: 'Clip a corner to pivot the wide chassis like a paddle.',
    length: 1.05,
    width: 0.27,
    mass: 1.26,
    com: 0.08,
    grip: 0.46,
    bounce: 0.2,
    rollFactor: 0.75,
    flickPower: 1.0,
    stats: [3, 2, 4, 5, 1],
    unlockLevel: 4,
  },
  metal: {
    id: 'metal',
    name: 'Titanium Billet Mk.IV',
    nameDe: 'Titan-Billet Mk.IV',
    codename: 'LATHE-88',
    role: 'CNC-knurled steel barrel. Crushing momentum.',
    roleDe: 'CNC-gefräster Stahlschaft. Enorme Wucht.',
    strength: 'Heaviest mass on the table — launches lighter pens flying.',
    weakness: 'Low surface drag — over-pulling will send you skating off.',
    spinTip: 'Use measured 60% power to smash without self-ringing out.',
    length: 1.4,
    width: 0.12,
    mass: 1.35,
    com: 0.02,
    grip: 0.05,
    bounce: 0.34,
    rollFactor: 0.8,
    flickPower: 0.98,
    stats: [4, 4, 3, 1, 3],
    unlockLevel: 1,
  },
};

export const PEN_ORDER: PenId[] = [
  'ballpoint',
  'gel',
  'click',
  'four',
  'fountain',
  'marker',
  'highlighter',
  'metal',
];

export const DESK_PHYSICS = {
  deskWidth: 712,
  deskHeight: 366,
  cornerRadius: 29,
  unitsPerMeter: 100,
  linearDamping: 1.0,
  angularDamping: 1.0,
  gripDamping: 2.0,
  gripSpinDamping: 3.0,
  slideFriction: 2.17,
  spinFriction: 8.0,
  maxDrag: 180,
  deadZone: 8,
  maxImpulse: 5.65,
  axialEfficiency: 0.44,
  straightGrabShare: 0.2,
  restSpeed: 4.3,
  restAngularSpeed: 0.04,
};

export function getArenaObstacles(layout: ArenaLayoutId): DeskObstacle[] {
  const cx = DESK_PHYSICS.deskWidth / 2;
  const cy = DESK_PHYSICS.deskHeight / 2;
  if (layout === 'bumpers') {
    return [
      {
        id: 'compass-center',
        label: 'Brass Compass Weight',
        kind: 'brass_weight',
        position: { x: cx, y: cy },
        radius: 17,
        restitution: 0.78,
      },
      {
        id: 'eraser-top',
        label: 'Gum Eraser North',
        kind: 'eraser',
        position: { x: cx, y: cy - 102 },
        radius: 20,
        restitution: 0.92,
      },
      {
        id: 'eraser-bottom',
        label: 'Gum Eraser South',
        kind: 'eraser',
        position: { x: cx, y: cy + 102 },
        radius: 20,
        restitution: 0.92,
      },
    ];
  }
  if (layout === 'fortress') {
    const padX = 108;
    const padY = 66;
    return [
      {
        id: 'pin-nw',
        label: 'Drafting Pin NW',
        kind: 'corner_pin',
        position: { x: padX, y: padY },
        radius: 13,
        restitution: 0.84,
      },
      {
        id: 'pin-ne',
        label: 'Drafting Pin NE',
        kind: 'corner_pin',
        position: { x: DESK_PHYSICS.deskWidth - padX, y: padY },
        radius: 13,
        restitution: 0.84,
      },
      {
        id: 'pin-sw',
        label: 'Drafting Pin SW',
        kind: 'corner_pin',
        position: { x: padX, y: DESK_PHYSICS.deskHeight - padY },
        radius: 13,
        restitution: 0.84,
      },
      {
        id: 'pin-se',
        label: 'Drafting Pin SE',
        kind: 'corner_pin',
        position: { x: DESK_PHYSICS.deskWidth - padX, y: DESK_PHYSICS.deskHeight - padY },
        radius: 13,
        restitution: 0.84,
      },
    ];
  }
  return [];
}

export interface PenState {
  id: number; // 0 or 1
  penId: PenId;
  style: PenStyle;
  ink: InkColor;
  position: Vec2;
  velocity: Vec2;
  angle: number; // radians
  angularVelocity: number; // rad/s
  length: number; // desk units
  width: number;  // desk units
  mass: number;
  comOffset: number; // desk units
  grip: number;
  bounce: number;
  flickPower: number;
  fallen: boolean;
  fallTimer: number; // 0 to 0.42s
  wobble: boolean;
  overhang: number;
}

export type AiLevel = 'easy' | 'normal' | 'hard' | 'master';

export function createInitialPenState(
  slot: 0 | 1,
  penId: PenId,
  style: PenStyle = 'real',
  ink: InkColor = 'blue'
): PenState {
  const cfg = PEN_ROSTER[penId];
  const length = cfg.length * DESK_PHYSICS.unitsPerMeter;
  const width = Math.max(10, cfg.width * DESK_PHYSICS.unitsPerMeter);
  const x = slot === 0 ? DESK_PHYSICS.deskWidth * 0.28 : DESK_PHYSICS.deskWidth * 0.72;
  const y = DESK_PHYSICS.deskHeight * 0.5;
  const angle = slot === 0 ? -Math.PI / 2 + 0.08 : Math.PI / 2 + 0.06;

  return {
    id: slot,
    penId,
    style,
    ink,
    position: { x, y },
    velocity: { x: 0, y: 0 },
    angle,
    angularVelocity: 0,
    length,
    width,
    mass: cfg.mass,
    comOffset: cfg.com * DESK_PHYSICS.unitsPerMeter,
    grip: cfg.grip,
    bounce: cfg.bounce,
    flickPower: cfg.flickPower,
    fallen: false,
    fallTimer: 0,
    wobble: false,
    overhang: 0,
  };
}

export function getPenCenterOfMass(pen: Pick<PenState, 'position' | 'angle' | 'comOffset'>): Vec2 {
  return {
    x: pen.position.x + Math.cos(pen.angle) * pen.comOffset,
    y: pen.position.y + Math.sin(pen.angle) * pen.comOffset,
  };
}

export function getPenEndpoints(pen: Pick<PenState, 'position' | 'angle' | 'length'>): [Vec2, Vec2] {
  const hx = (Math.cos(pen.angle) * pen.length) / 2;
  const hy = (Math.sin(pen.angle) * pen.length) / 2;
  return [
    { x: pen.position.x - hx, y: pen.position.y - hy }, // cap/back end
    { x: pen.position.x + hx, y: pen.position.y + hy }, // tip end
  ];
}

export function pointInDesk(
  pt: Vec2,
  width = DESK_PHYSICS.deskWidth,
  height = DESK_PHYSICS.deskHeight,
  radius = DESK_PHYSICS.cornerRadius,
  inset = 0
): boolean {
  const minX = inset;
  const minY = inset;
  const maxX = width - inset;
  const maxY = height - inset;
  if (pt.x < minX || pt.x > maxX || pt.y < minY || pt.y > maxY) {
    return false;
  }
  const r = Math.max(0, Math.min(radius, (maxX - minX) / 2, (maxY - minY) / 2));
  if (r <= 0) return true;

  // Check rounded corners
  const cx = pt.x < minX + r ? minX + r : pt.x > maxX - r ? maxX - r : pt.x;
  const cy = pt.y < minY + r ? minY + r : pt.y > maxY - r ? maxY - r : pt.y;
  const dx = pt.x - cx;
  const dy = pt.y - cy;
  return dx * dx + dy * dy <= r * r + 1e-6;
}

export function evaluatePenState(
  pen: Pick<PenState, 'position' | 'angle' | 'length' | 'comOffset'>,
  inset = 0
): { fallen: boolean; wobble: boolean; overhang: number } {
  const com = getPenCenterOfMass(pen);
  const fallen = !pointInDesk(com, DESK_PHYSICS.deskWidth, DESK_PHYSICS.deskHeight, DESK_PHYSICS.cornerRadius, inset);
  const [p0, p1] = getPenEndpoints(pen);
  const samples = 10;
  let outCount = 0;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const sx = p0.x + (p1.x - p0.x) * t;
    const sy = p0.y + (p1.y - p0.y) * t;
    if (!pointInDesk({ x: sx, y: sy }, DESK_PHYSICS.deskWidth, DESK_PHYSICS.deskHeight, DESK_PHYSICS.cornerRadius, inset)) {
      outCount++;
    }
  }
  const overhang = outCount / (samples + 1);
  return {
    fallen,
    wobble: !fallen && overhang >= 0.35,
    overhang,
  };
}

export function shapePowerCurve(pullRatio: number): number {
  const pulls = [0, 0.25, 0.5, 0.8, 1.0];
  const powers = [0, 0.12, 0.35, 0.7, 1.0];
  const clamped = Math.max(0, Math.min(1, pullRatio));
  for (let i = 1; i < pulls.length; i++) {
    if (clamped <= pulls[i]) {
      const t = (clamped - pulls[i - 1]) / (pulls[i] - pulls[i - 1]);
      return powers[i - 1] + t * (powers[i] - powers[i - 1]);
    }
  }
  return 1;
}

export function closestPointOnPen(pt: Vec2, pen: Pick<PenState, 'position' | 'angle' | 'length'>): Vec2 {
  const cos = Math.cos(pen.angle);
  const sin = Math.sin(pen.angle);
  const half = pen.length / 2;
  const proj = Math.max(-half, Math.min(half, (pt.x - pen.position.x) * cos + (pt.y - pen.position.y) * sin));
  return {
    x: pen.position.x + proj * cos,
    y: pen.position.y + proj * sin,
  };
}

export interface FlickCalculation {
  grabPoint: Vec2;
  impulse: Vec2;
  angularImpulse: number;
  power: number;
  shapedPower: number;
  isOverdrive?: boolean;
}

export function calculateFlickImpulse(
  pen: Pick<PenState, 'position' | 'angle' | 'length' | 'comOffset' | 'mass' | 'flickPower'>,
  grabWorld: Vec2,
  releaseWorld: Vec2,
  maxDrag = DESK_PHYSICS.maxDrag,
  overdriveBoost = false
): FlickCalculation | null {
  const dx = grabWorld.x - releaseWorld.x;
  const dy = grabWorld.y - releaseWorld.y;
  const dist = Math.hypot(dx, dy);
  if (dist < DESK_PHYSICS.deadZone) return null;

  const power = Math.min(1, dist / maxDrag);
  const shapedPower = shapePowerCurve(power);

  const cos = Math.cos(pen.angle);
  const sin = Math.sin(pen.angle);
  const dirX = dx / dist;
  const dirY = dy / dist;

  // Axial vs perpendicular efficiency (flicking sideways transfers more energy than poking end-on)
  const axial = dirX * cos + dirY * sin;
  const perp = -dirX * sin + dirY * cos;
  const directionalScale = Math.hypot(DESK_PHYSICS.axialEfficiency * axial, perp);

  const boostMult = overdriveBoost ? 1.28 : 1.0;
  const maxImp = DESK_PHYSICS.maxImpulse * Math.sqrt(pen.mass) * pen.flickPower * 115 * boostMult;
  const mag = shapedPower * maxImp * directionalScale;
  const impulse = { x: dirX * mag, y: dirY * mag };

  const grabPoint = closestPointOnPen(grabWorld, pen);
  const com = getPenCenterOfMass(pen);
  const rx = (grabPoint.x - com.x) / DESK_PHYSICS.unitsPerMeter;
  const ry = (grabPoint.y - com.y) / DESK_PHYSICS.unitsPerMeter;

  // Deadband near center for straight pushes
  const offsetAlong = (grabPoint.x - com.x) * cos + (grabPoint.y - com.y) * sin;
  const deadShare = pen.length * DESK_PHYSICS.straightGrabShare;
  const spinScale =
    Math.abs(offsetAlong) <= deadShare
      ? 0
      : (Math.abs(offsetAlong) - deadShare) / Math.max(1, pen.length / 2 - deadShare);

  const rawTorque = (rx * impulse.y - ry * impulse.x) / 18;
  const angularImpulse = rawTorque * spinScale;

  return {
    grabPoint,
    impulse,
    angularImpulse,
    power,
    shapedPower,
    isOverdrive: overdriveBoost,
  };
}

export function applyFlickToPen(pen: PenState, flick: FlickCalculation): void {
  pen.velocity.x += flick.impulse.x / pen.mass;
  pen.velocity.y += flick.impulse.y / pen.mass;
  pen.angularVelocity += flick.angularImpulse / pen.mass;
}

export function calculateOverdriveGain(flickPower: number, collisionSpeed = 0): number {
  const fromShot = Math.round(flickPower * 34);
  const fromHit = Math.min(45, Math.round(collisionSpeed / 8));
  return Math.min(100, fromShot + fromHit);
}

function closestPointsBetweenSegments(
  a0: Vec2,
  a1: Vec2,
  b0: Vec2,
  b1: Vec2
): { pa: Vec2; pb: Vec2; distSq: number } {
  const dax = a1.x - a0.x;
  const day = a1.y - a0.y;
  const dbx = b1.x - b0.x;
  const dby = b1.y - b0.y;
  const rx = a0.x - b0.x;
  const ry = a0.y - b0.y;

  const a = dax * dax + day * day;
  const e = dbx * dbx + dby * dby;
  const f = dbx * rx + dby * ry;

  let s = 0;
  let t = 0;
  if (a <= 1e-6 && e <= 1e-6) {
    s = 0;
    t = 0;
  } else if (a <= 1e-6) {
    s = 0;
    t = Math.max(0, Math.min(1, f / e));
  } else {
    const c = dax * rx + day * ry;
    if (e <= 1e-6) {
      t = 0;
      s = Math.max(0, Math.min(1, -c / a));
    } else {
      const b = dax * dbx + day * dby;
      const denom = a * e - b * b;
      if (denom !== 0) {
        s = Math.max(0, Math.min(1, (b * f - c * e) / denom));
      } else {
        s = 0;
      }
      t = (b * s + f) / e;
      if (t < 0) {
        t = 0;
        s = Math.max(0, Math.min(1, -c / a));
      } else if (t > 1) {
        t = 1;
        s = Math.max(0, Math.min(1, (b - c) / a));
      }
    }
  }

  const pa = { x: a0.x + dax * s, y: a0.y + day * s };
  const pb = { x: b0.x + dbx * t, y: b0.y + dby * t };
  const dx = pa.x - pb.x;
  const dy = pa.y - pb.y;
  return { pa, pb, distSq: dx * dx + dy * dy };
}

export interface StepCollisionEvent {
  point: Vec2;
  impactSpeed: number;
  kind?: 'pen' | 'obstacle';
}

export function stepSimulation(
  pens: [PenState, PenState],
  dt: number,
  inset = 0,
  obstacles: DeskObstacle[] = []
): StepCollisionEvent | null {
  const clampedDt = Math.min(dt, 0.05);
  const substeps = 4;
  const subDt = clampedDt / substeps;
  let heaviestCollision: StepCollisionEvent | null = null;

  for (let step = 0; step < substeps; step++) {
    for (const pen of pens) {
      if (pen.fallen) {
        pen.fallTimer = Math.min(0.45, pen.fallTimer + subDt);
        pen.position.x += pen.velocity.x * subDt * 0.35;
        pen.position.y += pen.velocity.y * subDt * 0.35;
        pen.angle += pen.angularVelocity * subDt * 0.5;
        continue;
      }

      // Advance position and rotation
      pen.position.x += pen.velocity.x * subDt;
      pen.position.y += pen.velocity.y * subDt;
      pen.angle += pen.angularVelocity * subDt;

      // Damping & surface friction
      const linDamp = DESK_PHYSICS.linearDamping + DESK_PHYSICS.gripDamping * pen.grip;
      const angDamp = DESK_PHYSICS.angularDamping + DESK_PHYSICS.gripSpinDamping * pen.grip;

      const speed = Math.hypot(pen.velocity.x, pen.velocity.y);
      if (speed > 0) {
        const frictionDrop = DESK_PHYSICS.slideFriction * 38 * subDt;
        const dampedSpeed = Math.max(0, speed * Math.exp(-linDamp * subDt) - frictionDrop);
        if (dampedSpeed < DESK_PHYSICS.restSpeed) {
          pen.velocity.x = 0;
          pen.velocity.y = 0;
        } else {
          const ratio = dampedSpeed / speed;
          pen.velocity.x *= ratio;
          pen.velocity.y *= ratio;
        }
      }

      const absAng = Math.abs(pen.angularVelocity);
      if (absAng > 0) {
        const spinDrop = DESK_PHYSICS.spinFriction * 0.35 * subDt;
        const nextAng = Math.max(0, absAng * Math.exp(-angDamp * subDt) - spinDrop);
        pen.angularVelocity = nextAng < DESK_PHYSICS.restAngularSpeed ? 0 : Math.sign(pen.angularVelocity) * nextAng;
      }
    }

    // Check pen-to-obstacle collisions
    if (obstacles.length > 0) {
      for (const pen of pens) {
        if (pen.fallen) continue;
        for (const obs of obstacles) {
          const ptOnPen = closestPointOnPen(obs.position, pen);
          const dx = ptOnPen.x - obs.position.x;
          const dy = ptOnPen.y - obs.position.y;
          const distSq = dx * dx + dy * dy;
          const minRad = pen.width * 0.52 + obs.radius;
          if (distSq < minRad * minRad) {
            const dist = Math.sqrt(distSq) || 0.001;
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minRad - dist;
            pen.position.x += nx * overlap;
            pen.position.y += ny * overlap;

            const rx = ptOnPen.x - pen.position.x;
            const ry = ptOnPen.y - pen.position.y;
            const vx = pen.velocity.x - pen.angularVelocity * ry;
            const vy = pen.velocity.y + pen.angularVelocity * rx;
            const velAlongNormal = vx * nx + vy * ny;

            if (velAlongNormal < 0) {
              const e = obs.restitution;
              const rn = rx * ny - ry * nx;
              const inertia = (pen.mass * pen.length * pen.length) / 12;
              const invM = 1 / pen.mass;
              const j = (-(1 + e) * velAlongNormal) / (invM + (rn * rn) / inertia);

              const impX = j * nx;
              const impY = j * ny;
              pen.velocity.x += impX * invM;
              pen.velocity.y += impY * invM;
              pen.angularVelocity += ((rx * impY - ry * impX) / inertia) * 1.25;

              const impactSpeed = Math.abs(velAlongNormal);
              if (!heaviestCollision || impactSpeed > heaviestCollision.impactSpeed) {
                heaviestCollision = {
                  point: ptOnPen,
                  impactSpeed,
                  kind: 'obstacle',
                };
              }
            }
          }
        }
      }
    }

    // Check capsule-capsule collision between pen 0 and pen 1 if neither has fallen
    const p0 = pens[0];
    const p1 = pens[1];
    if (!p0.fallen && !p1.fallen) {
      const [a0, a1] = getPenEndpoints(p0);
      const [b0, b1] = getPenEndpoints(p1);
      const { pa, pb, distSq } = closestPointsBetweenSegments(a0, a1, b0, b1);
      const minRadius = (p0.width + p1.width) * 0.52;
      if (distSq < minRadius * minRadius) {
        const dist = Math.sqrt(distSq) || 0.001;
        const nx = (pa.x - pb.x) / dist;
        const ny = (pa.y - pb.y) / dist;
        const overlap = minRadius - dist;

        // Separate pens proportionally to inverse mass
        const invM0 = 1 / p0.mass;
        const invM1 = 1 / p1.mass;
        const totalInvM = invM0 + invM1;
        p0.position.x += nx * overlap * (invM0 / totalInvM);
        p0.position.y += ny * overlap * (invM0 / totalInvM);
        p1.position.x -= nx * overlap * (invM1 / totalInvM);
        p1.position.y -= ny * overlap * (invM1 / totalInvM);

        // Contact point velocity including angular contribution
        const r0x = pa.x - p0.position.x;
        const r0y = pa.y - p0.position.y;
        const r1x = pb.x - p1.position.x;
        const r1y = pb.y - p1.position.y;

        const v0x = p0.velocity.x - p0.angularVelocity * r0y;
        const v0y = p0.velocity.y + p0.angularVelocity * r0x;
        const v1x = p1.velocity.x - p1.angularVelocity * r1y;
        const v1y = p1.velocity.y + p1.angularVelocity * r1x;

        const rvx = v0x - v1x;
        const rvy = v0y - v1y;
        const velAlongNormal = rvx * nx + rvy * ny;

        if (velAlongNormal < 0) {
          const restitution = Math.min(0.92, (p0.bounce + p1.bounce) * 0.5 + 0.52);
          const rn0 = r0x * ny - r0y * nx;
          const rn1 = r1x * ny - r1y * nx;
          const i0 = (p0.mass * p0.length * p0.length) / 12;
          const i1 = (p1.mass * p1.length * p1.length) / 12;

          const denom = invM0 + invM1 + (rn0 * rn0) / i0 + (rn1 * rn1) / i1;
          const j = (-(1 + restitution) * velAlongNormal) / denom;

          const impX = j * nx;
          const impY = j * ny;

          p0.velocity.x += impX * invM0;
          p0.velocity.y += impY * invM0;
          p1.velocity.x -= impX * invM1;
          p1.velocity.y -= impY * invM1;

          p0.angularVelocity += ((r0x * impY - r0y * impX) / i0) * 1.35;
          p1.angularVelocity -= ((r1x * impY - r1y * impX) / i1) * 1.35;

          const impactSpeed = Math.abs(velAlongNormal);
          if (!heaviestCollision || impactSpeed > heaviestCollision.impactSpeed) {
            heaviestCollision = {
              point: { x: (pa.x + pb.x) * 0.5, y: (pa.y + pb.y) * 0.5 },
              impactSpeed,
              kind: 'pen',
            };
          }
        }
      }
    }

    // Update fallen & overhang states
    for (const pen of pens) {
      if (!pen.fallen) {
        const st = evaluatePenState(pen, inset);
        pen.wobble = st.wobble;
        pen.overhang = st.overhang;
        if (st.fallen) {
          pen.fallen = true;
          pen.fallTimer = 0.01;
        }
      }
    }
  }

  return heaviestCollision;
}

export function arePensAtRest(pens: [PenState, PenState]): boolean {
  return pens.every((p) => {
    if (p.fallen) return p.fallTimer >= 0.4;
    return (
      Math.hypot(p.velocity.x, p.velocity.y) < DESK_PHYSICS.restSpeed &&
      Math.abs(p.angularVelocity) < DESK_PHYSICS.restAngularSpeed
    );
  });
}

export type RoundOutcome = 'ongoing' | 'p0_win' | 'p1_win' | 'draw';

export function resolveRoundOutcome(pens: [PenState, PenState]): RoundOutcome {
  if (!arePensAtRest(pens)) return 'ongoing';
  const f0 = pens[0].fallen;
  const f1 = pens[1].fallen;
  if (f0 && f1) return 'draw';
  if (f1 && !f0) return 'p0_win';
  if (f0 && !f1) return 'p1_win';
  return 'ongoing';
}

export interface AiFlickDecision extends FlickCalculation {
  tacticName: string;
}

function clonePenForRollout(pen: PenState): PenState {
  return {
    ...pen,
    position: { x: pen.position.x, y: pen.position.y },
    velocity: { x: pen.velocity.x, y: pen.velocity.y },
  };
}

export function distanceToNearestEdge(
  pt: Vec2,
  width = DESK_PHYSICS.deskWidth,
  height = DESK_PHYSICS.deskHeight
): number {
  const dx = Math.min(pt.x, width - pt.x);
  const dy = Math.min(pt.y, height - pt.y);
  return Math.max(0, Math.min(dx, dy));
}

function evaluateRolloutCandidate(
  aiPen: PenState,
  targetPen: PenState,
  flick: FlickCalculation,
  obstacles: DeskObstacle[],
  simSteps: number
): {
  score: number;
  knockout: boolean;
  hitTarget: boolean;
  hitObstacle: boolean;
} {
  const simTarget = clonePenForRollout(targetPen);
  const simAi = clonePenForRollout(aiPen);
  applyFlickToPen(simAi, flick);

  const simPens: [PenState, PenState] =
    aiPen.id === 1 ? [simTarget, simAi] : [simAi, simTarget];

  let hitTarget = false;
  let hitObstacle = false;
  let maxPenImpactSpeed = 0;

  for (let s = 0; s < simSteps; s++) {
    const ev = stepSimulation(simPens, 1 / 30, 0, obstacles);
    if (ev) {
      if (ev.kind === 'pen') {
        hitTarget = true;
        if (ev.impactSpeed > maxPenImpactSpeed) {
          maxPenImpactSpeed = ev.impactSpeed;
        }
      } else if (ev.kind === 'obstacle') {
        hitObstacle = true;
      }
    }
    if (arePensAtRest(simPens)) break;
  }

  const targetEdgeBefore = distanceToNearestEdge(getPenCenterOfMass(targetPen));
  const targetEdgeAfter = distanceToNearestEdge(getPenCenterOfMass(simTarget));
  const aiEdgeBefore = distanceToNearestEdge(getPenCenterOfMass(aiPen));
  const aiEdgeAfter = distanceToNearestEdge(getPenCenterOfMass(simAi));

  // Self-ring-out is heavily penalized
  if (simAi.fallen && !simTarget.fallen) {
    return {
      score: -15000 - flick.power * 200,
      knockout: false,
      hitTarget,
      hitObstacle,
    };
  }

  // Double ring-out draw is only acceptable as a last resort
  if (simAi.fallen && simTarget.fallen) {
    return {
      score: -3200,
      knockout: false,
      hitTarget,
      hitObstacle,
    };
  }

  // Clean knockout victory!
  if (simTarget.fallen && !simAi.fallen) {
    const safetyBonus = Math.min(120, aiEdgeAfter) * 5 - simAi.overhang * 1200;
    const efficiencyBonus = (1 - flick.power * 0.25) * 300;
    return {
      score: 12000 + safetyBonus + efficiencyBonus,
      knockout: true,
      hitTarget,
      hitObstacle,
    };
  }

  // Both pens still on the table: score tactical advantage
  const edgePushDelta = targetEdgeBefore - targetEdgeAfter;
  let score = 0;

  if (hitTarget) {
    score += 480 + maxPenImpactSpeed * 2.1;
    score += edgePushDelta * 16.5;
    score += Math.max(0, 160 - targetEdgeAfter) * 4.5;
    score += simTarget.overhang * 2100 + (simTarget.wobble ? 750 : 0);
  } else {
    // Missed opponent pen
    score -= 320;
    // However, if AI was in severe edge danger and escaped to safety, reward recovery
    if ((aiPen.wobble || aiEdgeBefore < 44) && aiEdgeAfter > 72 && !simAi.wobble) {
      score += 640 + (aiEdgeAfter - aiEdgeBefore) * 6;
    } else {
      // Otherwise reward closing distance to opponent safely
      const distBefore = Math.hypot(
        targetPen.position.x - aiPen.position.x,
        targetPen.position.y - aiPen.position.y
      );
      const distAfter = Math.hypot(
        simTarget.position.x - simAi.position.x,
        simTarget.position.y - simAi.position.y
      );
      score += (distBefore - distAfter) * 2.2;
    }
  }

  // AI positional safety & board control
  score += Math.min(105, aiEdgeAfter) * 4.6;
  score -= simAi.overhang * 2500;
  if (simAi.wobble) score -= 1050;

  // Penalize slamming into an obstacle without hitting the target pen
  if (hitObstacle && !hitTarget) {
    score -= 420;
  }

  return {
    score,
    knockout: false,
    hitTarget,
    hitObstacle,
  };
}

export function chooseAiShot(
  aiPen: PenState,
  targetPen: PenState,
  level: AiLevel = 'normal',
  obstacles: DeskObstacle[] = [],
  overdriveReady = false
): AiFlickDecision {
  const [capEnd, tipEnd] = getPenEndpoints(aiPen);
  const [targetCap, targetTip] = getPenEndpoints(targetPen);
  const targetCom = getPenCenterOfMass(targetPen);

  // Compute nearest edge direction for targetPen so AI can aim to drive target toward that edge
  const distLeft = targetCom.x;
  const distRight = DESK_PHYSICS.deskWidth - targetCom.x;
  const distTop = targetCom.y;
  const distBottom = DESK_PHYSICS.deskHeight - targetCom.y;
  const minEdgeDist = Math.min(distLeft, distRight, distTop, distBottom);

  let pushDir = { x: -1, y: 0 };
  if (minEdgeDist === distRight) pushDir = { x: 1, y: 0 };
  else if (minEdgeDist === distTop) pushDir = { x: 0, y: -1 };
  else if (minEdgeDist === distBottom) pushDir = { x: 0, y: 1 };

  // Aim point slightly behind target pen relative to the nearest drop-off edge
  const edgeLeveragePoint = {
    x: targetCom.x - pushDir.x * 14,
    y: targetCom.y - pushDir.y * 14,
  };

  const aimPoints: { pt: Vec2; label: string }[] = [
    { pt: targetCom, label: 'Center Ram' },
    { pt: edgeLeveragePoint, label: 'Edge Drive' },
    { pt: targetCap, label: 'Cap Leverage' },
    { pt: targetTip, label: 'Nib Clip' },
  ];

  // Add obstacle-bypass & bank waypoints so the Automaton navigates around center bumpers
  if (obstacles.length > 0) {
    const midX = (aiPen.position.x + targetCom.x) * 0.5;
    aimPoints.push(
      { pt: { x: targetCom.x, y: Math.max(55, targetCom.y - 52) }, label: 'North Curve' },
      { pt: { x: targetCom.x, y: Math.min(DESK_PHYSICS.deskHeight - 55, targetCom.y + 52) }, label: 'South Curve' },
      { pt: { x: midX, y: 74 }, label: 'Upper Flank' },
      { pt: { x: midX, y: DESK_PHYSICS.deskHeight - 74 }, label: 'Lower Flank' }
    );
  }

  // If AI pen is perilously close to the edge, add center-table recovery waypoint
  if (aiPen.wobble || distanceToNearestEdge(aiPen.position) < 48) {
    aimPoints.push({
      pt: { x: DESK_PHYSICS.deskWidth * 0.5, y: DESK_PHYSICS.deskHeight * 0.5 },
      label: 'Center Recovery',
    });
  }

  const grabTs =
    level === 'easy'
      ? [0.25, 0.5, 0.75]
      : [0.12, 0.3, 0.5, 0.7, 0.88];

  const angleOffsetsDeg =
    level === 'easy'
      ? [-12, 0, 12]
      : level === 'normal'
      ? [-20, -8, 0, 8, 20]
      : [-28, -14, -5, 0, 5, 14, 28];

  const powerSteps =
    level === 'easy'
      ? [0.7, 0.88]
      : level === 'normal'
      ? [0.7, 0.86, 0.98]
      : [0.64, 0.82, 0.94, 1.0];

  const simSteps = level === 'easy' ? 22 : level === 'normal' ? 26 : 30;
  const canUseOverdrive = overdriveReady && level !== 'easy';

  let bestDecision: AiFlickDecision | null = null;
  let bestScore = -Infinity;

  for (const grabT of grabTs) {
    const grabWorld = {
      x: capEnd.x + (tipEnd.x - capEnd.x) * grabT,
      y: capEnd.y + (tipEnd.y - capEnd.y) * grabT,
    };
    const isWhipGrab = grabT <= 0.2 || grabT >= 0.8;

    // Deduplicate candidate angles within 3.5 degrees for this grab point
    const candidateAngles: { angle: number; label: string }[] = [];
    for (const aimTarget of aimPoints) {
      const toX = aimTarget.pt.x - grabWorld.x;
      const toY = aimTarget.pt.y - grabWorld.y;
      const baseAngle = Math.atan2(toY, toX);

      for (const deg of angleOffsetsDeg) {
        const candidateAngle = baseAngle + (deg * Math.PI) / 180;
        const isDuplicate = candidateAngles.some(
          (existing) => Math.abs( Math.atan2(Math.sin(candidateAngle - existing.angle), Math.cos(candidateAngle - existing.angle)) ) < 0.06
        );
        if (!isDuplicate) {
          candidateAngles.push({ angle: candidateAngle, label: aimTarget.label });
        }
      }
    }

    for (const { angle, label } of candidateAngles) {
      for (const pwr of powerSteps) {
        const boostModes = canUseOverdrive && pwr >= 0.9 ? [false, true] : [false];
        for (const useBoost of boostModes) {
          const pullDist = pwr * DESK_PHYSICS.maxDrag;
          const releaseWorld = {
            x: grabWorld.x - Math.cos(angle) * pullDist,
            y: grabWorld.y - Math.sin(angle) * pullDist,
          };

          const flick = calculateFlickImpulse(
            aiPen,
            grabWorld,
            releaseWorld,
            DESK_PHYSICS.maxDrag,
            useBoost
          );
          if (!flick) continue;

          const result = evaluateRolloutCandidate(
            aiPen,
            targetPen,
            flick,
            obstacles,
            simSteps
          );

          // Slight deterministic tie-breaker / difficulty imperfection
          const jitter =
            level === 'easy'
              ? Math.sin(grabT * 19 + angle * 3 + pwr * 11) * 85
              : level === 'normal'
              ? Math.sin(grabT * 13 + angle * 2) * 18
              : 0;

          const totalScore = result.score + jitter;
          if (totalScore > bestScore) {
            bestScore = totalScore;
            const tacticLabel = useBoost
              ? 'Overdrive Breaker'
              : result.knockout
              ? isWhipGrab
                ? 'Whip Knockout'
                : 'Knockout Strike'
              : isWhipGrab
              ? `Whip ${label}`
              : label;

            bestDecision = {
              ...flick,
              tacticName: tacticLabel,
            };
          }
        }
      }
    }
  }

  if (bestDecision) {
    return bestDecision;
  }

  // Fallback direct strike if all rollouts were filtered
  const toTargetX = targetPen.position.x - aiPen.position.x;
  const toTargetY = targetPen.position.y - aiPen.position.y;
  const dist = Math.hypot(toTargetX, toTargetY) || 1;
  return {
    grabPoint: aiPen.position,
    impulse: { x: (toTargetX / dist) * 420, y: (toTargetY / dist) * 420 },
    angularImpulse: 5,
    power: 0.85,
    shapedPower: 0.78,
    tacticName: 'Direct Strike',
  };
}

