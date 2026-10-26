import { toBengaliDigits } from './catalog.js';

export type LiteraryCategoryId =
  | 'all'
  | 'iman-life'
  | 'original-prose'
  | 'poetry-verse'
  | 'soul-family'
  | 'history-journey'
  | 'short-fiction'
  | (string & {});

export interface LiteraryCategoryMeta {
  id: LiteraryCategoryId;
  labelBn: string;
  labelEn: string;
  descriptionBn: string;
}

export const LITERARY_CATEGORIES: LiteraryCategoryMeta[] = [
  {
    id: 'all',
    labelBn: 'সব রচনা',
    labelEn: 'All Writings',
    descriptionBn: 'একটুখানি সাহিত্যের পরশ-এর সকল মৌলিক প্রবন্ধ, কবিতা, গল্প ও জীবনবোধমূলক রচনা',
  },
  {
    id: 'iman-life',
    labelBn: 'ঈমান ও জীবনবোধ',
    labelEn: 'Faith & Worldview',
    descriptionBn: 'কুরআন ও সুন্নাহর আলোকে বিশুদ্ধ ঈমান, তাওহীদ এবং সমকালীন জীবনদৃষ্টি',
  },
  {
    id: 'original-prose',
    labelBn: 'মৌলিক গদ্য ও প্রবন্ধ',
    labelEn: 'Original Essays',
    descriptionBn: 'চিন্তাশীল গদ্য, সমাজ-সংস্কৃতি বিশ্লেষণ এবং নিজস্ব সাহিত্যিক দৃষ্টিভঙ্গি',
  },
  {
    id: 'poetry-verse',
    labelBn: 'কবিতা ও কাব্য',
    labelEn: 'Poetry & Verse',
    descriptionBn: 'ঈমানী জাগরণ, প্রকৃতি, প্রার্থনা ও নন্দনতত্ত্বের মৌলিক বাংলা কবিতা',
  },
  {
    id: 'soul-family',
    labelBn: 'আত্মশুদ্ধি ও পরিবার',
    labelEn: 'Soul & Family',
    descriptionBn: 'হৃদয়ের পরিশুদ্ধি, পারিবারিক প্রশান্তি, তারবিয়াত ও আদর্শ সমাজ গঠন',
  },
  {
    id: 'history-journey',
    labelBn: 'ইতিহাস ও ভ্রমণ',
    labelEn: 'History & Travelogue',
    descriptionBn: 'ইসলামী সভ্যতার সোনালি অধ্যায়, ঐতিহাসিক সফরনামা ও ঐতিহ্যের শেকড় সন্ধান',
  },
  {
    id: 'short-fiction',
    labelBn: 'গল্প ও কথা-সাহিত্য',
    labelEn: 'Moral Short Stories',
    descriptionBn: 'জীবনঘনিষ্ঠ শিক্ষণীয় গল্প, মানবিক মূল্যবোধ ও হৃদয়ছোঁয়া কথা-সাহিত্য',
  },
];

export interface LiteraryBrandConfig {
  siteNameBn: string;
  taglineBn: string;
  logoMonogramBn: string;
  logoImageUrl: string;
  editorialManifestoBn: string;
  hijriDateBn: string;
  banglaDateBn: string;
  autoUpdateDate?: boolean;
  chiefEditorBn: string;
  publisherNoteBn: string;
  addressBn: string;
  phoneBn: string;
  email: string;
}

export const DEFAULT_LITERARY_BRAND: LiteraryBrandConfig = {
  siteNameBn: 'একটুখানি সাহিত্যের পরশ',
  taglineBn: 'মৌলিক ইসলামী সাহিত্য, প্রবন্ধ ও জীবনবোধের অনলাইন প্রকাশনা',
  logoMonogramBn: 'এস',
  logoImageUrl: '',
  editorialManifestoBn:
    'আল-ইতিছামের আদর্শিক প্রেরণায় উজ্জীবিত, কিন্তু কোনো বাঁধাধরা মাসিক পত্রিকার গণ্ডিতে সীমাবদ্ধ নয় — আমাদের নিজস্ব কলমে রচিত মৌলিক সাহিত্য, প্রবন্ধ, কাব্য ও জীবনজিজ্ঞাসার এক পরিশীলিত প্রাঙ্গণ।',
  hijriDateBn: '১৩ জমাদিউল আউয়াল ১৪৪৮ হিজরি',
  banglaDateBn: '৯ কার্তিক ১৪৩৩ বঙ্গাব্দ',
  autoUpdateDate: true,
  chiefEditorBn: 'উস্তায আব্দুল্লাহ আল-মাহমুদ',
  publisherNoteBn: 'একটুখানি সাহিত্যের পরশ প্রকাশনা ও গবেষণা সংসদ',
  addressBn: 'বাড়ি ১৪, রোড ৭, ধানমন্ডি, ঢাকা-১২০৯, বাংলাদেশ',
  phoneBn: '+৮৮০ ১৭১১-৪৪৮৮৯৯',
  email: 'editorial@sahityerparash.com',
};

export interface LiteraryAuthor {
  id: string;
  nameBn: string;
  monogramBn: string;
  designationBn: string;
  specializationBn: string;
  bioBn: string;
  publishedWritingsCount: number;
  avatarUrl?: string;
}

export const LITERARY_AUTHORS: LiteraryAuthor[] = [
  {
    id: 'author-mahmud',
    nameBn: 'উস্তায আব্দুল্লাহ আল-মাহমুদ',
    monogramBn: 'আম',
    designationBn: 'প্রধান সম্পাদক ও মৌলিক গদ্যকার',
    specializationBn: 'ঈমানী দর্শন ও সাহিত্য সমালোচনা',
    bioBn: 'দেড় দশকেরও বেশি সময় ধরে বাংলা ভাষায় বিশুদ্ধ ইসলামী সাহিত্য, মননশীল গদ্য ও চিন্তাশীল প্রবন্ধ রচনায় নিবেদিত।',
    publishedWritingsCount: 28,
  },
  {
    id: 'author- Maryam',
    nameBn: 'মারইয়াম বিনতে সুলাইমান',
    monogramBn: 'মস',
    designationBn: 'কথা-সাহিত্যিক ও পারিবারিক প্রাবন্ধিক',
    specializationBn: 'আত্মশুদ্ধি, পরিবার ও তারবিয়াত',
    bioBn: 'মুসলিম পরিবারের আত্মিক প্রশান্তি, সন্তান প্রতিপালন ও নারীর মর্যাদা বিষয়ে হৃদয়গ্রাহী মৌলিক গদ্যের রচয়িতা।',
    publishedWritingsCount: 19,
  },
  {
    id: 'author-farhan',
    nameBn: 'কবি ফারহান ইবনে আমিন',
    monogramBn: 'ফাআ',
    designationBn: 'কাব্য ও ছন্দ বিভাগীয় সম্পাদক',
    specializationBn: 'কবিতা, কাব্য ও নন্দনতত্ত্ব',
    bioBn: 'রাতের তাহাজ্জুদ, ফজরের আজান এবং বাংলার সবুজ প্রকৃতির সাথে ঈমানী অনুভূতির মেলবন্ধনে মৌলিক কবিতা রচনা করেন।',
    publishedWritingsCount: 24,
  },
  {
    id: 'author-habib',
    nameBn: 'শাইখ হাবিবুর রহমান আল-মাদানী',
    monogramBn: 'হার',
    designationBn: 'গবেষক ও সাওয়াল-জওয়াব তত্ত্বাবধায়ক',
    specializationBn: 'সাহিত্য নীতিমালা ও জীবন জিজ্ঞাসা',
    bioBn: 'কুরআন ও সহীহ সুন্নাহর আলোকে আধুনিক সাহিত্য, সংস্কৃতি ও পাঠকের জীবনঘনিষ্ঠ প্রশ্নের দালিলিক সমাধান প্রদানকারী।',
    publishedWritingsCount: 32,
  },
  {
    id: 'author-tariq',
    nameBn: 'ড. তারিকুল ইসলাম নদভী',
    monogramBn: 'তান',
    designationBn: 'ইতিহাস গবেষক ও ভ্রমণলেখক',
    specializationBn: 'ইসলামী সভ্যতার ইতিহাস ও সফরনামা',
    bioBn: 'আন্দালুসিয়া, বাগদাদ ও বাংলার প্রাচীন ইসলামী সভ্যতার শেকড় সন্ধানী লেখক এবং ঐতিহাসিক ভ্রমণগদ্যের রূপকার।',
    publishedWritingsCount: 15,
  },
];

export interface LiteraryArticle {
  id: string;
  title: string;
  subtitle: string;
  category: Exclude<LiteraryCategoryId, 'all'>;
  categoryBn: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  volumeId: string;
  volumeTitle: string;
  publishedAtBn: string;
  readTimeBn: string;
  excerpt: string;
  pullQuote: string;
  paragraphs: string[];
  citations: string[];
  likesCount: number;
  isLeadEditorial?: boolean;
  isFeatured?: boolean;
  coverMotif:
    | 'manuscript-lantern'
    | 'inkwell-scroll'
    | 'jasmine-notebook'
    | 'archway-dome'
    | 'compass-chronicle'
    | 'olive-branch';
  customCoverUrl?: string;
}

export const INITIAL_LITERARY_ARTICLES: LiteraryArticle[] = [
  {
    id: 'art-1',
    title: 'শব্দের আমানত ও কলমের ইবাদত: আমাদের মৌলিক সাহিত্যের নবযাত্রা',
    subtitle: 'কেন আমরা মাসিক সাময়িকীর গণ্ডি পেরিয়ে নিজস্ব মৌলিক রচনার ধারা বেছে নিয়েছি',
    category: 'original-prose',
    categoryBn: 'মৌলিক গদ্য ও প্রবন্ধ',
    authorId: 'author-mahmud',
    authorName: 'উস্তায আব্দুল্লাহ আল-মাহমুদ',
    authorRole: 'প্রধান সম্পাদক ও মৌলিক গদ্যকার',
    volumeId: 'vol-1',
    volumeTitle: 'সংকলন ০১: শব্দের জায়নামাজ',
    publishedAtBn: '৮ কার্তিক ১৪৩৩ বঙ্গাব্দ',
    readTimeBn: '৮ মিনিট পাঠ',
    excerpt:
      'মানুষের উচ্চারিত প্রতিটি শব্দ ও কলমের প্রতিটি আঁচড় মহান রবের দরবারে এক সুমহান আমানত। সাহিত্য যখন কেবল বিনোদনের খোলস ছেড়ে আত্মার খোরাক ও সত্যের সাক্ষ্য হয়ে ওঠে, তখনই তা ইবাদতে রূপান্তরিত হয়।',
    pullQuote:
      'কলমের কালি যখন তাওহীদের আলো ও মানবিক দরদে সিক্ত হয়, তখন একটি সাধারণ গদ্যও পাঠকের হৃদয়ে চিরস্থায়ী জায়নামাজ বিছিয়ে দেয়।',
    paragraphs: [
      'মানুষকে আল্লাহ তাআলা ভাষা ও বয়ানের যে অনুপম নেয়ামত দান করেছেন, তার সর্বোত্তম প্রকাশ ঘটে সাহিত্যের মাধ্যমে। কিন্তু পরিতাপের বিষয় হলো, সমকালীন সাহিত্যের একটি বড় অংশ আজ উদ্দেশ্যহীন কোলাহল ও নৈতিক শূন্যতায় আক্রান্ত। এই প্রেক্ষাপটে "একটুখানি সাহিত্যের পরশ" আত্মপ্রকাশ করেছে এক স্বতন্ত্র অঙ্গীকার নিয়ে।',
      'আমরা আল-ইতিছামের সেই দালিলিক গাম্ভীর্য ও বিশুদ্ধতার আদর্শকে গভীরভাবে ভালোবাসি। তবে আমাদের পথচলা কোনো নির্দিষ্ট মাসের পঞ্জিকায় আবদ্ধ সাময়িকী বা ম্যাগাজিন প্রকাশ করা নয়; বরং আমাদের নিজস্ব লেখকদের হৃদয় নিংড়ানো মৌলিক গদ্য, প্রবন্ধ, কাব্য ও কথা-সাহিত্যের এক চিরসবুজ ভান্ডার গড়ে তোলা।',
      'মৌলিক সাহিত্যের শক্তি এখানেই যে, তা সময়ের তাড়াহুড়োয় রচিত হয় না। একজন লেখক যখন কুরআন ও সুন্নাহর শাশ্বত আলোর নিচে বসে সমাজ, মানুষ, প্রকৃতি ও জীবনবোধকে গভীরভাবে পাঠ করেন, তখন তাঁর কলম থেকে ঝরে পড়ে কালজয়ী শব্দমালা।',
      'আমাদের প্রতিটি রচনা তাই একদিকে যেমন বিশুদ্ধ আকীদা ও তথ্যসূত্রের মানদণ্ডে উত্তীর্ণ, অন্যদিকে বাংলা ভাষার নান্দনিক লালিত্য ও হৃদয়স্পর্শী শৈলীতে অনন্য। পাঠক এখানে শুধু তথ্যই পাবেন না, পাবেন চিন্তার খোরাক এবং আত্মার প্রশান্তি।',
    ],
    citations: [
      'সূরা আর-রহমান: ১-৪ (আল্লামায়াল কুরআন, খালাকাল ইনসান, আল্লামাহুল বায়ান)',
      'সূরা আল-আলাক: ১-৫ (কলমের মাধ্যমে জ্ঞান দানের তাত্ত্বিক ভিত্তি)',
      'ইবনুল কাইয়্যিম (রহ.), আল-ফাওয়াইদ — শব্দের আমানত ও চিন্তার বিশুদ্ধতা অধ্যায়',
    ],
    likesCount: 148,
    isLeadEditorial: true,
    isFeatured: true,
    coverMotif: 'manuscript-lantern',
  },
  {
    id: 'art-2',
    title: 'যান্ত্রিক কোলাহলে হারানো প্রশান্তি ও মুমিনের আত্মমর্যাদা',
    subtitle: 'অবিরাম স্ক্রলিং ও অস্থিরতার যুগে হৃদয়ের সাকীনাহ ফিরে পাওয়ার উপায়',
    category: 'iman-life',
    categoryBn: 'ঈমান ও জীবনবোধ',
    authorId: 'author-habib',
    authorName: 'শাইখ হাবিবুর রহমান আল-মাদানী',
    authorRole: 'গবেষক ও সাওয়াল-জওয়াব তত্ত্বাবধায়ক',
    volumeId: 'vol-1',
    volumeTitle: 'সংকলন ০১: শব্দের জায়নামাজ',
    publishedAtBn: '৬ কার্তিক ১৪৩৩ বঙ্গাব্দ',
    readTimeBn: '৭ মিনিট পাঠ',
    excerpt:
      'আধুনিক মানুষ তথ্যের মহাসমুদ্রে ভেসে বেড়ালেও নিজের ভেতরের মানুষটির সাথে কথা বলার ফুরসত পাচ্ছে না। ঈমানী জীবনবোধ কীভাবে আমাদের এই অন্তহীন শূন্যতা থেকে মুক্তি দিতে পারে, তার এক নিবিড় বিশ্লেষণ।',
    pullQuote:
      'হৃদয়ের প্রকৃত প্রশান্তি কোনো যান্ত্রিক পর্দায় মেলে না; তা মেলে রবের স্মরণে, নীরব মোরাকাবায় এবং অর্থপূর্ণ পাঠে।',
    paragraphs: [
      'আজকের নাগরিক জীবনে ভোর হয় নোটিফিকেশনের শব্দে আর রাত নামে ক্লান্ত চোখের পাতায় আলোর ঝলকানি নিয়ে। আমরা প্রতিদিন হাজারো মানুষের ভিড়ে থাকি, অথচ ভেতরে ভেতরে এক গভীর একাকীত্বে ভুগি। এর মূল কারণ হলো আমাদের আত্মার সাথে তার স্রষ্টার সংযোগের শিথিলতা।',
      'পবিত্র কুরআনে স্পষ্ট ঘোষণা করা হয়েছে— জেনে রাখো, আল্লাহর স্মরণেই কেবল হৃদয়সমূহ প্রশান্ত হয়। এই স্মরণ কেবল মৌখিক উচ্চারণে সীমাবদ্ধ নয়; বরং জীবনের প্রতিটি কাজে, পাঠে ও চিন্তায় আল্লাহর সন্তুষ্টিকে প্রাধান্য দেওয়ার নামই প্রকৃত যিকির।',
      'যখন একজন মুমিন নিজের মূল্য চিনতে শেখে এবং তুচ্ছ দুনিয়াবি প্রতিযোগিতা থেকে দৃষ্টি ফিরিয়ে আখেরাতমুখী সৌন্দর্যকে আলিঙ্গন করে, তখন তার কথাবার্তা, আচরণ ও সাহিত্যবোধেও নেমে আসে এক অনাবিল গাম্ভীর্য।',
    ],
    citations: [
      'সূরা আর-রাদ: ২৮ (আলা বিযিকরিল্লাহি তাত্বমাইন্নুল কুলূব)',
      'সহীহ মুসলিম: কিতাবুয যুহদ ওয়ার রাকাইক',
    ],
    likesCount: 112,
    isFeatured: true,
    coverMotif: 'inkwell-scroll',
  },
  {
    id: 'art-3',
    title: 'ভোরের আজান ও সবুজ মিনার: তিনটি মৌলিক ঈমানী কবিতা',
    subtitle: 'রাতের তাহাজ্জুদ, ফজরের স্নিগ্ধ বাতাস ও মুসাফিরের আকুতি নিয়ে রচিত কাব্যগুচ্ছ',
    category: 'poetry-verse',
    categoryBn: 'কবিতা ও কাব্য',
    authorId: 'author-farhan',
    authorName: 'কবি ফারহান ইবনে আমিন',
    authorRole: 'কাব্য ও ছন্দ বিভাগীয় সম্পাদক',
    volumeId: 'vol-3',
    volumeTitle: 'সংকলন ০৩: ভোরের আজান ও সবুজ মিনার',
    publishedAtBn: '৪ কার্তিক ১৪৩৩ বঙ্গাব্দ',
    readTimeBn: '৫ মিনিট পাঠ',
    excerpt:
      'শিশিরভেজা ঘাসের ডগায় যখন ফজরের প্রথম আজান ধ্বনিত হয়, তখন ঘুমন্ত পৃথিবীর বুক চিরে জেগে ওঠে মুমিনের সিজদার তামান্না— আমাদের নিজস্ব কাব্যভাষায় রচিত তিনটি বিশেষ কবিতা।',
    pullQuote:
      'অন্ধকারের পর্দা ছিঁড়ে ঐ শোনা যায় রবের আহ্বান, জায়নামাজের শীতল কোণে জুড়ায় ক্লান্ত প্রাণ।',
    paragraphs: [
      '১. শব্দের জায়নামাজ\nরাতের গভীরে যখন ঘুমিয়ে পড়ে কোলাহলমুখর শহর,\nতখন অশ্রুর কালিতে আমি সাজাই প্রার্থনার অক্ষর।\nহে আরশের মালিক! আমার এই ক্ষুদ্র শব্দের ডালি,\nতোমার রহমতের ছোঁয়ায় হোক ঈমানের দীপ্ত মশালখানি।',
      '২. ভোরের আজান\nহিজল বনের ওপার থেকে ভেসে আসে হাইয়া আলাল ফালাহ,\nকুয়াশার চাদর সরিয়ে জাগে মুমিনের নতুন সকালবেলা।\nসিজদার ধূলিতে যে কপাল খুঁজে পায় জান্নাতের সুবাস,\nপৃথিবীর কোনো মরীচিকা তাকে করতে পারে না হতাশ।',
      '৩. সবুজ মিনারের মুসাফির\nআমরা তো সবাই পথিক এই ক্ষণিকের সরাইখানায়,\nবেলা শেষে ফিরতে হবে চিরস্থায়ী নীড়ের ঠিকানায়।\nরেখে যাব শুধু কিছু সৎকর্ম আর সত্যের অমলিন বাণী,\nযেন পরকালে তা হয়ে ওঠে নাজাতের উসিলাখানি।',
    ],
    citations: [
      'হাসসান ইবনে সাবিত (রা.)-এর কাব্যাদর্শ ও নন্দনতত্ত্ব',
      'সংকলন ০৩: ভোরের আজান ও সবুজ মিনার (প্রথম মুদ্রণ)',
    ],
    likesCount: 134,
    isFeatured: true,
    coverMotif: 'jasmine-notebook',
  },
  {
    id: 'art-4',
    title: 'সন্তানের হৃদয়ে ঈমান ও সুন্দর ভাষার বীজ বপন করবেন কীভাবে?',
    subtitle: 'পারিবারিক পাঠাভ্যাস, গল্প বলা ও আদব শিক্ষার ব্যবহারিক দিকনির্দেশনা',
    category: 'soul-family',
    categoryBn: 'আত্মশুদ্ধি ও পরিবার',
    authorId: 'author- Maryam',
    authorName: 'মারইয়াম বিনতে সুলাইমান',
    authorRole: 'কথা-সাহিত্যিক ও পারিবারিক প্রাবন্ধিক',
    volumeId: 'vol-2',
    volumeTitle: 'সংকলন ০২: হৃদয়ের গহীনে আলোর পরশ',
    publishedAtBn: '২ কার্তিক ১৪৩৩ বঙ্গাব্দ',
    readTimeBn: '৬ মিনিট পাঠ',
    excerpt:
      'একটি আদর্শ মুসলিম পরিবারের সবচেয়ে বড় সৌন্দর্য তার কথাবার্তার মাধুর্য এবং বই পড়ার সংস্কৃতি। শৈশব থেকেই শিশুদের মনে ঈমান ও সাহিত্যের অনুরাগ জাগিয়ে তোলার পরীক্ষিত উপায়।',
    pullQuote:
      'যে ঘরে প্রতিদিন মাগরিবের পর কুরআন ও বিশুদ্ধ সাহিত্যের আসর বসে, সে ঘরে অশান্তি ও অপসংস্কৃতি প্রবেশের পথ পায় না।',
    paragraphs: [
      'শিশুরা উপদেশের চেয়ে আচরণ দেখে বেশি শেখে। মা-বাবা যদি নিজেরা অবসর সময়ে মোবাইল স্ক্রিনে ডুবে থাকেন, তবে সন্তানকে বই পড়ার উপদেশ দেওয়া ফলপ্রসূ হয় না। তাই পারিবারিক তারবিয়াতের প্রথম ধাপ হলো ঘরে একটি ছোট্ট পাঠাগার বা বইয়ের কোণ গড়ে তোলা।',
      'প্রতিদিন অন্তত বিশ মিনিট পরিবারের সবাই মিলে নবী-রাসূলদের জীবনী, সাহাবীদের ত্যাগের কাহিনী কিংবা শিক্ষণীয় মৌলিক গল্প পাঠ করলে শিশুদের শব্দভাণ্ডার যেমন সমৃদ্ধ হয়, তেমনি তাদের হৃদয়ে গড়ে ওঠে নৈতিকতার সুদৃঢ় প্রাচীর।',
    ],
    citations: [
      'সূরা আত-তাহরীম: ৬ (নিজেদের ও পরিবারকে রক্ষার নির্দেশনা)',
      'আল-আদাবুল মুফরাদ — ইমাম বুখারী (রহ.)',
    ],
    likesCount: 96,
    isFeatured: true,
    coverMotif: 'archway-dome',
  },
  {
    id: 'art-5',
    title: 'কর্ডোভার হারানো গ্রন্থাগার থেকে বাংলার বাঁশের কেল্লা: জ্ঞানের সোনালি সফরনামা',
    subtitle: 'ইসলামী সভ্যতায় বই, পাণ্ডুলিপি ও জ্ঞানচর্চার ঐতিহাসিক ধারাবাহিকতা',
    category: 'history-journey',
    categoryBn: 'ইতিহাস ও ভ্রমণ',
    authorId: 'author-tariq',
    authorName: 'ড. তারিকুল ইসলাম নদভী',
    authorRole: 'ইতিহাস গবেষক ও ভ্রমণলেখক',
    volumeId: 'vol-4',
    volumeTitle: 'সংকলন ০৪: মুসাফিরের ডায়েরি',
    publishedAtBn: '২৮ আশ্বিন ১৪৩৩ বঙ্গাব্দ',
    readTimeBn: '৯ মিনিট পাঠ',
    excerpt:
      'বাগদাদের বাইতুল হিকমাহ, আন্দালুসিয়ার কর্ডোভা এবং সোনারগাঁওয়ের প্রাচীন মাদরাসা ও পাঠাগারগুলো কীভাবে শতাব্দীর পর শতাব্দী মানবজাতিকে আলোর পথ দেখিয়েছে তার এক প্রামাণ্য ইতিহাস।',
    pullQuote:
      'মুসলিম সভ্যতা যেখানেই পা রেখেছে, সেখানেই মসজিদের পাশেই গড়ে তুলেছে সমৃদ্ধ গ্রন্থাগার ও জ্ঞানচর্চার কেন্দ্র।',
    paragraphs: [
      'ইতিহাসের পাতায় চোখ রাখলে দেখা যায়, দশম শতাব্দীতে যখন ইউরোপের বড় বড় রাজপ্রাসাদেও হাতেগোনা কয়েক ডজন বই থাকত, তখন মুসলিম আন্দালুসিয়ার রাজধানী কর্ডোভার কেন্দ্রীয় গ্রন্থাগারে সংরক্ষিত ছিল চার লক্ষাধিক হাতে লেখা পাণ্ডুলিপি।',
      'বাংলার সুবাদারি আমল ও সুলতানি যুগেও সোনারগাঁও, গৌড় ও বাগেরহাটে গড়ে উঠেছিল অসংখ্য ইলমী মারকায ও সাহিত্য মজলিস। আমাদের আজকের মৌলিক সাহিত্যচর্চা সেই গৌরবোজ্জ্বল ঐতিহ্যেরই এক বিনীত পুনর্জাগরণ।',
    ],
    citations: [
      'তাকীউদ্দীন আল-মাকরিযী, আল-খিতাত',
      'বাংলার সামাজিক ও সাংস্কৃতিক ইতিহাস — ড. এম এ রহিম',
    ],
    likesCount: 89,
    isFeatured: false,
    coverMotif: 'compass-chronicle',
  },
  {
    id: 'art-6',
    title: 'বৃদ্ধ ঘড়িওয়ালা ও ফজরের মুসাফির: একটি জীবনঘনিষ্ঠ ছোটগল্প',
    subtitle: 'পুরান ঢাকার এক নিভৃত গলিতে সততা, তাওয়াক্কুল ও মানবিক ভালোবাসার আখ্যান',
    category: 'short-fiction',
    categoryBn: 'গল্প ও কথা-সাহিত্য',
    authorId: 'author- Maryam',
    authorName: 'মারইয়াম বিনতে সুলাইমান',
    authorRole: 'কথা-সাহিত্যিক ও পারিবারিক প্রাবন্ধিক',
    volumeId: 'vol-2',
    volumeTitle: 'সংকলন ০২: হৃদয়ের গহীনে আলোর পরশ',
    publishedAtBn: '২৪ আশ্বিন ১৪৩৩ বঙ্গাব্দ',
    readTimeBn: '৭ মিনিট পাঠ',
    excerpt:
      'সত্তরোর্ধ্ব ইউসুফ চাচা গত চল্লিশ বছর ধরে পুরান ঢাকার এক ছোট্ট দোকানে পুরনো ঘড়ি মেরামত করেন। কিন্তু তাঁর আসল পরিচয় জানত কেবল মহল্লার মসজিদের মিনার আর ভোরের পাখিরা।',
    pullQuote:
      'মানুষের ভাঙা ঘড়ি সারাতে সারাতে ইউসুফ চাচা বুঝেছিলেন— সময়ের কাঁটা নয়, মানুষের নিঃশ্বাসের প্রতিটি মুহূর্তই আসল মূলধন।',
    paragraphs: [
      'চকবাজারের সরু গলিটা দিয়ে হাঁটলে এখনো চোখে পড়ে কাঠের ফ্রেমে বাঁধানো ছোট্ট সাইনবোর্ড— "আল-আমানত ওয়াচ রিপেয়ারিং"। দোকানের ভেতরে টিমটিমে হলুদ বাল্বের নিচে চোখে আতশি কাঁচ লাগিয়ে বসে থাকেন সাদা দাড়িওয়ালা ইউসুফ মিয়া।',
      'কেউ যদি ভুল করেও নির্ধারিত মজুরির চেয়ে দশ টাকা বেশি দিতে চাইত, ইউসুফ চাচা মৃদু হেসে বলতেন, "বাবা, ঘড়ির কাঁটা যেমন এক সেকেন্ড বেশি চললে সময় ভুল দেয়, তেমনি প্রাপ্য হকের চেয়ে এক পয়সা বেশি নিলে বরকত নষ্ট হয়ে যায়।" তাঁর এই ছোট্ট কথাটি বদলে দিয়েছিল শহরের এক তরুণ ব্যবসায়ীর পুরো জীবন।',
    ],
    citations: [
      'মৌলিক ছোটগল্প সংকলন — হৃদয়ের গহীনে আলোর পরশ',
    ],
    likesCount: 121,
    isFeatured: false,
    coverMotif: 'olive-branch',
  },
];

export interface AnthologyVolume {
  id: string;
  volumeNumberBn: string;
  titleBn: string;
  subtitleBn: string;
  themeTaglineBn: string;
  publishedSeasonBn: string;
  pageCount: number;
  hardcoverPriceBdt: number;
  collectorBoxPriceBdt: number;
  editorialNoteBn: string;
  highlightsBn: string[];
  coverTheme: 'emerald-gold' | 'terracotta-arch' | 'midnight-lantern' | 'parchment-classic';
}

export const INITIAL_ANTHOLOGY_VOLUMES: AnthologyVolume[] = [
  {
    id: 'vol-1',
    volumeNumberBn: 'সংকলন ০১',
    titleBn: 'শব্দের জায়নামাজ',
    subtitleBn: 'ঈমান, জীবনবোধ ও মৌলিক গদ্যের প্রথম প্রামাণ্য সংকলন',
    themeTaglineBn: 'মৌলিক গদ্য ও ঈমানী দর্শন',
    publishedSeasonBn: 'শরৎ ১৪৩৩ বঙ্গাব্দ',
    pageCount: 192,
    hardcoverPriceBdt: 320,
    collectorBoxPriceBdt: 480,
    editorialNoteBn:
      'মাসিক পত্রিকার সাময়িক আবরণের পরিবর্তে স্থায়ী গ্রন্থাকারে সংরক্ষণের জন্য আমাদের ১২টি সেরা মৌলিক প্রবন্ধ ও গদ্যের হার্ডকভার সংকলন।',
    highlightsBn: [
      'শব্দের আমানত ও কলমের ইবাদত — আব্দুল্লাহ আল-মাহমুদ',
      'যান্ত্রিক কোলাহলে হারানো প্রশান্তি — শাইখ হাবিবুর রহমান',
      'তাওহীদের আলোকে শিল্প ও সাহিত্যের সীমানা',
    ],
    coverTheme: 'emerald-gold',
  },
  {
    id: 'vol-2',
    volumeNumberBn: 'সংকলন ০২',
    titleBn: 'হৃদয়ের গহীনে আলোর পরশ',
    subtitleBn: 'আত্মশুদ্ধি, আদর্শ পরিবার ও জীবনঘনিষ্ঠ ছোটগল্পের সংকলন',
    themeTaglineBn: 'আত্মশুদ্ধি, পরিবার ও কথা-সাহিত্য',
    publishedSeasonBn: 'হেমন্ত ১৪৩৩ বঙ্গাব্দ',
    pageCount: 208,
    hardcoverPriceBdt: 350,
    collectorBoxPriceBdt: 520,
    editorialNoteBn:
      'পারিবারিক তারবিয়াত, সন্তানের পাঠাভ্যাস এবং হৃদয়ছোঁয়া নৈতিক ছোটগল্প নিয়ে সাজানো আমাদের দ্বিতীয় মৌলিক গ্রন্থ।',
    highlightsBn: [
      'সন্তানের হৃদয়ে ঈমান ও সুন্দর ভাষার বীজ বপন',
      'বৃদ্ধ ঘড়িওয়ালা ও ফজরের মুসাফির (মৌলিক ছোটগল্প)',
      'মুমিনের রাগ নিয়ন্ত্রণ ও ক্ষমার সৌন্দর্য',
    ],
    coverTheme: 'terracotta-arch',
  },
  {
    id: 'vol-3',
    volumeNumberBn: 'সংকলন ০৩',
    titleBn: 'ভোরের আজান ও সবুজ মিনার',
    subtitleBn: 'ঈমানী জাগরণ, প্রার্থনা ও প্রকৃতির মৌলিক বাংলা কাব্যগ্রন্থ',
    themeTaglineBn: 'মৌলিক কবিতা ও কাব্য সংকলন',
    publishedSeasonBn: 'শীত ১৪৩৩ বঙ্গাব্দ',
    pageCount: 160,
    hardcoverPriceBdt: 290,
    collectorBoxPriceBdt: 440,
    editorialNoteBn:
      'কবি ফারহান ইবনে আমিন ও আমাদের কাব্য পর্ষদের বাছাইকৃত ৪৫টি মৌলিক ঈমানী কবিতা ও ছন্দের নান্দনিক সংকলন।',
    highlightsBn: [
      'শব্দের জায়নামাজ ও ভোরের আজান কাব্যগুচ্ছ',
      'তাহাজ্জুদের অশ্রু ও সবুজ মিনারের গান',
      'বাংলার হিজল ছায়ায় মুসাফিরের প্রার্থনা',
    ],
    coverTheme: 'midnight-lantern',
  },
  {
    id: 'vol-4',
    volumeNumberBn: 'সংকলন ০৪',
    titleBn: 'মুসাফিরের ডায়েরি',
    subtitleBn: 'ইসলামী সভ্যতার ইতিহাস, ঐতিহ্য ও শিক্ষণীয় সফরনামা',
    themeTaglineBn: 'ইতিহাস গবেষণা ও ভ্রমণগদ্য',
    publishedSeasonBn: 'বসন্ত ১৪৩৩ বঙ্গাব্দ',
    pageCount: 224,
    hardcoverPriceBdt: 380,
    collectorBoxPriceBdt: 550,
    editorialNoteBn:
      'কর্ডোভা, বাগদাদ ও বাংলার প্রাচীন ইসলামী জ্ঞানকেন্দ্রগুলোর ইতিহাস এবং ভ্রমণ অভিজ্ঞতার প্রামাণ্য সংকলন।',
    highlightsBn: [
      'কর্ডোভার হারানো গ্রন্থাগার থেকে বাংলার বাঁশের কেল্লা',
      'সোনারগাঁওয়ের প্রাচীন মাদরাসা ও পাণ্ডুলিপি কথা',
      'সফরনামা: হিজাজের পথে এক মুসাফিরের দিনলিপি',
    ],
    coverTheme: 'parchment-classic',
  },
];

export interface LiteraryQuestion {
  id: string;
  questionNoBn: string;
  topicBn: string;
  askedBy: string;
  askedFrom: string;
  publishedAtBn: string;
  questionTitle: string;
  questionDetail: string;
  answerParagraphs: string[];
  answeredBy: string;
  answeredByRole: string;
  references: string[];
  status: 'answered' | 'pending';
}

export const INITIAL_LITERARY_QUESTIONS: LiteraryQuestion[] = [
  {
    id: 'qa-1',
    questionNoBn: 'প্রশ্ন নং ১০১',
    topicBn: 'সাহিত্য ও শরিয়াহ',
    askedBy: 'মাহমুদুল হাসান',
    askedFrom: 'রাজশাহী বিশ্ববিদ্যালয়',
    publishedAtBn: '৭ কার্তিক ১৪৩৩ বঙ্গাব্দ',
    questionTitle: 'ইসলামী শরিয়াহর আলোকে মৌলিক গল্প বা কথা-সাহিত্য রচনার সীমারেখা কী?',
    questionDetail:
      'আমরা জানি ইসলামে মিথ্যা বলা নিষিদ্ধ। সেক্ষেত্রে সমাজ সংস্কার বা নৈতিক শিক্ষার উদ্দেশ্যে রূপক গল্প, উপমা বা জীবনঘনিষ্ঠ ছোটগল্প লেখার ক্ষেত্রে শরিয়াহর নীতিমালা কী? দালিলিক উত্তর জানালে কৃতজ্ঞ হব।',
    answerParagraphs: [
      'আলহামদুলিল্লাহ। ইসলামী শরিয়াহয় সাহিত্য, উপমা ও শিক্ষণীয় দৃষ্টান্ত স্থাপনের অত্যন্ত প্রশস্ত ও সুস্পষ্ট নীতিমালা রয়েছে। পবিত্র কুরআনে ও সহীহ হাদীসে মানুষের বোধগম্যতার জন্য অসংখ্য উপমা (আমসাল) এবং পূর্ববর্তী জাতিসমূহের ঘটনা বর্ণিত হয়েছে।',
      'বিশুদ্ধ আকীদার আলিম ও ফকীহগণের মতে, যদি কোনো মৌলিক গদ্য বা গল্পে কোনো বাস্তব ব্যক্তির ওপর মিথ্যা অপবাদ আরোপ না করা হয়, পাঠককে প্রতারিত না করা হয় এবং তা সুস্পষ্টভাবে শিক্ষণীয় রূপক বা জীবনঘনিষ্ঠ দৃষ্টান্ত হিসেবে উপস্থাপিত হয়— যা পাঠককে সৎকর্ম, তাকওয়া ও উত্তম চরিত্রের দিকে আহ্বান করে এবং অশ্লীলতা থেকে সম্পূর্ণ মুক্ত থাকে— তবে তা কেবল জায়েযই নয়, বরং দাওয়াতের একটি শক্তিশালী মাধ্যম।',
    ],
    answeredBy: 'শাইখ হাবিবুর রহমান আল-মাদানী',
    answeredByRole: 'গবেষক ও সাওয়াল-জওয়াব তত্ত্বাবধায়ক',
    references: [
      'সূরা ইবরাহীম: ২৪-২৫ (উত্তম কথার উপমা ও সুদৃঢ় বৃক্ষ)',
      'ইমাম ইবনুল কাইয়্যিম (রহ.), ইলামুল মুওয়াক্কিয়ীন — উপমা ও দৃষ্টান্ত অধ্যায়',
    ],
    status: 'answered',
  },
  {
    id: 'qa-2',
    questionNoBn: 'প্রশ্ন নং ১০২',
    topicBn: 'ভাষা ও সংস্কৃতি',
    askedBy: 'তানভীর আহমেদ',
    askedFrom: 'সিলেট সদর',
    publishedAtBn: '৫ কার্তিক ১৪৩৩ বঙ্গাব্দ',
    questionTitle: 'কবিতা ও কাব্য চর্চার ব্যাপারে ইসলামের দৃষ্টিভঙ্গি কীরূপ?',
    questionDetail:
      'অনেকে মনে করেন ইসলামে সব ধরনের কবিতা অপছন্দনীয়। আবার আমরা সাহাবীদের জীবনেও কবিতা রচনার ইতিহাস দেখি। কোন ধরনের কবিতা প্রশংসনীয় এবং কোনটি বর্জনীয়?',
    answerParagraphs: [
      'কবিতা মূলত একটি কথার মাধ্যম। রাসূলুল্লাহ (সা.) অত্যন্ত চমৎকার একটি মূলনীতি দিয়েছেন: "কবিতা হলো কথার মতোই; এর উত্তম অংশ উত্তম কথার মতো এবং এর মন্দ অংশ মন্দ কথার মতো।" এমনকি নিঃসন্দেহে কোনো কোনো কাব্যে রয়েছে প্রজ্ঞা (হিকমাহ)।',
      'সুতরাং যে কবিতা তাওহীদের মহিমা প্রকাশ করে, সত্য ও ন্যায়ের পক্ষে কথা বলে, মানুষকে আখেরাতের কথা স্মরণ করিয়ে দেয় এবং মিথ্যাচার ও অশ্লীলতা থেকে পবিত্র থাকে— তা সাহাবী হাসসান ইবনে সাবিত (রা.) ও আব্দুল্লাহ ইবনে রাওয়াহা (রা.)-এর সুন্নাহর অনুগামী।',
    ],
    answeredBy: 'উস্তায আব্দুল্লাহ আল-মাহমুদ',
    answeredByRole: 'প্রধান সম্পাদক ও মৌলিক গদ্যকার',
    references: [
      'সহীহ বুখারী: ৬১৪৫ (ইন্না মিনাশ শি’রি লাহিকমাহ)',
      'আল-আদাবুল মুফরাদ: হাদীস ৮৬৫',
    ],
    status: 'answered',
  },
  {
    id: 'qa-3',
    questionNoBn: 'প্রশ্ন নং ১০৩',
    topicBn: 'পাঠাভ্যাস ও পরিবার',
    askedBy: 'সুমাইয়া বিনতে করিম',
    askedFrom: 'উত্তরা, ঢাকা',
    publishedAtBn: '১ কার্তিক ১৪৩৩ বঙ্গাব্দ',
    questionTitle: 'তরুণ প্রজন্মকে মোবাইল আসক্তি থেকে ফিরিয়ে মৌলিক বই পাঠে আগ্রহী করার উপায় কী?',
    questionDetail:
      'আমাদের ঘরে কিশোর-তরুণরা দীর্ঘ লেখা বা বই পড়তে ধৈর্য পায় না। তাদের মধ্যে গভীর পাঠাভ্যাস গড়ে তোলার জন্য পরিবারের পক্ষ থেকে কী পদক্ষেপ নেওয়া যায়?',
    answerParagraphs: [
      'তরুণদের মনোযোগ ফিরিয়ে আনার জন্য প্রথম শর্ত হলো তাদের হাতে এমন সাহিত্য তুলে দেওয়া, যার ভাষা সমকালীন, ঝরঝরে এবং হৃদয়গ্রাহী। খুব জটিল বা নীরস অনুবাদের পরিবর্তে প্রথমে ছোট ছোট মৌলিক প্রবন্ধ, সফরনামা ও শিক্ষণীয় গল্প দিয়ে শুরু করা উচিত।',
      'এছাড়া প্রতিদিন রাতে অন্তত আধা ঘণ্টার জন্য ঘরের সকল ডিজিটাল ডিভাইস বন্ধ রেখে পারিবারিক পাঠচক্র (হালকায়ে কিরাআত) চালু করলে তরুণদের মধ্যে দ্রুত বইয়ের প্রতি ভালোবাসা জন্মায়।',
    ],
    answeredBy: 'মারইয়াম বিনতে সুলাইমান',
    answeredByRole: 'কথা-সাহিত্যিক ও পারিবারিক প্রাবন্ধিক',
    references: [
      'একটুখানি সাহিত্যের পরশ — পারিবারিক পাঠাগার নির্দেশিকা',
    ],
    status: 'answered',
  },
  {
    id: 'qa-4',
    questionNoBn: 'প্রশ্ন নং ১০৪',
    topicBn: 'গল্প ও উপন্যাস',
    askedBy: 'আরিফুল ইসলাম',
    askedFrom: 'চট্টগ্রাম',
    publishedAtBn: '২৬ আশ্বিন ১৪৩৩ বঙ্গাব্দ',
    questionTitle: 'একটুখানি সাহিত্যের পরশ-এ নতুন লেখক হিসেবে মৌলিক রচনা পাঠানোর নিয়মাবলি কী?',
    questionDetail:
      'আমি নিজে ইসলামী ভাবধারার মৌলিক প্রবন্ধ ও কবিতা লিখি। আপনাদের ওয়েবসাইটে ও সংকলনে আমার লেখা প্রকাশের জন্য কী কী শর্ত মানতে হবে?',
    answerParagraphs: [
      'স্বাগতম! আমাদের ওয়েবসাইটের উপরের ডান কোণায় থাকা "প্রশ্ন ও লেখা পাঠান" বাটনে ক্লিক করে আপনি সরাসরি আপনার মৌলিক রচনা জমা দিতে পারেন।',
      'শর্তাবলি অত্যন্ত সহজ: লেখাটি শতভাগ আপনার নিজস্ব মৌলিক রচনা হতে হবে, কুরআন-সুন্নাহর বিশুদ্ধ আকীদার অনুগামী হতে হবে এবং কোনো ধরনের কপিরাইট লঙ্ঘন বা অপ্রমাণিত তথ্য থাকা চলবে না।',
    ],
    answeredBy: 'সম্পাদনা পরিষদ ডেস্ক',
    answeredByRole: 'একটুখানি সাহিত্যের পরশ',
    references: [
      'লেখক ও পাণ্ডুলিপি নীতিমালা — একটুখানি সাহিত্যের পরশ',
    ],
    status: 'answered',
  },
];

export type BookEditionType = 'hardcover' | 'collector-box';

export interface BookCartItem {
  volumeId: string;
  edition: BookEditionType;
  quantity: number;
}

export interface BookCartSummary {
  itemCount: number;
  subtotalBdt: number;
  shippingBdt: number;
  totalBdt: number;
}

export function filterLiteraryArticles(
  articles: LiteraryArticle[],
  category: LiteraryCategoryId,
  searchQuery: string,
  authorId = 'all',
  volumeId = 'all'
): LiteraryArticle[] {
  const q = searchQuery.trim().toLowerCase();
  return articles.filter((art) => {
    if (category !== 'all' && art.category !== category) return false;
    if (authorId !== 'all' && art.authorId !== authorId) return false;
    if (volumeId !== 'all' && art.volumeId !== volumeId) return false;
    if (!q) return true;
    return (
      art.title.toLowerCase().includes(q) ||
      art.subtitle.toLowerCase().includes(q) ||
      art.excerpt.toLowerCase().includes(q) ||
      art.authorName.toLowerCase().includes(q) ||
      art.categoryBn.toLowerCase().includes(q) ||
      art.volumeTitle.toLowerCase().includes(q)
    );
  });
}

export function filterLiteraryQuestions(
  questions: LiteraryQuestion[],
  topicFilter: string,
  searchQuery: string
): LiteraryQuestion[] {
  const q = searchQuery.trim().toLowerCase();
  return questions.filter((item) => {
    if (topicFilter && topicFilter !== 'সব জিজ্ঞাসা' && topicFilter !== 'all') {
      if (item.topicBn !== topicFilter) return false;
    }
    if (!q) return true;
    return (
      item.questionTitle.toLowerCase().includes(q) ||
      item.questionDetail.toLowerCase().includes(q) ||
      item.askedBy.toLowerCase().includes(q) ||
      item.topicBn.toLowerCase().includes(q) ||
      item.answerParagraphs.some((p) => p.toLowerCase().includes(q))
    );
  });
}

export function getVolumeEditionPrice(
  volume: AnthologyVolume,
  edition: BookEditionType
): number {
  return edition === 'collector-box'
    ? volume.collectorBoxPriceBdt
    : volume.hardcoverPriceBdt;
}

export function calculateBookCartSummary(
  cart: BookCartItem[],
  city: 'ঢাকা' | 'ঢাকার বাইরে' = 'ঢাকা',
  volumes: AnthologyVolume[] = INITIAL_ANTHOLOGY_VOLUMES
): BookCartSummary {
  let itemCount = 0;
  let subtotalBdt = 0;

  for (const item of cart) {
    if (item.quantity <= 0) continue;
    const vol =
      volumes.find((v) => v.id === item.volumeId) ||
      INITIAL_ANTHOLOGY_VOLUMES.find((v) => v.id === item.volumeId);
    if (!vol) continue;
    const price = getVolumeEditionPrice(vol, item.edition);
    itemCount += item.quantity;
    subtotalBdt += price * item.quantity;
  }

  const shippingBdt =
    itemCount === 0 ? 0 : city === 'ঢাকার বাইরে' ? 110 : 60;

  return {
    itemCount,
    subtotalBdt,
    shippingBdt,
    totalBdt: subtotalBdt + shippingBdt,
  };
}

export interface LiveEditorialDates {
  hijriDateBn: string;
  banglaDateBn: string;
  gregorianDateBn: string;
  weekdayBn: string;
  fullHeaderDateBn: string;
}

const BANGLA_WEEKDAYS = [
  'রবিবার',
  'সোমবার',
  'মঙ্গলবার',
  'বুধবার',
  'বৃহস্পতিবার',
  'শুক্রবার',
  'শনিবার',
];

const BANGLA_GREGORIAN_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

const BANGLA_CALENDAR_MONTHS = [
  'বৈশাখ',
  'জ্যৈষ্ঠ',
  'আষাঢ়',
  'শ্রাবণ',
  'ভাদ্র',
  'আশ্বিন',
  'কার্তিক',
  'অগ্রহায়ণ',
  'পৌষ',
  'মাঘ',
  'ফাল্গুন',
  'চৈত্র',
];

const HIJRI_MONTHS_BN = [
  'মুহাররম',
  'সফর',
  'রবিউল আউয়াল',
  'রবিউস সানি',
  'জমাদিউল আউয়াল',
  'জমাদিউস সানি',
  'রজব',
  'শাবান',
  'রমজান',
  'শাওয়াল',
  'জিলকদ',
  'জিলহজ',
];

function isGregorianLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Computes the live Bengali (বঙ্গাব্দ), Hijri (হিজরি), and Gregorian (খ্রিষ্টাব্দ) dates
 * automatically from any JavaScript Date object so the website updates daily without manual intervention.
 */
export function getLiveBengaliAndHijriDates(now: Date = new Date()): LiveEditorialDates {
  const gYear = now.getFullYear();
  const gMonth = now.getMonth(); // 0..11
  const gDay = now.getDate(); // 1..31
  const weekdayBn = BANGLA_WEEKDAYS[now.getDay()] || 'রবিবার';

  const gregorianDateBn = `${toBengaliDigits(gDay)} ${BANGLA_GREGORIAN_MONTHS[gMonth]} ${toBengaliDigits(gYear)}`;

  // Bangladesh Revised Bangla Calendar (Pohela Boishakh = April 14)
  const currentYearPohelaBoishakh = new Date(gYear, 3, 14); // April 14
  const targetMidnight = new Date(gYear, gMonth, gDay);
  const isBeforePohelaBoishakh = targetMidnight.getTime() < currentYearPohelaBoishakh.getTime();

  const banglaYear = isBeforePohelaBoishakh ? gYear - 594 : gYear - 593;
  const baseBoishakhDate = isBeforePohelaBoishakh
    ? new Date(gYear - 1, 3, 14)
    : currentYearPohelaBoishakh;

  const diffDays = Math.floor(
    (targetMidnight.getTime() - baseBoishakhDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Month lengths in Bangladesh Revised Calendar (first 6 months = 31 days, next 5 = 30, Falgun = 29 or 30 in leap year of Falgun's Gregorian year, Chaitra = 30)
  const falgunGregorianYear = isBeforePohelaBoishakh ? gYear : gYear + 1;
  const falgunDays = isGregorianLeapYear(falgunGregorianYear) ? 30 : 29;
  const monthLengths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, falgunDays, 30];

  let remainingDays = Math.max(0, diffDays);
  let bMonthIndex = 0;
  for (let i = 0; i < monthLengths.length; i++) {
    if (remainingDays < monthLengths[i]) {
      bMonthIndex = i;
      break;
    }
    remainingDays -= monthLengths[i];
  }
  const bDay = remainingDays + 1;
  const banglaDateBn = `${toBengaliDigits(bDay)} ${BANGLA_CALENDAR_MONTHS[bMonthIndex]} ${toBengaliDigits(banglaYear)} বঙ্গাব্দ`;

  // Hijri Date calculation using Intl Islamic Calendar with fallback
  let hijriDay = 1;
  let hijriMonthIndex = 0;
  let hijriYear = 1448;

  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(now);
    const dPart = Number(parts.find((p) => p.type === 'day')?.value);
    const mPart = Number(parts.find((p) => p.type === 'month')?.value);
    const yPart = Number(
      parts
        .find((p) => p.type === 'year')
        ?.value.replace(/[^0-9]/g, '')
    );
    if (dPart >= 1 && dPart <= 30) hijriDay = dPart;
    if (mPart >= 1 && mPart <= 12) hijriMonthIndex = mPart - 1;
    if (yPart >= 1400) hijriYear = yPart;
  } catch {
    // Fallback astronomical approximation if Intl islamic-umalqura is unavailable
    const jd = Math.floor(now.getTime() / 86400000) + 2440588;
    const l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    const l2 = l - 10631 * n + 354;
    const j =
      Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
      Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
    const l3 =
      l2 -
      Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
      Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
      29;
    const m = Math.floor((24 * l3) / 709);
    hijriDay = l3 - Math.floor((709 * m) / 24);
    hijriMonthIndex = Math.max(0, Math.min(11, m - 1));
    hijriYear = 30 * n + j - 30;
  }

  const hijriDateBn = `${toBengaliDigits(hijriDay)} ${HIJRI_MONTHS_BN[hijriMonthIndex]} ${toBengaliDigits(hijriYear)} হিজরি`;
  const fullHeaderDateBn = `${weekdayBn} · ${hijriDateBn} · ${banglaDateBn} (${gregorianDateBn})`;

  return {
    hijriDateBn,
    banglaDateBn,
    gregorianDateBn,
    weekdayBn,
    fullHeaderDateBn,
  };
}

export function upsertLiteraryAuthor(
  authors: LiteraryAuthor[],
  input: Partial<LiteraryAuthor> & { nameBn: string }
): LiteraryAuthor[] {
  const cleanName = input.nameBn.trim();
  if (!cleanName) return authors;

  const words = cleanName.split(/\s+/).filter(Boolean);
  const autoMonogram =
    words.length >= 2
      ? `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}`
      : cleanName.slice(0, 2);

  if (input.id) {
    const exists = authors.some((a) => a.id === input.id);
    if (exists) {
      return authors.map((a) =>
        a.id === input.id
          ? {
              ...a,
              ...input,
              nameBn: cleanName,
              monogramBn: input.monogramBn?.trim() || a.monogramBn || autoMonogram,
              designationBn: input.designationBn?.trim() || a.designationBn || 'মৌলিক সাহিত্যিক ও প্রাবন্ধিক',
              specializationBn: input.specializationBn?.trim() || a.specializationBn || 'মৌলিক গদ্য ও জীবনবোধ',
              bioBn: input.bioBn?.trim() || a.bioBn,
              publishedWritingsCount:
                typeof input.publishedWritingsCount === 'number'
                  ? input.publishedWritingsCount
                  : a.publishedWritingsCount,
            }
          : a
      );
    }
  }

  const newAuthor: LiteraryAuthor = {
    id: input.id || `author-${Date.now()}`,
    nameBn: cleanName,
    monogramBn: input.monogramBn?.trim() || autoMonogram,
    designationBn: input.designationBn?.trim() || 'মৌলিক সাহিত্যিক ও প্রাবন্ধিক',
    specializationBn: input.specializationBn?.trim() || 'ঈমানী দর্শন ও মৌলিক সাহিত্য',
    bioBn:
      input.bioBn?.trim() ||
      'কুরআন ও সুন্নাহর আলোকে বাংলা ভাষায় বিশুদ্ধ মৌলিক সাহিত্য, প্রবন্ধ ও জীবনবোধমূলক রচনায় নিবেদিত।',
    publishedWritingsCount:
      typeof input.publishedWritingsCount === 'number' ? input.publishedWritingsCount : 1,
    avatarUrl: input.avatarUrl?.trim() || undefined,
  };

  return [...authors, newAuthor];
}

export function upsertLiteraryCategory(
  categories: LiteraryCategoryMeta[],
  input: Partial<LiteraryCategoryMeta> & { labelBn: string }
): LiteraryCategoryMeta[] {
  const cleanLabel = input.labelBn.trim();
  if (!cleanLabel) return categories;

  if (input.id) {
    const exists = categories.some((c) => c.id === input.id);
    if (exists) {
      return categories.map((c) =>
        c.id === input.id
          ? {
              ...c,
              labelBn: cleanLabel,
              labelEn: input.labelEn?.trim() || c.labelEn,
              descriptionBn: input.descriptionBn?.trim() || c.descriptionBn,
            }
          : c
      );
    }
  }

  const newCategory: LiteraryCategoryMeta = {
    id: input.id || `cat-${Date.now()}`,
    labelBn: cleanLabel,
    labelEn: input.labelEn?.trim() || 'Literary Section',
    descriptionBn:
      input.descriptionBn?.trim() ||
      `${cleanLabel} বিষয়ক মৌলিক প্রবন্ধ, সাহিত্য ও জীবনঘনিষ্ঠ রচনা`,
  };

  return [...categories, newCategory];
}

export function createNewLiteraryArticle(input: {
  title: string;
  subtitle?: string;
  category?: Exclude<LiteraryCategoryId, 'all'>;
  categoryBn?: string;
  authorId?: string;
  authorName?: string;
  authorRole?: string;
  volumeId?: string;
  volumeTitle?: string;
  readTimeBn?: string;
  excerpt?: string;
  pullQuote?: string;
  paragraphs?: string[];
  citations?: string[];
  coverMotif?: LiteraryArticle['coverMotif'];
  customCoverUrl?: string;
}): LiteraryArticle {
  const cleanTitle = input.title.trim() || 'নতুন মৌলিক রচনা';
  const category = input.category || 'original-prose';
  const catMeta = LITERARY_CATEGORIES.find((c) => c.id === category);
  const paragraphs =
    Array.isArray(input.paragraphs) && input.paragraphs.length > 0
      ? input.paragraphs
      : [input.excerpt?.trim() || cleanTitle];
  const liveDates = getLiveBengaliAndHijriDates();

  return {
    id: `art-${Date.now()}`,
    title: cleanTitle,
    subtitle: input.subtitle?.trim() || 'মৌলিক সাহিত্য ও চিন্তাশীল রচনা',
    category,
    categoryBn: input.categoryBn || catMeta?.labelBn || 'মৌলিক গদ্য ও প্রবন্ধ',
    authorId: input.authorId || LITERARY_AUTHORS[0].id,
    authorName: input.authorName?.trim() || LITERARY_AUTHORS[0].nameBn,
    authorRole: input.authorRole?.trim() || LITERARY_AUTHORS[0].designationBn,
    volumeId: input.volumeId || 'vol-1',
    volumeTitle: input.volumeTitle?.trim() || 'সংকলন ০১: শব্দের জায়নামাজ',
    publishedAtBn: liveDates.banglaDateBn,
    readTimeBn: input.readTimeBn?.trim() || '৬ মিনিট পাঠ',
    excerpt: input.excerpt?.trim() || paragraphs[0].slice(0, 180),
    pullQuote:
      input.pullQuote?.trim() ||
      'বিশুদ্ধ চিন্তা ও দরদী কলমের ছোঁয়ায় প্রতিটি শব্দ হয়ে ওঠে আলোর প্রদীপ।',
    paragraphs,
    citations:
      Array.isArray(input.citations) && input.citations.length > 0
        ? input.citations
        : ['মৌলিক রচনা — একটুখানি সাহিত্যের পরশ সম্পাদনা পর্ষদ'],
    likesCount: 1,
    isFeatured: true,
    coverMotif: input.coverMotif || 'manuscript-lantern',
    customCoverUrl: input.customCoverUrl?.trim() || undefined,
  };
}

export function createNewLiteraryQuestion(input: {
  questionTitle: string;
  questionDetail: string;
  askedBy?: string;
  askedFrom?: string;
  topicBn?: string;
  answerParagraphs?: string[];
  answeredBy?: string;
  answeredByRole?: string;
  references?: string[];
}): LiteraryQuestion {
  const randomNo = toBengaliDigits(Math.floor(105 + Math.random() * 90));
  const hasAnswer =
    Array.isArray(input.answerParagraphs) && input.answerParagraphs.length > 0;
  const liveDates = getLiveBengaliAndHijriDates();

  return {
    id: `qa-${Date.now()}`,
    questionNoBn: `প্রশ্ন নং ${randomNo}`,
    topicBn: input.topicBn?.trim() || 'সাহিত্য ও শরিয়াহ',
    askedBy: input.askedBy?.trim() || 'জনৈক সচেতন পাঠক',
    askedFrom: input.askedFrom?.trim() || 'ঢাকা',
    publishedAtBn: liveDates.banglaDateBn,
    questionTitle: input.questionTitle.trim(),
    questionDetail: input.questionDetail.trim(),
    answerParagraphs: hasAnswer
      ? input.answerParagraphs!
      : [
          'জাযাকাল্লাহু খাইরান। আপনার জিজ্ঞাসাটি "একটুখানি সাহিত্যের পরশ" সম্পাদনা ও গবেষণা পরিষদে গৃহীত হয়েছে। আমাদের বিজ্ঞ লেখক ও গবেষকবৃন্দ শীঘ্রই প্রামাণ্য দলিলসহ বিস্তারিত উত্তর প্রদান করবেন ইনশাআল্লাহ।',
        ],
    answeredBy: input.answeredBy?.trim() || 'সম্পাদনা পরিষদ ডেস্ক',
    answeredByRole: input.answeredByRole?.trim() || 'একটুখানি সাহিত্যের পরশ',
    references:
      Array.isArray(input.references) && input.references.length > 0
        ? input.references
        : ['একটুখানি সাহিত্যের পরশ — সাওয়াল-জওয়াব গবেষণা ডেস্ক'],
    status: hasAnswer ? 'answered' : 'pending',
  };
}

export interface ArticleShareLinks {
  shareUrl: string;
  shareText: string;
  facebookUrl: string;
  whatsappUrl: string;
  twitterUrl: string;
}

export function buildArticleShareLinks(
  article: Pick<LiteraryArticle, 'id' | 'title' | 'subtitle' | 'authorName' | 'categoryBn'>,
  siteNameBn = 'একটুখানি সাহিত্যের পরশ',
  originUrl = 'https://sahityerparash.com'
): ArticleShareLinks {
  const cleanOrigin = (originUrl || 'https://sahityerparash.com').replace(/\/+$/, '');
  const shareUrl = `${cleanOrigin}/?article=${encodeURIComponent(article.id)}`;
  const shareText = `“${article.title}” — ${article.authorName} (${siteNameBn} · ${article.categoryBn})`;

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);
  const encodedWhatsapp = encodeURIComponent(
    `${shareText}\n\nসম্পূর্ণ প্রবন্ধটি পড়ুন: ${shareUrl}`
  );

  return {
    shareUrl,
    shareText,
    facebookUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    whatsappUrl: `https://api.whatsapp.com/send?text=${encodedWhatsapp}`,
    twitterUrl: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
  };
}

export type ThemePreference = 'auto' | 'day' | 'night';
export type ResolvedThemeMode = 'day' | 'night';

/**
 * Resolves the active theme ('day' or 'night') from user preference ('auto' | 'day' | 'night'),
 * current local hour (0-23), and OS/browser prefers-color-scheme setting.
 * In 'auto' mode, Night Mode activates automatically between 6:00 PM (18:00) and 5:59 AM (05:59)
 * or whenever the user's device prefers dark mode.
 */
export function resolveThemeMode(
  preference: ThemePreference,
  currentHour: number = new Date().getHours(),
  systemPrefersDark = false
): ResolvedThemeMode {
  if (preference === 'day') return 'day';
  if (preference === 'night') return 'night';
  const normalizedHour = ((Math.floor(currentHour) % 24) + 24) % 24;
  const isNightTimeHour = normalizedHour >= 18 || normalizedHour < 6;
  return systemPrefersDark || isNightTimeHour ? 'night' : 'day';
}

export function getThemeModeBadgeLabelBn(
  preference: ThemePreference,
  resolved: ResolvedThemeMode
): string {
  if (preference === 'auto') {
    return resolved === 'night' ? 'অটো (রাত মোড সক্রিয়)' : 'অটো (দিন মোড সক্রিয়)';
  }
  return resolved === 'night' ? 'রাত মোড (Night)' : 'দিন মোড (Day)';
}


