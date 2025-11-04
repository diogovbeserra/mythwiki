
import { notFound } from 'next/navigation';
import { ItemDetail } from '@/components/item-detail';
import { RelatedItems } from '@/components/related-items';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Suspense } from 'react';
import { ShareButton } from '@/components/share-button';

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: string;
  };
}

async function getItem(id: number) {
  try {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        description: true,
        droppedBy: {
          include: {
            monster: {
              select: {
                id: true,
                name: true,
                jName: true,
                level: true,
                race: true,
                element: true,
                spawns: {
                  select: { mapName: true },
                  take: 3
                }
              }
            }
          },
          orderBy: { rate: 'desc' },
          take: 20
        },
        usedInCrafts: {
          include: {
            craft: {
              select: {
                id: true,
                name: true,
                type: true,
                location: true,
                npc: true
              }
            }
          }
        },
        usedInClassServices: {
          include: {
            classService: {
              select: {
                id: true,
                name: true,
                jobClass: true
              }
            }
          }
        }
      }
    });

    return item;
  } catch (error) {
    console.error('Error fetching item:', error);
    return null;
  }
}

export async function generateStaticParams() {
  // Generate static paths for the most popular items
  try {
    const items = await prisma.item.findMany({
      where: {
        AND: [
          { flagAvailable: 1 },
          { omnibook: 1 }
        ]
      },
      select: { id: true },
      take: 100,
      orderBy: { valueSell: 'desc' }
    });

    return items.map(item => ({
      id: item.id.toString()
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps) {
  const id = parseInt(params.id);
  if (isNaN(id)) return { title: 'Item Not Found' };

  const item = await getItem(id);
  if (!item) return { title: 'Item Not Found' };

  const title = `${item.ename || item.name} - Myth Wiki`;
  const description = item.description?.identifiedDescription?.join(' ') || 
                     `Item details for ${item.ename || item.name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
  };
}

export default async function ItemDetailPage({ params }: PageProps) {
  const id = parseInt(params.id);
  
  if (isNaN(id)) {
    notFound();
  }

  const item = await getItem(id);

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/items">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Items
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    {item.ename || item.name}
                  </h1>
                  {item.ename && item.name !== item.ename && (
                    <p className="text-sm text-slate-600">{item.name}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href={`/compare?item1=${item.id}`}>
                <Button variant="outline">Compare Item</Button>
              </Link>
              <ShareButton title={`${item.ename || item.name} - Myth Wiki`} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Item Details */}
          <div className="lg:col-span-2">
            <ItemDetail item={item} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Suspense fallback={
              <div className="h-64 bg-white rounded-lg shadow-sm border animate-pulse" />
            }>
              <RelatedItems itemId={item.id} itemType={item.type ?? undefined} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
