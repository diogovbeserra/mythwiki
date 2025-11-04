
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CraftFiltersProps {
  searchParams: {
    search?: string;
    type?: string;
    sort?: string;
  };
}

export function CraftFilters({ searchParams }: CraftFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.search || '');

  useEffect(() => {
    setSearchQuery(searchParams.search || '');
  }, [searchParams.search]);

  const updateFilters = (key: string, value: string) => {
    const newParams = new URLSearchParams(params.toString());
    
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    
    // Reset to page 1 when filters change
    newParams.delete('page');
    
    router.push(`/crafts?${newParams.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters('search', searchQuery);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    router.push('/crafts');
  };

  const hasActiveFilters = searchParams.search || searchParams.type || searchParams.sort !== 'name';

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
            <span>🔍</span>
            <span>Filters</span>
          </h2>
        </div>

        {/* Search */}
        <div>
          <Label htmlFor="search" className="text-sm font-medium text-slate-700 mb-2">
            Search
          </Label>
          <form onSubmit={handleSearch} className="flex space-x-2">
            <Input
              id="search"
              type="text"
              placeholder="Search crafts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Craft Type */}
        <div>
          <Label htmlFor="type" className="text-sm font-medium text-slate-700 mb-2">
            Craft Type
          </Label>
          <Select
            value={searchParams.type || 'all'}
            onValueChange={(value) => updateFilters('type', value)}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Headgear">Headgear</SelectItem>
              <SelectItem value="Reforge">Reforge</SelectItem>
              <SelectItem value="Taming Item">Taming Item</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div>
          <Label htmlFor="sort" className="text-sm font-medium text-slate-700 mb-2">
            Sort By
          </Label>
          <Select
            value={searchParams.sort || 'name'}
            onValueChange={(value) => updateFilters('sort', value)}
          >
            <SelectTrigger id="sort">
              <SelectValue placeholder="Name (A-Z)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="type">Type</SelectItem>
              <SelectItem value="cost">Cost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            className="w-full"
            onClick={clearAllFilters}
          >
            <X className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
