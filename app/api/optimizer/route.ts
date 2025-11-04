
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

interface OptimizerParams {
  dps: number;
  element: string;
  goal: string;
  farmMode: 'aoe' | 'single';
  teleportCooldown: number;
  minLevel?: number;
  maxLevel?: number;
}

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
    timeToKill: number; // seconds
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

// Element multipliers based on Ragnarok element table (Level 1)
// Values are stored as decimal multipliers
const ELEMENT_MULTIPLIERS: Record<string, Record<string, number>> = {
  neutral: { neutral: 1.00, fire: 1.00, water: 1.00, earth: 1.00, wind: 1.00, poison: 1.00, holy: 1.00, shadow: 1.00, ghost: 0.75, undead: 1.00 },
  fire: { neutral: 1.00, fire: 0.25, water: 0.90, earth: 1.25, wind: 1.00, poison: 1.20, holy: 0.90, shadow: 1.00, ghost: 1.00, undead: 1.00 },
  earth: { neutral: 1.00, fire: 0.90, water: 1.00, earth: 0.25, wind: 1.25, poison: 1.20, holy: 0.90, shadow: 1.00, ghost: 1.00, undead: 1.00 },
  wind: { neutral: 1.00, fire: 1.00, water: 1.25, earth: 0.90, wind: 0.25, poison: 1.20, holy: 0.90, shadow: 1.00, ghost: 1.00, undead: 1.00 },
  water: { neutral: 1.00, fire: 1.25, water: 0.25, earth: 1.00, wind: 0.90, poison: 1.20, holy: 0.90, shadow: 1.00, ghost: 1.00, undead: 1.00 },
  poison: { neutral: 1.00, fire: 1.20, water: 1.20, earth: 1.20, wind: 1.20, poison: 0.25, holy: 0.90, shadow: 0.90, ghost: 0.90, undead: 0.90 },
  holy: { neutral: 1.00, fire: 1.00, water: 1.00, earth: 1.00, wind: 1.00, poison: 0.90, holy: 0.25, shadow: 1.25, ghost: 1.00, undead: 1.25 },
  shadow: { neutral: 1.00, fire: 1.00, water: 1.00, earth: 1.00, wind: 1.00, poison: 0.90, holy: 1.25, shadow: 0.25, ghost: 1.00, undead: 0.90 },
  ghost: { neutral: 0.75, fire: 1.00, water: 1.00, earth: 1.00, wind: 1.00, poison: 0.90, holy: 0.90, shadow: 0.90, ghost: 1.25, undead: 1.25 },
  undead: { neutral: 1.00, fire: 1.00, water: 1.00, earth: 1.00, wind: 1.00, poison: 0.90, holy: 1.25, shadow: 0.90, ghost: 1.25, undead: 0.25 },
};

function getElementMultiplier(attackElement: string, defenseElement: string | null): number {
  if (!defenseElement) return 1;
  
  const normalizedAttack = attackElement.toLowerCase();
  const normalizedDefense = defenseElement.toLowerCase();
  
  return ELEMENT_MULTIPLIERS[normalizedAttack]?.[normalizedDefense] ?? 1;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params: OptimizerParams = {
      dps: parseFloat(searchParams.get('dps') || '1000'),
      element: searchParams.get('element') || 'neutral',
      goal: searchParams.get('goal') || 'zeny',
      farmMode: (searchParams.get('farmMode') as 'aoe' | 'single') || 'single',
      teleportCooldown: parseFloat(searchParams.get('teleportCooldown') || '2'),
      minLevel: searchParams.get('minLevel') ? parseInt(searchParams.get('minLevel')!) : undefined,
      maxLevel: searchParams.get('maxLevel') ? parseInt(searchParams.get('maxLevel')!) : undefined,
    };

    // Fetch monsters with their drops and spawns
    const monsters = await prisma.monster.findMany({
      where: {
        AND: [
          { omnibook: 1 },
          params.minLevel ? { level: { gte: params.minLevel } } : {},
          params.maxLevel ? { level: { lte: params.maxLevel } } : {},
        ],
      },
      include: {
        drops: {
          include: {
            item: {
              select: {
                name: true,
                valueSell: true,
              },
            },
          },
        },
        spawns: {
          select: {
            mapName: true,
            qty: true,
          },
        },
      },
      take: 500, // Limit for performance
    });

    const results: FarmResult[] = [];

    for (const monster of monsters) {
      // Skip if no spawns or HP is too low
      if (monster.spawns.length === 0 || monster.hp < 1) continue;

      // Calculate element multiplier
      const elementMultiplier = getElementMultiplier(params.element, monster.element);
      const effectiveDPS = params.dps * elementMultiplier;

      // Time to kill in seconds
      const timeToKill = Math.max(monster.hp / effectiveDPS, 0.1); // Minimum 0.1s

      // Get max spawn quantity
      const maxSpawnQty = Math.max(...monster.spawns.map(s => s.qty || 0));
      
      // Calculate monsters per hour based on farm mode and movement time
      let monstersPerHour: number;
      
      // Total time per kill = kill time + movement/teleport time
      const totalTimePerKill = timeToKill + params.teleportCooldown;
      
      if (params.farmMode === 'aoe') {
        // AoE: Can kill multiple monsters at once
        // Base kills per hour
        const baseKillsPerHour = 3600 / totalTimePerKill;
        
        // AoE efficiency based on spawn density
        // Low spawn (1-20): 1.2x | Medium spawn (21-50): 1.5x | High spawn (51+): 2.0x
        const aoeMultiplier = maxSpawnQty <= 20 ? 1.2 : maxSpawnQty <= 50 ? 1.5 : 2.0;
        
        // Apply AoE multiplier
        monstersPerHour = baseKillsPerHour * aoeMultiplier;
      } else {
        // Single target: One monster at a time
        monstersPerHour = 3600 / totalTimePerKill;
      }

      // Calculate expected zeny per hour from drops
      let totalZenyPerHour = 0;
      const topDrops: FarmResult['topDrops'] = [];

      for (const drop of monster.drops) {
        if (!drop.item.valueSell) continue;
        
        const dropRate = drop.rate / 100; // Convert from percentage to decimal (30% = 0.30)
        const expectedZenyPerHour = dropRate * drop.item.valueSell * monstersPerHour;
        totalZenyPerHour += expectedZenyPerHour;

        topDrops.push({
          itemName: drop.item.name,
          rate: drop.rate,
          valueSell: drop.item.valueSell,
          expectedZenyPerHour,
        });
      }

      // Sort drops by expected zeny
      topDrops.sort((a, b) => b.expectedZenyPerHour - a.expectedZenyPerHour);

      // Calculate EXP per hour
      const baseExpPerHour = monster.baseExp * monstersPerHour;
      const jobExpPerHour = monster.jobExp * monstersPerHour;

      // Calculate score based on goal
      let score = 0;
      switch (params.goal) {
        case 'zeny':
          score = totalZenyPerHour;
          break;
        case 'base_exp':
          score = baseExpPerHour;
          break;
        case 'job_exp':
          score = jobExpPerHour;
          break;
        case 'balanced':
          score = totalZenyPerHour / 1000 + baseExpPerHour / 100 + jobExpPerHour / 100;
          break;
      }

      results.push({
        monster: {
          id: monster.id,
          name: monster.name,
          level: monster.level,
          hp: monster.hp,
          baseExp: monster.baseExp,
          jobExp: monster.jobExp,
          element: monster.element,
          race: monster.race,
        },
        efficiency: {
          timeToKill,
          monstersPerHour,
          zenyPerHour: totalZenyPerHour,
          baseExpPerHour,
          jobExpPerHour,
          score,
        },
        spawns: monster.spawns,
        topDrops: topDrops.slice(0, 5), // Top 5 drops
      });
    }

    // Sort by score
    results.sort((a, b) => b.efficiency.score - a.efficiency.score);

    // Return top 20 results
    return NextResponse.json(results.slice(0, 20));

  } catch (error) {
    console.error('Optimizer error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate farm efficiency' },
      { status: 500 }
    );
  }
}
