
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, MapPin, User, Coins, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface CraftDetailPageProps {
  params: { id: string };
}

async function getCraft(id: number) {
  try {
    const craft = await prisma.craft.findUnique({
      where: { id },
      include: {
        materials: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                ename: true,
                type: true,
                droppedBy: {
                  include: {
                    monster: {
                      select: { id: true, name: true, level: true }
                    }
                  },
                  take: 3,
                  orderBy: { rate: 'desc' }
                }
              }
            }
          }
        }
      }
    });

    return craft;
  } catch (error) {
    console.error('Error fetching craft:', error);
    return null;
  }
}

const CRAFT_TYPE_COLORS: Record<string, string> = {
  'Headgear': 'bg-purple-100 text-purple-800',
  'Reforge': 'bg-amber-100 text-amber-800',
  'Taming Item': 'bg-green-100 text-green-800',
  'Other': 'bg-slate-100 text-slate-800'
};

export default async function CraftDetailPage({ params }: CraftDetailPageProps) {
  const craftId = parseInt(params.id);
  
  if (isNaN(craftId)) {
    notFound();
  }

  const craft = await getCraft(craftId);

  if (!craft) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Back Button */}
      <Link href="/crafts">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Crafts
        </Button>
      </Link>

      {/* Craft Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <Sparkles className="h-8 w-8 text-purple-600" />
                <CardTitle className="text-3xl">{craft.name}</CardTitle>
              </div>
              
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                <Badge className={CRAFT_TYPE_COLORS[craft.type] || CRAFT_TYPE_COLORS['Other']}>
                  {craft.type}
                </Badge>
                {craft.position && (
                  <Badge variant="outline">
                    Position: {craft.position}
                  </Badge>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-slate-500">Craft ID</div>
              <div className="text-2xl font-bold text-slate-900">{craft.id}</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Cost */}
          {craft.cost && craft.cost > 0 && (
            <div className="flex items-center space-x-2 text-lg">
              <Coins className="h-5 w-5 text-amber-500" />
              <span className="font-semibold">{craft.cost.toLocaleString()}z</span>
            </div>
          )}

          {/* Location */}
          {craft.location && (
            <div className="flex items-start space-x-2">
              <MapPin className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">Location</div>
                <div className="text-slate-700">{craft.location}</div>
              </div>
            </div>
          )}

          {/* NPC */}
          {craft.npc && (
            <div className="flex items-start space-x-2">
              <User className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">NPC</div>
                <div className="text-slate-700">{craft.npc}</div>
              </div>
            </div>
          )}

          {/* Effects */}
          {craft.effects && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Effects</h3>
              <p className="text-blue-800 whitespace-pre-wrap">{craft.effects}</p>
            </div>
          )}

          {/* Notes */}
          {craft.notes && (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">Notes</h3>
              <p className="text-amber-800">{craft.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Materials Required */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📦</span>
            <span>Materials Required</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {craft.materials.map((mat, idx) => (
              <Card key={idx} className="bg-slate-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl font-bold text-purple-600">
                          {mat.quantity}x
                        </span>
                        {mat.item ? (
                          <Link href={`/items/${mat.item.id}`} className="hover:underline">
                            <h4 className="font-semibold text-slate-900">
                              {mat.item.ename || mat.item.name}
                            </h4>
                          </Link>
                        ) : (
                          <h4 className="font-semibold text-slate-900">{mat.itemName}</h4>
                        )}
                      </div>

                      {/* Show where to get this material */}
                      {mat.item?.droppedBy && mat.item?.droppedBy.length > 0 && (
                        <div className="text-sm text-slate-600 mt-2">
                          <span className="font-medium">Dropped by:</span>{' '}
                          {mat.item?.droppedBy.map((drop, idx) => (
                            <span key={idx}>
                              <Link
                                href={`/monsters/${drop.monster.id}`}
                                className="text-blue-600 hover:underline"
                              >
                                {drop.monster.name}
                              </Link>
                              {mat.item && idx < mat.item.droppedBy.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {mat.item && (
                      <Link href={`/items/${mat.item.id}`}>
                        <Button variant="outline" size="sm">
                          View Item
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
