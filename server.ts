import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  DEFAULT_LITERARY_BRAND,
  INITIAL_LITERARY_ARTICLES,
  INITIAL_ANTHOLOGY_VOLUMES,
  INITIAL_LITERARY_QUESTIONS,
  LITERARY_AUTHORS,
  LITERARY_CATEGORIES,
  createNewLiteraryArticle,
  createNewLiteraryQuestion,
  type LiteraryArticle,
  type LiteraryBrandConfig,
  type LiteraryQuestion,
  type AnthologyVolume,
  type LiteraryAuthor,
  type LiteraryCategoryMeta,
} from './src/store/literaryCatalog.js';
import { INITIAL_DEMO_ORDERS, type TrackedOrder } from './src/store/catalog.js';

interface PersistedDatabase {
  brand: LiteraryBrandConfig;
  articles: LiteraryArticle[];
  volumes: AnthologyVolume[];
  questions: LiteraryQuestion[];
  authors: LiteraryAuthor[];
  categories: LiteraryCategoryMeta[];
  orders: TrackedOrder[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'sahityer_parash_db.json');

function loadDatabase(): PersistedDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<PersistedDatabase>;
      return {
        brand: { ...DEFAULT_LITERARY_BRAND, ...(parsed.brand || {}) },
        articles:
          Array.isArray(parsed.articles) && parsed.articles.length > 0
            ? parsed.articles
            : [...INITIAL_LITERARY_ARTICLES],
        volumes:
          Array.isArray(parsed.volumes) && parsed.volumes.length > 0
            ? parsed.volumes
            : [...INITIAL_ANTHOLOGY_VOLUMES],
        questions:
          Array.isArray(parsed.questions) && parsed.questions.length > 0
            ? parsed.questions
            : [...INITIAL_LITERARY_QUESTIONS],
        authors:
          Array.isArray(parsed.authors) && parsed.authors.length > 0
            ? parsed.authors
            : [...LITERARY_AUTHORS],
        categories:
          Array.isArray(parsed.categories) && parsed.categories.length > 0
            ? parsed.categories
            : [...LITERARY_CATEGORIES],
        orders:
          Array.isArray(parsed.orders) && parsed.orders.length > 0
            ? parsed.orders
            : [...INITIAL_DEMO_ORDERS],
      };
    }
  } catch (err) {
    console.warn('Could not read persisted database file, initializing fresh state:', err);
  }

  return {
    brand: { ...DEFAULT_LITERARY_BRAND },
    articles: [...INITIAL_LITERARY_ARTICLES],
    volumes: [...INITIAL_ANTHOLOGY_VOLUMES],
    questions: [...INITIAL_LITERARY_QUESTIONS],
    authors: [...LITERARY_AUTHORS],
    categories: [...LITERARY_CATEGORIES],
    orders: [...INITIAL_DEMO_ORDERS],
  };
}

function saveDatabase(db: PersistedDatabase): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to persist database:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '15mb' }));

  let db = loadDatabase();

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'একটুখানি সাহিত্যের পরশ — Backend API',
      articleCount: db.articles.length,
      volumeCount: db.volumes.length,
      questionCount: db.questions.length,
    });
  });

  // Bootstrap endpoint for full initial state
  app.get('/api/bootstrap', (_req, res) => {
    res.json({
      brand: db.brand,
      articles: db.articles,
      volumes: db.volumes,
      questions: db.questions,
      authors: db.authors,
      categories: db.categories,
      orders: db.orders,
    });
  });

  // Brand endpoints
  app.get('/api/brand', (_req, res) => {
    res.json(db.brand);
  });

  app.put('/api/brand', (req, res) => {
    db.brand = {
      ...db.brand,
      ...(req.body || {}),
    };
    saveDatabase(db);
    res.json(db.brand);
  });

  // Authors endpoints
  app.get('/api/authors', (_req, res) => {
    res.json(db.authors);
  });

  app.put('/api/authors', (req, res) => {
    if (Array.isArray(req.body?.authors)) {
      db.authors = req.body.authors;
      saveDatabase(db);
    }
    res.json(db.authors);
  });

  // Categories endpoints
  app.get('/api/categories', (_req, res) => {
    res.json(db.categories);
  });

  app.put('/api/categories', (req, res) => {
    if (Array.isArray(req.body?.categories)) {
      db.categories = req.body.categories;
      saveDatabase(db);
    }
    res.json(db.categories);
  });

  // Articles endpoints
  app.get('/api/articles', (req, res) => {
    const { category, search, authorId, volumeId } = req.query;
    let list = [...db.articles];

    if (typeof category === 'string' && category !== 'all') {
      list = list.filter((a) => a.category === category);
    }
    if (typeof authorId === 'string' && authorId !== 'all') {
      list = list.filter((a) => a.authorId === authorId);
    }
    if (typeof volumeId === 'string' && volumeId !== 'all') {
      list = list.filter((a) => a.volumeId === volumeId);
    }
    if (typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.subtitle.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.authorName.toLowerCase().includes(q)
      );
    }

    res.json(list);
  });

  app.post('/api/articles', (req, res) => {
    const body = req.body || {};
    if (!body.title || !String(body.title).trim()) {
      res.status(400).json({ error: 'শিরোনাম প্রদান করা আবশ্যক।' });
      return;
    }

    const created = createNewLiteraryArticle({
      title: body.title,
      subtitle: body.subtitle,
      category: body.category,
      categoryBn: body.categoryBn,
      authorId: body.authorId,
      authorName: body.authorName,
      authorRole: body.authorRole,
      volumeTitle: body.volumeTitle,
      readTimeBn: body.readTimeBn,
      excerpt: body.excerpt,
      pullQuote: body.pullQuote,
      paragraphs: Array.isArray(body.paragraphs)
        ? body.paragraphs
        : typeof body.content === 'string'
        ? body.content
            .split(/\n+/)
            .map((p: string) => p.trim())
            .filter(Boolean)
        : [],
      citations: Array.isArray(body.citations) ? body.citations : [],
      coverMotif: body.coverMotif,
      customCoverUrl: body.customCoverUrl,
    });

    db.articles = [created, ...db.articles];
    saveDatabase(db);
    res.status(201).json(created);
  });

  app.put('/api/articles/:id', (req, res) => {
    const { id } = req.params;
    const idx = db.articles.findIndex((a) => a.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'লেখাটি পাওয়া যায়নি।' });
      return;
    }
    db.articles[idx] = {
      ...db.articles[idx],
      ...(req.body || {}),
      id,
    };
    saveDatabase(db);
    res.json(db.articles[idx]);
  });

  app.post('/api/articles/:id/like', (req, res) => {
    const { id } = req.params;
    const idx = db.articles.findIndex((a) => a.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'লেখাটি পাওয়া যায়নি।' });
      return;
    }
    db.articles[idx] = {
      ...db.articles[idx],
      likesCount: (db.articles[idx].likesCount || 0) + 1,
    };
    saveDatabase(db);
    res.json(db.articles[idx]);
  });

  app.delete('/api/articles/:id', (req, res) => {
    const { id } = req.params;
    db.articles = db.articles.filter((a) => a.id !== id);
    saveDatabase(db);
    res.json({ success: true, id });
  });

  // Questions (সাহিত্য ও জীবন জিজ্ঞাসা / সাওয়াল-জওয়াব) endpoints
  app.get('/api/questions', (_req, res) => {
    res.json(db.questions);
  });

  app.post('/api/questions', (req, res) => {
    const body = req.body || {};
    if (!body.questionTitle || !body.questionDetail) {
      res.status(400).json({ error: 'প্রশ্নের শিরোনাম এবং বিস্তারিত বিবরণ প্রয়োজন।' });
      return;
    }

    const created = createNewLiteraryQuestion({
      questionTitle: body.questionTitle,
      questionDetail: body.questionDetail,
      askedBy: body.askedBy,
      askedFrom: body.askedFrom,
      topicBn: body.topicBn,
      answerParagraphs: Array.isArray(body.answerParagraphs) ? body.answerParagraphs : undefined,
      answeredBy: body.answeredBy,
      answeredByRole: body.answeredByRole,
      references: Array.isArray(body.references) ? body.references : undefined,
    });

    db.questions = [created, ...db.questions];
    saveDatabase(db);
    res.status(201).json(created);
  });

  app.put('/api/questions/:id/answer', (req, res) => {
    const { id } = req.params;
    const idx = db.questions.findIndex((q) => q.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'প্রশ্নটি পাওয়া যায়নি।' });
      return;
    }
    const body = req.body || {};
    const paragraphs = Array.isArray(body.answerParagraphs)
      ? body.answerParagraphs
      : typeof body.answerText === 'string'
      ? body.answerText
          .split(/\n+/)
          .map((p: string) => p.trim())
          .filter(Boolean)
      : db.questions[idx].answerParagraphs;

    db.questions[idx] = {
      ...db.questions[idx],
      answerParagraphs: paragraphs,
      answeredBy: body.answeredBy || db.questions[idx].answeredBy,
      answeredByRole: body.answeredByRole || db.questions[idx].answeredByRole,
      references: Array.isArray(body.references) ? body.references : db.questions[idx].references,
      status: 'answered',
    };
    saveDatabase(db);
    res.json(db.questions[idx]);
  });

  app.delete('/api/questions/:id', (req, res) => {
    const { id } = req.params;
    db.questions = db.questions.filter((q) => q.id !== id);
    saveDatabase(db);
    res.json({ success: true, id });
  });

  // Anthology Hardcover Book Orders endpoints
  app.get('/api/orders', (_req, res) => {
    res.json(db.orders);
  });

  app.post('/api/orders', (req, res) => {
    const body = req.body || {};
    const orderNumber =
      body.orderNumber || `AF-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: TrackedOrder = {
      id: body.id || `ord_${Date.now()}`,
      uid: body.uid || 'guest_reader',
      orderNumber,
      status: body.status || 'placed',
      recipientName: body.recipientName || body.customerName || 'সম্মানিত পাঠক',
      recipientPhone: body.recipientPhone || body.customerPhone || '',
      destinationCity: body.destinationCity || body.city || 'ঢাকা',
      postalCode: body.postalCode || '1209',
      trackingCode: body.trackingCode || `ESP-${orderNumber.slice(3)}-DHK`,
      courier: body.courier || 'Sahityer Parash Book Courier',
      estimatedDelivery: body.estimatedDelivery || '২৪–৪৮ ঘণ্টা ডেলিভারি',
      primaryProductId: body.primaryProductId || 'food-ajwa-01',
      primaryFinish: body.primaryFinish || 'brass',
      itemsSummary: body.itemsSummary || 'মৌলিক সাহিত্য সংকলন (হার্ডকভার)',
      itemCount: Number(body.itemCount) || 1,
      total: Number(body.total || body.totalBdt) || 320,
      paymentMethod: body.paymentMethod === 'card' ? 'card' : 'cod',
      createdAtLabel: body.createdAtLabel || 'আজ, এইমাত্র',
      updatedAtLabel: body.updatedAtLabel || 'এইমাত্র',
      createdAtMs: Number(body.createdAtMs) || Date.now(),
      source: body.source || 'session',
    };
    db.orders = [newOrder, ...db.orders];
    saveDatabase(db);
    res.status(201).json(newOrder);
  });

  app.put('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const idx = db.orders.findIndex((o) => o.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'অর্ডারটি পাওয়া যায়নি।' });
      return;
    }
    const nextStatus = req.body?.status || db.orders[idx].status;
    db.orders[idx] = {
      ...db.orders[idx],
      status: nextStatus,
      updatedAtLabel: 'এইমাত্র আপডেটকৃত',
    };
    saveDatabase(db);
    res.json(db.orders[idx]);
  });

  app.delete('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    db.orders = db.orders.filter((o) => o.id !== id);
    saveDatabase(db);
    res.json({ success: true, id });
  });


  // Reset database to defaults
  app.post('/api/reset', (_req, res) => {
    db = {
      brand: { ...DEFAULT_LITERARY_BRAND },
      articles: [...INITIAL_LITERARY_ARTICLES],
      volumes: [...INITIAL_ANTHOLOGY_VOLUMES],
      questions: [...INITIAL_LITERARY_QUESTIONS],
      authors: [...LITERARY_AUTHORS],
      categories: [...LITERARY_CATEGORIES],
      orders: [...INITIAL_DEMO_ORDERS],
    };
    saveDatabase(db);
    res.json({
      brand: db.brand,
      articles: db.articles,
      volumes: db.volumes,
      questions: db.questions,
      authors: db.authors,
      categories: db.categories,
      orders: db.orders,
    });
  });

  // Vite middleware for development or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`একটুখানি সাহিত্যের পরশ Server running on http://localhost:${PORT}`);
  });
}

startServer();
