
import { Heart, Shield, Sword, Star, Package, Coins, Scale, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

// Function to format Lua description text with color codes and HTML tags
function formatDescriptionLine(line: string): { text: string; className: string } {
  // Remove color codes like ^CED6E6, ^5b719F, ^009900, etc.
  const colorCodeRegex = /\^[0-9A-Fa-f]{6}/g;
  let formatted = line.replace(colorCodeRegex, '');
  
  // Extract ITEMVIEW tags and make them links (simplified for now)
  formatted = formatted.replace(/<ITEMVIEW>([^<]+)<INFO>([^,]+),ITEM,(\d+)[^>]*<\/INFO><\/ITEMVIEW>/g, '$2');
  
  // Remove TP tags but keep content
  formatted = formatted.replace(/<TP>([^<]+)<\/TP>/g, '$1');
  
  // Determine styling based on original content
  let className = 'text-slate-700';
  
  // Separator lines
  if (line.includes('__________________')) {
    return { text: '', className: 'border-t border-slate-200 my-2' };
  }
  
  // Refine levels and special conditions (blue)
  if (line.includes('Refine +') || line.includes('Refine Level +')) {
    className = 'text-blue-600 font-semibold';
  }
  
  // Set bonuses (purple)
  if (line.match(/^\^990099/) || line.includes('[+')) {
    className = 'text-purple-600 font-semibold';
  }
  
  // Special effect names in brackets (teal)
  if (line.match(/^\^009984/) || (line.startsWith('[') && line.endsWith(']'))) {
    className = 'text-teal-600 font-semibold';
  }
  
  // Type/requirement labels (indigo)
  if (line.includes('Type:') || line.includes('Physical Attack:') || line.includes('Weight:') || 
      line.includes('Weapon Level:') || line.includes('Requirement:') || line.includes('Socket at:')) {
    className = 'text-indigo-600 font-medium';
  }
  
  // Skill names and effects (green)
  if (formatted.match(/\b(Level \d+|auto-cast|Increases damage|Decreases|damage)\b/i)) {
    className = 'text-emerald-700';
  }
  
  return { text: formatted.trim(), className };
}

interface ItemWithDetails {
  id: number;
  name: string;
  ename?: string | null;
  weight?: number | null;
  type?: number | null;
  subtype?: number | null;
  atk?: number | null;
  def?: number | null;
  matk?: number | null;
  slots?: number | null;
  weaponLevel?: number | null;
  armorLevel?: number | null;
  equipLocation?: number | null;
  elv?: number | null;
  elvmax?: number | null;
  valueBuy?: number | null;
  valueSell?: number | null;
  description?: {
    identifiedDisplayName?: string | null;
    identifiedDescription?: string[];
    unidentifiedDisplayName?: string | null;
    unidentifiedDescription?: string[];
  } | null;
  droppedBy?: Array<{
    rate: number;
    monster: {
      id: number;
      name: string;
      jName?: string | null;
      level: number;
      race?: string | null;
      element?: string | null;
      spawns: Array<{
        mapName?: string | null;
      }>;
    };
  }>;
  usedInCrafts?: Array<{
    id: number;
    quantity: number;
    craft: {
      id: number;
      name: string;
      type: string;
      location?: string | null;
      npc?: string | null;
    };
  }>;
  usedInClassServices?: Array<{
    id: number;
    quantity: number;
    classService: {
      id: number;
      name: string;
      jobClass: string;
    };
  }>;
}

const ITEM_TYPES = {
  0: 'Consumable',
  2: 'Usable',
  3: 'Misc',
  4: 'Weapon',
  5: 'Armor',
  6: 'Card',
  7: 'Pet Equipment',
  8: 'Pet Accessory',
  10: 'Arrow',
  11: 'Usable with delayed consumption',
  18: 'Cash',
  20: 'Collection'
};

const EQUIP_LOCATIONS = {
  1: 'Lower Headgear',
  2: 'Right Hand',
  4: 'Garment',
  8: 'Left Accessory',
  16: 'Armor',
  32: 'Left Hand',
  64: 'Footgear',
  128: 'Right Accessory',
  256: 'Upper Headgear',
  512: 'Middle Headgear',
  1024: 'Costume Upper Headgear',
  2048: 'Costume Middle Headgear',
  4096: 'Costume Lower Headgear',
  8192: 'Costume Garment',
  16384: 'Ammo'
};

function getItemTypeName(type?: number | null) {
  return ITEM_TYPES[type as keyof typeof ITEM_TYPES] || 'Unknown';
}

function getEquipLocationName(location?: number | null) {
  if (!location) return null;
  return EQUIP_LOCATIONS[location as keyof typeof EQUIP_LOCATIONS] || `Location ${location}`;
}

interface ItemDetailProps {
  item: ItemWithDetails;
}

export function ItemDetail({ item }: ItemDetailProps) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Name</label>
              <div className="mt-1">
                <p className="text-lg font-semibold text-slate-900">
                  {item.ename || item.name}
                </p>
                {item.ename && item.name !== item.ename && (
                  <p className="text-sm text-slate-500">({item.name})</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">ID</label>
              <p className="text-lg font-mono text-slate-900 mt-1">{item.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Type</label>
              <div className="mt-1">
                <Badge variant="secondary">{getItemTypeName(item.type)}</Badge>
              </div>
            </div>
            {item.weight && item.weight > 0 && (
              <div>
                <label className="text-sm font-medium text-slate-600">Weight</label>
                <div className="flex items-center space-x-1 mt-1">
                  <Scale className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-900">{item.weight}</span>
                </div>
              </div>
            )}
            {item.slots && item.slots > 0 && (
              <div>
                <label className="text-sm font-medium text-slate-600">Slots</label>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-lg font-semibold text-slate-900">{item.slots}</span>
                  <span className="text-sm text-slate-500">slots</span>
                </div>
              </div>
            )}
          </div>

          {getEquipLocationName(item.equipLocation) && (
            <div>
              <label className="text-sm font-medium text-slate-600">Equipment Location</label>
              <div className="mt-1">
                <Badge variant="outline">{getEquipLocationName(item.equipLocation)}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      {(item.atk || item.def || item.matk || item.weaponLevel || item.armorLevel || item.elv || item.elvmax) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sword className="h-5 w-5 text-red-600" />
              <span>Stats & Requirements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {item.atk && item.atk > 0 && (
                <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                  <div className="text-3xl font-bold text-red-600 mb-1">{item.atk}</div>
                  <div className="text-sm font-medium text-red-700">Attack</div>
                </div>
              )}
              {item.def && item.def > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{item.def}</div>
                  <div className="text-sm font-medium text-blue-700">Defense</div>
                </div>
              )}
              {item.matk && item.matk > 0 && (
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{item.matk}</div>
                  <div className="text-sm font-medium text-purple-700">Magic Attack</div>
                </div>
              )}
              {item.weaponLevel && item.weaponLevel > 0 && (
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                  <div className="text-3xl font-bold text-orange-600 mb-1">{item.weaponLevel}</div>
                  <div className="text-sm font-medium text-orange-700">Weapon Level</div>
                </div>
              )}
              {item.armorLevel && item.armorLevel > 0 && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <div className="text-3xl font-bold text-green-600 mb-1">{item.armorLevel}</div>
                  <div className="text-sm font-medium text-green-700">Armor Level</div>
                </div>
              )}
              {item.elv && item.elv > 0 && (
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="text-3xl font-bold text-slate-700 mb-1">{item.elv}</div>
                  <div className="text-sm font-medium text-slate-600">Min Level</div>
                </div>
              )}
              {item.elvmax && item.elvmax > 0 && item.elvmax < 250 && (
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="text-3xl font-bold text-slate-700 mb-1">{item.elvmax}</div>
                  <div className="text-sm font-medium text-slate-600">Max Level</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Economy */}
      {(item.valueBuy || item.valueSell) && (item.valueBuy! > 0 || item.valueSell! > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Coins className="h-5 w-5 text-yellow-600" />
              <span>Economy</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {item.valueBuy && item.valueBuy > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{item.valueBuy.toLocaleString()}z</div>
                  <div className="text-sm text-slate-600">Buy Price</div>
                </div>
              )}
              {item.valueSell && item.valueSell > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{item.valueSell.toLocaleString()}z</div>
                  <div className="text-sm text-slate-600">Sell Price</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {item.description && item.description.identifiedDescription && item.description.identifiedDescription.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-amber-600" />
              <span>Description & Effects</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg p-6 border border-slate-200 space-y-2">
              {item.description.identifiedDescription.map((line, index) => {
                const formatted = formatDescriptionLine(line);
                
                // Handle separator lines
                if (formatted.className.includes('border-t')) {
                  return <div key={index} className={formatted.className} />;
                }
                
                // Skip empty lines
                if (!formatted.text) {
                  return <div key={index} className="h-1" />;
                }
                
                return (
                  <p key={index} className={`text-sm ${formatted.className} leading-relaxed`}>
                    {formatted.text}
                  </p>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dropped By */}
      {item.droppedBy && item.droppedBy.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <span>Dropped By Monsters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {item.droppedBy.map((drop) => (
                <div key={drop.monster.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <Link 
                    href={`/monsters/${drop.monster.id}`}
                    className="flex-1 hover:text-blue-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">
                          {drop.monster.name}
                          {drop.monster.jName && drop.monster.jName !== drop.monster.name && (
                            <span className="text-sm text-slate-500 ml-2">({drop.monster.jName})</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <span>Level {drop.monster.level}</span>
                          {drop.monster.race && <span>{drop.monster.race}</span>}
                          {drop.monster.element && <span>{drop.monster.element}</span>}
                        </div>
                        {drop.monster.spawns && drop.monster.spawns.length > 0 && (
                          <div className="text-xs text-slate-500">
                            Spawns: {drop.monster.spawns.slice(0, 2).map(s => s.mapName).filter(Boolean).join(', ')}
                          </div>
                        )}
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

      {/* Used in Crafts */}
      {item.usedInCrafts && item.usedInCrafts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🛠️</span>
              <span>Used in Crafts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {item.usedInCrafts.map((craftMat) => (
                <div key={craftMat.id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <Link href={`/crafts/${craftMat.craft.id}`} className="block hover:bg-purple-100 transition-colors rounded p-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 mb-1">
                          {craftMat.craft.name}
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Badge variant="secondary" className="text-xs">
                            {craftMat.craft.type}
                          </Badge>
                          <span className="text-slate-600">
                            Requires {craftMat.quantity}x
                          </span>
                        </div>
                        {craftMat.craft.location && (
                          <div className="text-xs text-slate-500 mt-1">
                            📍 {craftMat.craft.location}
                          </div>
                        )}
                        {craftMat.craft.npc && (
                          <div className="text-xs text-slate-500 mt-1">
                            👤 {craftMat.craft.npc}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Used in Class Services */}
      {item.usedInClassServices && item.usedInClassServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>👤</span>
              <span>Used in Class Services</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {item.usedInClassServices.map((serviceMat) => (
                <div key={serviceMat.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 mb-1">
                        {serviceMat.classService.name}
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Badge variant="secondary" className="text-xs">
                          {serviceMat.classService.jobClass}
                        </Badge>
                        <span className="text-slate-600">
                          Requires {serviceMat.quantity}x
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
