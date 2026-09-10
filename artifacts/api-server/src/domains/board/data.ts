// Type of cards
export type SpaceType = 'property' | 'railroad' | 'utility' | 'tax' | 'chance' | 'community' | 'go' | 'jail' | 'free_parking' | 'go_to_jail' | 'corner';

// contract regarding the board space
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
  importanceScore?: number;
  scoreBreakdown?: { religious: number; cultural: number; gdp: number; historical: number };
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANCE SCORE FORMULA (East Asia edition)
//
//   Score = Religious × 0.40 + Cultural × 0.30 + GDP × 0.20 + Historical × 0.10
//
//   Religious/Spiritual Significance — temples, shrines, pilgrimage sites
//   Cultural Significance            — arts, cuisine, global cultural reach
//   GDP / Economic Strength          — financial and trade power
//   Historical Significance          — dynasties, empires, heritage
//
//   All factors rated 1–10.  Prices are mapped linearly from the score.
// ─────────────────────────────────────────────────────────────────────────────

export const BOARD: BoardSpace[] = [
  // ── Corners ────────────────────────────────────────────────────────────────
  { index: 0,  name: 'GO',               nameAr: 'انطلق',              type: 'go' },

  // ── BROWN — cheapest tier ─────────────────────────────────────────────────
  // Hanoi: R=4, C=6, G=8, H=4  → 1.6+1.8+1.6+0.4 = 5.40
  {
    index: 1, name: 'Hanoi', nameAr: 'هانوي', type: 'property',
    price: 1200, rent: [80, 400, 1200, 3000, 4500, 6000],
    houseCost: 500, hotelCost: 500, mortgageValue: 600, colorGroup: 'brown',
    importanceScore: 5.40, scoreBreakdown: { religious: 4, cultural: 6, gdp: 8, historical: 4 },
  },
  // Manila: R=3, C=7, G=9, H=4  → 1.2+2.1+1.8+0.4 = 5.50
  {
    index: 2, name: 'Manila', nameAr: 'مانيلا', type: 'property',
    price: 1400, rent: [100, 500, 1400, 3500, 5000, 6500],
    houseCost: 500, hotelCost: 500, mortgageValue: 700, colorGroup: 'brown',
    importanceScore: 5.50, scoreBreakdown: { religious: 3, cultural: 7, gdp: 9, historical: 4 },
  },

  { index: 3,  name: 'Community Chest', nameAr: 'صندوق المجتمع', type: 'community' },

  // ── LIGHT BLUE ────────────────────────────────────────────────────────────
  // Jakarta: R=4, C=7, G=9, H=3  → 1.6+2.1+1.8+0.3 = 5.80
  {
    index: 4, name: 'Jakarta', nameAr: 'جاكرتا', type: 'property',
    price: 1600, rent: [120, 600, 1600, 4000, 5500, 7000],
    houseCost: 500, hotelCost: 500, mortgageValue: 800, colorGroup: 'lightblue',
    importanceScore: 5.80, scoreBreakdown: { religious: 4, cultural: 7, gdp: 9, historical: 3 },
  },
  // Bangkok: R=5, C=7, G=9, H=6  → 2.0+2.1+1.8+0.6 = 6.50  (Temple of the Emerald Buddha)
  {
    index: 5, name: 'Bangkok', nameAr: 'بانكوك', type: 'property',
    price: 1800, rent: [140, 700, 1800, 4500, 6000, 7500],
    houseCost: 500, hotelCost: 500, mortgageValue: 900, colorGroup: 'lightblue',
    importanceScore: 6.50, scoreBreakdown: { religious: 5, cultural: 7, gdp: 9, historical: 6 },
  },

  // Railroad 1
  { index: 6,  name: 'Shinkansen Express', nameAr: 'قطار شينكانسن', type: 'railroad', price: 2000, mortgageValue: 1000, railroadRent: [400, 800, 1600] },

  // ── JAIL corner ───────────────────────────────────────────────────────────
  { index: 7,  name: 'Jail',             nameAr: 'السجن',              type: 'jail' },

  // ── PINK ──────────────────────────────────────────────────────────────────
  // Kuala Lumpur: R=3, C=9, G=10, H=4  → 1.2+2.7+2.0+0.4 = 6.30
  {
    index: 8, name: 'Kuala Lumpur', nameAr: 'كوالالمبور', type: 'property',
    price: 2000, rent: [160, 800, 2000, 5000, 7000, 9000],
    houseCost: 1000, hotelCost: 1000, mortgageValue: 1000, colorGroup: 'pink',
    importanceScore: 6.30, scoreBreakdown: { religious: 3, cultural: 9, gdp: 10, historical: 4 },
  },

  { index: 9,  name: 'Harbor Tax',       nameAr: 'ضريبة الميناء',       type: 'tax', taxAmount: 500 },

  // Taipei: R=5, C=8, G=7, H=6  → 2.0+2.4+1.4+0.6 = 6.40  (Longshan Temple)
  {
    index: 10, name: 'Taipei', nameAr: 'تايبيه', type: 'property',
    price: 2200, rent: [180, 900, 2200, 5500, 7500, 9500],
    houseCost: 1000, hotelCost: 1000, mortgageValue: 1100, colorGroup: 'pink',
    importanceScore: 6.40, scoreBreakdown: { religious: 5, cultural: 8, gdp: 7, historical: 6 },
  },

  { index: 11, name: 'Mekong Water Co.', nameAr: 'شركة مياه الميكونغ',  type: 'utility',  price: 1500, mortgageValue: 750 },

  // ── ORANGE ────────────────────────────────────────────────────────────────
  // Busan: R=5, C=9, G=5, H=8  → 2.0+2.7+1.0+0.8 = 6.50  (Haedong Yonggungsa Temple)
  {
    index: 12, name: 'Busan', nameAr: 'بوسان', type: 'property',
    price: 2400, rent: [200, 1000, 2500, 6000, 8500, 10500],
    houseCost: 1000, hotelCost: 1000, mortgageValue: 1200, colorGroup: 'orange',
    importanceScore: 6.50, scoreBreakdown: { religious: 5, cultural: 9, gdp: 5, historical: 8 },
  },
  // Osaka: R=9, C=7, G=3, H=9  → 3.6+2.1+0.6+0.9 = 7.20  (Shitennō-ji, Japan's first temple)
  {
    index: 13, name: 'Osaka', nameAr: 'أوساكا', type: 'property',
    price: 2600, rent: [220, 1100, 3000, 7000, 9500, 11500],
    houseCost: 1000, hotelCost: 1000, mortgageValue: 1300, colorGroup: 'orange',
    importanceScore: 7.20, scoreBreakdown: { religious: 9, cultural: 7, gdp: 3, historical: 9 },
  },

  // ── PICNIC corner (formerly Free Parking) ─────────────────────────────────
  { index: 14, name: 'Picnic',           nameAr: 'نزهة',                type: 'free_parking' },

  // Railroad 2
  { index: 15, name: 'Silk Road Railway', nameAr: 'سكة طريق الحرير',    type: 'railroad', price: 2000, mortgageValue: 1000, railroadRent: [400, 800, 1600] },

  { index: 16, name: 'Chance',           nameAr: 'الحظ',               type: 'chance' },

  // Kyoto: R=7, C=9, G=4, H=10  → 2.8+2.7+0.8+1.0 = 7.30  (Kinkaku-ji, Fushimi Inari, 1,600 temples)
  {
    index: 17, name: 'Kyoto', nameAr: 'كيوتو', type: 'property',
    price: 2800, rent: [240, 1200, 3300, 8000, 10500, 12500],
    houseCost: 1000, hotelCost: 1000, mortgageValue: 1400, colorGroup: 'orange',
    importanceScore: 7.30, scoreBreakdown: { religious: 7, cultural: 9, gdp: 4, historical: 10 },
  },

  // ── YELLOW ────────────────────────────────────────────────────────────────
  // Seoul: R=7, C=8, G=8, H=7  → 2.8+2.4+1.6+0.7 = 7.50  (Jogyesa Temple, Gyeongbokgung)
  {
    index: 18, name: 'Seoul', nameAr: 'سيول', type: 'property',
    price: 3000, rent: [260, 1300, 3900, 9000, 12000, 14000],
    houseCost: 1500, hotelCost: 1500, mortgageValue: 1500, colorGroup: 'yellow',
    importanceScore: 7.50, scoreBreakdown: { religious: 7, cultural: 8, gdp: 8, historical: 7 },
  },

  { index: 19, name: 'Pacific Power Co.', nameAr: 'شركة كهرباء المحيط الهادئ', type: 'utility',  price: 1500, mortgageValue: 750 },

  // Shanghai: R=7, C=9, G=6, H=10  → 2.8+2.7+1.2+1.0 = 7.70  (Jade Buddha Temple, the Bund)
  {
    index: 20, name: 'Shanghai', nameAr: 'شنغهاي', type: 'property',
    price: 3200, rent: [280, 1500, 4200, 10000, 13500, 15000],
    houseCost: 1500, hotelCost: 1500, mortgageValue: 1600, colorGroup: 'yellow',
    importanceScore: 7.70, scoreBreakdown: { religious: 7, cultural: 9, gdp: 6, historical: 10 },
  },

  // ── GO TO JAIL corner ─────────────────────────────────────────────────────
  { index: 21, name: 'Go to Jail',       nameAr: 'اذهب إلى السجن',     type: 'go_to_jail' },

  // ── GREEN ─────────────────────────────────────────────────────────────────
  // Hong Kong: R=7, C=10, G=7, H=10  → 2.8+3.0+1.4+1.0 = 8.20  (Big Buddha, Wong Tai Sin)
  {
    index: 22, name: 'Hong Kong', nameAr: 'هونغ كونغ', type: 'property',
    price: 3400, rent: [300, 1600, 4500, 11000, 14500, 16000],
    houseCost: 1500, hotelCost: 1500, mortgageValue: 1700, colorGroup: 'green',
    importanceScore: 8.20, scoreBreakdown: { religious: 7, cultural: 10, gdp: 7, historical: 10 },
  },

  { index: 23, name: 'Trade Tax',        nameAr: 'ضريبة التجارة',       type: 'tax', taxAmount: 2000 },

  // Singapore: R=9, C=10, G=3, H=10  → 3.6+3.0+0.6+1.0 = 8.20
  // (Buddha Tooth Relic Temple, Sultan Mosque, Sri Mariamman — crossroads of faiths)
  {
    index: 24, name: 'Singapore', nameAr: 'سنغافورة', type: 'property',
    price: 3600, rent: [350, 1800, 5000, 12000, 15500, 18000],
    houseCost: 1500, hotelCost: 1500, mortgageValue: 1800, colorGroup: 'green',
    importanceScore: 8.20, scoreBreakdown: { religious: 9, cultural: 10, gdp: 3, historical: 10 },
  },

  // Railroad 3
  { index: 25, name: 'Maglev Express', nameAr: 'قطار ماجليف', type: 'railroad', price: 2500, mortgageValue: 1250, railroadRent: [400, 800, 1600] },

  // ── DARK BLUE — the two imperial capitals ────────────────────────────────
  // Beijing: R=10, C=8, G=5, H=10  → 4.0+2.4+1.0+1.0 = 8.40
  // (Temple of Heaven, Forbidden City, seat of dynasties for seven centuries)
  {
    index: 26, name: 'Beijing', nameAr: 'بكين', type: 'property',
    price: 4200, rent: [500, 2000, 6000, 14000, 18000, 22000],
    houseCost: 2000, hotelCost: 2000, mortgageValue: 2100, colorGroup: 'darkblue',
    importanceScore: 8.40, scoreBreakdown: { religious: 10, cultural: 8, gdp: 5, historical: 10 },
  },
  // Tokyo: R=10, C=9, G=7, H=9  → 4.0+2.7+1.4+0.9 = 9.00
  // (Sensō-ji, Meiji Shrine — the largest metropolis on Earth)
  {
    index: 27, name: 'Tokyo', nameAr: 'طوكيو', type: 'property',
    price: 5000, rent: [700, 2500, 7500, 18000, 24000, 30000],
    houseCost: 2000, hotelCost: 2000, mortgageValue: 2500, colorGroup: 'darkblue',
    importanceScore: 9.00, scoreBreakdown: { religious: 10, cultural: 9, gdp: 7, historical: 9 },
  },
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
  {
    text: 'Your cargo junk rides the monsoon winds into port ahead of schedule. Advance to GO — collect 2,000 DHS.',
    action: 'go_to_go',
  },
  {
    text: 'You are summoned to the imperial capital for an audience. Advance to Beijing — collect 2,000 DHS if you pass GO along the way.',
    action: 'go_to_beijing',
  },
  {
    text: 'The Jakarta Trade Summit has reserved the front row for you. Advance to Jakarta — collect 2,000 DHS if you pass GO.',
    action: 'go_to_jakarta',
  },
  {
    text: 'Counterfeit banknotes were discovered in your luggage at the border checkpoint. Go directly to Jail — do not pass GO, do not collect 2,000 DHS.',
    action: 'go_to_jail',
  },
  {
    text: 'Your semiconductor shares deliver a bumper quarterly dividend. The bank credits your account with 500 DHS.',
    action: 'collect_500',
  },
  {
    text: 'Annual tuition fees for your children at a prestigious Tokyo university are now due. Pay 1,500 DHS.',
    action: 'pay_1500',
  },
  {
    text: 'All aboard! Board the nearest available railway and advance to it — collect 2,000 DHS if you pass GO.',
    action: 'nearest_railroad',
  },
  {
    text: 'You wander deep into the night market, drawn in by the scent of street food and jasmine tea. You lose your way among the lantern stalls. Move back 3 spaces.',
    action: 'back_3',
  },
  {
    text: 'Your deep-sea fishing fleet hauls in a record catch off the Pacific coast. The bank pays you 1,500 DHS in profits.',
    action: 'collect_1500',
  },
  {
    text: 'You host a lavish Lunar New Year banquet at your villa — every player arrives bearing generous gifts. Collect 1,000 DHS from each of them.',
    action: 'collect_1000_each',
  },
  {
    text: 'Cherry blossom season fills every room in your Kyoto ryokan to capacity for the full month. Collect 2,000 DHS in accommodation revenue.',
    action: 'collect_2000',
  },
  {
    text: 'Your sports car was caught speeding on the expressway. Pay a fine of 500 DHS to the traffic authority.',
    action: 'pay_500',
  },
  {
    text: 'You win the Grand Prix VIP hospitality lottery in Shanghai — pit lane access, gala dinner, and a cash prize! Collect 2,500 DHS.',
    action: 'collect_2500',
  },
  {
    text: 'Your prized koi collection was impounded at the airport — it was travelling without the correct permits. Pay a penalty of 1,000 DHS to secure its release.',
    action: 'pay_1000',
  },
];

export const COMMUNITY_CARDS = [
  {
    text: 'Your trading fleet completes the great circuit and passes the starting point of the route. Advance to GO — collect 2,000 DHS.',
    action: 'go_to_go',
  },
  {
    text: 'Happy Lunar New Year! The bank distributes a special 2,000 DHS bonus to all traders in celebration of the festival.',
    action: 'collect_2000',
  },
  {
    text: 'A family medical emergency sends your relative to a private hospital. Pay the bill of 1,000 DHS.',
    action: 'pay_1000',
  },
  {
    text: 'The tax authority has processed your overpayment claim and approves a refund. Collect 200 DHS.',
    action: 'collect_200',
  },
  {
    text: 'It is the Mid-Autumn Festival! You celebrate with all traders on the board — collect 1,000 DHS in red envelopes from each player.',
    action: 'collect_1000_each',
  },
  {
    text: 'An anonymous tip-off reaches the authorities regarding your business dealings. You are escorted to jail immediately. Go to Jail — do not pass GO.',
    action: 'go_to_jail',
  },
  {
    text: 'Your import-export company lands a landmark government contract. Your accountant wires you 2,500 DHS in advance payment.',
    action: 'collect_2500',
  },
  {
    text: 'The utility board issues a combined water and electricity bill for your villa. Pay 1,500 DHS.',
    action: 'pay_1500',
  },
  {
    text: 'A wealthy great-uncle passes away and bequeaths you his entire pearl-trading fortune. Inherit 2,000 DHS.',
    action: 'collect_2000',
  },
  {
    text: 'Emergency surgery at a private clinic was unavoidable. Pay the hospital fees of 500 DHS.',
    action: 'pay_500',
  },
  {
    text: 'Your night-market stall has its best quarter ever — premium matcha and silk sell out in days. Collect 1,500 DHS in trading profits.',
    action: 'collect_1500',
  },
  {
    text: 'The municipality levies annual property taxes on your hillside estate. Pay 1,000 DHS.',
    action: 'pay_1000',
  },
  {
    text: 'The regional tourism board awards you a prize for promoting East Asian cultural heritage to international visitors. Collect 500 DHS.',
    action: 'collect_500',
  },
  {
    text: 'New metro lines are announced through your rental districts — property values surge overnight. Collect 2,000 DHS in rising rental income.',
    action: 'collect_2000',
  },
];
