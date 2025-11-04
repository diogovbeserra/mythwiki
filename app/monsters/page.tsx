
import { Suspense } from 'react';
import { MonstersList } from '@/components/monsters-list';
import { MonsterFilters } from '@/components/monster-filters';
import { Sword, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PageProps {
  searchParams: {
    page?: string;
    search?: string;
    element?: string;
    race?: string;
    size?: string;
    minLevel?: string;
    maxLevel?: string;
    sort?: string;
  };
}

export default function MonstersPage({ searchParams }: PageProps) {
  const currentPage = parseInt(searchParams.page || '1');
  const searchQuery = searchParams.search || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Sword className="h-6 w-6 text-red-600" />
                <h1 className="text-xl font-semibold text-slate-900">Monsters Database</h1>
              </div>
            </div>
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
                <MonsterFilters searchParams={searchParams} />
              </Suspense>
            </div>
          </div>

          {/* Monsters List */}
          <div className="lg:col-span-3">
            <Suspense fallback={
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-32 bg-white rounded-lg shadow-sm border animate-pulse" />
                ))}
              </div>
            }>
              <MonstersList searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
