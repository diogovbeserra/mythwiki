
// Types for Refine Probability Calculator

export type ItemType = 'weapon' | 'armor';

export type RefineLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface RefineRates {
  weapon: Record<string, number>;
  armor: Record<string, number>;
}

export interface RefineInput {
  itemType: ItemType;
  currentRefine: RefineLevel;
  targetRefine: RefineLevel;
  currentDurability: number;
}

export interface RefineAttemptResult {
  success: boolean;
  newRefine: RefineLevel;
  newDurability: number;
  itemDestroyed: boolean;
}

export interface RefineSimulationResult {
  success: boolean;
  attempts: number;
  finalRefine: RefineLevel;
  finalDurability: number;
  itemDestroyed: boolean;
  path: RefineAttemptResult[];
}

export interface MonteCarloResults {
  totalSimulations: number;
  successCount: number;
  failureCount: number;
  destructionCount: number;
  successRate: number;
  destructionRate: number;
  averageAttempts: number;
  averageAttemptsOnSuccess: number;
  averageDurabilityOnSuccess: number;
  attemptDistribution: Record<number, number>;
  durabilityDistribution: Record<number, number>;
}

export interface CumulativeProbability {
  totalProbability: number;
  pathways: RefinePathway[];
  averageAttempts: number;
  destructionProbability: number;
}

export interface RefinePathway {
  refineSequence: RefineLevel[];
  durabilitySequence: number[];
  probability: number;
  attempts: number;
  success: boolean;
}

export interface RefineStepProbability {
  from: RefineLevel;
  to: RefineLevel;
  successRate: number;
  failureRate: number;
  losesDurabilityOnFail: boolean;
}
