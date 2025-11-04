
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type ElementName = 'Neutral' | 'Fire' | 'Earth' | 'Wind' | 'Water' | 'Poison' | 'Holy' | 'Shadow' | 'Ghost' | 'Undead';

interface ElementData {
  color: string;
  label: string;
  bgColor: string;
}

const elementInfo: Record<ElementName, ElementData> = {
  'Neutral': { color: 'text-gray-600', label: 'Neutral', bgColor: 'bg-gray-500' },
  'Fire': { color: 'text-red-600', label: 'Fire', bgColor: 'bg-red-500' },
  'Earth': { color: 'text-yellow-700', label: 'Earth', bgColor: 'bg-yellow-600' },
  'Wind': { color: 'text-green-600', label: 'Wind', bgColor: 'bg-green-500' },
  'Water': { color: 'text-blue-600', label: 'Water', bgColor: 'bg-blue-500' },
  'Poison': { color: 'text-purple-600', label: 'Poison', bgColor: 'bg-purple-500' },
  'Holy': { color: 'text-yellow-400', label: 'Holy', bgColor: 'bg-yellow-300' },
  'Shadow': { color: 'text-purple-900', label: 'Shadow', bgColor: 'bg-purple-900' },
  'Ghost': { color: 'text-indigo-600', label: 'Ghost', bgColor: 'bg-indigo-400' },
  'Undead': { color: 'text-pink-700', label: 'Undead', bgColor: 'bg-pink-600' }
};

const elements: ElementName[] = ['Neutral', 'Fire', 'Earth', 'Wind', 'Water', 'Poison', 'Holy', 'Shadow', 'Ghost', 'Undead'];

// Element tables by defender element level
const elementTables: Record<number, Record<ElementName, Record<ElementName, number>>> = {
  1: {
    'Neutral': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 100, 'Holy': 100, 'Shadow': 100, 'Ghost': 75, 'Undead': 100 },
    'Fire': { 'Neutral': 100, 'Fire': 25, 'Earth': 125, 'Wind': 100, 'Water': 90, 'Poison': 120, 'Holy': 90, 'Shadow': 100, 'Ghost': 100, 'Undead': 100 },
    'Earth': { 'Neutral': 100, 'Fire': 90, 'Earth': 25, 'Wind': 125, 'Water': 100, 'Poison': 120, 'Holy': 90, 'Shadow': 100, 'Ghost': 100, 'Undead': 100 },
    'Wind': { 'Neutral': 100, 'Fire': 100, 'Earth': 90, 'Wind': 25, 'Water': 125, 'Poison': 120, 'Holy': 90, 'Shadow': 100, 'Ghost': 100, 'Undead': 100 },
    'Water': { 'Neutral': 100, 'Fire': 125, 'Earth': 100, 'Wind': 90, 'Water': 25, 'Poison': 120, 'Holy': 90, 'Shadow': 100, 'Ghost': 100, 'Undead': 100 },
    'Poison': { 'Neutral': 100, 'Fire': 120, 'Earth': 120, 'Wind': 120, 'Water': 120, 'Poison': 25, 'Holy': 90, 'Shadow': 90, 'Ghost': 90, 'Undead': 90 },
    'Holy': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 90, 'Holy': 25, 'Shadow': 125, 'Ghost': 100, 'Undead': 125 },
    'Shadow': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 90, 'Holy': 125, 'Shadow': 25, 'Ghost': 100, 'Undead': 90 },
    'Ghost': { 'Neutral': 75, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 90, 'Holy': 90, 'Shadow': 90, 'Ghost': 125, 'Undead': 125 },
    'Undead': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 90, 'Holy': 125, 'Shadow': 90, 'Ghost': 125, 'Undead': 25 }
  },
  2: {
    'Neutral': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 100, 'Holy': 100, 'Shadow': 100, 'Ghost': 50, 'Undead': 100 },
    'Fire': { 'Neutral': 100, 'Fire': 0, 'Earth': 150, 'Wind': 100, 'Water': 80, 'Poison': 130, 'Holy': 80, 'Shadow': 100, 'Ghost': 100, 'Undead': 100 },
    'Earth': { 'Neutral': 100, 'Fire': 80, 'Earth': 0, 'Wind': 150, 'Water': 100, 'Poison': 130, 'Holy': 80, 'Shadow': 100, 'Ghost': 100, 'Undead': 100 },
    'Wind': { 'Neutral': 100, 'Fire': 100, 'Earth': 80, 'Wind': 0, 'Water': 150, 'Poison': 130, 'Holy': 80, 'Shadow': 100, 'Ghost': 100, 'Undead': 100 },
    'Water': { 'Neutral': 100, 'Fire': 150, 'Earth': 100, 'Wind': 80, 'Water': 0, 'Poison': 130, 'Holy': 80, 'Shadow': 100, 'Ghost': 100, 'Undead': 100 },
    'Poison': { 'Neutral': 100, 'Fire': 130, 'Earth': 130, 'Wind': 130, 'Water': 130, 'Poison': 0, 'Holy': 80, 'Shadow': 80, 'Ghost': 80, 'Undead': 80 },
    'Holy': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 80, 'Holy': 0, 'Shadow': 150, 'Ghost': 100, 'Undead': 150 },
    'Shadow': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 80, 'Holy': 150, 'Shadow': 0, 'Ghost': 100, 'Undead': 80 },
    'Ghost': { 'Neutral': 50, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 80, 'Holy': 80, 'Shadow': 80, 'Ghost': 150, 'Undead': 150 },
    'Undead': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 80, 'Holy': 150, 'Shadow': 80, 'Ghost': 150, 'Undead': 0 }
  },
  3: {
    'Neutral': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 100, 'Holy': 100, 'Shadow': 100, 'Ghost': 25, 'Undead': 100 },
    'Fire': { 'Neutral': 100, 'Fire': 0, 'Earth': 175, 'Wind': 100, 'Water': 70, 'Poison': 140, 'Holy': 70, 'Shadow': 100, 'Ghost': 100, 'Undead': 100 },
    'Earth': { 'Neutral': 100, 'Fire': 70, 'Earth': 0, 'Wind': 175, 'Water': 100, 'Poison': 140, 'Holy': 70, 'Shadow': 100, 'Ghost': 100, 'Undead': 100 },
    'Wind': { 'Neutral': 100, 'Fire': 100, 'Earth': 70, 'Wind': 0, 'Water': 175, 'Poison': 140, 'Holy': 70, 'Shadow': 100, 'Ghost': 100, 'Undead': 100 },
    'Water': { 'Neutral': 100, 'Fire': 175, 'Earth': 100, 'Wind': 70, 'Water': 0, 'Poison': 140, 'Holy': 70, 'Shadow': 100, 'Ghost': 100, 'Undead': 100 },
    'Poison': { 'Neutral': 100, 'Fire': 140, 'Earth': 140, 'Wind': 140, 'Water': 140, 'Poison': 0, 'Holy': 70, 'Shadow': 70, 'Ghost': 70, 'Undead': 70 },
    'Holy': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 70, 'Holy': 0, 'Shadow': 175, 'Ghost': 100, 'Undead': 175 },
    'Shadow': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 70, 'Holy': 175, 'Shadow': 0, 'Ghost': 100, 'Undead': 70 },
    'Ghost': { 'Neutral': 25, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 70, 'Holy': 70, 'Shadow': 70, 'Ghost': 175, 'Undead': 175 },
    'Undead': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 70, 'Holy': 175, 'Shadow': 70, 'Ghost': 175, 'Undead': 0 }
  },
  4: {
    'Neutral': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 100, 'Holy': 100, 'Shadow': 100, 'Ghost': 0, 'Undead': 100 },
    'Fire': { 'Neutral': 100, 'Fire': 0, 'Earth': 200, 'Wind': 100, 'Water': 60, 'Poison': 150, 'Holy': 60, 'Shadow': 100, 'Ghost': 100, 'Undead': 100 },
    'Earth': { 'Neutral': 100, 'Fire': 60, 'Earth': 0, 'Wind': 200, 'Water': 100, 'Poison': 150, 'Holy': 60, 'Shadow': 100, 'Ghost': 100, 'Undead': 100 },
    'Wind': { 'Neutral': 100, 'Fire': 100, 'Earth': 60, 'Wind': 0, 'Water': 200, 'Poison': 150, 'Holy': 60, 'Shadow': 100, 'Ghost': 100, 'Undead': 100 },
    'Water': { 'Neutral': 100, 'Fire': 200, 'Earth': 100, 'Wind': 60, 'Water': 0, 'Poison': 150, 'Holy': 60, 'Shadow': 100, 'Ghost': 100, 'Undead': 100 },
    'Poison': { 'Neutral': 100, 'Fire': 150, 'Earth': 150, 'Wind': 150, 'Water': 150, 'Poison': 0, 'Holy': 60, 'Shadow': 60, 'Ghost': 60, 'Undead': 60 },
    'Holy': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 60, 'Holy': 0, 'Shadow': 200, 'Ghost': 100, 'Undead': 200 },
    'Shadow': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 60, 'Holy': 200, 'Shadow': 0, 'Ghost': 100, 'Undead': 60 },
    'Ghost': { 'Neutral': 0, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 60, 'Holy': 60, 'Shadow': 60, 'Ghost': 200, 'Undead': 200 },
    'Undead': { 'Neutral': 100, 'Fire': 100, 'Earth': 100, 'Wind': 100, 'Water': 100, 'Poison': 60, 'Holy': 200, 'Shadow': 60, 'Ghost': 200, 'Undead': 0 }
  }
};

const getMultiplierColor = (value: number): string => {
  if (value === 0) return 'bg-gray-800 text-gray-400';
  if (value < 50) return 'bg-red-100 text-red-700 border border-red-300';
  if (value < 100) return 'bg-orange-100 text-orange-700 border border-orange-300';
  if (value === 100) return 'bg-slate-100 text-slate-700';
  if (value <= 150) return 'bg-green-100 text-green-700 border border-green-300';
  return 'bg-blue-100 text-blue-700 border border-blue-300';
};

export default function ElementTablePage() {
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

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
                <Zap className="h-6 w-6 text-cyan-600" />
                <h1 className="text-2xl font-bold text-slate-900">Element Table</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Description */}
        <Card className="p-6 mb-8 bg-white">
          <p className="text-slate-600 text-center">
            <strong>How to read:</strong> Find your attack element in the left column, then look across the row to find the defender's element. The percentage shows damage dealt.
          </p>
        </Card>

        {/* Level Selector */}
        <div className="mb-6 flex justify-center">
          <div className="bg-white rounded-xl p-2 border-2 border-cyan-200 inline-flex gap-2 shadow-sm">
            {[1, 2, 3, 4].map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  selectedLevel === level
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Level {level}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <Card className="p-6 mb-6 bg-white">
          <h3 className="text-lg font-bold text-slate-900 mb-3">Legend:</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-800 rounded"></div>
              <span className="text-slate-600">0% (Immune)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 border border-red-300 rounded"></div>
              <span className="text-slate-600">&lt;50% (Very Weak)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 border border-orange-300 rounded"></div>
              <span className="text-slate-600">50-99% (Weak)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-100 rounded"></div>
              <span className="text-slate-600">100% (Normal)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-slate-600">101-150% (Strong)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 border border-blue-300 rounded"></div>
              <span className="text-slate-600">&gt;150% (Very Strong)</span>
            </div>
          </div>
        </Card>

        {/* Table */}
        <div className="overflow-x-auto">
          <Card className="p-6 bg-white">
            <div className="min-w-[800px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 text-left text-slate-700 font-bold border-b-2 border-slate-300 bg-slate-50 sticky left-0 z-10">
                      <div className="text-xs text-slate-500 mb-1">Defender →</div>
                      <div className="text-xs text-slate-500">↓ Attacker</div>
                    </th>
                    {elements.map((element) => (
                      <th key={element} className="p-3 text-center border-b-2 border-slate-300 bg-slate-50">
                        <div className={`w-8 h-8 ${elementInfo[element].bgColor} rounded mx-auto mb-1 shadow-sm`}></div>
                        <div className={`${elementInfo[element].color} font-bold text-sm`}>{elementInfo[element].label}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {elements.map((attacker, idx) => (
                    <tr key={attacker} className={`border-b border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50/50 transition-colors`}>
                      <td className="p-3 border-r-2 border-slate-300 bg-slate-50 sticky left-0 z-10">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 ${elementInfo[attacker].bgColor} rounded shadow-sm`}></div>
                          <span className={`${elementInfo[attacker].color} font-bold text-sm`}>{elementInfo[attacker].label}</span>
                        </div>
                      </td>
                      {elements.map((defender) => {
                        const multiplier = elementTables[selectedLevel][attacker][defender];
                        return (
                          <td key={defender} className="p-2 text-center">
                            <div className={`${getMultiplierColor(multiplier)} px-3 py-2 rounded font-bold text-sm shadow-sm`}>
                              {multiplier}%
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">
            💡 <strong>Tip:</strong> Element level affects damage multipliers. Higher element levels have more extreme modifiers.
          </p>
        </div>
      </main>
    </div>
  );
}
