import type { ConstellationInstance, QueueSchedulePlan, VisibilitySchedule } from './types';
import { clamp, mulberry32 } from './utils';

/* ────────────────────────────────────────────────────────────────────────────
 * Constellation Layer — Visibility Scheduling
 *
 * Implements the **"2-6-2" staggered queue** that controls when each
 * constellation fades in, holds, and fades out:
 *
 *   1.  Instances are grouped by motif ID, then each group is shuffled.
 *   2.  A round-robin deal across motif groups produces the final queue.
 *       This guarantees every unique SVG appears early and prevents the
 *       same motif from appearing in consecutive visibility slots (unless
 *       one motif group is larger than all others combined).
 *   3.  Each instance is assigned a start-time offset proportional to its
 *       queue position, so 2–4 constellations are visible at any moment.
 *   4.  Every instance cycles through:
 *         fade-in (2 s)  →  hold (6 s)  →  fade-out (2 s)  →  off …
 *       and the cycle repeats each `roundSeconds`.
 *
 * `aggressiveness` biases the stagger interval toward showing more (or
 * fewer) constellations simultaneously.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Build a staggered queue schedule using motif-aware round-robin ordering.
 *
 * The round-robin deal ensures:
 *   • Every unique motif gets shown at least once before any motif repeats.
 *   • Consecutive visibility slots are filled with different motifs whenever
 *     possible (no SVG is repeated unless it has to be to fill the slot).
 *   • Within each motif group the order is still randomised (seeded).
 *
 * @param instances         Full array of constellation instances (for motif IDs).
 * @param minVisible        Desired minimum simultaneously-visible count.
 * @param maxVisible        Desired maximum simultaneously-visible count.
 * @param cycleSeconds      Duration of one fade-in + hold + fade-out pass.
 * @param aggressiveness    Sigmoid bias:  positive → more overlap → more visible.
 * @param regenEpoch        Regeneration counter — changes the shuffle seed.
 * @returns Per-instance start offsets and round/warmup durations.
 */
export function buildQueueSchedule(
  instances: ConstellationInstance[],
  minVisible: number,
  maxVisible: number,
  cycleSeconds: number,
  aggressiveness: number,
  regenEpoch: number,
): QueueSchedulePlan {
  const total = instances.length;

  if (total <= 0) {
    return {
      starts: [],
      roundSeconds: Math.max(cycleSeconds, 1),
      warmupSeconds: 0,
    };
  }

  // ── Interval calculation (unchanged) ─────────────────────────────────
  const cappedMax = Math.min(total, Math.max(1, maxVisible));
  const cappedMin = Math.min(cappedMax, Math.max(1, minVisible));
  const minInterval = cycleSeconds / Math.max(1, cappedMax);
  const maxInterval = cycleSeconds / Math.max(1, cappedMin);
  const span = maxInterval - minInterval;
  const rng = mulberry32(9371 + regenEpoch * 101 + total * 17);

  const activityBias = 1 / (1 + Math.exp(-aggressiveness));
  const jitter = (rng() * 2 - 1) * span * 0.2;
  const intervalSeconds = clamp(
    maxInterval - span * activityBias + jitter,
    minInterval,
    maxInterval,
  );

  // ── Group instances by motif, then shuffle each group ────────────────
  const motifGroups = new Map<string, number[]>();
  instances.forEach((inst, idx) => {
    const group = motifGroups.get(inst.motif.id) ?? [];
    group.push(idx);
    motifGroups.set(inst.motif.id, group);
  });

  // Shuffle within each motif group (seeded)
  for (const group of motifGroups.values()) {
    for (let i = group.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [group[i], group[j]] = [group[j], group[i]];
    }
  }

  // ── Round-robin deal across motif groups ─────────────────────────────
  //
  // We pick one instance from each motif group in turn, cycling through
  // groups until every instance has been dealt.  This interleaves motifs
  // so no SVG repeats in consecutive queue positions unless it's the only
  // motif with remaining instances.
  const groupKeys = Array.from(motifGroups.keys());

  // Shuffle the group order so the starting motif varies per epoch
  for (let i = groupKeys.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [groupKeys[i], groupKeys[j]] = [groupKeys[j], groupKeys[i]];
  }

  const cursors = new Map<string, number>(groupKeys.map((k) => [k, 0]));
  const queue: number[] = [];

  while (queue.length < total) {
    let dealt = false;
    for (const key of groupKeys) {
      const group = motifGroups.get(key)!;
      const cursor = cursors.get(key)!;
      if (cursor < group.length) {
        queue.push(group[cursor]);
        cursors.set(key, cursor + 1);
        dealt = true;
      }
    }
    // Safety: if nothing was dealt this pass, all groups are exhausted
    if (!dealt) break;
  }

  // ── Assign stagger start-times ──────────────────────────────────────
  const starts = new Array<number>(total).fill(0);
  queue.forEach((instanceIndex, queuePosition) => {
    starts[instanceIndex] = queuePosition * intervalSeconds;
  });

  return {
    starts,
    roundSeconds: Math.max(cycleSeconds, total * intervalSeconds),
    warmupSeconds: (cappedMin - 1) * intervalSeconds,
  };
}

/**
 * Compute the current outline opacity for a single constellation instance
 * within the "2-6-2" visibility cycle.
 *
 * The returned value ramps 0→1 during fade-in, holds at 1, then 1→0
 * during fade-out.  Outside the active window it returns 0.
 *
 * @param scheduleStartSeconds  This instance's queue-assigned start offset.
 * @param elapsedSeconds        Global elapsed time (from the Three.js clock).
 * @param schedule              Shared visibility schedule parameters.
 */
export function computeOutlineFade(
  scheduleStartSeconds: number,
  elapsedSeconds: number,
  schedule: VisibilitySchedule,
): number {
  const localRound = (
    (elapsedSeconds + schedule.warmupSeconds - scheduleStartSeconds) % schedule.roundSeconds
    + schedule.roundSeconds
  ) % schedule.roundSeconds;

  if (localRound >= schedule.cycleSeconds) return 0;

  if (localRound < schedule.fadeInSeconds) {
    return clamp(localRound / schedule.fadeInSeconds, 0, 1);
  }

  if (localRound < schedule.fadeInSeconds + schedule.holdSeconds) {
    return 1;
  }

  const out = (localRound - (schedule.fadeInSeconds + schedule.holdSeconds)) / schedule.fadeOutSeconds;
  return clamp(1 - out, 0, 1);
}
