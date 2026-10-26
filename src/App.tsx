import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  BookOpen,
  Feather,
  MessageSquareQuote,
  ShoppingBag,
  ArrowRight,
  ArrowUp,
  Download,
  Heart,
  Check,
  X,
  Plus,
  Minus,
  Send,
  Bookmark,
  Lock,
  Settings,
  Phone,
  MapPin,
  Mail,
  ChevronRight,
  Share2,
  Copy,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import {
  LITERARY_CATEGORIES,
  DEFAULT_LITERARY_BRAND,
  LITERARY_AUTHORS,
  INITIAL_LITERARY_ARTICLES,
  INITIAL_ANTHOLOGY_VOLUMES,
  INITIAL_LITERARY_QUESTIONS,
  filterLiteraryArticles,
  filterLiteraryQuestions,
  getVolumeEditionPrice,
  calculateBookCartSummary,
  createNewLiteraryArticle,
  createNewLiteraryQuestion,
  buildArticleShareLinks,
  getLiveBengaliAndHijriDates,
  resolveThemeMode,
  getThemeModeBadgeLabelBn,
  type ThemePreference,
  type LiteraryCategoryId,
  type LiteraryCategoryMeta,
  type LiteraryAuthor,
  type LiteraryArticle,
  type AnthologyVolume,
  type LiteraryQuestion,
  type LiteraryBrandConfig,
  type BookCartItem,
  type BookEditionType,
} from './store/literaryCatalog';
import {
  INITIAL_DEMO_ORDERS,
  DEFAULT_ADMIN_PASSCODE,
  STORE_OWNER_EMAIL,
  formatBdt,
  toBengaliDigits,
  getNextOrderStatus,
  type TrackedOrder,
  type OrderStatus,
  type FinishId,
  type Product3DItem,
} from './store/catalog';
import { ArticleCoverArt, VolumeCoverVisual } from './components/LiteraryCoverArt';
import { StoreEditorModal } from './components/StoreEditorModal';
import { AccountDossierModal } from './components/AccountDossierModal';

const STORAGE_KEYS = {
  BRAND: 'esp_literary_brand_v1',
  ARTICLES: 'esp_literary_articles_v1',
  QUESTIONS: 'esp_literary_questions_v1',
  AUTHORS: 'esp_literary_authors_v1',
  CATEGORIES: 'esp_literary_categories_v1',
  CART: 'esp_literary_book_cart_v1',
  BOOKMARKS: 'esp_literary_bookmarks_v1',
  ADMIN_PASSCODE: 'esp_admin_passcode_v1',
  ADMIN_UNLOCKED: 'esp_admin_unlocked_v1',
  THEME_MODE: 'esp_theme_mode_v1',
};

type WowVariant =
  | 'bounceInDown'
  | 'slideInLeft'
  | 'slideInRight'
  | 'slideInUp'
  | 'textReveal';

interface WowBlockProps {
  variant: WowVariant;
  delayMs?: number;
  className?: string;
  as?: 'div' | 'article' | 'aside' | 'blockquote' | 'p' | 'h1' | 'h2' | 'h3';
  onClick?: () => void;
  children: React.ReactNode;
}

/**
 * Pure React IntersectionObserver WOW.js-equivalent wrapper matching al-itisam.com's
 * `wow bounceInDown`, `wow slideInLeft`, `wow slideInRight`, `wow slideInUp`, and staggered text reveal.
 */
const WowBlock: React.FC<WowBlockProps> = ({
  variant,
  delayMs = 0,
  className = '',
  as: Tag = 'div',
  onClick,
  children,
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState<boolean>(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const animClass = inView ? `wow-${variant}` : 'wow-hidden';
  const delayStyle = delayMs > 0 ? { animationDelay: `${delayMs}ms` } : undefined;

  return React.createElement(
    Tag,
    {
      ref,
      onClick,
      style: delayStyle,
      className: `${animClass} ${className}`,
    },
    children
  );
};

export function App() {
  // Core Full-Stack State (hydrated from Express /api/bootstrap + localStorage fallback)
  const [brand, setBrand] = useState<LiteraryBrandConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BRAND);
      return saved ? { ...DEFAULT_LITERARY_BRAND, ...JSON.parse(saved) } : DEFAULT_LITERARY_BRAND;
    } catch {
      return DEFAULT_LITERARY_BRAND;
    }
  });

  const [articles, setArticles] = useState<LiteraryArticle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ARTICLES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_LITERARY_ARTICLES;
  });

  const [volumes, setVolumes] = useState<AnthologyVolume[]>(INITIAL_ANTHOLOGY_VOLUMES);

  const [questions, setQuestions] = useState<LiteraryQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_LITERARY_QUESTIONS;
  });

  const [authors, setAuthors] = useState<LiteraryAuthor[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTHORS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return LITERARY_AUTHORS;
  });

  const [categories, setCategories] = useState<LiteraryCategoryMeta[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return LITERARY_CATEGORIES;
  });

  // Live automatic daily date clock (updates automatically every minute / midnight)
  const [liveDateNow, setLiveDateNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveDateNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  const liveDates = useMemo(() => getLiveBengaliAndHijriDates(liveDateNow), [liveDateNow]);

  // Auto Day Mode & Night Mode ('auto' | 'day' | 'night')
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
      if (saved === 'auto' || saved === 'day' || saved === 'night') return saved;
    } catch {
      // ignore
    }
    return 'auto';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const resolvedTheme = useMemo(
    () => resolveThemeMode(themePreference, liveDateNow.getHours(), systemPrefersDark),
    [themePreference, liveDateNow, systemPrefersDark]
  );

  useEffect(() => {
    const isNight = resolvedTheme === 'night';
    document.documentElement.classList.toggle('dark', isNight);
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME_MODE, themePreference);
    } catch {
      // ignore
    }
  }, [themePreference, resolvedTheme]);

  // Filtering & Search State
  const [selectedCategory, setSelectedCategory] = useState<LiteraryCategoryId>('all');
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>('all');
  const [selectedVolumeId, setSelectedVolumeId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Animated Headline Ticker Index (cycles through articles cleanly)
  const [tickerIndex, setTickerIndex] = useState<number>(0);

  // Q&A Filters
  const [qaTopicFilter, setQaTopicFilter] = useState<string>('সব জিজ্ঞাসা');
  const [qaSearchQuery, setQaSearchQuery] = useState<string>('');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string>(
    INITIAL_LITERARY_QUESTIONS[0]?.id || ''
  );

  // Reader Modal State
  const [activeArticle, setActiveArticle] = useState<LiteraryArticle | null>(null);
  const [readerFontScale, setReaderFontScale] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return saved ? JSON.parse(saved) : ['art-1', 'art-3'];
    } catch {
      return ['art-1'];
    }
  });

  // Scroll-to-top visibility (matches al-itisam.com custom.js scroll > 300)
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  // Submission Modal (Ask Question or Submit Original Writing)
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState<boolean>(false);
  const [submissionMode, setSubmissionMode] = useState<'question' | 'writing'>('question');
  const [submissionSuccessMsg, setSubmissionSuccessMsg] = useState<string | null>(null);

  // Question Form Fields
  const [qTitle, setQTitle] = useState('');
  const [qDetail, setQDetail] = useState('');
  const [qAskedBy, setQAskedBy] = useState('');
  const [qAskedFrom, setQAskedFrom] = useState('');
  const [qTopic, setQTopic] = useState('সাহিত্য ও শরিয়াহ');

  // Writing Submission Form Fields
  const [wTitle, setWTitle] = useState('');
  const [wSubtitle, setWSubtitle] = useState('');
  const [wAuthorName, setWAuthorName] = useState('');
  const [wCategory, setWCategory] = useState<Exclude<LiteraryCategoryId, 'all'>>('original-prose');
  const [wContent, setWContent] = useState('');
  const [wCitations, setWCitations] = useState('');
  const [wCustomCoverUrl, setWCustomCoverUrl] = useState('');

  // Book Order Cart State (for Hardcover Anthology Volumes)
  const [bookCart, setBookCart] = useState<BookCartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [{ volumeId: 'vol-1', edition: 'hardcover', quantity: 1 }];
    } catch {
      return [{ volumeId: 'vol-1', edition: 'hardcover', quantity: 1 }];
    }
  });
  const [isBookCartOpen, setIsBookCartOpen] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState<'ঢাকা' | 'ঢাকার বাইরে'>('ঢাকা');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'ক্যাশ অন ডেলিভারি' | 'বিকাশ / নগদ'>('ক্যাশ অন ডেলিভারি');
  const [orderConfirmation, setOrderConfirmation] = useState<TrackedOrder | null>(null);

  // Firebase Auth, Order Tracking & Owner Admin State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<TrackedOrder[]>(INITIAL_DEMO_ORDERS);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [cloudSyncMessage, setCloudSyncMessage] = useState<string>('ক্লাউড সিঙ্ক প্রস্তুত');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [clientDisplayName, setClientDisplayName] = useState<string>('সম্মানিত পাঠক');
  const [preferredFinish, setPreferredFinish] = useState<FinishId>('titanium');

  // Owner Security Gate & Editor Modal — ALWAYS starts locked
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [storedPasscode, setStoredPasscode] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_PASSCODE) || DEFAULT_ADMIN_PASSCODE;
    } catch {
      return DEFAULT_ADMIN_PASSCODE;
    }
  });
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);

  useEffect(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_UNLOCKED);
    } catch {
      // ignore
    }
  }, []);

  // Toast banner & Social Share Copy state
  const [toastBanner, setToastBanner] = useState<string | null>(null);
  const [copiedShareArticleId, setCopiedShareArticleId] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastBanner(msg);
    setTimeout(() => setToastBanner(null), 3500);
  };

  // Auto-open article reader modal when visiting a shared deep-link (?article=art-1)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sharedArticleId = params.get('article');
      if (sharedArticleId && articles.length > 0) {
        const found = articles.find((a) => a.id === sharedArticleId);
        if (found) {
          setActiveArticle(found);
        }
      }
    } catch {
      // ignore URL parsing errors
    }
  }, [articles]);

  const activeShareLinks = useMemo(() => {
    if (!activeArticle) return null;
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://sahityerparash.com';
    return buildArticleShareLinks(activeArticle, brand.siteNameBn, origin);
  }, [activeArticle, brand.siteNameBn]);

  const handleCopyArticleShareLink = async (art: LiteraryArticle) => {
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://sahityerparash.com';
    const links = buildArticleShareLinks(art, brand.siteNameBn, origin);
    try {
      await navigator.clipboard.writeText(links.shareUrl);
    } catch {
      // fallback if clipboard permission denied
    }
    setCopiedShareArticleId(art.id);
    triggerToast('রচনার শেয়ার লিংক ক্লিপবোর্ডে কপি হয়েছে!');
    setTimeout(() => {
      setCopiedShareArticleId((prev) => (prev === art.id ? null : prev));
    }, 2500);
  };

  // Cycle animated writing headline ticker every 4.2 seconds
  useEffect(() => {
    if (articles.length <= 1) return;
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % articles.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [articles.length]);

  // Listen to window scroll for floating back_to_top button (al-itisam.com custom.js pattern)
  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Hydrate from Full-Stack Express Backend (/api/bootstrap)
  useEffect(() => {
    let mounted = true;
    fetch('/api/bootstrap')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted || !data) return;
        if (data.brand) setBrand(data.brand);
        if (Array.isArray(data.articles) && data.articles.length > 0) setArticles(data.articles);
        if (Array.isArray(data.volumes) && data.volumes.length > 0) setVolumes(data.volumes);
        if (Array.isArray(data.questions) && data.questions.length > 0) setQuestions(data.questions);
        if (Array.isArray(data.authors) && data.authors.length > 0) setAuthors(data.authors);
        if (Array.isArray(data.categories) && data.categories.length > 0) setCategories(data.categories);
        if (Array.isArray(data.orders) && data.orders.length > 0) setOrders(data.orders);
      })
      .catch(() => {
        // Fallback to local state seamlessly
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Persist local state backups
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BRAND, JSON.stringify(brand));
    } catch {
      // ignore
    }
  }, [brand]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
    } catch {
      // ignore
    }
  }, [articles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    } catch {
      // ignore
    }
  }, [questions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTHORS, JSON.stringify(authors));
    } catch {
      // ignore
    }
  }, [authors]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch {
      // ignore
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(bookCart));
    } catch {
      // ignore
    }
  }, [bookCart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarkedIds));
    } catch {
      // ignore
    }
  }, [bookmarkedIds]);

  // Firebase Auth listener (does NOT bypass Admin Password Security Gate)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user?.displayName) {
        setClientDisplayName(user.displayName);
      }
    });
    return () => unsub();
  }, []);

  // Filtered Articles & Lead Editorial
  const filteredArticles = useMemo(
    () =>
      filterLiteraryArticles(
        articles,
        selectedCategory,
        searchQuery,
        selectedAuthorId,
        selectedVolumeId
      ),
    [articles, selectedCategory, searchQuery, selectedAuthorId, selectedVolumeId]
  );

  const leadArticle = useMemo(
    () => articles.find((a) => a.isLeadEditorial) || articles[0],
    [articles]
  );

  const secondaryFeaturedArticles = useMemo(
    () => articles.filter((a) => a.id !== leadArticle?.id && a.isFeatured).slice(0, 3),
    [articles, leadArticle]
  );

  // Filtered Questions (সাওয়াল-জওয়াব)
  const filteredQuestions = useMemo(
    () => filterLiteraryQuestions(questions, qaTopicFilter, qaSearchQuery),
    [questions, qaTopicFilter, qaSearchQuery]
  );

  // Book Cart Summary
  const cartSummary = useMemo(
    () => calculateBookCartSummary(bookCart, customerCity, volumes),
    [bookCart, customerCity, volumes]
  );

  // Handlers: Like / Appreciate Article
  const handleAppreciateArticle = async (articleId: string) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, likesCount: a.likesCount + 1 } : a))
    );
    if (activeArticle && activeArticle.id === articleId) {
      setActiveArticle((prev) => (prev ? { ...prev, likesCount: prev.likesCount + 1 } : null));
    }
    triggerToast('জাযাকাল্লাহু খাইরান! রচনাটিতে আপনার ভালোবাসা যুক্ত হয়েছে।');
    try {
      await fetch(`/api/articles/${articleId}/like`, { method: 'POST' });
    } catch {
      // optimistic update already applied
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = (articleId: string) => {
    setBookmarkedIds((prev) => {
      const exists = prev.includes(articleId);
      const next = exists ? prev.filter((id) => id !== articleId) : [...prev, articleId];
      triggerToast(exists ? 'পাঠতালিকা থেকে সরানো হয়েছে।' : 'রচনাটি আপনার পাঠতালিকায় সংরক্ষিত হয়েছে!');
      return next;
    });
  };

  // Download Article or Volume for Offline Reading (.txt manuscript)
  const handleDownloadArticleManuscript = (art: LiteraryArticle) => {
    const content = [
      `=============================================================`,
      `${brand.siteNameBn} — ${brand.taglineBn}`,
      `=============================================================`,
      ``,
      `শিরোনাম: ${art.title}`,
      `উপ-শিরোনাম: ${art.subtitle}`,
      `লেখক: ${art.authorName} (${art.authorRole})`,
      `বিভাগ: ${art.categoryBn} | সংকলন: ${art.volumeTitle}`,
      `প্রকাশকাল: ${art.publishedAtBn} | পাঠ সময়: ${art.readTimeBn}`,
      ``,
      `-------------------------------------------------------------`,
      `মূল উদ্ধৃতি: "${art.pullQuote}"`,
      `-------------------------------------------------------------`,
      ``,
      ...art.paragraphs.map((p) => `${p}\n`),
      `-------------------------------------------------------------`,
      `টীকা ও তথ্যসূত্র:`,
      ...art.citations.map((c, idx) => `${toBengaliDigits(idx + 1)}. ${c}`),
      `=============================================================`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${art.id}-manuscript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('অফলাইনে পড়ার জন্য রচনাটির পাণ্ডুলিপি ডাউনলোড হয়েছে!');
  };

  const handleDownloadVolumeDigest = (vol: AnthologyVolume) => {
    const volArticles = articles.filter((a) => a.volumeId === vol.id);
    const content = [
      `=============================================================`,
      `${brand.siteNameBn} — মৌলিক সাহিত্য সংকলন ডিজিটাল সংস্করণ`,
      `=============================================================`,
      `${vol.volumeNumberBn}: ${vol.titleBn}`,
      `${vol.subtitleBn}`,
      `প্রকাশকাল: ${vol.publishedSeasonBn} | পৃষ্ঠা সংখ্যা: ${toBengaliDigits(vol.pageCount)}`,
      ``,
      `সম্পাদকীয় ভূমিকা:`,
      `${vol.editorialNoteBn}`,
      ``,
      `অন্তর্ভুক্ত রচনাসমূহ:`,
      ...vol.highlightsBn.map((h, i) => `  ${toBengaliDigits(i + 1)}. ${h}`),
      ``,
      `=============================================================`,
      ...volArticles.flatMap((art) => [
        `\n### ${art.title} — ${art.authorName}\n`,
        ...art.paragraphs.map((p) => `${p}\n`),
      ]),
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${vol.id}-anthology.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast(`"${vol.titleBn}" সংকলনের অফলাইন কপি ডাউনলোড হয়েছে!`);
  };

  // Book Cart Operations
  const handleAddVolumeToCart = (volumeId: string, edition: BookEditionType = 'hardcover') => {
    setBookCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.volumeId === volumeId && item.edition === edition
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [...prev, { volumeId, edition, quantity: 1 }];
    });
    setOrderConfirmation(null);
    setIsBookCartOpen(true);
  };

  const handleUpdateCartQuantity = (volumeId: string, edition: BookEditionType, delta: number) => {
    setBookCart((prev) =>
      prev
        .map((item) =>
          item.volumeId === volumeId && item.edition === edition
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleSubmitBookOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bookCart.length === 0 || !customerName.trim() || !customerPhone.trim()) return;

    const summaryText = bookCart
      .map((item) => {
        const vol = volumes.find((v) => v.id === item.volumeId);
        const edLabel =
          item.edition === 'collector-box' ? 'হাদিয়া বক্স' : 'হার্ডকভার সংস্করণ';
        return `${vol?.titleBn || 'সংকলন'} (${edLabel}) × ${toBengaliDigits(item.quantity)}`;
      })
      .join(', ');

    const orderNumber = `AF-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: TrackedOrder = {
      id: `ord_${Date.now()}`,
      uid: currentUser?.uid || 'guest_reader',
      orderNumber,
      status: 'placed',
      recipientName: customerName.trim(),
      recipientPhone: customerPhone.trim(),
      destinationCity: customerAddress.trim() || `${customerCity}, বাংলাদেশ`,
      postalCode: '1209',
      trackingCode: `ESP-${orderNumber.slice(3)}-DHK`,
      courier: 'Sahityer Parash Book Courier',
      estimatedDelivery: '২৪–৪৮ ঘণ্টা ডেলিভারি',
      primaryProductId: 'food-ajwa-01',
      primaryFinish: 'brass',
      itemsSummary: summaryText,
      itemCount: cartSummary.itemCount,
      total: cartSummary.totalBdt,
      paymentMethod: paymentMethod === 'ক্যাশ অন ডেলিভারি' ? 'cod' : 'card',
      createdAtLabel: 'আজ, এইমাত্র',
      updatedAtLabel: 'এইমাত্র',
      createdAtMs: Date.now(),
      source: currentUser ? 'firestore' : 'session',
    };

    setOrders((prev) => [newOrder, ...prev]);
    setOrderConfirmation(newOrder);
    setBookCart([]);

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
    } catch {
      // local state updated
    }

    if (currentUser) {
      try {
        await setDoc(doc(db, 'orders', newOrder.id), {
          ...newOrder,
          userId: currentUser.uid,
          createdAtIso: new Date().toISOString(),
        });
      } catch {
        // ignore firestore error for guest
      }
    }
  };

  // Reader Question Submission (POST /api/questions)
  const handleSubmitQuestionForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qTitle.trim() || !qDetail.trim()) return;

    const created = createNewLiteraryQuestion({
      questionTitle: qTitle,
      questionDetail: qDetail,
      askedBy: qAskedBy || 'জনৈক সচেতন পাঠক',
      askedFrom: qAskedFrom || 'ঢাকা',
      topicBn: qTopic,
    });

    setQuestions((prev) => [created, ...prev]);
    setExpandedQuestionId(created.id);
    setSubmissionSuccessMsg(
      'জাযাকাল্লাহু খাইরান! আপনার জিজ্ঞাসাটি সম্পাদনা পরিষদে গৃহীত হয়েছে এবং নিচে "সাওয়াল-জওয়াব" বিভাগে যুক্ত হয়েছে।'
    );

    try {
      await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionTitle: qTitle,
          questionDetail: qDetail,
          askedBy: qAskedBy,
          askedFrom: qAskedFrom,
          topicBn: qTopic,
        }),
      });
    } catch {
      // local state already updated
    }

    setQTitle('');
    setQDetail('');
  };

  // Reader/Writer Original Writing Submission (POST /api/articles)
  const handleSubmitWritingForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wTitle.trim() || !wContent.trim()) return;

    const catObj = categories.find((c) => c.id === wCategory);
    const paragraphs = wContent
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    const citations = wCitations
      .split(/\n+/)
      .map((c) => c.trim())
      .filter(Boolean);

    const created = createNewLiteraryArticle({
      title: wTitle,
      subtitle: wSubtitle || 'মৌলিক সাহিত্য রচনা',
      category: wCategory,
      categoryBn: catObj?.labelBn || 'মৌলিক গদ্য ও প্রবন্ধ',
      authorName: wAuthorName || 'অতিথি লেখক',
      authorRole: 'মৌলিক সাহিত্যিক ও প্রাবন্ধিক',
      paragraphs,
      citations,
      customCoverUrl: wCustomCoverUrl.trim() || undefined,
    });

    setArticles((prev) => [created, ...prev]);
    setSubmissionSuccessMsg(
      'আলহামদুলিল্লাহ! আপনার মৌলিক রচনাটি প্রকাশিত হয়েছে এবং রচনা ভান্ডারে যুক্ত করা হয়েছে।'
    );

    try {
      await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created),
      });
    } catch {
      // local state already updated
    }

    setWTitle('');
    setWSubtitle('');
    setWContent('');
    setWCitations('');
    setWCustomCoverUrl('');
  };

  // Admin CMS Handlers
  const handleUpdateBrand = async (nextBrand: LiteraryBrandConfig) => {
    setBrand(nextBrand);
    try {
      await fetch('/api/brand', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextBrand),
      });
    } catch {
      // saved locally
    }
  };

  const handleUpdateAuthors = async (nextAuthors: LiteraryAuthor[]) => {
    setAuthors(nextAuthors);
    // Keep articles' authorName and authorRole in sync when an existing author is edited
    setArticles((prev) =>
      prev.map((art) => {
        const matched = nextAuthors.find((au) => au.id === art.authorId);
        if (!matched) return art;
        return {
          ...art,
          authorName: matched.nameBn,
          authorRole: matched.designationBn,
        };
      })
    );
    try {
      await fetch('/api/authors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authors: nextAuthors }),
      });
    } catch {
      // saved locally
    }
  };

  const handleUpdateCategories = async (nextCategories: LiteraryCategoryMeta[]) => {
    setCategories(nextCategories);
    // Keep articles' categoryBn in sync when an existing category label is edited
    setArticles((prev) =>
      prev.map((art) => {
        const matched = nextCategories.find((cat) => cat.id === art.category);
        if (!matched) return art;
        return {
          ...art,
          categoryBn: matched.labelBn,
        };
      })
    );
    try {
      await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: nextCategories }),
      });
    } catch {
      // saved locally
    }
  };

  const handleAdminSaveArticle = async (
    articleInput: Partial<LiteraryArticle> & { title: string }
  ) => {
    if (articleInput.id) {
      setArticles((prev) =>
        prev.map((a) => (a.id === articleInput.id ? ({ ...a, ...articleInput } as LiteraryArticle) : a))
      );
      try {
        await fetch(`/api/articles/${articleInput.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(articleInput),
        });
      } catch {
        // saved locally
      }
    } else {
      const created = createNewLiteraryArticle({
        title: articleInput.title,
        subtitle: articleInput.subtitle,
        category: articleInput.category,
        categoryBn: articleInput.categoryBn,
        authorId: articleInput.authorId,
        authorName: articleInput.authorName,
        authorRole: articleInput.authorRole,
        volumeTitle: articleInput.volumeTitle,
        readTimeBn: articleInput.readTimeBn,
        excerpt: articleInput.excerpt,
        pullQuote: articleInput.pullQuote,
        paragraphs: articleInput.paragraphs || [articleInput.title],
        citations: articleInput.citations,
        coverMotif: articleInput.coverMotif,
        customCoverUrl: articleInput.customCoverUrl,
      });
      setArticles((prev) => [created, ...prev]);
      try {
        await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(created),
        });
      } catch {
        // saved locally
      }
    }
  };

  const handleAdminDeleteArticle = async (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    try {
      await fetch(`/api/articles/${id}`, { method: 'DELETE' });
    } catch {
      // saved locally
    }
  };

  const handleAdminAnswerQuestion = async (
    id: string,
    answerText: string,
    answeredBy: string,
    references: string[]
  ) => {
    const paragraphs = answerText
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              answerParagraphs: paragraphs,
              answeredBy,
              references: references.length > 0 ? references : q.references,
              status: 'answered',
            }
          : q
      )
    );
    try {
      await fetch(`/api/questions/${id}/answer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerParagraphs: paragraphs, answeredBy, references }),
      });
    } catch {
      // saved locally
    }
  };

  const handleAdminDeleteQuestion = async (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    try {
      await fetch(`/api/questions/${id}`, { method: 'DELETE' });
    } catch {
      // deleted locally
    }
  };

  const handleAdminUpdateOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: nextStatus, updatedAtLabel: 'এইমাত্র আপডেটকৃত' } : o
      )
    );
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch {
      // updated locally
    }
  };

  const handleAdminDeleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    } catch {
      // deleted locally
    }
  };

  // Refresh latest reader questions & book orders from backend whenever Admin Panel opens
  useEffect(() => {
    if (!isEditorOpen) return;
    fetch('/api/questions')
      .then((res) => (res.ok ? res.json() : null))
      .then((serverQuestions) => {
        if (Array.isArray(serverQuestions) && serverQuestions.length > 0) {
          setQuestions(serverQuestions);
        }
      })
      .catch(() => {
        // fallback to local questions
      });

    fetch('/api/orders')
      .then((res) => (res.ok ? res.json() : null))
      .then((serverOrders) => {
        if (Array.isArray(serverOrders) && serverOrders.length > 0) {
          setOrders(serverOrders);
        }
      })
      .catch(() => {
        // fallback to local orders
      });
  }, [isEditorOpen]);

  const handleResetAll = async () => {
    setBrand(DEFAULT_LITERARY_BRAND);
    setArticles(INITIAL_LITERARY_ARTICLES);
    setVolumes(INITIAL_ANTHOLOGY_VOLUMES);
    setQuestions(INITIAL_LITERARY_QUESTIONS);
    setAuthors(LITERARY_AUTHORS);
    setCategories(LITERARY_CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.BRAND);
    localStorage.removeItem(STORAGE_KEYS.ARTICLES);
    localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
    localStorage.removeItem(STORAGE_KEYS.AUTHORS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    try {
      await fetch('/api/reset', { method: 'POST' });
    } catch {
      // reset locally
    }
  };

  // Firestore Order Sync Handlers for AccountDossierModal
  const handleSignInGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch {
      triggerToast('গুগল সাইন-ইন সম্পন্ন হয়নি।');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleRefreshOrdersFromFirestore = async () => {
    setIsLoadingOrders(true);
    setCloudSyncStatus('syncing');
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAtIso', 'desc'), limit(20));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const fetched: TrackedOrder[] = [];
        snap.forEach((d) => fetched.push(d.data() as TrackedOrder));
        setOrders(fetched);
      }
      setCloudSyncStatus('synced');
      setCloudSyncMessage('ক্লাউড ডাটাবেস থেকে সংকলন অর্ডার সিঙ্ক সম্পন্ন');
    } catch {
      setCloudSyncStatus('idle');
      setCloudSyncMessage('স্থানীয় অর্ডার তালিকা প্রদর্শিত হচ্ছে');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleAdvanceOrderStatus = async (order: TrackedOrder) => {
    const nextStatus = getNextOrderStatus(order.status);
    if (!nextStatus) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o))
    );
  };

  const currentTickerArticle = articles[tickerIndex % Math.max(1, articles.length)];

  const readerTextClass =
    readerFontScale === 'xlarge'
      ? 'text-xl leading-[2.05]'
      : readerFontScale === 'large'
      ? 'text-lg leading-[1.98]'
      : 'text-[17px] leading-[1.92]';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col selection:bg-[#0F766E] selection:text-white">
      {/* Toast Notification */}
      {toastBanner && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md px-4 py-3 rounded-lg bg-[#0F766E] text-[#FFFFFF] shadow-xl border border-[#2DD4BF]/30 flex items-center gap-2.5 text-xs font-medium wow-slideInUp">
          <Check className="w-4 h-4 text-[#5EEAD4] shrink-0" />
          <span>{toastBanner}</span>
        </div>
      )}

      {/* =====================================================================
          1. TOP BAR CONTRACT (3 Distinct Functional Zones, Single Row)
          Inspired by al-itisam.com, tailored for একটুখানি সাহিত্যের পরশ
         ===================================================================== */}
      <header className="sticky top-0 z-40 h-[72px] bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-[1380px] mx-auto h-full px-4 sm:px-8 flex items-center justify-between gap-4">
          {/* Zone 1 (Left): Brand Monogram & Publication Title */}
          <a
            href="#top"
            className="flex items-center gap-3 group focus:outline-none shrink-0"
          >
            {brand.logoImageUrl && brand.logoImageUrl.trim().length > 5 ? (
              <img
                src={brand.logoImageUrl}
                alt={brand.siteNameBn}
                className="w-10 h-10 rounded-lg object-cover border border-[#0F766E]/25"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[#0F766E] text-[#FFFFFF] flex items-center justify-center font-editorial font-bold text-base shadow-xs border border-[#2DD4BF]/40">
                {brand.logoMonogramBn}
              </div>
            )}
            <div>
              <span className="block font-editorial text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight group-hover:text-[#0F766E] transition-colors">
                {brand.siteNameBn}
              </span>
              <span className="hidden sm:block text-[11px] text-[#475569]">
                {brand.taglineBn}
              </span>
            </div>
          </a>

          {/* Zone 2 (Center): 5 Single-Line Editorial Navigation Links */}
          <nav
            aria-label="প্রধান মেনু"
            className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#475569]"
          >
            <a
              href="#original-writings"
              className="whitespace-nowrap hover:text-[#0F766E] transition-colors"
            >
              মৌলিক রচনা
            </a>
            <a
              href="#anthology-volumes"
              className="whitespace-nowrap hover:text-[#0F766E] transition-colors"
            >
              গ্রন্থ ও সংকলন
            </a>
            <a
              href="#sawal-jawab"
              className="whitespace-nowrap hover:text-[#0F766E] transition-colors"
            >
              জিজ্ঞাসা ও উত্তর
            </a>
            <a
              href="#authors-directory"
              className="whitespace-nowrap hover:text-[#0F766E] transition-colors"
            >
              লেখক বৃন্দ
            </a>
            <button
              type="button"
              onClick={() => setIsAccountModalOpen(true)}
              className="whitespace-nowrap hover:text-[#0F766E] transition-colors cursor-pointer"
            >
              পাঠক ট্র্যাকিং
            </button>
          </nav>

          {/* Zone 3 (Right): Book Order Bag + 1 Primary Solid Forest-Emerald CTA */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsBookCartOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E2E8F0] bg-[#F1F5F9]/70 hover:bg-[#F1F5F9] text-xs font-semibold text-[#0F172A] transition-colors cursor-pointer"
              title="হার্ডকভার সংকলন অর্ডার ব্যাগ"
            >
              <ShoppingBag className="w-4 h-4 text-[#0F766E]" />
              <span className="hidden sm:inline">সংকলন ঝুড়ি</span>
              <span className="px-1.5 py-0.5 rounded bg-[#0F766E] text-[#FFFFFF] text-[11px] font-bold">
                {toBengaliDigits(cartSummary.itemCount)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubmissionMode('question');
                setSubmissionSuccessMsg(null);
                setIsSubmissionModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-[#FFFFFF] text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Feather className="w-4 h-4 text-[#5EEAD4]" />
              <span>প্রশ্ন ও লেখা পাঠান</span>
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          2. OPERATIONAL UTILITY, ANIMATED HEADLINE TICKER & DEPARTMENT RIBBON
         ===================================================================== */}
      <div id="top" className="bg-[#F1F5F9] border-b border-[#E2E8F0]">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs text-[#475569]">
          {/* Animated Writing Ticker + Automatic Live Hijri/Bangla/Gregorian Date */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 min-w-0 flex-1">
            <span
              className="font-semibold text-[#0F766E] shrink-0"
              title="স্বয়ংক্রিয় প্রতিদিনের তারিখ (প্রতিদিন রাত ১২টার পর অটোমেটিক পরিবর্তিত হয়)"
            >
              {brand.autoUpdateDate !== false
                ? `${liveDates.weekdayBn} · ${liveDates.hijriDateBn} · ${liveDates.banglaDateBn}`
                : `${brand.hijriDateBn} · ${brand.banglaDateBn}`}
            </span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>

            {/* Animated Text Ticker showing latest writings sliding in */}
            {currentTickerArticle && (
              <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                <span className="text-[11px] font-bold text-[#0284C7] shrink-0">
                  সদ্য প্রকাশিত রচনা:
                </span>
                <div className="relative h-5 overflow-hidden flex items-center min-w-[220px] sm:min-w-[380px]">
                  <button
                    key={currentTickerArticle.id}
                    type="button"
                    onClick={() => setActiveArticle(currentTickerArticle)}
                    className="itisam-ticker-item text-left font-medium text-[#0F172A] hover:text-[#0F766E] truncate cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="truncate">{currentTickerArticle.title}</span>
                    <span className="text-[#0284C7] shrink-0">
                      — {currentTickerArticle.authorName}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme Mode Switcher (অটো / দিন / রাত) + Live Search Input */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            <div
              role="group"
              aria-label="থিম মোড নির্বাচন (অটো, দিন, রাত)"
              title={getThemeModeBadgeLabelBn(themePreference, resolvedTheme)}
              className="inline-flex items-center rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] p-0.5 text-[11px] font-semibold shrink-0 shadow-2xs"
            >
              <button
                type="button"
                onClick={() => setThemePreference('auto')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  themePreference === 'auto'
                    ? 'bg-[#0F766E] text-white'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
                title="অটো মোড: সময় (সন্ধ্যা ৬টা–ভোর ৬টা) ও ডিভাইস সেটিং অনুযায়ী স্বয়ংক্রিয় দিন বা রাত মোড"
              >
                <Sparkles className="w-3 h-3" />
                <span>অটো</span>
              </button>
              <button
                type="button"
                onClick={() => setThemePreference('day')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  themePreference === 'day'
                    ? 'bg-[#0F766E] text-white'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
                title="দিন মোড (Day Mode)"
              >
                <Sun className="w-3 h-3" />
                <span>দিন</span>
              </button>
              <button
                type="button"
                onClick={() => setThemePreference('night')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  themePreference === 'night'
                    ? 'bg-[#0F766E] text-white'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
                title="রাত মোড (Night Mode)"
              >
                <Moon className="w-3 h-3" />
                <span>রাত</span>
              </button>
            </div>

            <div className="relative flex-1 sm:w-72">
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="প্রবন্ধ, কবিতা, লেখক বা বিষয় খুঁজুন..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:border-[#0F766E]"
              />
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 py-2.5 border-t border-[#E2E8F0]/70 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`relative px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#0F766E] text-[#FFFFFF]'
                    : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#E2E8F0]/50'
                }`}
              >
                {cat.labelBn}
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          3. ABOVE-THE-FOLD EDITORIAL SHOWCASE (al-itisam.com WOW slideInLeft & slideInRight)
         ===================================================================== */}
      <main className="flex-1 overflow-hidden">
        <section className="max-w-[1380px] mx-auto px-4 sm:px-8 py-8 sm:py-12 border-b border-[#E2E8F0]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT / CENTER (7 Cols): Lead Editorial Essay Card — al-itisam.com `wow slideInLeft` */}
            {leadArticle && (
              <WowBlock
                as="article"
                variant="slideInLeft"
                className="lg:col-span-7 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl overflow-hidden shadow-[0_6px_24px_-6px_rgba(28,25,23,0.06)] flex flex-col group"
              >
                <div
                  onClick={() => setActiveArticle(leadArticle)}
                  className="cursor-pointer overflow-hidden"
                >
                  <ArticleCoverArt
                    motif={leadArticle.coverMotif}
                    customCoverUrl={leadArticle.customCoverUrl}
                    categoryBn={leadArticle.categoryBn}
                    volumeTitle={leadArticle.volumeTitle}
                    className="h-64 sm:h-80"
                  />
                </div>

                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    {/* Staggered Text Reveal inside Lead Editorial */}
                    <WowBlock
                      as="p"
                      variant="textReveal"
                      delayMs={100}
                      className="text-xs font-semibold text-[#0F766E] tracking-wide"
                    >
                      প্রধান সম্পাদকীয় রচনা · {leadArticle.categoryBn} · {leadArticle.readTimeBn} · {leadArticle.publishedAtBn}
                    </WowBlock>

                    <WowBlock
                      as="h1"
                      variant="textReveal"
                      delayMs={180}
                      onClick={() => setActiveArticle(leadArticle)}
                      className="font-editorial text-2xl sm:text-4xl font-bold text-[#0F172A] leading-[1.24] hover:text-[#0F766E] transition-colors cursor-pointer"
                    >
                      {leadArticle.title}
                    </WowBlock>

                    <WowBlock
                      as="p"
                      variant="textReveal"
                      delayMs={260}
                      className="text-sm sm:text-base font-medium text-[#0284C7]"
                    >
                      {leadArticle.subtitle}
                    </WowBlock>

                    <WowBlock
                      as="p"
                      variant="textReveal"
                      delayMs={340}
                      className="text-sm sm:text-[15px] text-[#475569] leading-[1.85] text-justify"
                    >
                      {leadArticle.excerpt}
                    </WowBlock>
                  </div>

                  {/* Animated Editorial Pull Quote */}
                  <WowBlock
                    as="blockquote"
                    variant="textReveal"
                    delayMs={420}
                    className="p-4 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] font-editorial italic text-sm text-[#0F172A] leading-relaxed"
                  >
                    “{leadArticle.pullQuote}”
                  </WowBlock>

                  {/* Author & Action Footer */}
                  <WowBlock
                    variant="textReveal"
                    delayMs={480}
                    className="pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#0F172A]">
                        {leadArticle.authorName}
                      </p>
                      <p className="text-xs text-[#475569]">
                        {leadArticle.authorRole} · {leadArticle.volumeTitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleDownloadArticleManuscript(leadArticle)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F1F5F9]/60 hover:bg-[#F1F5F9] text-xs font-semibold text-[#0F172A] transition-colors cursor-pointer"
                        title="পাণ্ডুলিপি ডাউনলোড করুন"
                      >
                        <Download className="w-3.5 h-3.5 text-[#0F766E]" />
                        <span>অফলাইন কপি</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveArticle(leadArticle)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-[#FFFFFF] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>সম্পূর্ণ প্রবন্ধটি পড়ুন</span>
                      </button>
                    </div>
                  </WowBlock>
                </div>
              </WowBlock>
            )}

            {/* RIGHT (5 Cols): Featured Original Writings + Literary Mission Desk — al-itisam.com `wow slideInRight` */}
            <WowBlock
              variant="slideInRight"
              delayMs={120}
              className="lg:col-span-5 space-y-6"
            >
              {/* Literary Identity Box */}
              <div className="p-6 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] space-y-3">
                <p className="text-xs font-semibold tracking-wider uppercase text-[#0F766E]">
                  আমাদের সাহিত্যিক স্বাতন্ত্র্য ও অঙ্গীকার
                </p>
                <h2 className="font-editorial text-xl font-bold text-[#0F172A]">
                  মাসিক সাময়িকীর পরিবর্তে কালজয়ী মৌলিক রচনা ও বিষয়ভিত্তিক সংকলন
                </h2>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed text-justify">
                  <strong>একটুখানি সাহিত্যের পরশ</strong>-এ আমরা কোনো বাঁধাধরা মাসিক ম্যাগাজিনের গণ্ডিতে সীমাবদ্ধ নই। বিশুদ্ধ আকীদা ও দালিলিক প্রজ্ঞার সাথে আমরা রচনা করি নিজস্ব মৌলিক গদ্য, প্রবন্ধ, কাব্য, আত্মশুদ্ধিমূলক রচনা এবং সাহিত্য ও জীবনঘনিষ্ঠ প্রশ্নের প্রামাণ্য জবাব।
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  <a
                    href="#anthology-volumes"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0F766E] text-[#FFFFFF] text-xs font-semibold hover:bg-[#115E59] transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> মৌলিক সংকলনসমূহ দেখুন
                  </a>
                  <a
                    href="#sawal-jawab"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] text-xs font-semibold hover:bg-white transition-colors"
                  >
                    <MessageSquareQuote className="w-3.5 h-3.5 text-[#0284C7]" /> সাহিত্য ও জীবন জিজ্ঞাসা
                  </a>
                </div>
              </div>

              {/* Secondary Featured Writings Stack with Staggered Entrance */}
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl divide-y divide-[#E2E8F0]">
                <div className="px-5 py-3.5 bg-[#F1F5F9]/50 flex items-center justify-between">
                  <h3 className="font-editorial text-base font-bold text-[#0F172A]">
                    নির্বাচিত মৌলিক রচনাসমূহ
                  </h3>
                  <span className="text-xs text-[#475569]">
                    মোট {toBengaliDigits(articles.length)}টি রচনা
                  </span>
                </div>

                {secondaryFeaturedArticles.map((art, idx) => (
                  <WowBlock
                    key={art.id}
                    variant="textReveal"
                    delayMs={(idx + 1) * 140}
                    onClick={() => setActiveArticle(art)}
                    className="p-5 hover:bg-[#F1F5F9]/40 transition-colors cursor-pointer group space-y-2"
                  >
                    <p className="text-[11px] font-medium text-[#0284C7]">
                      {art.categoryBn} · {art.readTimeBn} · {art.publishedAtBn}
                    </p>
                    <h4 className="font-editorial text-lg font-bold text-[#0F172A] group-hover:text-[#0F766E] transition-colors leading-snug">
                      {art.title}
                    </h4>
                    <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed text-justify">
                      {art.excerpt}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-[#0F172A]">{art.authorName}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-[#0F766E] group-hover:translate-x-1 transition-transform">
                        পাঠ করুন <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </WowBlock>
                ))}
              </div>
            </WowBlock>
          </div>
        </section>

        {/* =====================================================================
            4. ORIGINAL WRITINGS ARCHIVE (মৌলিক রচনা ও প্রবন্ধ ভান্ডার)
               Uses al-itisam.com `wow bounceInDown` Section Header + `wow slideInLeft` Cards
           ===================================================================== */}
        <section
          id="original-writings"
          className="max-w-[1380px] mx-auto px-4 sm:px-8 py-12 sm:py-16 border-b border-[#E2E8F0]"
        >
          {/* al-itisam.com Signature Section Title with `wow bounceInDown` and Horizontal Line */}
          <WowBlock variant="bounceInDown" className="mb-8 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0F766E]">
              আমাদের নিজস্ব কলমে রচিত সাহিত্য ভান্ডার
            </p>
            <div className="itisam-section-header">
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0F172A]">
                মৌলিক প্রবন্ধ, কাব্য ও কথা-সাহিত্য আর্কাইভ
              </h2>
              <span className="itisam-section-line hidden md:block" />
              <span className="text-xs font-bold text-[#0284C7] whitespace-nowrap">
                প্রদর্শিত রচনা: {toBengaliDigits(filteredArticles.length)}টি
              </span>
            </div>

            {/* Author & Volume Filters */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
              <select
                aria-label="লেখক অনুযায়ী ফিল্টার"
                value={selectedAuthorId}
                onChange={(e) => setSelectedAuthorId(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-medium text-[#0F172A]"
              >
                <option value="all">সকল লেখক ({toBengaliDigits(authors.length)})</option>
                {authors.map((au) => (
                  <option key={au.id} value={au.id}>
                    {au.nameBn}
                  </option>
                ))}
              </select>

              <select
                aria-label="সংকলন অনুযায়ী ফিল্টার"
                value={selectedVolumeId}
                onChange={(e) => setSelectedVolumeId(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-medium text-[#0F172A]"
              >
                <option value="all">সকল সংকলন ({toBengaliDigits(volumes.length)})</option>
                {volumes.map((vol) => (
                  <option key={vol.id} value={vol.id}>
                    {vol.volumeNumberBn}: {vol.titleBn}
                  </option>
                ))}
              </select>

              {(selectedCategory !== 'all' ||
                selectedAuthorId !== 'all' ||
                selectedVolumeId !== 'all' ||
                searchQuery.trim() !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedAuthorId('all');
                    setSelectedVolumeId('all');
                    setSearchQuery('');
                  }}
                  className="px-3 py-2 rounded-lg bg-[#991B1B]/10 text-[#991B1B] text-xs font-semibold hover:bg-[#991B1B]/20 cursor-pointer"
                >
                  ফিল্টার মুছুন
                </button>
              )}
            </div>
          </WowBlock>

          {filteredArticles.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] space-y-3">
              <p className="font-editorial text-lg font-bold text-[#0F172A]">
                আপনার অনুসন্ধান অনুযায়ী কোনো রচনা পাওয়া যায়নি।
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedAuthorId('all');
                  setSelectedVolumeId('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-lg bg-[#0F766E] text-[#FFFFFF] text-xs font-semibold"
              >
                সব রচনা দেখুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((art, index) => (
                <WowBlock
                  key={`${art.id}-${selectedCategory}-${selectedAuthorId}-${selectedVolumeId}`}
                  as="article"
                  variant="slideInLeft"
                  delayMs={(index % 3) * 110}
                  className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl overflow-hidden flex flex-col justify-between hover:border-[#0F766E]/45 transition-all group shadow-[0_2px_10px_-4px_rgba(28,25,23,0.05)]"
                >
                  <div>
                    <div
                      onClick={() => setActiveArticle(art)}
                      className="cursor-pointer overflow-hidden"
                    >
                      <ArticleCoverArt
                        motif={art.coverMotif}
                        customCoverUrl={art.customCoverUrl}
                        categoryBn={art.categoryBn}
                        volumeTitle={art.volumeTitle}
                        className="h-48"
                      />
                    </div>

                    {/* Staggered Text Animation inside each Writing Card */}
                    <div className="p-5 space-y-2.5">
                      <p className="text-[11px] font-medium text-[#0284C7] wow-textReveal">
                        {art.categoryBn} · {art.readTimeBn} · {art.publishedAtBn}
                      </p>

                      <h3
                        onClick={() => setActiveArticle(art)}
                        className="font-editorial text-xl font-bold text-[#0F172A] group-hover:text-[#0F766E] transition-colors leading-snug cursor-pointer wow-textReveal"
                      >
                        {art.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#475569] line-clamp-3 leading-relaxed text-justify wow-textReveal">
                        {art.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* 3. Author + Action Row */}
                  <div className="px-5 py-3.5 bg-[#F1F5F9]/50 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0F172A] truncate">
                        {art.authorName}
                      </p>
                      <p className="text-[11px] text-[#475569] truncate">
                        {art.authorRole}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleBookmark(art.id)}
                        className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                          bookmarkedIds.includes(art.id)
                            ? 'bg-[#0F766E]/10 border-[#0F766E]/30 text-[#0F766E]'
                            : 'border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
                        }`}
                        title="পাঠতালিকায় সংরক্ষণ করুন"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveArticle(art)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-[#FFFFFF] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <span>পাঠ করুন</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </WowBlock>
              ))}
            </div>
          )}
        </section>

        {/* =====================================================================
            5. ORIGINAL LITERARY ANTHOLOGIES & VOLUMES (মৌলিক গ্রন্থ ও সংকলন)
               al-itisam.com `wow bounceInDown` Header + `wow slideInUp` Volume Cards
           ===================================================================== */}
        <section
          id="anthology-volumes"
          className="bg-[#F1F5F9] border-b border-[#E2E8F0] py-12 sm:py-16"
        >
          <div className="max-w-[1380px] mx-auto px-4 sm:px-8 space-y-8">
            <WowBlock variant="bounceInDown" className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#0F766E]">
                মাসিক ম্যাগাজিনের পরিবর্তে আমাদের বিশেষ গ্রন্থ-উদ্যোগ
              </p>
              <div className="itisam-section-header">
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0F172A]">
                  মৌলিক সাহিত্য সংকলন ও গ্রন্থশালা
                </h2>
                <span className="itisam-section-line hidden md:block" />
                <span className="text-xs font-semibold text-[#475569]">
                  অনলাইন পাঠ · ডাউনলোড · হার্ডকভার অর্ডার
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#475569] max-w-2xl pt-1">
                প্রতিটি সংকলন আমাদের লেখকদের মৌলিক প্রবন্ধ, কবিতা ও জীবনবোধের বাছাইকৃত রচনা দিয়ে সাজানো। অনলাইনে বিনামূল্যে পড়ার পাশাপাশি মুদ্রিত হার্ডকভার কপিও সংগ্রহ করতে পারবেন।
              </p>
            </WowBlock>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {volumes.map((vol, idx) => (
                <WowBlock
                  key={vol.id}
                  variant="slideInUp"
                  delayMs={idx * 110}
                  className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-5 flex flex-col justify-between group hover:border-[#0F766E]/45 transition-all"
                >
                  <div className="space-y-4">
                    <VolumeCoverVisual volume={vol} />

                    <div className="space-y-1.5 pt-2">
                      <p className="text-[11px] font-semibold text-[#0284C7]">
                        {vol.volumeNumberBn} · {vol.publishedSeasonBn} · {toBengaliDigits(vol.pageCount)} পৃষ্ঠা
                      </p>
                      <h3 className="font-editorial text-lg font-bold text-[#0F172A]">
                        {vol.titleBn}
                      </h3>
                      <p className="text-xs text-[#475569] leading-relaxed text-justify">
                        {vol.editorialNoteBn}
                      </p>
                    </div>

                    {/* Volume Highlights */}
                    <div className="pt-2 border-t border-[#E2E8F0] space-y-1">
                      <p className="text-[11px] font-semibold text-[#0F172A]">
                        অন্তর্ভুক্ত প্রধান রচনাসমূহ:
                      </p>
                      <ul className="space-y-1 text-xs text-[#475569]">
                        {vol.highlightsBn.map((h, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-[#0F766E] font-bold">·</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Volume Actions */}
                  <div className="pt-4 mt-4 border-t border-[#E2E8F0] space-y-2">
                    <div className="flex items-center justify-between text-xs pb-1">
                      <span className="text-[#475569]">মুদ্রিত হার্ডকভার হাদিয়া:</span>
                      <span className="font-bold text-[#0F766E] text-sm">
                        {formatBdt(vol.hardcoverPriceBdt)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVolumeId(vol.id);
                          const el = document.getElementById('original-writings');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-3 py-2 rounded-lg border border-[#E2E8F0] bg-[#F1F5F9]/70 hover:bg-[#F1F5F9] text-xs font-semibold text-[#0F172A] transition-colors cursor-pointer"
                      >
                        অনলাইনে পড়ুন
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadVolumeDigest(vol)}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-xs font-semibold text-[#0F766E] transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> ডাউনলোড
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddVolumeToCart(vol.id, 'hardcover')}
                      className="w-full py-2.5 px-3 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-[#FFFFFF] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#5EEAD4]" />
                      <span>হার্ডকভার কপি অর্ডার করুন</span>
                    </button>
                  </div>
                </WowBlock>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
            6. LITERARY & LIFE Q&A DESK (সাহিত্য ও জীবন জিজ্ঞাসা — সাওয়াল-জওয়াব)
               al-itisam.com Split Layout: Left `wow slideInLeft` + Right `wow slideInRight`
           ===================================================================== */}
        <section
          id="sawal-jawab"
          className="max-w-[1380px] mx-auto px-4 sm:px-8 py-12 sm:py-16 border-b border-[#E2E8F0]"
        >
          <WowBlock variant="bounceInDown" className="mb-8 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0284C7]">
              সাওয়াল-জওয়াব · পাঠকের জিজ্ঞাসা ও প্রামাণ্য সমাধান
            </p>
            <div className="itisam-section-header">
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0F172A]">
                সাহিত্য, সংস্কৃতি ও জীবনবোধ বিষয়ক জিজ্ঞাসা ও উত্তর
              </h2>
              <span className="itisam-section-line hidden md:block" />
              <button
                type="button"
                onClick={() => {
                  setSubmissionMode('question');
                  setSubmissionSuccessMsg(null);
                  setIsSubmissionModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-[#FFFFFF] text-xs font-semibold transition-colors cursor-pointer"
              >
                <MessageSquareQuote className="w-3.5 h-3.5 text-[#5EEAD4]" />
                <span>নতুন প্রশ্ন পাঠান</span>
              </button>
            </div>
          </WowBlock>

          {/* al-itisam.com 2-Column QA Layout: Left 4 Cols (`slideInLeft`) + Right 8 Cols (`slideInRight`) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Topic Selector & Search (`wow slideInLeft`) */}
            <WowBlock
              variant="slideInLeft"
              className="lg:col-span-4 space-y-4"
            >
              <div className="p-6 rounded-xl bg-[#0F766E] text-[#FFFFFF] space-y-3 border border-[#2DD4BF]/30">
                <p className="text-xs font-semibold text-[#5EEAD4]">
                  সাহিত্য ও জীবন জিজ্ঞাসা দপ্তর
                </p>
                <h3 className="font-editorial text-2xl font-bold leading-snug">
                  আপনার যেকোনো সাহিত্যিক বা জীবনঘনিষ্ঠ প্রশ্নের দালিলিক উত্তর জানুন
                </h3>
                <p className="text-xs text-[#FFFFFF]/85 leading-relaxed">
                  কুরআন ও সহীহ সুন্নাহর আলোকে মৌলিক সাহিত্যচর্চা, ভাষা, সংস্কৃতি ও পারিবারিক পাঠাভ্যাস বিষয়ে আমাদের গবেষণা পর্ষদের প্রামাণ্য উত্তরসমূহ।
                </p>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={qaSearchQuery}
                  onChange={(e) => setQaSearchQuery(e.target.value)}
                  placeholder="প্রশ্ন বা বিষয় খুঁজুন..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] text-xs text-[#0F172A]"
                />
              </div>

              {/* al-itisam.com Style Topic Category List */}
              <div className="rounded-xl border border-[#0284C7]/35 overflow-hidden bg-[#FFFFFF] divide-y divide-[#0284C7]/20">
                {[
                  'সব জিজ্ঞাসা',
                  'সাহিত্য ও শরিয়াহ',
                  'ভাষা ও সংস্কৃতি',
                  'পাঠাভ্যাস ও পরিবার',
                  'গল্প ও উপন্যাস',
                ].map((topic) => {
                  const active = qaTopicFilter === topic;
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setQaTopicFilter(topic)}
                      className={`w-full px-4 py-3 text-left text-sm font-bold flex items-center justify-between transition-all duration-300 cursor-pointer ${
                        active
                          ? 'bg-[#0284C7] text-[#FFFFFF]'
                          : 'text-[#0F172A] hover:bg-[#0284C7] hover:text-[#FFFFFF]'
                      }`}
                    >
                      <span>{topic}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </WowBlock>

            {/* Right Column: Interactive Q&A Accordion (`wow slideInRight`) */}
            <WowBlock
              variant="slideInRight"
              delayMs={120}
              className="lg:col-span-8 space-y-4"
            >
              {filteredQuestions.map((q) => {
                const isExpanded = expandedQuestionId === q.id;
                return (
                  <div
                    key={q.id}
                    className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] overflow-hidden transition-all shadow-[0_2px_8px_rgba(28,25,23,0.04)]"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedQuestionId(isExpanded ? '' : q.id)}
                      className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 hover:bg-[#F1F5F9]/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-1 w-6 h-6 rounded-md bg-[#0284C7]/15 text-[#0284C7] flex items-center justify-center shrink-0">
                          {isExpanded ? (
                            <Minus className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </span>
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-[#0284C7]">
                            {q.questionNoBn} · {q.topicBn} · প্রশ্নকারী: {q.askedBy} ({q.askedFrom}) · {q.publishedAtBn}
                          </p>
                          <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#0F172A]">
                            প্রশ্ন: {q.questionTitle}
                          </h3>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#0F766E] shrink-0 hidden sm:inline">
                        {isExpanded ? 'সংক্ষেপ করুন' : 'উত্তর পড়ুন'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-[#E2E8F0] bg-[#F1F5F9]/30 space-y-4 wow-textReveal">
                        <div className="p-4 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] text-xs sm:text-sm text-[#475569] leading-relaxed text-justify">
                          <strong className="text-[#0F172A] block mb-1">বিস্তারিত প্রশ্ন:</strong>
                          {q.questionDetail}
                        </div>

                        <div className="space-y-3 text-sm sm:text-[15px] text-[#0F172A] leading-[1.9] text-justify">
                          <p className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
                            প্রামাণ্য উত্তর — {q.answeredBy} ({q.answeredByRole}):
                          </p>
                          {q.answerParagraphs.map((para, i) => (
                            <p
                              key={i}
                              style={{ animationDelay: `${(i + 1) * 90}ms` }}
                              className="wow-textReveal"
                            >
                              {para}
                            </p>
                          ))}
                        </div>

                        {q.references.length > 0 && (
                          <div className="pt-3 border-t border-[#E2E8F0] text-xs text-[#475569]">
                            <strong className="text-[#0F172A]">দলিল ও তথ্যসূত্র: </strong>
                            {q.references.join(' · ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </WowBlock>
          </div>
        </section>

        {/* =====================================================================
            7. AUTHORS DIRECTORY (বিজ্ঞ লেখক ও কলমসৈনিক বৃন্দ)
               al-itisam.com `wow bounceInDown` Header + `wow slideInLeft` Profiles
           ===================================================================== */}
        <section
          id="authors-directory"
          className="max-w-[1380px] mx-auto px-4 sm:px-8 py-12 sm:py-16"
        >
          <WowBlock variant="bounceInDown" className="mb-8 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0F766E]">
              যাঁদের মৌলিক কলমে সমৃদ্ধ এই প্রাঙ্গণ
            </p>
            <div className="itisam-section-header">
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0F172A]">
                বিজ্ঞ লেখক, গবেষক ও সাহিত্যিক বৃন্দ
              </h2>
              <span className="itisam-section-line hidden md:block" />
              <span className="text-xs font-semibold text-[#475569]">
                মোট লেখক: {toBengaliDigits(authors.length)} জন
              </span>
            </div>
          </WowBlock>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {authors.map((author, idx) => (
              <WowBlock
                key={author.id}
                variant="slideInLeft"
                delayMs={idx * 100}
                className="p-5 rounded-xl bg-[#F1F5F9]/70 border border-[#E2E8F0] flex flex-col justify-between space-y-4 hover:border-[#0F766E]/40 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {author.avatarUrl ? (
                      <img
                        src={author.avatarUrl}
                        alt={author.nameBn}
                        className="w-11 h-11 rounded-full object-cover shrink-0 border-2 border-[#0F766E]"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-[#0F766E] text-[#FFFFFF] font-editorial font-bold text-base flex items-center justify-center shrink-0 border border-[#2DD4BF]/40">
                        {author.monogramBn}
                      </div>
                    )}
                    <div>
                      <h3 className="font-editorial text-base font-bold text-[#0F172A] leading-snug">
                        {author.nameBn}
                      </h3>
                      <p className="text-[11px] text-[#0284C7] font-medium">
                        {author.designationBn}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-[#475569] leading-relaxed">
                    {author.bioBn}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
                  <p className="text-[11px] text-[#475569]">
                    বিশেষজ্ঞতা: <strong className="text-[#0F172A]">{author.specializationBn}</strong> · মোট রচনা: {toBengaliDigits(author.publishedWritingsCount)}টি
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAuthorId(author.id);
                      const el = document.getElementById('original-writings');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-[#FFFFFF] hover:bg-[#0F766E] hover:text-[#FFFFFF] border border-[#E2E8F0] text-xs font-semibold text-[#0F766E] transition-colors cursor-pointer"
                  >
                    লেখকের রচনাসমূহ দেখুন
                  </button>
                </div>
              </WowBlock>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Back-to-Top Button (Matches al-itisam.com `.back_to_top`) */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed right-5 bottom-16 z-40 w-11 h-11 rounded-full bg-[#0F766E] hover:bg-[#0284C7] text-[#FFFFFF] shadow-lg flex items-center justify-center transition-colors cursor-pointer wow-slideInUp"
          aria-label="উপরে ফিরে যান"
          title="উপরে ফিরে যান"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* =====================================================================
          8. ARCHIVAL EDITORIAL FOOTER (With Discreet Owner Admin Lock)
         ===================================================================== */}
      <footer className="bg-[#0F172A] text-[#FFFFFF] border-t border-[#E2E8F0]/20 mt-auto">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              {brand.logoImageUrl && brand.logoImageUrl.trim().length > 5 ? (
                <img
                  src={brand.logoImageUrl}
                  alt={brand.siteNameBn}
                  className="w-9 h-9 rounded-lg object-cover border border-white/25 bg-white"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-[#0F766E] text-white flex items-center justify-center font-editorial font-bold text-sm border border-[#5EEAD4]/40">
                  {brand.logoMonogramBn}
                </div>
              )}
              <span className="font-editorial text-xl font-bold text-white">
                {brand.siteNameBn}
              </span>
            </div>
            <p className="text-xs text-[#E2E8F0]/80 leading-relaxed max-w-md">
              {brand.editorialManifestoBn}
            </p>
            <p className="text-xs text-[#5EEAD4]">
              প্রধান সম্পাদক: {brand.chiefEditorBn} · {brand.publisherNoteBn}
            </p>
          </div>

          <div className="md:col-span-3 space-y-2.5 text-xs">
            <h4 className="font-editorial text-sm font-bold text-white">
              মৌলিক সাহিত্য বিভাগসমূহ
            </h4>
            <ul className="space-y-1.5 text-[#E2E8F0]/75">
              {categories.filter((c) => c.id !== 'all').map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(c.id);
                      document.getElementById('original-writings')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    {c.labelBn}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4 space-y-2.5 text-xs">
            <h4 className="font-editorial text-sm font-bold text-white">
              প্রকাশনা দপ্তর ও যোগাযোগ
            </h4>
            <p className="flex items-center gap-2 text-[#E2E8F0]/80">
              <MapPin className="w-3.5 h-3.5 text-[#5EEAD4] shrink-0" />
              <span>{brand.addressBn}</span>
            </p>
            <p className="flex items-center gap-2 text-[#E2E8F0]/80">
              <Phone className="w-3.5 h-3.5 text-[#5EEAD4] shrink-0" />
              <span>{brand.phoneBn}</span>
            </p>
            <p className="flex items-center gap-2 text-[#E2E8F0]/80">
              <Mail className="w-3.5 h-3.5 text-[#5EEAD4] shrink-0" />
              <span>{brand.email}</span>
            </p>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#E2E8F0]/60">
            <p>
              © {toBengaliDigits(new Date().getFullYear())} {brand.siteNameBn} — সর্বস্বত্ব সংরক্ষিত। আল-ইতিছাম-এর আদর্শিক অনুপ্রেরণায় আমাদের নিজস্ব মৌলিক সাহিত্য উদ্যোগ।
            </p>

            {/* Discreet Owner-Protected Admin Trigger + Instant Lock Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditorOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-[#E2E8F0]/75 hover:text-white transition-colors cursor-pointer"
              >
                {isAdminUnlocked ? (
                  <>
                    <Settings className="w-3.5 h-3.5 text-[#5EEAD4]" />
                    <span>সম্পাদকীয় প্যানেল (আনলকড)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-[#5EEAD4]" />
                    <span>অ্যাডমিন প্যানেল (লকড)</span>
                  </>
                )}
                {questions.filter((q) => q.status === 'pending').length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#991B1B] text-white text-[10px] font-bold">
                    {toBengaliDigits(questions.filter((q) => q.status === 'pending').length)}টি নতুন প্রশ্ন
                  </span>
                )}
                {orders.filter((o) => o.status === 'placed').length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#0F766E] border border-[#5EEAD4]/50 text-[#5EEAD4] text-[10px] font-bold">
                    {toBengaliDigits(orders.filter((o) => o.status === 'placed').length)}টি নতুন অর্ডার
                  </span>
                )}
              </button>
              {isAdminUnlocked && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminUnlocked(false);
                    triggerToast('অ্যাডমিন প্যানেল সফলভাবে লক করা হয়েছে।');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <Lock className="w-3 h-3" /> লক করুন
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          MODAL 1: ASYMMETRIC LONG-FORM ARTICLE READER MODAL (With Staggered Paragraph Reveal)
         ===================================================================== */}
      {activeArticle && activeShareLinks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-[#0F172A]/75 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-2xl overflow-hidden flex flex-col wow-slideInUp">
            {/* Reader Top Bar */}
            <div className="px-5 py-3.5 bg-[#F1F5F9] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#475569]">
                <span className="font-bold text-[#0F766E]">{brand.siteNameBn}</span>
                <span>·</span>
                <span>{activeArticle.categoryBn}</span>
                <span>·</span>
                <span>{activeArticle.readTimeBn}</span>
              </div>

              {/* Font Scale, Quick Social Share & Reader Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Quick Top-Bar Social Share Buttons (Facebook, WhatsApp, Twitter) */}
                <div
                  className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-2 py-1 text-xs"
                  aria-label="দ্রুত সোশ্যাল মিডিয়া শেয়ার"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#0F766E] mr-0.5 hidden sm:inline" />
                  <a
                    href={activeShareLinks.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => triggerToast('ফেসবুকে শেয়ার করার জন্য উইন্ডো প্রস্তুত হচ্ছে...')}
                    className="px-2 py-0.5 rounded font-semibold text-[#1877F2] hover:bg-[#1877F2]/10 transition-colors"
                    aria-label="Facebook-এ শেয়ার করুন"
                    title="Facebook-এ শেয়ার করুন"
                  >
                    Facebook
                  </a>
                  <span className="text-[#CBD5E1]">|</span>
                  <a
                    href={activeShareLinks.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => triggerToast('হোয়াটসঅ্যাপে শেয়ার করার জন্য প্রস্তুত হচ্ছে...')}
                    className="px-2 py-0.5 rounded font-semibold text-[#128C7E] hover:bg-[#25D366]/15 transition-colors"
                    aria-label="WhatsApp-এ শেয়ার করুন"
                    title="WhatsApp-এ শেয়ার করুন"
                  >
                    WhatsApp
                  </a>
                  <span className="text-[#CBD5E1]">|</span>
                  <a
                    href={activeShareLinks.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => triggerToast('টুইটারে (X) শেয়ার করার জন্য প্রস্তুত হচ্ছে...')}
                    className="px-2 py-0.5 rounded font-semibold text-[#0F172A] hover:bg-[#0F172A]/10 transition-colors"
                    aria-label="Twitter-এ শেয়ার করুন"
                    title="Twitter (X)-এ শেয়ার করুন"
                  >
                    Twitter
                  </a>
                </div>

                <div className="inline-flex items-center rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setReaderFontScale('normal')}
                    className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                      readerFontScale === 'normal' ? 'bg-[#0F766E] text-white' : 'text-[#475569]'
                    }`}
                  >
                    অ
                  </button>
                  <button
                    type="button"
                    onClick={() => setReaderFontScale('large')}
                    className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                      readerFontScale === 'large' ? 'bg-[#0F766E] text-white' : 'text-[#475569]'
                    }`}
                  >
                    অ+
                  </button>
                  <button
                    type="button"
                    onClick={() => setReaderFontScale('xlarge')}
                    className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                      readerFontScale === 'xlarge' ? 'bg-[#0F766E] text-white' : 'text-[#475569]'
                    }`}
                  >
                    অ++
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setThemePreference((prev) =>
                      prev === 'day' ? 'night' : prev === 'night' ? 'auto' : 'day'
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-xs font-semibold text-[#0F172A] cursor-pointer"
                  title="পড়ার সময় দিন / রাত / অটো মোড পরিবর্তন করুন"
                >
                  {resolvedTheme === 'night' ? (
                    <Moon className="w-3.5 h-3.5 text-[#2DD4BF]" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-[#0F766E]" />
                  )}
                  <span className="hidden sm:inline">
                    {themePreference === 'auto'
                      ? 'অটো'
                      : resolvedTheme === 'night'
                      ? 'রাত'
                      : 'দিন'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadArticleManuscript(activeArticle)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-xs font-semibold text-[#0F172A] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span className="hidden sm:inline">ডাউনলোড</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveArticle(null)}
                  className="p-1.5 rounded-lg text-[#475569] hover:text-[#0F172A] hover:bg-[#E2E8F0]/50 cursor-pointer"
                  aria-label="পাঠক প্যানেল বন্ধ করুন"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Asymmetric Two-Column Reading Canvas */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Metadata & Marginalia Rail (4 Cols) — `slideInLeft` */}
                <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-2 wow-slideInLeft">
                  <ArticleCoverArt
                    motif={activeArticle.coverMotif}
                    customCoverUrl={activeArticle.customCoverUrl}
                    categoryBn={activeArticle.categoryBn}
                    volumeTitle={activeArticle.volumeTitle}
                    className="h-44 rounded-lg border border-[#E2E8F0]"
                  />

                  <div className="p-4 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0284C7]">
                      লেখক পরিচিতি
                    </p>
                    <p className="font-editorial text-base font-bold text-[#0F172A]">
                      {activeArticle.authorName}
                    </p>
                    <p className="text-xs text-[#475569]">{activeArticle.authorRole}</p>
                    <p className="text-xs text-[#0F766E] pt-1 font-medium">
                      সংকলন: {activeArticle.volumeTitle}
                    </p>
                  </div>

                  {/* Marginalia / Citations */}
                  <div className="p-4 rounded-xl bg-[#F1F5F9]/60 border border-[#E2E8F0] space-y-2">
                    <p className="text-xs font-bold text-[#0F172A]">
                      টীকা ও প্রামাণ্য সূত্রসমূহ:
                    </p>
                    <ol className="list-decimal pl-4 space-y-1.5 text-xs text-[#475569]">
                      {activeArticle.citations.map((cit, idx) => (
                        <li key={idx}>{cit}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Reader Appreciation Button */}
                  <button
                    type="button"
                    onClick={() => handleAppreciateArticle(activeArticle.id)}
                    className="w-full py-2.5 px-4 rounded-xl border border-[#0F766E]/30 bg-[#0F766E]/5 hover:bg-[#0F766E] hover:text-white text-[#0F766E] text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                    <span>পাঠক অনুমোদন ও ভালোবাসা ({toBengaliDigits(activeArticle.likesCount)})</span>
                  </button>

                  {/* Social Media Sharing Card in Left Rail */}
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-[#0F766E]" />
                        <span>সোশ্যাল মিডিয়ায় শেয়ার করুন</span>
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <a
                        href={activeShareLinks.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-2.5 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-semibold text-center transition-colors"
                      >
                        Facebook
                      </a>
                      <a
                        href={activeShareLinks.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-2.5 rounded-lg bg-[#128C7E] hover:bg-[#0E7266] text-white text-xs font-semibold text-center transition-colors"
                      >
                        WhatsApp
                      </a>
                      <a
                        href={activeShareLinks.twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-2.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold text-center transition-colors"
                      >
                        Twitter
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyArticleShareLink(activeArticle)}
                      className="w-full py-2 px-3 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-xs font-semibold text-[#0F172A] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedShareArticleId === activeArticle.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#0F766E]" />
                          <span className="text-[#0F766E]">শেয়ার লিংক কপি হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#475569]" />
                          <span>রচনার লিংক কপি করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </aside>

                {/* Right Main Reading Column (8 Cols) — Staggered Paragraph-by-Paragraph Text Animation */}
                <div className="lg:col-span-8 space-y-6 max-w-[68ch]">
                  <div className="space-y-3 border-b border-[#E2E8F0] pb-6 wow-bounceInDown">
                    <p className="text-xs font-semibold text-[#0284C7]">
                      {activeArticle.categoryBn} · প্রকাশকাল: {activeArticle.publishedAtBn}
                    </p>
                    <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-[#0F172A] leading-[1.25]">
                      {activeArticle.title}
                    </h1>
                    <p className="text-base font-medium text-[#475569]">
                      {activeArticle.subtitle}
                    </p>
                  </div>

                  {/* Pull Quote */}
                  <blockquote
                    style={{ animationDelay: '110ms' }}
                    className="p-5 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-editorial italic text-base text-[#0F766E] leading-relaxed wow-slideInRight"
                  >
                    “{activeArticle.pullQuote}”
                  </blockquote>

                  {/* Body Paragraphs with Staggered Entrance */}
                  <div className={`space-y-5 text-[#0F172A] text-justify ${readerTextClass}`}>
                    {activeArticle.paragraphs.map((para, idx) => (
                      <p
                        key={idx}
                        style={{ animationDelay: `${160 + idx * 95}ms` }}
                        className="whitespace-pre-line wow-textReveal"
                      >
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* Bottom Social Media Share Bar inside Article Reader */}
                  <div className="mt-8 p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3.5">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-[#0F766E] shrink-0" />
                        <span>রচনাটি সামাজিক যোগাযোগ মাধ্যমে শেয়ার করুন</span>
                      </p>
                      <p className="text-xs text-[#475569] leading-relaxed">
                        ভালো লাগলে ফেসবুক, হোয়াটসঅ্যাপ বা টুইটারে বন্ধুদের সাথে শেয়ার করে দাওয়াতি কাজে অংশ নিন।
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <a
                        href={activeShareLinks.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        <span>Facebook-এ শেয়ার</span>
                      </a>

                      <a
                        href={activeShareLinks.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#128C7E] hover:bg-[#0E7266] text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        <span>WhatsApp-এ শেয়ার</span>
                      </a>

                      <a
                        href={activeShareLinks.twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        <span>Twitter-এ শেয়ার</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleCopyArticleShareLink(activeArticle)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-xs font-semibold text-[#0F172A] transition-colors cursor-pointer"
                      >
                        {copiedShareArticleId === activeArticle.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#0F766E]" />
                            <span className="text-[#0F766E]">কপি হয়েছে</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#475569]" />
                            <span>লিংক কপি</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: SUBMIT QUESTION OR ORIGINAL WRITING (প্রশ্ন ও লেখা পাঠান)
         ===================================================================== */}
      {isSubmissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-2xl overflow-hidden flex flex-col wow-slideInUp">
            <div className="px-6 py-4 bg-[#F1F5F9] border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0F766E]">
                  পাঠক ও লেখক সংযোগ ডেস্ক — {brand.siteNameBn}
                </span>
                <h2 className="font-editorial text-xl font-bold text-[#0F172A]">
                  নতুন প্রশ্ন জিজ্ঞাসা করুন অথবা মৌলিক লেখা পাঠান
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmissionModalOpen(false)}
                className="p-1.5 rounded-lg text-[#475569] hover:text-[#0F172A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="px-6 py-3 bg-[#F1F5F9]/60 border-b border-[#E2E8F0] flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSubmissionMode('question');
                  setSubmissionSuccessMsg(null);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  submissionMode === 'question'
                    ? 'bg-[#0F766E] text-white'
                    : 'text-[#475569] hover:bg-[#E2E8F0]/50'
                }`}
              >
                ১. সাহিত্য ও জীবন জিজ্ঞাসা (প্রশ্ন পাঠান)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmissionMode('writing');
                  setSubmissionSuccessMsg(null);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  submissionMode === 'writing'
                    ? 'bg-[#0F766E] text-white'
                    : 'text-[#475569] hover:bg-[#E2E8F0]/50'
                }`}
              >
                ২. নিজস্ব মৌলিক রচনা জমা দিন
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {submissionSuccessMsg && (
                <div className="p-4 rounded-lg bg-[#166534]/10 border border-[#166534]/30 text-xs font-medium text-[#166534] flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{submissionSuccessMsg}</span>
                </div>
              )}

              {submissionMode === 'question' ? (
                <form onSubmit={handleSubmitQuestionForm} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1">
                        আপনার নাম
                      </label>
                      <input
                        type="text"
                        value={qAskedBy}
                        onChange={(e) => setQAskedBy(e.target.value)}
                        placeholder="যেমন: আব্দুল্লাহ আল-মামুন"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1">
                        জেলা / ঠিকানা
                      </label>
                      <input
                        type="text"
                        value={qAskedFrom}
                        onChange={(e) => setQAskedFrom(e.target.value)}
                        placeholder="যেমন: সিলেট"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1">
                        বিষয়
                      </label>
                      <select
                        value={qTopic}
                        onChange={(e) => setQTopic(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-sm"
                      >
                        <option value="সাহিত্য ও শরিয়াহ">সাহিত্য ও শরিয়াহ</option>
                        <option value="ভাষা ও সংস্কৃতি">ভাষা ও সংস্কৃতি</option>
                        <option value="পাঠাভ্যাস ও পরিবার">পাঠাভ্যাস ও পরিবার</option>
                        <option value="গল্প ও উপন্যাস">গল্প ও উপন্যাস</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1">
                      প্রশ্নের সংক্ষিপ্ত শিরোনাম *
                    </label>
                    <input
                      type="text"
                      required
                      value={qTitle}
                      onChange={(e) => setQTitle(e.target.value)}
                      placeholder="আপনার মূল প্রশ্নটি এক বাক্যে লিখুন..."
                      className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1">
                      বিস্তারিত বিবরণ *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={qDetail}
                      onChange={(e) => setQDetail(e.target.value)}
                      placeholder="আপনার জিজ্ঞাসা বিস্তারিত লিখুন..."
                      className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-sm"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSubmissionModalOpen(false)}
                      className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#475569]"
                    >
                      বন্ধ করুন
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> প্রশ্ন জমা দিন
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmitWritingForm} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1">
                        রচনার শিরোনাম *
                      </label>
                      <input
                        type="text"
                        required
                        value={wTitle}
                        onChange={(e) => setWTitle(e.target.value)}
                        placeholder="আপনার মৌলিক প্রবন্ধ বা কবিতার নাম..."
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1">
                        লেখকের নাম *
                      </label>
                      <input
                        type="text"
                        required
                        value={wAuthorName}
                        onChange={(e) => setWAuthorName(e.target.value)}
                        placeholder="আপনার নাম লিখুন..."
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1">
                        বিভাগ নির্বাচন করুন
                      </label>
                      <select
                        value={wCategory}
                        onChange={(e) =>
                          setWCategory(e.target.value as Exclude<LiteraryCategoryId, 'all'>)
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-sm"
                      >
                        {categories.filter((c) => c.id !== 'all').map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.labelBn}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1">
                        উপ-শিরোনাম (ঐচ্ছিক)
                      </label>
                      <input
                        type="text"
                        value={wSubtitle}
                        onChange={(e) => setWSubtitle(e.target.value)}
                        placeholder="রচনার মূল ভাবসংক্ষেপ..."
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1">
                      কভার ছবি সরাসরি আপলোড করুন (ঐচ্ছিক — ফোন বা কম্পিউটার থেকে)
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold cursor-pointer transition-colors">
                        <span>ছবি নির্বাচন করুন</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === 'string') {
                                setWCustomCoverUrl(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      {wCustomCoverUrl && (
                        <div className="flex items-center gap-2">
                          <img
                            src={wCustomCoverUrl}
                            alt="প্রিভিউ"
                            className="w-12 h-9 rounded object-cover border border-[#CBD5E1]"
                          />
                          <button
                            type="button"
                            onClick={() => setWCustomCoverUrl('')}
                            className="text-xs text-[#DC2626] font-semibold cursor-pointer"
                          >
                            মুছুন
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1">
                      মূল রচনা (প্রতিটি অনুচ্ছেদ নতুন লাইনে লিখুন) *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={wContent}
                      onChange={(e) => setWContent(e.target.value)}
                      placeholder="আপনার মৌলিক লেখা এখানে লিখুন..."
                      className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-sm"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSubmissionModalOpen(false)}
                      className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#475569]"
                    >
                      বন্ধ করুন
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold cursor-pointer"
                    >
                      <Feather className="w-3.5 h-3.5" /> মৌলিক রচনা প্রকাশ করুন
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          DRAWER 3: ANTHOLOGY HARDCOVER BOOK ORDER DRAWER
         ===================================================================== */}
      {isBookCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#0F172A]/65 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FFFFFF] h-full shadow-2xl border-l border-[#E2E8F0] flex flex-col justify-between overflow-hidden wow-slideInRight">
            <div className="px-6 py-4 bg-[#F1F5F9] border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0F766E]">
                  মুদ্রিত গ্রন্থ ও সংকলন সংগ্রহ
                </span>
                <h2 className="font-editorial text-lg font-bold text-[#0F172A]">
                  হার্ডকভার সংকলন অর্ডার ঝুড়ি ({toBengaliDigits(cartSummary.itemCount)})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsBookCartOpen(false)}
                className="p-1.5 rounded-lg text-[#475569] hover:text-[#0F172A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {orderConfirmation ? (
                <div className="p-5 rounded-xl bg-[#166534]/10 border border-[#166534]/30 space-y-3 text-xs text-[#0F172A]">
                  <div className="flex items-center gap-2 text-[#166534] font-bold text-sm">
                    <Check className="w-5 h-5" />
                    <span>আলহামদুলিল্লাহ! আপনার সংকলন অর্ডার গৃহীত হয়েছে</span>
                  </div>
                  <p>
                    অর্ডার কোড: <strong className="font-mono">{orderConfirmation.orderNumber}</strong>
                  </p>
                  <p>সংকলন বিবরণ: {orderConfirmation.itemsSummary}</p>
                  <p>মোট হাদিয়া: {formatBdt(orderConfirmation.total)}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBookCartOpen(false);
                      setIsAccountModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-lg bg-[#0F766E] text-white font-semibold"
                  >
                    পাঠক ট্র্যাকিং প্যানেলে অর্ডার দেখুন
                  </button>
                </div>
              ) : bookCart.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <p className="font-editorial text-base font-bold text-[#0F172A]">
                    আপনার সংকলন ঝুড়ি বর্তমানে খালি
                  </p>
                  <button
                    type="button"
                    onClick={() => handleAddVolumeToCart('vol-1', 'hardcover')}
                    className="px-4 py-2 rounded-lg bg-[#0F766E] text-white text-xs font-semibold"
                  >
                    সংকলন ০১: শব্দের জায়নামাজ যুক্ত করুন
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {bookCart.map((item) => {
                      const vol = volumes.find((v) => v.id === item.volumeId);
                      if (!vol) return null;
                      const unitPrice = getVolumeEditionPrice(vol, item.edition);
                      return (
                        <div
                          key={`${item.volumeId}-${item.edition}`}
                          className="p-3.5 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-editorial font-bold text-sm text-[#0F172A]">
                                {vol.titleBn}
                              </p>
                              <p className="text-[11px] text-[#475569]">
                                {item.edition === 'collector-box'
                                  ? 'পাঠাগার হাদিয়া বক্স সংস্করণ'
                                  : 'মুদ্রিত হার্ডকভার সংস্করণ'}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-[#0F766E]">
                              {formatBdt(unitPrice * item.quantity)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <select
                              value={item.edition}
                              onChange={(e) => {
                                const newEd = e.target.value as BookEditionType;
                                setBookCart((prev) =>
                                  prev.map((x) =>
                                    x.volumeId === item.volumeId && x.edition === item.edition
                                      ? { ...x, edition: newEd }
                                      : x
                                  )
                                );
                              }}
                              className="text-[11px] bg-white border border-[#E2E8F0] rounded px-2 py-1"
                            >
                              <option value="hardcover">হার্ডকভার সংস্করণ</option>
                              <option value="collector-box">হাদিয়া বক্স সংস্করণ</option>
                            </select>

                            <div className="inline-flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-lg px-2 py-0.5">
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateCartQuantity(item.volumeId, item.edition, -1)
                                }
                                className="p-1 text-[#475569] hover:text-[#0F172A]"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold">
                                {toBengaliDigits(item.quantity)}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateCartQuantity(item.volumeId, item.edition, 1)
                                }
                                className="p-1 text-[#475569] hover:text-[#0F172A]"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Checkout Form */}
                  <form onSubmit={handleSubmitBookOrder} className="space-y-3 pt-3 border-t border-[#E2E8F0]">
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1">
                        পাঠকের নাম *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="আপনার পূর্ণ নাম লিখুন"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1">
                        মোবাইল নম্বর *
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-[#475569] mb-1">
                          এলাকা
                        </label>
                        <select
                          value={customerCity}
                          onChange={(e) =>
                            setCustomerCity(e.target.value as 'ঢাকা' | 'ঢাকার বাইরে')
                          }
                          className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs"
                        >
                          <option value="ঢাকা">ঢাকা সিটি (৳৬০)</option>
                          <option value="ঢাকার বাইরে">ঢাকার বাইরে (৳১১০)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#475569] mb-1">
                          হাদিয়া পরিশোধ মাধ্যম
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e) =>
                            setPaymentMethod(
                              e.target.value as 'ক্যাশ অন ডেলিভারি' | 'বিকাশ / নগদ'
                            )
                          }
                          className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs"
                        >
                          <option value="ক্যাশ অন ডেলিভারি">ক্যাশ অন ডেলিভারি</option>
                          <option value="বিকাশ / নগদ">বিকাশ / নগদ</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] mb-1">
                        বিস্তারিত ঠিকানা
                      </label>
                      <input
                        type="text"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="বাসা নং, রোড, থানা, জেলা..."
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-sm"
                      />
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>সংকলনের উপ-মোট:</span>
                        <span>{formatBdt(cartSummary.subtotalBdt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ডাক ও কুরিয়ার খরচ:</span>
                        <span>{formatBdt(cartSummary.shippingBdt)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm text-[#0F766E] pt-1 border-t border-[#E2E8F0]">
                        <span>সর্বমোট হাদিয়া:</span>
                        <span>{formatBdt(cartSummary.totalBdt)}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold cursor-pointer"
                    >
                      হার্ডকভার সংকলন অর্ডার নিশ্চিত করুন
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 4: READER ACCOUNT & ORDER TRACKING (AccountDossierModal)
         ===================================================================== */}
      <AccountDossierModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        currentUser={currentUser}
        onSignInGoogle={handleSignInGoogle}
        onSignOut={handleSignOut}
        orders={orders}
        isLoadingOrders={isLoadingOrders}
        cloudSyncStatus={cloudSyncStatus}
        cloudSyncMessage={cloudSyncMessage}
        onRefreshOrdersFromFirestore={handleRefreshOrdersFromFirestore}
        onAdvanceOrderStatus={handleAdvanceOrderStatus}
        onInspectOrderIn3D={() => setIsAccountModalOpen(false)}
        wishlist={bookmarkedIds}
        onSelectProductForStudio={(_p: Product3DItem) => setIsAccountModalOpen(false)}
        onRemoveFromWishlist={handleToggleBookmark}
        clientDisplayName={clientDisplayName}
        preferredFinish={preferredFinish}
        onSaveClientPreferences={async (name, finish) => {
          setClientDisplayName(name);
          setPreferredFinish(finish);
        }}
        onOpenBagForNewOrder={() => {
          setIsAccountModalOpen(false);
          setIsBookCartOpen(true);
        }}
      />

      {/* =====================================================================
          MODAL 5: OWNER-PROTECTED ADMIN & CMS MODAL (StoreEditorModal)
         ===================================================================== */}
      <StoreEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        brand={brand}
        onUpdateBrand={handleUpdateBrand}
        articles={articles}
        onSaveArticle={handleAdminSaveArticle}
        onDeleteArticle={handleAdminDeleteArticle}
        authors={authors}
        onUpdateAuthors={handleUpdateAuthors}
        categories={categories}
        onUpdateCategories={handleUpdateCategories}
        questions={questions}
        onAnswerQuestion={handleAdminAnswerQuestion}
        onDeleteQuestion={handleAdminDeleteQuestion}
        orders={orders}
        onUpdateOrderStatus={handleAdminUpdateOrderStatus}
        onDeleteOrder={handleAdminDeleteOrder}
        onResetAll={handleResetAll}
        isAdminUnlocked={isAdminUnlocked}
        currentUserEmail={currentUser?.email}
        storedPasscode={storedPasscode}
        onUnlockSuccess={() => {
          setIsAdminUnlocked(true);
          triggerToast('অ্যাডমিন সিকিউরিটি যাচাই সম্পন্ন — প্যানেল আনলক হয়েছে।');
        }}
        onLockAdmin={() => {
          setIsAdminUnlocked(false);
          try {
            sessionStorage.removeItem(STORAGE_KEYS.ADMIN_UNLOCKED);
          } catch {
            // ignore
          }
          triggerToast('অ্যাডমিন প্যানেল পুনরায় লক করা হয়েছে।');
        }}
        onUpdatePasscode={(nextPass) => {
          setStoredPasscode(nextPass);
          try {
            localStorage.setItem(STORAGE_KEYS.ADMIN_PASSCODE, nextPass);
          } catch {
            // ignore
          }
        }}
      />
    </div>
  );
}

export default App;
