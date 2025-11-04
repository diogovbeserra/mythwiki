
import { TrendingUp, Package, Users, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/db';

async function getStats() {
  try {
    const [itemCount, monsterCount, dropCount] = await Promise.all([
      prisma.item.count(),
      prisma.monster.count(),
      prisma.monsterDrop.count()
    ]);

    return {
      items: itemCount,
      monsters: monsterCount,
      drops: dropCount,
      descriptions: await prisma.itemDescription.count()
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { items: 0, monsters: 0, drops: 0, descriptions: 0 };
  }
}

export async function StatsOverview() {
  const stats = await getStats();

  const statCards = [
    {
      title: 'Total Items',
      value: stats.items.toLocaleString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Monsters',
      value: stats.monsters.toLocaleString(),
      icon: Users,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Drop Relations',
      value: stats.drops.toLocaleString(),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Descriptions',
      value: stats.descriptions.toLocaleString(),
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      {statCards.map((stat) => (
        <Card key={stat.title} className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
