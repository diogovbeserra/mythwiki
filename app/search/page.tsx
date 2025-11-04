
import { Suspense } from 'react';
import { SearchResults } from '@/components/search-results';
import { AdvancedFilters } from '@/components/advanced-filters';
import { Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PageProps {
  searchParams: {
    q?: string;
    type?: string;
    minLevel?: string;
    maxLevel?: string;
    element?: string;
    race?: string;
    itemType?: string;
  };
}

export default function SearchPage({ searchParams }: PageProps) {
  const query = searchParams.q || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Search className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-slate-900">Search Results</h1>
            </div>
            {query && (
              <div className="text-sm text-slate-600">
                for "{query}"
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Suspense fallback={
                <div className="h-64 bg-white rounded-lg shadow-sm border animate-pulse" />
              }>
                <AdvancedFilters searchParams={searchParams} />
              </Suspense>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <Suspense fallback={
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-24 bg-white rounded-lg shadow-sm border animate-pulse" />
                ))}
              </div>
            }>
              <SearchResults searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
