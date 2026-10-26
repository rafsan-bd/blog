import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_STORE_BRAND_SETTINGS,
  PRODUCT_CATALOG,
  SACRED_CALLIGRAPHY_PRESETS,
  SUNNAH_COMBO_BUNDLES,
  calculateCartSummary,
  computeExplodedOffset,
  createCustomProductItem,
  createSavedStudioBuild,
  filterAndSortProducts,
  filterTrackedOrders,
  formatBdt,
  formatPriceByCurrency,
  getNextOrderStatus,
  getOrderProgressPercent,
  getPackPrice,
  INITIAL_DEMO_ORDERS,
  isAuthorizedStoreOwnerEmail,
  sanitizeOrderFields,
  STORE_OWNER_EMAIL,
  toBengaliDigits,
  verifyAdminAccess,
} from './catalog.js';
import {
  DEFAULT_LITERARY_BRAND,
  INITIAL_ANTHOLOGY_VOLUMES,
  INITIAL_LITERARY_ARTICLES,
  INITIAL_LITERARY_QUESTIONS,
  LITERARY_AUTHORS,
  calculateBookCartSummary,
  createNewLiteraryArticle,
  createNewLiteraryQuestion,
  filterLiteraryArticles,
  filterLiteraryQuestions,
  getVolumeEditionPrice,
} from './literaryCatalog.js';

test('filterLiteraryArticles filters original writings of একটুখানি সাহিত্যের পরশ by category, author, volume, and Bangla search query', () => {
  assert.equal(DEFAULT_LITERARY_BRAND.siteNameBn, 'একটুখানি সাহিত্যের পরশ');
  assert.equal(INITIAL_LITERARY_ARTICLES.length, 6);
  assert.equal(LITERARY_AUTHORS.length, 5);

  const all = filterLiteraryArticles(INITIAL_LITERARY_ARTICLES, 'all', '');
  assert.equal(all.length, 6);

  const poetryOnly = filterLiteraryArticles(INITIAL_LITERARY_ARTICLES, 'poetry-verse', '');
  assert.equal(poetryOnly.length, 1);
  assert.equal(poetryOnly[0].id, 'art-3');

  const byAuthor = filterLiteraryArticles(
    INITIAL_LITERARY_ARTICLES,
    'all',
    '',
    'author-mahmud',
    'all'
  );
  assert.equal(byAuthor.length, 1);
  assert.equal(byAuthor[0].id, 'art-1');

  const byVolume = filterLiteraryArticles(
    INITIAL_LITERARY_ARTICLES,
    'all',
    '',
    'all',
    'vol-2'
  );
  assert.equal(byVolume.length, 2);

  const searchQueryResult = filterLiteraryArticles(
    INITIAL_LITERARY_ARTICLES,
    'all',
    'কর্ডোভা'
  );
  assert.equal(searchQueryResult.length, 1);
  assert.equal(searchQueryResult[0].id, 'art-5');
});

test('filterLiteraryQuestions and createNewLiteraryQuestion manage সাওয়াল-জওয়াব Q&A desk accurately', () => {
  const allQuestions = filterLiteraryQuestions(INITIAL_LITERARY_QUESTIONS, 'সব জিজ্ঞাসা', '');
  assert.equal(allQuestions.length, 4);

  const topicFiltered = filterLiteraryQuestions(
    INITIAL_LITERARY_QUESTIONS,
    'ভাষা ও সংস্কৃতি',
    ''
  );
  assert.equal(topicFiltered.length, 1);
  assert.equal(topicFiltered[0].id, 'qa-2');

  const createdQ = createNewLiteraryQuestion({
    questionTitle: 'মৌলিক প্রবন্ধ রচনার পদ্ধতি কী?',
    questionDetail: 'নতুন লেখকদের জন্য পরামর্শ চাই।',
    askedBy: 'নাবিল হাসান',
    askedFrom: 'খুলনা',
    topicBn: 'সাহিত্য ও শরিয়াহ',
  });
  assert.equal(createdQ.askedBy, 'নাবিল হাসান');
  assert.equal(createdQ.status, 'pending');
  assert.ok(createdQ.answerParagraphs.length > 0);
});

test('getVolumeEditionPrice, calculateBookCartSummary, and createNewLiteraryArticle compute anthology orders and new writings', () => {
  const vol1 = INITIAL_ANTHOLOGY_VOLUMES[0];
  assert.equal(getVolumeEditionPrice(vol1, 'hardcover'), 320);
  assert.equal(getVolumeEditionPrice(vol1, 'collector-box'), 480);

  const dhakaCart = calculateBookCartSummary(
    [{ volumeId: 'vol-1', edition: 'hardcover', quantity: 2 }],
    'ঢাকা'
  );
  assert.equal(dhakaCart.itemCount, 2);
  assert.equal(dhakaCart.subtotalBdt, 640);
  assert.equal(dhakaCart.shippingBdt, 60);
  assert.equal(dhakaCart.totalBdt, 700);

  const outsideDhakaCart = calculateBookCartSummary(
    [{ volumeId: 'vol-1', edition: 'collector-box', quantity: 1 }],
    'ঢাকার বাইরে'
  );
  assert.equal(outsideDhakaCart.subtotalBdt, 480);
  assert.equal(outsideDhakaCart.shippingBdt, 110);
  assert.equal(outsideDhakaCart.totalBdt, 590);

  const newArt = createNewLiteraryArticle({
    title: 'নীরবতার সৌন্দর্য ও আত্মসমালোচনা',
    category: 'iman-life',
    paragraphs: ['প্রথম অনুচ্ছেদ।', 'দ্বিতীয় অনুচ্ছেদ।'],
  });
  assert.equal(newArt.title, 'নীরবতার সৌন্দর্য ও আত্মসমালোচনা');
  assert.equal(newArt.category, 'iman-life');
  assert.equal(newArt.paragraphs.length, 2);
});

test('filterAndSortProducts and calculateCartSummary remain functional', () => {
  const allFeatured = filterAndSortProducts(PRODUCT_CATALOG, 'all', '', 'featured');
  assert.equal(allFeatured.length, 8);
  assert.equal(getPackPrice(1450, 'brass'), 1450);

  const promoCart = calculateCartSummary(
    [{ productId: 'food-ajwa-01', finish: 'brass', quantity: 2 }],
    'bismillah10'
  );
  assert.equal(promoCart.subtotal, 2900);
  assert.equal(promoCart.discount, 290);
  assert.equal(promoCart.total, 2610);
});

test('computeExplodedOffset and order tracking state machine progress accurately', () => {
  const base: [number, number, number] = [1, 2, -1];
  const vec: [number, number, number] = [0.5, 1.0, -0.5];
  assert.deepEqual(computeExplodedOffset(base, vec, 0), [1, 2, -1]);
  assert.deepEqual(computeExplodedOffset(base, vec, 1), [1.5, 3, -1.5]);

  assert.equal(getNextOrderStatus('placed'), 'milling');
  assert.equal(getNextOrderStatus('delivered'), null);
  assert.equal(getOrderProgressPercent('placed'), 20);
  assert.equal(getOrderProgressPercent('delivered'), 100);
});

test('filterTrackedOrders filters literary anthology book orders by status group and Bangla search query', () => {
  const all = filterTrackedOrders(INITIAL_DEMO_ORDERS, 'all', '');
  assert.equal(all.length, 3);

  const activeOnly = filterTrackedOrders(INITIAL_DEMO_ORDERS, 'active', '');
  assert.equal(activeOnly.length, 2);

  const searchByBanglaItem = filterTrackedOrders(INITIAL_DEMO_ORDERS, 'all', 'আলোর পরশ');
  assert.equal(searchByBanglaItem.length, 1);
  assert.equal(searchByBanglaItem[0].orderNumber, 'AF-731044');
});

test('sanitizeOrderFields and formatting helpers work deterministically', () => {
  const sanitized = sanitizeOrderFields({
    orderNumber: 'invalid-order',
    recipientName: '   আব্দুল্লাহ আল মামুন   ',
    destinationCity: 'ঢাকা',
    postalCode: '1209',
    trackingCode: 'bd-998877-dhk!@#',
    courier: 'Sahityer Parash Book Courier',
    estimatedDelivery: '২৪–৪৮ ঘণ্টা ডেলিভারি',
    primaryProductId: 'food-ajwa-01',
    primaryFinish: 'titanium',
    itemsSummary: '1× শব্দের জায়নামাজ (হার্ডকভার)',
    itemCount: 2,
    total: 700,
    paymentMethod: 'cod',
  });

  assert.match(sanitized.orderNumber, /^AF-[0-9]{6}$/);
  assert.equal(sanitized.recipientName, 'আব্দুল্লাহ আল মামুন');
  assert.equal(toBengaliDigits(2026), '২০২৬');
  assert.equal(formatBdt(320), '৳৩২০');
  assert.equal(formatPriceByCurrency(1450, 'BDT'), '৳1,450');
  assert.equal(SUNNAH_COMBO_BUNDLES.length, 3);
  assert.equal(SACRED_CALLIGRAPHY_PRESETS.length, 4);
  assert.equal(DEFAULT_STORE_BRAND_SETTINGS.brandNameBangla, 'বারাকাহ সুন্নাহ ফুডস');

  const build = createSavedStudioBuild({
    productId: 'food-ajwa-01',
    finish: 'titanium',
    lighting: 'atelier-daylight',
    explodeRatio: 0.5,
  });
  assert.equal(build.productId, 'food-ajwa-01');

  const customItem = createCustomProductItem({
    banglaTitle: 'সৌদি মাবরুম খেজুর',
    price: 1250,
    category: 'dates-honey',
  });
  assert.equal(customItem.price, 1250);
});

test('isAuthorizedStoreOwnerEmail and verifyAdminAccess support both positional and object signatures', () => {
  assert.equal(isAuthorizedStoreOwnerEmail(STORE_OWNER_EMAIL), true);
  assert.equal(isAuthorizedStoreOwnerEmail('visitor@example.com'), false);

  assert.equal(verifyAdminAccess('wrongpass', 'barakah786', 'visitor@example.com'), false);
  assert.equal(verifyAdminAccess('', 'barakah786', STORE_OWNER_EMAIL), true);
  assert.equal(verifyAdminAccess('barakah786', 'barakah786', null), true);

  assert.equal(
    verifyAdminAccess({
      userEmail: 'visitor@example.com',
      enteredPasscode: 'wrong',
      storedPasscode: 'barakah786',
    }),
    false
  );
  assert.equal(
    verifyAdminAccess({
      userEmail: null,
      enteredPasscode: 'barakah786',
      storedPasscode: 'barakah786',
    }),
    true
  );
});

test('buildArticleShareLinks generates Facebook, WhatsApp, and Twitter share URLs with deep-link article parameter', async () => {
  const { buildArticleShareLinks } = await import('./literaryCatalog.js');
  const article = INITIAL_LITERARY_ARTICLES[0];
  const links = buildArticleShareLinks(
    article,
    'একটুখানি সাহিত্যের পরশ',
    'https://sahityerparash.com/'
  );

  assert.equal(links.shareUrl, `https://sahityerparash.com/?article=${article.id}`);
  assert.ok(links.shareText.includes(article.title));
  assert.ok(links.shareText.includes(article.authorName));
  assert.ok(links.facebookUrl.startsWith('https://www.facebook.com/sharer/sharer.php?u='));
  assert.ok(links.facebookUrl.includes(encodeURIComponent(links.shareUrl)));
  assert.ok(links.whatsappUrl.startsWith('https://api.whatsapp.com/send?text='));
  assert.ok(links.whatsappUrl.includes(encodeURIComponent(links.shareUrl)));
  assert.ok(links.twitterUrl.startsWith('https://twitter.com/intent/tweet?text='));
  assert.ok(links.twitterUrl.includes(encodeURIComponent(links.shareUrl)));
});

test('getLiveBengaliAndHijriDates, upsertLiteraryAuthor, and upsertLiteraryCategory compute live dates and update authors/categories', async () => {
  const {
    getLiveBengaliAndHijriDates,
    upsertLiteraryAuthor,
    upsertLiteraryCategory,
    LITERARY_CATEGORIES,
  } = await import('./literaryCatalog.js');

  const oct25 = new Date(2026, 9, 25, 12, 0, 0); // Oct 25, 2026
  const dates = getLiveBengaliAndHijriDates(oct25);
  assert.equal(dates.weekdayBn, 'রবিবার');
  assert.equal(dates.gregorianDateBn, '২৫ অক্টোবর ২০২৬');
  assert.equal(dates.banglaDateBn, '৯ কার্তিক ১৪৩৩ বঙ্গাব্দ');
  assert.ok(dates.hijriDateBn.includes('হিজরি'));

  const nextDay = new Date(2026, 9, 26, 12, 0, 0); // Oct 26, 2026
  const nextDates = getLiveBengaliAndHijriDates(nextDay);
  assert.equal(nextDates.weekdayBn, 'সোমবার');
  assert.equal(nextDates.banglaDateBn, '১০ কার্তিক ১৪৩৩ বঙ্গাব্দ');

  // Edit existing author
  const updatedAuthors = upsertLiteraryAuthor(LITERARY_AUTHORS, {
    id: 'author-mahmud',
    nameBn: 'ড. আব্দুল্লাহ আল-মাহমুদ',
    designationBn: 'প্রধান সম্পাদক ও গবেষক',
  });
  assert.equal(updatedAuthors.length, LITERARY_AUTHORS.length);
  assert.equal(updatedAuthors[0].nameBn, 'ড. আব্দুল্লাহ আল-মাহমুদ');
  assert.equal(updatedAuthors[0].designationBn, 'প্রধান সম্পাদক ও গবেষক');

  // Add new author
  const withNewAuthor = upsertLiteraryAuthor(updatedAuthors, {
    nameBn: 'মাওলানা সাইফুল্লাহ আল-আজহারী',
    designationBn: 'সীরাত ও ইতিহাস প্রাবন্ধিক',
  });
  assert.equal(withNewAuthor.length, LITERARY_AUTHORS.length + 1);
  assert.equal(withNewAuthor[withNewAuthor.length - 1].nameBn, 'মাওলানা সাইফুল্লাহ আল-আজহারী');

  // Edit existing category & add new category
  const updatedCats = upsertLiteraryCategory(LITERARY_CATEGORIES, {
    id: 'iman-life',
    labelBn: 'ঈমান, আকীদা ও জীবনবোধ',
  });
  assert.equal(
    updatedCats.find((c) => c.id === 'iman-life')?.labelBn,
    'ঈমান, আকীদা ও জীবনবোধ'
  );

  const withNewCat = upsertLiteraryCategory(updatedCats, {
    labelBn: 'সীরাত ও সাহাবা চরিত',
    labelEn: 'Seerah & Companions',
  });
  assert.equal(withNewCat.length, LITERARY_CATEGORIES.length + 1);
  assert.equal(withNewCat[withNewCat.length - 1].labelBn, 'সীরাত ও সাহাবা চরিত');
});

test('resolveThemeMode and getThemeModeBadgeLabelBn handle Auto, Day, and Night modes deterministically', async () => {
  const { resolveThemeMode, getThemeModeBadgeLabelBn } = await import('./literaryCatalog.js');

  // Explicit overrides
  assert.equal(resolveThemeMode('day', 22, true), 'day');
  assert.equal(resolveThemeMode('night', 10, false), 'night');

  // Auto mode: daytime (10 AM) with light OS preference -> day
  assert.equal(resolveThemeMode('auto', 10, false), 'day');
  // Auto mode: daytime (2 PM) with dark OS preference -> night
  assert.equal(resolveThemeMode('auto', 14, true), 'night');
  // Auto mode: evening (7 PM / 19:00) with light OS preference -> night
  assert.equal(resolveThemeMode('auto', 19, false), 'night');
  // Auto mode: early morning (4 AM / 04:00) with light OS preference -> night
  assert.equal(resolveThemeMode('auto', 4, false), 'night');

  assert.equal(getThemeModeBadgeLabelBn('auto', 'night'), 'অটো (রাত মোড সক্রিয়)');
  assert.equal(getThemeModeBadgeLabelBn('auto', 'day'), 'অটো (দিন মোড সক্রিয়)');
  assert.equal(getThemeModeBadgeLabelBn('night', 'night'), 'রাত মোড (Night)');
  assert.equal(getThemeModeBadgeLabelBn('day', 'day'), 'দিন মোড (Day)');
});


