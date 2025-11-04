
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Sword, Package, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';

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

interface SearchResultsProps {
  searchParams: {
    q?: string;
    type?: string;
    minLevel?: string;
    maxLevel?: string;
    element?: string;
    race?: string;
    itemType?: string;
    weaponType?: string;
  };
}

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

export function SearchResults({ searchParams }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const query = searchParams.q || '';

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('q', query);
        params.set('limit', '50');
        
        if (searchParams.weaponType) {
          params.set('weaponType', searchParams.weaponType);
        }

        const response = await fetch(`/api/search?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, searchParams.weaponType]);

  if (!query) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Enter a search query</h3>
        <p className="text-slate-600">Start typing to search for items and monsters</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-12 w-12 mx-auto text-blue-500 animate-spin mb-4" />
        <p className="text-slate-600">Searching...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Search Results</h2>
          <p className="text-sm text-slate-600">No results found for "{query}"</p>
        </div>
        
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No results found</h3>
          <p className="text-slate-600">Try adjusting your search terms or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Search Results</h2>
        <p className="text-sm text-slate-600">
          Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
        </p>
      </div>
      
      <div className="space-y-3">
        {results.map((result) => {
          const weaponType = result.type === 'item' ? getWeaponTypeName(result.subtype) : null;
          
          return (
            <Link 
              key={`${result.type}-${result.id}`}
              href={`/${result.type === 'item' ? 'items' : 'monsters'}/${result.id}`}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-start space-x-4">
                    {result.type === 'item' ? (
                      <div className="bg-blue-100 rounded-lg p-3 flex-shrink-0">
                        <Sparkles className="h-6 w-6 text-blue-600" />
                      </div>
                    ) : (
                      <div className="bg-red-100 rounded-lg p-3 flex-shrink-0">
                        <Sword className="h-6 w-6 text-red-600" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {result.ename || result.name}
                        </h3>
                        {result.ename && result.name !== result.ename && (
                          <span className="text-sm text-slate-500">
                            ({result.name})
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        <Badge variant="secondary" className="font-medium">
                          {result.type === 'item' ? 'Item' : 'Monster'}
                        </Badge>
                        {weaponType && (
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            {weaponType}
                          </Badge>
                        )}
                        {result.atk && result.atk > 0 && (
                          <Badge variant="outline" className="text-red-600 border-red-200">
                            ATK: {result.atk}
                          </Badge>
                        )}
                        {result.def && result.def > 0 && (
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            DEF: {result.def}
                          </Badge>
                        )}
                        {result.weaponLevel && (
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            Weapon Lv.{result.weaponLevel}
                          </Badge>
                        )}
                        {result.level && (
                          <Badge variant="outline" className="text-purple-600 border-purple-200">
                            Monster Lv.{result.level}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-slate-500">
                          #{result.id}
                        </Badge>
                      </div>
                      
                      {result.description && (
                        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                          {result.description.replace(/\^[0-9A-Fa-f]{6}/g, '').replace(/<[^>]+>/g, '')}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
