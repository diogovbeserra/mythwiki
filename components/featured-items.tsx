
import { Sparkles, ShoppingCart, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { prisma } from '@/lib/db';

async function getFeaturedItems() {
  try {
    // Get items with high sell value, available flag, and omnibook visibility
    const items = await prisma.item.findMany({
      where: {
        AND: [
          { omnibook: 1 },
          { flagAvailable: 1 },
          { valueSell: { gt: 0 } }
        ]
      },
      include: {
        description: true,
        droppedBy: {
          include: {
            monster: {
              select: { name: true, level: true }
            }
          },
          take: 3
        }
      },
      orderBy: [
        { valueSell: 'desc' },
        { id: 'asc' }
      ],
      take: 6
    });

    return items;
  } catch (error) {
    console.error('Error fetching featured items:', error);
    return [];
  }
}

function getItemTypeIcon(type?: number | null) {
  switch (type) {
    case 4: // Weapon
    case 5: // Weapon
      return <Sparkles className="h-4 w-4 text-amber-500" />;
    case 5: // Armor
      return <Shield className="h-4 w-4 text-blue-500" />;
    default:
      return <ShoppingCart className="h-4 w-4 text-slate-500" />;
  }
}

function getItemTypeName(type?: number | null) {
  const types: Record<number, string> = {
    0: 'Consumable',
    2: 'Usable',
    3: 'Misc',
    4: 'Weapon',
    5: 'Armor',
    6: 'Card',
    7: 'Pet Equipment',
    8: 'Pet Accessory',
    10: 'Arrow',
    11: 'Usable with delayed consumption',
    18: 'Cash',
    20: 'Collection'
  };
  return types[type ?? 0] || 'Unknown';
}

export async function FeaturedItems() {
  const items = await getFeaturedItems();

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Sparkles className="h-12 w-12 mx-auto mb-4 text-slate-300" />
        <p>No featured items available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <Link href={`/items/${item.id}`} className="block">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    {getItemTypeIcon(item.type)}
                    <h4 className="font-semibold text-slate-900 truncate">
                      {item.ename || item.name}
                    </h4>
                    {item.ename && item.name !== item.ename && (
                      <span className="text-sm text-slate-500 truncate">
                        ({item.name})
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {getItemTypeName(item.type)}
                    </Badge>
                    {item.valueSell && item.valueSell > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Sell: {item.valueSell.toLocaleString()}z
                      </Badge>
                    )}
                    {item.weight && item.weight > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Weight: {item.weight}
                      </Badge>
                    )}
                  </div>

                  {item.droppedBy && item.droppedBy.length > 0 && (
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">Dropped by:</span>{' '}
                      {item.droppedBy
                        .slice(0, 2)
                        .map((drop) => drop.monster?.name)
                        .filter(Boolean)
                        .join(', ')}
                      {item.droppedBy.length > 2 && ' +more'}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <span className="text-xs text-slate-500">ID: {item.id}</span>
                  {item.description && (
                    <Badge variant="default" className="text-xs">
                      Detailed Info
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
