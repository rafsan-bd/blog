import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Deterministic Dirty Dozen & Eight-Pillar Security Rules Validator
 * Verifies both static rule invariants in firestore.rules and payload validation logic.
 */

export interface SimAuth {
  uid: string;
  email_verified: boolean;
}

export const SERVER_TIME = '2026-10-23T16:45:00.000Z';

const VALID_PENS = new Set([
  'ballpoint',
  'gel',
  'click',
  'four',
  'fountain',
  'marker',
  'highlighter',
  'metal',
]);
const VALID_INKS = new Set(['blue', 'violet', 'green']);

const PROFILE_KEYS = [
  'uid',
  'callsign',
  'avatarColor',
  'favoritePen',
  'favoriteInk',
  'played',
  'won',
  'lost',
  'draws',
  'streak',
  'bestStreak',
  'createdAt',
  'updatedAt',
];

const MATCH_KEYS = [
  'uid',
  'playerPen',
  'opponentPen',
  'mode',
  'arenaLayout',
  'outcome',
  'shots',
  'createdAt',
];

export function isValidId(id: unknown): boolean {
  return (
    typeof id === 'string' &&
    id.length >= 1 &&
    id.length <= 128 &&
    /^[a-zA-Z0-9_-]+$/.test(id)
  );
}

export function isValidPlayerProfile(data: Record<string, unknown>, auth: SimAuth | null): boolean {
  if (!auth) return false;
  const keys = Object.keys(data);
  if (keys.length !== PROFILE_KEYS.length) return false;
  if (!PROFILE_KEYS.every((k) => Object.prototype.hasOwnProperty.call(data, k))) return false;

  if (!isValidId(data.uid) || data.uid !== auth.uid) return false;
  if (typeof data.callsign !== 'string' || data.callsign.length < 1 || data.callsign.length > 32) {
    return false;
  }
  if (
    typeof data.avatarColor !== 'string' ||
    data.avatarColor.length < 4 ||
    data.avatarColor.length > 16 ||
    !/^#[0-9a-fA-F]{3,8}$/.test(data.avatarColor)
  ) {
    return false;
  }
  if (typeof data.favoritePen !== 'string' || !VALID_PENS.has(data.favoritePen)) return false;
  if (typeof data.favoriteInk !== 'string' || !VALID_INKS.has(data.favoriteInk)) return false;

  const ints = ['played', 'won', 'lost', 'draws', 'streak', 'bestStreak'] as const;
  for (const k of ints) {
    const v = data[k];
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > 1000000) return false;
  }
  if ((data.bestStreak as number) < (data.streak as number)) return false;
  if (typeof data.createdAt !== 'string' || typeof data.updatedAt !== 'string') return false;
  return true;
}

export function evaluateProfileCreate(
  playerId: string,
  incoming: Record<string, unknown>,
  auth: SimAuth | null
): 'ALLOW' | 'PERMISSION_DENIED' {
  if (!auth || !auth.email_verified) return 'PERMISSION_DENIED';
  if (!isValidId(playerId) || playerId !== auth.uid) return 'PERMISSION_DENIED';
  if (!isValidPlayerProfile(incoming, auth)) return 'PERMISSION_DENIED';
  if (incoming.createdAt !== SERVER_TIME || incoming.updatedAt !== SERVER_TIME) {
    return 'PERMISSION_DENIED';
  }
  return 'ALLOW';
}

export function evaluateProfileUpdate(
  playerId: string,
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>,
  auth: SimAuth | null
): 'ALLOW' | 'PERMISSION_DENIED' {
  if (!auth || !auth.email_verified) return 'PERMISSION_DENIED';
  if (!isValidId(playerId) || playerId !== auth.uid) return 'PERMISSION_DENIED';
  if (!isValidPlayerProfile(incoming, auth)) return 'PERMISSION_DENIED';
  if (incoming.uid !== existing.uid || incoming.createdAt !== existing.createdAt) {
    return 'PERMISSION_DENIED';
  }
  if (incoming.updatedAt !== SERVER_TIME) return 'PERMISSION_DENIED';

  const affected = Object.keys(incoming).filter((k) => incoming[k] !== existing[k]);
  const profileAllowed = new Set(['callsign', 'avatarColor', 'favoritePen', 'favoriteInk', 'updatedAt']);
  const matchAllowed = new Set([
    'played',
    'won',
    'lost',
    'draws',
    'streak',
    'bestStreak',
    'favoritePen',
    'favoriteInk',
    'updatedAt',
  ]);

  const isProfileAction = affected.every((k) => profileAllowed.has(k));
  const isMatchAction =
    affected.every((k) => matchAllowed.has(k)) &&
    incoming.played === (existing.played as number) + 1;

  if (!isProfileAction && !isMatchAction) return 'PERMISSION_DENIED';
  return 'ALLOW';
}

export function evaluateMatchCreate(
  playerId: string,
  matchId: string,
  incoming: Record<string, unknown>,
  auth: SimAuth | null,
  parentExistsForOwner: boolean
): 'ALLOW' | 'PERMISSION_DENIED' {
  if (!auth || !auth.email_verified) return 'PERMISSION_DENIED';
  if (!isValidId(playerId) || !isValidId(matchId) || playerId !== auth.uid) {
    return 'PERMISSION_DENIED';
  }
  if (!parentExistsForOwner) return 'PERMISSION_DENIED';

  const keys = Object.keys(incoming);
  if (keys.length !== MATCH_KEYS.length) return 'PERMISSION_DENIED';
  if (!MATCH_KEYS.every((k) => Object.prototype.hasOwnProperty.call(incoming, k))) {
    return 'PERMISSION_DENIED';
  }
  if (incoming.uid !== auth.uid) return 'PERMISSION_DENIED';
  if (
    typeof incoming.playerPen !== 'string' ||
    !VALID_PENS.has(incoming.playerPen) ||
    typeof incoming.opponentPen !== 'string' ||
    !VALID_PENS.has(incoming.opponentPen)
  ) {
    return 'PERMISSION_DENIED';
  }
  if (incoming.mode !== 'computer' && incoming.mode !== 'hotseat') return 'PERMISSION_DENIED';
  if (
    incoming.arenaLayout !== 'classic' &&
    incoming.arenaLayout !== 'bumpers' &&
    incoming.arenaLayout !== 'fortress'
  ) {
    return 'PERMISSION_DENIED';
  }
  if (incoming.outcome !== 'win' && incoming.outcome !== 'loss' && incoming.outcome !== 'draw') {
    return 'PERMISSION_DENIED';
  }
  if (
    typeof incoming.shots !== 'number' ||
    !Number.isInteger(incoming.shots) ||
    incoming.shots < 1 ||
    incoming.shots > 500
  ) {
    return 'PERMISSION_DENIED';
  }
  if (incoming.createdAt !== SERVER_TIME) return 'PERMISSION_DENIED';
  return 'ALLOW';
}

const baseProfile = {
  uid: 'user_A',
  callsign: 'MasterKuro',
  avatarColor: '#e5a93c',
  favoritePen: 'ballpoint',
  favoriteInk: 'blue',
  played: 1,
  won: 1,
  lost: 0,
  draws: 0,
  streak: 1,
  bestStreak: 1,
  createdAt: SERVER_TIME,
  updatedAt: SERVER_TIME,
};

const baseMatch = {
  uid: 'user_A',
  playerPen: 'ballpoint',
  opponentPen: 'gel',
  mode: 'computer',
  arenaLayout: 'bumpers',
  outcome: 'win',
  shots: 4,
  createdAt: SERVER_TIME,
};

test('Dirty Dozen #1-12 payloads all return PERMISSION_DENIED', () => {
  const userA: SimAuth = { uid: 'user_A', email_verified: true };
  const unverifiedA: SimAuth = { uid: 'user_A', email_verified: false };

  // Valid baseline succeeds
  assert.equal(evaluateProfileCreate('user_A', baseProfile, userA), 'ALLOW');

  // 1. Identity Spoofing on Profile Create
  assert.equal(
    evaluateProfileCreate('user_B', { ...baseProfile, uid: 'user_B' }, userA),
    'PERMISSION_DENIED'
  );

  // 2. Unverified Email Spoof
  assert.equal(evaluateProfileCreate('user_A', baseProfile, unverifiedA), 'PERMISSION_DENIED');

  // 3. Shadow / Ghost Field Injection on Create
  assert.equal(
    evaluateProfileCreate('user_A', { ...baseProfile, isAdmin: true }, userA),
    'PERMISSION_DENIED'
  );

  // 4. Shadow Field Injection on Update
  assert.equal(
    evaluateProfileUpdate('user_A', baseProfile, { ...baseProfile, vip: true }, userA),
    'PERMISSION_DENIED'
  );

  // 5. Value Poisoning on Update (callsign > 32 chars)
  assert.equal(
    evaluateProfileUpdate(
      'user_A',
      baseProfile,
      { ...baseProfile, callsign: 'X'.repeat(80) },
      userA
    ),
    'PERMISSION_DENIED'
  );

  // 6. Immortal Field Tampering (createdAt changed)
  assert.equal(
    evaluateProfileUpdate(
      'user_A',
      baseProfile,
      { ...baseProfile, createdAt: '2020-01-01T00:00:00.000Z' },
      userA
    ),
    'PERMISSION_DENIED'
  );

  // 7. Client Timestamp Forgery
  assert.equal(
    evaluateProfileUpdate(
      'user_A',
      baseProfile,
      { ...baseProfile, callsign: 'NewName', updatedAt: '2099-01-01T00:00:00.000Z' },
      userA
    ),
    'PERMISSION_DENIED'
  );

  // 8. Orphaned Subcollection Write (parent does not exist)
  assert.equal(
    evaluateMatchCreate('user_A', 'match_1', baseMatch, userA, false),
    'PERMISSION_DENIED'
  );

  // 9. Cross-Tenant Subcollection Write
  assert.equal(
    evaluateMatchCreate('user_B', 'match_1', baseMatch, userA, true),
    'PERMISSION_DENIED'
  );

  // 10. Invalid Enum / Shots out of range in MatchLog
  assert.equal(
    evaluateMatchCreate('user_A', 'match_1', { ...baseMatch, shots: 9999 }, userA, true),
    'PERMISSION_DENIED'
  );

  // 11. Path Variable ID Poisoning
  assert.equal(
    evaluateMatchCreate('user_A', 'bad$id!@#', baseMatch, userA, true),
    'PERMISSION_DENIED'
  );

  // 12. Arbitrary Stat Inflation (jumping played from 1 to 50)
  assert.equal(
    evaluateProfileUpdate(
      'user_A',
      baseProfile,
      { ...baseProfile, played: 50, won: 50 },
      userA
    ),
    'PERMISSION_DENIED'
  );
});

test('Static audit of firestore rules file verifies all 8 Pillars', () => {
  const rulesPath = fs.existsSync(path.resolve('firestore.rules'))
    ? path.resolve('firestore.rules')
    : path.resolve('DRAFT_firestore.rules');
  const content = fs.readFileSync(rulesPath, 'utf8');

  assert.ok(content.includes("rules_version = '2';"));
  assert.ok(content.includes('match /{document=**} {\n      allow read, write: if false;'));
  assert.ok(content.includes('request.auth.token.email_verified == true'));
  assert.ok(content.includes('isValidPlayerProfile(incoming())'));
  assert.ok(content.includes('isValidMatchLog(incoming())'));
  assert.ok(content.includes('affectedKeys().hasOnly'));
  assert.ok(content.includes('incoming().createdAt == request.time'));
  assert.ok(content.includes('incoming().updatedAt == request.time'));
});
