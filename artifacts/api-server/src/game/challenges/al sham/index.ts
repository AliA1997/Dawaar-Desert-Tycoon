import { buildBoard, buildBoard28 } from "../../challengeBoards";

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

export { JORDAN_BOARD, SYRIA_BOARD, AL_SHAM_BOARD, JORDAN_COUNTRY_BOARD, LEBANON_BOARD, SYRIA_COUNTRY_BOARD };