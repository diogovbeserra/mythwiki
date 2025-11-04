
import yaml from 'js-yaml';
import fs from 'fs/promises';
import path from 'path';

export interface MonsterData {
  Id: number;
  Name: string;
  jName?: string;
  Sprite?: string;
  Level: number;
  Hp: number;
  BaseExp: number;
  JobExp: number;
  BaseVipExp?: number;
  JobVipExp?: number;
  Hit?: number;
  Free?: number;
  Def?: number;
  MDef?: number;
  Str?: number;
  Agi?: number;
  Vit?: number;
  Int?: number;
  Dex?: number;
  Luk?: number;
  Atk1?: number;
  Atk2?: number;
  MAtkMin?: number;
  MAtkMax?: number;
  sMAtk?: number;
  Speed?: number;
  Range1?: number;
  Range2?: number;
  Range3?: number;
  AtkDelay?: number;
  AspRate?: number;
  AspRate2?: number;
  Ai?: number;
  Race?: string;
  Size?: string;
  Element?: string;
  ElementLevel?: number;
  Res?: number;
  MRes?: number;
  Omnibook?: number;
  MonsterType?: string;
  ExpMvp?: number;
  Drops?: Array<{
    Item: number;
    Name: string;
    eName?: string;
    Slots?: number;
    Equip?: number;
    Type?: number;
    Rate: number;
  }>;
  Skills?: Array<{
    Skill_id?: number;
    Skill_name?: string;
    Skill_lvl?: number;
  }>;
  Spawns?: Array<{
    MapId?: number;
    MapName?: string;
    Qty?: number;
  }>;
  Summons?: Array<{
    Mob_id?: number;
  }>;
  MvpDrops?: Array<{
    Item?: number | string;
  }>;
}

export interface ItemData {
  nameid: number;
  name: string;
  ename?: string;
  weight?: number;
  type?: number;
  subtype?: number;
  atk?: number;
  def?: number;
  matk?: number;
  slots?: number;
  weapon_level?: number;
  armor_level?: number;
  equip?: number;
  elv?: number;
  elvmax?: number;
  value_buy?: number;
  value_sell?: number;
  flag_available?: number;
  flag_autoequip?: number;
  flag_bindOnEquip?: number;
  flag_broadcast?: number;
  flag_buyingstore?: number;
  flag_dead_branch?: number;
  flag_delay_consume?: number;
  flag_dropEffect?: number;
  flag_group?: number;
  flag_no_equip?: number;
  flag_no_refine?: number;
  restriction_auction?: number;
  restriction_cart?: number;
  restriction_drop?: number;
  restriction_guild_storage?: number;
  restriction_mail?: number;
  restriction_sell?: number;
  restriction_storage?: number;
  restriction_trade?: number;
  restriction_trade_partner?: number;
  class_base1?: number;
  class_base2?: number;
  class_base3?: number;
  delay_duration?: number;
  delay_sc?: number;
  look?: number;
  maxchance?: number;
  view_id?: number;
  omnibook?: number;
  mobs?: Array<{
    Id?: number | string;
  }>;
}

export async function parseMonsterYaml(filePath: string): Promise<MonsterData[]> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = yaml.load(fileContent) as { MobInfo: MonsterData[] };
    return data?.MobInfo || [];
  } catch (error) {
    console.error('Error parsing monster YAML:', error);
    throw new Error(`Failed to parse monster YAML: ${error}`);
  }
}

export async function parseItemYaml(filePath: string): Promise<ItemData[]> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = yaml.load(fileContent) as { ItemInfo: ItemData[] };
    return data?.ItemInfo || [];
  } catch (error) {
    console.error('Error parsing item YAML:', error);
    throw new Error(`Failed to parse item YAML: ${error}`);
  }
}

export async function parseDataFiles() {
  const dataDir = path.join(process.cwd(), 'data');
  
  const [monsters, items] = await Promise.all([
    parseMonsterYaml(path.join(dataDir, 'DB_MobInfo.yml')),
    parseItemYaml(path.join(dataDir, 'DB_ItemInfo.yml'))
  ]);

  return { monsters, items };
}
