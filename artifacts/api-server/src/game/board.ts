export type SpaceType = 'property' | 'railroad' | 'utility' | 'tax' | 'chance' | 'community' | 'go' | 'jail' | 'free_parking' | 'go_to_jail' | 'corner';

export interface BoardSpace {
  index: number;
  name: string;
  nameAr: string;
  type: SpaceType;
  price?: number;
  rent?: number[];
  houseCost?: number;
  hotelCost?: number;
  mortgageValue?: number;
  colorGroup?: string;
  taxAmount?: number;
  railroadRent?: number[];
}

export const BOARD: BoardSpace[] = [
  // ─── Corner / Special Spaces ────────────────────────────────────────────────
  { index: 0,  name: 'GO',               nameAr: 'انطلق',              type: 'go' },
  // ─── BROWN — cheapest ────────────────────────────────────────────────────────
  { index: 1,  name: 'Tunis',            nameAr: 'تونس',               type: 'property', price: 600,  rent: [40,  200,  600, 1800, 3200, 5000],  houseCost: 500,  hotelCost: 500,  mortgageValue: 300,  colorGroup: 'brown' },
  { index: 2,  name: 'Community Chest',  nameAr: 'صندوق المجتمع',       type: 'community' },
  { index: 3,  name: "Sana'a",           nameAr: 'صنعاء',              type: 'property', price: 800,  rent: [60,  300,  900, 2700, 4000, 5500],  houseCost: 500,  hotelCost: 500,  mortgageValue: 400,  colorGroup: 'brown' },
  { index: 4,  name: 'Zakat Tax',        nameAr: 'ضريبة الزكاة',        type: 'tax', taxAmount: 2000 },
  { index: 5,  name: 'Haramain Railway', nameAr: 'قطار الحرمين',        type: 'railroad', price: 2000, mortgageValue: 1000, railroadRent: [250, 500, 1000, 2000] },
  // ─── LIGHT BLUE ─────────────────────────────────────────────────────────────
  { index: 6,  name: 'Khartoum',         nameAr: 'الخرطوم',            type: 'property', price: 1000, rent: [60,  300,  900, 2700, 4000, 5500],  houseCost: 500,  hotelCost: 500,  mortgageValue: 500,  colorGroup: 'lightblue' },
  { index: 7,  name: 'Chance',           nameAr: 'الحظ',               type: 'chance' },
  { index: 8,  name: 'Tripoli',          nameAr: 'طرابلس',             type: 'property', price: 1000, rent: [60,  300,  900, 2700, 4000, 5500],  houseCost: 500,  hotelCost: 500,  mortgageValue: 500,  colorGroup: 'lightblue' },
  { index: 9,  name: 'Algiers',          nameAr: 'الجزائر',            type: 'property', price: 1200, rent: [80,  400, 1000, 3000, 4500, 6000],  houseCost: 500,  hotelCost: 500,  mortgageValue: 600,  colorGroup: 'lightblue' },
  { index: 10, name: 'Jail',             nameAr: 'السجن',              type: 'jail' },
  // ─── PINK ────────────────────────────────────────────────────────────────────
  { index: 11, name: 'Kuwait City',      nameAr: 'مدينة الكويت',       type: 'property', price: 1400, rent: [100,  500, 1500, 4500, 6250,  7500], houseCost: 1000, hotelCost: 1000, mortgageValue: 700,  colorGroup: 'pink' },
  { index: 12, name: 'Gulf Electricity', nameAr: 'كهرباء الخليج',       type: 'utility',  price: 1500, mortgageValue: 750 },
  { index: 13, name: 'Muscat',           nameAr: 'مسقط',               type: 'property', price: 1400, rent: [100,  500, 1500, 4500, 6250,  7500], houseCost: 1000, hotelCost: 1000, mortgageValue: 700,  colorGroup: 'pink' },
  { index: 14, name: 'Damascus',         nameAr: 'دمشق',               type: 'property', price: 1600, rent: [120,  600, 1800, 5000, 7000,  9000], houseCost: 1000, hotelCost: 1000, mortgageValue: 800,  colorGroup: 'pink' },
  { index: 15, name: 'Etihad Rail',      nameAr: 'قطار الاتحاد',        type: 'railroad', price: 2000, mortgageValue: 1000, railroadRent: [250, 500, 1000, 2000] },
  // ─── ORANGE ──────────────────────────────────────────────────────────────────
  { index: 16, name: 'Baghdad',          nameAr: 'بغداد',              type: 'property', price: 1800, rent: [140,  700, 2000, 5500, 7500,  9500], houseCost: 1000, hotelCost: 1000, mortgageValue: 900,  colorGroup: 'orange' },
  { index: 17, name: 'Community Chest',  nameAr: 'صندوق المجتمع',       type: 'community' },
  { index: 18, name: 'Beirut',           nameAr: 'بيروت',              type: 'property', price: 1800, rent: [140,  700, 2000, 5500, 7500,  9500], houseCost: 1000, hotelCost: 1000, mortgageValue: 900,  colorGroup: 'orange' },
  { index: 19, name: 'Amman',            nameAr: 'عمّان',              type: 'property', price: 2000, rent: [160,  800, 2200, 6000, 8000, 10000], houseCost: 1000, hotelCost: 1000, mortgageValue: 1000, colorGroup: 'orange' },
  { index: 20, name: 'Free Parking',     nameAr: 'وقوف مجاني',          type: 'free_parking' },
  // ─── RED ─────────────────────────────────────────────────────────────────────
  { index: 21, name: 'Casablanca',       nameAr: 'الدار البيضاء',       type: 'property', price: 2200, rent: [180,  900, 2500, 7000, 8750, 10500], houseCost: 1500, hotelCost: 1500, mortgageValue: 1100, colorGroup: 'red' },
  { index: 22, name: 'Chance',           nameAr: 'الحظ',               type: 'chance' },
  { index: 23, name: 'Ankara',           nameAr: 'أنقرة',              type: 'property', price: 2200, rent: [180,  900, 2500, 7000, 8750, 10500], houseCost: 1500, hotelCost: 1500, mortgageValue: 1100, colorGroup: 'red' },
  { index: 24, name: 'Cairo',            nameAr: 'القاهرة',            type: 'property', price: 2400, rent: [200, 1000, 3000, 7500, 9250, 11000], houseCost: 1500, hotelCost: 1500, mortgageValue: 1200, colorGroup: 'red' },
  { index: 25, name: 'Al-Boraq Railway', nameAr: 'قطار البراق',         type: 'railroad', price: 2000, mortgageValue: 1000, railroadRent: [250, 500, 1000, 2000] },
  // ─── YELLOW ──────────────────────────────────────────────────────────────────
  { index: 26, name: 'Riyadh',           nameAr: 'الرياض',             type: 'property', price: 2600, rent: [220, 1100, 3300, 8000, 9750, 11500], houseCost: 1500, hotelCost: 1500, mortgageValue: 1300, colorGroup: 'yellow' },
  { index: 27, name: 'Jeddah',           nameAr: 'جدة',                type: 'property', price: 2600, rent: [220, 1100, 3300, 8000, 9750, 11500], houseCost: 1500, hotelCost: 1500, mortgageValue: 1300, colorGroup: 'yellow' },
  { index: 28, name: 'Nile Water Co.',   nameAr: 'شركة مياه النيل',     type: 'utility',  price: 1500, mortgageValue: 750 },
  { index: 29, name: 'Mecca',            nameAr: 'مكة المكرمة',        type: 'property', price: 2800, rent: [240, 1200, 3600, 8500, 10250, 12000], houseCost: 1500, hotelCost: 1500, mortgageValue: 1400, colorGroup: 'yellow' },
  { index: 30, name: 'Go to Jail',       nameAr: 'اذهب إلى السجن',     type: 'go_to_jail' },
  // ─── GREEN — somewhat expensive ──────────────────────────────────────────────
  { index: 31, name: 'Manama',           nameAr: 'المنامة',            type: 'property', price: 3000, rent: [260, 1300, 3900, 9000, 11000, 12750], houseCost: 2000, hotelCost: 2000, mortgageValue: 1500, colorGroup: 'green' },
  { index: 32, name: 'Abu Dhabi',        nameAr: 'أبوظبي',             type: 'property', price: 3000, rent: [260, 1300, 3900, 9000, 11000, 12750], houseCost: 2000, hotelCost: 2000, mortgageValue: 1500, colorGroup: 'green' },
  { index: 33, name: 'Community Chest',  nameAr: 'صندوق المجتمع',       type: 'community' },
  { index: 34, name: 'Doha',             nameAr: 'الدوحة',             type: 'property', price: 3200, rent: [280, 1500, 4500, 10000, 12000, 14000], houseCost: 2000, hotelCost: 2000, mortgageValue: 1600, colorGroup: 'green' },
  { index: 35, name: 'Qatar Airways',    nameAr: 'الخطوط القطرية',      type: 'railroad', price: 2000, mortgageValue: 1000, railroadRent: [250, 500, 1000, 2000] },
  { index: 36, name: 'Chance',           nameAr: 'الحظ',               type: 'chance' },
  // ─── DARK BLUE — most expensive ──────────────────────────────────────────────
  { index: 37, name: 'Istanbul',         nameAr: 'إسطنبول',            type: 'property', price: 3500, rent: [350, 1750, 5000, 11000, 13000, 15000], houseCost: 2000, hotelCost: 2000, mortgageValue: 1750, colorGroup: 'darkblue' },
  { index: 38, name: 'Oil Revenue Tax',  nameAr: 'ضريبة النفط',         type: 'tax', taxAmount: 750 },
  { index: 39, name: 'Dubai',            nameAr: 'دبي',                type: 'property', price: 4000, rent: [500, 2000, 6000, 14000, 17000, 20000], houseCost: 2000, hotelCost: 2000, mortgageValue: 2000, colorGroup: 'darkblue' },
];

export const COLOR_GROUPS: Record<string, { color: string; dark: string }> = {
  brown:     { color: '#8B4513', dark: '#5D2E0C' },
  lightblue: { color: '#ADD8E6', dark: '#5BAFD6' },
  pink:      { color: '#FF69B4', dark: '#E91E8C' },
  orange:    { color: '#FFA500', dark: '#CC7700' },
  red:       { color: '#FF0000', dark: '#CC0000' },
  yellow:    { color: '#FFD700', dark: '#CCA600' },
  green:     { color: '#00B050', dark: '#007A38' },
  darkblue:  { color: '#0070C0', dark: '#004F8A' },
};

export const CHANCE_CARDS = [
  { text: 'Advance to GO! Collect 2000 DHS',               action: 'go_to_go' },
  { text: 'Advance to Dubai — the city of gold!',          action: 'go_to_39' },
  { text: 'Advance to Riyadh',                             action: 'go_to_26' },
  { text: 'Go to Jail! Do not pass GO!',                   action: 'go_to_jail' },
  { text: 'Bank pays you dividend of 500 DHS',             action: 'collect_500' },
  { text: 'Pay school fees of 1500 DHS',                   action: 'pay_1500' },
  { text: 'Advance to nearest Railroad',                   action: 'nearest_railroad' },
  { text: 'Take a walk in the souk. Move back 3 spaces',   action: 'back_3' },
  { text: 'Your oil investments paid off! Collect 1500 DHS', action: 'collect_1500' },
  { text: 'Grand hotel opening! Collect 1000 from each player', action: 'collect_1000_each' },
];

export const COMMUNITY_CARDS = [
  { text: 'Advance to GO! Collect 2000 DHS',               action: 'go_to_go' },
  { text: 'Ramadan Kareem! Collect 2000 DHS',              action: 'collect_2000' },
  { text: 'Medical expenses. Pay 1000 DHS',                action: 'pay_1000' },
  { text: 'Tax refund! Collect 200 DHS',                   action: 'collect_200' },
  { text: 'Eid Mubarak! Collect 1000 from each player',    action: 'collect_1000_each' },
  { text: 'Go to Jail! Do not pass GO!',                   action: 'go_to_jail' },
  { text: 'Your business flourishes! Collect 2500 DHS',    action: 'collect_2500' },
  { text: 'Pay water and electricity bill: 1500 DHS',      action: 'pay_1500' },
  { text: 'Inherit from wealthy uncle: 2000 DHS',          action: 'collect_2000' },
  { text: 'Pay hospital fees: 500 DHS',                    action: 'pay_500' },
];
