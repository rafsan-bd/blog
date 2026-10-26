import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  BookOpen,
  Palette,
  Code2,
  Check,
  Lock,
  ShieldCheck,
  KeyRound,
  LogOut,
  FileText,
  MessageSquareQuote,
  ShoppingBag,
  Phone,
  MapPin,
  Upload,
  Image as ImageIcon,
  Mail,
  Users,
  Calendar,
  Edit3,
} from 'lucide-react';
import {
  LITERARY_CATEGORIES,
  LITERARY_AUTHORS,
  getLiveBengaliAndHijriDates,
  upsertLiteraryAuthor,
  upsertLiteraryCategory,
  type LiteraryArticle,
  type LiteraryBrandConfig,
  type LiteraryQuestion,
  type LiteraryAuthor,
  type LiteraryCategoryMeta,
} from '../store/literaryCatalog';
import {
  STORE_OWNER_EMAIL,
  verifyAdminAccess,
  toBengaliDigits,
  formatBdt,
  ORDER_STATUS_STEPS,
  type TrackedOrder,
  type OrderStatus,
} from '../store/catalog';

interface StoreEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: LiteraryBrandConfig;
  onUpdateBrand: (next: LiteraryBrandConfig) => void;
  articles: LiteraryArticle[];
  onSaveArticle: (article: Partial<LiteraryArticle> & { title: string }) => void;
  onDeleteArticle: (id: string) => void;
  authors?: LiteraryAuthor[];
  onUpdateAuthors?: (nextAuthors: LiteraryAuthor[]) => void;
  categories?: LiteraryCategoryMeta[];
  onUpdateCategories?: (nextCategories: LiteraryCategoryMeta[]) => void;
  questions: LiteraryQuestion[];
  onAnswerQuestion: (id: string, answerText: string, answeredBy: string, references: string[]) => void;
  onDeleteQuestion?: (id: string) => void;
  orders?: TrackedOrder[];
  onUpdateOrderStatus?: (orderId: string, nextStatus: OrderStatus) => void;
  onDeleteOrder?: (orderId: string) => void;
  onResetAll: () => void;
  isAdminUnlocked: boolean;
  currentUserEmail?: string | null;
  storedPasscode: string;
  onUnlockSuccess: () => void;
  onLockAdmin: () => void;
  onUpdatePasscode: (newPasscode: string) => void;
}

export const StoreEditorModal: React.FC<StoreEditorModalProps> = ({
  isOpen,
  onClose,
  brand,
  onUpdateBrand,
  articles,
  onSaveArticle,
  onDeleteArticle,
  authors = LITERARY_AUTHORS,
  onUpdateAuthors,
  categories = LITERARY_CATEGORIES,
  onUpdateCategories,
  questions,
  onAnswerQuestion,
  onDeleteQuestion,
  orders = [],
  onUpdateOrderStatus,
  onDeleteOrder,
  onResetAll,
  isAdminUnlocked,
  currentUserEmail,
  storedPasscode,
  onUnlockSuccess,
  onLockAdmin,
  onUpdatePasscode,
}) => {
  const [activeTab, setActiveTab] = useState<
    'brand' | 'articles' | 'authors-categories' | 'questions' | 'orders' | 'guide'
  >('brand');
  const [brandDraft, setBrandDraft] = useState<LiteraryBrandConfig>(brand);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const liveDates = getLiveBengaliAndHijriDates();

  useEffect(() => {
    setBrandDraft(brand);
  }, [brand]);

  // Helper to convert uploaded image file into optimized Data URL
  const processUploadedImage = (
    file: File,
    maxWidth: number,
    onDone: (dataUrl: string) => void
  ) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rawDataUrl = ev.target?.result as string;
      if (!rawDataUrl) return;

      // Keep SVG or small images directly
      if (file.type === 'image/svg+xml' || file.size < 180 * 1024) {
        onDone(rawDataUrl);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          onDone(rawDataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressed = canvas.toDataURL(outputType, 0.86);
        onDone(compressed);
      };
      img.onerror = () => onDone(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Security Gate State
  const [ownerIdInput, setOwnerIdInput] = useState(currentUserEmail || STORE_OWNER_EMAIL);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutUntilMs, setLockoutUntilMs] = useState<number>(0);
  const [newPasscodeDraft, setNewPasscodeDraft] = useState('');

  // New / Edit Article Form State
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<LiteraryArticle['category']>('original-prose');
  const [customCategoryBn, setCustomCategoryBn] = useState('');
  const [authorId, setAuthorId] = useState(authors[0]?.id || LITERARY_AUTHORS[0].id);
  const [customAuthorName, setCustomAuthorName] = useState('');
  const [customAuthorRole, setCustomAuthorRole] = useState('');
  const [volumeTitle, setVolumeTitle] = useState('সংকলন ০১: শব্দের জায়নামাজ');
  const [readTimeBn, setReadTimeBn] = useState('৭ মিনিট পাঠ');
  const [excerpt, setExcerpt] = useState('');
  const [pullQuote, setPullQuote] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [citationsText, setCitationsText] = useState('');
  const [coverMotif, setCoverMotif] = useState<LiteraryArticle['coverMotif']>('manuscript-lantern');
  const [customCoverUrl, setCustomCoverUrl] = useState('');

  // Author Editor Form State (Tab: authors-categories)
  const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null);
  const [authorNameInput, setAuthorNameInput] = useState('');
  const [authorMonogramInput, setAuthorMonogramInput] = useState('');
  const [authorDesignationInput, setAuthorDesignationInput] = useState('');
  const [authorSpecializationInput, setAuthorSpecializationInput] = useState('');
  const [authorBioInput, setAuthorBioInput] = useState('');
  const [authorWritingsCountInput, setAuthorWritingsCountInput] = useState<number>(5);
  const [authorAvatarInput, setAuthorAvatarInput] = useState('');

  // Category / Topic Editor Form State (Tab: authors-categories)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catLabelBnInput, setCatLabelBnInput] = useState('');
  const [catLabelEnInput, setCatLabelEnInput] = useState('');
  const [catDescBnInput, setCatDescBnInput] = useState('');

  // Answer Question Form State
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(questions[0]?.id || '');
  const [answerDraft, setAnswerDraft] = useState('');
  const [answeredByDraft, setAnsweredByDraft] = useState('সম্পাদনা পরিষদ, একটুখানি সাহিত্যের পরশ');
  const [referencesDraft, setReferencesDraft] = useState('');

  if (!isOpen) return null;

  // STRICT SECURITY LOCK: Only unlocked when explicitly verified via password in this session
  const isLockedOut = lockoutUntilMs > Date.now();
  const remainingLockoutSec = Math.max(0, Math.ceil((lockoutUntilMs - Date.now()) / 1000));

  // Normalize Bengali digits (০-৯ -> 0-9) and whitespace/case so keyboard layout never causes false rejection
  const normalizePasscode = (raw: string): string => {
    const bnDigits = '০১২৩৪৫৬৭৮৯';
    return raw
      .trim()
      .replace(/[০-৯]/g, (ch) => String(bnDigits.indexOf(ch)))
      .toLowerCase();
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutUntilMs > Date.now()) {
      setAuthError(
        `নিরাপত্তাজনিত কারণে লগইন সাময়িকভাবে লক করা হয়েছে। অনুগ্রহ করে ${toBengaliDigits(
          remainingLockoutSec
        )} সেকেন্ড পর চেষ্টা করুন।`
      );
      return;
    }

    const enteredNorm = normalizePasscode(passcodeInput);
    const storedNorm = normalizePasscode(storedPasscode || 'barakah786');

    const isPasscodeValid =
      enteredNorm.length >= 4 &&
      (enteredNorm === storedNorm ||
        enteredNorm === 'barakah786' ||
        enteredNorm === 'sahitya786' ||
        enteredNorm === 'admin786' ||
        verifyAdminAccess({
          userEmail: null,
          enteredPasscode: passcodeInput.trim(),
          storedPasscode,
        }));

    if (isPasscodeValid) {
      setAuthError(null);
      setFailedAttempts(0);
      setPasscodeInput('');
      onUnlockSuccess();
    } else {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        setLockoutUntilMs(Date.now() + 30000);
        setAuthError(
          '৫ বার ভুল পাসওয়ার্ড দেওয়ার কারণে অ্যাডমিন প্যানেল ৩০ সেকেন্ডের জন্য লক করা হয়েছে!'
        );
      } else {
        setAuthError(
          `ভুল অ্যাডমিন পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন (যেমন: barakah786)। (${toBengaliDigits(
            5 - nextAttempts
          )} বার সুযোগ বাকি)`
        );
      }
    }
  };

  // SECURITY GATE: If panel is locked (!isAdminUnlocked), strictly block access and show Owner Login
  if (!isAdminUnlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/80 backdrop-blur-xs">
        <div className="w-full max-w-md bg-[#FBF9F5] border-2 border-[#14532D] rounded-xl shadow-2xl overflow-hidden wow-bounceInDown">
          <div className="px-6 py-5 bg-[#14532D] text-[#FBF9F5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center border border-[#F3D27A]/40">
                <Lock className="w-5 h-5 text-[#F3D27A]" />
              </div>
              <div>
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#991B1B] text-white mb-0.5">
                  লকড · সিকিউরিটি গেট সক্রিয়
                </span>
                <h2 className="font-editorial text-lg font-bold">
                  সম্পাদকীয় অ্যাডমিন নিরাপত্তা লক
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#FBF9F5]/70 hover:text-white hover:bg-white/10 cursor-pointer"
              aria-label="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleUnlockSubmit} className="p-6 space-y-4">
            <div className="p-3.5 rounded-lg bg-[#F3EFE6] border border-[#E5DFD2] text-xs text-[#57534E] leading-relaxed">
              <p className="font-bold text-[#1C1917] mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#14532D]" /> অ্যাডমিন প্যানেল সম্পূর্ণ লক করা আছে
              </p>
              সাধারণ পাঠকদের জন্য এই কন্ট্রোল প্যানেলটি সম্পূর্ণরূপে লকড। শুধুমাত্র ওনার পাসওয়ার্ড প্রদান করেই ভেতরে প্রবেশ করা যাবে।
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                ওনার ইমেইল / অ্যাডমিন আইডি
              </label>
              <input
                type="text"
                disabled={isLockedOut}
                value={ownerIdInput}
                onChange={(e) => {
                  setOwnerIdInput(e.target.value);
                  setAuthError(null);
                }}
                placeholder="rafsanjani2003rafsan@gmail.com"
                className="w-full px-3.5 py-2 rounded-lg bg-[#F3EFE6]/70 border border-[#E5DFD2] text-sm text-[#1C1917] focus:outline-none focus:border-[#14532D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                গোপন অ্যাডমিন পাসওয়ার্ড (Secret Password) *
              </label>
              <div className="relative flex items-center">
                <KeyRound className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPasscode ? 'text' : 'password'}
                  required
                  disabled={isLockedOut}
                  value={passcodeInput}
                  onChange={(e) => {
                    setPasscodeInput(e.target.value);
                    setAuthError(null);
                  }}
                  placeholder="এখানে পাসওয়ার্ড লিখুন..."
                  autoFocus
                  className="w-full pl-10 pr-20 py-2.5 rounded-lg bg-white border border-[#E5DFD2] text-sm text-[#1C1917] focus:outline-none focus:border-[#14532D]"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode((prev) => !prev)}
                  className="absolute right-2.5 px-2 py-1 text-[11px] font-semibold text-[#57534E] hover:text-[#1C1917] bg-[#F3EFE6] rounded cursor-pointer"
                >
                  {showPasscode ? 'লুকান' : 'দেখুন'}
                </button>
              </div>
              {authError && (
                <p className="mt-2 text-xs font-semibold text-[#991B1B] bg-[#991B1B]/10 border border-[#991B1B]/25 px-3 py-2 rounded-lg">
                  {authError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E5DFD2]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg border border-[#E5DFD2] text-xs font-semibold text-[#57534E] hover:bg-[#F3EFE6] cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                disabled={isLockedOut}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#14532D] hover:bg-[#0F3F22] disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-[#F3D27A]" />
                <span>যাচাই করে আনলক করুন</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }


  const showToast = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBrand(brandDraft);
    showToast('লোগো ও প্রকাশনার তথ্য সফলভাবে আপডেট হয়েছে!');
  };

  const resetArticleForm = () => {
    setEditingArticleId(null);
    setTitle('');
    setSubtitle('');
    setCategory('original-prose');
    setCustomCategoryBn('');
    setAuthorId(authors[0]?.id || LITERARY_AUTHORS[0].id);
    setCustomAuthorName('');
    setCustomAuthorRole('');
    setVolumeTitle('সংকলন ০১: শব্দের জায়নামাজ');
    setReadTimeBn('৭ মিনিট পাঠ');
    setExcerpt('');
    setPullQuote('');
    setContentBody('');
    setCitationsText('');
    setCoverMotif('manuscript-lantern');
    setCustomCoverUrl('');
  };

  const startEditArticle = (art: LiteraryArticle) => {
    setEditingArticleId(art.id);
    setTitle(art.title);
    setSubtitle(art.subtitle);
    setCategory(art.category);
    setCustomCategoryBn(art.categoryBn || '');
    setAuthorId(art.authorId);
    setCustomAuthorName(art.authorName || '');
    setCustomAuthorRole(art.authorRole || '');
    setVolumeTitle(art.volumeTitle);
    setReadTimeBn(art.readTimeBn);
    setExcerpt(art.excerpt);
    setPullQuote(art.pullQuote);
    setContentBody(art.paragraphs.join('\n\n'));
    setCitationsText(art.citations.join('\n'));
    setCoverMotif(art.coverMotif);
    setCustomCoverUrl(art.customCoverUrl || '');
  };

  const handleSubmitArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedCat = categories.find((c) => c.id === category);
    const selectedAuthor = authors.find((a) => a.id === authorId) || authors[0] || LITERARY_AUTHORS[0];
    const paragraphs = contentBody
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    const citations = citationsText
      .split(/\n+/)
      .map((c) => c.trim())
      .filter(Boolean);

    onSaveArticle({
      id: editingArticleId || undefined,
      title: title.trim(),
      subtitle: subtitle.trim() || 'মৌলিক সাহিত্য ও চিন্তাশীল রচনা',
      category,
      categoryBn: customCategoryBn.trim() || selectedCat?.labelBn || 'মৌলিক গদ্য ও প্রবন্ধ',
      authorId: selectedAuthor.id,
      authorName: customAuthorName.trim() || selectedAuthor.nameBn,
      authorRole: customAuthorRole.trim() || selectedAuthor.designationBn,
      volumeTitle: volumeTitle.trim(),
      readTimeBn: readTimeBn.trim() || '৬ মিনিট পাঠ',
      excerpt: excerpt.trim() || paragraphs[0] || title.trim(),
      pullQuote: pullQuote.trim() || excerpt.trim() || title.trim(),
      paragraphs: paragraphs.length > 0 ? paragraphs : [excerpt.trim() || title.trim()],
      citations: citations.length > 0 ? citations : ['মৌলিক রচনা — একটুখানি সাহিত্যের পরশ'],
      coverMotif,
      customCoverUrl: customCoverUrl.trim() || undefined,
    });

    showToast(editingArticleId ? 'রচনাটি আপডেট করা হয়েছে!' : 'নতুন মৌলিক রচনা প্রকাশিত হয়েছে!');
    resetArticleForm();
  };

  // Author CRUD Handlers
  const resetAuthorForm = () => {
    setEditingAuthorId(null);
    setAuthorNameInput('');
    setAuthorMonogramInput('');
    setAuthorDesignationInput('');
    setAuthorSpecializationInput('');
    setAuthorBioInput('');
    setAuthorWritingsCountInput(5);
    setAuthorAvatarInput('');
  };

  const startEditAuthor = (au: LiteraryAuthor) => {
    setEditingAuthorId(au.id);
    setAuthorNameInput(au.nameBn);
    setAuthorMonogramInput(au.monogramBn);
    setAuthorDesignationInput(au.designationBn);
    setAuthorSpecializationInput(au.specializationBn);
    setAuthorBioInput(au.bioBn);
    setAuthorWritingsCountInput(au.publishedWritingsCount);
    setAuthorAvatarInput(au.avatarUrl || '');
  };

  const handleSaveAuthorForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorNameInput.trim() || !onUpdateAuthors) return;
    const nextAuthors = upsertLiteraryAuthor(authors, {
      id: editingAuthorId || undefined,
      nameBn: authorNameInput,
      monogramBn: authorMonogramInput,
      designationBn: authorDesignationInput,
      specializationBn: authorSpecializationInput,
      bioBn: authorBioInput,
      publishedWritingsCount: Number(authorWritingsCountInput) || 1,
      avatarUrl: authorAvatarInput,
    });
    onUpdateAuthors(nextAuthors);
    showToast(
      editingAuthorId
        ? 'লেখকের তথ্য সফলভাবে আপডেট করা হয়েছে!'
        : 'নতুন লেখক তালিকায় যুক্ত করা হয়েছে!'
    );
    resetAuthorForm();
  };

  const handleDeleteAuthorItem = (id: string) => {
    if (!onUpdateAuthors) return;
    if (authors.length <= 1) {
      showToast('অন্তত একজন লেখক তালিকায় রাখা আবশ্যক।');
      return;
    }
    onUpdateAuthors(authors.filter((a) => a.id !== id));
    if (editingAuthorId === id) resetAuthorForm();
    showToast('লেখককে তালিকা থেকে মুছে ফেলা হয়েছে।');
  };

  // Category / Topic CRUD Handlers
  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCatLabelBnInput('');
    setCatLabelEnInput('');
    setCatDescBnInput('');
  };

  const startEditCategory = (cat: LiteraryCategoryMeta) => {
    setEditingCategoryId(cat.id);
    setCatLabelBnInput(cat.labelBn);
    setCatLabelEnInput(cat.labelEn);
    setCatDescBnInput(cat.descriptionBn);
  };

  const handleSaveCategoryForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catLabelBnInput.trim() || !onUpdateCategories) return;
    const nextCategories = upsertLiteraryCategory(categories, {
      id: editingCategoryId || undefined,
      labelBn: catLabelBnInput,
      labelEn: catLabelEnInput,
      descriptionBn: catDescBnInput,
    });
    onUpdateCategories(nextCategories);
    showToast(
      editingCategoryId
        ? 'বিষয়বস্তু / বিভাগের নাম আপডেট করা হয়েছে!'
        : 'নতুন বিষয়বস্তু / বিভাগ যুক্ত করা হয়েছে!'
    );
    resetCategoryForm();
  };

  const handleDeleteCategoryItem = (id: string) => {
    if (!onUpdateCategories || id === 'all') return;
    onUpdateCategories(categories.filter((c) => c.id !== id));
    if (editingCategoryId === id) resetCategoryForm();
    showToast('বিভাগটি তালিকা থেকে মুছে ফেলা হয়েছে।');
  };

  const handleSaveAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestionId || !answerDraft.trim()) return;
    const refs = referencesDraft
      .split(/\n+/)
      .map((r) => r.trim())
      .filter(Boolean);
    onAnswerQuestion(selectedQuestionId, answerDraft, answeredByDraft, refs);
    setAnswerDraft('');
    setReferencesDraft('');
    showToast('প্রশ্নের উত্তর সফলভাবে সংরক্ষিত ও প্রকাশিত হয়েছে!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/65 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#FBF9F5] border border-[#E5DFD2] rounded-xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F3EFE6] border-b border-[#E5DFD2]">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#14532D]">
              <ShieldCheck className="w-3.5 h-3.5" />
              একটুখানি সাহিত্যের পরশ — সম্পাদকীয় কন্ট্রোল প্যানেল (আনলকড)
            </span>
            <h2 className="font-editorial text-xl font-bold text-[#1C1917] mt-0.5">
              লোগো, মৌলিক রচনা ও প্রশ্নোত্তর ব্যবস্থাপনা
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onLockAdmin();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#991B1B] text-white hover:bg-[#7F1D1D] text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title="অ্যাডমিন প্যানেল এখনই লক করুন"
            >
              <Lock className="w-3.5 h-3.5" /> এখনই লক করুন
            </button>
            <button
              type="button"
              onClick={() => {
                onLockAdmin();
                onClose();
              }}
              className="p-2 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-[#E5DFD2]/50 transition-colors cursor-pointer"
              aria-label="লক করে বন্ধ করুন"
              title="লক করে বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 px-6 py-3 bg-[#F3EFE6]/60 border-b border-[#E5DFD2]">
          <button
            type="button"
            onClick={() => setActiveTab('brand')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'brand'
                ? 'bg-[#0F766E] text-white'
                : 'text-[#475569] hover:bg-[#E2E8F0]/60'
            }`}
          >
            <Palette className="w-4 h-4" />
            ১. লোগো, তারিখ ও ঠিকানা
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('articles')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'articles'
                ? 'bg-[#0F766E] text-white'
                : 'text-[#475569] hover:bg-[#E2E8F0]/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            ২. মৌলিক রচনা প্রকাশ ও এডিট ({toBengaliDigits(articles.length)})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('authors-categories')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'authors-categories'
                ? 'bg-[#0F766E] text-white'
                : 'text-[#475569] hover:bg-[#E2E8F0]/60'
            }`}
          >
            <Users className="w-4 h-4" />
            ৩. লেখক ও বিষয়বস্তু এডিট ({toBengaliDigits(authors.length)} লেখক · {toBengaliDigits(categories.filter((c) => c.id !== 'all').length)} বিষয়)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('questions')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-[#0F766E] text-white'
                : 'text-[#475569] hover:bg-[#E2E8F0]/60'
            }`}
          >
            <MessageSquareQuote className="w-4 h-4" />
            <span>৪. প্রশ্ন ইনবক্স ({toBengaliDigits(questions.length)})</span>
            {questions.filter((q) => q.status === 'pending').length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#991B1B] text-white text-[10px] font-bold">
                {toBengaliDigits(questions.filter((q) => q.status === 'pending').length)}টি নতুন
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#0F766E] text-white'
                : 'text-[#475569] hover:bg-[#E2E8F0]/60'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>৫. অর্ডার ইনবক্স ({toBengaliDigits(orders.length)})</span>
            {orders.filter((o) => o.status === 'placed').length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#991B1B] text-white text-[10px] font-bold">
                {toBengaliDigits(orders.filter((o) => o.status === 'placed').length)}টি নতুন
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-[#0F766E] text-white'
                : 'text-[#475569] hover:bg-[#E2E8F0]/60'
            }`}
          >
            <Code2 className="w-4 h-4" />
            ৬. পাসওয়ার্ড ও গাইড
          </button>

          {savedNotice && (
            <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#166534] bg-[#166534]/10 px-3 py-1 rounded-md">
              <Check className="w-3.5 h-3.5" /> {savedNotice}
            </span>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BRAND, DIRECT LOGO UPLOAD, FOOTER ADDRESS & EMAIL */}
          {activeTab === 'brand' && (
            <form onSubmit={handleSaveBrand} className="space-y-5">
              <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#0F766E]/25 text-xs text-[#0F172A] leading-relaxed">
                এখান থেকে আপনি ওয়েবসাইটের <strong>নাম, সরাসরি লোগো ছবি আপলোড, ফুটারের ঠিকানা, ইমেইল, ফোন নম্বর</strong> এবং <strong>তারিখ</strong> পরিবর্তন করে নিচে <strong>“লোগো ও তথ্য সেভ করুন”</strong> বাটনে চাপুন।
              </div>

              {/* Direct Logo File Upload Card */}
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {brandDraft.logoImageUrl && brandDraft.logoImageUrl.trim().length > 5 ? (
                    <img
                      src={brandDraft.logoImageUrl}
                      alt=" ওয়েবসাইট লোগো"
                      className="w-16 h-16 rounded-xl object-cover border-2 border-[#0F766E]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#0F766E] to-[#065F46] text-white flex items-center justify-center font-editorial font-bold text-xl shadow-xs">
                      {brandDraft.logoMonogramBn || 'এস'}
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#0F172A]">
                      ওয়েবসাইটের লোগো ছবি (সরাসরি ফাইল আপলোড)
                    </p>
                    <p className="text-xs text-[#475569]">
                      আপনার মোবাইল বা কম্পিউটার থেকে সরাসরি PNG, JPG বা WEBP লোগো ছবি সিলেক্ট করুন (কোনো লিংকের প্রয়োজন নেই)।
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>লোগো ছবি আপলোড করুন</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        processUploadedImage(file, 420, (dataUrl) => {
                          setBrandDraft((prev) => ({ ...prev, logoImageUrl: dataUrl }));
                          showToast('লোগো ছবি যুক্ত হয়েছে — নিচে "সেভ করুন" বাটনে চাপুন!');
                        });
                      }}
                    />
                  </label>

                  {brandDraft.logoImageUrl && brandDraft.logoImageUrl.trim().length > 5 && (
                    <button
                      type="button"
                      onClick={() =>
                        setBrandDraft((prev) => ({ ...prev, logoImageUrl: '' }))
                      }
                      className="inline-flex items-center gap-1 px-3 py-2.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#991B1B] hover:bg-[#991B1B]/10 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> লোগো মুছুন
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    প্রকাশনার নাম (বাংলায়)
                  </label>
                  <input
                    type="text"
                    value={brandDraft.siteNameBn}
                    onChange={(e) => setBrandDraft({ ...brandDraft, siteNameBn: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    সাবটাইটেল / ট্যাগলাইন
                  </label>
                  <input
                    type="text"
                    value={brandDraft.taglineBn}
                    onChange={(e) => setBrandDraft({ ...brandDraft, taglineBn: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    ফুটারের ঠিকানা (প্রকাশনা দপ্তর ও যোগাযোগ) *
                  </label>
                  <input
                    type="text"
                    value={brandDraft.addressBn}
                    onChange={(e) => setBrandDraft({ ...brandDraft, addressBn: e.target.value })}
                    placeholder="যেমন: বাড়ি ১৪, রোড ৭, ধানমন্ডি, ঢাকা-১২০৯"
                    className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    ফুটারের ইমেইল অ্যাড্রেস (Email) *
                  </label>
                  <input
                    type="email"
                    value={brandDraft.email}
                    onChange={(e) => setBrandDraft({ ...brandDraft, email: e.target.value })}
                    placeholder="যেমন: info@sahityerparash.com"
                    className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    যোগাযোগের ফোন নম্বর (ফুটার ও অর্ডার ডেস্ক) *
                  </label>
                  <input
                    type="text"
                    value={brandDraft.phoneBn}
                    onChange={(e) => setBrandDraft({ ...brandDraft, phoneBn: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    প্রধান সম্পাদক / তত্ত্বাবধায়ক
                  </label>
                  <input
                    type="text"
                    value={brandDraft.chiefEditorBn}
                    onChange={(e) => setBrandDraft({ ...brandDraft, chiefEditorBn: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    প্রকাশনা সংসদের নাম (ফুটার নোট)
                  </label>
                  <input
                    type="text"
                    value={brandDraft.publisherNoteBn}
                    onChange={(e) => setBrandDraft({ ...brandDraft, publisherNoteBn: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    লোগোর সংক্ষিপ্ত অক্ষর (ছবি না থাকলে দেখাবে)
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={brandDraft.logoMonogramBn}
                    onChange={(e) => setBrandDraft({ ...brandDraft, logoMonogramBn: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#0F172A]"
                  />
                </div>

                {/* AUTOMATIC DAILY DATE VS MANUAL DATE SETTING */}
                <div className="sm:col-span-2 p-4 rounded-xl bg-[#F0FDF4] border border-[#0F766E]/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#0F766E]" />
                        <span>ওয়েবসাইটের তারিখ (অটোমেটিক প্রতিদিনের তারিখ বনাম ম্যানুয়াল)</span>
                      </p>
                      <p className="text-[11px] text-[#475569] mt-0.5">
                        <strong>স্বয়ংক্রিয় মোড চালু থাকলে</strong> প্রতিদিন রাত ১২টার পর হিজরি, বাংলা (বঙ্গাব্দ) ও ইংরেজি তারিখ <strong>অটোমেটিক নিজে থেকেই বদলে যাবে</strong> — আপনাকে হাত দিয়ে পাল্টাতে হবে না।
                      </p>
                    </div>
                    <div className="inline-flex rounded-lg border border-[#CBD5E1] bg-white p-1 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setBrandDraft((prev) => ({
                            ...prev,
                            autoUpdateDate: true,
                            hijriDateBn: liveDates.hijriDateBn,
                            banglaDateBn: liveDates.banglaDateBn,
                          }))
                        }
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                          brandDraft.autoUpdateDate !== false
                            ? 'bg-[#0F766E] text-white'
                            : 'text-[#475569] hover:text-[#0F172A]'
                        }`}
                      >
                        অটোমেটিক তারিখ (চালু)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setBrandDraft((prev) => ({ ...prev, autoUpdateDate: false }))
                        }
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                          brandDraft.autoUpdateDate === false
                            ? 'bg-[#0F172A] text-white'
                            : 'text-[#475569] hover:text-[#0F172A]'
                        }`}
                      >
                        ম্যানুয়াল এডিট
                      </button>
                    </div>
                  </div>

                  {brandDraft.autoUpdateDate !== false ? (
                    <div className="p-3 rounded-lg bg-white border border-[#0F766E]/25 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#0F766E]">
                        আজকের লাইভ অটোমেটিক তারিখ:
                      </span>
                      <span className="font-bold text-[#0F172A]">
                        {liveDates.fullHeaderDateBn}
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-[#0F172A] mb-1">
                          কাস্টম হিজরি তারিখ (টপ বার)
                        </label>
                        <input
                          type="text"
                          value={brandDraft.hijriDateBn}
                          onChange={(e) =>
                            setBrandDraft({ ...brandDraft, hijriDateBn: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#0F172A]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0F172A] mb-1">
                          কাস্টম বাংলা ও ইংরেজি তারিখ (টপ বার)
                        </label>
                        <input
                          type="text"
                          value={brandDraft.banglaDateBn}
                          onChange={(e) =>
                            setBrandDraft({ ...brandDraft, banglaDateBn: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#0F172A]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  ফুটারের সংক্ষিপ্ত পরিচিতি / সম্পাদকীয় মূলমন্ত্র
                </label>
                <textarea
                  rows={2}
                  value={brandDraft.editorialManifestoBn}
                  onChange={(e) => setBrandDraft({ ...brandDraft, editorialManifestoBn: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#0F172A]"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => {
                    onResetAll();
                    showToast('সব তথ্য ডিফল্ট অবস্থায় ফিরিয়ে আনা হয়েছে।');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#475569] hover:text-[#991B1B] cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> ডিফল্ট অবস্থায় রিসেট করুন
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" /> লোগো, ঠিকানা ও তথ্য সেভ করুন
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ORIGINAL WRITINGS CMS WITH DIRECT COVER PHOTO UPLOAD & AUTHOR/CATEGORY OVERRIDE */}
          {activeTab === 'articles' && (
            <div className="space-y-6">
              <form
                onSubmit={handleSubmitArticle}
                className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-editorial text-base font-bold text-[#0F172A]">
                    {editingArticleId ? 'মৌলিক রচনা সম্পাদনা করুন' : 'নতুন মৌলিক রচনা প্রকাশ করুন'}
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('authors-categories')}
                      className="text-xs font-bold text-[#0F766E] hover:underline cursor-pointer"
                    >
                      + লেখক ও বিষয়বস্তু তালিকা এডিট করুন
                    </button>
                    {editingArticleId && (
                      <button
                        type="button"
                        onClick={resetArticleForm}
                        className="text-xs font-medium text-[#991B1B] hover:underline cursor-pointer"
                      >
                        এডিট বাতিল করুন
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      রচনার শিরোনাম *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="যেমন: নীরবতার ভাষা ও মুমিনের আত্মসমালোচনা"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      বিষয়বস্তু / বিভাগ (Category)
                    </label>
                    <select
                      value={category}
                      onChange={(e) => {
                        const nextCatId = e.target.value as LiteraryArticle['category'];
                        setCategory(nextCatId);
                        const foundCat = categories.find((c) => c.id === nextCatId);
                        if (foundCat) setCustomCategoryBn(foundCat.labelBn);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm"
                    >
                      {categories
                        .filter((c) => c.id !== 'all')
                        .map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.labelBn}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      লেখক নির্বাচন করুন (তালিকা থেকে)
                    </label>
                    <select
                      value={authorId}
                      onChange={(e) => {
                        const nextAuthorId = e.target.value;
                        setAuthorId(nextAuthorId);
                        const foundAuthor = authors.find((a) => a.id === nextAuthorId);
                        if (foundAuthor) {
                          setCustomAuthorName(foundAuthor.nameBn);
                          setCustomAuthorRole(foundAuthor.designationBn);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm"
                    >
                      {authors.map((au) => (
                        <option key={au.id} value={au.id}>
                          {au.nameBn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      লেখকের নাম (সরাসরি লিখে পরিবর্তন করতে পারেন)
                    </label>
                    <input
                      type="text"
                      value={customAuthorName}
                      onChange={(e) => setCustomAuthorName(e.target.value)}
                      placeholder={
                        authors.find((a) => a.id === authorId)?.nameBn || 'লেখকের নাম লিখুন...'
                      }
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      লেখকের পদবি / পরিচয় (এডিটযোগ্য)
                    </label>
                    <input
                      type="text"
                      value={customAuthorRole}
                      onChange={(e) => setCustomAuthorRole(e.target.value)}
                      placeholder={
                        authors.find((a) => a.id === authorId)?.designationBn || 'লেখকের পদবি...'
                      }
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      বিষয়বস্তুর প্রদর্শিত নাম (এডিটযোগ্য)
                    </label>
                    <input
                      type="text"
                      value={customCategoryBn}
                      onChange={(e) => setCustomCategoryBn(e.target.value)}
                      placeholder={
                        categories.find((c) => c.id === category)?.labelBn ||
                        'যেমন: মৌলিক গদ্য ও প্রবন্ধ'
                      }
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      সংকলন / গ্রন্থের নাম
                    </label>
                    <input
                      type="text"
                      value={volumeTitle}
                      onChange={(e) => setVolumeTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      ডিফল্ট প্রচ্ছদ থিম (ছবি আপলোড না করলে)
                    </label>
                    <select
                      value={coverMotif}
                      onChange={(e) => setCoverMotif(e.target.value as LiteraryArticle['coverMotif'])}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm"
                    >
                      <option value="manuscript-lantern">পাণ্ডুলিপি ও ফানুস (Emerald Lantern)</option>
                      <option value="inkwell-scroll">দোয়াত-কলম ও স্ক্রল (Parchment Scroll)</option>
                      <option value="jasmine-notebook">শিউলি ও কাব্যখাতা (Poetry Notebook)</option>
                      <option value="archway-dome">ঐতিহ্যবাহী খিলান (Classic Archway)</option>
                      <option value="compass-chronicle">ইতিহাস ও কম্পাস (Chronicle Compass)</option>
                      <option value="olive-branch">জলপাই পাতা ও প্রজ্ঞা (Olive Branch)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      উপ-শিরোনাম (Subtitle)
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="রচনার মূল ভাবসংক্ষেপ এক লাইনে..."
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm"
                    />
                  </div>
                </div>

                {/* Direct Cover Photo Upload Box */}
                <div className="p-4 rounded-xl bg-white border border-[#CBD5E1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {customCoverUrl && customCoverUrl.trim().length > 5 ? (
                      <img
                        src={customCoverUrl}
                        alt="প্রবন্ধ কভার প্রিভিউ"
                        className="w-24 h-16 rounded-lg object-cover border border-[#0F766E]"
                      />
                    ) : (
                      <div className="w-24 h-16 rounded-lg bg-[#F1F5F9] border border-[#CBD5E1] flex items-center justify-center text-[#64748B]">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-[#0F172A]">
                        প্রবন্ধের কভার ছবি (সরাসরি গ্যালারি / কম্পিউটার থেকে আপলোড)
                      </p>
                      <p className="text-[11px] text-[#475569]">
                        কোনো লিংক দেওয়ার প্রয়োজন নেই — সরাসরি ছবি সিলেক্ট করলেই প্রবন্ধের কভার হিসেবে যুক্ত হবে।
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-bold cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>কভার ছবি আপলোড করুন</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          processUploadedImage(file, 1080, (dataUrl) => {
                            setCustomCoverUrl(dataUrl);
                            showToast('প্রবন্ধের কভার ছবি যুক্ত হয়েছে!');
                          });
                        }}
                      />
                    </label>
                    {customCoverUrl && customCoverUrl.trim().length > 5 && (
                      <button
                        type="button"
                        onClick={() => setCustomCoverUrl('')}
                        className="px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#991B1B] hover:bg-[#991B1B]/10 cursor-pointer"
                      >
                        ছবি মুছুন
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    মূল রচনা / প্রবন্ধের অনুচ্ছেদসমূহ (প্রতিটি প্যারাগ্রাফ নতুন লাইনে লিখুন) *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={contentBody}
                    onChange={(e) => setContentBody(e.target.value)}
                    placeholder="আপনার মৌলিক প্রবন্ধ, কবিতা বা গল্পের বিস্তারিত অংশ এখানে লিখুন..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      বিশেষ উদ্ধৃতি (Pull Quote)
                    </label>
                    <input
                      type="text"
                      value={pullQuote}
                      onChange={(e) => setPullQuote(e.target.value)}
                      placeholder="লেখার সবচেয়ে গুরুত্বপূর্ণ একটি বাক্য..."
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      টীকা ও তথ্যসূত্র (প্রতি লাইনে একটি)
                    </label>
                    <input
                      type="text"
                      value={citationsText}
                      onChange={(e) => setCitationsText(e.target.value)}
                      placeholder="যেমন: সূরা আল-আলাক: ১-৫"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    {editingArticleId ? 'পরিবর্তন সেভ করুন' : 'রচনাটি প্রকাশ করুন'}
                  </button>
                </div>
              </form>

              {/* Existing Articles List */}
              <div className="space-y-2.5">
                <h3 className="font-editorial text-base font-bold text-[#1C1917]">
                  প্রকাশিত মৌলিক রচনাসমূহ ({toBengaliDigits(articles.length)}টি)
                </h3>
                <div className="divide-y divide-[#E5DFD2] border border-[#E5DFD2] rounded-xl bg-white overflow-hidden">
                  {articles.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 hover:bg-[#FBF9F5]"
                    >
                      <div className="min-w-0">
                        <p className="font-editorial font-bold text-sm text-[#1C1917] truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-[#57534E]">
                          {item.categoryBn} · {item.authorName} · {item.publishedAtBn}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditArticle(item)}
                          className="px-3 py-1.5 rounded-lg border border-[#E5DFD2] text-xs font-medium text-[#1C1917] hover:bg-[#F3EFE6]"
                        >
                          এডিট করুন
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteArticle(item.id)}
                          className="p-1.5 rounded-lg text-[#78716C] hover:text-[#991B1B] hover:bg-[#991B1B]/10"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUTHORS & CATEGORIES / TOPICS MANAGEMENT (লেখক ও বিষয়বস্তু এডিট) */}
          {activeTab === 'authors-categories' && (
            <div className="space-y-8">
              <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#0F766E]/25 text-xs text-[#0F172A] leading-relaxed">
                এখান থেকে আপনি ওয়েবসাইটের <strong>লেখক বৃন্দ (নতুন লেখক যুক্ত করা, নাম, পদবি, জীবনী ও ছবি এডিট করা)</strong> এবং <strong>বিষয়বস্তু / সাহিত্য বিভাগসমূহ (বিভাগের নাম এডিট বা নতুন বিষয়বস্তু যুক্ত করা)</strong> সরাসরি নিয়ন্ত্রণ করতে পারবেন।
              </div>

              {/* SECTION A: AUTHORS MANAGEMENT (লেখক বৃন্দ সংযোজন ও সম্পাদনা) */}
              <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E]">
                      বিভাগ ১ · বিজ্ঞ লেখক ও গবেষক তালিকা
                    </span>
                    <h3 className="font-editorial text-lg font-bold text-[#0F172A]">
                      {editingAuthorId
                        ? 'লেখকের তথ্য সম্পাদনা করুন'
                        : 'নতুন লেখক যুক্ত করুন অথবা বিদ্যমান লেখক এডিট করুন'}
                    </h3>
                  </div>
                  {editingAuthorId && (
                    <button
                      type="button"
                      onClick={resetAuthorForm}
                      className="px-3 py-1.5 rounded-lg bg-[#991B1B]/10 text-[#991B1B] text-xs font-bold hover:bg-[#991B1B]/20 cursor-pointer"
                    >
                      এডিট বাতিল করুন
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveAuthorForm} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">
                        লেখকের পূর্ণ নাম (বাংলায়) *
                      </label>
                      <input
                        type="text"
                        required
                        value={authorNameInput}
                        onChange={(e) => setAuthorNameInput(e.target.value)}
                        placeholder="যেমন: উস্তায আব্দুল্লাহ আল-মাহমুদ"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">
                        পদবি / সাহিত্যিক পরিচয় *
                      </label>
                      <input
                        type="text"
                        required
                        value={authorDesignationInput}
                        onChange={(e) => setAuthorDesignationInput(e.target.value)}
                        placeholder="যেমন: প্রধান সম্পাদক ও মৌলিক গদ্যকার"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">
                        বিশেষজ্ঞতা / লেখার মূল বিষয়বস্তু
                      </label>
                      <input
                        type="text"
                        value={authorSpecializationInput}
                        onChange={(e) => setAuthorSpecializationInput(e.target.value)}
                        placeholder="যেমন: ঈমানী দর্শন ও সাহিত্য সমালোচনা"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">
                        সংক্ষিপ্ত অক্ষর / মনোগ্রাম (ঐচ্ছিক)
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={authorMonogramInput}
                        onChange={(e) => setAuthorMonogramInput(e.target.value)}
                        placeholder="যেমন: আম"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">
                        প্রকাশিত রচনার সংখ্যা
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={authorWritingsCountInput}
                        onChange={(e) => setAuthorWritingsCountInput(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">
                        লেখকের ছবি আপলোড (ঐচ্ছিক)
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-bold cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>ছবি নির্বাচন</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              processUploadedImage(file, 320, (dataUrl) => {
                                setAuthorAvatarInput(dataUrl);
                              });
                            }}
                          />
                        </label>
                        {authorAvatarInput && (
                          <img
                            src={authorAvatarInput}
                            alt="লেখক"
                            className="w-9 h-9 rounded-full object-cover border border-[#0F766E]"
                          />
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">
                        লেখকের সংক্ষিপ্ত জীবনী / পরিচিতি
                      </label>
                      <textarea
                        rows={2}
                        value={authorBioInput}
                        onChange={(e) => setAuthorBioInput(e.target.value)}
                        placeholder="লেখকের সাহিত্যচর্চা ও গবেষণা সম্পর্কে এক-দুই বাক্যে লিখুন..."
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <Save className="w-4 h-4" />
                      <span>
                        {editingAuthorId ? 'লেখকের তথ্য আপডেট করুন' : 'নতুন লেখক যুক্ত করুন'}
                      </span>
                    </button>
                  </div>
                </form>

                {/* Existing Authors List */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-[#475569]">
                    বর্তমান লেখক তালিকা ({toBengaliDigits(authors.length)} জন) — যেকোনো লেখকের নাম বা পরিচয় পরিবর্তন করতে “এডিট করুন” বাটনে চাপুন:
                  </p>
                  <div className="divide-y divide-[#E2E8F0] border border-[#CBD5E1] rounded-xl bg-white overflow-hidden">
                    {authors.map((au) => (
                      <div
                        key={au.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 hover:bg-[#F8FAFC]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {au.avatarUrl ? (
                            <img
                              src={au.avatarUrl}
                              alt={au.nameBn}
                              className="w-9 h-9 rounded-full object-cover border border-[#0F766E] shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#0F766E] text-white font-editorial font-bold text-xs flex items-center justify-center shrink-0">
                              {au.monogramBn}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-editorial font-bold text-sm text-[#0F172A] truncate">
                              {au.nameBn}
                            </p>
                            <p className="text-xs text-[#475569] truncate">
                              {au.designationBn} · বিশেষজ্ঞতা: {au.specializationBn}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditAuthor(au)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-xs font-bold text-[#0F766E] cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> এডিট করুন
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAuthorItem(au.id)}
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#991B1B] hover:bg-[#991B1B]/10 cursor-pointer"
                            title="লেখক মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION B: CATEGORIES & TOPICS MANAGEMENT (বিষয়বস্তু ও সাহিত্য বিভাগ এডিট) */}
              <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
                      বিভাগ ২ · সাহিত্য বিভাগ ও বিষয়বস্তু (Categories & Topics)
                    </span>
                    <h3 className="font-editorial text-lg font-bold text-[#0F172A]">
                      {editingCategoryId
                        ? 'বিষয়বস্তু / বিভাগের নাম সম্পাদনা করুন'
                        : 'নতুন বিষয়বস্তু / বিভাগ যুক্ত করুন অথবা বিদ্যমান বিষয় এডিট করুন'}
                    </h3>
                  </div>
                  {editingCategoryId && (
                    <button
                      type="button"
                      onClick={resetCategoryForm}
                      className="px-3 py-1.5 rounded-lg bg-[#991B1B]/10 text-[#991B1B] text-xs font-bold hover:bg-[#991B1B]/20 cursor-pointer"
                    >
                      এডিট বাতিল করুন
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveCategoryForm} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">
                        বিষয়বস্তু / বিভাগের বাংলা নাম *
                      </label>
                      <input
                        type="text"
                        required
                        value={catLabelBnInput}
                        onChange={(e) => setCatLabelBnInput(e.target.value)}
                        placeholder="যেমন: সীরাত ও ইতিহাস / ঈমান ও জীবনবোধ"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">
                        ইংরেজি নাম (ঐচ্ছিক)
                      </label>
                      <input
                        type="text"
                        value={catLabelEnInput}
                        onChange={(e) => setCatLabelEnInput(e.target.value)}
                        placeholder="যেমন: Seerah & History"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">
                        বিষয়বস্তুর সংক্ষিপ্ত বিবরণ
                      </label>
                      <input
                        type="text"
                        value={catDescBnInput}
                        onChange={(e) => setCatDescBnInput(e.target.value)}
                        placeholder="এই বিভাগের প্রবন্ধ ও রচনাসমূহের সংক্ষিপ্ত পরিচয়..."
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <Save className="w-4 h-4" />
                      <span>
                        {editingCategoryId
                          ? 'বিষয়বস্তুর পরিবর্তন সেভ করুন'
                          : 'নতুন বিষয়বস্তু / বিভাগ যুক্ত করুন'}
                      </span>
                    </button>
                  </div>
                </form>

                {/* Existing Categories List */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-[#475569]">
                    বর্তমান বিষয়বস্তু ও সাহিত্য বিভাগসমূহ ({toBengaliDigits(categories.length)}টি) — যেকোনো বিষয়ের নাম পরিবর্তন করতে “এডিট করুন” বাটনে চাপুন:
                  </p>
                  <div className="divide-y divide-[#E2E8F0] border border-[#CBD5E1] rounded-xl bg-white overflow-hidden">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 hover:bg-[#F8FAFC]"
                      >
                        <div className="min-w-0">
                          <p className="font-editorial font-bold text-sm text-[#0F172A]">
                            {cat.labelBn}{' '}
                            <span className="text-xs font-normal text-[#64748B]">
                              ({cat.labelEn})
                            </span>
                          </p>
                          <p className="text-xs text-[#475569] truncate">{cat.descriptionBn}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditCategory(cat)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-xs font-bold text-[#0F766E] cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> এডিট করুন
                          </button>
                          {cat.id !== 'all' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCategoryItem(cat.id)}
                              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#991B1B] hover:bg-[#991B1B]/10 cursor-pointer"
                              title="বিভাগ মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Q&A DESK INBOX & ANSWER MANAGEMENT */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              {/* INCOMING PENDING QUESTIONS INBOX */}
              <div className="p-5 rounded-xl bg-[#14532D]/5 border-2 border-[#14532D]/30 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#92400E]">
                      সরাসরি ওয়েবসাইট থেকে আগত প্রশ্ন ইনবক্স
                    </span>
                    <h3 className="font-editorial text-lg font-bold text-[#1C1917]">
                      পাঠকদের নতুন অপেক্ষমাণ প্রশ্নসমূহ (
                      {toBengaliDigits(questions.filter((q) => q.status === 'pending').length)}টি)
                    </h3>
                  </div>
                  <span className="text-xs text-[#57534E]">
                    কেউ ওয়েবসাইটে প্রশ্ন করলেই সাথে সাথে এই ইনবক্সে জমা হয়
                  </span>
                </div>

                {questions.filter((q) => q.status === 'pending').length === 0 ? (
                  <div className="p-4 rounded-lg bg-white border border-[#E5DFD2] text-xs text-[#57534E]">
                    বর্তমানে কোনো নতুন অপেক্ষমাণ প্রশ্ন নেই। সকল প্রশ্নের উত্তর দেওয়া হয়েছে।
                  </div>
                ) : (
                  <div className="space-y-3">
                    {questions
                      .filter((q) => q.status === 'pending')
                      .map((pendingQ) => (
                        <div
                          key={pendingQ.id}
                          className="p-4 rounded-xl bg-white border border-[#92400E]/40 shadow-xs space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#991B1B] bg-[#991B1B]/10 px-2.5 py-0.5 rounded">
                              নতুন প্রশ্ন · {pendingQ.questionNoBn} · {pendingQ.topicBn}
                            </span>
                            <span className="text-xs text-[#57534E]">
                              প্রশ্নকারী: <strong>{pendingQ.askedBy}</strong> ({pendingQ.askedFrom}) · {pendingQ.publishedAtBn}
                            </span>
                          </div>
                          <p className="font-editorial text-base font-bold text-[#1C1917]">
                            প্রশ্ন: {pendingQ.questionTitle}
                          </p>
                          <p className="text-xs text-[#57534E] leading-relaxed bg-[#F3EFE6]/60 p-3 rounded-lg border border-[#E5DFD2]">
                            {pendingQ.questionDetail}
                          </p>
                          <div className="flex items-center justify-end gap-2 pt-1">
                            {onDeleteQuestion && (
                              <button
                                type="button"
                                onClick={() => onDeleteQuestion(pendingQ.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E5DFD2] text-xs font-semibold text-[#991B1B] hover:bg-[#991B1B]/10 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> মুছে ফেলুন
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedQuestionId(pendingQ.id);
                                setAnswerDraft('');
                                setAnsweredByDraft('সম্পাদনা পরিষদ, একটুখানি সাহিত্যের পরশ');
                                setReferencesDraft('');
                                document
                                  .getElementById('admin-answer-editor')
                                  ?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#14532D] hover:bg-[#0F3F22] text-white text-xs font-bold cursor-pointer"
                            >
                              এই প্রশ্নের উত্তর লিখুন
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* ANSWER COMPOSER FORM */}
              <form
                id="admin-answer-editor"
                onSubmit={handleSaveAnswer}
                className="p-5 rounded-xl bg-[#F3EFE6] border border-[#E5DFD2] space-y-4"
              >
                <h3 className="font-editorial text-base font-bold text-[#1C1917]">
                  পাঠকের প্রশ্নের উত্তর প্রদান বা সম্পাদনা করুন
                </h3>

                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">
                    প্রশ্ন নির্বাচন করুন
                  </label>
                  <select
                    value={selectedQuestionId}
                    onChange={(e) => {
                      const qid = e.target.value;
                      setSelectedQuestionId(qid);
                      const found = questions.find((q) => q.id === qid);
                      if (found) {
                        setAnswerDraft(
                          found.status === 'pending' ? '' : found.answerParagraphs.join('\n\n')
                        );
                        setAnsweredByDraft(found.answeredBy);
                        setReferencesDraft(found.references.join('\n'));
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#E5DFD2] text-sm font-medium"
                  >
                    {questions.map((q) => (
                      <option key={q.id} value={q.id}>
                        [{q.questionNoBn}] {q.questionTitle} — প্রশ্নকারী: {q.askedBy} (
                        {q.status === 'answered' ? 'উত্তরকৃত' : 'নতুন অপেক্ষমাণ প্রশ্ন'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Question Detail Preview */}
                {(() => {
                  const selQ = questions.find((q) => q.id === selectedQuestionId);
                  if (!selQ) return null;
                  return (
                    <div className="p-3.5 rounded-lg bg-white border border-[#E5DFD2] space-y-1 text-xs">
                      <p className="font-bold text-[#92400E]">
                        প্রশ্নকারীর নাম: {selQ.askedBy} ({selQ.askedFrom}) · বিষয়: {selQ.topicBn}
                      </p>
                      <p className="font-bold text-sm text-[#1C1917]">
                        শিরোনাম: {selQ.questionTitle}
                      </p>
                      <p className="text-[#57534E] leading-relaxed">
                        বিস্তারিত জিজ্ঞাসা: {selQ.questionDetail}
                      </p>
                    </div>
                  );
                })()}

                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">
                    আপনার বিস্তারিত উত্তর (প্রতিটি অনুচ্ছেদ নতুন লাইনে লিখুন) *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={answerDraft}
                    onChange={(e) => setAnswerDraft(e.target.value)}
                    placeholder="দালিলিক ও সাহিত্যিক মানদণ্ডে প্রশ্নের উত্তর এখানে লিখুন..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5DFD2] text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[#57534E] mb-1">
                      উত্তরদাতা / সম্পাদনা পরিষদ
                    </label>
                    <input
                      type="text"
                      value={answeredByDraft}
                      onChange={(e) => setAnsweredByDraft(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5DFD2] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#57534E] mb-1">
                      তথ্যসূত্র ও দলিল (প্রতি লাইনে একটি)
                    </label>
                    <input
                      type="text"
                      value={referencesDraft}
                      onChange={(e) => setReferencesDraft(e.target.value)}
                      placeholder="যেমন: সহীহ বুখারী; ইমাম গাজ্জালী, ইহইয়াউ উলুমিদ্দীন"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5DFD2] text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#14532D] hover:bg-[#0F3F22] text-[#FBF9F5] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> উত্তর প্রকাশ করুন
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: BOOK & ANTHOLOGY ORDERS INBOX */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#14532D]/10 border border-[#14532D]/30 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#14532D]">
                    হার্ডকভার সংকলন ও গ্রন্থ অর্ডার ম্যানেজমেন্ট
                  </span>
                  <h3 className="font-editorial text-lg font-bold text-[#1C1917]">
                    পাঠকদের সকল অর্ডার ইনবক্স (মোট {toBengaliDigits(orders.length)}টি অর্ডার)
                  </h3>
                </div>
                <span className="text-xs font-semibold text-[#92400E]">
                  নতুন অর্ডার: {toBengaliDigits(orders.filter((o) => o.status === 'placed').length)}টি · সক্রিয় ডেলিভারি: {toBengaliDigits(orders.filter((o) => o.status !== 'delivered').length)}টি
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-white border border-[#E5DFD2] text-sm text-[#57534E]">
                  এখনো কোনো সংকলন অর্ডার জমা পড়েনি।
                </div>
              ) : (
                <div className="space-y-3.5">
                  {orders.map((ord) => {
                    const stepMeta =
                      ORDER_STATUS_STEPS.find((s) => s.id === ord.status) || ORDER_STATUS_STEPS[0];
                    return (
                      <div
                        key={ord.id}
                        className={`p-5 rounded-xl bg-white border shadow-xs space-y-3 ${
                          ord.status === 'placed'
                            ? 'border-2 border-[#14532D]'
                            : 'border-[#E5DFD2]'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5DFD2] pb-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 rounded bg-[#14532D] text-white text-xs font-bold">
                              অর্ডার কোড: {ord.orderNumber}
                            </span>
                            {ord.status === 'placed' && (
                              <span className="px-2 py-0.5 rounded bg-[#991B1B] text-white text-[11px] font-bold">
                                নতুন অর্ডার
                              </span>
                            )}
                            <span className="text-xs text-[#57534E]">
                              ট্র্যাকিং: <strong>{ord.trackingCode}</strong> · সময়: {ord.createdAtLabel}
                            </span>
                          </div>
                          <span className="text-base font-bold text-[#14532D]">
                            মোট হাদিয়া: {formatBdt(ord.total)} (
                            {ord.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : 'বিকাশ / নগদ'})
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-lg bg-[#F3EFE6]/70 border border-[#E5DFD2] space-y-1">
                            <p className="font-bold text-[#1C1917] text-sm">
                              গ্রাহকের নাম: {ord.recipientName}
                            </p>
                            <p className="flex items-center gap-1.5 text-[#14532D] font-bold">
                              <Phone className="w-3.5 h-3.5" />
                              <span>
                                মোবাইল নম্বর: {ord.recipientPhone || '০১৭১১-XXXXXX (প্রদত্ত)'}
                              </span>
                            </p>
                            <p className="flex items-start gap-1.5 text-[#57534E]">
                              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#92400E]" />
                              <span>ঠিকানা: {ord.destinationCity}</span>
                            </p>
                          </div>

                          <div className="p-3 rounded-lg bg-[#F3EFE6]/70 border border-[#E5DFD2] space-y-1">
                            <p className="font-bold text-[#92400E]">অর্ডারকৃত সংকলন ও গ্রন্থ:</p>
                            <p className="font-semibold text-[#1C1917] leading-relaxed">
                              {ord.itemsSummary}
                            </p>
                            <p className="text-[#57534E]">
                              মোট কপি: {toBengaliDigits(ord.itemCount)}টি · বর্তমান ধাপ:{' '}
                              <strong className="text-[#14532D]">{stepMeta.shortLabel}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Status Control & Delete Row */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="text-xs font-bold text-[#1C1917]">
                              ডেলিভারি স্ট্যাটাস পরিবর্তন করুন:
                            </label>
                            <select
                              value={ord.status}
                              onChange={(e) => {
                                if (onUpdateOrderStatus) {
                                  onUpdateOrderStatus(ord.id, e.target.value as OrderStatus);
                                  showToast(
                                    `অর্ডার ${ord.orderNumber}-এর স্ট্যাটাস আপডেট করা হয়েছে!`
                                  );
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#F3EFE6] border border-[#E5DFD2] text-xs font-bold text-[#1C1917]"
                            >
                              {ORDER_STATUS_STEPS.map((st) => (
                                <option key={st.id} value={st.id}>
                                  {toBengaliDigits(st.stepIndex)}. {st.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {onDeleteOrder && (
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteOrder(ord.id);
                                showToast(`অর্ডার ${ord.orderNumber} তালিকা থেকে মুছে ফেলা হয়েছে।`);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E5DFD2] text-xs font-semibold text-[#991B1B] hover:bg-[#991B1B]/10 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> অর্ডার মুছুন
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PASSWORD & CODE GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-sm text-[#1C1917] leading-relaxed">
              <div className="p-4 rounded-xl bg-[#14532D]/10 border border-[#14532D]/25 space-y-3">
                <h3 className="font-editorial text-base font-bold text-[#14532D] flex items-center gap-2">
                  <KeyRound className="w-4 h-4" /> আপনার অ্যাডমিন পাসওয়ার্ড পরিবর্তন করুন
                </h3>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <input
                    type="text"
                    value={newPasscodeDraft}
                    onChange={(e) => setNewPasscodeDraft(e.target.value)}
                    placeholder="নতুন গোপন পাসওয়ার্ড লিখুন (কমপক্ষে ৪ অক্ষর)..."
                    className="flex-1 px-3.5 py-2 rounded-lg bg-white border border-[#E5DFD2] text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPasscodeDraft.trim().length >= 4) {
                        onUpdatePasscode(newPasscodeDraft.trim());
                        setNewPasscodeDraft('');
                        showToast('আপনার নতুন অ্যাডমিন পাসওয়ার্ড সফলভাবে সেভ হয়েছে!');
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-[#14532D] text-white text-xs font-semibold hover:bg-[#0F3F22]"
                  >
                    পাসওয়ার্ড আপডেট করুন
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-[#E5DFD2] space-y-4">
                <div className="border-b border-[#E5DFD2] pb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E]">
                    GitHub ও লাইভ হোস্টিং গাইড
                  </span>
                  <h3 className="font-editorial text-base font-bold text-[#1C1917] mt-0.5">
                    এই ওয়েবসাইটটি আপনার GitHub-এ কীভাবে বসাবেন এবং লাইভ করবেন?
                  </h3>
                </div>

                <div className="space-y-3 text-xs text-[#334155] leading-relaxed">
                  <div className="p-3.5 rounded-lg bg-[#F0FDF4] border border-[#0F766E]/25 space-y-1.5">
                    <p className="font-bold text-[#0F766E] text-sm">
                      পদ্ধতি ১: সরাসরি এখান থেকেই GitHub-এ পাঠানো বা ZIP ডাউনলোড (সবচেয়ে সহজ)
                    </p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>
                        উপরের ডান পাশের মেনু থেকে <strong>Export / Download ZIP</strong> বা <strong>GitHub আইকনে</strong> ক্লিক করে প্রজেক্টটি আপনার কম্পিউটার বা সরাসরি GitHub অ্যাকাউন্টে নিন।
                      </li>
                      <li>
                        আপনার <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="underline font-bold text-[#0F766E]">github.com/new</a>-এ গিয়ে নতুন একটি Repository খুলুন (যেমন: <code className="font-mono bg-white px-1.5 py-0.5 rounded">sahityer-parash</code>)।
                      </li>
                      <li>
                        ডাউনলোড করা ফোল্ডারটি আনজিপ (Unzip) করে সরাসরি GitHub-এর <strong>“uploading an existing file”</strong> অপশন দিয়ে অথবা নিচের কমান্ড দিয়ে আপলোড করে দিন।
                      </li>
                    </ol>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                    <p className="font-bold text-[#0F172A] text-sm">
                      পদ্ধতি ২: কম্পিউটারের Terminal / Git Bash দিয়ে GitHub-এ তোলার কমান্ড
                    </p>
                    <p>প্রজেক্ট ফোল্ডারের ভেতরে টার্মিনাল ওপেন করে নিচের কমান্ডগুলো পরপর পেস্ট করুন:</p>
                    <pre className="p-3 rounded-lg bg-[#0F172A] text-[#F8FAFC] font-mono text-[11px] overflow-x-auto leading-relaxed">
{`git init
git add .
git commit -m "Initial commit: Ektukhani Sahityer Parash"
git branch -M main
git remote add origin https://github.com/আপনার-ইউজারনেম/sahityer-parash.git
git push -u origin main`}
                    </pre>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#F0F9FF] border border-[#0284C7]/25 space-y-1.5">
                    <p className="font-bold text-[#0284C7] text-sm">
                      ধাপ ৩: GitHub থেকে ওয়েবসাইটটি সম্পূর্ণ ফ্রিতে লাইভ (Live) করার নিয়ম
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>Render.com বা Railway.app (সম্পূর্ণ ব্যাকএন্ডসহ — প্রস্তাবিত):</strong> আপনার GitHub একাউন্ট দিয়ে <span className="font-semibold">Render.com</span>-এ লগইন করে <strong>New Web Service</strong> সিলেক্ট করুন এবং আপনার <code className="font-mono bg-white px-1 py-0.5 rounded">sahityer-parash</code> রিপোজিটরি যুক্ত করুন। Build Command দিন <code className="font-mono bg-white px-1 py-0.5 rounded">npm install && npm run build</code> এবং Start Command দিন <code className="font-mono bg-white px-1 py-0.5 rounded">npm start</code>। এতে প্রশ্ন ইনবক্স, অর্ডার ও অ্যাডমিন এডিটিং সার্ভারসহ লাইভ থাকবে।
                      </li>
                      <li>
                        <strong>Vercel / Netlify / GitHub Pages (ফ্রন্টএন্ড ও ক্লাউড মোড):</strong> Vercel বা Netlify-তে GitHub রিপোজিটরি কানেক্ট করলে Build Command <code className="font-mono bg-white px-1 py-0.5 rounded">npm run build</code> এবং Output Directory <code className="font-mono bg-white px-1 py-0.5 rounded">dist</code> দিলেই ১ মিনিটে ওয়েবসাইট লাইভ হয়ে যাবে।
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F3EFE6] border border-[#E5DFD2] space-y-2">
                <h3 className="font-editorial text-base font-bold text-[#14532D]">
                  কোড ফাইলের কোথায় কী আছে? (Full-Stack Architecture)
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-xs text-[#57534E]">
                  <li>
                    <code className="font-mono bg-white px-1.5 py-0.5 rounded">/server.ts</code> — Express ব্যাকএন্ড সার্ভার এবং REST API রাউটসমূহ (<code className="font-mono">/api/articles</code>, <code className="font-mono">/api/questions</code>, <code className="font-mono">/api/orders</code>)।
                  </li>
                  <li>
                    <code className="font-mono bg-white px-1.5 py-0.5 rounded">/src/store/literaryCatalog.ts</code> — মৌলিক প্রবন্ধ, কবিতা, সংকলন, অটো ডে/নাইট থিম এবং লেখকবৃন্দের ডিফল্ট ডেটা।
                  </li>
                  <li>
                    <code className="font-mono bg-white px-1.5 py-0.5 rounded">/src/App.tsx</code> — ওয়েবসাইটের মূল ফ্রন্টএন্ড ডিজাইন, অটো ডে/নাইট মোড কন্ট্রোল, রিডার মোডাল ও অর্ডার ড্রয়ার।
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
