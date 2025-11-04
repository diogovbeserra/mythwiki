
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

interface RelatedItemsProps {
  itemId: number;
  itemType?: number;
}

async function getRelatedItems(itemId: number, itemType?: number) {
  try {
    // Get items of the same type
    const items = await prisma.item.findMany({
      where: {
        AND: [
          { id: { not: itemId } }, // Exclude current item
          { type: itemType },
          { flagAvailable: 1 }
        ]
      },
      select: {
        id: true,
        name: true,
        ename: true,
        type: true,
        valueSell: true
      },
      orderBy: { valueSell: 'desc' },
      take: 5
    });

    return items;
  } catch (error) {
    console.error('Error fetching related items:', error);
    return [];
  }
}

const ITEM_TYPES = {
  0: 'Consumable',
  2: 'Usable',
  3: 'Misc', 
  4: 'Weapon',
  5: 'Armor',
  6: 'Card',
  7: 'Pet Equipment',
  8: 'Pet Accessory',
  10: 'Arrow',
  11: 'Delayed Use',
  18: 'Cash',
  20: 'Collection'
};

export async function RelatedItems({ itemId, itemType }: RelatedItemsProps) {
  const relatedItems = await getRelatedItems(itemId, itemType);

  if (relatedItems.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span>Related Items</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {relatedItems.map((item) => (
            <Link 
              key={item.id} 
              href={`/items/${item.id}`}
              className="block p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-900 truncate">
                    {item.ename || item.name}
                  </h4>
                  {item.ename && item.name !== item.ename && (
                    <p className="text-sm text-slate-500 truncate">{item.name}</p>
                  )}
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {ITEM_TYPES[item.type as keyof typeof ITEM_TYPES] || 'Unknown'}
                    </Badge>
                    {item.valueSell && item.valueSell > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {item.valueSell.toLocaleString()}z
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
