
// Refine probability calculator utilities

import type {
  ItemType,
  RefineLevel,
  RefineInput,
  RefineAttemptResult,
  RefineSimulationResult,
  MonteCarloResults,
  RefineStepProbability,
} from './refine-types';
import { getSuccessRate, isSafeRefineLevel } from './refine-data';

/**
 * Simulate a single refine attempt
 */
export function simulateSingleAttempt(
  itemType: ItemType,
  currentRefine: RefineLevel,
  currentDurability: number
): RefineAttemptResult {
  const targetRefine = (currentRefine + 1) as RefineLevel;
  const successRate = getSuccessRate(itemType, currentRefine, targetRefine);
  const isSuccess = Math.random() < successRate;
  const isSafeLevel = isSafeRefineLevel(currentRefine);

  if (isSuccess) {
    return {
      success: true,
      newRefine: targetRefine,
      newDurability: currentDurability,
      itemDestroyed: false,
    };
  } else {
    if (isSafeLevel) {
      return {
        success: false,
        newRefine: currentRefine,
        newDurability: currentDurability,
        itemDestroyed: false,
      };
    } else {
      if (currentDurability === 0) {
        return {
          success: false,
          newRefine: currentRefine,
          newDurability: 0,
          itemDestroyed: true,
        };
      } else {
        return {
          success: false,
          newRefine: currentRefine,
          newDurability: currentDurability - 1,
          itemDestroyed: false,
        };
      }
    }
  }
}

/**
 * Get probability info for a single step upgrade
 */
export function getStepProbability(
  itemType: ItemType,
  from: RefineLevel,
  to: RefineLevel
): RefineStepProbability {
  const successRate = getSuccessRate(itemType, from, to);
  return {
    from,
    to,
    successRate,
    failureRate: 1 - successRate,
    losesDurabilityOnFail: !isSafeRefineLevel(from),
  };
}

/**
 * Get all step probabilities from current to target refine
 */
export function getAllStepProbabilities(
  itemType: ItemType,
  currentRefine: RefineLevel,
  targetRefine: RefineLevel
): RefineStepProbability[] {
  const steps: RefineStepProbability[] = [];
  for (let level = currentRefine; level < targetRefine; level++) {
    steps.push(getStepProbability(itemType, level as RefineLevel, (level + 1) as RefineLevel));
  }
  return steps;
}

/**
 * Run Monte Carlo simulation with N iterations
 */
export function runMonteCarloSimulation(
  input: RefineInput,
  iterations: number = 100000
): MonteCarloResults {
  const { itemType, currentRefine, targetRefine, currentDurability } = input;

  let successCount = 0;
  let failureCount = 0;
  let destructionCount = 0;
  let totalAttemptsOnSuccess = 0;
  let totalDurabilityOnSuccess = 0;

  const attemptDistribution: Record<number, number> = {};
  const durabilityDistribution: Record<number, number> = {};

  for (let i = 0; i < iterations; i++) {
    const result = simulateFullRefine(itemType, currentRefine, targetRefine, currentDurability);

    if (result.success) {
      successCount++;
      totalAttemptsOnSuccess += result.attempts;
      totalDurabilityOnSuccess += result.finalDurability;

      attemptDistribution[result.attempts] = (attemptDistribution[result.attempts] || 0) + 1;
      durabilityDistribution[result.finalDurability] =
        (durabilityDistribution[result.finalDurability] || 0) + 1;
    } else if (result.itemDestroyed) {
      destructionCount++;
      failureCount++;
    } else {
      failureCount++;
    }
  }

  return {
    totalSimulations: iterations,
    successCount,
    failureCount,
    destructionCount,
    successRate: successCount / iterations,
    destructionRate: destructionCount / iterations,
    averageAttempts: (totalAttemptsOnSuccess / iterations) || 0,
    averageAttemptsOnSuccess: successCount > 0 ? totalAttemptsOnSuccess / successCount : 0,
    averageDurabilityOnSuccess: successCount > 0 ? totalDurabilityOnSuccess / successCount : 0,
    attemptDistribution,
    durabilityDistribution,
  };
}

/**
 * Simulate a complete refine process from current to target
 */
function simulateFullRefine(
  itemType: ItemType,
  startRefine: RefineLevel,
  targetRefine: RefineLevel,
  startDurability: number
): RefineSimulationResult {
  let currentRefine = startRefine;
  let currentDurability = startDurability;
  let attempts = 0;
  const path: RefineAttemptResult[] = [];
  const maxAttempts = 100000;

  while (attempts < maxAttempts) {
    if (currentRefine >= targetRefine) {
      return {
        success: true,
        attempts,
        finalRefine: currentRefine,
        finalDurability: currentDurability,
        itemDestroyed: false,
        path,
      };
    }

    const result = simulateSingleAttempt(itemType, currentRefine, currentDurability);
    path.push(result);
    attempts++;

    currentRefine = result.newRefine;
    currentDurability = result.newDurability;

    if (result.itemDestroyed) {
      return {
        success: false,
        attempts,
        finalRefine: currentRefine,
        finalDurability: 0,
        itemDestroyed: true,
        path,
      };
    }
  }

  return {
    success: false,
    attempts,
    finalRefine: currentRefine,
    finalDurability: currentDurability,
    itemDestroyed: false,
    path,
  };
}
