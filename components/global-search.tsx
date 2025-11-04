
'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Sparkles, Sword } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchResult {
  id: number;
  name: string;
  ename?: string;
  type: 'item' | 'monster';
  level?: number;
  itemType?: number;
  subtype?: number;
  description?: string;
  atk?: number;
  def?: number;
  weaponLevel?: number;
}

// Weapon type names
const WEAPON_SUBTYPES: Record<number, string> = {
  1: 'Dagger',
  2: 'One-Handed Sword',
  3: 'Two-Handed Sword',
  4: 'One-Handed Spear',
  5: 'Two-Handed Spear',
  6: 'One-Handed Axe',
  7: 'Two-Handed Axe',
  8: 'Mace',
  9: 'Two-Handed Mace',
  10: 'Staff',
  11: 'Bow',
  12: 'Knuckle',
  13: 'Instrument',
  14: 'Whip',
  15: 'Book',
  16: 'Katar',
  17: 'Revolver',
  18: 'Rifle',
  19: 'Gatling Gun',
  20: 'Shotgun',
  21: 'Grenade Launcher',
  22: 'Fuuma Shuriken'
};

function getWeaponTypeName(subtype?: number): string | null {
  return subtype ? WEAPON_SUBTYPES[subtype] || null : null;
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const searchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=8`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    searchData();
  }, [debouncedQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex">
          <Input
            type="text"
            placeholder="Search items, monsters..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pr-20 h-12 text-lg border-2 border-slate-300 focus:border-blue-500 transition-colors"
            onFocus={() => {
              if (results.length > 0) setShowResults(true);
            }}
          />
          <Button 
            type="submit" 
            className="absolute right-1 top-1 h-10 px-4"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (results.length > 0 || isLoading) && (
        <Card className="absolute top-full mt-2 w-full z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {results.map((result) => {
                  const weaponType = result.type === 'item' ? getWeaponTypeName(result.subtype) : null;
                  
                  return (
                    <Link
                      key={`${result.type}-${result.id}`}
                      href={`/${result.type === 'item' ? 'items' : 'monsters'}/${result.id}`}
                      className="block p-4 hover:bg-slate-50 transition-colors group"
                      onClick={() => setShowResults(false)}
                    >
                      <div className="flex items-start space-x-3">
                        {result.type === 'item' ? (
                          <Sparkles className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                        ) : (
                          <Sword className="h-5 w-5 text-red-500 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {result.ename || result.name}
                            </span>
                            {result.ename && result.name !== result.ename && (
                              <span className="text-sm text-slate-500">
                                ({result.name})
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center flex-wrap gap-2 text-xs mb-2">
                            <span className="px-2 py-1 bg-slate-100 rounded font-medium text-slate-700">
                              {result.type === 'item' ? 'Item' : 'Monster'}
                            </span>
                            {weaponType && (
                              <span className="px-2 py-1 bg-blue-100 rounded text-blue-700 font-medium">
                                {weaponType}
                              </span>
                            )}
                            {result.atk && result.atk > 0 && (
                              <span className="px-2 py-1 bg-red-100 rounded text-red-700">
                                ATK: {result.atk}
                              </span>
                            )}
                            {result.def && result.def > 0 && (
                              <span className="px-2 py-1 bg-blue-100 rounded text-blue-700">
                                DEF: {result.def}
                              </span>
                            )}
                            {result.weaponLevel && (
                              <span className="px-2 py-1 bg-orange-100 rounded text-orange-700">
                                Lv.{result.weaponLevel}
                              </span>
                            )}
                            {result.level && (
                              <span className="px-2 py-1 bg-purple-100 rounded text-purple-700">
                                Level {result.level}
                              </span>
                            )}
                            <span className="px-2 py-1 bg-slate-200 rounded text-slate-600">
                              #{result.id}
                            </span>
                          </div>
                          
                          {result.description && (
                            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                              {result.description.replace(/\^[0-9A-Fa-f]{6}/g, '').replace(/<[^>]+>/g, '')}...
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
