import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DESK_PHYSICS,
  createInitialPenState,
  pointInDesk,
  evaluatePenState,
  calculateFlickImpulse,
  calculateOverdriveGain,
  getArenaObstacles,
  stepSimulation,
  resolveRoundOutcome,
  chooseAiShot,
} from './rules';

test('pointInDesk validates desk interior and rounded corners accurately', () => {
  assert.equal(pointInDesk({ x: DESK_PHYSICS.deskWidth / 2, y: DESK_PHYSICS.deskHeight / 2 }), true);
  assert.equal(pointInDesk({ x: -5, y: 100 }), false);
  assert.equal(pointInDesk({ x: DESK_PHYSICS.deskWidth + 2, y: 100 }), false);
  assert.equal(pointInDesk({ x: 1, y: 1 }), false);
});

test('evaluatePenState detects overhang wobble and center-of-mass fall', () => {
  const pen = createInitialPenState(0, 'ballpoint');
  assert.equal(evaluatePenState(pen).fallen, false);
  assert.equal(evaluatePenState(pen).wobble, false);

  pen.position = { x: DESK_PHYSICS.deskWidth - 15, y: DESK_PHYSICS.deskHeight / 2 };
  pen.angle = 0;
  const nearEdge = evaluatePenState(pen);
  assert.equal(nearEdge.fallen, false);
  assert.equal(nearEdge.wobble, true);

  pen.position = { x: DESK_PHYSICS.deskWidth + 5, y: DESK_PHYSICS.deskHeight / 2 };
  assert.equal(evaluatePenState(pen).fallen, true);
});

test('calculateFlickImpulse produces linear impulse, spin torque, and overdrive boost', () => {
  const pen = createInitialPenState(0, 'ballpoint');
  pen.angle = -Math.PI / 2;
  const grabWorld = { x: pen.position.x, y: pen.position.y - 60 };
  const releaseWorld = { x: pen.position.x - 120, y: pen.position.y - 60 };
  const normalFlick = calculateFlickImpulse(pen, grabWorld, releaseWorld, DESK_PHYSICS.maxDrag, false);
  const overdriveFlick = calculateFlickImpulse(pen, grabWorld, releaseWorld, DESK_PHYSICS.maxDrag, true);

  assert.ok(normalFlick !== null && overdriveFlick !== null);
  assert.ok(normalFlick.impulse.x > 50);
  assert.ok(Math.abs(normalFlick.angularImpulse) > 0.5);
  assert.ok(overdriveFlick.impulse.x > normalFlick.impulse.x * 1.2);
  assert.equal(overdriveFlick.isOverdrive, true);
  assert.ok(calculateOverdriveGain(0.8, 120) >= 35);
});

test('stepSimulation resolves pen-on-pen collision and round win condition', () => {
  const p0 = createInitialPenState(0, 'metal');
  const p1 = createInitialPenState(1, 'ballpoint');
  p1.position = { x: DESK_PHYSICS.deskWidth - 25, y: DESK_PHYSICS.deskHeight / 2 };
  p0.position = { x: DESK_PHYSICS.deskWidth - 95, y: DESK_PHYSICS.deskHeight / 2 };
  p0.velocity = { x: 620, y: 0 };

  let collided = false;
  for (let i = 0; i < 60; i++) {
    const hit = stepSimulation([p0, p1], 1 / 60);
    if (hit) collided = true;
  }

  assert.equal(collided, true);
  assert.equal(p1.fallen, true);
  assert.equal(p0.fallen, false);

  for (let i = 0; i < 120; i++) {
    stepSimulation([p0, p1], 1 / 60);
  }
  assert.equal(resolveRoundOutcome([p0, p1]), 'p0_win');
});

test('stepSimulation bounces pens off tabletop bumper obstacles', () => {
  const obstacles = getArenaObstacles('bumpers');
  assert.equal(obstacles.length, 3);
  const p0 = createInitialPenState(0, 'gel');
  const p1 = createInitialPenState(1, 'gel');
  // Place p0 just left of the center brass weight obstacle and launch right
  const centerObs = obstacles[0];
  p0.position = { x: centerObs.position.x - 45, y: centerObs.position.y };
  p0.velocity = { x: 420, y: 0 };

  let hitObstacle = false;
  for (let i = 0; i < 30; i++) {
    const ev = stepSimulation([p0, p1], 1 / 60, 0, obstacles);
    if (ev && ev.kind === 'obstacle') {
      hitObstacle = true;
      break;
    }
  }
  assert.equal(hitObstacle, true);
  assert.ok(p0.velocity.x < 0, 'Pen should rebound leftward off the center brass bumper');
});

test('chooseAiShot uses physics rollout to bypass center bumper obstacle and hit opponent', () => {
  const obstacles = getArenaObstacles('bumpers');
  const p0 = createInitialPenState(0, 'ballpoint');
  const p1 = createInitialPenState(1, 'gel');
  const aiShot = chooseAiShot(p1, p0, 'normal', obstacles, false);

  assert.ok(aiShot.impulse.x < 0, 'AI on right side should flick left toward player on left');
  assert.ok(aiShot.power >= 0.6, 'AI should use sufficient power to cross the drafting board');
  assert.ok(aiShot.tacticName.length > 0, 'AI should report its chosen tactical maneuver');

  // Verify the chosen shot actually hits p0 without p1 falling off
  const simP0 = { ...p0, position: { ...p0.position }, velocity: { ...p0.velocity } };
  const simP1 = { ...p1, position: { ...p1.position }, velocity: { ...p1.velocity } };
  simP1.velocity.x += aiShot.impulse.x / simP1.mass;
  simP1.velocity.y += aiShot.impulse.y / simP1.mass;
  simP1.angularVelocity += aiShot.angularImpulse / simP1.mass;

  let hitPlayerPen = false;
  for (let i = 0; i < 45; i++) {
    const ev = stepSimulation([simP0, simP1], 1 / 30, 0, obstacles);
    if (ev && ev.kind === 'pen') {
      hitPlayerPen = true;
    }
  }
  assert.equal(hitPlayerPen, true, 'Upgraded Automaton must bypass the center brass weight and hit the player pen');
  assert.equal(simP1.fallen, false, 'Upgraded Automaton must not self-ring-out');
});

test('chooseAiShot finds a clean knockout strike when opponent is near the table edge', () => {
  const p0 = createInitialPenState(0, 'ballpoint');
  const p1 = createInitialPenState(1, 'metal');
  // Place player pen near the left edge and AI pen within striking range
  p0.position = { x: 52, y: DESK_PHYSICS.deskHeight * 0.5 };
  p1.position = { x: 240, y: DESK_PHYSICS.deskHeight * 0.5 };

  const aiShot = chooseAiShot(p1, p0, 'hard', [], true);
  simApplyAndRun(p0, p1, aiShot);

  assert.equal(p0.fallen, true, 'Automaton should knock out a vulnerable pen near the edge');
  assert.equal(p1.fallen, false, 'Automaton should stay safely on the desk after the knockout');
});

function simApplyAndRun(
  p0: ReturnType<typeof createInitialPenState>,
  p1: ReturnType<typeof createInitialPenState>,
  shot: ReturnType<typeof chooseAiShot>
) {
  p1.velocity.x += shot.impulse.x / p1.mass;
  p1.velocity.y += shot.impulse.y / p1.mass;
  p1.angularVelocity += shot.angularImpulse / p1.mass;
  for (let i = 0; i < 45; i++) {
    stepSimulation([p0, p1], 1 / 30, 0, []);
  }
}

