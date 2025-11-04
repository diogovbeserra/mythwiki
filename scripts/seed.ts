
import { PrismaClient } from '@prisma/client';
import { parseDataFiles } from '../lib/parsers/yaml-parser';
import { parseLuaItemFile } from '../lib/parsers/lua-parser';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Parse all data files
    console.log('📖 Parsing data files...');
    const [{ monsters, items }, luaItemDescriptions] = await Promise.all([
      parseDataFiles(),
      parseLuaItemFile()
    ]);

    // Filter only items and monsters with omnibook: 1
    const filteredItems = items.filter(item => item.omnibook === 1);
    const filteredMonsters = monsters.filter(monster => monster.Omnibook === 1);

    console.log(`Found ${monsters.length} total monsters, ${filteredMonsters.length} with omnibook: 1`);
    console.log(`Found ${items.length} total items, ${filteredItems.length} with omnibook: 1`);
    console.log(`Found ${Object.keys(luaItemDescriptions).length} Lua item descriptions`);

    // Clear existing data (in correct order to handle foreign keys)
    console.log('🧹 Clearing existing data...');
    await prisma.monsterDrop.deleteMany();
    await prisma.mvpDrop.deleteMany();
    await prisma.monsterSpawn.deleteMany();
    await prisma.monsterSkill.deleteMany();
    await prisma.monsterSummon.deleteMany();
    await prisma.itemDescription.deleteMany();
    await prisma.monster.deleteMany();
    await prisma.item.deleteMany();

    // Insert items first
    console.log('📦 Inserting items...');
    let itemCount = 0;
    const batchSize = 1000; // Process items in batches
    
    for (let i = 0; i < filteredItems.length; i += batchSize) {
      const batch = filteredItems.slice(i, i + batchSize);
      
      const itemsToInsert = batch.map((item) => ({
        id: item.nameid,
        name: item.name || 'Unknown Item',
        ename: item.ename,
        weight: item.weight,
        type: item.type,
        subtype: item.subtype,
        atk: item.atk,
        def: item.def,
        matk: item.matk,
        slots: item.slots,
        weaponLevel: item.weapon_level,
        armorLevel: item.armor_level,
        equipLocation: item.equip,
        elv: item.elv,
        elvmax: item.elvmax,
        valueBuy: item.value_buy,
        valueSell: item.value_sell,
        flagAvailable: item.flag_available,
        flagAutoequip: item.flag_autoequip,
        flagBindOnEquip: item.flag_bindOnEquip,
        flagBroadcast: item.flag_broadcast,
        flagBuyingstore: item.flag_buyingstore,
        flagDeadBranch: item.flag_dead_branch,
        flagDelayConsume: item.flag_delay_consume,
        flagDropEffect: item.flag_dropEffect,
        flagGroup: item.flag_group,
        flagNoEquip: item.flag_no_equip,
        flagNoRefine: item.flag_no_refine,
        restrictionAuction: item.restriction_auction,
        restrictionCart: item.restriction_cart,
        restrictionDrop: item.restriction_drop,
        restrictionGuildStorage: item.restriction_guild_storage,
        restrictionMail: item.restriction_mail,
        restrictionSell: item.restriction_sell,
        restrictionStorage: item.restriction_storage,
        restrictionTrade: item.restriction_trade,
        restrictionTradePartner: item.restriction_trade_partner,
        classBase1: item.class_base1 && item.class_base1 <= Number.MAX_SAFE_INTEGER ? BigInt(item.class_base1) : null,
        classBase2: item.class_base2 && item.class_base2 <= Number.MAX_SAFE_INTEGER ? BigInt(item.class_base2) : null,
        classBase3: item.class_base3 && item.class_base3 <= Number.MAX_SAFE_INTEGER ? BigInt(item.class_base3) : null,
        delayDuration: item.delay_duration,
        delaySc: item.delay_sc,
        look: item.look,
        maxchance: item.maxchance,
        viewId: item.view_id,
        omnibook: item.omnibook,
      }));

      await prisma.item.createMany({
        data: itemsToInsert,
        skipDuplicates: true,
      });

      itemCount += batch.length;
      if (itemCount % 5000 === 0) {
        console.log(`  ✓ Processed ${itemCount} items...`);
      }
    }

    console.log(`✅ Inserted ${itemCount} items`);

    // Insert monsters
    console.log('👹 Inserting monsters...');
    let monsterCount = 0;
    
    for (let i = 0; i < filteredMonsters.length; i += batchSize) {
      const batch = filteredMonsters.slice(i, i + batchSize);
      
      const monstersToInsert = batch.map((monster) => ({
        id: monster.Id,
        name: monster.Name,
        jName: monster.jName,
        sprite: monster.Sprite,
        level: monster.Level,
        hp: monster.Hp,
        baseExp: monster.BaseExp,
        jobExp: monster.JobExp,
        baseVipExp: monster.BaseVipExp,
        jobVipExp: monster.JobVipExp,
        hit: monster.Hit,
        flee: monster.Free,
        def: monster.Def,
        mDef: monster.MDef,
        str: monster.Str,
        agi: monster.Agi,
        vit: monster.Vit,
        int: monster.Int,
        dex: monster.Dex,
        luk: monster.Luk,
        atk1: monster.Atk1,
        atk2: monster.Atk2,
        mAtkMin: monster.MAtkMin,
        mAtkMax: monster.MAtkMax,
        sMAtk: monster.sMAtk,
        speed: monster.Speed,
        range1: monster.Range1,
        range2: monster.Range2,
        range3: monster.Range3,
        atkDelay: monster.AtkDelay,
        aspRate: monster.AspRate,
        aspRate2: monster.AspRate2,
        ai: monster.Ai && monster.Ai <= Number.MAX_SAFE_INTEGER ? BigInt(monster.Ai) : null,
        race: monster.Race,
        size: monster.Size,
        element: monster.Element,
        elementLevel: monster.ElementLevel,
        res: monster.Res,
        mRes: monster.MRes,
        omnibook: monster.Omnibook,
        monsterType: monster.MonsterType,
        expMvp: monster.ExpMvp,
      }));

      await prisma.monster.createMany({
        data: monstersToInsert,
        skipDuplicates: true,
      });

      monsterCount += batch.length;
      if (monsterCount % 1000 === 0) {
        console.log(`  ✓ Processed ${monsterCount} monsters...`);
      }
    }

    console.log(`✅ Inserted ${monsterCount} monsters`);

    // Insert drops relationships
    console.log('💎 Inserting monster drops...');
    let dropCount = 0;
    
    for (const monster of filteredMonsters) {
      if (!monster.Drops || monster.Drops.length === 0) continue;
      
      const validDrops = monster.Drops.filter(drop => 
        drop.Item && 
        typeof drop.Item === 'number' && 
        drop.Rate !== undefined
      );

      if (validDrops.length === 0) continue;

      const dropsToInsert = validDrops.map(drop => ({
        monsterId: monster.Id,
        itemId: drop.Item,
        rate: drop.Rate,
        slots: drop.Slots,
        equipLoc: drop.Equip,
        type: drop.Type,
      }));

      try {
        await prisma.monsterDrop.createMany({
          data: dropsToInsert,
          skipDuplicates: true,
        });
        dropCount += dropsToInsert.length;
      } catch (error) {
        console.warn(`Warning: Could not insert drops for monster ${monster.Id}: ${error}`);
      }

      if (dropCount % 5000 === 0) {
        console.log(`  ✓ Processed ${dropCount} drops...`);
      }
    }

    console.log(`✅ Inserted ${dropCount} monster drops`);

    // Insert monster spawns
    console.log('🗺️ Inserting monster spawns...');
    let spawnCount = 0;
    
    for (const monster of filteredMonsters) {
      if (!monster.Spawns || monster.Spawns.length === 0) continue;
      
      // Filter out invalid spawns (where MapId is not a number)
      const validSpawns = monster.Spawns.filter(spawn => 
        typeof spawn.MapId === 'number' && !isNaN(spawn.MapId)
      );
      
      if (validSpawns.length === 0) continue;
      
      const spawnsToInsert = validSpawns.map(spawn => ({
        monsterId: monster.Id,
        mapId: spawn.MapId,
        mapName: spawn.MapName,
        qty: spawn.Qty,
      }));

      await prisma.monsterSpawn.createMany({
        data: spawnsToInsert,
        skipDuplicates: true,
      });

      spawnCount += spawnsToInsert.length;
    }

    console.log(`✅ Inserted ${spawnCount} monster spawns`);

    // Insert monster skills
    console.log('⚔️ Inserting monster skills...');
    let skillCount = 0;
    
    for (const monster of filteredMonsters) {
      if (!monster.Skills || monster.Skills.length === 0) continue;
      
      // Filter out invalid skills (where skill_name is just a placeholder)
      const validSkills = monster.Skills.filter(skill => 
        skill.Skill_name && 
        skill.Skill_name !== 'no skill this mob' &&
        skill.Skill_id &&
        typeof skill.Skill_id === 'number'
      );
      
      if (validSkills.length === 0) continue;
      
      const skillsToInsert = validSkills.map(skill => ({
        monsterId: monster.Id,
        skillId: skill.Skill_id,
        skillName: skill.Skill_name,
        skillLvl: skill.Skill_lvl,
      }));

      await prisma.monsterSkill.createMany({
        data: skillsToInsert,
        skipDuplicates: true,
      });

      skillCount += skillsToInsert.length;
    }

    console.log(`✅ Inserted ${skillCount} monster skills`);

    // Insert item descriptions from Lua file
    console.log('📜 Inserting item descriptions...');
    let descriptionCount = 0;
    
    const luaEntries = Object.entries(luaItemDescriptions);
    for (let i = 0; i < luaEntries.length; i += batchSize) {
      const batch = luaEntries.slice(i, i + batchSize);
      
      const descriptionsToInsert = batch
        .filter(([itemId]) => {
          // Only insert descriptions for items that exist in our database
          return filteredItems.some(item => item.nameid === parseInt(itemId));
        })
        .map(([itemId, desc]) => ({
          itemId: parseInt(itemId),
          unidentifiedDisplayName: desc.unidentifiedDisplayName,
          unidentifiedResourceName: desc.unidentifiedResourceName,
          unidentifiedDescription: desc.unidentifiedDescriptionName || [],
          identifiedDisplayName: desc.identifiedDisplayName,
          identifiedResourceName: desc.identifiedResourceName,
          identifiedDescription: desc.identifiedDescriptionName || [],
          slotCount: desc.slotCount,
          classNum: desc.ClassNum,
          costume: desc.costume,
        }));

      if (descriptionsToInsert.length > 0) {
        await prisma.itemDescription.createMany({
          data: descriptionsToInsert,
          skipDuplicates: true,
        });
        descriptionCount += descriptionsToInsert.length;
      }

      if (descriptionCount % 1000 === 0 && descriptionCount > 0) {
        console.log(`  ✓ Processed ${descriptionCount} descriptions...`);
      }
    }

    console.log(`✅ Inserted ${descriptionCount} item descriptions`);

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Final counts:`);
    console.log(`  - Items: ${itemCount}`);
    console.log(`  - Monsters: ${monsterCount}`);
    console.log(`  - Drops: ${dropCount}`);
    console.log(`  - Spawns: ${spawnCount}`);
    console.log(`  - Skills: ${skillCount}`);
    console.log(`  - Descriptions: ${descriptionCount}`);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .catch((e) => {
    console.error('❌ Seed script failed:', e);
    process.exit(1);
  });
