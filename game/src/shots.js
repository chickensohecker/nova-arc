// Nova Arc — deterministic screenshot states. The screenshots the entry ships
// are real renders of this code: open the game with ?shot=start|play|complete
// |failed and it freezes on one exact frame, so a headless browser captures
// the same image every time. Returns true when a shot was applied.

import { stepFlight } from './physics.js';
import { LEVEL_BASE_SCORE, UNUSED_SHOT_BONUS, SHARD_BONUS } from './config.js';

function finishLevelScore(game) {
  game.levelScoreBase = LEVEL_BASE_SCORE;
  game.levelScoreShots = (game.level.shots - game.shotsUsed) * UNUSED_SHOT_BONUS;
  game.levelScoreShards = game.shardsCollected.size * SHARD_BONUS;
  game.levelScore =
    game.levelScoreBase + game.levelScoreShots + game.levelScoreShards;
  const allShards = game.shardsCollected.size === game.level.shards.length;
  game.starsEarned =
    allShards && game.shotsUsed <= 2 ? 3 : allShards || game.shotsUsed <= 2 ? 2 : 1;
}

export function applyShot(game, params) {
  const shot = params.get('shot');
  if (!shot) return false;
  const seed = parseInt(params.get('seed') || '7', 10);
  game.frozenTime = 1.2;

  if (shot === 'start') {
    game.state = 'title';
    game.bestScore = 12450;
    return true;
  }

  if (shot === 'play') {
    // Chart 4, mid-flight: a fixed launch, simulated forward in fixed steps so
    // the comet hangs in the bend with its trail behind it.
    game.startLevel(3, seed);
    game.state = 'flying';
    game.comet.vx = 430;
    game.comet.vy = -380;
    game.shotsUsed = 1;
    game.shotsLeft = 2;
    const dt = 1 / 120;
    let t = 0;
    for (let i = 0; i < 84; i++) {
      const hit = stepFlight(game.comet, game.level, t, dt, game.shardsCollected, 0);
      game.particles.pushTrail(game.comet.x, game.comet.y);
      t += dt;
      if (hit) break;
    }
    game.particles.shake = 0;
    return true;
  }

  if (shot === 'complete') {
    game.startLevel(0, seed);
    game.shardsCollected = new Set([0, 1, 2]);
    game.shotsUsed = 1;
    game.shotsLeft = 2;
    finishLevelScore(game);
    game.score = game.levelScore;
    game.totalScore = game.levelScore;
    game.state = 'complete';
    return true;
  }

  if (shot === 'failed') {
    game.startLevel(1, seed);
    game.shotsLeft = 0;
    game.shotsUsed = 3;
    game.score = 2450;
    game.totalScore = 2450;
    game.state = 'failed';
    return true;
  }

  return false;
}
