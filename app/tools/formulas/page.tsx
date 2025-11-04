
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface FormulaData {
  term: string;
  description: string;
  category: string;
}

const formulas: FormulaData[] = [
  {
    term: 'Physical Damage',
    category: 'Combat',
    description: `Physical Damage = [(ATK × (1 + (Refine × 0.01))) × Element Multiplier × Size Modifier × Race Modifier] - DEF

Where:
• ATK = Base Attack + Weapon Attack + Equipment Bonuses
• Refine = Weapon Refine Level (e.g., +7 = 7% bonus)
• Element Multiplier = Based on attacker vs defender element
• Size Modifier = Weapon size penalty/bonus
• DEF = Target's total defense`
  },
  {
    term: 'Magic Damage',
    category: 'Combat',
    description: `Magic Damage = (MATK × Skill Modifier × Element Multiplier) - MDEF

Where:
• MATK = Base MATK + INT bonuses + Equipment
• Skill Modifier = Skill-specific multiplier
• Element Multiplier = Spell element vs target element
• MDEF = Target's magic defense`
  },
  {
    term: 'Critical Hit',
    category: 'Combat',
    description: `Critical Rate = (LUK × 0.3) + DEX × 0.2 + Critical bonuses from equipment

Critical Damage = Normal Damage × 1.4 (default)

Critical hits:
• Ignore enemy DEF
• Cannot miss
• Deal 140% damage (can be increased with cards/equipment)`
  },
  {
    term: 'Attack Speed (ASPD)',
    category: 'Stats',
    description: `ASPD = Base ASPD - [(AGI + DEX/4) × Delay Reduction]

• Base ASPD depends on weapon type and class
• AGI is the primary stat for ASPD
• DEX provides 0.25 ASPD per point
• ASPD ranges from 1 (slowest) to 193 (fastest)
• ASPD potions and buffs can increase attack speed`
  },
  {
    term: 'Flee Rate',
    category: 'Stats',
    description: `Flee = Base Flee + (AGI × 1) + (LUK × 0.2) + Equipment Bonuses

Hit Rate = Base Hit + (DEX × 1) + (LUK × 0.3) + Equipment Bonuses

Miss Chance = 100% - ((Hit Rate - Flee) / Hit Rate × 100%)

• Perfect Flee has a separate chance to dodge (LUK × 0.1)
• Each point of AGI = 1 Flee
• Each point of LUK = 0.2 Flee`
  },
  {
    term: 'Experience Points',
    category: 'Leveling',
    description: `Base EXP Gained = Monster Base EXP × (1 + Level Difference Modifier) × EXP Boost
Job EXP Gained = Monster Job EXP × (1 + Level Difference Modifier) × EXP Boost

Level Difference Modifier:
• Same level: 100%
• 1-5 levels lower: 80-100%
• 6-10 levels lower: 60-80%
• 11+ levels lower: 40-60%

Party EXP is distributed based on contribution and level`
  },
  {
    term: 'HP and SP',
    category: 'Stats',
    description: `Max HP = Base HP + (VIT × 100) + (Job Level × 50) + Equipment Bonuses

Max SP = Base SP + (INT × 10) + (Job Level × 10) + Equipment Bonuses

HP Recovery = VIT / 5 per 10 seconds
SP Recovery = (INT + Max SP / 500) per 10 seconds

• VIT increases max HP and HP recovery
• INT increases max SP and SP recovery`
  },
  {
    term: 'Casting Time',
    category: 'Magic',
    description: `Cast Time = Base Cast Time × (1 - (DEX × 0.002))
After Cast Delay = Base Delay × (1 - (DEX × 0.002))

• Each point of DEX reduces cast time by 0.2%
• At 150 DEX, cast time is reduced by 30%
• Some skills have fixed cast time that cannot be reduced
• Cast time can also be reduced with equipment`
  },
  {
    term: 'Weight Penalty',
    category: 'Stats',
    description: `Max Weight = 2000 + (STR × 30)

Weight Penalties:
• 50% capacity: ASPD -10%
• 70% capacity: ASPD -25%, Flee -10
• 90% capacity: ASPD -50%, Flee -50, Cannot attack or use skills
• 100% capacity: Cannot move

Each point of STR increases max weight by 30`
  },
  {
    term: 'Drop Rate',
    category: 'Farming',
    description: `Drop Chance = Base Drop Rate × (1 + LUK × 0.001) × Drop Rate Bonuses

• Base drop rate is set per item per monster
• LUK slightly increases drop rates (0.1% per LUK)
• Cards, equipment, and buffs can increase drop rates
• Some items have guaranteed drops (100% rate)
• Boss drops may have different mechanics`
  },
  {
    term: 'Status Resistance',
    category: 'Stats',
    description: `Status Resistance = Base Resistance + (Stat × Modifier) + Equipment Bonuses

Stat Effects on Status:
• VIT: Stun, Poison resistance
• INT: Sleep, Silence resistance  
• DEX: Blind resistance
• AGI: Slow resistance
• LUK: All status resistance (minor)

Higher stats = lower chance to be affected by status effects`
  },
  {
    term: 'Refine System',
    category: 'Equipment',
    description: `Refine Bonus = Refine Level × Stat Bonus

Weapon Refine:
• +1 to +4: +ATK varies by level
• +5 to +10: Increased ATK bonus per level
• +11 and above: Major ATK increases

Armor Refine:
• Each +1 adds DEF and may add special bonuses
• Success rates decrease at higher refine levels
• Failure may break equipment (use safe refine or protection)`
  },
  {
    term: 'Party Bonus',
    category: 'Leveling',
    description: `Party EXP Bonus = Base EXP × (1 + (Party Members × 0.05))

• 2 members: +5% EXP
• 3 members: +10% EXP  
• 4 members: +15% EXP
• Maximum party size varies by server
• EXP is distributed based on damage contribution
• Being near party members is required for EXP share`
  }
];

export default function FormulasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(formulas.map(f => f.category)))];

  const filteredFormulas = formulas
    .filter(formula => 
      (selectedCategory === 'all' || formula.category === selectedCategory) &&
      (formula.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
       formula.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => a.term.localeCompare(b.term));

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
                <Calculator className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-slate-900">Game Formulas</h1>
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
            Game Mechanics & Formulas
          </h2>
          <p className="text-slate-600">
            Understand the calculations and mechanics behind Myth of Yggdrasil
          </p>
        </Card>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search formulas and mechanics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-6 text-lg"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Formulas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFormulas.map((formula) => (
            <Card key={formula.term} className="p-6 hover:shadow-lg transition-shadow bg-white">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-blue-600">
                  {formula.term}
                </h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  {formula.category}
                </span>
              </div>

              {/* Description */}
              <div className="text-slate-700 whitespace-pre-line leading-relaxed text-sm">
                {formula.description}
              </div>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredFormulas.length === 0 && (
          <Card className="p-12 text-center bg-white">
            <Calculator className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">
              No formulas found for "{searchTerm}"
            </p>
          </Card>
        )}

        {/* Results Count */}
        <div className="mt-8 text-center text-slate-500">
          Showing {filteredFormulas.length} of {formulas.length} formulas
        </div>
      </main>
    </div>
  );
}
