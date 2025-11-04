import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Parse materials string from Excel format
function parseMaterials(materialsStr: string): Array<{ name: string; quantity: number }> {
  if (!materialsStr) return [];
  
  const materials: Array<{ name: string; quantity: number }> = [];
  const lines = materialsStr.split('\n').map(line => line.trim()).filter(Boolean);
  
  for (const line of lines) {
    // Skip lines that are just "z" (zeny cost)
    if (line === 'z' || line.endsWith('z') && /^\d+z$/.test(line)) {
      continue;
    }
    
    // Match patterns like "1 Item Name", "100x Item Name", "5 x Item Name"
    const match = line.match(/^(\d+)\s*x?\s*(.+)$/i);
    if (match) {
      const quantity = parseInt(match[1]);
      const name = match[2].trim();
      if (name && quantity > 0) {
        materials.push({ name, quantity });
      }
    }
  }
  
  return materials;
}

// Extract zeny cost from materials string
function extractZenyCost(materialsStr: string): number | null {
  if (!materialsStr) return null;
  
  const lines = materialsStr.split('\n').map(line => line.trim()).filter(Boolean);
  for (const line of lines) {
    const match = line.match(/^(\d+)z$/);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  return null;
}

// Find item by name (fuzzy matching)
async function findItemByName(name: string) {
  // Try exact match first
  let item = await prisma.item.findFirst({
    where: {
      OR: [
        { ename: { equals: name, mode: 'insensitive' } },
        { name: { equals: name, mode: 'insensitive' } }
      ]
    }
  });
  
  if (item) return item;
  
  // Try contains match
  item = await prisma.item.findFirst({
    where: {
      OR: [
        { ename: { contains: name, mode: 'insensitive' } },
        { name: { contains: name, mode: 'insensitive' } }
      ]
    }
  });
  
  return item;
}

async function seedHeadgears(workbook: XLSX.WorkBook) {
  const sheet = workbook.Sheets['Headgear'];
  const data = XLSX.utils.sheet_to_json(sheet) as any[];
  
  console.log(`\n📦 Seeding ${data.length} Headgear crafts...`);
  
  let created = 0;
  
  for (const row of data) {
    const materials = parseMaterials(row.Materials || '');
    const zenyCost = extractZenyCost(row.Materials || '');
    
    const craft = await prisma.craft.create({
      data: {
        name: row.Name,
        type: 'Headgear',
        location: row.Location || null,
        position: row.Position || null,
        effects: row.Effects || null,
        cost: zenyCost
      }
    });
    
    // Create materials
    for (const mat of materials) {
      const item = await findItemByName(mat.name);
      
      await prisma.craftMaterial.create({
        data: {
          craftId: craft.id,
          itemId: item?.id || null,
          itemName: mat.name,
          quantity: mat.quantity
        }
      });
    }
    
    created++;
  }
  
  console.log(`✅ Created ${created} Headgear crafts`);
}

async function seedClassServices(workbook: XLSX.WorkBook) {
  const sheet = workbook.Sheets['Class Service'];
  const data = XLSX.utils.sheet_to_json(sheet) as any[];
  
  console.log(`\n📦 Seeding ${data.length} Class Services...`);
  
  let created = 0;
  
  for (const row of data) {
    const materials = parseMaterials(row.Materials || '');
    
    const service = await prisma.classService.create({
      data: {
        name: row.Name,
        jobClass: row['Job Class'] || 'Unknown',
        effect: row.Effect || null,
        notes: row['Missing: Fletcher'] || null
      }
    });
    
    // Create materials
    for (const mat of materials) {
      const item = await findItemByName(mat.name);
      
      await prisma.classServiceMaterial.create({
        data: {
          classServiceId: service.id,
          itemId: item?.id || null,
          itemName: mat.name,
          quantity: mat.quantity
        }
      });
    }
    
    created++;
  }
  
  console.log(`✅ Created ${created} Class Services`);
}

async function seedReforges(workbook: XLSX.WorkBook) {
  const sheet = workbook.Sheets['Reforge'];
  const data = XLSX.utils.sheet_to_json(sheet) as any[];
  
  console.log(`\n📦 Seeding ${data.length} Reforge crafts...`);
  
  let created = 0;
  
  for (const row of data) {
    const materials = parseMaterials(row.Materials || '');
    
    const craft = await prisma.craft.create({
      data: {
        name: row.Name,
        type: 'Reforge',
        effects: row.Effect || null,
        notes: row.Notes || null
      }
    });
    
    // Create materials
    for (const mat of materials) {
      const item = await findItemByName(mat.name);
      
      await prisma.craftMaterial.create({
        data: {
          craftId: craft.id,
          itemId: item?.id || null,
          itemName: mat.name,
          quantity: mat.quantity
        }
      });
    }
    
    created++;
  }
  
  console.log(`✅ Created ${created} Reforge crafts`);
}

async function seedOther(workbook: XLSX.WorkBook) {
  const sheet = workbook.Sheets['Other'];
  const data = XLSX.utils.sheet_to_json(sheet) as any[];
  
  console.log(`\n📦 Seeding ${data.length} Other crafts...`);
  
  let created = 0;
  
  for (const row of data) {
    // Skip rows without name
    if (!row.Name || row.Name.trim() === '') continue;
    
    const materials = parseMaterials(row.Materials || '');
    
    const craft = await prisma.craft.create({
      data: {
        name: row.Name,
        type: row.Type || 'Other',
        npc: row.NPC || null,
        effects: row.Effects || null
      }
    });
    
    // Create materials
    for (const mat of materials) {
      const item = await findItemByName(mat.name);
      
      await prisma.craftMaterial.create({
        data: {
          craftId: craft.id,
          itemId: item?.id || null,
          itemName: mat.name,
          quantity: mat.quantity
        }
      });
    }
    
    created++;
  }
  
  console.log(`✅ Created ${created} Other crafts`);
}

async function seedStarClusters(workbook: XLSX.WorkBook) {
  const sheet = workbook.Sheets['Star Cluster'];
  const data = XLSX.utils.sheet_to_json(sheet) as any[];
  
  console.log(`\n📦 Seeding ${data.length} Star Cluster data...`);
  
  let created = 0;
  
  for (const row of data) {
    // Skip header/calculation rows
    if (!row.Material || row.Material === 'Material') continue;
    
    const item = await findItemByName(row.Material);
    
    await prisma.starCluster.create({
      data: {
        materialId: item?.id || null,
        materialName: row.Material,
        starClusters: row['Star Clusters'] ? parseFloat(row['Star Clusters']) : null,
        extractionCost: row['Extraction Cost'] ? parseInt(row['Extraction Cost']) : null,
        npcBuyPrice: row['NPC Buy'] ? parseInt(row['NPC Buy']) : null,
        zenyPerCluster: row['Zeny per Star Cluster'] && 
                       typeof row['Zeny per Star Cluster'] === 'number' 
                       ? row['Zeny per Star Cluster'] 
                       : null
      }
    });
    
    created++;
  }
  
  console.log(`✅ Created ${created} Star Cluster entries`);
}

async function main() {
  console.log('🚀 Starting craft data import...\n');
  
  // Read Excel file
  const excelPath = path.join(__dirname, '../../data/MoY Mats.xlsx');
  
  if (!fs.existsSync(excelPath)) {
    console.error('❌ Excel file not found:', excelPath);
    process.exit(1);
  }
  
  const workbook = XLSX.readFile(excelPath);
  
  // Clear existing data
  console.log('🗑️  Clearing existing craft data...');
  await prisma.starCluster.deleteMany({});
  await prisma.classServiceMaterial.deleteMany({});
  await prisma.classService.deleteMany({});
  await prisma.craftMaterial.deleteMany({});
  await prisma.craft.deleteMany({});
  console.log('✅ Cleared existing data\n');
  
  // Seed each section
  await seedHeadgears(workbook);
  await seedClassServices(workbook);
  await seedReforges(workbook);
  await seedOther(workbook);
  await seedStarClusters(workbook);
  
  console.log('\n✨ Craft data import completed!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
