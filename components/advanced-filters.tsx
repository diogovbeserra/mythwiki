
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const WEAPON_TYPES = [
  { value: 'dagger', label: 'Dagger' },
  { value: 'one-handed sword', label: 'One-Handed Sword' },
  { value: 'two-handed sword', label: 'Two-Handed Sword' },
  { value: 'one-handed spear', label: 'One-Handed Spear' },
  { value: 'two-handed spear', label: 'Two-Handed Spear' },
  { value: 'one-handed axe', label: 'One-Handed Axe' },
  { value: 'two-handed axe', label: 'Two-Handed Axe' },
  { value: 'mace', label: 'Mace' },
  { value: 'two-handed mace', label: 'Two-Handed Mace' },
  { value: 'staff', label: 'Staff' },
  { value: 'bow', label: 'Bow' },
  { value: 'knuckle', label: 'Knuckle' },
  { value: 'instrument', label: 'Instrument' },
  { value: 'whip', label: 'Whip' },
  { value: 'book', label: 'Book' },
  { value: 'katar', label: 'Katar' },
  { value: 'revolver', label: 'Revolver' },
  { value: 'rifle', label: 'Rifle' },
  { value: 'gatling gun', label: 'Gatling Gun' },
  { value: 'shotgun', label: 'Shotgun' },
  { value: 'grenade launcher', label: 'Grenade Launcher' },
  { value: 'fuuma shuriken', label: 'Fuuma Shuriken' }
];

const ITEM_CATEGORIES = [
  { value: 'weapon', label: 'Weapon' },
  { value: 'armor', label: 'Armor' },
  { value: 'shield', label: 'Shield' },
  { value: 'garment', label: 'Garment' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'headgear', label: 'Headgear' },
  { value: 'card', label: 'Card' },
  { value: 'consumable', label: 'Consumable' }
];

const MONSTER_RACES = [
  { value: 'formless', label: 'Formless' },
  { value: 'undead', label: 'Undead' },
  { value: 'brute', label: 'Brute' },
  { value: 'plant', label: 'Plant' },
  { value: 'insect', label: 'Insect' },
  { value: 'fish', label: 'Fish' },
  { value: 'demon', label: 'Demon' },
  { value: 'demi-human', label: 'Demi-Human' },
  { value: 'angel', label: 'Angel' },
  { value: 'dragon', label: 'Dragon' }
];

const MONSTER_SIZES = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' }
];

interface AdvancedFiltersProps {
  searchParams: {
    q?: string;
    weaponType?: string;
    itemCategory?: string;
    monsterMinLevel?: string;
    monsterMaxLevel?: string;
    monsterRace?: string;
    monsterSize?: string;
  };
}

export function AdvancedFilters({ searchParams }: AdvancedFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  
  const [weaponType, setWeaponType] = useState(searchParams.weaponType || 'all');
  const [itemCategory, setItemCategory] = useState(searchParams.itemCategory || 'all');
  const [monsterMinLevel, setMonsterMinLevel] = useState(searchParams.monsterMinLevel || '');
  const [monsterMaxLevel, setMonsterMaxLevel] = useState(searchParams.monsterMaxLevel || '');
  const [monsterRace, setMonsterRace] = useState(searchParams.monsterRace || 'all');
  const [monsterSize, setMonsterSize] = useState(searchParams.monsterSize || 'all');

  useEffect(() => {
    setWeaponType(searchParams.weaponType || 'all');
    setItemCategory(searchParams.itemCategory || 'all');
    setMonsterMinLevel(searchParams.monsterMinLevel || '');
    setMonsterMaxLevel(searchParams.monsterMaxLevel || '');
    setMonsterRace(searchParams.monsterRace || 'all');
    setMonsterSize(searchParams.monsterSize || 'all');
  }, [searchParams]);

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(params.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    
    router.push(`/search?${newParams.toString()}`);
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams();
    if (params.get('q')) {
      newParams.set('q', params.get('q')!);
    }
    router.push(`/search?${newParams.toString()}`);
  };

  const hasFilters = 
    (weaponType && weaponType !== 'all') ||
    (itemCategory && itemCategory !== 'all') ||
    monsterMinLevel ||
    monsterMaxLevel ||
    (monsterRace && monsterRace !== 'all') ||
    (monsterSize && monsterSize !== 'all');

  const getActiveFilters = () => {
    const filters = [];
    if (weaponType && weaponType !== 'all') {
      filters.push({ key: 'weaponType', label: WEAPON_TYPES.find(t => t.value === weaponType)?.label || weaponType });
    }
    if (itemCategory && itemCategory !== 'all') {
      filters.push({ key: 'itemCategory', label: ITEM_CATEGORIES.find(c => c.value === itemCategory)?.label || itemCategory });
    }
    if (monsterMinLevel) {
      filters.push({ key: 'monsterMinLevel', label: `Min Lvl: ${monsterMinLevel}` });
    }
    if (monsterMaxLevel) {
      filters.push({ key: 'monsterMaxLevel', label: `Max Lvl: ${monsterMaxLevel}` });
    }
    if (monsterRace && monsterRace !== 'all') {
      filters.push({ key: 'monsterRace', label: MONSTER_RACES.find(r => r.value === monsterRace)?.label || monsterRace });
    }
    if (monsterSize && monsterSize !== 'all') {
      filters.push({ key: 'monsterSize', label: MONSTER_SIZES.find(s => s.value === monsterSize)?.label || monsterSize });
    }
    return filters;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Advanced Filters</span>
          </CardTitle>
          {hasFilters && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearFilters}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Item Filters */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-900 border-b pb-2">Item Filters</h4>
          
          <div>
            <Label htmlFor="itemCategory" className="text-sm font-medium text-slate-700">
              Item Type
            </Label>
            <Select 
              value={itemCategory} 
              onValueChange={(value) => {
                setItemCategory(value);
                updateFilters({ itemCategory: value });
              }}
            >
              <SelectTrigger id="itemCategory" className="w-full mt-1.5">
                <SelectValue placeholder="All Item Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Item Types</SelectItem>
                {ITEM_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="weaponType" className="text-sm font-medium text-slate-700">
              Weapon Type
            </Label>
            <Select 
              value={weaponType} 
              onValueChange={(value) => {
                setWeaponType(value);
                updateFilters({ weaponType: value });
              }}
            >
              <SelectTrigger id="weaponType" className="w-full mt-1.5">
                <SelectValue placeholder="All Weapon Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Weapon Types</SelectItem>
                {WEAPON_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Monster Filters */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-900 border-b pb-2">Monster Filters</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="minLevel" className="text-sm font-medium text-slate-700">
                Min Level
              </Label>
              <Input
                id="minLevel"
                type="number"
                min="1"
                max="200"
                placeholder="1"
                value={monsterMinLevel}
                onChange={(e) => {
                  setMonsterMinLevel(e.target.value);
                }}
                onBlur={(e) => {
                  updateFilters({ monsterMinLevel: e.target.value });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateFilters({ monsterMinLevel: monsterMinLevel });
                  }
                }}
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="maxLevel" className="text-sm font-medium text-slate-700">
                Max Level
              </Label>
              <Input
                id="maxLevel"
                type="number"
                min="1"
                max="200"
                placeholder="200"
                value={monsterMaxLevel}
                onChange={(e) => {
                  setMonsterMaxLevel(e.target.value);
                }}
                onBlur={(e) => {
                  updateFilters({ monsterMaxLevel: e.target.value });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateFilters({ monsterMaxLevel: monsterMaxLevel });
                  }
                }}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="monsterRace" className="text-sm font-medium text-slate-700">
              Race
            </Label>
            <Select 
              value={monsterRace} 
              onValueChange={(value) => {
                setMonsterRace(value);
                updateFilters({ monsterRace: value });
              }}
            >
              <SelectTrigger id="monsterRace" className="w-full mt-1.5">
                <SelectValue placeholder="All Races" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Races</SelectItem>
                {MONSTER_RACES.map((race) => (
                  <SelectItem key={race.value} value={race.value}>
                    {race.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="monsterSize" className="text-sm font-medium text-slate-700">
              Size
            </Label>
            <Select 
              value={monsterSize} 
              onValueChange={(value) => {
                setMonsterSize(value);
                updateFilters({ monsterSize: value });
              }}
            >
              <SelectTrigger id="monsterSize" className="w-full mt-1.5">
                <SelectValue placeholder="All Sizes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                {MONSTER_SIZES.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasFilters && (
          <div className="pt-2 border-t">
            <p className="text-sm text-slate-600 mb-2 font-medium">Active Filters:</p>
            <div className="flex flex-wrap gap-2">
              {getActiveFilters().map((filter) => (
                <Badge key={filter.key} variant="secondary" className="gap-1.5 py-1 px-2.5">
                  {filter.label}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors" 
                    onClick={() => {
                      const updates: Record<string, string> = {};
                      updates[filter.key] = 'all';
                      
                      // Update local state
                      if (filter.key === 'weaponType') setWeaponType('all');
                      if (filter.key === 'itemCategory') setItemCategory('all');
                      if (filter.key === 'monsterMinLevel') setMonsterMinLevel('');
                      if (filter.key === 'monsterMaxLevel') setMonsterMaxLevel('');
                      if (filter.key === 'monsterRace') setMonsterRace('all');
                      if (filter.key === 'monsterSize') setMonsterSize('all');
                      
                      updateFilters(updates);
                    }}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
