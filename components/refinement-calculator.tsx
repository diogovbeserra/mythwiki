
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ItemType, RefineLevel, RefineInput, MonteCarloResults, RefineAttemptResult } from '@/lib/refine-types';
import {
  getRefineOptions,
  getValidTargets,
  formatRefineLevel,
  getRefineColor,
} from '@/lib/refine-data';
import {
  getAllStepProbabilities,
  runMonteCarloSimulation,
  simulateSingleAttempt,
} from '@/lib/refine-calculator';

export function RefinementCalculator() {
  // Form inputs
  const [itemType, setItemType] = useState<ItemType>('weapon');
  const [currentRefine, setCurrentRefine] = useState<RefineLevel>(4);
  const [targetRefine, setTargetRefine] = useState<RefineLevel>(7);
  const [currentDurability, setCurrentDurability] = useState<number>(3);

  // Calculation results
  const [monteCarloResults, setMonteCarloResults] = useState<MonteCarloResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Interactive simulator state
  const [simRefine, setSimRefine] = useState<RefineLevel>(currentRefine);
  const [simDurability, setSimDurability] = useState<number>(currentDurability);
  const [simHistory, setSimHistory] = useState<RefineAttemptResult[]>([]);
  const [simDestroyed, setSimDestroyed] = useState(false);

  // Get valid target options based on current refine
  const validTargets = useMemo(() => getValidTargets(currentRefine), [currentRefine]);

  // Ensure target is valid
  useEffect(() => {
    if (targetRefine <= currentRefine) {
      const newTarget = Math.min(currentRefine + 1, 12) as RefineLevel;
      setTargetRefine(newTarget);
    }
  }, [currentRefine, targetRefine]);

  // Calculate probabilities when inputs change
  useEffect(() => {
    if (currentRefine >= targetRefine) return;

    setIsCalculating(true);
    setTimeout(() => {
      const input: RefineInput = {
        itemType,
        currentRefine,
        targetRefine,
        currentDurability,
      };

      const results = runMonteCarloSimulation(input, 100000);
      setMonteCarloResults(results);
      setIsCalculating(false);
    }, 100);
  }, [itemType, currentRefine, targetRefine, currentDurability]);

  // Reset simulator when inputs change
  useEffect(() => {
    setSimRefine(currentRefine);
    setSimDurability(currentDurability);
    setSimHistory([]);
    setSimDestroyed(false);
  }, [currentRefine, currentDurability]);

  // Get step probabilities
  const stepProbabilities = useMemo(
    () => getAllStepProbabilities(itemType, currentRefine, targetRefine),
    [itemType, currentRefine, targetRefine]
  );

  // Handle interactive simulation
  const handleSimulateAttempt = () => {
    if (simDestroyed) return;
    if (simRefine >= targetRefine) {
      alert('Already reached target refine!');
      return;
    }

    const result = simulateSingleAttempt(itemType, simRefine, simDurability);
    setSimHistory(prev => [result, ...prev].slice(0, 10));
    setSimRefine(result.newRefine);
    setSimDurability(result.newDurability);

    if (result.itemDestroyed) {
      setSimDestroyed(true);
    }
  };

  const handleResetSimulator = () => {
    setSimRefine(currentRefine);
    setSimDurability(currentDurability);
    setSimHistory([]);
    setSimDestroyed(false);
  };

  return (
    <div className="min-h-screen max-h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <div className="max-w-7xl mx-auto h-screen flex flex-col p-3">
        {/* Input Section */}
        <div className="bg-gradient-to-br from-white/90 to-white backdrop-blur-sm border border-slate-200 rounded-xl p-4 mb-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-2xl font-bold">🎲 Refinement Probability</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
          <p className="text-slate-600 text-sm mb-3">
            Calculate real chances of refining your equipment considering durability and probabilities
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Item Type */}
            <div>
              <label className="block text-xs font-medium mb-1">Item Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setItemType('weapon')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                    itemType === 'weapon'
                      ? 'bg-blue-600 text-slate-900'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ⚔️ Weapon
                </button>
                <button
                  onClick={() => setItemType('armor')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                    itemType === 'armor'
                      ? 'bg-blue-600 text-slate-900'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🛡️ Armor
                </button>
              </div>
            </div>

            {/* Current Durability */}
            <div>
              <label className="block text-xs font-medium mb-1">Current Durability</label>
              <input
                type="number"
                min="0"
                value={currentDurability}
                onChange={(e) => setCurrentDurability(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Current Refine */}
            <div>
              <label className="block text-xs font-medium mb-1">Current Refine</label>
              <select
                value={currentRefine}
                onChange={(e) => setCurrentRefine(parseInt(e.target.value) as RefineLevel)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              >
                {getRefineOptions()
                  .filter(level => level < 12)
                  .map(level => (
                    <option key={level} value={level}>
                      {formatRefineLevel(level)}
                    </option>
                  ))}
              </select>
            </div>

            {/* Target Refine */}
            <div>
              <label className="block text-xs font-medium mb-1">Target Refine</label>
              <select
                value={targetRefine}
                onChange={(e) => setTargetRefine(parseInt(e.target.value) as RefineLevel)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              >
                {validTargets.map(level => (
                  <option key={level} value={level}>
                    {formatRefineLevel(level)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {monteCarloResults && !isCalculating && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            {/* Success Rate */}
            <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-500/30 rounded-lg p-3">
              <div className="text-xs text-slate-600 mb-1">Success Rate</div>
              <div className="text-2xl font-bold text-green-400">
                {(targetRefine === currentRefine + 1 && currentDurability === 0)
                  ? (stepProbabilities[0]?.successRate * 100).toFixed(2)
                  : (monteCarloResults.successRate * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {(targetRefine === currentRefine + 1 && currentDurability === 0)
                  ? 'Exact value (dur=0)'
                  : `${monteCarloResults.successCount.toLocaleString()} / ${monteCarloResults.totalSimulations.toLocaleString()} successes`}
              </div>
            </div>

            {/* Average Attempts */}
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-500/30 rounded-lg p-3">
              <div className="text-xs text-slate-600 mb-1">Average Attempts</div>
              <div className="text-2xl font-bold text-blue-400">
                {monteCarloResults.averageAttemptsOnSuccess > 0
                  ? monteCarloResults.averageAttemptsOnSuccess.toFixed(1)
                  : '∞'}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {monteCarloResults.successCount > 0 ? 'Until success' : 'No success'}
              </div>
            </div>

            {/* Failure Rate */}
            <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 border border-red-500/30 rounded-lg p-3">
              <div className="text-xs text-slate-600 mb-1">Failure Rate</div>
              <div className="text-2xl font-bold text-red-400">
                {((1 - monteCarloResults.successRate) * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {monteCarloResults.failureCount.toLocaleString()} failures
              </div>
            </div>
          </div>
        )}

        {/* Error Margin Info */}
        {monteCarloResults && !isCalculating && !(targetRefine === currentRefine + 1 && currentDurability === 0) && (
          <div className="mb-3 px-3 py-2 bg-blue-900/20 border border-blue-500/30 rounded-lg text-xs text-blue-300">
            <span className="font-bold">ℹ️ Margin of Error:</span> Monte Carlo with 100,000 iterations. Margin: ±0.15%.
          </div>
        )}

        {isCalculating && (
          <div className="text-center py-4">
            <div className="animate-spin inline-block w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full mb-2"></div>
            <p className="text-slate-600 text-sm">Calculating...</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
          {/* Probability Table */}
          <div className="bg-gradient-to-br from-white/90 to-white backdrop-blur-sm border border-slate-200 rounded-xl p-4 flex flex-col min-h-0">
            <h2 className="text-lg font-bold mb-3">📊 Probability Table</h2>
            <div className="overflow-x-auto overflow-y-auto flex-1">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="text-left py-1 px-2">Level</th>
                    <th className="text-right py-1 px-2">Success</th>
                    <th className="text-right py-1 px-2">Failure</th>
                    <th className="text-center py-1 px-2">Loses Dur.</th>
                  </tr>
                </thead>
                <tbody>
                  {stepProbabilities.map((step, idx) => (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="py-1 px-2">
                        <span className={getRefineColor(step.from)}>{formatRefineLevel(step.from)}</span>
                        {' → '}
                        <span className={getRefineColor(step.to)}>{formatRefineLevel(step.to)}</span>
                      </td>
                      <td className="text-right py-1 px-2 text-green-400">
                        {(step.successRate * 100).toFixed(1)}%
                      </td>
                      <td className="text-right py-1 px-2 text-red-400">
                        {(step.failureRate * 100).toFixed(1)}%
                      </td>
                      <td className="text-center py-1 px-2">
                        {step.losesDurabilityOnFail ? (
                          <span className="text-red-400">✓</span>
                        ) : (
                          <span className="text-green-400">✗</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Simulator */}
          <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 backdrop-blur-sm border border-orange-500/30 rounded-xl p-4 flex flex-col min-h-0">
            <h2 className="text-lg font-bold mb-3">🎮 Interactive Simulator</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
              {/* Left Column - Current State & Controls */}
              <div className="flex flex-col space-y-2 min-h-0">
                {/* Current State */}
                <div className="bg-black/30 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-600 mb-1">Current Refine</div>
                      <div className={`text-3xl font-bold ${getRefineColor(simRefine)}`}>
                        {formatRefineLevel(simRefine)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 mb-1">Durability</div>
                      <div className={`text-3xl font-bold ${simDurability === 0 ? 'text-red-400' : 'text-blue-400'}`}>
                        {simDurability}
                      </div>
                    </div>
                  </div>

                  {simRefine < 12 && !simDestroyed && (
                    <div className="pt-2 border-t border-slate-300">
                      <div className="text-xs text-slate-600 mb-1">
                        Chance {formatRefineLevel(simRefine)} → {formatRefineLevel((simRefine + 1) as RefineLevel)}
                      </div>
                      <div className="text-xl font-bold text-yellow-400">
                        {((stepProbabilities.find(s => s.from === simRefine)?.successRate ?? 0) * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}

                  {simDurability === 0 && !simDestroyed && simRefine < targetRefine && (
                    <div className="px-2 py-1 bg-yellow-600/20 border border-yellow-500/50 rounded text-yellow-400 text-center font-bold text-xs">
                      ⚠️ DANGER: Next failure = Item breaks!
                    </div>
                  )}

                  {simDestroyed && (
                    <div className="px-2 py-1 bg-red-600/20 border border-red-500/50 rounded text-red-400 text-center font-bold text-xs">
                      💥 ITEM DESTROYED!
                    </div>
                  )}

                  {simRefine >= targetRefine && !simDestroyed && (
                    <div className="px-2 py-1 bg-green-600/20 border border-green-500/50 rounded text-green-400 text-center font-bold text-xs">
                      ✓ TARGET REACHED!
                    </div>
                  )}
                </div>

                {/* Control Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={handleSimulateAttempt}
                    disabled={simDestroyed || simRefine >= targetRefine}
                    className="w-full px-3 py-2 text-sm bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:text-slate-500 disabled:cursor-not-allowed rounded-lg font-bold transition-colors"
                  >
                    🎲 Try Refining
                  </button>
                  <button
                    onClick={handleResetSimulator}
                    className="w-full px-3 py-2 text-sm bg-slate-200 hover:bg-slate-300 rounded-lg font-bold transition-colors"
                  >
                    ↻ Reset
                  </button>
                </div>
              </div>

              {/* Right Column - History */}
              <div className="bg-black/30 rounded-lg p-3 flex flex-col min-h-0">
                <div className="text-xs font-bold text-slate-700 mb-2">📜 Attempt History</div>
                <div className="space-y-1 overflow-y-auto pr-2 flex-1">
                  {simHistory.length === 0 ? (
                    <div className="text-center text-slate-500 text-xs py-4">
                      No attempts yet
                    </div>
                  ) : (
                    simHistory.map((attempt, idx) => (
                      <div
                        key={idx}
                        className={`px-2 py-1 rounded text-xs ${
                          attempt.itemDestroyed
                            ? 'bg-red-900/30 border border-red-500/30 text-red-400'
                            : attempt.success
                            ? 'bg-green-900/30 border border-green-500/30 text-green-400'
                            : 'bg-white/90 border border-slate-300/50 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-slate-500">#{simHistory.length - idx}</span>
                          <span>
                            {attempt.itemDestroyed ? (
                              <span>💥 Item destroyed</span>
                            ) : attempt.success ? (
                              <span>✓ {formatRefineLevel(attempt.newRefine)}</span>
                            ) : (
                              <span>
                                ✗ Failed (Dur: {attempt.newDurability})
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
