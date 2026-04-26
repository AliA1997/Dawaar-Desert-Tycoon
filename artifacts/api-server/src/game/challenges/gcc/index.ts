import { buildBoard, buildBoard28 } from "../../challengeBoards";

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

export { KSA_BOARD, QATAR_BOARD, UAE_BOARD, OMAN_BOARD, GULF_BOARD, GCC_BOARD, SAUDI_BOARD }