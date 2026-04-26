import type { BoardSpace } from './board.js';
import { GCC_BOARD, GULF_BOARD, KSA_BOARD, OMAN_BOARD, QATAR_BOARD, SAUDI_BOARD, UAE_BOARD } from './challenges/gcc/index.js';
import { SYRIA_BOARD, JORDAN_BOARD, LEBANON_BOARD, SYRIA_COUNTRY_BOARD, JORDAN_COUNTRY_BOARD, AL_SHAM_BOARD } from './challenges/al sham/index.js';
import { NORTH_AFRICA_BOARD, TUNISIA_BOARD, LIBYA_BOARD, ALGERIA_BOARD, MOROCCO_BOARD, EGYPT_BOARD } from './challenges/north africa/index.js';
import { TECH_BOARD, FASHION_BOARD, DEFENSE_BOARD, FOOD_BOARD } from './challenges/misc/index.js';
import { IRAQ_BOARD, PERSIA_AZERBAIJAN_BOARD, PERSIA_IRAN_BOARD, PERSIA_IRAQ_BOARD, PERSIA_KURDISTAN_BOARD } from './challenges/persia/index.js';
import { SOUTHASIA_AFGHANISTAN_BOARD, SOUTHASIA_BANGLADESH_BOARD, SOUTHASIA_INDIA_BOARD, SOUTHASIA_PAKISTAN_BOARD } from './challenges/south asia/index.js';

interface CP { name: string; nameAr: string; }

export function buildBoard(
  props: CP[],
  railroads: [CP, CP, CP, CP],
  utilities: [CP, CP],
  tax1: CP & { amount: number },
  tax2: CP & { amount: number },
  chance: CP,
  community: CP,
): BoardSpace[] {
  const p = props;
  const r = railroads;
  const u = utilities;
  return [
    { index: 0,  name: 'GO',             nameAr: 'انطلق',          type: 'go' },
    { index: 1,  ...p[0],  type: 'property', price: 600,  rent: [40,200,600,1800,3200,5000],    houseCost: 500,  hotelCost: 500,  mortgageValue: 300,  colorGroup: 'brown' },
    { index: 2,  ...community,            type: 'community' },
    { index: 3,  ...p[1],  type: 'property', price: 800,  rent: [60,300,900,2700,4000,5500],    houseCost: 500,  hotelCost: 500,  mortgageValue: 400,  colorGroup: 'brown' },
    { index: 4,  name: tax1.name, nameAr: tax1.nameAr, type: 'tax', taxAmount: tax1.amount },
    { index: 5,  ...r[0],  type: 'railroad', price: 2000, mortgageValue: 1000, railroadRent: [250,500,1000,2000] },
    { index: 6,  ...p[2],  type: 'property', price: 1000, rent: [60,300,900,2700,4000,5500],    houseCost: 500,  hotelCost: 500,  mortgageValue: 500,  colorGroup: 'lightblue' },
    { index: 7,  ...chance,               type: 'chance' },
    { index: 8,  ...p[3],  type: 'property', price: 1000, rent: [60,300,900,2700,4000,5500],    houseCost: 500,  hotelCost: 500,  mortgageValue: 500,  colorGroup: 'lightblue' },
    { index: 9,  ...p[4],  type: 'property', price: 1200, rent: [80,400,1000,3000,4500,6000],   houseCost: 500,  hotelCost: 500,  mortgageValue: 600,  colorGroup: 'lightblue' },
    { index: 10, name: 'Jail',            nameAr: 'السجن',          type: 'jail' },
    { index: 11, ...p[5],  type: 'property', price: 1400, rent: [100,500,1500,4500,6250,7500],  houseCost: 1000, hotelCost: 1000, mortgageValue: 700,  colorGroup: 'pink' },
    { index: 12, ...u[0],  type: 'utility',  price: 1500, mortgageValue: 750 },
    { index: 13, ...p[6],  type: 'property', price: 1400, rent: [100,500,1500,4500,6250,7500],  houseCost: 1000, hotelCost: 1000, mortgageValue: 700,  colorGroup: 'pink' },
    { index: 14, ...p[7],  type: 'property', price: 1600, rent: [120,600,1800,5000,7000,9000],  houseCost: 1000, hotelCost: 1000, mortgageValue: 800,  colorGroup: 'pink' },
    { index: 15, ...r[1],  type: 'railroad', price: 2000, mortgageValue: 1000, railroadRent: [250,500,1000,2000] },
    { index: 16, ...p[8],  type: 'property', price: 1800, rent: [140,700,2000,5500,7500,9500],  houseCost: 1000, hotelCost: 1000, mortgageValue: 900,  colorGroup: 'orange' },
    { index: 17, ...community,            type: 'community' },
    { index: 18, ...p[9],  type: 'property', price: 1800, rent: [140,700,2000,5500,7500,9500],  houseCost: 1000, hotelCost: 1000, mortgageValue: 900,  colorGroup: 'orange' },
    { index: 19, ...p[10], type: 'property', price: 2000, rent: [160,800,2200,6000,8000,10000], houseCost: 1000, hotelCost: 1000, mortgageValue: 1000, colorGroup: 'orange' },
    { index: 20, name: 'Free Parking',    nameAr: 'وقوف مجاني',     type: 'free_parking' },
    { index: 21, ...p[11], type: 'property', price: 2200, rent: [180,900,2500,7000,8750,10500], houseCost: 1500, hotelCost: 1500, mortgageValue: 1100, colorGroup: 'red' },
    { index: 22, ...chance,               type: 'chance' },
    { index: 23, ...p[12], type: 'property', price: 2200, rent: [180,900,2500,7000,8750,10500], houseCost: 1500, hotelCost: 1500, mortgageValue: 1100, colorGroup: 'red' },
    { index: 24, ...p[13], type: 'property', price: 2400, rent: [200,1000,3000,7500,9250,11000], houseCost: 1500, hotelCost: 1500, mortgageValue: 1200, colorGroup: 'red' },
    { index: 25, ...r[2],  type: 'railroad', price: 2000, mortgageValue: 1000, railroadRent: [250,500,1000,2000] },
    { index: 26, ...p[14], type: 'property', price: 2600, rent: [220,1100,3300,8000,9750,11500], houseCost: 1500, hotelCost: 1500, mortgageValue: 1300, colorGroup: 'yellow' },
    { index: 27, ...p[15], type: 'property', price: 2600, rent: [220,1100,3300,8000,9750,11500], houseCost: 1500, hotelCost: 1500, mortgageValue: 1300, colorGroup: 'yellow' },
    { index: 28, ...u[1],  type: 'utility',  price: 1500, mortgageValue: 750 },
    { index: 29, ...p[16], type: 'property', price: 2800, rent: [240,1200,3600,8500,10250,12000], houseCost: 1500, hotelCost: 1500, mortgageValue: 1400, colorGroup: 'yellow' },
    { index: 30, name: 'Go to Jail',      nameAr: 'اذهب إلى السجن', type: 'go_to_jail' },
    { index: 31, ...p[17], type: 'property', price: 3000, rent: [260,1300,3900,9000,11000,12750],  houseCost: 2000, hotelCost: 2000, mortgageValue: 1500, colorGroup: 'green' },
    { index: 32, ...p[18], type: 'property', price: 3200, rent: [280,1500,4500,10000,12000,14000],  houseCost: 2000, hotelCost: 2000, mortgageValue: 1600, colorGroup: 'green' },
    { index: 33, ...community,            type: 'community' },
    { index: 34, ...p[19], type: 'property', price: 3400, rent: [300,1600,4800,10500,12500,14750],  houseCost: 2000, hotelCost: 2000, mortgageValue: 1700, colorGroup: 'green' },
    { index: 35, ...r[3],  type: 'railroad', price: 2000, mortgageValue: 1000, railroadRent: [250,500,1000,2000] },
    { index: 36, ...chance,               type: 'chance' },
    { index: 37, ...p[20], type: 'property', price: 3800, rent: [400,1800,5500,12500,15500,18000],  houseCost: 2000, hotelCost: 2000, mortgageValue: 1900, colorGroup: 'darkblue' },
    { index: 38, name: tax2.name, nameAr: tax2.nameAr, type: 'tax', taxAmount: tax2.amount },
    { index: 39, ...p[21], type: 'property', price: 4000, rent: [500,2000,6000,14000,17000,20000],  houseCost: 2000, hotelCost: 2000, mortgageValue: 2000, colorGroup: 'darkblue' },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 28-TILE COUNTRY BOARDS
// Layout mirrors the main board (28 spaces, same corner positions)
// ═══════════════════════════════════════════════════════════════════════════════

const PRICES28  = [1200,1400,1600,1800,2000,2200,2400,2600,2800,3000,3200,3400,3600,4200,5000];
const RENTS28   = [
  [80,   400, 1200, 3000,  4500,  6000],
  [100,  500, 1400, 3500,  5000,  6500],
  [120,  600, 1600, 4000,  5500,  7000],
  [140,  700, 1800, 4500,  6000,  7500],
  [160,  800, 2000, 5000,  7000,  9000],
  [180,  900, 2200, 5500,  7500,  9500],
  [200, 1000, 2500, 6000,  8500, 10500],
  [220, 1100, 3000, 7000,  9500, 11500],
  [240, 1200, 3300, 8000, 10500, 12500],
  [260, 1300, 3900, 9000, 12000, 14000],
  [280, 1500, 4200,10000, 13500, 15000],
  [300, 1600, 4500,11000, 14500, 16000],
  [350, 1800, 5000,12000, 15500, 18000],
  [500, 2000, 6000,14000, 18000, 22000],
  [700, 2500, 7500,18000, 24000, 30000],
];
const HOUSE28   = [500,500,500,500,1000,1000,1000,1000,1000,1500,1500,1500,1500,2000,2000];
const MORT28    = [600,700,800,900,1000,1100,1200,1300,1400,1500,1600,1700,1800,2100,2500];
const GROUPS28  = ['brown','brown','lightblue','lightblue','pink','pink','orange','orange','orange','yellow','yellow','green','green','darkblue','darkblue'] as const;

 export function buildBoard28(
  props: CP[],
  railroads: [CP, CP, CP],
  utilities: [CP, CP],
  tax1: CP & { amount: number },
  tax2: CP & { amount: number },
): BoardSpace[] {
  const p = props;
  const r = railroads;
  const u = utilities;
  const prop = (slot: number): BoardSpace => ({
    index: [1,2,4,5,8,10,12,13,17,18,20,22,24,26,27][slot],
    ...p[slot],
    type: 'property',
    price: PRICES28[slot],
    rent: RENTS28[slot],
    houseCost: HOUSE28[slot],
    hotelCost: HOUSE28[slot],
    mortgageValue: MORT28[slot],
    colorGroup: GROUPS28[slot],
  });
  const rail = (idx: number, cp: CP): BoardSpace => ({
    index: idx, ...cp,
    type: 'railroad', price: 2000, mortgageValue: 1000,
    railroadRent: [400, 800, 1600],
  });
  const util = (idx: number, cp: CP): BoardSpace => ({
    index: idx, ...cp,
    type: 'utility', price: 1500, mortgageValue: 750,
  });

  return [
    { index: 0,  name:'GO',            nameAr:'انطلق',           type:'go' },
    prop(0),
    prop(1),
    { index: 3,  name:'Community Chest',nameAr:'صندوق المجتمع', type:'community' },
    prop(2),
    prop(3),
    rail(6, r[0]),
    { index: 7,  name:'Jail',          nameAr:'السجن',           type:'jail' },
    prop(4),
    { index: 9,  name: tax1.name, nameAr: tax1.nameAr, type:'tax', taxAmount: tax1.amount },
    prop(5),
    util(11, u[0]),
    prop(6),
    prop(7),
    { index: 14, name:'Free Parking',  nameAr:'وقوف مجاني',     type:'free_parking' },
    rail(15, r[1]),
    { index: 16, name:'Chance',        nameAr:'الحظ',            type:'chance' },
    prop(8),
    prop(9),
    util(19, u[1]),
    prop(10),
    { index: 21, name:'Go to Jail',    nameAr:'اذهب إلى السجن', type:'go_to_jail' },
    prop(11),
    { index: 23, name: tax2.name, nameAr: tax2.nameAr, type:'tax', taxAmount: tax2.amount },
    prop(12),
    rail(25, r[2]),
    prop(13),
    prop(14),
  ];
}



// ─── Registry ─────────────────────────────────────────────────────────────────
export const CHALLENGE_BOARDS: Record<string, BoardSpace[]> = {
  tech:           TECH_BOARD,
  fashion:        FASHION_BOARD,
  food:           FOOD_BOARD,
  defense:        DEFENSE_BOARD,
  saudi:          SAUDI_BOARD,
  gulf:           GULF_BOARD,
  gcc:            GCC_BOARD,
  iraq:           IRAQ_BOARD,
  alsham:         AL_SHAM_BOARD,
  syria:          SYRIA_BOARD,
  jordan:         JORDAN_BOARD,
  alsham_syria:   SYRIA_COUNTRY_BOARD,
  alsham_jordan:  JORDAN_COUNTRY_BOARD,
  alsham_lebanon: LEBANON_BOARD,
  gcc_oman:       OMAN_BOARD,
  gcc_qatar:      QATAR_BOARD,
  gcc_uae:        UAE_BOARD,
  gcc_ksa:        KSA_BOARD,
  north_africa:   NORTH_AFRICA_BOARD,
  na_tunisia:     TUNISIA_BOARD,
  na_libya:       LIBYA_BOARD,
  na_morocco:     MOROCCO_BOARD,
  na_algeria:     ALGERIA_BOARD,
  na_egypt:       EGYPT_BOARD,
  persia_azerbaijan: PERSIA_AZERBAIJAN_BOARD,
  persia_kurdistan:  PERSIA_KURDISTAN_BOARD,
  persia_iraq:       PERSIA_IRAQ_BOARD,
  persia_iran:       PERSIA_IRAN_BOARD,
  southasia_india:       SOUTHASIA_INDIA_BOARD,
  southasia_pakistan:    SOUTHASIA_PAKISTAN_BOARD,
  southasia_bangladesh:  SOUTHASIA_BANGLADESH_BOARD,
  southasia_afghanistan: SOUTHASIA_AFGHANISTAN_BOARD,
};
