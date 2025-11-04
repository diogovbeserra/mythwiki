
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Filter, Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const ELEMENTS = [
  { value: 'all', label: 'All Elements' },
  { value: 'Neutral', label: 'Neutral' },
  { value: 'Fire', label: 'Fire' },
  { value: 'Water', label: 'Water' },
  { value: 'Earth', label: 'Earth' },
  { value: 'Wind', label: 'Wind' },
  { value: 'Poison', label: 'Poison' },
  { value: 'Holy', label: 'Holy' },
  { value: 'Shadow', label: 'Shadow' },
  { value: 'Ghost', label: 'Ghost' },
  { value: 'Undead', label: 'Undead' }
];

const RACES = [
  { value: 'all', label: 'All Races' },
  { value: 'Human', label: 'Human' },
  { value: 'Demi-Human', label: 'Demi-Human' },
  { value: 'Beast', label: 'Beast' },
  { value: 'Insect', label: 'Insect' },
  { value: 'Fish', label: 'Fish' },
  { value: 'Demon', label: 'Demon' },
  { value: 'Undead', label: 'Undead' },
  { value: 'Angel', label: 'Angel' },
  { value: 'Dragon', label: 'Dragon' },
  { value: 'Plant', label: 'Plant' },
  { value: 'Brute', label: 'Brute' },
  { value: 'Formless', label: 'Formless' }
];

const SIZES = [
  { value: 'all', label: 'All Sizes' },
  { value: 'Small', label: 'Small' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Large', label: 'Large' }
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'level', label: 'Level (High to Low)' },
  { value: 'hp', label: 'HP (High to Low)' },
  { value: 'exp', label: 'EXP (High to Low)' }
];

interface MonsterFiltersProps {
  searchParams: {
    search?: string;
    element?: string;
    race?: string;
    size?: string;
    minLevel?: string;
    maxLevel?: string;
    sort?: string;
  };
}

export function MonsterFilters({ searchParams }: MonsterFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.search || '');
  const [element, setElement] = useState(searchParams.element || 'all');
  const [race, setRace] = useState(searchParams.race || 'all');
  const [size, setSize] = useState(searchParams.size || 'all');
  const [minLevel, setMinLevel] = useState(searchParams.minLevel || '');
  const [maxLevel, setMaxLevel] = useState(searchParams.maxLevel || '');
  const [sort, setSort] = useState(searchParams.sort || 'name');

  useEffect(() => {
    setSearch(searchParams.search || '');
    setElement(searchParams.element || 'all');
    setRace(searchParams.race || 'all');
    setSize(searchParams.size || 'all');
    setMinLevel(searchParams.minLevel || '');
    setMaxLevel(searchParams.maxLevel || '');
    setSort(searchParams.sort || 'name');
  }, [searchParams]);

  const updateFilters = (newFilters: Partial<{
    search: string;
    element: string;
    race: string;
    size: string;
    minLevel: string;
    maxLevel: string;
    sort: string;
  }>) => {
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
    
    router.push(`/monsters${query}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: search.trim() });
  };

  const handleClear = () => {
    setSearch('');
    setElement('all');
    setRace('all');
    setSize('all');
    setMinLevel('');
    setMaxLevel('');
    setSort('name');
    router.push('/monsters');
  };

  const hasFilters = 
    search || 
    element !== 'all' || 
    race !== 'all' || 
    size !== 'all' || 
    minLevel || 
    maxLevel || 
    sort !== 'name';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </div>
          {hasFilters && (
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
              placeholder="Search monsters..."
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

        {/* Level Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Level Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              id="minLevel"
              type="number"
              placeholder="Min"
              value={minLevel}
              onChange={(e) => setMinLevel(e.target.value)}
              onBlur={() => updateFilters({ minLevel })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateFilters({ minLevel });
                }
              }}
              min="1"
              max="200"
            />
            <Input
              id="maxLevel"
              type="number"
              placeholder="Max"
              value={maxLevel}
              onChange={(e) => setMaxLevel(e.target.value)}
              onBlur={() => updateFilters({ maxLevel })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateFilters({ maxLevel });
                }
              }}
              min="1"
              max="200"
            />
          </div>
        </div>

        {/* Element Filter */}
        <div className="space-y-2">
          <Label htmlFor="element" className="text-sm font-medium text-slate-700">Element</Label>
          <Select value={element} onValueChange={(value) => {
            setElement(value);
            updateFilters({ element: value });
          }}>
            <SelectTrigger id="element">
              <SelectValue placeholder="Select element" />
            </SelectTrigger>
            <SelectContent>
              {ELEMENTS.map((el) => (
                <SelectItem key={el.value} value={el.value}>
                  {el.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Race Filter */}
        <div className="space-y-2">
          <Label htmlFor="race" className="text-sm font-medium text-slate-700">Race</Label>
          <Select value={race} onValueChange={(value) => {
            setRace(value);
            updateFilters({ race: value });
          }}>
            <SelectTrigger id="race">
              <SelectValue placeholder="Select race" />
            </SelectTrigger>
            <SelectContent>
              {RACES.map((raceOption) => (
                <SelectItem key={raceOption.value} value={raceOption.value}>
                  {raceOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Size Filter */}
        <div className="space-y-2">
          <Label htmlFor="size" className="text-sm font-medium text-slate-700">Size</Label>
          <Select value={size} onValueChange={(value) => {
            setSize(value);
            updateFilters({ size: value });
          }}>
            <SelectTrigger id="size">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {SIZES.map((sizeOption) => (
                <SelectItem key={sizeOption.value} value={sizeOption.value}>
                  {sizeOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
