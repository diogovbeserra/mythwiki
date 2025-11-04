
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sword, Heart, Zap } from 'lucide-react';
import Link from 'next/link';

interface RelatedMonstersProps {
  monsterId: number;
  race?: string;
  element?: string;
}

async function getRelatedMonsters(monsterId: number, race?: string, element?: string) {
  try {
    const monsters = await prisma.monster.findMany({
      where: {
        AND: [
          { id: { not: monsterId } },
          race ? { race } : {},
          element ? { element } : {}
        ]
      },
      select: {
        id: true,
        name: true,
        jName: true,
        level: true,
        hp: true,
        baseExp: true,
        race: true,
        element: true
      },
      orderBy: { level: 'desc' },
      take: 5
    });

    return monsters;
  } catch (error) {
    console.error('Error fetching related monsters:', error);
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

export async function RelatedMonsters({ monsterId, race, element }: RelatedMonstersProps) {
  const relatedMonsters = await getRelatedMonsters(monsterId, race, element);

  if (relatedMonsters.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sword className="h-4 w-4 text-red-600" />
          <span>Related Monsters</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {relatedMonsters.map((monster) => (
            <Link 
              key={monster.id} 
              href={`/monsters/${monster.id}`}
              className="block p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-900 truncate">
                    {monster.name}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    Lv.{monster.level}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-3 w-3" />
                    <span>{monster.hp?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="h-3 w-3" />
                    <span>{monster.baseExp?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {monster.race && (
                    <Badge variant="outline" className="text-xs">
                      {monster.race}
                    </Badge>
                  )}
                  {monster.element && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getElementColor(monster.element)}`}
                    >
                      {monster.element}
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
