import { buildBoard28 } from "../../challengeBoards";

// ─── South Asia: India (cities with significant Muslim population) ─────────────
const SOUTHASIA_INDIA_BOARD = buildBoard28(
  [
    { name: 'Aligarh',        nameAr: 'عليكرة' },
    { name: 'Meerut',         nameAr: 'ميروت' },
    { name: 'Murshidabad',    nameAr: 'مرشد آباد' },
    { name: 'Moradabad',      nameAr: 'مراد آباد' },
    { name: 'Saharanpur',     nameAr: 'سهارنفور' },
    { name: 'Bareilly',       nameAr: 'بريلي' },
    { name: 'Bhopal',         nameAr: 'بوبال' },
    { name: 'Agra',           nameAr: 'آغرا' },
    { name: 'Lucknow',        nameAr: 'لكناو' },
    { name: 'Ahmedabad',      nameAr: 'أحمد آباد' },
    { name: 'Old Delhi',      nameAr: 'دلهي القديمة' },
    { name: 'Kolkata',        nameAr: 'كولكاتا' },
    { name: 'Hyderabad',      nameAr: 'حيدر آباد' },
    { name: 'Mumbai',         nameAr: 'مومباي' },
    { name: 'Char Minar',     nameAr: 'شار مينار' },
  ],
  [
    { name: 'Indian Railways',  nameAr: 'السكك الهندية' },
    { name: 'Delhi Metro',      nameAr: 'مترو دلهي' },
    { name: 'Mumbai Metro',     nameAr: 'مترو مومباي' },
  ],
  [
    { name: 'BSES Power',     nameAr: 'طاقة دلهي' },
    { name: 'Mumbai Water',   nameAr: 'مياه مومباي' },
  ],
  { name: 'GST',               nameAr: 'ضريبة السلع والخدمات', amount: 500 },
  { name: 'Property Tax',      nameAr: 'ضريبة الممتلكات',      amount: 2000 },
);

// ─── South Asia: Pakistan ─────────────────────────────────────────────────────
const SOUTHASIA_PAKISTAN_BOARD = buildBoard28(
  [
    { name: 'Gwadar',         nameAr: 'گوادر' },
    { name: 'Quetta',         nameAr: 'كويتا' },
    { name: 'Peshawar',       nameAr: 'بيشاور' },
    { name: 'Abbottabad',     nameAr: 'أبوت آباد' },
    { name: 'Multan',         nameAr: 'ملتان' },
    { name: 'Bahawalpur',     nameAr: 'بهاولفور' },
    { name: 'Faisalabad',     nameAr: 'فيصل آباد' },
    { name: 'Rawalpindi',     nameAr: 'رواپندي' },
    { name: 'Islamabad',      nameAr: 'إسلام آباد' },
    { name: 'Gujranwala',     nameAr: 'گجرانوالا' },
    { name: 'Sialkot',        nameAr: 'سيالكوت' },
    { name: 'Hyderabad PK',   nameAr: 'حيدر آباد سند' },
    { name: 'Karachi Port',   nameAr: 'ميناء كراتشي' },
    { name: 'Lahore',         nameAr: 'لاهور' },
    { name: 'Karachi',        nameAr: 'كراتشي' },
  ],
  [
    { name: 'Pakistan Railways',  nameAr: 'السكك الباكستانية' },
    { name: 'Karachi Circular',   nameAr: 'قطار كراتشي الدائري' },
    { name: 'ML-1 Railway',       nameAr: 'خط ML-1' },
  ],
  [
    { name: 'WAPDA Energy',   nameAr: 'طاقة وابدا' },
    { name: 'KWSB Water',     nameAr: 'مياه كراتشي' },
  ],
  { name: 'GST',               nameAr: 'ضريبة المبيعات', amount: 500 },
  { name: 'Property Tax',      nameAr: 'ضريبة الممتلكات', amount: 2000 },
);

// ─── South Asia: Bangladesh ───────────────────────────────────────────────────
const SOUTHASIA_BANGLADESH_BOARD = buildBoard28(
  [
    { name: 'Cox\'s Bazar',   nameAr: 'كوكس بازار' },
    { name: 'Rangpur',        nameAr: 'رانغبور' },
    { name: 'Jessore',        nameAr: 'جيسور' },
    { name: 'Rajshahi',       nameAr: 'راجشاهي' },
    { name: 'Khulna',         nameAr: 'خولنا' },
    { name: 'Sylhet',         nameAr: 'سيلهيت' },
    { name: 'Comilla',        nameAr: 'كوميلا' },
    { name: 'Narayanganj',    nameAr: 'نارايانغانج' },
    { name: 'Gazipur',        nameAr: 'غازيبور' },
    { name: 'Mymensingh',     nameAr: 'ميمنسينغ' },
    { name: 'Barisal',        nameAr: 'باريسال' },
    { name: 'Old Dhaka',      nameAr: 'دهاكا القديمة' },
    { name: 'Chittagong Port',nameAr: 'ميناء تشيتاغونغ' },
    { name: 'Chittagong',     nameAr: 'تشيتاغونغ' },
    { name: 'Dhaka',          nameAr: 'دهاكا' },
  ],
  [
    { name: 'Bangladesh Railway', nameAr: 'سكك بنغلاديش' },
    { name: 'Dhaka Metro',        nameAr: 'مترو دهاكا' },
    { name: 'Chittagong Metro',   nameAr: 'مترو تشيتاغونغ' },
  ],
  [
    { name: 'DESCO Power',    nameAr: 'طاقة دهاكا' },
    { name: 'DWASA Water',    nameAr: 'مياه دهاكا' },
  ],
  { name: 'VAT',               nameAr: 'ضريبة القيمة المضافة', amount: 500 },
  { name: 'Land Tax',          nameAr: 'ضريبة الأراضي',        amount: 2000 },
);

// ─── South Asia: Afghanistan ──────────────────────────────────────────────────
const SOUTHASIA_AFGHANISTAN_BOARD = buildBoard28(
  [
    { name: 'Zaranj',         nameAr: 'زرنج' },
    { name: 'Farah',          nameAr: 'فراه' },
    { name: 'Ghazni',         nameAr: 'غزني' },
    { name: 'Bamyan',         nameAr: 'باميان' },
    { name: 'Khost',          nameAr: 'خوست' },
    { name: 'Jalalabad',      nameAr: 'جلال آباد' },
    { name: 'Lashkar Gah',    nameAr: 'لشكر گاه' },
    { name: 'Kunduz',         nameAr: 'قندوز' },
    { name: 'Mazar-i-Sharif', nameAr: 'مزار شريف' },
    { name: 'Herat Old City', nameAr: 'هرات القديمة' },
    { name: 'Herat',          nameAr: 'هرات' },
    { name: 'Kandahar Old',   nameAr: 'قندهار القديمة' },
    { name: 'Kandahar',       nameAr: 'قندهار' },
    { name: 'Kabul Old City', nameAr: 'كابل القديمة' },
    { name: 'Kabul',          nameAr: 'كابل' },
  ],
  [
    { name: 'Khyber Railway',      nameAr: 'سكة خيبر' },
    { name: 'Central Asia Rail',   nameAr: 'قطار آسيا الوسطى' },
    { name: 'Herat-Mazar Rail',    nameAr: 'قطار هرات-مزار' },
  ],
  [
    { name: 'DABS Energy',     nameAr: 'طاقة أفغانستان' },
    { name: 'Afghan Water',    nameAr: 'مياه أفغانستان' },
  ],
  { name: 'Trade Tax',          nameAr: 'ضريبة التجارة',     amount: 500 },
  { name: 'Reconstruction Tax', nameAr: 'ضريبة إعادة الإعمار', amount: 2000 },
);


export { SOUTHASIA_PAKISTAN_BOARD, SOUTHASIA_BANGLADESH_BOARD, SOUTHASIA_AFGHANISTAN_BOARD, SOUTHASIA_INDIA_BOARD };