import fs from 'fs';
import path from 'path';
import {
  initialStocks,
  initialSignals,
  initialPlans,
  initialVideos,
  initialFaq,
  initialUsers,
  StockData,
  SignalData,
  PlanData,
  VideoData,
  FaqData,
  UserData,
  JournalEntry,
} from './initialData.ts';

export interface MarketConfig {
  autoUpdateEnabled: boolean;
  intervalSeconds: number;
  lastUpdated: string;
  marketSession: 'Sesi 1' | 'Penutupan' | 'Pra-Pembukaan';
  ihsg: {
    value: number;
    change: number;
    changePercent: number;
  };
  globalIndices: {
    ticker: string;
    value: number;
    changePercent: number;
  }[];
  updateLogs: {
    timestamp: string;
    message: string;
    type: 'tick' | 'session' | 'manual';
  }[];
}

export interface DatabaseSchema {
  stocks: StockData[];
  signals: SignalData[];
  plans: Record<string, PlanData>;
  payment_mode: 'midtrans' | 'transfer' | 'qris';
  videos: VideoData[];
  faq: FaqData[];
  users: UserData[];
  watchlist: Record<string, string[]>; // email -> ticker[]
  journal: JournalEntry[];
  otpCodes: Record<string, { code: string; expires: number }>;
  marketConfig: MarketConfig;
}

const defaultMarketConfig: MarketConfig = {
  autoUpdateEnabled: true,
  intervalSeconds: 6,
  lastUpdated: new Date().toISOString(),
  marketSession: 'Penutupan',
  ihsg: {
    value: 7283.82,
    change: -48.2,
    changePercent: -0.66,
  },
  globalIndices: [
    { ticker: 'IHSG', value: 7283.82, changePercent: -0.66 },
    { ticker: 'LQ45', value: 924.15, changePercent: -0.76 },
    { ticker: 'DOW', value: 43729.34, changePercent: -0.59 },
    { ticker: 'NASDAQ', value: 19269.46, changePercent: 0.09 },
    { ticker: 'NIKKEI', value: 39381.41, changePercent: 0.30 },
    { ticker: 'USD/IDR', value: 15655, changePercent: 0.22 },
  ],
  updateLogs: [
    {
      timestamp: new Date().toISOString(),
      message: 'Sistem Auto-Update BEI diinisialisasi.',
      type: 'manual',
    },
  ],
};

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const ALL_STOCKS_FILE = path.join(DATA_DIR, 'allStocks.json');

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    let stockUniverse = initialStocks;
    if (fs.existsSync(ALL_STOCKS_FILE)) {
      try {
        const allRaw = JSON.parse(fs.readFileSync(ALL_STOCKS_FILE, 'utf-8'));
        if (allRaw.stocks && allRaw.stocks.length >= 900) {
          stockUniverse = allRaw.stocks;
        }
      } catch {}
    }

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const resolvedStocks = (parsed.stocks && parsed.stocks.length >= 900) ? parsed.stocks : stockUniverse;
        return {
          stocks: resolvedStocks,
          signals: parsed.signals || initialSignals,
          plans: parsed.plans || initialPlans,
          payment_mode: parsed.payment_mode || 'transfer',
          videos: parsed.videos || initialVideos,
          faq: parsed.faq || initialFaq,
          users: parsed.users || initialUsers,
          watchlist: parsed.watchlist || {},
          journal: parsed.journal || [],
          otpCodes: {},
          marketConfig: parsed.marketConfig || defaultMarketConfig,
        };
      }
    } catch (e) {
      console.warn('Failed reading db.json, using initial defaults:', e);
    }


    const defaultDb: DatabaseSchema = {
      stocks: initialStocks,
      signals: initialSignals,
      plans: initialPlans,
      payment_mode: 'transfer',
      videos: initialVideos,
      faq: initialFaq,
      users: initialUsers,
      watchlist: {
        'ifanstw32195@gmail.com': ['BBCA', 'BREN', 'ADRO'],
      },
      journal: [
        {
          id: 'JRN-01',
          userEmail: 'ifanstw32195@gmail.com',
          ticker: 'ADRO',
          action: 'BUY',
          date: '2026-11-09',
          price: 3680,
          lots: 30,
          invalidationPrice: 3550,
          targetPrice: 4120,
          status: 'OPEN',
          notes: 'Buy on breakout confirmation, risk 3.5%',
        },
      ],
      otpCodes: {},
      marketConfig: defaultMarketConfig,
    };

    this.saveData(defaultDb);
    return defaultDb;
  }

  private saveData(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving db.json:', err);
    }
  }

  public get(): DatabaseSchema {
    return this.data;
  }

  public update(fn: (draft: DatabaseSchema) => void) {
    fn(this.data);
    this.saveData(this.data);
  }

  public reset() {
    this.data = {
      stocks: initialStocks,
      signals: initialSignals,
      plans: initialPlans,
      payment_mode: 'midtrans',
      videos: initialVideos,
      faq: initialFaq,
      users: initialUsers,
      watchlist: {
        'ifanstw32195@gmail.com': ['BBCA', 'BREN', 'ADRO'],
      },
      journal: [],
      otpCodes: {},
      marketConfig: defaultMarketConfig,
    };
    this.saveData(this.data);
  }
}

export const db = new Database();
