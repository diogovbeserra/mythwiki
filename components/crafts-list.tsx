
import { prisma } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, MapPin, User, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SearchParams {
  page?: string;
  search?: string;
  type?: string;
  sort?: string;
}

interface CraftsListProps {
  searchParams: SearchParams;
}

const CRAFTS_PER_PAGE = 20;

const CRAFT_TYPE_COLORS: Record<string, string> = {
  'Headgear': 'bg-purple-100 text-purple-800',
  'Reforge': 'bg-amber-100 text-amber-800',
  'Taming Item': 'bg-green-100 text-green-800',
  'Other': 'bg-slate-100 text-slate-800'
};

async function getCrafts({ page = 1, search = '', type = '', sort = 'name' }: {
  page: number;
  search: string;
  type: string;
  sort: string;
}) {
  try {
    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    let orderBy: any = { name: 'asc' };
    switch (sort) {
      case 'type':
        orderBy = { type: 'asc' };
        break;
      case 'cost':
        orderBy = { cost: 'desc' };
        break;
      default:
        orderBy = { name: 'asc' };
    }

    const [crafts, total] = await Promise.all([
      prisma.craft.findMany({
        where,
        include: {
          materials: {
            include: {
              item: {
                select: { id: true, name: true, ename: true }
              }
            }
          }
        },
        orderBy,
        skip: (page - 1) * CRAFTS_PER_PAGE,
        take: CRAFTS_PER_PAGE
      }),
      prisma.craft.count({ where })
    ]);

    return { crafts, total, totalPages: Math.ceil(total / CRAFTS_PER_PAGE) };
  } catch (error) {
    console.error('Error fetching crafts:', error);
    return { crafts: [], total: 0, totalPages: 0 };
  }
}

export async function CraftsList({ searchParams }: CraftsListProps) {
  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const search = searchParams.search || '';
  const type = searchParams.type || '';
  const sort = searchParams.sort || 'name';

  const { crafts, total, totalPages } = await getCrafts({ page, search, type, sort });

  if (crafts.length === 0) {
    return (
      <div className="text-center py-12">
        <Sparkles className="h-16 w-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No crafts found</h3>
        <p className="text-slate-600">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing {((page - 1) * CRAFTS_PER_PAGE) + 1} - {Math.min(page * CRAFTS_PER_PAGE, total)} of {total.toLocaleString()} crafts
        </p>
        <div className="text-sm text-slate-500">
          Page {page} of {totalPages}
        </div>
      </div>

      {/* Crafts Grid */}
      <div className="space-y-4">
        {crafts.map((craft) => (
          <Card key={craft.id} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <Link href={`/crafts/${craft.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <h3 className="font-semibold text-slate-900">
                        {craft.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3 flex-wrap gap-1">
                      <Badge className={CRAFT_TYPE_COLORS[craft.type] || CRAFT_TYPE_COLORS['Other']}>
                        {craft.type}
                      </Badge>
                      {craft.position && (
                        <Badge variant="outline" className="text-xs">
                          {craft.position}
                        </Badge>
                      )}
                      {craft.cost && craft.cost > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {craft.cost.toLocaleString()}z
                        </Badge>
                      )}
                    </div>

                    {/* Materials */}
                    {craft.materials && craft.materials.length > 0 && (
                      <div className="mb-3 p-3 bg-slate-50 rounded-md border border-slate-200">
                        <p className="text-xs font-medium text-slate-700 mb-2">Materials Required:</p>
                        <div className="flex flex-wrap gap-2">
                          {craft.materials.map((mat, idx) => (
                            <span key={idx} className="text-xs text-slate-600 bg-white px-2 py-1 rounded border">
                              {mat.quantity}x {mat.item?.ename || mat.item?.name || mat.itemName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    {craft.location && (
                      <div className="flex items-center space-x-1 text-sm text-slate-600 mb-2">
                        <MapPin className="h-3 w-3" />
                        <span>{craft.location}</span>
                      </div>
                    )}

                    {/* NPC */}
                    {craft.npc && (
                      <div className="flex items-center space-x-1 text-sm text-slate-600">
                        <User className="h-3 w-3" />
                        <span>{craft.npc}</span>
                      </div>
                    )}

                    {/* Effects */}
                    {craft.effects && (
                      <div className="mt-2 text-sm text-slate-700">
                        {craft.effects.slice(0, 200)}
                        {craft.effects.length > 200 && '...'}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 ml-4 flex-shrink-0">
                    ID: {craft.id}
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <Link href={`/crafts?${new URLSearchParams({ ...searchParams, page: String(page - 1) }).toString()}`}>
            <Button variant="outline" size="sm" disabled={page <= 1}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          </Link>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + Math.max(1, page - 2);
              if (pageNum > totalPages) return null;
              
              return (
                <Link key={pageNum} href={`/crafts?${new URLSearchParams({ ...searchParams, page: String(pageNum) }).toString()}`}>
                  <Button
                    variant={pageNum === page ? "default" : "outline"}
                    size="sm"
                    className="w-10 h-10"
                  >
                    {pageNum}
                  </Button>
                </Link>
              );
            }).filter(Boolean)}
          </div>

          <Link href={`/crafts?${new URLSearchParams({ ...searchParams, page: String(page + 1) }).toString()}`}>
            <Button variant="outline" size="sm" disabled={page >= totalPages}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
