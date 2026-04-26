import { buildBoard, buildBoard28 } from "../../challengeBoards";


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

export { NORTH_AFRICA_BOARD, TUNISIA_BOARD, LIBYA_BOARD, ALGERIA_BOARD, MOROCCO_BOARD, EGYPT_BOARD };