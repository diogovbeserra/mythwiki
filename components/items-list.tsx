
import { prisma } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Package, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SearchParams {
  page?: string;
  search?: string;
  type?: string;
  subtype?: string;
  sort?: string;
}

interface ItemsListProps {
  searchParams: SearchParams;
}

const ITEMS_PER_PAGE = 20;

const ITEM_TYPES = {
  '0': 'Consumable',
  '2': 'Usable', 
  '3': 'Misc',
  '4': 'Weapon',
  '5': 'Armor',
  '6': 'Card',
  '7': 'Pet Equipment',
  '8': 'Pet Accessory',
  '10': 'Arrow',
  '11': 'Delayed Use',
  '18': 'Cash',
  '20': 'Collection'
};

const WEAPON_SUBTYPE_NAMES: Record<number, string> = {
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

// Helper function to strip color codes from description
function stripColorCodes(text: string): string {
  return text
    .replace(/\^[0-9A-Fa-f]{6}/g, '') // Remove color codes like ^009900
    .replace(/\^5b719F/g, '') // Remove specific color code
    .replace(/\^CED6E6/g, '') // Remove specific color code
    .replace(/\^[a-zA-Z0-9]{6}/g, '') // Remove any other color codes
    .replace(/<TP>/g, '')
    .replace(/<\/TP>/g, '')
    .replace(/<ITEMVIEW>.*?<\/ITEMVIEW>/g, '')
    .replace(/<INFO>.*?<\/INFO>/g, '')
    .replace(/_{2,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function getItems({ page = 1, search = '', type = '', subtype = '', sort = 'name' }: {
  page: number;
  search: string;
  type: string;
  subtype: string;
  sort: string;
}) {
  try {
    const where: any = {
      flagAvailable: 1
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { ename: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (type && type !== 'all') {
      where.type = parseInt(type);
    }

    // Handle subtype filtering
    if (subtype && subtype !== 'all') {
      if (!isNaN(parseInt(subtype))) {
        // Weapon subtype (numeric)
        where.subtype = parseInt(subtype);
      } else {
        // Armor subtype (string-based, needs custom logic)
        const armorLocationMap: Record<string, number> = {
          'armor': 16,
          'shield': 32,
          'garment': 4,
          'shoes': 64,
          'accessory': 136,
          'headgear-top': 256,
          'headgear-mid': 512,
          'headgear-low': 1024
        };
        
        const location = armorLocationMap[subtype];
        if (location) {
          where.location = location;
        }
      }
    }

    let orderBy: any = { name: 'asc' };
    switch (sort) {
      case 'level':
        orderBy = { elv: 'desc' };
        break;
      case 'price':
        orderBy = { valueSell: 'desc' };
        break;
      case 'id':
        orderBy = { id: 'asc' };
        break;
      default:
        orderBy = { name: 'asc' };
    }

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        include: {
          droppedBy: {
            include: {
              monster: {
                select: { name: true, level: true, id: true }
              }
            },
            take: 3,
            orderBy: { rate: 'desc' }
          },
          description: {
            select: {
              identifiedDescription: true
            }
          }
        },
        orderBy,
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE
      }),
      prisma.item.count({ where })
    ]);

    return { items, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE) };
  } catch (error) {
    console.error('Error fetching items:', error);
    return { items: [], total: 0, totalPages: 0 };
  }
}

export async function ItemsList({ searchParams }: ItemsListProps) {
  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const search = searchParams.search || '';
  const type = searchParams.type || '';
  const subtype = searchParams.subtype || '';
  const sort = searchParams.sort || 'name';

  const { items, total, totalPages } = await getItems({ page, search, type, subtype, sort });

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No items found</h3>
        <p className="text-slate-600">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing {((page - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(page * ITEMS_PER_PAGE, total)} of {total.toLocaleString()} items
        </p>
        <div className="text-sm text-slate-500">
          Page {page} of {totalPages}
        </div>
      </div>

      {/* Items Grid */}
      <div className="space-y-4">
        {items.map((item) => {
          // Get full description text
          const descriptionLines = item.description?.identifiedDescription || [];
          const fullText = descriptionLines
            .map(stripColorCodes)
            .join(' ')
            .trim();

          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                <Link href={`/items/${item.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <Sparkles className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <h3 className="font-semibold text-slate-900 truncate">
                          {item.ename || item.name}
                        </h3>
                        {item.ename && item.name !== item.ename && (
                          <span className="text-sm text-slate-500 truncate">({item.name})</span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-3 flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {ITEM_TYPES[String(item.type) as keyof typeof ITEM_TYPES] || 'Unknown'}
                        </Badge>
                        {item.type === 4 && item.subtype && WEAPON_SUBTYPE_NAMES[item.subtype] && (
                          <Badge variant="outline" className="text-xs">
                            {WEAPON_SUBTYPE_NAMES[item.subtype]}
                          </Badge>
                        )}
                        {item.atk && item.atk > 0 && (
                          <Badge variant="outline" className="text-xs text-red-600">
                            ATK: {item.atk}
                          </Badge>
                        )}
                        {item.def && item.def > 0 && (
                          <Badge variant="outline" className="text-xs text-blue-600">
                            DEF: {item.def}
                          </Badge>
                        )}
                        {item.valueSell && item.valueSell > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {item.valueSell.toLocaleString()}z
                          </Badge>
                        )}
                        {item.elv && item.elv > 0 && (
                          <Badge variant="outline" className="text-xs">
                            Lv.{item.elv}+
                          </Badge>
                        )}
                        {item.slots && item.slots > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {item.slots} slot{item.slots > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>

                      {/* Description Preview */}
                      {fullText && (
                        <div className="mb-3 p-3 bg-slate-50 rounded-md border border-slate-200">
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">
                            {fullText}
                          </p>
                        </div>
                      )}

                      {/* Dropped By */}
                      {item.droppedBy && item.droppedBy.length > 0 && (
                        <div className="text-sm text-slate-600">
                          <span className="font-medium">Dropped by:</span>{' '}
                          {item.droppedBy.map((drop, idx) => (
                            <span key={idx}>
                              {drop.monster?.name}
                              {idx < item.droppedBy.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 ml-4 flex-shrink-0">
                      ID: {item.id}
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <Link href={`/items?${new URLSearchParams({ ...searchParams, page: String(page - 1) }).toString()}`}>
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
                <Link key={pageNum} href={`/items?${new URLSearchParams({ ...searchParams, page: String(pageNum) }).toString()}`}>
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

          <Link href={`/items?${new URLSearchParams({ ...searchParams, page: String(page + 1) }).toString()}`}>
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
