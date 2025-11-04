
// Boss data for MVP Timer

export interface Boss {
  id: number;
  name: string;
  mapLocation: string;
  isMVP: boolean;
  isMini: boolean;
  respawnTime: number; // in minutes
}

const miniBosses: Array<{ name: string; mapLocation: string }> = [
  { name: 'Zealotus', mapLocation: 'gl_prison1' },
  { name: 'Vodyanoy', mapLocation: 'mosk_dun02' },
  { name: 'Vocal', mapLocation: 'prt_fild07' },
  { name: 'Vagabond Wolf', mapLocation: 'moc_fild03' },
  { name: 'Toad', mapLocation: 'gef_fild01' },
  { name: 'Tattler Sisters', mapLocation: 'orcsdun02' },
  { name: 'Taffy', mapLocation: 'mjolnir_01' },
  { name: 'Silver Thief Bug', mapLocation: 'prt_sewb3' },
  { name: 'Necromancer', mapLocation: 'abbey02' },
  { name: 'Morajin', mapLocation: 'iz_dun04' },
  { name: 'Mime Monkey', mapLocation: 'ayo_fild02' },
  { name: 'Mayus', mapLocation: 'anthell02' },
  { name: 'Mastering', mapLocation: 'pay_fild04' },
  { name: 'Lockstep', mapLocation: 'juperos_02' },
  { name: 'Kublin', mapLocation: 'mjo_dun03' },
  { name: 'Kobold Leader', mapLocation: 'ra_fild05' },
  { name: 'Ju-On', mapLocation: 'pay_dun03' },
  { name: 'Iskralisa', mapLocation: 'mag_dun02' },
  { name: 'Hydrolancer', mapLocation: 'abyss_02' },
  { name: 'Gryphon', mapLocation: 'ra_fild02' },
  { name: 'Goblin Leader', mapLocation: 'gef_fild11' },
  { name: 'Ghostring', mapLocation: 'gl_in01' },
  { name: 'Femmire', mapLocation: 'swamp_01' },
  { name: 'Enraged Priest', mapLocation: 'ra_san04' },
  { name: 'Eclipse', mapLocation: 'prt_fild01' },
  { name: 'Dragon Fly', mapLocation: 'moc_fild13' },
  { name: 'Deviling', mapLocation: 'gef_dun01' },
  { name: 'Chimera', mapLocation: 'gl_cas02' },
  { name: 'Chepet', mapLocation: 'xmas_dun02' },
  { name: 'Byrogue', mapLocation: 'thor_v02' },
  { name: 'Brain Sucker', mapLocation: 'tur_dun03' },
  { name: 'Baihu', mapLocation: 'lou_dun01' },
  { name: 'Arc Angeling', mapLocation: 'odin_tem02' },
  { name: 'Araccryo', mapLocation: 'ice_dun02' },
  { name: 'Anubis', mapLocation: 'in_sphinx4' },
  { name: 'Angeling', mapLocation: 'prt_fild03' },
];

const mvpBosses: Array<{ name: string; mapLocation: string }> = [
  { name: 'Orc Hero', mapLocation: 'gef_fild03' },
  { name: 'Garm', mapLocation: 'xmas_fild02' },
  { name: 'Eddga', mapLocation: 'pay_fild12' },
  { name: 'Drake', mapLocation: 'treasure02' },
];

// Convert to Boss type with unique IDs
export function getBossList(): Boss[] {
  const allBosses: Boss[] = [];
  let currentId = 1;

  // Add mini-bosses
  miniBosses.forEach((boss) => {
    allBosses.push({
      id: currentId++,
      name: boss.name,
      mapLocation: boss.mapLocation,
      isMVP: false,
      isMini: true,
      respawnTime: 120, // 90-120 minutes
    });
  });

  // Add MVPs
  mvpBosses.forEach((boss) => {
    allBosses.push({
      id: currentId++,
      name: boss.name,
      mapLocation: boss.mapLocation,
      isMVP: true,
      isMini: false,
      respawnTime: 120, // 90-120 minutes
    });
  });

  // Sort by name
  return allBosses.sort((a, b) => a.name.localeCompare(b.name));
}

// Get all MVPs
export function getMVPList(): Boss[] {
  return getBossList().filter(boss => boss.isMVP);
}

// Get all Mini-bosses
export function getMiniList(): Boss[] {
  return getBossList().filter(boss => boss.isMini);
}

// Get boss by ID
export function getBossById(id: number): Boss | undefined {
  return getBossList().find(boss => boss.id === id);
}
