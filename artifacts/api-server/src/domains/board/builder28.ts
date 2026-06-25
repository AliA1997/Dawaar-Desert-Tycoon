import type { BoardSpace } from './data.js';

interface CP { name: string; nameAr: string; }

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
    { index: 14, name:'Picnic',        nameAr:'نزهة',           type:'free_parking' },
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
