
import { notFound } from 'next/navigation';
import { MonsterDetail } from '@/components/monster-detail';
import { RelatedMonsters } from '@/components/related-monsters';
import { ArrowLeft, Sword } from 'lucide-react';
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

async function getMonster(id: number) {
  try {
    const monster = await prisma.monster.findUnique({
      where: { id },
      include: {
        drops: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                ename: true,
                type: true,
                valueSell: true
              }
            }
          },
          orderBy: { rate: 'desc' },
          take: 50
        },
        spawns: {
          orderBy: { qty: 'desc' }
        },
        skills: {
          orderBy: { skillLvl: 'desc' }
        }
      }
    });

    return monster;
  } catch (error) {
    console.error('Error fetching monster:', error);
    return null;
  }
}

export async function generateStaticParams() {
  // Generate static paths for the most popular monsters
  try {
    const monsters = await prisma.monster.findMany({
      where: {
        omnibook: 1
      },
      select: { id: true },
      take: 100,
      orderBy: { level: 'desc' }
    });

    return monsters.map(monster => ({
      id: monster.id.toString()
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps) {
  const id = parseInt(params.id);
  if (isNaN(id)) return { title: 'Monster Not Found' };

  const monster = await getMonster(id);
  if (!monster) return { title: 'Monster Not Found' };

  const title = `${monster.name} - Myth Wiki`;
  const description = `Level ${monster.level} ${monster.race} monster. ${monster.element} element. ${monster.hp} HP.`;

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

export default async function MonsterDetailPage({ params }: PageProps) {
  const id = parseInt(params.id);
  
  if (isNaN(id)) {
    notFound();
  }

  const monster = await getMonster(id);

  if (!monster) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/monsters">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Monsters
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Sword className="h-6 w-6 text-red-600" />
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    {monster.name}
                  </h1>
                  {monster.jName && monster.jName !== monster.name && (
                    <p className="text-sm text-slate-600">{monster.jName}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ShareButton title={`${monster.name} - Myth Wiki`} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Monster Details */}
          <div className="lg:col-span-2">
            <MonsterDetail monster={monster} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Suspense fallback={
              <div className="h-64 bg-white rounded-lg shadow-sm border animate-pulse" />
            }>
              <RelatedMonsters monsterId={monster.id} race={monster.race ?? undefined} element={monster.element ?? undefined} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
