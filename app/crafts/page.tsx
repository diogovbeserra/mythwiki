
import { Suspense } from 'react';
import { CraftsList } from '@/components/crafts-list';
import { CraftFilters } from '@/components/craft-filters';
import { Sparkles } from 'lucide-react';

interface SearchParams {
  page?: string;
  search?: string;
  type?: string;
  sort?: string;
}

export default function CraftsPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Sparkles className="h-8 w-8 text-purple-600" />
          <h1 className="text-4xl font-bold text-slate-900">Crafts Database</h1>
        </div>
        <p className="text-slate-600">
          Browse all craftable items, headgears, reforges, and more
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <CraftFilters searchParams={searchParams} />
        </aside>

        {/* Crafts List */}
        <main className="lg:col-span-3">
          <Suspense fallback={<div className="text-center py-12">Loading crafts...</div>}>
            <CraftsList searchParams={searchParams} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
