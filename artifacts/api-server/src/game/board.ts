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
  // 0 - GO
  { index: 0, name: 'GO - Collect 2000', nameAr: 'انطلق - اجمع ٢٠٠٠', type: 'go' },
  // 1 - Mediterranean Purple
  { index: 1, name: 'Medina, Madinah', nameAr: 'المدينة المنورة', type: 'property', price: 600, rent: [40, 200, 600, 1800, 3200, 5000], houseCost: 500, hotelCost: 500, mortgageValue: 300, colorGroup: 'brown' },
  // 2 - Community Chest
  { index: 2, name: 'Community Chest', nameAr: 'صندوق المجتمع', type: 'community' },
  // 3 - Baltic Purple
  { index: 3, name: 'Muscat, Oman', nameAr: 'مسقط، عُمان', type: 'property', price: 800, rent: [60, 300, 900, 2700, 4000, 5500], houseCost: 500, hotelCost: 500, mortgageValue: 400, colorGroup: 'brown' },
  // 4 - Income Tax
  { index: 4, name: 'Zakat Tax', nameAr: 'ضريبة الزكاة', type: 'tax', taxAmount: 2000 },
  // 5 - Railroad
  { index: 5, name: 'Haramain Railway', nameAr: 'قطار الحرمين', type: 'railroad', price: 2000, mortgageValue: 1000, railroadRent: [250, 500, 1000, 2000] },
  // 6 - Light Blue
  { index: 6, name: 'Amman, Jordan', nameAr: 'عمّان، الأردن', type: 'property', price: 1000, rent: [60, 300, 900, 2700, 4000, 5500], houseCost: 500, hotelCost: 500, mortgageValue: 500, colorGroup: 'lightblue' },
  // 7 - Chance
  { index: 7, name: 'Chance', nameAr: 'الحظ', type: 'chance' },
  // 8 - Light Blue
  { index: 8, name: 'Beirut, Lebanon', nameAr: 'بيروت، لبنان', type: 'property', price: 1000, rent: [60, 300, 900, 2700, 4000, 5500], houseCost: 500, hotelCost: 500, mortgageValue: 500, colorGroup: 'lightblue' },
  // 9 - Light Blue
  { index: 9, name: 'Baghdad, Iraq', nameAr: 'بغداد، العراق', type: 'property', price: 1200, rent: [80, 400, 1000, 3000, 4500, 6000], houseCost: 500, hotelCost: 500, mortgageValue: 600, colorGroup: 'lightblue' },
  // 10 - Jail / Just Visiting
  { index: 10, name: 'Jail / Just Visiting', nameAr: 'السجن / مجرد زيارة', type: 'jail' },
  // 11 - Pink
  { index: 11, name: 'Kuwait City', nameAr: 'مدينة الكويت', type: 'property', price: 1400, rent: [100, 500, 1500, 4500, 6250, 7500], houseCost: 1000, hotelCost: 1000, mortgageValue: 700, colorGroup: 'pink' },
  // 12 - Electric Company (Utility)
  { index: 12, name: 'Gulf Electricity', nameAr: 'كهرباء الخليج', type: 'utility', price: 1500, mortgageValue: 750 },
  // 13 - Pink
  { index: 13, name: 'Manama, Bahrain', nameAr: 'المنامة، البحرين', type: 'property', price: 1400, rent: [100, 500, 1500, 4500, 6250, 7500], houseCost: 1000, hotelCost: 1000, mortgageValue: 700, colorGroup: 'pink' },
  // 14 - Pink
  { index: 14, name: 'Doha, Qatar', nameAr: 'الدوحة، قطر', type: 'property', price: 1600, rent: [120, 600, 1800, 5000, 7000, 9000], houseCost: 1000, hotelCost: 1000, mortgageValue: 800, colorGroup: 'pink' },
  // 15 - Railroad
  { index: 15, name: 'Etihad Rail', nameAr: 'قطار الاتحاد', type: 'railroad', price: 2000, mortgageValue: 1000, railroadRent: [250, 500, 1000, 2000] },
  // 16 - Orange
  { index: 16, name: 'Riyadh, Saudi Arabia', nameAr: 'الرياض، المملكة العربية السعودية', type: 'property', price: 1800, rent: [140, 700, 2000, 5500, 7500, 9500], houseCost: 1000, hotelCost: 1000, mortgageValue: 900, colorGroup: 'orange' },
  // 17 - Community Chest
  { index: 17, name: 'Community Chest', nameAr: 'صندوق المجتمع', type: 'community' },
  // 18 - Orange
  { index: 18, name: 'Jeddah, Saudi Arabia', nameAr: 'جدة، المملكة العربية السعودية', type: 'property', price: 1800, rent: [140, 700, 2000, 5500, 7500, 9500], houseCost: 1000, hotelCost: 1000, mortgageValue: 900, colorGroup: 'orange' },
  // 19 - Orange
  { index: 19, name: 'Mecca, Saudi Arabia', nameAr: 'مكة المكرمة', type: 'property', price: 2000, rent: [160, 800, 2200, 6000, 8000, 10000], houseCost: 1000, hotelCost: 1000, mortgageValue: 1000, colorGroup: 'orange' },
  // 20 - Free Parking
  { index: 20, name: 'Free Parking', nameAr: 'وقوف مجاني', type: 'free_parking' },
  // 21 - Red
  { index: 21, name: 'Istanbul, Turkey', nameAr: 'إسطنبول، تركيا', type: 'property', price: 2200, rent: [180, 900, 2500, 7000, 8750, 10500], houseCost: 1500, hotelCost: 1500, mortgageValue: 1100, colorGroup: 'red' },
  // 22 - Chance
  { index: 22, name: 'Chance', nameAr: 'الحظ', type: 'chance' },
  // 23 - Red
  { index: 23, name: 'Ankara, Turkey', nameAr: 'أنقرة، تركيا', type: 'property', price: 2200, rent: [180, 900, 2500, 7000, 8750, 10500], houseCost: 1500, hotelCost: 1500, mortgageValue: 1100, colorGroup: 'red' },
  // 24 - Red
  { index: 24, name: 'Cairo, Egypt', nameAr: 'القاهرة، مصر', type: 'property', price: 2400, rent: [200, 1000, 3000, 7500, 9250, 11000], houseCost: 1500, hotelCost: 1500, mortgageValue: 1200, colorGroup: 'red' },
  // 25 - Railroad
  { index: 25, name: 'Al-Boraq Railway', nameAr: 'قطار البراق', type: 'railroad', price: 2000, mortgageValue: 1000, railroadRent: [250, 500, 1000, 2000] },
  // 26 - Yellow
  { index: 26, name: 'Alexandria, Egypt', nameAr: 'الإسكندرية، مصر', type: 'property', price: 2600, rent: [220, 1100, 3300, 8000, 9750, 11500], houseCost: 1500, hotelCost: 1500, mortgageValue: 1300, colorGroup: 'yellow' },
  // 27 - Yellow
  { index: 27, name: 'Tehran, Iran', nameAr: 'طهران، إيران', type: 'property', price: 2600, rent: [220, 1100, 3300, 8000, 9750, 11500], houseCost: 1500, hotelCost: 1500, mortgageValue: 1300, colorGroup: 'yellow' },
  // 28 - Water Works (Utility)
  { index: 28, name: 'Nile Water Co.', nameAr: 'شركة مياه النيل', type: 'utility', price: 1500, mortgageValue: 750 },
  // 29 - Yellow
  { index: 29, name: 'Casablanca, Morocco', nameAr: 'الدار البيضاء، المغرب', type: 'property', price: 2800, rent: [240, 1200, 3600, 8500, 10250, 12000], houseCost: 1500, hotelCost: 1500, mortgageValue: 1400, colorGroup: 'yellow' },
  // 30 - Go to Jail
  { index: 30, name: 'Go to Jail', nameAr: 'اذهب إلى السجن', type: 'go_to_jail' },
  // 31 - Green
  { index: 31, name: 'Dubai, UAE', nameAr: 'دبي، الإمارات', type: 'property', price: 3000, rent: [260, 1300, 3900, 9000, 11000, 12750], houseCost: 2000, hotelCost: 2000, mortgageValue: 1500, colorGroup: 'green' },
  // 32 - Green
  { index: 32, name: 'Abu Dhabi, UAE', nameAr: 'أبوظبي، الإمارات', type: 'property', price: 3000, rent: [260, 1300, 3900, 9000, 11000, 12750], houseCost: 2000, hotelCost: 2000, mortgageValue: 1500, colorGroup: 'green' },
  // 33 - Community Chest
  { index: 33, name: 'Community Chest', nameAr: 'صندوق المجتمع', type: 'community' },
  // 34 - Green
  { index: 34, name: 'NEOM, Saudi Arabia', nameAr: 'نيوم، المملكة العربية السعودية', type: 'property', price: 3200, rent: [280, 1500, 4500, 10000, 12000, 14000], houseCost: 2000, hotelCost: 2000, mortgageValue: 1600, colorGroup: 'green' },
  // 35 - Railroad
  { index: 35, name: 'Qatar Airways Express', nameAr: 'قطار الخطوط القطرية', type: 'railroad', price: 2000, mortgageValue: 1000, railroadRent: [250, 500, 1000, 2000] },
  // 36 - Chance
  { index: 36, name: 'Chance', nameAr: 'الحظ', type: 'chance' },
  // 37 - Dark Blue
  { index: 37, name: 'Burj Khalifa', nameAr: 'برج خليفة', type: 'property', price: 3500, rent: [350, 1750, 5000, 11000, 13000, 15000], houseCost: 2000, hotelCost: 2000, mortgageValue: 1750, colorGroup: 'darkblue' },
  // 38 - Luxury Tax
  { index: 38, name: 'Oil Revenue Tax', nameAr: 'ضريبة عائدات النفط', type: 'tax', taxAmount: 750 },
  // 39 - Dark Blue
  { index: 39, name: 'Palm Jumeirah', nameAr: 'نخلة جميرا', type: 'property', price: 4000, rent: [500, 2000, 6000, 14000, 17000, 20000], houseCost: 2000, hotelCost: 2000, mortgageValue: 2000, colorGroup: 'darkblue' },
];

export const COLOR_GROUPS: Record<string, { color: string; dark: string }> = {
  brown: { color: '#8B4513', dark: '#5D2E0C' },
  lightblue: { color: '#ADD8E6', dark: '#5BAFD6' },
  pink: { color: '#FF69B4', dark: '#E91E8C' },
  orange: { color: '#FFA500', dark: '#CC7700' },
  red: { color: '#FF0000', dark: '#CC0000' },
  yellow: { color: '#FFD700', dark: '#CCA600' },
  green: { color: '#00B050', dark: '#007A38' },
  darkblue: { color: '#0070C0', dark: '#004F8A' },
};

export const CHANCE_CARDS = [
  { text: 'Advance to GO! Collect 2000 DHS', action: 'go_to_go' },
  { text: 'Advance to Burj Khalifa', action: 'go_to_37' },
  { text: 'Advance to Riyadh', action: 'go_to_16' },
  { text: 'Go to Jail! Do not pass GO!', action: 'go_to_jail' },
  { text: 'Bank pays you dividend of 500 DHS', action: 'collect_500' },
  { text: 'Pay school fees of 1500 DHS', action: 'pay_1500' },
  { text: 'Advance to nearest Railroad', action: 'nearest_railroad' },
  { text: 'Take a walk in the souk. Move back 3 spaces', action: 'back_3' },
  { text: 'Your investments in oil paid off! Collect 1500 DHS', action: 'collect_1500' },
  { text: 'Grand opening of your hotel. Collect 1000 from each player', action: 'collect_1000_each' },
];

export const COMMUNITY_CARDS = [
  { text: 'Advance to GO! Collect 2000 DHS', action: 'go_to_go' },
  { text: 'Ramadan Kareem! Collect 2000 DHS', action: 'collect_2000' },
  { text: 'Medical expenses. Pay 1000 DHS', action: 'pay_1000' },
  { text: 'Tax refund! Collect 200 DHS', action: 'collect_200' },
  { text: 'It is your Eid! Collect 1000 DHS from each player', action: 'collect_1000_each' },
  { text: 'Go to Jail! Do not pass GO!', action: 'go_to_jail' },
  { text: 'Your business flourishes! Collect 2500 DHS', action: 'collect_2500' },
  { text: 'Pay water and electricity bill: 1500 DHS', action: 'pay_1500' },
  { text: 'Inherit from wealthy uncle: 2000 DHS', action: 'collect_2000' },
  { text: 'Pay hospital fees: 500 DHS', action: 'pay_500' },
];
