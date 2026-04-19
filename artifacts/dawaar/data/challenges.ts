export interface CountryChallenge {
  id: string;
  boardId: string;
  title: string;
  titleAr: string;
  flag: string;
  description: string;
  npcCount: number;
  rewardPoints: number;
}

export interface RegionChallenge {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  regionFlag: string;
  color: string;
  accentColor: string;
  countries: CountryChallenge[];
}

export const REGION_CHALLENGES: RegionChallenge[] = [
  {
    id: 'gcc',
    title: 'GCC',
    titleAr: 'مجلس التعاون الخليجي',
    description: 'Dominate the Gulf — from the sands of Oman to the towers of Dubai.',
    regionFlag: '🏙️',
    color: '#1E3A5F',
    accentColor: '#C9A84C',
    countries: [
      {
        id: 'gcc_oman',
        boardId: 'gcc_oman',
        title: 'Oman',
        titleAr: 'عُمان',
        flag: '🇴🇲',
        description: 'From the frankincense trade of Salalah to the Grand Mosque of Muscat.',
        npcCount: 3,
        rewardPoints: 1000,
      },
      {
        id: 'gcc_qatar',
        boardId: 'gcc_qatar',
        title: 'Qatar',
        titleAr: 'قطر',
        flag: '🇶🇦',
        description: 'Rise through Lusail City, the Pearl, and all the way to downtown Doha.',
        npcCount: 3,
        rewardPoints: 1000,
      },
      {
        id: 'gcc_uae',
        boardId: 'gcc_uae',
        title: 'United Arab Emirates',
        titleAr: 'الإمارات العربية المتحدة',
        flag: '🇦🇪',
        description: 'From the oasis of Al Ain to the DIFC towers — claim every emirate.',
        npcCount: 3,
        rewardPoints: 1000,
      },
      {
        id: 'gcc_ksa',
        boardId: 'gcc_ksa',
        title: 'Saudi Arabia',
        titleAr: 'المملكة العربية السعودية',
        flag: '🇸🇦',
        description: 'Build your empire from Tabuk to Mecca — the heart of the Islamic world.',
        npcCount: 3,
        rewardPoints: 1000,
      },
    ],
  },
  {
    id: 'alsham',
    title: 'Al Sham',
    titleAr: 'بلاد الشام',
    description: 'Journey through the ancient Levant — from Petra to the Umayyad Mosque.',
    regionFlag: '🏛️',
    color: '#1A3320',
    accentColor: '#4ADE80',
    countries: [
      {
        id: 'alsham_jordan',
        boardId: 'alsham_jordan',
        title: 'Jordan',
        titleAr: 'الأردن',
        flag: '🇯🇴',
        description: 'Traverse Wadi Rum, Petra, and the Dead Sea coast down to Amman.',
        npcCount: 3,
        rewardPoints: 1000,
      },
      {
        id: 'alsham_lebanon',
        boardId: 'alsham_lebanon',
        title: 'Lebanon',
        titleAr: 'لبنان',
        flag: '🇱🇧',
        description: "From Baalbek's Roman temples to the vibrant streets of Beirut Downtown.",
        npcCount: 3,
        rewardPoints: 1000,
      },
      {
        id: 'alsham_syria',
        boardId: 'alsham_syria',
        title: 'Syria',
        titleAr: 'سوريا',
        flag: '🇸🇾',
        description: "Ancient Palmyra, Aleppo's souqs, and the grand Umayyad Mosque of Damascus.",
        npcCount: 3,
        rewardPoints: 1000,
      },
    ],
  },
  {
    id: 'northafrica',
    title: 'North Africa',
    titleAr: 'شمال أفريقيا',
    description: 'Build your empire along the Nile and the Maghreb coast.',
    regionFlag: '🌍',
    color: '#3D1A00',
    accentColor: '#FB923C',
    countries: [
      {
        id: 'na_tunisia',
        boardId: 'na_tunisia',
        title: 'Tunisia',
        titleAr: 'تونس',
        flag: '🇹🇳',
        description: "From Kairouan's holy city to Sidi Bou Said and the heart of Tunis.",
        npcCount: 3,
        rewardPoints: 1000,
      },
      {
        id: 'na_libya',
        boardId: 'na_libya',
        title: 'Libya',
        titleAr: 'ليبيا',
        flag: '🇱🇾',
        description: 'From the UNESCO oasis of Ghadames to the Mediterranean coast of Tripoli.',
        npcCount: 3,
        rewardPoints: 1000,
      },
      {
        id: 'na_morocco',
        boardId: 'na_morocco',
        title: 'Morocco',
        titleAr: 'المغرب',
        flag: '🇲🇦',
        description: "Chefchaouen's blue alleys, Marrakech's medina, and Casablanca's grandeur.",
        npcCount: 3,
        rewardPoints: 1000,
      },
      {
        id: 'na_algeria',
        boardId: 'na_algeria',
        title: 'Algeria',
        titleAr: 'الجزائر',
        flag: '🇩🇿',
        description: "From Tlemcen's Islamic heritage and Ghardaia's M'Zab Valley to Algiers.",
        npcCount: 3,
        rewardPoints: 1000,
      },
      {
        id: 'na_egypt',
        boardId: 'na_egypt',
        title: 'Egypt',
        titleAr: 'مصر',
        flag: '🇪🇬',
        description: 'The temples of Luxor, Al-Azhar of Cairo, and the banks of the Nile.',
        npcCount: 3,
        rewardPoints: 1000,
      },
    ],
  },
  {
    id: 'persia',
    title: 'Persia',
    titleAr: 'بلاد فارس',
    description: 'Traverse ancient empires — from the Caucasus peaks to the Persian Gulf.',
    regionFlag: '🏔️',
    color: '#1A1535',
    accentColor: '#C084FC',
    countries: [
      {
        id: 'persia_azerbaijan',
        boardId: 'persia_azerbaijan',
        title: 'Azerbaijan',
        titleAr: 'أذربيجان',
        flag: '🇦🇿',
        description: 'From the Silk Road caravanserais of Sheki to the flame towers of Baku.',
        npcCount: 3,
        rewardPoints: 1000,
      },
      {
        id: 'persia_kurdistan',
        boardId: 'persia_kurdistan',
        title: 'Kurdistan',
        titleAr: 'كردستان',
        flag: '🏔️',
        description: 'Spanning Erbil, Sulaymaniyah, Qamishli, Sanandaj, and Diyarbakir across four countries.',
        npcCount: 3,
        rewardPoints: 1000,
      },
      {
        id: 'persia_iraq',
        boardId: 'persia_iraq',
        title: 'Iraq',
        titleAr: 'العراق',
        flag: '🇮🇶',
        description: 'The holy cities of Karbala and Najaf, Mosul on the Tigris, and Baghdad at the heart of Mesopotamia.',
        npcCount: 3,
        rewardPoints: 1000,
      },
      {
        id: 'persia_iran',
        boardId: 'persia_iran',
        title: 'Iran',
        titleAr: 'إيران',
        flag: '🇮🇷',
        description: 'From the blue-tiled mosques of Isfahan to the grand bazaars of Tehran.',
        npcCount: 3,
        rewardPoints: 1000,
      },
    ],
  },
];

export const REWARD_ADVANTAGES = [
  { pts: 500,  icon: '💰', title: 'Starting Boost',    desc: 'Begin any multiplayer game with +2,000 DHS bonus cash.' },
  { pts: 1000, icon: '🔓', title: 'Jail Pass',         desc: 'Use one "Get Out of Jail Free" per multiplayer game.' },
  { pts: 2000, icon: '📈', title: 'Double Salary',     desc: 'Collect double GO salary for 5 turns in any game.' },
];
