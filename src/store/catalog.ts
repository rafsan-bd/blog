export type ProductCategory =
  | 'all'
  | 'dates-honey'
  | 'sunnah-superfoods'
  | 'ghee-oils'
  | 'iftar-feast';

export type FinishId = 'brass' | 'titanium' | 'obsidian' | 'sage';

export type CameraPresetId = 'three-quarter' | 'front' | 'top' | 'profile';

export type StudioLightingId =
  | 'atelier-daylight'
  | 'zurich-dusk'
  | 'gallery-spotlight'
  | 'blueprint-wireframe';

export type CurrencyCode = 'BDT' | 'USD' | 'SAR' | 'GBP';

export type SortOption = 'featured' | 'price-asc' | 'price-desc';

export type OrderStatus = 'placed' | 'milling' | 'calibration' | 'dispatched' | 'delivered';

export interface SacredCalligraphyPreset {
  id: string;
  scriptStyle: string;
  transliteration: string;
  meaning: string;
  inscriptionValue: string;
}

export const SACRED_CALLIGRAPHY_PRESETS: SacredCalligraphyPreset[] = [
  {
    id: 'ramadan-hadia',
    scriptStyle: 'রমজান হাদিয়া',
    transliteration: 'রামাদান মুবারক হাদিয়া',
    meaning: 'Ramadan Mubarak Gift Note',
    inscriptionValue: 'RAMADAN MUBARAK HADIA',
  },
  {
    id: 'eid-hadia',
    scriptStyle: 'ঈদ শুভেচ্ছা',
    transliteration: 'ঈদ মুবারক ও দোয়া',
    meaning: 'Eid Mubarak Blessing Card',
    inscriptionValue: 'EID MUBARAK BLESSINGS',
  },
  {
    id: 'shifa-dua',
    scriptStyle: 'সুস্থতার দোয়া',
    transliteration: 'আল্লাহ উত্তম শিফা দান করুন',
    meaning: 'Sunnah Shifa & Wellness Wish',
    inscriptionValue: 'ALLAHUMMA ISHFI SHIFAAN',
  },
  {
    id: 'family-dawat',
    scriptStyle: 'পারিবারিক হাদিয়া',
    transliteration: 'বারাকাল্লাহু ফী আহলিকা',
    meaning: 'Family Barakah Gift Card',
    inscriptionValue: 'BARAKALLAHU FI AHLIKA',
  },
];

export interface StudioLightingPreset {
  id: StudioLightingId;
  label: string;
  shortLabel: string;
  bgHex: string;
  keyColorHex: string;
  keyIntensity: number;
  hemiSkyHex: string;
  hemiGroundHex: string;
  hemiIntensity: number;
  rimColorHex: string;
  rimIntensity: number;
  exposure: number;
  wireframe: boolean;
  kelvinLabel: string;
}

export const STUDIO_LIGHTING_PRESETS: Record<StudioLightingId, StudioLightingPreset> = {
  'atelier-daylight': {
    id: 'atelier-daylight',
    label: 'Daylight Kitchen (5600K)',
    shortLabel: 'Daylight 5600K',
    bgHex: '#F6FAF7',
    keyColorHex: '#fff7e8',
    keyIntensity: 2.3,
    hemiSkyHex: '#e6edf7',
    hemiGroundHex: '#2c261f',
    hemiIntensity: 1.18,
    rimColorHex: '#ffe6bd',
    rimIntensity: 1.4,
    exposure: 1.1,
    wireframe: false,
    kelvinLabel: '5600K Natural Sunnah Kitchen',
  },
  'zurich-dusk': {
    id: 'zurich-dusk',
    label: 'Iftar Warmth (3200K)',
    shortLabel: 'Iftar 3200K',
    bgHex: '#18130F',
    keyColorHex: '#ffbe73',
    keyIntensity: 2.9,
    hemiSkyHex: '#fde68a',
    hemiGroundHex: '#1f1610',
    hemiIntensity: 0.7,
    rimColorHex: '#f59e0b',
    rimIntensity: 1.75,
    exposure: 1.24,
    wireframe: false,
    kelvinLabel: '3200K Golden Iftar Glow',
  },
  'gallery-spotlight': {
    id: 'gallery-spotlight',
    label: 'Honey & Gold (4200K)',
    shortLabel: 'Honey 4200K',
    bgHex: '#0D1311',
    keyColorHex: '#fffdf7',
    keyIntensity: 3.25,
    hemiSkyHex: '#cbd5e1',
    hemiGroundHex: '#090d0b',
    hemiIntensity: 0.42,
    rimColorHex: '#fde047',
    rimIntensity: 1.85,
    exposure: 1.26,
    wireframe: false,
    kelvinLabel: '4200K Studio Spot',
  },
  'blueprint-wireframe': {
    id: 'blueprint-wireframe',
    label: 'Purity Inspection',
    shortLabel: 'Lab View',
    bgHex: '#0C1713',
    keyColorHex: '#fde68a',
    keyIntensity: 2.2,
    hemiSkyHex: '#6ee7b7',
    hemiGroundHex: '#062019',
    hemiIntensity: 0.85,
    rimColorHex: '#eab308',
    rimIntensity: 2.0,
    exposure: 1.2,
    wireframe: true,
    kelvinLabel: 'BSTI & Halal Lab Inspection',
  },
};

export const STUDIO_LIGHTING_ORDER: StudioLightingId[] = [
  'atelier-daylight',
  'zurich-dusk',
  'gallery-spotlight',
  'blueprint-wireframe',
];

export interface CurrencyMeta {
  code: CurrencyCode;
  symbol: string;
  rateFromBdt: number;
  dispatchHub: string;
}

export const CURRENCY_META: Record<CurrencyCode, CurrencyMeta> = {
  BDT: {
    code: 'BDT',
    symbol: '৳',
    rateFromBdt: 1,
    dispatchHub: 'ঢাকা, চট্টগ্রাম ও সারা বাংলাদেশ হোম ডেলিভারি',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    rateFromBdt: 0.0084,
    dispatchHub: 'Global NRB Gift Delivery across Bangladesh',
  },
  SAR: {
    code: 'SAR',
    symbol: 'SAR ',
    rateFromBdt: 0.0315,
    dispatchHub: 'Madinah & Dhaka Direct Import Channel',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    rateFromBdt: 0.0066,
    dispatchHub: 'UK NRB Family Hadia Delivery to BD',
  },
};

export const CURRENCY_ORDER: CurrencyCode[] = ['BDT', 'USD', 'SAR', 'GBP'];

export interface ProductSubAssembly {
  partIndex: number;
  code: string;
  name: string;
  material: string;
  tolerance: string;
  recommendedExplode: number;
}

export interface SavedStudioBuild {
  id: string;
  name: string;
  productId: string;
  finish: FinishId;
  lighting: StudioLightingId;
  explodeRatio: number;
  engraving: string;
  createdAtLabel: string;
}

export interface FinishOption {
  id: FinishId;
  name: string;
  shortName: string;
  banglaWeight: string;
  priceMultiplier: number;
  savingsBadge?: string;
  hex: string;
  secondaryHex: string;
  metalness: number;
  roughness: number;
  clearcoat: number;
}

export const FINISH_OPTIONS: Record<FinishId, FinishOption> = {
  brass: {
    id: 'brass',
    name: '৫০০ গ্রাম রেগুলার প্যাক (500g Pack)',
    shortName: '৫০০ গ্রাম (500g)',
    banglaWeight: '৫০০ গ্রাম',
    priceMultiplier: 1.0,
    hex: '#D97706',
    secondaryHex: '#92400E',
    metalness: 0.5,
    roughness: 0.3,
    clearcoat: 0.4,
  },
  titanium: {
    id: 'titanium',
    name: '১ কেজি ফ্যামিলি গ্লাস জার (1kg Family Jar)',
    shortName: '১ কেজি জার (1kg)',
    banglaWeight: '১ কেজি',
    priceMultiplier: 1.85,
    savingsBadge: '৭% সাশ্রয়',
    hex: '#14532D',
    secondaryHex: '#166534',
    metalness: 0.4,
    roughness: 0.25,
    clearcoat: 0.3,
  },
  obsidian: {
    id: 'obsidian',
    name: '২ কেজি দাওয়াত ও স্টক প্যাক (2kg Bulk Pack)',
    shortName: '২ কেজি প্যাক (2kg)',
    banglaWeight: '২ কেজি',
    priceMultiplier: 3.5,
    savingsBadge: '১২% সাশ্রয়',
    hex: '#1E293B',
    secondaryHex: '#B45309',
    metalness: 0.4,
    roughness: 0.3,
    clearcoat: 0.4,
  },
  sage: {
    id: 'sage',
    name: 'সুন্নাহ হাদিয়া গিফট বক্স (Sunnah Gift Box)',
    shortName: 'হাদিয়া বক্স (Gift)',
    banglaWeight: '৭৫০ গ্রাম গিফট বক্স',
    priceMultiplier: 1.3,
    savingsBadge: 'হাদিয়া স্পেশাল',
    hex: '#065F46',
    secondaryHex: '#047857',
    metalness: 0.22,
    roughness: 0.38,
    clearcoat: 0.78,
  },
};

export const FINISH_ORDER: FinishId[] = ['brass', 'titanium', 'obsidian', 'sage'];

export function getPackPrice(basePriceBdt: number, finish: FinishId): number {
  const opt = FINISH_OPTIONS[finish] || FINISH_OPTIONS.brass;
  return Math.round((basePriceBdt * opt.priceMultiplier) / 10) * 10;
}

export interface CameraPreset {
  id: CameraPresetId;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
}

export const CAMERA_PRESETS: Record<CameraPresetId, CameraPreset> = {
  'three-quarter': {
    id: 'three-quarter',
    label: 'Perspective',
    position: [3.3, 2.2, 3.8],
    target: [0, 0.85, 0],
  },
  front: {
    id: 'front',
    label: 'Front Elevation',
    position: [0, 1.15, 4.4],
    target: [0, 0.85, 0],
  },
  top: {
    id: 'top',
    label: 'Top Plan',
    position: [0.01, 4.8, 0.9],
    target: [0, 0.75, 0],
  },
  profile: {
    id: 'profile',
    label: 'Side Profile',
    position: [4.4, 1.15, 0],
    target: [0, 0.85, 0],
  },
};

export interface FoodNutritionProfile {
  caloriesPer100g: string;
  protein: string;
  keyActiveCompound: string;
  shelfLife: string;
  halalCertNo: string;
  bstiTested: string;
}

export interface Product3DItem {
  id: string;
  banglaTitle: string;
  englishTitle: string;
  name: string;
  shortTabName: string;
  heritageTitle: string;
  subtitle: string;
  category: Exclude<ProductCategory, 'all'>;
  categoryLabel: string;
  price: number;
  defaultFinish: FinishId;
  availability: 'স্টকে আছে · In Stock' | 'সীমিত সংগ্রহ · Limited Harvest';
  origin: string;
  dimensions: string;
  weightSpec: string;
  description: string;
  sunnahHadithNote: string;
  ingredientsBangla: string;
  howToConsumeBangla: string;
  nutrition: FoodNutritionProfile;
  engineeringNotes: string[];
  partCount: number;
  featuredRank: number;
  customImageUrl?: string;
  subAssemblies?: ProductSubAssembly[];
}

export const PRODUCT_CATALOG: Product3DItem[] = [
  {
    id: 'food-ajwa-01',
    banglaTitle: 'মদিনার ভিআইপি আজওয়া খেজুর',
    englishTitle: 'Madinah Al-Aliyah VIP Ajwa Dates',
    name: 'মদিনার ভিআইপি আজওয়া খেজুর (Madinah VIP Ajwa Dates)',
    shortTabName: 'আজওয়া খেজুর',
    heritageTitle: 'মদিনা মুনাওয়ারার আল-আলিযাহ বাগান থেকে সরাসরি সংগৃহীত',
    subtitle: '১০০% অর্গানিক, নরম ও প্রাকৃতিক মিষ্টিযুক্ত মদিনার এ-গ্রেড আজওয়া খেজুর',
    category: 'dates-honey',
    categoryLabel: 'খেজুর ও মধু · Dates & Honey',
    price: 1450,
    defaultFinish: 'brass',
    availability: 'স্টকে আছে · In Stock',
    origin: 'আল-আলিযাহ, মদিনা মুনাওয়ারা · Al-Madinah, KSA',
    dimensions: 'এ-গ্রেড জাম্বো সাইজ (A-Grade Jumbo)',
    weightSpec: '৫০০ গ্রাম বেস প্যাক · Base 500g',
    description:
      'পবিত্র মদিনা শরীফের আল-আলিযাহ বাগানের বাছাইকৃত নরম ও সুমিষ্ট ভিআইপি আজওয়া খেজুর। কোনো প্রকার কৃত্রিম সিরাপ বা প্রিজারভেটিভ ছাড়াই কোল্ড-চেইন পদ্ধতিতে বাংলাদেশে আমদানিকৃত এবং ফুড-গ্রেড এয়ারটাইট জারে প্যাকিংকৃত।',
    sunnahHadithNote:
      'রাসূলুল্লাহ (সা.) বলেছেন: "যে ব্যক্তি প্রতিদিন সকালে সাতটি আজওয়া খেজুর খাবে, সেদিন কোনো বিষ বা জাদু তার ক্ষতি করতে পারবে না।" (সহীহ বুখারী: ৫৪৪৫)',
    ingredientsBangla: '১০০% প্রাকৃতিক মদিনার আজওয়া খেজুর (কোনো গ্লুকোজ সিরাপ বা রাসায়নিক পালিশ নেই)',
    howToConsumeBangla: 'প্রতিদিন সকালে খালি পেটে ৩টি বা ৭টি খেজুর সুন্নাহ নিয়তে গ্রহণ করুন অথবা ইফতারে পরিবেশন করুন।',
    nutrition: {
      caloriesPer100g: '২৭৭ কিলোক্যালরি (277 kcal)',
      protein: '২.৫ গ্রাম (2.5g Dietary Protein)',
      keyActiveCompound: 'পটাশিয়াম, ম্যাগনেসিয়াম ও ফ্ল্যাভোনয়েড অ্যান্টিঅক্সিডেন্ট',
      shelfLife: '১২ মাস (কোল্ড ও ড্রাই সংরক্ষণে)',
      halalCertNo: 'SFDA-HALAL-MDN-8841',
      bstiTested: 'BCSIR & BSTI Purity Verified',
    },
    engineeringNotes: [
      'সরাসরি মদিনার আল-আলিযাহ বাগান থেকে বাছাইকৃত নতুন মৌসুমের খেজুর',
      'জিরো গ্লুকোজ কোটিং ও ১০০% ফুড-গ্রেড গ্লাস জার প্যাকেজিং',
      'হৃদযন্ত্রের সুস্থতা ও তাৎক্ষণিক শক্তির সর্বোত্তম সুন্নাহ উৎস',
    ],
    partCount: 7,
    featuredRank: 1,
  },
  {
    id: 'food-honey-02',
    banglaTitle: 'সুন্দরবনের প্রাকৃতিক খলিশা ফুলের মধু',
    englishTitle: 'Sundarbans Raw Unheated Khalisha Honey',
    name: 'সুন্দরবনের প্রাকৃতিক খলিশা ফুলের মধু (Sundarbans Raw Honey)',
    shortTabName: 'সুন্দরবনের মধু',
    heritageTitle: 'সাতক্ষীরা রেঞ্জের মৌয়ালদের হাত থেকে সরাসরি সংগৃহীত কাঁচা চাকের মধু',
    subtitle: 'অপাস্তুরিত (Raw & Unheated), সক্রিয় এনজাইম ও প্রাকৃতিক পরাগরেণু সমৃদ্ধ খাঁটি মধু',
    category: 'dates-honey',
    categoryLabel: 'খেজুর ও মধু · Dates & Honey',
    price: 1150,
    defaultFinish: 'brass',
    availability: 'সীমিত সংগ্রহ · Limited Harvest',
    origin: 'বুড়িগোয়ালিনী, সাতক্ষীরা রেঞ্জ, সুন্দরবন',
    dimensions: '১৯.৫% আর্দ্রতা (Lab Moisture Tested)',
    weightSpec: '৫০০ গ্রাম কাঁচের জার · Base 500g',
    description:
      'সুন্দরবনের গভীর অরণ্যের খলিশা ও গরান ফুলের প্রাকৃতিক মৌচাক থেকে ঐতিহ্যবাহী মৌয়ালদের দ্বারা সংগৃহীত ১০০% কাঁচা মধু। কোনো প্রকার তাপ প্রয়োগ বা চিনি মিশ্রণ ছাড়াই শুধু সূক্ষ্ম সুতি কাপড়ে ছেঁকে বোতলজাত করা হয়েছে।',
    sunnahHadithNote:
      'পবিত্র কুরআনে ইরশাদ হয়েছে: "তার (মৌমাছির) উদর থেকে নির্গত হয় বিচিত্র বর্ণের পানীয়, যাতে মানুষের জন্য রয়েছে আরোগ্য (শিফা)।" (সূরা আন-নাহল: ৬৯)',
    ingredientsBangla: '১০০% প্রাকৃতিক সুন্দরবনের খলিশা ও গরান ফুলের চাকের কাঁচা মধু',
    howToConsumeBangla: 'সকালে কুসুম গরম পানিতে ১–২ চামচ মধু ও কালোজিরা মিশিয়ে পান করুন।',
    nutrition: {
      caloriesPer100g: '৩০৪ কিলোক্যালরি (304 kcal)',
      protein: '০.৪ গ্রাম + প্রাকৃতিক পোলেন এনজাইম',
      keyActiveCompound: 'ডায়াস্টেজ এনজাইম, পলিফেনল ও প্রাকৃতিক অ্যান্টিব্যাকটেরিয়াল উপাদান',
      shelfLife: '২৪ মাস (স্বাভাবিক কক্ষ তাপমাত্রায়)',
      halalCertNo: 'IFB-HALAL-BD-2049',
      bstiTested: 'BCSIR Science Lab C4 Sugar Negative',
    },
    engineeringNotes: [
      'বিসিএসআইআর (BCSIR) ল্যাব টেস্টে চিনি ও ভেজালমুক্ত প্রমাণিত',
      'হালকা সোনালী রঙ ও খলিশা ফুলের অনন্য প্রাকৃতিক সুবাস',
      'শিশু ও পরিবারের রোগ প্রতিরোধ ক্ষমতা বৃদ্ধিতে কার্যকরী সুন্নাহ খাবার',
    ],
    partCount: 5,
    featuredRank: 2,
  },
  {
    id: 'food-kalojira-03',
    banglaTitle: 'ঠান্ডা চাপে ভাঙানো খাঁটি কালোজিরা তেল',
    englishTitle: 'First Cold-Pressed Virgin Kalojira (Black Seed) Oil',
    name: 'ঠান্ডা চাপে ভাঙানো খাঁটি কালোজিরা তেল (Virgin Black Seed Oil)',
    shortTabName: 'কালোজিরা তেল',
    heritageTitle: 'দেশি ফরিদপুরের বাছাইকৃত কালোজিরা থেকে কাঠের ঘানিতে ঠান্ডা চাপে নিষ্কাশিত',
    subtitle: 'উচ্চ থাইমোকুইনোন (Thymoquinone) সমৃদ্ধ ১০০% খাওয়ার উপযোগী কুমারী কালোজিরা তেল',
    category: 'sunnah-superfoods',
    categoryLabel: 'সুন্নাহ সুপারফুড · Sunnah Superfoods',
    price: 680,
    defaultFinish: 'brass',
    availability: 'স্টকে আছে · In Stock',
    origin: 'ফরিদপুর ও নাটোর, বাংলাদেশ · Faridpur, BD',
    dimensions: 'অ্যাম্বার গ্লাস বোতল (UV Protected Bottle)',
    weightSpec: '৫০০ মিলি বেস প্যাক · Base 500ml',
    description:
      'ফরিদপুরের সেরা মানের দেশি কালোজিরা ভালোভাবে ধুয়ে রোদে শুকিয়ে কম তাপমাত্রায় (Cold-Pressed) প্রথম চাপে নিষ্কাশিত তেল। এতে কোনো প্যারাফিন, সরিষার তেল বা কৃত্রিম ঝাঁঝ মেশানো হয় না।',
    sunnahHadithNote:
      'রাসূলুল্লাহ (সা.) বলেছেন: "তোমরা এই কালোজিরা ব্যবহার করো, কেননা মৃত্যু ব্যতীত সকল রোগের নিরাময় এতে রয়েছে।" (সহীহ বুখারী: ৫৬৮৮)',
    ingredientsBangla: '১০০% দেশি কালোজিরা (Nigella Sativa) থেকে প্রথম চাপে নিষ্কাশিত খাঁটি তেল',
    howToConsumeBangla: 'প্রতিদিন সকালে ও রাতে ১ চা চামচ মধুসহ ১/২ চা চামচ কালোজিরা তেল সেবন করুন।',
    nutrition: {
      caloriesPer100g: '৮৮৪ কিলোক্যালরি (Pure Essential Lipids)',
      protein: 'ওমেগা-৩, ওমেগা-৬ ও ওমেগা-৯ ফ্যাটি অ্যাসিড',
      keyActiveCompound: '২.৪%+ প্রাকৃতিক থাইমোকুইনোন (Active Thymoquinone)',
      shelfLife: '১৮ মাস (অন্ধকার ও ঠান্ডা স্থানে)',
      halalCertNo: 'IFB-HALAL-BD-3108',
      bstiTested: 'Cold-Press Acid Value < 1.8% Verified',
    },
    engineeringNotes: [
      'তাপমাত্রা ৪০° সেলসিয়াসের নিচে রেখে কাঠের ঘানিতে ভাঙানো',
      'সর্দি-কাশি, অ্যাজমা, জয়েন্টের ব্যথা ও চুল পড়ার প্রাকৃতিক সমাধান',
      'সূর্যের আলো প্রতিরোধী ডার্ক অ্যাম্বার গ্লাস বোতলে সংরক্ষিত',
    ],
    partCount: 4,
    featuredRank: 3,
  },
  {
    id: 'food-ghee-04',
    banglaTitle: 'পাবনার ঐতিহ্যবাহী দানাদার গাওয়া ঘি',
    englishTitle: 'Pabna Artisanal Grass-Fed Danadar Gawa Ghee',
    name: 'পাবনার ঐতিহ্যবাহী দানাদার গাওয়া ঘি (Pabna Danadar Gawa Ghee)',
    shortTabName: 'পাবনার গাওয়া ঘি',
    heritageTitle: 'পাবনার বেড়া ও সাঁথিয়ার উন্মুক্ত চারণভূমির দেশি গরুর দুধের ননি থেকে তৈরি',
    subtitle: 'ঐতিহ্যবাহী মাটির হাঁড়িতে দই পাতা ও কাঠের মন্থন দণ্ডে তোলা মাখন থেকে তৈরি সুঘ্রাণযুক্ত দানাদার ঘি',
    category: 'ghee-oils',
    categoryLabel: 'শাহী ঘি ও তেল · Ghee & Oils',
    price: 1380,
    defaultFinish: 'brass',
    availability: 'স্টকে আছে · In Stock',
    origin: 'বেড়া ও সাঁথিয়া, পাবনা · Pabna, Bangladesh',
    dimensions: 'খাঁটি দানাদার টেক্সচার (Traditional Granular)',
    weightSpec: '৫০০ গ্রাম গ্লাস জার · Base 500g',
    description:
      'পাবনার বাথানের ঘাস খাওয়া দেশি গরুর খাঁটি দুধ জ্বাল দিয়ে দই পেতে, ভোরবেলা মাখন তুলে মৃদু আঁচে তৈরি করা হয় আমাদের দানাদার গাওয়া ঘি। এতে কোনো ডালডা, পাম অয়েল বা কৃত্রিম ফ্লেভার নেই।',
    sunnahHadithNote:
      'খাঁটি গরুর দুধ ও ঘি প্রাচীনকাল থেকেই সুন্নাহ ও উপমহাদেশীয় হালাল দাওয়াতের অন্যতম পুষ্টিকর ও শক্তিদায়ক উপাদান হিসেবে সমাদৃত।',
    ingredientsBangla: '১০০% দেশি গরুর দুধের মাখন (Milk Fat 99.7% — ডালডা ও কৃত্রিম সুগন্ধিমুক্ত)',
    howToConsumeBangla: 'গরম ভাত, খিচুড়ি, শাহী পোলাও, কাচ্চি বিরিয়ানি, হালুয়া ও রুটির সাথে পরিবেশন করুন।',
    nutrition: {
      caloriesPer100g: '৮৯৭ কিলোক্যালরি (897 kcal)',
      protein: 'ভিটামিন A, D, E এবং K2 সমৃদ্ধ',
      keyActiveCompound: 'বিউটিরিক অ্যাসিড (Butyric Acid) ও ওমেগা ফ্যাটি অ্যাসিড',
      shelfLife: '১২ মাস',
      halalCertNo: 'BSTI-CM-GHEE-4492',
      bstiTested: 'BRM Value 28.5+ Lab Certified',
    },
    engineeringNotes: [
      '২২–২৫ লিটার খাঁটি দেশি দুধ থেকে মাত্র ১ কেজি গাওয়া ঘি উৎপাদিত',
      'প্রাকৃতিক সোনালী দানা ও মনমাতানো খাঁটি ঘিয়ের সুবাস',
      'শিশুদের মস্তিষ্কের বিকাশ ও হজমশক্তি বৃদ্ধিতে অত্যন্ত উপকারী',
    ],
    partCount: 5,
    featuredRank: 4,
  },
  {
    id: 'food-talbina-05',
    banglaTitle: 'নববী সুন্নাহ তালবিনা ও বাদাম মিক্স',
    englishTitle: 'Prophetic Sunnah Roasted Barley Talbina & Almond Superfood',
    name: 'নববী সুন্নাহ তালবিনা ও বাদাম মিক্স (Sunnah Barley Talbina)',
    shortTabName: 'সুন্নাহ তালবিনা',
    heritageTitle: 'হাদীসে বর্ণিত হৃদযন্ত্রের প্রশান্তি ও পুষ্টির অনন্য নববী রেসিপি',
    subtitle: 'হালকা ভাজা জৈব যব (Whole Barley), কাঠবাদাম, পেস্তা, কাজু ও মদিনার খেজুর গুঁড়ার পুষ্টিকর মিশ্রণ',
    category: 'sunnah-superfoods',
    categoryLabel: 'সুন্নাহ সুপারফুড · Sunnah Superfoods',
    price: 550,
    defaultFinish: 'brass',
    availability: 'স্টকে আছে · In Stock',
    origin: 'রাজশাহী অর্গানিক মিল ও ঢাকা কিচেন',
    dimensions: 'হাই-ফাইবার বিটা-গ্লুকান (Rich in Beta-Glucan)',
    weightSpec: '৫০০ গ্রাম ফুড জার · Base 500g',
    description:
      'নববী চিকিৎসা ও সুন্নাহর অনুসরণে খোসাসহ জৈব যব (Whole Grain Barley) মৃদু আঁচে ভেজে প্রিমিয়াম কাঠবাদাম, পেস্তা বাদাম, এলাচ ও খেজুর গুঁড়ার সাথে মিলিয়ে তৈরি। মাত্র ৫ মিনিটে দুধ বা পানির সাথে রান্না করে সেহরি, সকালের নাস্তা বা রোগীর পথ্য হিসেবে পরিবেশনযোগ্য।',
    sunnahHadithNote:
      'আয়েশা (রা.) বর্ণনা করেন, রাসূলুল্লাহ (সা.) বলেছেন: "তালবিনা রোগীর হৃদয়কে প্রশান্ত করে এবং শোক ও দুঃখ দূর করে।" (সহীহ বুখারী: ৫৪১৭)',
    ingredientsBangla: 'রোস্টেড অর্গানিক যব (৭৫%), কাঠবাদাম (১০%), কাজুবাদাম (৫%), খেজুর পাউডার (৮%), সবুজ এলাচ (২%)',
    howToConsumeBangla: '১ কাপ দুধে ২ টেবিল চামচ তালবিনা মিক্স দিয়ে ৪–৫ মিনিট মৃদু আঁচে নেড়ে উপরে মধু ও খেজুর কুচি দিয়ে পরিবেশন করুন।',
    nutrition: {
      caloriesPer100g: '৩৬৮ কিলোক্যালরি (368 kcal)',
      protein: '১২.৮ গ্রাম উদ্ভিজ্জ প্রোটিন + ১৪ গ্রাম ফাইবার',
      keyActiveCompound: 'বিটা-গ্লুকান দ্রবণীয় ফাইবার, ট্রিপটোফ্যান ও ম্যাগনেসিয়াম',
      shelfLife: '৯ মাস',
      halalCertNo: 'IFB-HALAL-BD-5190',
      bstiTested: 'Zero Refined Sugar & Zero Maltodextrin',
    },
    engineeringNotes: [
      'সেহরি ও রমজানে দীর্ঘক্ষণ শক্তি ধরে রাখার আদর্শ সুন্নাহ খাবার',
      'হজম সহজকারী এবং মানসিক অবসাদ ও দুর্বলতা দূর করতে সহায়ক',
      'কোনো কৃত্রিম চিনি, মিল্ক পাউডার বা কর্নস্টার্চ নেই',
    ],
    partCount: 6,
    featuredRank: 5,
  },
  {
    id: 'food-kacchi-06',
    banglaTitle: 'পুরান ঢাকার শাহী কাচ্চি ও চিনিগুঁড়া পোলাও কিট',
    englishTitle: 'Old Dhaka Shahi Kacchi Masala & Dinajpur Chinigura Feast Kit',
    name: 'পুরান ঢাকার শাহী কাচ্চি ও চিনিগুঁড়া পোলাও কিট (Shahi Dawat Kit)',
    shortTabName: 'শাহী কাচ্চি কিট',
    heritageTitle: 'চকবাজারের ঐতিহ্যবাহী শাহী বাবুর্চি রেসিপির ১৬ পদের গোটা ও গুঁড়া মশলা + ঢেঁকিছাঁটা সুগন্ধি চাল',
    subtitle: 'জয়ফল, জয়ত্রী, শাহী জিরা, আলুবোখারা, জাফরান-কেওড়া ও দিনাজপুরের প্রিমিয়াম চিনিগুঁড়া চাল',
    category: 'iftar-feast',
    categoryLabel: 'ইফতার ও দাওয়াত · Iftar & Feast',
    price: 920,
    defaultFinish: 'brass',
    availability: 'স্টকে আছে · In Stock',
    origin: 'চকবাজার, পুরান ঢাকা ও দিনাজপুর',
    dimensions: '৬–৮ জনের শাহী দাওয়াত প্যাক (Serves 6–8)',
    weightSpec: '১ কেজি চাল + ২৫০ গ্রাম শাহী মশলা কিট',
    description:
      'ঈদ, জুমার দিন কিংবা পারিবারিক দাওয়াতে ঘরেই পুরান ঢাকার আসল শাহী কাচ্চি ও মোরগ পোলাও রান্নার সম্পূর্ণ কিট। এতে রয়েছে দিনাজপুরের পুরাতন সুগন্ধি চিনিগুঁড়া চাল, হাতে বাছাইকৃত জৈতুন-রোস্টেড গরম মশলা, আলুবোখারা ও কাবাব চিনি।',
    sunnahHadithNote:
      'মেহমানদারী ও পরিবার-পরিজনকে উত্তম হালাল খাবার খাওয়ানো ইসলামের অন্যতম শ্রেষ্ঠ আমল ও সদকা হিসেবে গণ্য।',
    ingredientsBangla: 'দিনাজপুরের সুগন্ধি চাল, শাহী জিরা, বড় এলাচ, জয়ফল, জয়ত্রী, কাবাব চিনি, আলুবোখারা, সাদা গোলমরিচ ও গোলাপ জল',
    howToConsumeBangla: 'প্যাকেটের ভেতরে থাকা পুরান ঢাকার বাবুর্চি স্টেপ-বাই-স্টেপ বাংলা রেসিপি কার্ড অনুসরণ করে সহজেই রান্না করুন।',
    nutrition: {
      caloriesPer100g: '৩৫২ কিলোক্যালরি (352 kcal)',
      protein: '৮.৪ গ্রাম',
      keyActiveCompound: 'প্রাকৃতিক অ্যারোমেটিক অয়েল ও অ্যান্টিঅক্সিডেন্ট মশলা',
      shelfLife: '১২ মাস',
      halalCertNo: 'IFB-HALAL-BD-6023',
      bstiTested: 'Zero MSG (টেস্টিং সল্ট মুক্ত) & Zero Artificial Color',
    },
    engineeringNotes: [
      '১০০% টেস্টিং সল্ট (MSG) ও কৃত্রিম রঙমুক্ত আসল মশলার মিশ্রণ',
      'প্যাকেটের সাথে আলুবোখারা, কিশমিশ ও শাহী দম রেসিপি গাইড সংযুক্ত',
      'জুমার দিনের পারিবারিক আয়োজন ও মেহমানদারীর জন্য প্রস্তুত',
    ],
    partCount: 8,
    featuredRank: 6,
  },
  {
    id: 'food-olive-07',
    banglaTitle: 'ফিলিস্তিনি এক্সট্রা ভার্জিন জৈতুন তেল',
    englishTitle: 'Palestinian Cold-Pressed Extra Virgin Olive Oil (Zaytun)',
    name: 'ফিলিস্তিনি এক্সট্রা ভার্জিন জৈতুন তেল (Palestinian Zaytun Oil)',
    shortTabName: 'জৈতুন তেল (Zaytun)',
    heritageTitle: 'নাবলুস ও জেনিনের প্রাচীন জৈতুন বাগান থেকে প্রথম কোল্ড-প্রেস পদ্ধতিতে সংগৃহীত',
    subtitle: 'কুরআনে বর্ণিত বরকতময় বৃক্ষ জৈতুনের (Olive) খাঁটি এক্সট্রা ভার্জিন তেল — পান ও সালাদে ব্যবহার্য',
    category: 'ghee-oils',
    categoryLabel: 'শাহী ঘি ও তেল · Ghee & Oils',
    price: 1650,
    defaultFinish: 'brass',
    availability: 'সীমিত সংগ্রহ · Limited Harvest',
    origin: 'নাবলুস ও জেনিন, ফিলিস্তিন · Nablus, Palestine',
    dimensions: 'অ্যাসিডিটি < ০.৫% (Ultra-Low Acidity)',
    weightSpec: '৫০০ মিলি ডার্ক গ্লাস বোতল · Base 500ml',
    description:
      'পবিত্র ভূমির শতবর্ষী জৈতুন বৃক্ষের ফল হাতে পেড়ে ২৪ ঘণ্টার মধ্যে যান্ত্রিক ঠান্ডা চাপে নিষ্কাশিত খাঁটি এক্সট্রা ভার্জিন অলিভ অয়েল। পলিফেনল ও ওলেইক অ্যাসিডে ভরপুর এই তেল সরাসরি পান করা, সালাদ ড্রেসিং এবং ত্বকের যত্নে ব্যবহারের জন্য অনন্য।',
    sunnahHadithNote:
      'রাসূলুল্লাহ (সা.) বলেছেন: "তোমরা জৈতুন তেল খাও এবং তা শরীরে মালিশ করো, কেননা এটি বরকতময় বৃক্ষ থেকে উৎপন্ন।" (সুনানে তিরমিজি: ১৮৫১)',
    ingredientsBangla: '১০০% ফিলিস্তিনি কোল্ড-প্রেসড এক্সট্রা ভার্জিন জৈতুন (অলিভ) তেল',
    howToConsumeBangla: 'প্রতিদিন সকালে ১ টেবিল চামচ সরাসরি পান করুন অথবা সালাদ, হুমুস ও হালকা রান্নায় ব্যবহার করুন।',
    nutrition: {
      caloriesPer100g: '৮৮৪ কিলোক্যালরি (Healthy Monounsaturated Fat)',
      protein: '৭৮% মনোআনস্যাচুরেটেড ওলেইক অ্যাসিড',
      keyActiveCompound: 'ওলিওক্যান্থাল (Oleocanthal) ও উচ্চ পলিফেনল অ্যান্টিঅক্সিডেন্ট',
      shelfLife: '২৪ মাস',
      halalCertNo: 'PAL-HALAL-NBL-9012',
      bstiTested: 'Peroxide Value < 8 mEq/kg Certified',
    },
    engineeringNotes: [
      'ফিলিস্তিনি কৃষক সমবায় থেকে ন্যায্যমূল্যে সরাসরি সংগৃহীত',
      'হৃদরোগ প্রতিরোধ ও কোলেস্টেরল নিয়ন্ত্রণে পরীক্ষিত সুন্নাহ খাবার',
      'হালকা সবুজ-সোনালী রঙ ও তাজা জলপাইয়ের প্রাকৃতিক ঘ্রাণ',
    ],
    partCount: 4,
    featuredRank: 7,
  },
  {
    id: 'food-iftar-08',
    banglaTitle: 'রহমত ফ্যামিলি ইফতার ও সুন্নাহ হাদিয়া বক্স',
    englishTitle: 'Rahmat Complete Family Iftar & Sunnah Gift Hamper',
    name: 'রহমত ফ্যামিলি ইফতার ও সুন্নাহ হাদিয়া বক্স (Sunnah Gift Hamper)',
    shortTabName: 'ইফতার হাদিয়া বক্স',
    heritageTitle: 'রমজান, ঈদ ও প্রিয়জনকে হাদিয়া দেওয়ার জন্য ৬টি সেরা সুন্নাহ খাবারের প্রিমিয়াম বক্স',
    subtitle: 'আজওয়া খেজুর, সুন্দরবনের মধু, কালোজিরা তেল, সুন্নাহ তালবিনা, গাওয়া ঘি ও কাঠবাদামের পূর্ণাঙ্গ হ্যাম্পার',
    category: 'iftar-feast',
    categoryLabel: 'ইফতার ও দাওয়াত · Iftar & Feast',
    price: 2450,
    defaultFinish: 'sage',
    availability: 'স্টকে আছে · In Stock',
    origin: 'বারাকাহ সুন্নাহ সিগনেচার হ্যাম্পার · ঢাকা',
    dimensions: 'প্রিমিয়াম রিবন হাদিয়া বক্স (6-Item Luxury Box)',
    weightSpec: '২.৪ কেজি সম্মিলিত ওজন · 2.4kg Total',
    description:
      'বাবা-মা, আত্মীয়-স্বজন কিংবা প্রিয়জনকে রমজান ও ঈদে শ্রেষ্ঠ সুন্নাহ উপহার দেওয়ার জন্য আমাদের সিগনেচার রহমত বক্স। এতে রয়েছে মদিনার আজওয়া খেজুর (২৫০ গ্রাম), সুন্দরবনের খলিশা মধু (৩৫০ গ্রাম), কালোজিরা তেল (২০০ মিলি), সুন্নাহ তালবিনা (৪০০ গ্রাম), পাবনার গাওয়া ঘি (২৫০ গ্রাম) এবং রোস্টেড কাঠবাদাম-কিশমিশ।',
    sunnahHadithNote:
      'রাসূলুল্লাহ (সা.) বলেছেন: "তোমরা পরস্পর হাদিয়া (উপহার) বিনিময় করো, এতে তোমাদের মাঝে ভালোবাসা বৃদ্ধি পাবে।" (আল-আদাবুল মুফরাদ: ৫৯৪)',
    ingredientsBangla: 'আজওয়া খেজুর, সুন্দরবনের মধু, কালোজিরা তেল, তালবিনা মিক্স, পাবনার গাওয়া ঘি, কাঠবাদাম ও বাংলা দোয়া কার্ড',
    howToConsumeBangla: 'পরিবারের প্রতিদিনের সেহরি, ইফতার ও সকালের সুন্নাহ নাস্তার পূর্ণাঙ্গ মাসের প্যাক অথবা হাদিয়া বক্স।',
    nutrition: {
      caloriesPer100g: 'সুষম সুন্নাহ সুপারফুড কম্বিনেশন',
      protein: 'প্রাকৃতিক প্রোটিন, ভিটামিন ও মিনারেল সমৃদ্ধ',
      keyActiveCompound: 'সম্পূর্ণ প্রাকৃতিক অ্যান্টিঅক্সিডেন্ট ও ইমিউনিটি বুস্টার প্যাক',
      shelfLife: '১২ মাস',
      halalCertNo: 'IFB-HALAL-BD-7700',
      bstiTested: 'All 6 Items Individually Lab Tested',
    },
    engineeringNotes: [
      'আলাদাভাবে কিনলে মূল্য ৳২,৯৫০ — কম্বো বক্সে ৳৫০০ বিশেষ সাশ্রয়',
      'বিনামূল্যে কাস্টম বাংলা/ইংরেজি হাদিয়া দোয়া কার্ড সংযুক্ত',
      'প্রতিটি বক্স থেকে এতিমখানার ইফতার তহবিলে বিশেষ অনুদান প্রদান',
    ],
    partCount: 6,
    featuredRank: 8,
  },
];

export interface SunnahComboBundle {
  id: string;
  banglaTitle: string;
  englishTitle: string;
  badgeText: string;
  descriptionBangla: string;
  itemsIncluded: { productId: string; finish: FinishId; label: string }[];
  regularPriceBdt: number;
  comboPriceBdt: number;
}

export const SUNNAH_COMBO_BUNDLES: SunnahComboBundle[] = [
  {
    id: 'combo-morning-sunnah',
    banglaTitle: 'সুন্নাহ মর্নিং ইমিউনিটি কম্বো',
    englishTitle: 'Daily Morning Sunnah Immunity Trio',
    badgeText: '৳৩৮০ সাশ্রয় · Best Seller',
    descriptionBangla:
      'প্রতিদিন সকালের সুন্নাহ আমল ও পরিবারের রোগ প্রতিরোধ ক্ষমতা বাড়াতে মদিনার আজওয়া খেজুর, সুন্দরবনের কাঁচা মধু এবং ঠান্ডা চাপে ভাঙানো কালোজিরা তেলের বিশেষ কম্বো।',
    itemsIncluded: [
      { productId: 'food-ajwa-01', finish: 'brass', label: 'মদিনার আজওয়া খেজুর (৫০০ গ্রাম)' },
      { productId: 'food-honey-02', finish: 'brass', label: 'সুন্দরবনের খলিশা মধু (৫০০ গ্রাম)' },
      { productId: 'food-kalojira-03', finish: 'brass', label: 'খাঁটি কালোজিরা তেল (৫০০ মিলি)' },
    ],
    regularPriceBdt: 3280,
    comboPriceBdt: 2900,
  },
  {
    id: 'combo-shahi-dawat',
    banglaTitle: 'পুরান ঢাকার শাহী জুম্মা ও দাওয়াত কম্বো',
    englishTitle: 'Old Dhaka Friday Feast & Gawa Ghee Bundle',
    badgeText: '৳৩০০ সাশ্রয় · Family Feast',
    descriptionBangla:
      'জুমার দিনের পারিবারিক ভোজ কিংবা মেহমানদারীতে আসল শাহী স্বাদের জন্য পাবনার দানাদার গাওয়া ঘি এবং পুরান ঢাকার কাচ্চি-পোলাও কিট।',
    itemsIncluded: [
      { productId: 'food-ghee-04', finish: 'brass', label: 'পাবনার দানাদার গাওয়া ঘি (৫০০ গ্রাম)' },
      { productId: 'food-kacchi-06', finish: 'brass', label: 'শাহী কাচ্চি ও চিনিগুঁড়া পোলাও কিট' },
      { productId: 'food-talbina-05', finish: 'brass', label: 'নববী সুন্নাহ তালবিনা মিক্স (৫০০ গ্রাম)' },
    ],
    regularPriceBdt: 2850,
    comboPriceBdt: 2550,
  },
  {
    id: 'combo-prophetic-wellness',
    banglaTitle: 'নববী শিফা ও জৈতুন হার্ট কেয়ার প্যাক',
    englishTitle: 'Prophetic Olive & Talbina Heart Care Pack',
    badgeText: '৳৩৫০ সাশ্রয় · Shifa Care',
    descriptionBangla:
      'হৃদযন্ত্রের সুস্থতা, কোলেস্টেরল নিয়ন্ত্রণ ও শারীরিক শক্তির জন্য ফিলিস্তিনি এক্সট্রা ভার্জিন জৈতুন তেল, সুন্নাহ তালবিনা এবং সুন্দরবনের মধু।',
    itemsIncluded: [
      { productId: 'food-olive-07', finish: 'brass', label: 'ফিলিস্তিনি জৈতুন তেল (৫০০ মিলি)' },
      { productId: 'food-talbina-05', finish: 'brass', label: 'সুন্নাহ তালবিনা ও বাদাম মিক্স (৫০০ গ্রাম)' },
      { productId: 'food-honey-02', finish: 'brass', label: 'সুন্দরবনের খলিশা মধু (৫০০ গ্রাম)' },
    ],
    regularPriceBdt: 3350,
    comboPriceBdt: 3000,
  },
];

export interface CartItem {
  productId: string;
  finish: FinishId;
  quantity: number;
  engraving?: string;
  sunnahGiftWrap?: boolean;
}

export interface CartSummary {
  items: (CartItem & { product: Product3DItem; unitPrice: number; lineTotal: number })[];
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  sadaqahContribution: number;
  total: number;
  freeShippingProgress: number;
}

export const FREE_SHIPPING_THRESHOLD = 1500;
export const STANDARD_SHIPPING_FEE = 80;

export interface OrderStatusStepMeta {
  id: OrderStatus;
  stepIndex: number;
  label: string;
  shortLabel: string;
  facility: string;
  description: string;
  estimatedWindow: string;
}

export const ORDER_STATUS_STEPS: OrderStatusStepMeta[] = [
  {
    id: 'placed',
    stepIndex: 1,
    label: 'গ্রন্থ অর্ডার গৃহীত হয়েছে (Order Confirmed)',
    shortLabel: 'অর্ডার গৃহীত',
    facility: 'একটুখানি সাহিত্যের পরশ প্রকাশনা ডেস্ক, ঢাকা',
    description: 'আপনার মৌলিক সাহিত্য সংকলন অর্ডারটি নথিভুক্ত হয়েছে।',
    estimatedWindow: '২৪–৪৮ ঘণ্টা (24–48 Hours)',
  },
  {
    id: 'milling',
    stepIndex: 2,
    label: 'বাঁধাই ও মুদ্রণ মান যাচাই (Print & Binding Check)',
    shortLabel: 'মান যাচাই',
    facility: 'সাহিত্যের পরশ আর্কাইভ ও বাঁধাই শাখা, বাংলাবাজার',
    description: 'হার্ডকভার বাঁধাই, পৃষ্ঠা বিন্যাস ও বুকমার্ক সংযোজন যাচাই সম্পন্ন।',
    estimatedWindow: '১৮–২৪ ঘণ্টা (18–24 Hours)',
  },
  {
    id: 'calibration',
    stepIndex: 3,
    label: 'ওয়াটারপ্রুফ বুক বক্স ও প্যাকিং (Protective Book Packing)',
    shortLabel: 'প্যাকিং সম্পন্ন',
    facility: 'ঢাকা সেন্ট্রাল ডিসপ্যাচ হাব',
    description: 'বইয়ের কোণা অক্ষত রাখতে ৩-স্তরের শক্ত কার্ডবোর্ড বক্স ও র‍্যাপিং করা হয়েছে।',
    estimatedWindow: '১২ ঘণ্টা (Same Day Dispatch)',
  },
  {
    id: 'dispatched',
    stepIndex: 4,
    label: 'কুরিয়ার ডেলিভারি পথে আছে (Out for Delivery)',
    shortLabel: 'ডেলিভারি পথে',
    facility: 'সাহিত্যের পরশ কুরিয়ার ও সুন্দরবন এক্সপ্রেস',
    description: 'ডেলিভারি প্রতিনিধি আপনার ঠিকানার উদ্দেশ্যে রওনা হয়েছেন।',
    estimatedWindow: 'আজকের মধ্যেই ডেলিভারি',
  },
  {
    id: 'delivered',
    stepIndex: 5,
    label: 'পাঠকের হাতে গ্রন্থ হস্তান্তরিত (Delivered)',
    shortLabel: 'ডেলিভারি সম্পন্ন',
    facility: 'পাঠকের ঠিকানায় পৌঁছে দেওয়া হয়েছে',
    description: 'সংকলনটি সফলভাবে পৌঁছে দেওয়া হয়েছে। আপনার পাঠ আনন্দময় হোক!',
    estimatedWindow: 'ডেলিভারি সম্পন্ন',
  },
];

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  'placed',
  'milling',
  'calibration',
  'dispatched',
  'delivered',
];

export interface TrackedOrder {
  id: string;
  uid: string;
  orderNumber: string;
  status: OrderStatus;
  recipientName: string;
  recipientPhone?: string;
  destinationCity: string;
  postalCode: string;
  trackingCode: string;
  courier: string;
  estimatedDelivery: string;
  primaryProductId: string;
  primaryFinish: FinishId;
  itemsSummary: string;
  itemCount: number;
  total: number;
  paymentMethod: 'card' | 'cod';
  createdAtLabel: string;
  updatedAtLabel: string;
  createdAtMs: number;
  source: 'firestore' | 'session';
}

export interface ProductLiveTelemetry {
  productId: string;
  stockCount: number;
  editionNumber: number;
  leadTimeDays: number;
  lastCommissionedCity: string;
  updatedAtLabel: string;
}

export const DEFAULT_PRODUCT_TELEMETRY: Record<string, ProductLiveTelemetry> = {
  'food-ajwa-01': {
    productId: 'food-ajwa-01',
    stockCount: 34,
    editionNumber: 412,
    leadTimeDays: 1,
    lastCommissionedCity: 'ধানমন্ডি, ঢাকা',
    updatedAtLabel: 'প্রথম সংস্করণ মুদ্রণ',
  },
  'food-honey-02': {
    productId: 'food-honey-02',
    stockCount: 19,
    editionNumber: 208,
    leadTimeDays: 1,
    lastCommissionedCity: 'উত্তরা, ঢাকা',
    updatedAtLabel: 'দ্বিতীয় সংস্করণ মুদ্রণ',
  },
  'food-kalojira-03': {
    productId: 'food-kalojira-03',
    stockCount: 42,
    editionNumber: 519,
    leadTimeDays: 1,
    lastCommissionedCity: 'নাসিরাবাদ, চট্টগ্রাম',
    updatedAtLabel: 'কাব্য সংস্করণ',
  },
  'food-ghee-04': {
    productId: 'food-ghee-04',
    stockCount: 27,
    editionNumber: 334,
    leadTimeDays: 1,
    lastCommissionedCity: 'জিন্দাবাজার, সিলেট',
    updatedAtLabel: 'বিশেষ সংকলন',
  },
  'food-talbina-05': {
    productId: 'food-talbina-05',
    stockCount: 48,
    editionNumber: 615,
    leadTimeDays: 1,
    lastCommissionedCity: 'মিরপুর, ঢাকা',
    updatedAtLabel: 'আজকের সংস্করণ',
  },
  'food-kacchi-06': {
    productId: 'food-kacchi-06',
    stockCount: 31,
    editionNumber: 289,
    leadTimeDays: 1,
    lastCommissionedCity: 'বনানী, ঢাকা',
    updatedAtLabel: 'আজকের সংস্করণ',
  },
  'food-olive-07': {
    productId: 'food-olive-07',
    stockCount: 16,
    editionNumber: 174,
    leadTimeDays: 1,
    lastCommissionedCity: 'গুলশান, ঢাকা',
    updatedAtLabel: 'আজকের সংস্করণ',
  },
  'food-iftar-08': {
    productId: 'food-iftar-08',
    stockCount: 22,
    editionNumber: 156,
    leadTimeDays: 1,
    lastCommissionedCity: 'বগুড়া সদর',
    updatedAtLabel: 'হাদিয়া সংস্করণ',
  },
};

export const INITIAL_DEMO_ORDERS: TrackedOrder[] = [
  {
    id: 'ord_demo_849201',
    uid: 'studio_demo_member',
    orderNumber: 'AF-849201',
    status: 'dispatched',
    recipientName: 'রাফসান জানি (Rafsan Jani)',
    destinationCity: 'ধানমন্ডি, ঢাকা (Dhaka)',
    postalCode: '1209',
    trackingCode: 'ESP-849201-DHK',
    courier: 'Sahityer Parash Book Courier',
    estimatedDelivery: 'আজকের মধ্যেই ডেলিভারি · Out for Delivery',
    primaryProductId: 'food-ajwa-01',
    primaryFinish: 'brass',
    itemsSummary: '1× শব্দের জায়নামাজ: ঈমান ও মৌলিক গদ্য সংকলন (হার্ডকভার) + 1× ভোরের আজান কাব্যগ্রন্থ',
    itemCount: 2,
    total: 700,
    paymentMethod: 'cod',
    createdAtLabel: 'Oct 22, 2026',
    updatedAtLabel: '১ ঘণ্টা আগে',
    createdAtMs: 1761120000000,
    source: 'session',
  },
  {
    id: 'ord_demo_731044',
    uid: 'studio_demo_member',
    orderNumber: 'AF-731044',
    status: 'calibration',
    recipientName: 'রাফসান জানি (Rafsan Jani)',
    destinationCity: 'নাসিরাবাদ, চট্টগ্রাম (Chattogram)',
    postalCode: '4000',
    trackingCode: 'ESP-731044-CTG',
    courier: 'Steadfast Book Express Courier',
    estimatedDelivery: 'আগামীকাল ডেলিভারি · Book Box Packing',
    primaryProductId: 'food-ghee-04',
    primaryFinish: 'titanium',
    itemsSummary: '1× হৃদয়ের গহীনে আলোর পরশ ও মুসাফিরের ডায়েরি (কালেক্টরস বক্স)',
    itemCount: 1,
    total: 750,
    paymentMethod: 'card',
    createdAtLabel: 'Oct 19, 2026',
    updatedAtLabel: 'গতকাল',
    createdAtMs: 1760860000000,
    source: 'session',
  },
  {
    id: 'ord_demo_619820',
    uid: 'studio_demo_member',
    orderNumber: 'AF-619820',
    status: 'delivered',
    recipientName: 'রাফসান জানি (Rafsan Jani)',
    destinationCity: 'উত্তরা সেক্টর ৭, ঢাকা (Dhaka)',
    postalCode: '1230',
    trackingCode: 'ESP-619820-UTR',
    courier: 'Sahityer Parash Book Courier',
    estimatedDelivery: 'ডেলিভারি সম্পন্ন · Reader Verified',
    primaryProductId: 'food-iftar-08',
    primaryFinish: 'sage',
    itemsSummary: '1× একটুখানি সাহিত্যের পরশ — ৪টি মৌলিক সংকলন হাদিয়া বক্স সেট',
    itemCount: 1,
    total: 1450,
    paymentMethod: 'cod',
    createdAtLabel: 'Oct 12, 2026',
    updatedAtLabel: 'Oct 13, 2026',
    createdAtMs: 1760256000000,
    source: 'session',
  },
];

export function getOrderStatusMeta(status: OrderStatus): OrderStatusStepMeta {
  return ORDER_STATUS_STEPS.find((s) => s.id === status) ?? ORDER_STATUS_STEPS[0];
}

export function getNextOrderStatus(status: OrderStatus): OrderStatus | null {
  const idx = ORDER_STATUS_SEQUENCE.indexOf(status);
  if (idx === -1 || idx >= ORDER_STATUS_SEQUENCE.length - 1) {
    return null;
  }
  return ORDER_STATUS_SEQUENCE[idx + 1];
}

export function getOrderProgressPercent(status: OrderStatus): number {
  const meta = getOrderStatusMeta(status);
  return Math.round((meta.stepIndex / ORDER_STATUS_STEPS.length) * 100);
}

export function filterTrackedOrders(
  orders: TrackedOrder[],
  statusFilter: 'all' | 'active' | 'dispatched' | 'delivered',
  searchQuery = ''
): TrackedOrder[] {
  const q = searchQuery.trim().toLowerCase();
  return orders
    .filter((order) => {
      if (statusFilter === 'active') {
        if (order.status === 'delivered') return false;
      } else if (statusFilter === 'dispatched') {
        if (order.status !== 'dispatched') return false;
      } else if (statusFilter === 'delivered') {
        if (order.status !== 'delivered') return false;
      }

      if (!q) return true;
      return (
        order.orderNumber.toLowerCase().includes(q) ||
        order.trackingCode.toLowerCase().includes(q) ||
        order.itemsSummary.toLowerCase().includes(q) ||
        order.destinationCity.toLowerCase().includes(q) ||
        order.recipientName.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => b.createdAtMs - a.createdAtMs);
}

export function sanitizeOrderFields(input: {
  orderNumber: string;
  recipientName: string;
  destinationCity: string;
  postalCode: string;
  trackingCode: string;
  courier: string;
  estimatedDelivery: string;
  primaryProductId: string;
  primaryFinish: FinishId;
  itemsSummary: string;
  itemCount: number;
  total: number;
  paymentMethod: 'card' | 'cod';
}) {
  const cleanOrderNum = /^AF-[0-9]{6}$/.test(input.orderNumber)
    ? input.orderNumber
    : `AF-${Math.floor(100000 + Math.random() * 900000)}`;
  const cleanRecipient =
    (input.recipientName || 'বারাকাহ গ্রাহক').trim().slice(0, 60) || 'বারাকাহ গ্রাহক';
  const cleanCity =
    (input.destinationCity || 'ঢাকা (Dhaka)').trim().slice(0, 60) || 'ঢাকা (Dhaka)';
  const cleanPostal = (input.postalCode || '1209').trim().slice(0, 20) || '1209';
  const rawTracking = (input.trackingCode || `BD-${cleanOrderNum.slice(3)}-DHK`)
    .toUpperCase()
    .replace(/[^A-Z0-9\-]/g, '')
    .slice(0, 32);
  const cleanTracking = rawTracking.length >= 4 ? rawTracking : 'BD-100000-DHK';
  const cleanCourier =
    (input.courier || 'Barakah Express Home Delivery').trim().slice(0, 48) ||
    'Barakah Express';
  const cleanEst =
    (input.estimatedDelivery || '২৪–৪৮ ঘণ্টা হোম ডেলিভারি').trim().slice(0, 40) ||
    '২৪–৪৮ ঘণ্টা ডেলিভারি';
  const validPid = PRODUCT_CATALOG.some((p) => p.id === input.primaryProductId)
    ? input.primaryProductId
    : PRODUCT_CATALOG[0].id;
  const validFinish: FinishId = FINISH_ORDER.includes(input.primaryFinish)
    ? input.primaryFinish
    : 'brass';
  const cleanSummary =
    (input.itemsSummary || '1× মদিনার ভিআইপি আজওয়া খেজুর (৫০০ গ্রাম)')
      .trim()
      .slice(0, 240) || '1× মদিনার ভিআইপি আজওয়া খেজুর';
  const cleanCount = Math.max(1, Math.min(99, Math.round(input.itemCount || 1)));
  const cleanTotal = Math.max(1, Math.min(1000000, Math.round(input.total || 1450)));
  const cleanPayment: 'card' | 'cod' = input.paymentMethod === 'cod' ? 'cod' : 'card';

  return {
    orderNumber: cleanOrderNum,
    recipientName: cleanRecipient,
    destinationCity: cleanCity,
    postalCode: cleanPostal,
    trackingCode: cleanTracking,
    courier: cleanCourier,
    estimatedDelivery: cleanEst,
    primaryProductId: validPid,
    primaryFinish: validFinish,
    itemsSummary: cleanSummary,
    itemCount: cleanCount,
    total: cleanTotal,
    paymentMethod: cleanPayment,
  };
}

export function filterAndSortProducts(
  products: Product3DItem[],
  category: ProductCategory,
  searchQuery: string,
  sortBy: SortOption
): Product3DItem[] {
  const q = searchQuery.trim().toLowerCase();
  const filtered = products.filter((item) => {
    if (category !== 'all' && item.category !== category) return false;
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.banglaTitle.toLowerCase().includes(q) ||
      item.englishTitle.toLowerCase().includes(q) ||
      item.heritageTitle.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.categoryLabel.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.origin.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered];
  if (sortBy === 'price-asc') {
    sorted.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    sorted.sort((a, b) => b.price - a.price);
  } else {
    sorted.sort((a, b) => a.featuredRank - b.featuredRank);
  }
  return sorted;
}

export function calculateCartSummary(
  cart: CartItem[],
  promoCode = '',
  catalog: Product3DItem[] = PRODUCT_CATALOG
): CartSummary {
  const detailedItems: (CartItem & {
    product: Product3DItem;
    unitPrice: number;
    lineTotal: number;
  })[] = [];
  let subtotal = 0;
  let itemCount = 0;

  for (const entry of cart) {
    if (entry.quantity <= 0) continue;
    const product =
      catalog.find((p) => p.id === entry.productId) ||
      PRODUCT_CATALOG.find((p) => p.id === entry.productId);
    if (!product) continue;
    const qty = Math.min(99, Math.max(1, Math.round(entry.quantity)));
    const unitPrice = getPackPrice(product.price, entry.finish);
    const lineTotal = unitPrice * qty;
    subtotal += lineTotal;
    itemCount += qty;
    detailedItems.push({
      ...entry,
      quantity: qty,
      product,
      unitPrice,
      lineTotal,
    });
  }

  const normalizedPromo = promoCode.trim().toUpperCase();
  let discountRate = 0;
  if (
    normalizedPromo === 'BISMILLAH10' ||
    normalizedPromo === 'RAMADAN10' ||
    normalizedPromo === 'BARAKAH10'
  ) {
    discountRate = 0.1;
  } else if (
    normalizedPromo === 'RAMADAN15' ||
    normalizedPromo === 'EIDMUBARAK' ||
    normalizedPromo === 'SUNNAH15'
  ) {
    discountRate = 0.15;
  } else if (normalizedPromo === 'SUNNAH20') {
    discountRate = 0.2;
  }

  const discount = discountRate > 0 ? Math.round(subtotal * discountRate) : 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shipping =
    itemCount === 0 || discountedSubtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : STANDARD_SHIPPING_FEE;
  const total = discountedSubtotal + shipping;
  // 2.5% Zakat/Sadaqah Orphanage Iftar & Food Fund Contribution
  const sadaqahContribution = Math.round(discountedSubtotal * 0.025);
  const freeShippingProgress = Math.min(
    100,
    Math.round((discountedSubtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );

  return {
    items: detailedItems,
    itemCount,
    subtotal,
    discount,
    shipping,
    sadaqahContribution,
    total,
    freeShippingProgress,
  };
}

/**
 * Pure helper computing exploded-view displacement vector for a given part offset
 */
export function computeExplodedOffset(
  basePosition: [number, number, number],
  explodeVector: [number, number, number],
  explodeRatio: number
): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, explodeRatio));
  return [
    basePosition[0] + explodeVector[0] * clamped,
    basePosition[1] + explodeVector[1] * clamped,
    basePosition[2] + explodeVector[2] * clamped,
  ];
}

/**
 * Pure helper converting and formatting BDT prices into the active currency
 */
export function formatPriceByCurrency(
  bdtAmount: number,
  currency: CurrencyCode = 'BDT'
): string {
  const meta = CURRENCY_META[currency] || CURRENCY_META.BDT;
  const converted = Math.max(0, bdtAmount) * meta.rateFromBdt;
  if (currency === 'BDT') {
    return `${meta.symbol}${Math.round(converted).toLocaleString('en-US')}`;
  }
  return `${meta.symbol}${Math.round(converted).toLocaleString('en-US')}`;
}

export const PRODUCT_SUB_ASSEMBLIES: Record<string, ProductSubAssembly[]> = {
  'food-ajwa-01': [
    {
      partIndex: 0,
      code: 'LAB-01',
      name: 'মদিনা আল-আলিযাহ অরিজিন গ্রেডিং',
      material: 'A-Grade Jumbo Soft Ajwa',
      tolerance: 'Moisture 14%',
      recommendedExplode: 0.35,
    },
    {
      partIndex: 1,
      code: 'LAB-02',
      name: 'জিরো গ্লুকোজ ও ফুড-সেফটি চেক',
      material: '100% Natural Date Fructose',
      tolerance: '0% Added Sugar',
      recommendedExplode: 0.65,
    },
    {
      partIndex: 2,
      code: 'LAB-03',
      name: 'ভ্যাকুয়াম সিলড কাঁচের জার',
      material: 'BPA-Free Borosilicate Glass',
      tolerance: 'Hermetic Seal',
      recommendedExplode: 0.9,
    },
  ],
};

export function getProductSubAssemblies(productId: string): ProductSubAssembly[] {
  return (
    PRODUCT_SUB_ASSEMBLIES[productId] ||
    PRODUCT_SUB_ASSEMBLIES['food-ajwa-01']
  );
}

export function createSavedStudioBuild(input: {
  productId: string;
  finish: FinishId;
  lighting: StudioLightingId;
  explodeRatio: number;
  engraving?: string;
}): SavedStudioBuild {
  const product =
    PRODUCT_CATALOG.find((p) => p.id === input.productId) || PRODUCT_CATALOG[0];
  const validFinish: FinishId = FINISH_ORDER.includes(input.finish)
    ? input.finish
    : product.defaultFinish;
  const validLighting: StudioLightingId = STUDIO_LIGHTING_ORDER.includes(
    input.lighting
  )
    ? input.lighting
    : 'atelier-daylight';
  const clampedExplode =
    Math.round(Math.max(0, Math.min(1, input.explodeRatio || 0)) * 100) / 100;
  const cleanEngraving = (input.engraving || '')
    .toUpperCase()
    .replace(/[^A-Z0-9\-\s.]/g, '')
    .trim()
    .slice(0, 24);
  const finishShort = FINISH_OPTIONS[validFinish].shortName;

  return {
    id: `bld_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: `${product.shortTabName} · ${finishShort}${cleanEngraving ? ` [${cleanEngraving}]` : ''}`,
    productId: product.id,
    finish: validFinish,
    lighting: validLighting,
    explodeRatio: clampedExplode,
    engraving: cleanEngraving,
    createdAtLabel: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  };
}

export interface StoreBrandSettings {
  brandNameBangla: string;
  brandNameEnglish: string;
  logoUrl: string;
  heroBasmalahText: string;
  heroHeadlineBangla: string;
  heroDescriptionBangla: string;
  promoBannerText: string;
  footerAddressBangla: string;
  hotlinePhone: string;
}

export const DEFAULT_STORE_BRAND_SETTINGS: StoreBrandSettings = {
  brandNameBangla: 'বারাকাহ সুন্নাহ ফুডস',
  brandNameEnglish: 'Barakah Sunnah Foods',
  logoUrl: '',
  heroBasmalahText: 'বিসমিল্লাহির রাহমানির রাহিম · ১০০% হালাল ও বিএসটিআই অনুমোদিত · মদিনা ও সুন্দরবনের খাঁটি সংগ্রহ',
  heroHeadlineBangla:
    'খাঁটি সুন্নাহ খাবার ও বিশুদ্ধ হালাল বাজার — সরাসরি উৎস থেকে আপনার ঘরে',
  heroDescriptionBangla:
    'মদিনার আল-আলিযাহ বাগানের ভিআইপি আজওয়া খেজুর, সুন্দরবনের মৌয়ালদের সংগৃহীত কাঁচা খলিশা মধু, কাঠের ঘানিতে ভাঙানো কালোজিরা তেল, পাবনার দানাদার গাওয়া ঘি এবং নববী সুন্নাহ তালবিনা — কোনো কৃত্রিম চিনি বা ভেজাল ছাড়াই।',
  promoBannerText: 'ফ্রি ডেলিভারি ৳১,৫০০+ · কোড: BISMILLAH10',
  footerAddressBangla: 'বিশুদ্ধ সুন্নাহ ও হালাল খাবারের বিশ্বস্ত প্রতিষ্ঠান · ঢাকা, বাংলাদেশ',
  hotlinePhone: '+880 1711-000000',
};

export const CATEGORY_LABELS_MAP: Record<Exclude<ProductCategory, 'all'>, string> = {
  'dates-honey': 'খেজুর ও মধু · Dates & Honey',
  'sunnah-superfoods': 'সুন্নাহ সুপারফুড · Sunnah Superfoods',
  'ghee-oils': 'শাহী ঘি ও তেল · Ghee & Cold-Pressed Oils',
  'iftar-feast': 'ইফতার ও দাওয়াত · Iftar & Royal Feast',
};

export function createCustomProductItem(
  input: {
    banglaTitle: string;
    englishTitle?: string;
    shortTabName?: string;
    price: number;
    category: Exclude<ProductCategory, 'all'>;
    origin?: string;
    subtitle?: string;
    description?: string;
    sunnahHadithNote?: string;
    halalCertNo?: string;
    customImageUrl?: string;
  },
  existingCount = 8
): Product3DItem {
  const cleanBangla = input.banglaTitle.trim() || 'নতুন সুন্নাহ খাবার';
  const cleanEnglish = (input.englishTitle || cleanBangla).trim();
  const cleanShort = (input.shortTabName || cleanBangla.slice(0, 18)).trim();
  const cleanPrice = Math.max(50, Math.round(Number(input.price) || 500));
  const category = input.category || 'dates-honey';

  return {
    id: `food-custom-${Date.now()}`,
    banglaTitle: cleanBangla,
    englishTitle: cleanEnglish,
    name: `${cleanBangla} (${cleanEnglish})`,
    shortTabName: cleanShort,
    heritageTitle: input.origin?.trim() || 'বারাকাহ হালাল ও সুন্নাহ সংগ্রহ',
    subtitle:
      input.subtitle?.trim() ||
      '১০০% হালাল, কেমিক্যালমুক্ত ও ল্যাব পরীক্ষিত প্রিমিয়াম ফুড গ্রেড প্যাক',
    category,
    categoryLabel: CATEGORY_LABELS_MAP[category] || CATEGORY_LABELS_MAP['dates-honey'],
    price: cleanPrice,
    defaultFinish: 'brass',
    availability: 'স্টকে আছে · In Stock',
    origin: input.origin?.trim() || 'ঢাকা, বাংলাদেশ · Barakah Verified Source',
    dimensions: 'প্রিমিয়াম ফুড-গ্রেড জার (Food-Grade Jar)',
    weightSpec: '৫০০ গ্রাম / ১ কেজি / ২ কেজি প্যাক',
    description:
      input.description?.trim() ||
      `${cleanBangla} সরাসরি বিশ্বস্ত উৎস থেকে সংগৃহীত এবং বিএসটিআই ও হালাল ফুড গাইডলাইন মেনে হাইজেনিকভাবে প্যাকিং করা।`,
    sunnahHadithNote:
      input.sunnahHadithNote?.trim() ||
      'সুন্নাহ ও হালাল খাবার গ্রহণে দেহ ও মনে বরকত লাভ হয় — ১০০% বিশুদ্ধতার নিশ্চয়তা।',
    ingredientsBangla: `১০০% খাঁটি ${cleanBangla} (কোনো কৃত্রিম প্রিজারভেটিভ বা রং নেই)।`,
    howToConsumeBangla:
      'পরিবারের সবার প্রতিদিনের নাস্তায় বা সুন্নাহ খাবার হিসেবে সরাসরি পরিবেশন করুন।',
    nutrition: {
      caloriesPer100g: '310 kcal',
      protein: '4.5g Protein · Rich Nutrients',
      keyActiveCompound: '100% Natural Organic Bio-Actives',
      shelfLife: '১২ মাস (12 Months)',
      halalCertNo: input.halalCertNo?.trim() || 'BSTI-HALAL-2026',
      bstiTested: 'BCSIR ও BSTI মান পরীক্ষিত',
    },
    engineeringNotes: [
      '100% Halal & Lab Verified',
      'Zero Artificial Sugar or Preservatives',
      'Hermetically Sealed Glass Jar',
    ],
    partCount: 3,
    featuredRank: existingCount + 1,
    customImageUrl: input.customImageUrl?.trim() || undefined,
  };
}

export const STORE_OWNER_EMAIL = 'rafsanjani2003rafsan@gmail.com';
export const DEFAULT_ADMIN_PASSCODE = 'barakah786';

export function isAuthorizedStoreOwnerEmail(
  email: string | null | undefined
): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === STORE_OWNER_EMAIL.toLowerCase();
}

export function verifyAdminAccess(
  inputOrParams:
    | string
    | {
        userEmail?: string | null;
        enteredPasscode: string;
        storedPasscode?: string;
      },
  activePasscode: string = DEFAULT_ADMIN_PASSCODE,
  userEmail?: string | null
): boolean {
  if (typeof inputOrParams === 'object' && inputOrParams !== null) {
    if (isAuthorizedStoreOwnerEmail(inputOrParams.userEmail)) {
      return true;
    }
    const cleanInput = (inputOrParams.enteredPasscode || '').trim();
    const cleanTarget = (
      inputOrParams.storedPasscode || DEFAULT_ADMIN_PASSCODE
    ).trim();
    return cleanInput.length >= 4 && cleanInput === cleanTarget;
  }

  if (isAuthorizedStoreOwnerEmail(userEmail)) {
    return true;
  }
  const cleanInput = (inputOrParams || '').trim();
  const cleanTarget = (activePasscode || DEFAULT_ADMIN_PASSCODE).trim();
  return cleanInput.length >= 4 && cleanInput === cleanTarget;
}

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => BENGALI_DIGITS[Number(d)] ?? d);
}

export function formatBdt(amount: number): string {
  const rounded = Math.max(0, Math.round(Number(amount) || 0));
  const formatted = rounded.toLocaleString('en-IN');
  return `৳${toBengaliDigits(formatted)}`;
}


