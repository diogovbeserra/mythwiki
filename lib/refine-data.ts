
// Refine probability data for weapons and armor

import type { RefineRates, RefineLevel } from './refine-types';

// Success rates for each refine level upgrade
export const REFINE_RATES: RefineRates = {
  weapon: {
    '0-1': 1.00,
    '1-2': 1.00,
    '2-3': 1.00,
    '3-4': 1.00,
    '4-5': 0.60,
    '5-6': 0.50,
    '6-7': 0.40,
    '7-8': 0.30,
    '8-9': 0.30,
    '9-10': 0.20,
    '10-11': 0.19,
    '11-12': 0.18,
  },
  armor: {
    '0-1': 1.00,
    '1-2': 1.00,
    '2-3': 1.00,
    '3-4': 1.00,
    '4-5': 0.60,
    '5-6': 0.50,
    '6-7': 0.40,
    '7-8': 0.30,
    '8-9': 0.20,
    '9-10': 0.19,
    '10-11': 0.18,
    '11-12': 0.17,
  },
};

// Safe refine levels (don't lose durability on fail)
export const SAFE_REFINE_LEVELS: RefineLevel[] = [0, 1, 2, 3];

// Check if a refine level is safe (doesn't lose durability on fail)
export function isSafeRefineLevel(level: RefineLevel): boolean {
  return SAFE_REFINE_LEVELS.includes(level);
}

// Get success rate for a specific upgrade
export function getSuccessRate(
  itemType: 'weapon' | 'armor',
  from: RefineLevel,
  to: RefineLevel
): number {
  const key = `${from}-${to}`;
  return REFINE_RATES[itemType][key] || 0;
}

// Get all refine level options
export function getRefineOptions(): RefineLevel[] {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
}

// Get valid target refine options based on current refine
export function getValidTargets(currentRefine: RefineLevel): RefineLevel[] {
  return getRefineOptions().filter(level => level > currentRefine);
}

// Format refine level for display
export function formatRefineLevel(level: RefineLevel): string {
  return `+${level}`;
}

// Get refine level color based on value (for UI)
export function getRefineColor(level: RefineLevel): string {
  if (level <= 4) return 'text-gray-300';
  if (level <= 7) return 'text-blue-400';
  if (level <= 9) return 'text-purple-400';
  if (level <= 10) return 'text-yellow-400';
  return 'text-orange-400';
}
