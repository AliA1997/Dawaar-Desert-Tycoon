import type { BoardSpace } from './board.js';

interface CP { name: string; nameAr: string; }

function buildBoard(
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

// ─── Industry: Silicon Souq (Tech) ────────────────────────────────────────────
const TECH_BOARD = buildBoard(
  [
    { name: 'Maktobb',        nameAr: 'مكتوب' },
    { name: 'Wamda',          nameAr: 'وامضة' },
    { name: 'Fetchrr',        nameAr: 'فيتشر' },
    { name: 'Yallaah',        nameAr: 'يلا' },
    { name: 'Anghami+',       nameAr: 'أنغامي+' },
    { name: 'Ziina Pay',      nameAr: 'زينة باي' },
    { name: 'Tabbyy',         nameAr: 'تابي' },
    { name: 'Sarwaa',         nameAr: 'ثروة' },
    { name: 'Sooq.net',       nameAr: 'سوق.نت' },
    { name: 'Noonn',          nameAr: 'نون' },
    { name: 'Careezm',        nameAr: 'كريزم' },
    { name: 'Talabaat',       nameAr: 'طلبات' },
    { name: 'HungerZ',        nameAr: 'هانقرز' },
    { name: 'Swvvl',          nameAr: 'سويفل' },
    { name: 'Jeenee',         nameAr: 'جيني' },
    { name: 'Fawwry',         nameAr: 'فوري' },
    { name: 'Baraakaa',       nameAr: 'بركة' },
    { name: 'Foodiccs',       nameAr: 'فوديكس' },
    { name: 'Unifonicc',      nameAr: 'يونيفونيك' },
    { name: 'Baytt.com',      nameAr: 'بيت.كوم' },
    { name: 'Careeym',        nameAr: 'كريم' },
    { name: 'Amazoon Arabia', nameAr: 'أمازون العرب' },
  ],
  [
    { name: 'Dubai Internet City Hub', nameAr: 'مركز دبي للإنترنت' },
    { name: 'KAFD Tech District',      nameAr: 'مجمع كافد التقني' },
    { name: 'Amman Digital Hub',       nameAr: 'مركز عمّان الرقمي' },
    { name: 'Cairo Innovation Zone',   nameAr: 'منطقة القاهرة للابتكار' },
  ],
  [
    { name: 'Gulf Cloud Network',  nameAr: 'شبكة الغيوم الخليجية' },
    { name: 'Nile Data Centres',   nameAr: 'مراكز بيانات النيل' },
  ],
  { name: 'Software License Tax', nameAr: 'ضريبة رخص البرامج',   amount: 500 },
  { name: 'Data Breach Penalty',  nameAr: 'غرامة اختراق البيانات', amount: 2000 },
  { name: 'Startup Roulette',     nameAr: 'روليت الشركات الناشئة' },
  { name: 'Enterprise Fund',      nameAr: 'صندوق المشاريع' },
);

// ─── Industry: Fashion Week (Clothing) ────────────────────────────────────────
const FASHION_BOARD = buildBoard(
  [
    { name: "Deena's Closet",  nameAr: 'خزانة دينا' },
    { name: 'Moda Siti',       nameAr: 'موضة سيتي' },
    { name: 'Sun & Saand',     nameAr: 'صن آند صاند' },
    { name: 'Brandz4Less',     nameAr: 'براندز للأقل' },
    { name: 'Trendz Mall',     nameAr: 'ترندز مول' },
    { name: 'Rivoly',          nameAr: 'ريفولي' },
    { name: 'Modanisaa',       nameAr: 'مودانيسا' },
    { name: 'Al-Modaa',        nameAr: 'المودة' },
    { name: 'Splassh',         nameAr: 'سبلاش' },
    { name: 'Level Shooes',    nameAr: 'ليفل شوز' },
    { name: 'Diyafa Fashion',  nameAr: 'ضيافة فاشون' },
    { name: 'Zaraa ME',        nameAr: 'زارا الشرق الأوسط' },
    { name: 'Mangoo ME',       nameAr: 'مانغو الشرق الأوسط' },
    { name: 'Beymannn',        nameAr: 'بيمان' },
    { name: 'H&MM ME',         nameAr: 'H&M الشرق الأوسط' },
    { name: 'Massimoo',        nameAr: 'ماسيمو' },
    { name: 'Primarkk',        nameAr: 'برايمارك' },
    { name: 'Zalandoo ME',     nameAr: 'زالاندو الشرق الأوسط' },
    { name: 'FarFetchh',       nameAr: 'فارفيتش' },
    { name: 'Net-A-Porteer',   nameAr: 'نت-أ-بورتر' },
    { name: 'Louisss Vitton',  nameAr: 'لويس فيتون' },
    { name: 'Guccii Arabia',   nameAr: 'غوتشي العربية' },
  ],
  [
    { name: 'Dubai Mall Fashion Walk',  nameAr: 'واجهة دبي مول' },
    { name: 'Riyadh Park Mall',         nameAr: 'ريياض بارك مول' },
    { name: 'The Avenues Kuwait',       nameAr: 'ذا أفنيوز الكويت' },
    { name: 'Mall of Arabia Egypt',     nameAr: 'مول أوف أرابيا' },
  ],
  [
    { name: 'Gulf Textile Mills', nameAr: 'مصانع النسيج الخليجية' },
    { name: 'Nile Cotton Co.',    nameAr: 'شركة قطن النيل' },
  ],
  { name: 'Import Duty Tax',       nameAr: 'ضريبة الاستيراد',          amount: 500 },
  { name: 'Fashion Licensing Fee', nameAr: 'رسوم ترخيص الأزياء',       amount: 2000 },
  { name: 'Style Lottery',         nameAr: 'يانصيب الستايل' },
  { name: 'Fashion Fund',          nameAr: 'صندوق الأزياء' },
);

// ─── Industry: Street Flavors (Food & Beverage) ───────────────────────────────
const FOOD_BOARD = buildBoard(
  [
    { name: 'Karak Housee',      nameAr: 'بيت الكرك' },
    { name: 'Baladii Burgers',   nameAr: 'برغر البلدي' },
    { name: 'Shawarmer',         nameAr: 'شاورمر' },
    { name: 'Al-Baiikk',        nameAr: 'البيك' },
    { name: 'Kuduu',             nameAr: 'كودو' },
    { name: 'Papa Johnzz',       nameAr: 'بابا جونز' },
    { name: "Hardee'z ME",       nameAr: 'هارديز الشرق الأوسط' },
    { name: 'Burger Bashaa',     nameAr: 'برغر باشا' },
    { name: 'Starbuckees ME',    nameAr: 'ستاربيكس الشرق الأوسط' },
    { name: 'Costa Coffii ME',   nameAr: 'كوستا كافيه' },
    { name: "Dunkin' Arabiya",   nameAr: 'دنكن العربية' },
    { name: 'Tazaa Bowl',        nameAr: 'طازة بول' },
    { name: 'Maestro Pizza',     nameAr: 'مايسترو بيتزا' },
    { name: 'Mooza Desserts',    nameAr: 'موزة للحلويات' },
    { name: 'Savola Foods',      nameAr: 'صافولا للأغذية' },
    { name: 'Agthiaa Group',     nameAr: 'أجتيا للمجموعة' },
    { name: 'Bayara Foods',      nameAr: 'بياره للأغذية' },
    { name: 'Nandoos ME',        nameAr: 'ناندوز الشرق الأوسط' },
    { name: 'Texas Chickenn ME', nameAr: 'تكساس تشيكن' },
    { name: 'KFZ Arabia',        nameAr: 'كي إف زد العربية' },
    { name: 'Almaraii',          nameAr: 'المراعي' },
    { name: "McDonald'zz ME",    nameAr: 'ماكدونالدز الشرق الأوسط' },
  ],
  [
    { name: 'Al-Khobar Food Expo Hub', nameAr: 'مركز تصدير الخبر' },
    { name: 'Jeddah Food Terminal',    nameAr: 'محطة جدة للأغذية' },
    { name: 'Dubai Food Festival Hub', nameAr: 'مركز دبي للأغذية' },
    { name: 'Cairo Distribution Hub',  nameAr: 'مركز توزيع القاهرة' },
  ],
  [
    { name: 'Gulf Cold Storage Co.', nameAr: 'شركة الخليج للتبريد' },
    { name: 'Nile Agri Supply',      nameAr: 'إمدادات النيل الزراعية' },
  ],
  { name: 'VAT on Food & Beverages', nameAr: 'ضريبة المواد الغذائية', amount: 500 },
  { name: 'Health Inspection Fine',  nameAr: 'غرامة التفتيش الصحي',   amount: 2000 },
  { name: 'Taste the Luck',          nameAr: 'تذوق الحظ' },
  { name: 'Community Kitchen Fund',  nameAr: 'صندوق المطبخ المجتمعي' },
);

// ─── Industry: Iron Desert (Defense & Weapons) ────────────────────────────────
const DEFENSE_BOARD = buildBoard(
  [
    { name: 'Tawazunn Holdings',     nameAr: 'توازن القابضة' },
    { name: 'Burkan Munitionns',     nameAr: 'بركان للذخائر' },
    { name: 'NIMRR Armored',         nameAr: 'نمر المدرعة' },
    { name: 'Al Jabbrr Systems',     nameAr: 'الجابر سيستمز' },
    { name: 'Saab ME',               nameAr: 'ساب الشرق الأوسط' },
    { name: 'Karakal Intl',          nameAr: 'قراقل الدولية' },
    { name: 'Halcoon',               nameAr: 'حلقون' },
    { name: 'Emirates Def Tech',     nameAr: 'تقنيات الدفاع الإماراتية' },
    { name: 'BAE Systms ME',         nameAr: 'BAE سيستمز' },
    { name: 'Rheinmetalll ME',       nameAr: 'راينميتال' },
    { name: 'Thalesss ME',           nameAr: 'ثاليس' },
    { name: 'L3Harriss ME',          nameAr: 'إل٣ هاريس' },
    { name: 'Raytheonn ME',          nameAr: 'ريثيون' },
    { name: 'Boeengg Defense',       nameAr: 'بوينغ دفاع' },
    { name: 'Airbus Def. ME',        nameAr: 'إيرباص دفاع' },
    { name: 'Leeonardo ME',          nameAr: 'ليوناردو' },
    { name: 'General Dyynamics ME',  nameAr: 'جنرال ديناميكس' },
    { name: 'Lockheed ME',           nameAr: 'لوكهيد' },
    { name: 'Northrop Grummann',     nameAr: 'نورثروب غرومان' },
    { name: 'Jordaan Aerospace',     nameAr: 'الفضاء الجوي الأردني' },
    { name: 'SAMII',                 nameAr: 'سامي' },
    { name: 'EDGEE Group',           nameAr: 'مجموعة إيدج' },
  ],
  [
    { name: 'Al Udeid Logistics Hub',     nameAr: 'مركز لوجستيات العديد' },
    { name: 'King Fahd Base Supply',      nameAr: 'مؤن قاعدة الملك فهد' },
    { name: 'Al Dhafra Defense Hub',      nameAr: 'مركز الدفاع الضفرة' },
    { name: 'Muwaffaq Salti Logistics',   nameAr: 'لوجستيات مفرق' },
  ],
  [
    { name: 'Gulf Explosives Testing',   nameAr: 'مختبر متفجرات الخليج' },
    { name: 'Desert Drone Test Range',   nameAr: 'ميدان طائرات الصحراء' },
  ],
  { name: 'Defense Procurement Tax', nameAr: 'ضريبة المشتريات الدفاعية', amount: 500 },
  { name: 'Arms Export License',     nameAr: 'رخصة تصدير الأسلحة',        amount: 2000 },
  { name: 'War Games Lottery',       nameAr: 'يانصيب مناورات الحرب' },
  { name: 'Defense Fund',            nameAr: 'صندوق الدفاع' },
);

// ─── Country: Kingdom of Jordan ───────────────────────────────────────────────
const JORDAN_BOARD = buildBoard(
  [
    { name: 'Tafilah',          nameAr: 'الطفيلة' },
    { name: 'Ramtha',           nameAr: 'الرمثا' },
    { name: 'Ruseifa',          nameAr: 'الرصيفة' },
    { name: 'Mafraq',           nameAr: 'المفرق' },
    { name: "Ma'an",            nameAr: 'معان' },
    { name: 'Ajloun',           nameAr: 'عجلون' },
    { name: 'Madaba',           nameAr: 'مادبا' },
    { name: 'Zarqa',            nameAr: 'الزرقاء' },
    { name: 'Karak',            nameAr: 'الكرك' },
    { name: 'Salt',             nameAr: 'السلط' },
    { name: 'Balqa',            nameAr: 'البلقاء' },
    { name: 'Irbid',            nameAr: 'إربد' },
    { name: 'Umm Qais',         nameAr: 'أم قيس' },
    { name: 'Jerash',           nameAr: 'جرش' },
    { name: 'Dead Sea Area',    nameAr: 'منطقة البحر الميت' },
    { name: 'Wadi Rum',         nameAr: 'وادي رم' },
    { name: 'Aqaba',            nameAr: 'العقبة' },
    { name: 'Petra',            nameAr: 'البتراء' },
    { name: 'Abdali District',  nameAr: 'منطقة الأبدلي' },
    { name: 'Amman East',       nameAr: 'شرق عمّان' },
    { name: 'West Amman',       nameAr: 'غرب عمّان' },
    { name: 'Amman',            nameAr: 'عمّان' },
  ],
  [
    { name: 'Queen Alia International', nameAr: 'مطار الملكة علياء الدولي' },
    { name: 'Aqaba King Hussein Airport', nameAr: 'مطار العقبة الملك حسين' },
    { name: "Ma'an Airport",            nameAr: 'مطار معان' },
    { name: 'Prince Hashim Airport',    nameAr: 'مطار الأمير هاشم' },
  ],
  [
    { name: 'Jordan Water Authority',  nameAr: 'سلطة المياه الأردنية' },
    { name: 'Jordan Electric Power',   nameAr: 'الطاقة الكهربائية الأردنية' },
  ],
  { name: 'Income Tax',        nameAr: 'ضريبة الدخل',       amount: 500 },
  { name: 'Land Transfer Tax', nameAr: 'ضريبة نقل الأراضي', amount: 2000 },
  { name: 'Desert Fortune',    nameAr: 'حظ الصحراء' },
  { name: 'Jordan Dev. Fund',  nameAr: 'صندوق التنمية الأردني' },
);

// ─── Country: Saudi Arabia ────────────────────────────────────────────────────
const SAUDI_BOARD = buildBoard(
  [
    { name: 'Dawadmi',    nameAr: 'الدوادمي' },
    { name: 'Al-Wajh',   nameAr: 'الوجه' },
    { name: 'Sakakah',   nameAr: 'سكاكا' },
    { name: 'Al Baha',   nameAr: 'الباحة' },
    { name: 'Bisha',     nameAr: 'بيشة' },
    { name: 'Najran',    nameAr: 'نجران' },
    { name: "Ha'il",     nameAr: 'حائل' },
    { name: 'Al Qatif',  nameAr: 'القطيف' },
    { name: 'Jizan',     nameAr: 'جيزان' },
    { name: 'Yanbu',     nameAr: 'ينبع' },
    { name: 'Taif',      nameAr: 'الطائف' },
    { name: 'Abha',      nameAr: 'أبها' },
    { name: 'Jubail',    nameAr: 'الجبيل' },
    { name: 'Dhahran',   nameAr: 'الظهران' },
    { name: 'Tabuk',     nameAr: 'تبوك' },
    { name: 'Khobar',    nameAr: 'الخبر' },
    { name: 'Dammam',    nameAr: 'الدمام' },
    { name: 'NEOM',      nameAr: 'نيوم' },
    { name: 'Al Ula',    nameAr: 'العُلا' },
    { name: 'Jeddah',    nameAr: 'جدة' },
    { name: 'Riyadh',    nameAr: 'الرياض' },
    { name: 'Mecca',     nameAr: 'مكة المكرمة' },
  ],
  [
    { name: 'King Khalid International',          nameAr: 'مطار الملك خالد الدولي' },
    { name: 'King Abdulaziz International',        nameAr: 'مطار الملك عبدالعزيز الدولي' },
    { name: 'King Fahd International',             nameAr: 'مطار الملك فهد الدولي' },
    { name: 'Prince Muhammad Bin Abdulaziz Intl', nameAr: 'مطار الأمير محمد بن عبدالعزيز' },
  ],
  [
    { name: 'Saudi Electricity',  nameAr: 'الكهرباء السعودية' },
    { name: 'National Water Co.', nameAr: 'الشركة الوطنية للمياه' },
  ],
  { name: 'Zakat al-Tijarah',   nameAr: 'زكاة التجارة',             amount: 500 },
  { name: 'Oil Revenue Tax',    nameAr: 'ضريبة الإيرادات النفطية',   amount: 2000 },
  { name: 'Vision 2030 Opportunity', nameAr: 'فرصة رؤية ٢٠٣٠' },
  { name: 'Saudi Dev. Fund',    nameAr: 'صندوق التنمية السعودي' },
);

// ─── Country: Syria ───────────────────────────────────────────────────────────
const SYRIA_BOARD = buildBoard(
  [
    { name: 'Al-Hasakah',         nameAr: 'الحسكة' },
    { name: 'Qamishli',           nameAr: 'القامشلي' },
    { name: 'Raqqa',              nameAr: 'الرقة' },
    { name: 'Idlib',              nameAr: 'إدلب' },
    { name: 'Daraa',              nameAr: 'درعا' },
    { name: 'Deir ez-Zor',        nameAr: 'دير الزور' },
    { name: 'Al-Suwayda',         nameAr: 'السويداء' },
    { name: 'Tartus',             nameAr: 'طرطوس' },
    { name: 'Hama',               nameAr: 'حماه' },
    { name: 'Homs',               nameAr: 'حمص' },
    { name: 'Latakia',            nameAr: 'اللاذقية' },
    { name: 'Maaloula',           nameAr: 'معلولا' },
    { name: 'Bosra',              nameAr: 'بصرى' },
    { name: 'Krak des Chevaliers',nameAr: 'قلعة الحصن' },
    { name: 'Ugarit',             nameAr: 'أوغاريت' },
    { name: 'Palmyra',            nameAr: 'تدمر' },
    { name: 'Aleppo',             nameAr: 'حلب' },
    { name: 'Aleppo Old City',    nameAr: 'حلب القديمة' },
    { name: 'Apamea',             nameAr: 'أفاميا' },
    { name: 'Damascus',           nameAr: 'دمشق' },
    { name: 'Damascus Old City',  nameAr: 'دمشق القديمة' },
    { name: 'Damascus CBD',       nameAr: 'قلب دمشق' },
  ],
  [
    { name: 'Damascus International Airport', nameAr: 'مطار دمشق الدولي' },
    { name: 'Aleppo International Airport',   nameAr: 'مطار حلب الدولي' },
    { name: 'Latakia Port Rail',              nameAr: 'سكة ميناء اللاذقية' },
    { name: 'Deir ez-Zor Airport',            nameAr: 'مطار دير الزور' },
  ],
  [
    { name: 'Syrian Electric Co.',     nameAr: 'الكهرباء السورية' },
    { name: 'Euphrates Water Auth.',   nameAr: 'هيئة مياه الفرات' },
  ],
  { name: 'Reconstruction Tax',     nameAr: 'ضريبة إعادة الإعمار',    amount: 500 },
  { name: 'Heritage Preservation',  nameAr: 'رسوم الحفاظ على التراث', amount: 2000 },
  { name: 'Desert Chance',          nameAr: 'حظ الصحراء' },
  { name: 'Syria Rebuild Fund',     nameAr: 'صندوق إعادة إعمار سوريا' },
);

// ─── Country: Gulf States ─────────────────────────────────────────────────────
const GULF_BOARD = buildBoard(
  [
    { name: 'Umm Al Quwain',      nameAr: 'أم القيوين' },
    { name: 'Sur',                nameAr: 'صور' },
    { name: 'Ajman',              nameAr: 'عجمان' },
    { name: 'Fujairah',           nameAr: 'الفجيرة' },
    { name: 'Ras Al Khaimah',     nameAr: 'رأس الخيمة' },
    { name: 'Salalah',            nameAr: 'صلالة' },
    { name: 'Muharraq',           nameAr: 'المحرق' },
    { name: 'Sohar',              nameAr: 'صحار' },
    { name: 'Muscat',             nameAr: 'مسقط' },
    { name: 'Manama',             nameAr: 'المنامة' },
    { name: 'Sharjah',            nameAr: 'الشارقة' },
    { name: 'Kuwait City',        nameAr: 'مدينة الكويت' },
    { name: 'Yas Island',         nameAr: 'جزيرة ياس' },
    { name: 'Lusail',             nameAr: 'لوسيل' },
    { name: 'The Pearl Qatar',    nameAr: 'لؤلؤة قطر' },
    { name: 'Saadiyat Island',    nameAr: 'جزيرة السعديات' },
    { name: 'Doha',               nameAr: 'الدوحة' },
    { name: 'Dubai Marina',       nameAr: 'مرسى دبي' },
    { name: 'DIFC Dubai',         nameAr: 'مركز دبي المالي الدولي' },
    { name: 'Palm Jumeirah',      nameAr: 'نخلة جميرا' },
    { name: 'Abu Dhabi CBD',      nameAr: 'مركز أبوظبي المالي' },
    { name: 'Dubai Downtown',     nameAr: 'وسط دبي' },
  ],
  [
    { name: 'Dubai International (DXB)',  nameAr: 'مطار دبي الدولي' },
    { name: 'Abu Dhabi International (AUH)', nameAr: 'مطار أبوظبي الدولي' },
    { name: 'Hamad International (DOH)',  nameAr: 'مطار حمد الدولي' },
    { name: 'Kuwait International Airport', nameAr: 'مطار الكويت الدولي' },
  ],
  [
    { name: 'Gulf Energy Corp.',     nameAr: 'شركة الطاقة الخليجية' },
    { name: 'Gulf Desalination Co.', nameAr: 'شركة تحلية الخليج' },
  ],
  { name: 'Gulf VAT',           nameAr: 'ضريبة القيمة المضافة الخليجية', amount: 500 },
  { name: 'Luxury Property Tax',nameAr: 'ضريبة العقارات الفاخرة',         amount: 2000 },
  { name: 'Gulf Opportunity',   nameAr: 'فرصة خليجية' },
  { name: 'Gulf Dev. Fund',     nameAr: 'صندوق التنمية الخليجي' },
);

// ─── Challenge: GCC (Gulf Cooperation Council) ────────────────────────────────
const GCC_BOARD = buildBoard(
  [
    { name: 'Al Khobar',        nameAr: 'الخبر' },
    { name: 'Sohar',            nameAr: 'صحار' },
    { name: 'Fujairah',         nameAr: 'الفجيرة' },
    { name: 'Ras Al Khaimah',   nameAr: 'رأس الخيمة' },
    { name: 'Salalah',          nameAr: 'صلالة' },
    { name: 'Muscat',           nameAr: 'مسقط' },
    { name: 'Al Ain',           nameAr: 'العين' },
    { name: 'Sharjah',          nameAr: 'الشارقة' },
    { name: 'Muscat CBD',       nameAr: 'مسقط المالي' },
    { name: 'The Pearl Qatar',  nameAr: 'لؤلؤة قطر' },
    { name: 'Lusail',           nameAr: 'لوسيل' },
    { name: 'Tabuk',            nameAr: 'تبوك' },
    { name: 'Dammam',           nameAr: 'الدمام' },
    { name: 'Jubail',           nameAr: 'الجبيل' },
    { name: 'NEOM',             nameAr: 'نيوم' },
    { name: 'Jeddah',           nameAr: 'جدة' },
    { name: 'Doha',             nameAr: 'الدوحة' },
    { name: 'Riyadh',           nameAr: 'الرياض' },
    { name: 'Dubai Marina',     nameAr: 'مرسى دبي' },
    { name: 'Palm Jumeirah',    nameAr: 'نخلة جميرا' },
    { name: 'Abu Dhabi',        nameAr: 'أبوظبي' },
    { name: 'Dubai Downtown',   nameAr: 'وسط دبي' },
  ],
  [
    { name: 'King Abdulaziz International', nameAr: 'مطار الملك عبدالعزيز' },
    { name: 'Dubai International (DXB)',    nameAr: 'مطار دبي الدولي' },
    { name: 'Hamad International (DOH)',    nameAr: 'مطار حمد الدولي' },
    { name: 'Muscat International (MCT)',   nameAr: 'مطار مسقط الدولي' },
  ],
  [
    { name: 'GCC Power Grid',     nameAr: 'الشبكة الكهربائية الخليجية' },
    { name: 'GCC Water Network',  nameAr: 'شبكة المياه الخليجية' },
  ],
  { name: 'GCC VAT',            nameAr: 'ضريبة القيمة المضافة',        amount: 500 },
  { name: 'Luxury Property Tax',nameAr: 'ضريبة العقارات الفاخرة',      amount: 2000 },
  { name: 'Gulf Opportunity',   nameAr: 'فرصة خليجية' },
  { name: 'GCC Dev. Fund',      nameAr: 'صندوق التنمية الخليجي' },
);

// ─── Challenge: Al Sham (Jordan, Syria, Lebanon) ───────────────────────────────
const AL_SHAM_BOARD = buildBoard(
  [
    { name: 'Zarqa',            nameAr: 'الزرقاء' },
    { name: 'Irbid',            nameAr: 'إربد' },
    { name: 'Tartus',           nameAr: 'طرطوس' },
    { name: 'Latakia',          nameAr: 'اللاذقية' },
    { name: 'Tripoli LB',       nameAr: 'طرابلس' },
    { name: 'Sidon',            nameAr: 'صيدا' },
    { name: 'Homs',             nameAr: 'حمص' },
    { name: 'Tyre',             nameAr: 'صور' },
    { name: 'Hama',             nameAr: 'حماه' },
    { name: 'Palmyra',          nameAr: 'تدمر' },
    { name: 'Krak des Chevaliers', nameAr: 'قلعة الحصن' },
    { name: 'Dead Sea',         nameAr: 'البحر الميت' },
    { name: 'Wadi Rum',         nameAr: 'وادي رم' },
    { name: 'Aqaba',            nameAr: 'العقبة' },
    { name: 'Aleppo',           nameAr: 'حلب' },
    { name: 'Byblos',           nameAr: 'جبيل' },
    { name: 'Petra',            nameAr: 'البتراء' },
    { name: 'Damascus',         nameAr: 'دمشق' },
    { name: 'Amman',            nameAr: 'عمّان' },
    { name: 'Beirut Downtown',  nameAr: 'وسط بيروت' },
    { name: 'Beirut Corniche',  nameAr: 'كورنيش بيروت' },
    { name: 'West Amman',       nameAr: 'غرب عمّان' },
  ],
  [
    { name: 'Queen Alia Intl Airport',  nameAr: 'مطار الملكة علياء' },
    { name: 'Damascus International',   nameAr: 'مطار دمشق الدولي' },
    { name: 'Beirut Rafic Hariri Intl', nameAr: 'مطار رفيق الحريري' },
    { name: 'Aleppo International',     nameAr: 'مطار حلب الدولي' },
  ],
  [
    { name: 'Levant Electric Co.',    nameAr: 'شركة كهرباء الشام' },
    { name: 'Jordan River Authority', nameAr: 'هيئة نهر الأردن' },
  ],
  { name: 'Income Tax',        nameAr: 'ضريبة الدخل',              amount: 500 },
  { name: 'Heritage Tax',      nameAr: 'رسوم الحفاظ على التراث',   amount: 2000 },
  { name: 'Sham Fortune',      nameAr: 'حظ بلاد الشام' },
  { name: 'Sham Dev. Fund',    nameAr: 'صندوق تنمية الشام' },
);

// ─── Challenge: North Africa ──────────────────────────────────────────────────
const NORTH_AFRICA_BOARD = buildBoard(
  [
    { name: 'Tobruk',           nameAr: 'طبرق' },
    { name: 'Benghazi',         nameAr: 'بنغازي' },
    { name: 'Bizerte',          nameAr: 'بنزرت' },
    { name: 'Sfax',             nameAr: 'صفاقس' },
    { name: 'Sousse',           nameAr: 'سوسة' },
    { name: 'Oran',             nameAr: 'وهران' },
    { name: 'Constantine',      nameAr: 'قسنطينة' },
    { name: 'Annaba',           nameAr: 'عنابة' },
    { name: 'Luxor',            nameAr: 'الأقصر' },
    { name: 'Aswan',            nameAr: 'أسوان' },
    { name: 'Port Said',        nameAr: 'بورسعيد' },
    { name: 'Tripoli LY',       nameAr: 'طرابلس الغرب' },
    { name: 'Fes',              nameAr: 'فاس' },
    { name: 'Marrakech',        nameAr: 'مراكش' },
    { name: 'Tunis',            nameAr: 'تونس' },
    { name: 'Algiers',          nameAr: 'الجزائر' },
    { name: 'Alexandria',       nameAr: 'الإسكندرية' },
    { name: 'Casablanca',       nameAr: 'الدار البيضاء' },
    { name: 'Cairo Old City',   nameAr: 'القاهرة التاريخية' },
    { name: 'Rabat',            nameAr: 'الرباط' },
    { name: 'Cairo Corniche',   nameAr: 'كورنيش القاهرة' },
    { name: 'Cairo CBD',        nameAr: 'قلب القاهرة' },
  ],
  [
    { name: 'Cairo International Airport', nameAr: 'مطار القاهرة الدولي' },
    { name: 'Mohammed V (CMN)',            nameAr: 'مطار محمد الخامس' },
    { name: 'Algiers Houari Boumediene',   nameAr: 'مطار هواري بومدين' },
    { name: 'Tunis-Carthage Airport',      nameAr: 'مطار تونس قرطاج' },
  ],
  [
    { name: 'Nile Delta Power',   nameAr: 'طاقة دلتا النيل' },
    { name: 'Maghreb Water Co.',  nameAr: 'شركة مياه المغرب العربي' },
  ],
  { name: 'Trade Tax',        nameAr: 'ضريبة التجارة',         amount: 500 },
  { name: 'Nile Revenue Tax', nameAr: 'ضريبة إيرادات النيل',  amount: 2000 },
  { name: 'Nile Fortune',     nameAr: 'حظ النيل' },
  { name: 'North Africa Fund',nameAr: 'صندوق شمال أفريقيا' },
);

// ─── Challenge: Iraq ──────────────────────────────────────────────────────────
const IRAQ_BOARD = buildBoard(
  [
    { name: 'Al-Fallujah',     nameAr: 'الفلوجة' },
    { name: 'Tikrit',          nameAr: 'تكريت' },
    { name: 'Kirkuk',          nameAr: 'كركوك' },
    { name: 'Ramadi',          nameAr: 'الرمادي' },
    { name: 'Al-Amarah',       nameAr: 'العمارة' },
    { name: 'Al-Nasiriyah',    nameAr: 'الناصرية' },
    { name: 'Mosul Old City',  nameAr: 'الموصل القديمة' },
    { name: 'Sulaymaniyah',    nameAr: 'السليمانية' },
    { name: 'Duhok',           nameAr: 'دهوك' },
    { name: 'Al-Hillah',       nameAr: 'الحلة' },
    { name: 'Kut',             nameAr: 'الكوت' },
    { name: 'Karbala',         nameAr: 'كربلاء' },
    { name: 'Najaf',           nameAr: 'النجف' },
    { name: 'Samarra',         nameAr: 'سامراء' },
    { name: 'Mosul',           nameAr: 'الموصل' },
    { name: 'Basra Port',      nameAr: 'ميناء البصرة' },
    { name: 'Erbil Modern',    nameAr: 'أربيل الحديثة' },
    { name: 'Basra CBD',       nameAr: 'قلب البصرة' },
    { name: 'Baghdad Al-Karkh',nameAr: 'بغداد الكرخ' },
    { name: 'Baghdad Al-Rusafa',nameAr: 'بغداد الرصافة' },
    { name: 'Baghdad Al-Mansour',nameAr: 'بغداد المنصور' },
    { name: 'Baghdad CBD',     nameAr: 'قلب بغداد' },
  ],
  [
    { name: 'Baghdad International Airport', nameAr: 'مطار بغداد الدولي' },
    { name: 'Basra International Airport',   nameAr: 'مطار البصرة الدولي' },
    { name: 'Erbil International Airport',   nameAr: 'مطار أربيل الدولي' },
    { name: 'Sulaymaniyah Airport',          nameAr: 'مطار السليمانية' },
  ],
  [
    { name: 'Diyala Water Authority', nameAr: 'هيئة مياه ديالى' },
    { name: 'Iraq National Grid',     nameAr: 'الشبكة الكهربائية العراقية' },
  ],
  { name: 'Oil Revenue Tax',   nameAr: 'ضريبة الإيرادات النفطية',  amount: 500 },
  { name: 'Reconstruction Tax',nameAr: 'ضريبة إعادة الإعمار',      amount: 2000 },
  { name: 'Tigris Fortune',    nameAr: 'حظ دجلة' },
  { name: 'Iraq Dev. Fund',    nameAr: 'صندوق التنمية العراقي' },
);

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

function buildBoard28(
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

// ─── GCC: Oman ────────────────────────────────────────────────────────────────
const OMAN_BOARD = buildBoard28(
  [
    { name:'Ibri',          nameAr:'إبراء' },
    { name:'Nizwa',         nameAr:'نزوى' },
    { name:'Sur',           nameAr:'صور' },
    { name:'Sohar',         nameAr:'صحار' },
    { name:'Salalah',       nameAr:'صلالة' },
    { name:'Rustaq',        nameAr:'رستاق' },
    { name:'Bahla',         nameAr:'بهلاء' },
    { name:'Adam',          nameAr:'آدم' },
    { name:'Khasab',        nameAr:'خصب' },
    { name:'Barka',         nameAr:'بركاء' },
    { name:'Seeb',          nameAr:'السيب' },
    { name:'Muttrah',       nameAr:'مطرح' },
    { name:'Ruwi',          nameAr:'الروي' },
    { name:'Old Muscat',    nameAr:'مسقط القديمة' },
    { name:'Muscat',        nameAr:'مسقط' },
  ],
  [
    { name:'Oman Rail',         nameAr:'سكة عُمان' },
    { name:'Muscat Metro',      nameAr:'مترو مسقط' },
    { name:'Gulf Railway',      nameAr:'قطار الخليج' },
  ],
  [
    { name:'OIFC Water',        nameAr:'مياه عُمان' },
    { name:'OPAL Energy',       nameAr:'طاقة عُمان' },
  ],
  { name:'Zakat',               nameAr:'زكاة',              amount: 500 },
  { name:'Oil Tax',             nameAr:'ضريبة النفط',       amount: 2000 },
);

// ─── GCC: Qatar ───────────────────────────────────────────────────────────────
const QATAR_BOARD = buildBoard28(
  [
    { name:'Dukhan',        nameAr:'الدخان' },
    { name:'Al Shamal',     nameAr:'الشمال' },
    { name:'Al-Khor',       nameAr:'الخور' },
    { name:'Al Wakrah',     nameAr:'الوكرة' },
    { name:'Mesaieed',      nameAr:'مسيعيد' },
    { name:'Barwa City',    nameAr:'مدينة برواء' },
    { name:'Al Rayyan',     nameAr:'الريان' },
    { name:'Abu Samra',     nameAr:'أبو سمرة' },
    { name:'Al Kheesa',     nameAr:'الخيسة' },
    { name:'Lusail',        nameAr:'لوسيل' },
    { name:'Al Wukair',     nameAr:'الوكير' },
    { name:'Hamad Town',    nameAr:'مدينة حمد' },
    { name:'The Pearl',     nameAr:'اللؤلؤة' },
    { name:'Al Sadd',       nameAr:'السد' },
    { name:'Doha',          nameAr:'الدوحة' },
  ],
  [
    { name:'Qatar Rail',        nameAr:'قطار قطر' },
    { name:'Doha Metro',        nameAr:'مترو الدوحة' },
    { name:'Al Shamal Rail',    nameAr:'قطار الشمال' },
  ],
  [
    { name:'KAHRAMAA Water',    nameAr:'كهرماء' },
    { name:'Qatar Gas',         nameAr:'قطر غاز' },
  ],
  { name:'Zakat',               nameAr:'زكاة',              amount: 500 },
  { name:'Petroleum Tax',       nameAr:'ضريبة البترول',     amount: 2000 },
);

// ─── GCC: UAE ─────────────────────────────────────────────────────────────────
const UAE_BOARD = buildBoard28(
  [
    { name:'Umm Al Quwain',    nameAr:'أم القيوين' },
    { name:'Ajman',            nameAr:'عجمان' },
    { name:'Fujairah',         nameAr:'الفجيرة' },
    { name:'Ras Al Khaimah',   nameAr:'رأس الخيمة' },
    { name:'Al Ain',           nameAr:'العين' },
    { name:'Sharjah',          nameAr:'الشارقة' },
    { name:'Musaffah',         nameAr:'مصفح' },
    { name:'Al Barsha',        nameAr:'البرشاء' },
    { name:'Deira',            nameAr:'ديرة' },
    { name:'Abu Dhabi',        nameAr:'أبوظبي' },
    { name:'Bur Dubai',        nameAr:'بر دبي' },
    { name:'Palm Jumeirah',    nameAr:'نخلة جميرا' },
    { name:'Dubai Marina',     nameAr:'مارينا دبي' },
    { name:'DIFC',             nameAr:'مركز دبي المالي' },
    { name:'Dubai Downtown',   nameAr:'داون تاون دبي' },
  ],
  [
    { name:'Etihad Rail',       nameAr:'قطار الاتحاد' },
    { name:'Dubai Metro',       nameAr:'مترو دبي' },
    { name:'Abu Dhabi Rail',    nameAr:'قطار أبوظبي' },
  ],
  [
    { name:'DEWA',              nameAr:'ديوا' },
    { name:'ADNOC',             nameAr:'أدنوك' },
  ],
  { name:'VAT',                 nameAr:'ضريبة القيمة',      amount: 500 },
  { name:'Oil Tax',             nameAr:'ضريبة النفط',       amount: 2000 },
);

// ─── GCC: Saudi Arabia ────────────────────────────────────────────────────────
const KSA_BOARD = buildBoard28(
  [
    { name:'Tabuk',            nameAr:'تبوك' },
    { name:'Hail',             nameAr:'حائل' },
    { name:'Abha',             nameAr:'أبها' },
    { name:'Yanbu',            nameAr:'ينبع' },
    { name:'Al-Khobar',        nameAr:'الخبر' },
    { name:'Dammam',           nameAr:'الدمام' },
    { name:'Al-Ahsa',          nameAr:'الأحساء' },
    { name:'Taif',             nameAr:'الطائف' },
    { name:'Masjid Quba',      nameAr:'مسجد قباء' },
    { name:'Riyadh',           nameAr:'الرياض' },
    { name:'Jeddah',           nameAr:'جدة' },
    { name:'Masjid al-Haram',  nameAr:'المسجد الحرام' },
    { name:'Mina',             nameAr:'منى' },
    { name:'Medina',           nameAr:'المدينة المنورة' },
    { name:'Mecca',            nameAr:'مكة المكرمة' },
  ],
  [
    { name:'Haramain HSR',      nameAr:'قطار الحرمين' },
    { name:'SAR Railway',       nameAr:'الخطوط الحديدية' },
    { name:'Riyadh Metro',      nameAr:'مترو الرياض' },
  ],
  [
    { name:'SWCC Water',        nameAr:'هيئة تحلية المياه' },
    { name:'Saudi Aramco',      nameAr:'أرامكو السعودية' },
  ],
  { name:'Zakat',               nameAr:'زكاة',              amount: 500 },
  { name:'Oil Revenue',         nameAr:'ضريبة النفط',       amount: 2000 },
);

// ─── Al Sham: Jordan ──────────────────────────────────────────────────────────
const JORDAN_COUNTRY_BOARD = buildBoard28(
  [
    { name:"Ma'an",          nameAr:'معان' },
    { name:'Zarqa',          nameAr:'الزرقاء' },
    { name:'Salt',           nameAr:'السلط' },
    { name:'Madaba',         nameAr:'مادبا' },
    { name:'Irbid',          nameAr:'إربد' },
    { name:'Aqaba',          nameAr:'العقبة' },
    { name:'Karak',          nameAr:'الكرك' },
    { name:'Jerash',         nameAr:'جرش' },
    { name:'Wadi Rum',       nameAr:'وادي رم' },
    { name:'Dead Sea',       nameAr:'البحر الميت' },
    { name:'Al Abdali',      nameAr:'العبدلي' },
    { name:'East Amman',     nameAr:'عمّان الشرقية' },
    { name:'West Amman',     nameAr:'عمّان الغربية' },
    { name:'Petra',          nameAr:'البتراء' },
    { name:'Downtown Amman', nameAr:'وسط عمّان' },
  ],
  [
    { name:'Hejaz Railway',     nameAr:'قطار الحجاز' },
    { name:'Aqaba Railway',     nameAr:'قطار العقبة' },
    { name:'Jordan Valley Rail',nameAr:'قطار الغور' },
  ],
  [
    { name:'Yarmouk Water',     nameAr:'مياه اليرموك' },
    { name:'JEPCO Energy',      nameAr:'طاقة الأردن' },
  ],
  { name:'Sales Tax',           nameAr:'ضريبة المبيعات',   amount: 500 },
  { name:'Property Tax',        nameAr:'ضريبة العقار',     amount: 2000 },
);

// ─── Al Sham: Lebanon ─────────────────────────────────────────────────────────
const LEBANON_BOARD = buildBoard28(
  [
    { name:'Naqoura',        nameAr:'الناقورة' },
    { name:'Zahle',          nameAr:'زحلة' },
    { name:'Baalbek',        nameAr:'بعلبك' },
    { name:'Tyre',           nameAr:'صور' },
    { name:'Sidon',          nameAr:'صيدا' },
    { name:'Byblos',         nameAr:'جبيل' },
    { name:'Jounieh',        nameAr:'جونيه' },
    { name:'Tripoli',        nameAr:'طرابلس' },
    { name:'Beiteddine',     nameAr:'بيت الدين' },
    { name:'Gemmayzeh',      nameAr:'الجميزة' },
    { name:'Hamra',          nameAr:'الحمرا' },
    { name:'Achrafieh',      nameAr:'الأشرفية' },
    { name:'Verdun',         nameAr:'الرو' },
    { name:'Solidere',       nameAr:'سوليدير' },
    { name:'Beirut Downtown',nameAr:'وسط بيروت' },
  ],
  [
    { name:'Lebanese Railway',  nameAr:'قطار لبنان' },
    { name:'Coastal Rail',      nameAr:'قطار الساحل' },
    { name:'Mountain Rail',     nameAr:'قطار الجبل' },
  ],
  [
    { name:'EDL Energy',        nameAr:'طاقة لبنان' },
    { name:'Beirut Water',      nameAr:'مياه بيروت' },
  ],
  { name:'VAT',                 nameAr:'ضريبة القيمة',     amount: 500 },
  { name:'Property Tax',        nameAr:'ضريبة الممتلكات',  amount: 2000 },
);

// ─── Al Sham: Syria ───────────────────────────────────────────────────────────
const SYRIA_COUNTRY_BOARD = buildBoard28(
  [
    { name:"Deir ez-Zor",    nameAr:'دير الزور' },
    { name:'Raqqa',          nameAr:'الرقة' },
    { name:'Tartus',         nameAr:'طرطوس' },
    { name:'Latakia',        nameAr:'اللاذقية' },
    { name:'Palmyra',        nameAr:'تدمر' },
    { name:'Hama',           nameAr:'حماة' },
    { name:'Homs',           nameAr:'حمص' },
    { name:'Daraa',          nameAr:'درعا' },
    { name:'Qamishli',       nameAr:'القامشلي' },
    { name:'Al-Mazzeh',      nameAr:'المزة' },
    { name:'Midan',          nameAr:'الميدان' },
    { name:'Umayyad Square', nameAr:'ساحة الأمويين' },
    { name:'Old Damascus',   nameAr:'دمشق القديمة' },
    { name:'Aleppo',         nameAr:'حلب' },
    { name:'Damascus',       nameAr:'دمشق' },
  ],
  [
    { name:'Syrian Railway',    nameAr:'السكك الحديدية السورية' },
    { name:'Hejaz Rail',        nameAr:'قطار الحجاز' },
    { name:'Aleppo Rail',       nameAr:'قطار حلب' },
  ],
  [
    { name:'PEEGT Energy',      nameAr:'طاقة سوريا' },
    { name:'Syrian Water',      nameAr:'مياه سوريا' },
  ],
  { name:'Customs Tax',         nameAr:'رسوم جمركية',      amount: 500 },
  { name:'Property Tax',        nameAr:'ضريبة الملكية',    amount: 2000 },
);

// ─── North Africa: Tunisia ────────────────────────────────────────────────────
const TUNISIA_BOARD = buildBoard28(
  [
    { name:'Gabes',          nameAr:'قابس' },
    { name:'Gafsa',          nameAr:'قفصة' },
    { name:'El-Djem',        nameAr:'الجم' },
    { name:'Monastir',       nameAr:'المنستير' },
    { name:'Sfax',           nameAr:'صفاقس' },
    { name:'Bizerte',        nameAr:'بنزرت' },
    { name:'Djerba',         nameAr:'جربة' },
    { name:'Hammamet',       nameAr:'الحمامات' },
    { name:'Sousse',         nameAr:'سوسة' },
    { name:'Kairouan',       nameAr:'القيروان' },
    { name:'Medina of Tunis',nameAr:'المدينة التونسية' },
    { name:'Carthage',       nameAr:'قرطاج' },
    { name:'Sidi Bou Said',  nameAr:'سيدي بو سعيد' },
    { name:'La Marsa',       nameAr:'المرسى' },
    { name:'Tunis',          nameAr:'تونس' },
  ],
  [
    { name:'TGM Railway',       nameAr:'خط TGM' },
    { name:'Tunis Metro',       nameAr:'مترو تونس' },
    { name:'Sahel Rail',        nameAr:'قطار الساحل' },
  ],
  [
    { name:'SONEDE Water',      nameAr:'مياه تونس' },
    { name:'STEG Energy',       nameAr:'طاقة تونس' },
  ],
  { name:'VAT',                 nameAr:'ضريبة القيمة',     amount: 500 },
  { name:'Import Tax',          nameAr:'ضريبة الاستيراد',  amount: 2000 },
);

// ─── North Africa: Libya ──────────────────────────────────────────────────────
const LIBYA_BOARD = buildBoard28(
  [
    { name:'Ghadames',       nameAr:'غدامس' },
    { name:'Sabha',          nameAr:'سبها' },
    { name:'Tobruk',         nameAr:'طبرق' },
    { name:'Derna',          nameAr:'درنة' },
    { name:'Al Khums',       nameAr:'الخمس' },
    { name:'Zawiya',         nameAr:'الزاوية' },
    { name:'Zliten',         nameAr:'زليتن' },
    { name:'Sirte',          nameAr:'سرت' },
    { name:'Bani Walid',     nameAr:'بني وليد' },
    { name:'Misrata',        nameAr:'مصراتة' },
    { name:'Ajdabiya',       nameAr:'أجدابيا' },
    { name:'Benghazi',       nameAr:'بنغازي' },
    { name:'Old Tripoli',    nameAr:'طرابلس القديمة' },
    { name:'Tripoli Port',   nameAr:'ميناء طرابلس' },
    { name:'Tripoli',        nameAr:'طرابلس' },
  ],
  [
    { name:'Libyan Railway',    nameAr:'السكك الليبية' },
    { name:'Coastal Rail',      nameAr:'قطار الساحل' },
    { name:'Desert Rail',       nameAr:'قطار الصحراء' },
  ],
  [
    { name:'GECOL Energy',      nameAr:'طاقة ليبيا' },
    { name:'Libya Water',       nameAr:'مياه ليبيا' },
  ],
  { name:'Oil Tax',             nameAr:'ضريبة النفط',      amount: 500 },
  { name:'Customs Tax',         nameAr:'رسوم الجمارك',     amount: 2000 },
);

// ─── North Africa: Morocco ────────────────────────────────────────────────────
const MOROCCO_BOARD = buildBoard28(
  [
    { name:'Oujda',          nameAr:'وجدة' },
    { name:'Nador',          nameAr:'الناظور' },
    { name:'Tetouan',        nameAr:'تطوان' },
    { name:'Tangier',        nameAr:'طنجة' },
    { name:'Agadir',         nameAr:'أكادير' },
    { name:'Meknes',         nameAr:'مكناس' },
    { name:'Fez Medina',     nameAr:'مدينة فاس' },
    { name:'Chefchaouen',    nameAr:'شفشاون' },
    { name:'El Jadida',      nameAr:'الجديدة' },
    { name:'Rabat',          nameAr:'الرباط' },
    { name:'Marrakech',      nameAr:'مراكش' },
    { name:'Old Casablanca', nameAr:'الدار البيضاء القديمة' },
    { name:'Hassan II Mosque',nameAr:'مسجد الحسن الثاني' },
    { name:'Casablanca Port',nameAr:'ميناء الدار البيضاء' },
    { name:'Casablanca',     nameAr:'الدار البيضاء' },
  ],
  [
    { name:'ONCF Railway',      nameAr:'المكتب الوطني للسكك' },
    { name:'Al Boraq HSR',      nameAr:'قطار البراق' },
    { name:'Casa Metro',        nameAr:'مترو الدار البيضاء' },
  ],
  [
    { name:'ONEP Water',        nameAr:'مياه المغرب' },
    { name:'ONE Energy',        nameAr:'طاقة المغرب' },
  ],
  { name:'VAT',                 nameAr:'ضريبة القيمة',     amount: 500 },
  { name:'Import Tax',          nameAr:'رسوم الاستيراد',   amount: 2000 },
);

// ─── North Africa: Algeria ────────────────────────────────────────────────────
const ALGERIA_BOARD = buildBoard28(
  [
    { name:'Tindouf',        nameAr:'تندوف' },
    { name:'Bechar',         nameAr:'بشار' },
    { name:'Tlemcen',        nameAr:'تلمسان' },
    { name:'Ghardaia',       nameAr:'غرداية' },
    { name:'Batna',          nameAr:'باتنة' },
    { name:'Setif',          nameAr:'سطيف' },
    { name:'Annaba',         nameAr:'عنابة' },
    { name:'Skikda',         nameAr:'سكيكدة' },
    { name:'Oran City',      nameAr:'وسط وهران' },
    { name:'Oran',           nameAr:'وهران' },
    { name:'Constantine',    nameAr:'قسنطينة' },
    { name:'Bab El Oued',    nameAr:'باب الواد' },
    { name:'El-Biar',        nameAr:'البيار' },
    { name:'Hydra',          nameAr:'حيدرة' },
    { name:'Algiers',        nameAr:'الجزائر' },
  ],
  [
    { name:'SNTF Railway',      nameAr:'السكك الجزائرية' },
    { name:'Algiers Metro',     nameAr:'مترو الجزائر' },
    { name:'East-West Rail',    nameAr:'الخط الشرقي الغربي' },
  ],
  [
    { name:'Sonatrach',         nameAr:'سوناطراك' },
    { name:'ADE Water',         nameAr:'مياه الجزائر' },
  ],
  { name:'VAT',                 nameAr:'ضريبة القيمة',     amount: 500 },
  { name:'Petroleum Tax',       nameAr:'ضريبة البترول',    amount: 2000 },
);

// ─── North Africa: Egypt ──────────────────────────────────────────────────────
const EGYPT_BOARD = buildBoard28(
  [
    { name:"Sharm El-Sheikh", nameAr:'شرم الشيخ' },
    { name:'Aswan',           nameAr:'أسوان' },
    { name:'Luxor',           nameAr:'الأقصر' },
    { name:'Hurghada',        nameAr:'الغردقة' },
    { name:'Port Said',       nameAr:'بورسعيد' },
    { name:'Suez',            nameAr:'السويس' },
    { name:'El-Mahalla',      nameAr:'المحلة' },
    { name:'Mansoura',        nameAr:'المنصورة' },
    { name:'Tanta',           nameAr:'طنطا' },
    { name:'Alexandria',      nameAr:'الإسكندرية' },
    { name:'Zamalek',         nameAr:'الزمالك' },
    { name:'Islamic Cairo',   nameAr:'القاهرة الإسلامية' },
    { name:'Al-Azhar',        nameAr:'الأزهر' },
    { name:'Heliopolis',      nameAr:'مصر الجديدة' },
    { name:'Cairo',           nameAr:'القاهرة' },
  ],
  [
    { name:'Egyptian Railway',  nameAr:'السكك المصرية' },
    { name:'Cairo Metro',       nameAr:'مترو القاهرة' },
    { name:'Upper Egypt Rail',  nameAr:'قطار الصعيد' },
  ],
  [
    { name:'NUCA Water',        nameAr:'مياه مصر' },
    { name:'EEHC Energy',       nameAr:'طاقة مصر' },
  ],
  { name:'VAT',                 nameAr:'ضريبة القيمة',     amount: 500 },
  { name:'Tourism Tax',         nameAr:'ضريبة السياحة',    amount: 2000 },
);

// ─── Persia: Azerbaijan ───────────────────────────────────────────────────────
const PERSIA_AZERBAIJAN_BOARD = buildBoard28(
  [
    { name: 'Nakhchivan',     nameAr: 'نخجوان' },
    { name: 'Lankaran',       nameAr: 'لنكران' },
    { name: 'Mingachevir',    nameAr: 'مينغاتشيفير' },
    { name: 'Ganja',          nameAr: 'گنجه' },
    { name: 'Sheki',          nameAr: 'شيكي' },
    { name: 'Quba',           nameAr: 'قوبا' },
    { name: 'Shamakhi',       nameAr: 'شماخي' },
    { name: 'Yevlakh',        nameAr: 'يفلاخ' },
    { name: 'Shirvan',        nameAr: 'شيرفان' },
    { name: 'Barda',          nameAr: 'برده' },
    { name: 'Baku Old City',  nameAr: 'باكو القديمة' },
    { name: 'Sumqayit',       nameAr: 'سومقايت' },
    { name: 'Baku Port',      nameAr: 'ميناء باكو' },
    { name: 'Baku Bulvar',    nameAr: 'بولفار باكو' },
    { name: 'Baku',           nameAr: 'باكو' },
  ],
  [
    { name: 'Baku Metro',              nameAr: 'مترو باكو' },
    { name: 'Baku-Tbilisi-Kars Rail',  nameAr: 'قطار باكو-تبليسي-قارص' },
    { name: 'Azerbaijan State Rail',   nameAr: 'سكك أذربيجان' },
  ],
  [
    { name: 'Azerenerji',  nameAr: 'أذرإنيرجي' },
    { name: 'Azersu',      nameAr: 'أذرسو' },
  ],
  { name: 'VAT',           nameAr: 'ضريبة القيمة',      amount: 500 },
  { name: 'Oil Wealth Tax',nameAr: 'ضريبة الثروة النفطية', amount: 2000 },
);

// ─── Persia: Kurdistan ────────────────────────────────────────────────────────
const PERSIA_KURDISTAN_BOARD = buildBoard28(
  [
    { name: 'Kobani',         nameAr: 'كوباني' },
    { name: 'Afrin',          nameAr: 'عفرين' },
    { name: 'Qamishli',       nameAr: 'القامشلي' },
    { name: 'Mardin',         nameAr: 'ماردين' },
    { name: 'Diyarbakir',     nameAr: 'ديار بكر' },
    { name: 'Halabja',        nameAr: 'حلبجة' },
    { name: 'Zakho',          nameAr: 'زاخو' },
    { name: 'Mahabad',        nameAr: 'مهاباد' },
    { name: 'Sanandaj',       nameAr: 'سنندج' },
    { name: 'Duhok',          nameAr: 'دهوك' },
    { name: 'Sulaymaniyah',   nameAr: 'السليمانية' },
    { name: 'Akre',           nameAr: 'عقرة' },
    { name: 'Erbil Citadel',  nameAr: 'قلعة أربيل' },
    { name: 'Erbil Modern',   nameAr: 'أربيل الحديثة' },
    { name: 'Erbil',          nameAr: 'أربيل' },
  ],
  [
    { name: 'Erbil-Sulaymaniyah Rd',  nameAr: 'طريق أربيل-السليمانية' },
    { name: 'Peshmerga Rail',          nameAr: 'قطار البيشمركة' },
    { name: 'Kurdistan Border Exp.',   nameAr: 'قطار حدود كردستان' },
  ],
  [
    { name: 'Kurdistan Power Grid',   nameAr: 'شبكة كهرباء كردستان' },
    { name: 'KRG Water Authority',    nameAr: 'هيئة مياه كردستان' },
  ],
  { name: 'Zakat',         nameAr: 'زكاة',           amount: 500 },
  { name: 'Border Tax',    nameAr: 'ضريبة الحدود',   amount: 2000 },
);

// ─── Persia: Iraq (non-Kurdish cities) ────────────────────────────────────────
const PERSIA_IRAQ_BOARD = buildBoard28(
  [
    { name: 'Tikrit',          nameAr: 'تكريت' },
    { name: 'Al-Fallujah',     nameAr: 'الفلوجة' },
    { name: 'Ramadi',          nameAr: 'الرمادي' },
    { name: 'Al-Amarah',       nameAr: 'العمارة' },
    { name: 'Al-Nasiriyah',    nameAr: 'الناصرية' },
    { name: 'Hillah',          nameAr: 'الحلة' },
    { name: 'Samarra',         nameAr: 'سامراء' },
    { name: 'Kut',             nameAr: 'الكوت' },
    { name: 'Karbala',         nameAr: 'كربلاء' },
    { name: 'Najaf',           nameAr: 'النجف' },
    { name: 'Mosul',           nameAr: 'الموصل' },
    { name: 'Basra Port',      nameAr: 'ميناء البصرة' },
    { name: 'Basra CBD',       nameAr: 'قلب البصرة' },
    { name: 'Baghdad Al-Rusafa',nameAr: 'بغداد الرصافة' },
    { name: 'Baghdad CBD',     nameAr: 'قلب بغداد' },
  ],
  [
    { name: 'Baghdad Metro',        nameAr: 'مترو بغداد' },
    { name: 'Mosul-Baghdad Rail',   nameAr: 'قطار الموصل-بغداد' },
    { name: 'Basra Port Rail',      nameAr: 'قطار ميناء البصرة' },
  ],
  [
    { name: 'Diyala Water Authority', nameAr: 'هيئة مياه ديالى' },
    { name: 'Iraq National Grid',     nameAr: 'الشبكة الكهربائية العراقية' },
  ],
  { name: 'Oil Revenue Tax',    nameAr: 'ضريبة الإيرادات النفطية', amount: 500 },
  { name: 'Reconstruction Tax', nameAr: 'ضريبة إعادة الإعمار',     amount: 2000 },
);

// ─── Persia: Iran ─────────────────────────────────────────────────────────────
const PERSIA_IRAN_BOARD = buildBoard28(
  [
    { name: 'Bandar Abbas',    nameAr: 'بندر عباس' },
    { name: 'Ahvaz',           nameAr: 'الأهواز' },
    { name: 'Tabriz',          nameAr: 'تبريز' },
    { name: 'Mashhad',         nameAr: 'مشهد' },
    { name: 'Shiraz',          nameAr: 'شيراز' },
    { name: 'Qom',             nameAr: 'قم' },
    { name: 'Urmia',           nameAr: 'أورمية' },
    { name: 'Rasht',           nameAr: 'رشت' },
    { name: 'Yazd',            nameAr: 'يزد' },
    { name: 'Kermanshah',      nameAr: 'كرمانشاه' },
    { name: 'Hamadan',         nameAr: 'همدان' },
    { name: 'Isfahan Old City',nameAr: 'أصفهان القديمة' },
    { name: 'Isfahan',         nameAr: 'أصفهان' },
    { name: 'Tehran Bazaar',   nameAr: 'بازار طهران' },
    { name: 'Tehran',          nameAr: 'طهران' },
  ],
  [
    { name: 'Tehran Metro',       nameAr: 'مترو طهران' },
    { name: 'Iranian Railways',   nameAr: 'سكك إيران' },
    { name: 'RAJA Passenger Rail',nameAr: 'قطار راجا' },
  ],
  [
    { name: 'TAVANIR Energy', nameAr: 'طاقة توانير' },
    { name: 'NWWEC Water',    nameAr: 'مياه إيران' },
  ],
  { name: 'VAT',               nameAr: 'ضريبة القيمة',         amount: 500 },
  { name: 'Petroleum Export',  nameAr: 'ضريبة تصدير النفط',   amount: 2000 },
);

// ─── Registry ─────────────────────────────────────────────────────────────────
export const CHALLENGE_BOARDS: Record<string, BoardSpace[]> = {
  tech:           TECH_BOARD,
  fashion:        FASHION_BOARD,
  food:           FOOD_BOARD,
  defense:        DEFENSE_BOARD,
  jordan:         JORDAN_BOARD,
  saudi:          SAUDI_BOARD,
  syria:          SYRIA_BOARD,
  gulf:           GULF_BOARD,
  gcc:            GCC_BOARD,
  alsham:         AL_SHAM_BOARD,
  northafrica:    NORTH_AFRICA_BOARD,
  iraq:           IRAQ_BOARD,
  gcc_oman:       OMAN_BOARD,
  gcc_qatar:      QATAR_BOARD,
  gcc_uae:        UAE_BOARD,
  gcc_ksa:        KSA_BOARD,
  alsham_jordan:  JORDAN_COUNTRY_BOARD,
  alsham_lebanon: LEBANON_BOARD,
  alsham_syria:   SYRIA_COUNTRY_BOARD,
  na_tunisia:     TUNISIA_BOARD,
  na_libya:       LIBYA_BOARD,
  na_morocco:     MOROCCO_BOARD,
  na_algeria:     ALGERIA_BOARD,
  na_egypt:       EGYPT_BOARD,
  persia_azerbaijan: PERSIA_AZERBAIJAN_BOARD,
  persia_kurdistan:  PERSIA_KURDISTAN_BOARD,
  persia_iraq:       PERSIA_IRAQ_BOARD,
  persia_iran:       PERSIA_IRAN_BOARD,
};
