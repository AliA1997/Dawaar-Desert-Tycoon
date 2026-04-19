export interface Challenge {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  countries: string[];
  flag: string;
  color: string;
  accentColor: string;
  npcCount: number;
  rewardPoints: number;
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'gcc',
    title: 'GCC',
    titleAr: 'مجلس التعاون الخليجي',
    description: 'Dominate the Gulf — from Dubai Downtown to Abu Dhabi and beyond. Compete across Saudi Arabia, UAE, Oman, and Qatar.',
    countries: ['🇸🇦', '🇦🇪', '🇴🇲', '🇶🇦'],
    flag: '🏙️',
    color: '#1E3A5F',
    accentColor: '#C9A84C',
    npcCount: 3,
    rewardPoints: 1000,
  },
  {
    id: 'alsham',
    title: 'Al Sham',
    titleAr: 'بلاد الشام',
    description: 'Journey through the ancient Levant — Petra to Beirut Corniche, Amman to Damascus. Jordan, Syria, and Lebanon await.',
    countries: ['🇯🇴', '🇸🇾', '🇱🇧'],
    flag: '🏛️',
    color: '#1A3320',
    accentColor: '#4ADE80',
    npcCount: 3,
    rewardPoints: 1000,
  },
  {
    id: 'northafrica',
    title: 'North Africa',
    titleAr: 'شمال أفريقيا',
    description: 'Build your empire along the Nile and the Maghreb coast — from Casablanca to Cairo CBD, Algiers to Marrakech.',
    countries: ['🇪🇬', '🇱🇾', '🇹🇳', '🇩🇿', '🇲🇦'],
    flag: '🌍',
    color: '#3D1A00',
    accentColor: '#FB923C',
    npcCount: 3,
    rewardPoints: 1000,
  },
  {
    id: 'iraq',
    title: 'Iraq',
    titleAr: 'العراق',
    description: 'Rise through the land between two rivers — from Sulaymaniyah to Baghdad CBD, Karbala to Basra Port.',
    countries: ['🇮🇶'],
    flag: '🌊',
    color: '#1A1A3D',
    accentColor: '#818CF8',
    npcCount: 3,
    rewardPoints: 1000,
  },
];

export const REWARD_ADVANTAGES = [
  { pts: 500,  icon: '💰', title: 'Starting Boost',    desc: 'Begin any multiplayer game with +2,000 DHS bonus cash.' },
  { pts: 1000, icon: '🔓', title: 'Jail Pass',         desc: 'Use one "Get Out of Jail Free" per multiplayer game.' },
  { pts: 2000, icon: '📈', title: 'Double Salary',     desc: 'Collect double GO salary for 5 turns in any game.' },
];
