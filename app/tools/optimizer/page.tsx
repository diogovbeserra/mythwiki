
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Target, Search, TrendingUp, Coins, Zap, Swords, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface FarmResult {
  monster: {
    id: number;
    name: string;
    level: number;
    hp: number;
    baseExp: number;
    jobExp: number;
    element: string | null;
    race: string | null;
  };
  efficiency: {
    timeToKill: number;
    monstersPerHour: number;
    zenyPerHour: number;
    baseExpPerHour: number;
    jobExpPerHour: number;
    score: number;
  };
  spawns: Array<{
    mapName: string | null;
    qty: number | null;
  }>;
  topDrops: Array<{
    itemName: string;
    rate: number;
    valueSell: number | null;
    expectedZenyPerHour: number;
  }>;
}

export default function FarmOptimizerPage() {
  const [dps, setDps] = useState<string>('10000');
  const [element, setElement] = useState<string>('neutral');
  const [goal, setGoal] = useState<string>('zeny');
  const [farmMode, setFarmMode] = useState<string>('single');
  const [minLevel, setMinLevel] = useState<string>('');
  const [maxLevel, setMaxLevel] = useState<string>('');
  const [teleportCooldown, setTeleportCooldown] = useState<string>('2');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FarmResult[]>([]);

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        dps: dps,
        element: element,
        goal: goal,
        farmMode: farmMode,
        teleportCooldown: teleportCooldown,
        ...(minLevel && { minLevel: minLevel }),
        ...(maxLevel && { maxLevel: maxLevel }),
      });

      const response = await fetch(`/api/optimizer?${params}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching optimizer results:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const formatZeny = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(Math.floor(num));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-orange-600" />
                <h1 className="text-2xl font-bold text-slate-900">Farm Optimizer</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Description */}
        <Card className="p-6 mb-8 bg-white text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Find the Best Monsters to Farm
          </h2>
          <p className="text-slate-600">
            Configure your stats and see which monsters offer the best return per hour
          </p>
        </Card>

        {/* Input Form */}
        <Card className="p-8 mb-8 bg-white">
          <div className="grid md:grid-cols-2 gap-6">
            {/* DPS Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Average DPS (Damage Per Second)
              </label>
              <Input
                type="number"
                value={dps}
                onChange={(e) => setDps(e.target.value)}
                placeholder="10000"
                className="text-lg"
              />
              <p className="text-xs text-slate-500 mt-1">Your average damage per second</p>
            </div>

            {/* Teleport Cooldown */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Movement/Teleport Time (seconds)
              </label>
              <Input
                type="number"
                value={teleportCooldown}
                onChange={(e) => setTeleportCooldown(e.target.value)}
                placeholder="2"
                step="0.5"
                className="text-lg"
              />
              <p className="text-xs text-slate-500 mt-1">Average time between kills (teleport, walk, etc.)</p>
            </div>

            {/* Farm Mode */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Farm Mode
              </label>
              <Select value={farmMode} onValueChange={setFarmMode}>
                <SelectTrigger className="text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">
                    <div className="flex items-center gap-2">
                      <Swords className="h-4 w-4" />
                      <span>Single Target (1 at a time)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="aoe">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>AoE (Area - Multiple targets)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                {farmMode === 'aoe' 
                  ? 'Kills multiple monsters at the same time (much more efficient)'
                  : 'Kills one monster at a time'}
              </p>
            </div>

            {/* Element Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Attack Element
              </label>
              <Select value={element} onValueChange={setElement}>
                <SelectTrigger className="text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="fire">Fire</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="earth">Earth</SelectItem>
                  <SelectItem value="wind">Wind</SelectItem>
                  <SelectItem value="poison">Poison</SelectItem>
                  <SelectItem value="holy">Holy</SelectItem>
                  <SelectItem value="shadow">Shadow</SelectItem>
                  <SelectItem value="ghost">Ghost</SelectItem>
                  <SelectItem value="undead">Undead</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Goal Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Optimization Goal
              </label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger className="text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zeny">Maximize Zeny</SelectItem>
                  <SelectItem value="base_exp">Maximize Base EXP</SelectItem>
                  <SelectItem value="job_exp">Maximize Job EXP</SelectItem>
                  <SelectItem value="balanced">Balanced (EXP + Zeny)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Monster Level Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Minimum Level
              </label>
              <Input
                type="number"
                value={minLevel}
                onChange={(e) => setMinLevel(e.target.value)}
                placeholder="Ex: 1"
                className="text-lg"
                min="1"
                max="200"
              />
              <p className="text-xs text-slate-500 mt-1">Leave empty for no limit</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Maximum Level
              </label>
              <Input
                type="number"
                value={maxLevel}
                onChange={(e) => setMaxLevel(e.target.value)}
                placeholder="Ex: 150"
                className="text-lg"
                min="1"
                max="200"
              />
              <p className="text-xs text-slate-500 mt-1">Leave empty for no limit</p>
            </div>
          </div>

          {/* Optimize Button */}
          <div className="mt-8 text-center">
            <Button 
              onClick={handleOptimize}
              size="lg"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white px-12"
            >
              {loading ? (
                <>
                  <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  Calculating...
                </>
              ) : (
                <>
                  <Target className="h-5 w-5 mr-2" />
                  Calculate Best Farm
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center">
                <TrendingUp className="h-6 w-6 mr-2 text-green-600" />
                Top {results.length} Best Farms
              </h3>
              <Badge variant="outline" className="text-sm">
                {farmMode === 'aoe' ? '🌊 AoE Mode' : '🎯 Single Target Mode'}
              </Badge>
            </div>

            {results.map((result, index) => (
              <Card key={result.monster.id} className="p-6 bg-white hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-slate-400">
                      #{index + 1}
                    </div>
                    <div>
                      <Link 
                        href={`/monsters/${result.monster.id}`}
                        className="text-xl font-bold text-blue-600 hover:text-blue-700"
                      >
                        {result.monster.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">Lv. {result.monster.level}</Badge>
                        {result.monster.element && (
                          <Badge variant="secondary">{result.monster.element}</Badge>
                        )}
                        {result.monster.race && (
                          <Badge variant="secondary">{result.monster.race}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-slate-500">Kill Time</div>
                    <div className="text-lg font-bold text-slate-900">
                      {result.efficiency.timeToKill.toFixed(2)}s
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Coins className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-semibold text-yellow-900">Zeny/Hour</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-700">
                      {formatZeny(result.efficiency.zenyPerHour)}z
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-900">Base EXP/Hour</span>
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                      {formatNumber(result.efficiency.baseExpPerHour)}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-900">Job EXP/Hour</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">
                      {formatNumber(result.efficiency.jobExpPerHour)}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-900">Kills/Hour</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-700">
                      {formatNumber(result.efficiency.monstersPerHour)}
                    </div>
                  </div>
                </div>

                {/* Spawns */}
                {result.spawns.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Spawn Maps:</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.spawns.slice(0, 3).map((spawn, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {spawn.mapName || 'Unknown'} ({spawn.qty || 0} mobs)
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Drops */}
                {result.topDrops.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Best Drops:</h4>
                    <div className="space-y-1">
                      {result.topDrops.slice(0, 3).map((drop, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">{drop.itemName}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 text-xs">
                              {drop.rate.toFixed(2)}%
                            </span>
                            <span className="text-yellow-600 font-semibold">
                              ~{formatZeny(drop.expectedZenyPerHour)}z/h
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {results.length === 0 && !loading && (
          <Card className="p-12 bg-white text-center">
            <Target className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Configure your stats above
            </h3>
            <p className="text-slate-600 mb-6">
              Click &quot;Calculate Best Farm&quot; to see the results
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/monsters">
                <Button variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  View All Monsters
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
