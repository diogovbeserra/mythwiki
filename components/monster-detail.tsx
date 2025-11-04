
import { Heart, Shield, Sword, Star, Zap, MapPin, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

interface MonsterWithDetails {
  id: number;
  name: string;
  jName?: string | null;
  sprite?: string | null;
  level: number;
  hp: number;
  baseExp: number;
  jobExp: number;
  hit?: number | null;
  flee?: number | null;
  def?: number | null;
  mDef?: number | null;
  str?: number | null;
  agi?: number | null;
  vit?: number | null;
  int?: number | null;
  dex?: number | null;
  luk?: number | null;
  atk1?: number | null;
  atk2?: number | null;
  mAtkMin?: number | null;
  mAtkMax?: number | null;
  speed?: number | null;
  race?: string | null;
  size?: string | null;
  element?: string | null;
  elementLevel?: number | null;
  monsterType?: string | null;
  drops?: Array<{
    rate: number;
    item: {
      id: number;
      name: string;
      ename?: string | null;
      type?: number | null;
      valueSell?: number | null;
    };
  }>;
  spawns?: Array<{
    mapName?: string | null;
    qty?: number | null;
  }>;
  skills?: Array<{
    skillName?: string | null;
    skillLvl?: number | null;
  }>;
}

function getElementColor(element?: string | null) {
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

interface MonsterDetailProps {
  monster: MonsterWithDetails;
}

export function MonsterDetail({ monster }: MonsterDetailProps) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sword className="h-5 w-5 text-red-600" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Name</label>
              <div className="mt-1">
                <p className="text-lg font-semibold text-slate-900">{monster.name}</p>
                {monster.jName && monster.jName !== monster.name && (
                  <p className="text-sm text-slate-500">({monster.jName})</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">ID</label>
              <p className="text-lg font-mono text-slate-900 mt-1">{monster.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Level</label>
              <p className="text-lg font-semibold text-slate-900 mt-1">{monster.level}</p>
            </div>
            {monster.race && (
              <div>
                <label className="text-sm font-medium text-slate-600">Race</label>
                <div className="mt-1">
                  <Badge variant="secondary">{monster.race}</Badge>
                </div>
              </div>
            )}
            {monster.element && (
              <div>
                <label className="text-sm font-medium text-slate-600">Element</label>
                <div className="mt-1">
                  <Badge variant="outline" className={getElementColor(monster.element)}>
                    {monster.element}
                    {monster.elementLevel && monster.elementLevel > 1 && ` ${monster.elementLevel}`}
                  </Badge>
                </div>
              </div>
            )}
            {monster.size && (
              <div>
                <label className="text-sm font-medium text-slate-600">Size</label>
                <div className="mt-1">
                  <Badge variant="outline">{monster.size}</Badge>
                </div>
              </div>
            )}
          </div>

          {monster.monsterType && (
            <div>
              <label className="text-sm font-medium text-slate-600">Type</label>
              <div className="mt-1">
                <Badge variant={monster.monsterType === 'Normal' ? 'secondary' : 'default'}>
                  {monster.monsterType}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Combat Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-red-600" />
            <span>Combat Stats</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{monster.hp?.toLocaleString()}</div>
              <div className="text-sm text-slate-600 flex items-center justify-center">
                <Heart className="h-3 w-3 mr-1" />
                HP
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{monster.baseExp?.toLocaleString()}</div>
              <div className="text-sm text-slate-600 flex items-center justify-center">
                <Zap className="h-3 w-3 mr-1" />
                Base EXP
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{monster.jobExp?.toLocaleString()}</div>
              <div className="text-sm text-slate-600">Job EXP</div>
            </div>
            {monster.speed && (
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{monster.speed}</div>
                <div className="text-sm text-slate-600">Speed</div>
              </div>
            )}
          </div>

          {(monster.atk1 || monster.def || monster.hit || monster.flee) && (
            <>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {monster.atk1 && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-500">
                      {monster.atk1}~{monster.atk2 || monster.atk1}
                    </div>
                    <div className="text-sm text-slate-600">Attack</div>
                  </div>
                )}
                {monster.def && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-500">{monster.def}</div>
                    <div className="text-sm text-slate-600">Defense</div>
                  </div>
                )}
                {monster.hit && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-500">{monster.hit}</div>
                    <div className="text-sm text-slate-600">Hit</div>
                  </div>
                )}
                {monster.flee && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-yellow-500">{monster.flee}</div>
                    <div className="text-sm text-slate-600">Flee</div>
                  </div>
                )}
              </div>
            </>
          )}

          {(monster.str || monster.agi || monster.vit || monster.int || monster.dex || monster.luk) && (
            <>
              <Separator className="my-4" />
              <h4 className="font-medium text-slate-900 mb-3">Stats</h4>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {monster.str && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-slate-700">{monster.str}</div>
                    <div className="text-xs text-slate-600">STR</div>
                  </div>
                )}
                {monster.agi && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-slate-700">{monster.agi}</div>
                    <div className="text-xs text-slate-600">AGI</div>
                  </div>
                )}
                {monster.vit && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-slate-700">{monster.vit}</div>
                    <div className="text-xs text-slate-600">VIT</div>
                  </div>
                )}
                {monster.int && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-slate-700">{monster.int}</div>
                    <div className="text-xs text-slate-600">INT</div>
                  </div>
                )}
                {monster.dex && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-slate-700">{monster.dex}</div>
                    <div className="text-xs text-slate-600">DEX</div>
                  </div>
                )}
                {monster.luk && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-slate-700">{monster.luk}</div>
                    <div className="text-xs text-slate-600">LUK</div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Drops */}
      {monster.drops && monster.drops.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <span>Drops ({monster.drops.length} items)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monster.drops.map((drop, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <Link 
                    href={`/items/${drop.item.id}`}
                    className="flex-1 hover:text-blue-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">
                          {drop.item.ename || drop.item.name}
                          {drop.item.ename && drop.item.name !== drop.item.ename && (
                            <span className="text-sm text-slate-500 ml-2">({drop.item.name})</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <span>ID: {drop.item.id}</span>
                          {drop.item.valueSell && drop.item.valueSell > 0 && (
                            <span>{drop.item.valueSell.toLocaleString()}z</span>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-4">
                        {drop.rate}%
                      </Badge>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Spawns */}
      {monster.spawns && monster.spawns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <span>Spawn Locations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {monster.spawns.map((spawn, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="font-medium text-slate-900">{spawn.mapName}</span>
                  {spawn.qty && (
                    <Badge variant="outline">{spawn.qty} spawns</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {monster.skills && monster.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <span>Skills</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {monster.skills.map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="font-medium text-slate-900">{skill.skillName}</span>
                  {skill.skillLvl && (
                    <Badge variant="outline">Lv.{skill.skillLvl}</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
