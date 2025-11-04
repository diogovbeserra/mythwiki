
import { Sword, Heart, Zap, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { prisma } from '@/lib/db';

async function getFeaturedMonsters() {
  try {
    // Get monsters with good variety - high level, some drops, and spawns
    const monsters = await prisma.monster.findMany({
      where: {
        AND: [
          { level: { gte: 10 } }, // Min level 10
          { omnibook: 1 }
        ]
      },
      include: {
        drops: {
          include: {
            item: {
              select: { name: true, ename: true }
            }
          },
          take: 3,
          orderBy: { rate: 'desc' }
        },
        spawns: {
          select: { mapName: true, qty: true },
          take: 2
        }
      },
      orderBy: [
        { level: 'desc' },
        { baseExp: 'desc' }
      ],
      take: 6
    });

    return monsters;
  } catch (error) {
    console.error('Error fetching featured monsters:', error);
    return [];
  }
}

function getElementColor(element?: string) {
  const colors: Record<string, string> = {
    Fire: 'text-red-500 bg-red-50',
    Water: 'text-blue-500 bg-blue-50',
    Earth: 'text-yellow-600 bg-yellow-50',
    Wind: 'text-green-500 bg-green-50',
    Poison: 'text-purple-500 bg-purple-50',
    Holy: 'text-yellow-500 bg-yellow-50',
    Shadow: 'text-gray-600 bg-gray-50',
    Ghost: 'text-indigo-500 bg-indigo-50',
    Undead: 'text-gray-800 bg-gray-100',
    Neutral: 'text-slate-500 bg-slate-50'
  };
  return colors[element ?? 'Neutral'] || 'text-slate-500 bg-slate-50';
}

export async function FeaturedMonsters() {
  const monsters = await getFeaturedMonsters();

  if (monsters.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Sword className="h-12 w-12 mx-auto mb-4 text-slate-300" />
        <p>No featured monsters available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {monsters.map((monster) => (
        <Card key={monster.id} className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <Link href={`/monsters/${monster.id}`} className="block">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sword className="h-4 w-4 text-red-500" />
                    <h4 className="font-semibold text-slate-900 truncate">
                      {monster.name}
                    </h4>
                    {monster.jName && monster.jName !== monster.name && (
                      <span className="text-sm text-slate-500 truncate">
                        ({monster.jName})
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      Level {monster.level}
                    </Badge>
                    {monster.element && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getElementColor(monster.element)}`}
                      >
                        {monster.element}
                      </Badge>
                    )}
                    {monster.race && (
                      <Badge variant="outline" className="text-xs">
                        {monster.race}
                      </Badge>
                    )}
                    {monster.size && (
                      <Badge variant="outline" className="text-xs">
                        {monster.size}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-slate-600 mb-2">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-3 w-3" />
                      <span>{monster.hp?.toLocaleString()} HP</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="h-3 w-3" />
                      <span>{monster.baseExp?.toLocaleString()} EXP</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-slate-600">
                    {monster.drops && monster.drops.length > 0 && (
                      <div>
                        <span className="font-medium">Drops:</span>{' '}
                        {monster.drops
                          .slice(0, 2)
                          .map((drop) => drop.item?.ename || drop.item?.name)
                          .filter(Boolean)
                          .join(', ')}
                        {monster.drops.length > 2 && ' +more'}
                      </div>
                    )}
                    
                    {monster.spawns && monster.spawns.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {monster.spawns
                            .slice(0, 2)
                            .map((spawn) => spawn.mapName)
                            .filter(Boolean)
                            .join(', ')}
                          {monster.spawns.length > 2 && ' +more'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <span className="text-xs text-slate-500">ID: {monster.id}</span>
                  {monster.monsterType && (
                    <Badge 
                      variant={monster.monsterType === 'Normal' ? 'secondary' : 'default'} 
                      className="text-xs"
                    >
                      {monster.monsterType}
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
