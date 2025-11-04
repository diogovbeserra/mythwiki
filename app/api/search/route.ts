
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface SearchResult {
  id: number;
  name: string;
  ename?: string;
  type: 'item' | 'monster';
  level?: number;
  itemType?: number;
  subtype?: number;
  description?: string;
  atk?: number;
  def?: number;
  weaponLevel?: number;
  race?: string;
  element?: string;
  size?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const weaponType = searchParams.get('weaponType');
    const itemCategory = searchParams.get('itemCategory'); // armor, weapon, accessory, etc.
    const monsterMinLevel = searchParams.get('monsterMinLevel');
    const monsterMaxLevel = searchParams.get('monsterMaxLevel');
    const monsterRace = searchParams.get('monsterRace');
    const monsterSize = searchParams.get('monsterSize');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const searchQuery = query.toLowerCase();

    // Build item search conditions
    const itemSearchConditions: any = {
      AND: [
        { flagAvailable: 1 }
      ]
    };

    // Add weapon type filter if specified
    if (weaponType && weaponType !== 'all') {
      const weaponTypeMap: Record<string, number> = {
        'dagger': 1,
        'one-handed sword': 2,
        'two-handed sword': 3,
        'one-handed spear': 4,
        'two-handed spear': 5,
        'one-handed axe': 6,
        'two-handed axe': 7,
        'mace': 8,
        'two-handed mace': 9,
        'staff': 10,
        'bow': 11,
        'knuckle': 12,
        'instrument': 13,
        'whip': 14,
        'book': 15,
        'katar': 16,
        'revolver': 17,
        'rifle': 18,
        'gatling gun': 19,
        'shotgun': 20,
        'grenade launcher': 21,
        'fuuma shuriken': 22
      };
      
      const subtypeValue = weaponTypeMap[weaponType.toLowerCase()];
      if (subtypeValue) {
        itemSearchConditions.AND.push({ subtype: subtypeValue });
      }
    }

    // Add item category filter (type 4 = weapon, 5 = armor, etc.)
    if (itemCategory && itemCategory !== 'all') {
      const categoryTypeMap: Record<string, number[]> = {
        'weapon': [4, 5],  // type 4 and 5 are weapons
        'armor': [16], // armor
        'shield': [32], // shield
        'garment': [4096], // garment/robe
        'shoes': [64], // shoes/footgear
        'accessory': [136], // accessory
        'headgear': [256, 512, 1024], // headgear (top, mid, low)
        'card': [6, 2048], // cards
        'consumable': [11, 2, 18], // usable items, healing items, etc.
      };
      
      const types = categoryTypeMap[itemCategory.toLowerCase()];
      if (types) {
        itemSearchConditions.AND.push({ 
          type: { in: types } 
        });
      }
    }

    // First, search in item names
    const itemsByName = await prisma.item.findMany({
      where: {
        ...itemSearchConditions,
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { ename: { contains: searchQuery, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        ename: true,
        type: true,
        subtype: true,
        atk: true,
        def: true,
        matk: true,
        weaponLevel: true,
        elv: true,
        description: {
          select: {
            identifiedDescription: true
          }
        }
      },
      take: limit,
      orderBy: [
        { omnibook: 'desc' },
        { name: 'asc' }
      ]
    });

    const itemMap = new Map<number, any>();
    itemsByName.forEach(item => {
      itemMap.set(item.id, {
        ...item,
        description: item.description?.identifiedDescription
      });
    });

    // Always search in descriptions for additional matches
    const allItemsWithDesc = await prisma.item.findMany({
      where: {
        ...itemSearchConditions,
        description: {
          isNot: null
        }
      },
      select: {
        id: true,
        name: true,
        ename: true,
        type: true,
        subtype: true,
        atk: true,
        def: true,
        matk: true,
        weaponLevel: true,
        elv: true,
        description: {
          select: {
            identifiedDescription: true
          }
        }
      }
    });

    // Filter items whose description contains the search query
    allItemsWithDesc.forEach(item => {
      if (!itemMap.has(item.id) && item.description?.identifiedDescription) {
        const descText = item.description.identifiedDescription.join(' ').toLowerCase();
        if (descText.includes(searchQuery)) {
          itemMap.set(item.id, {
            ...item,
            description: item.description.identifiedDescription
          });
        }
      }
    });

    // Build monster search conditions
    const monsterSearchConditions: any = {
      AND: []
    };

    // Add level filters
    if (monsterMinLevel) {
      const minLvl = parseInt(monsterMinLevel);
      if (!isNaN(minLvl)) {
        monsterSearchConditions.AND.push({ level: { gte: minLvl } });
      }
    }
    if (monsterMaxLevel) {
      const maxLvl = parseInt(monsterMaxLevel);
      if (!isNaN(maxLvl)) {
        monsterSearchConditions.AND.push({ level: { lte: maxLvl } });
      }
    }

    // Add race filter
    if (monsterRace && monsterRace !== 'all') {
      monsterSearchConditions.AND.push({ race: monsterRace });
    }

    // Add size filter
    if (monsterSize && monsterSize !== 'all') {
      monsterSearchConditions.AND.push({ size: monsterSize });
    }

    // Search monsters
    const monsters = await prisma.monster.findMany({
      where: {
        AND: [
          ...monsterSearchConditions.AND,
          {
            OR: [
              { name: { contains: searchQuery, mode: 'insensitive' } },
              { jName: { contains: searchQuery, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        jName: true,
        level: true,
        race: true,
        element: true,
        size: true
      },
      take: Math.ceil(limit / 2),
      orderBy: [
        { omnibook: 'desc' },
        { level: 'desc' }
      ]
    });

    // Transform results
    const results: SearchResult[] = [
      ...Array.from(itemMap.values()).slice(0, limit).map((item): SearchResult => ({
        id: item.id,
        name: item.name,
        ename: item.ename ?? undefined,
        type: 'item' as const,
        itemType: item.type ?? undefined,
        subtype: item.subtype ?? undefined,
        description: item.description ? item.description.slice(0, 3).join(' ').substring(0, 200) : undefined,
        atk: item.atk ?? undefined,
        def: item.def ?? undefined,
        weaponLevel: item.weaponLevel ?? undefined
      })),
      ...monsters.map((monster): SearchResult => ({
        id: monster.id,
        name: monster.name,
        ename: monster.jName ?? undefined,
        type: 'monster' as const,
        level: monster.level,
        race: monster.race ?? undefined,
        element: monster.element ?? undefined,
        size: monster.size ?? undefined
      }))
    ];

    // Sort by relevance (exact matches first, then partial)
    results.sort((a, b) => {
      const aExact = (a.name.toLowerCase() === searchQuery || a.ename?.toLowerCase() === searchQuery) ? 1 : 0;
      const bExact = (b.name.toLowerCase() === searchQuery || b.ename?.toLowerCase() === searchQuery) ? 1 : 0;
      
      if (aExact !== bExact) return bExact - aExact;
      
      // Then by name length (shorter = more relevant)
      const aLen = (a.ename || a.name).length;
      const bLen = (b.ename || b.name).length;
      return aLen - bLen;
    });

    return NextResponse.json({ results: results.slice(0, limit) });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed', results: [] },
      { status: 500 }
    );
  }
}
