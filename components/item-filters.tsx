
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Filter, Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const ITEM_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: '0', label: 'Consumable' },
  { value: '2', label: 'Usable' },
  { value: '3', label: 'Misc' },
  { value: '4', label: 'Weapon' },
  { value: '5', label: 'Armor' },
  { value: '6', label: 'Card' },
  { value: '7', label: 'Pet Equipment' },
  { value: '8', label: 'Pet Accessory' },
  { value: '10', label: 'Arrow' },
  { value: '18', label: 'Cash' },
  { value: '20', label: 'Collection' }
];

const WEAPON_SUBTYPES = [
  { value: 'all', label: 'All Weapons' },
  { value: '1', label: 'Dagger' },
  { value: '2', label: 'One-Handed Sword' },
  { value: '3', label: 'Two-Handed Sword' },
  { value: '4', label: 'One-Handed Spear' },
  { value: '5', label: 'Two-Handed Spear' },
  { value: '6', label: 'One-Handed Axe' },
  { value: '7', label: 'Two-Handed Axe' },
  { value: '8', label: 'Mace' },
  { value: '9', label: 'Two-Handed Mace' },
  { value: '10', label: 'Staff' },
  { value: '11', label: 'Bow' },
  { value: '12', label: 'Knuckle' },
  { value: '13', label: 'Instrument' },
  { value: '14', label: 'Whip' },
  { value: '15', label: 'Book' },
  { value: '16', label: 'Katar' },
  { value: '17', label: 'Revolver' },
  { value: '18', label: 'Rifle' },
  { value: '19', label: 'Gatling Gun' },
  { value: '20', label: 'Shotgun' },
  { value: '21', label: 'Grenade Launcher' },
  { value: '22', label: 'Fuuma Shuriken' }
];

const ARMOR_SUBTYPES = [
  { value: 'all', label: 'All Armor' },
  { value: 'armor', label: 'Body Armor' },
  { value: 'shield', label: 'Shield' },
  { value: 'garment', label: 'Garment' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'headgear-top', label: 'Headgear (Top)' },
  { value: 'headgear-mid', label: 'Headgear (Mid)' },
  { value: 'headgear-low', label: 'Headgear (Low)' }
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'id', label: 'ID' },
  { value: 'level', label: 'Level Requirement' },
  { value: 'price', label: 'Sell Price' }
];

interface ItemFiltersProps {
  searchParams: {
    search?: string;
    type?: string;
    subtype?: string;
    sort?: string;
  };
}

export function ItemFilters({ searchParams }: ItemFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.search || '');
  const [type, setType] = useState(searchParams.type || 'all');
  const [subtype, setSubtype] = useState(searchParams.subtype || 'all');
  const [sort, setSort] = useState(searchParams.sort || 'name');

  useEffect(() => {
    setSearch(searchParams.search || '');
    setType(searchParams.type || 'all');
    setSubtype(searchParams.subtype || 'all');
    setSort(searchParams.sort || 'name');
  }, [searchParams]);

  const updateFilters = (newFilters: Partial<{ search: string; type: string; subtype: string; sort: string }>) => {
    const current = new URLSearchParams(Array.from(params.entries()));
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });

    // Reset to page 1 when filters change
    current.delete('page');

    const search = current.toString();
    const query = search ? `?${search}` : '';
    
    router.push(`/items${query}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: search.trim() });
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    setSubtype('all'); // Reset subtype when type changes
    updateFilters({ type: newType, subtype: 'all' });
  };

  const handleClear = () => {
    setSearch('');
    setType('all');
    setSubtype('all');
    setSort('name');
    router.push('/items');
  };

  const showWeaponSubtype = type === '4';
  const showArmorSubtype = type === '5';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </div>
          {(search || type !== 'all' || subtype !== 'all' || sort !== 'name') && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleClear}
              className="text-slate-500 hover:text-slate-700 -mr-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium text-slate-700">Search</Label>
          <div className="relative">
            <Input
              id="search"
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
            <Button 
              type="submit" 
              size="sm" 
              className="absolute right-1 top-1 h-8 w-8 p-0"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="type" className="text-sm font-medium text-slate-700">Item Type</Label>
          <Select value={type} onValueChange={handleTypeChange}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {ITEM_TYPES.map((itemType) => (
                <SelectItem key={itemType.value} value={itemType.value}>
                  {itemType.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Weapon Subtype Filter */}
        {showWeaponSubtype && (
          <div className="space-y-2 pl-3 border-l-2 border-blue-200">
            <Label htmlFor="weaponSubtype" className="text-sm font-medium text-slate-700">Weapon Type</Label>
            <Select value={subtype} onValueChange={(value) => {
              setSubtype(value);
              updateFilters({ subtype: value });
            }}>
              <SelectTrigger id="weaponSubtype">
                <SelectValue placeholder="Select weapon type" />
              </SelectTrigger>
              <SelectContent>
                {WEAPON_SUBTYPES.map((weaponType) => (
                  <SelectItem key={weaponType.value} value={weaponType.value}>
                    {weaponType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Armor Subtype Filter */}
        {showArmorSubtype && (
          <div className="space-y-2 pl-3 border-l-2 border-blue-200">
            <Label htmlFor="armorSubtype" className="text-sm font-medium text-slate-700">Armor Type</Label>
            <Select value={subtype} onValueChange={(value) => {
              setSubtype(value);
              updateFilters({ subtype: value });
            }}>
              <SelectTrigger id="armorSubtype">
                <SelectValue placeholder="Select armor type" />
              </SelectTrigger>
              <SelectContent>
                {ARMOR_SUBTYPES.map((armorType) => (
                  <SelectItem key={armorType.value} value={armorType.value}>
                    {armorType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Sort */}
        <div className="space-y-2">
          <Label htmlFor="sort" className="text-sm font-medium text-slate-700">Sort By</Label>
          <Select value={sort} onValueChange={(value) => {
            setSort(value);
            updateFilters({ sort: value });
          }}>
            <SelectTrigger id="sort">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        <Button 
          variant="outline" 
          onClick={handleClear}
          className="w-full"
        >
          Clear All Filters
        </Button>
      </CardContent>
    </Card>
  );
}
