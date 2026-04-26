import { buildBoard, buildBoard28 } from "../../challengeBoards";



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


export { IRAQ_BOARD, PERSIA_AZERBAIJAN_BOARD, PERSIA_KURDISTAN_BOARD, PERSIA_IRAQ_BOARD, PERSIA_IRAN_BOARD };