
import { prisma } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sword, Users, ArrowLeft, ArrowRight, Heart, Zap, MapPin } from 'lucide-react';
import Link from 'next/link';

interface SearchParams {
  page?: string;
  search?: string;
  element?: string;
  race?: string;
  size?: string;
  minLevel?: string;
  maxLevel?: string;
  sort?: string;
}

interface MonstersListProps {
  searchParams: SearchParams;
}

const MONSTERS_PER_PAGE = 20;

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

async function getMonsters({ page = 1, search = '', element = '', race = '', size = '', minLevel = '', maxLevel = '', sort = 'name' }: {
  page: number;
  search: string;
  element: string;
  race: string;
  size: string;
  minLevel: string;
  maxLevel: string;
  sort: string;
}) {
  try {
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { jName: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (element && element !== 'all') {
      where.element = element;
    }

    if (race && race !== 'all') {
      where.race = race;
    }

    if (size && size !== 'all') {
      where.size = size;
    }

    if (minLevel) {
      where.level = { ...where.level, gte: parseInt(minLevel) };
    }

    if (maxLevel) {
      where.level = { ...where.level, lte: parseInt(maxLevel) };
    }

    let orderBy: any = { name: 'asc' };
    switch (sort) {
      case 'level':
        orderBy = { level: 'desc' };
        break;
      case 'hp':
        orderBy = { hp: 'desc' };
        break;
      case 'exp':
        orderBy = { baseExp: 'desc' };
        break;
      default:
        orderBy = { name: 'asc' };
    }

    const [monsters, total] = await Promise.all([
      prisma.monster.findMany({
        where,
        include: {
          drops: {
            include: {
              item: {
                select: { name: true, ename: true }
              }
            },
            take: 2,
            orderBy: { rate: 'desc' }
          },
          spawns: {
            select: { mapName: true },
            take: 2
          }
        },
        orderBy,
        skip: (page - 1) * MONSTERS_PER_PAGE,
        take: MONSTERS_PER_PAGE
      }),
      prisma.monster.count({ where })
    ]);

    return { monsters, total, totalPages: Math.ceil(total / MONSTERS_PER_PAGE) };
  } catch (error) {
    console.error('Error fetching monsters:', error);
    return { monsters: [], total: 0, totalPages: 0 };
  }
}

export async function MonstersList({ searchParams }: MonstersListProps) {
  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const search = searchParams.search || '';
  const element = searchParams.element || '';
  const race = searchParams.race || '';
  const size = searchParams.size || '';
  const minLevel = searchParams.minLevel || '';
  const maxLevel = searchParams.maxLevel || '';
  const sort = searchParams.sort || 'name';

  const { monsters, total, totalPages } = await getMonsters({ 
    page, search, element, race, size, minLevel, maxLevel, sort 
  });

  if (monsters.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No monsters found</h3>
        <p className="text-slate-600">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing {((page - 1) * MONSTERS_PER_PAGE) + 1} - {Math.min(page * MONSTERS_PER_PAGE, total)} of {total.toLocaleString()} monsters
        </p>
        <div className="text-sm text-slate-500">
          Page {page} of {totalPages}
        </div>
      </div>

      {/* Monsters Grid */}
      <div className="space-y-4">
        {monsters.map((monster) => (
          <Card key={monster.id} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <Link href={`/monsters/${monster.id}`} className="block">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sword className="h-4 w-4 text-red-500" />
                      <h3 className="font-semibold text-slate-900 truncate">
                        {monster.name}
                      </h3>
                      {monster.jName && monster.jName !== monster.name && (
                        <span className="text-sm text-slate-500 truncate">({monster.jName})</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-2 flex-wrap gap-1">
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
                          {monster.drops.map(drop => drop.item?.ename || drop.item?.name).filter(Boolean).join(', ')}
                        </div>
                      )}
                      
                      {monster.spawns && monster.spawns.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {monster.spawns.map(spawn => spawn.mapName).filter(Boolean).join(', ')}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <Link href={`/monsters?${new URLSearchParams({ ...searchParams, page: String(page - 1) }).toString()}`}>
            <Button variant="outline" size="sm" disabled={page <= 1}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          </Link>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + Math.max(1, page - 2);
              if (pageNum > totalPages) return null;
              
              return (
                <Link key={pageNum} href={`/monsters?${new URLSearchParams({ ...searchParams, page: String(pageNum) }).toString()}`}>
                  <Button
                    variant={pageNum === page ? "default" : "outline"}
                    size="sm"
                    className="w-10 h-10"
                  >
                    {pageNum}
                  </Button>
                </Link>
              );
            }).filter(Boolean)}
          </div>

          <Link href={`/monsters?${new URLSearchParams({ ...searchParams, page: String(page + 1) }).toString()}`}>
            <Button variant="outline" size="sm" disabled={page >= totalPages}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
