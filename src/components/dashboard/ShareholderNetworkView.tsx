import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { StockData } from '../../types.ts';

interface ShareholderNetworkViewProps {
  stocks: StockData[];
  onSelectStock: (ticker: string) => void;
  onOpenLotCalculator?: (stock: StockData) => void;
  onBackToMarket?: () => void;
}

interface NetworkNode {
  id: string;
  name: string;
  type: 'holder' | 'stock';
  category: 'individual' | 'corporate' | 'institution' | 'custodian';
  group: 1 | 2 | 3;
  color: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  radius: number;
  isCenter?: boolean;
  linksCount: number;
  influenceRank: number;
  bridgingRank: number;
  shares?: string;
  percentage?: number;
  ticker?: string;
  change?: number;
  isNew?: boolean;
}

interface NetworkEdge {
  source: string;
  target: string;
  isDirect?: boolean;
  weight?: number;
}

interface HoldingDetail {
  ticker: string;
  companyName: string;
  type: string;
  percentage: number;
  shares: string;
  changePercent?: number;
  isNew?: boolean;
  logoColor: string;
  logoShape: 'circle-slash' | 'blue-arc' | 'split-circle' | 'up-triangle' | 'star';
  marketValueRp?: number;
}

interface NetworkPreset {
  id: string;
  rootName: string;
  title: string;
  subtitle: string;
  category: 'individual' | 'corporate' | 'institution';
  groupName: string;
  linksCount: number;
  influenceRank: string;
  bridgingRank: string;
  totalNodes: number;
  holdings: HoldingDetail[];
  nodes: NetworkNode[];
  edges: { source: string; target: string; isDirect?: boolean }[];
}

interface BeiFiling {
  id: string;
  ticker: string;
  companyName: string;
  holderName: string;
  type: string;
  previousPercentage: number;
  currentPercentage: number;
  change: number;
  shares: string;
  date: string;
  time: string;
  status: string;
  filingRef: string;
  notes: string;
}

// Initial Preset Networks from BEI
const INITIAL_PRESET_NETWORKS: NetworkPreset[] = [
  {
    id: 'andry_hakim',
    rootName: 'ANDRY HAKIM',
    title: 'ANDRY HAKIM',
    subtitle: 'Individual · Local',
    category: 'individual',
    groupName: 'Group 2',
    linksCount: 26,
    influenceRank: '#1',
    bridgingRank: '#1',
    totalNodes: 27,
    holdings: [
      {
        ticker: 'INPS',
        companyName: 'PT Indah Prakasa Sentosa Tbk',
        type: 'Individual · Local',
        percentage: 10.02,
        shares: '65.1M shares',
        logoColor: '#e11d48',
        logoShape: 'circle-slash',
      },
      {
        ticker: 'CBRE',
        companyName: 'PT Cakra Buana Resources Energi Tbk',
        type: 'Individual · Local',
        percentage: 2.0,
        changePercent: -0.45,
        shares: '90.8M shares',
        logoColor: '#2563eb',
        logoShape: 'blue-arc',
      },
      {
        ticker: 'FLMC',
        companyName: 'PT Falmaco Nonwoven Industri Tbk',
        type: 'Individual · Local',
        percentage: 1.13,
        changePercent: 1.13,
        isNew: true,
        shares: '8.8M shares',
        logoColor: '#1e3a8a',
        logoShape: 'split-circle',
      },
      {
        ticker: 'AIMS',
        companyName: 'PT Akbar Indo Makmur Stimec Tbk',
        type: 'Individual · Local',
        percentage: 1.05,
        changePercent: 1.05,
        isNew: true,
        shares: '2.3M shares',
        logoColor: '#db2777',
        logoShape: 'up-triangle',
      },
    ],
    nodes: [
      { id: 'ANDRY HAKIM', name: 'ANDRY HAKIM', type: 'holder', category: 'individual', group: 2, color: '#e3ac52', radius: 14, isCenter: true, linksCount: 26, influenceRank: 1, bridgingRank: 1 },
      // Group 2 - Blue Nodes (Right arc)
      { id: 'HANS SAPUTRA', name: 'HANS SAPUTRA', type: 'holder', category: 'individual', group: 2, color: '#60a5fa', radius: 6.5, linksCount: 8, influenceRank: 4, bridgingRank: 6 },
      { id: 'WILLY DJUNAYDY KUSNANTO', name: 'WILLY DJUNAYDY KUSNANTO', type: 'holder', category: 'individual', group: 2, color: '#60a5fa', radius: 6.5, linksCount: 11, influenceRank: 3, bridgingRank: 4 },
      { id: 'ROSALINA INDRA WIRAWATI', name: 'ROSALINA INDRA WIRAWATI', type: 'holder', category: 'individual', group: 2, color: '#60a5fa', radius: 6, linksCount: 7, influenceRank: 7, bridgingRank: 8 },
      { id: 'BEN DAVID SIDHARTA TJAHJADI', name: 'BEN DAVID SIDHARTA TJAHJADI', type: 'holder', category: 'individual', group: 2, color: '#60a5fa', radius: 6.5, linksCount: 10, influenceRank: 5, bridgingRank: 5 },
      { id: 'BILLY LINJAYA LESMANA', name: 'BILLY LINJAYA LESMANA', type: 'holder', category: 'individual', group: 2, color: '#60a5fa', radius: 6, linksCount: 6, influenceRank: 8, bridgingRank: 9 },
      { id: 'FALMACO PTE LTD', name: 'FALMACO PTE LTD', type: 'holder', category: 'corporate', group: 2, color: '#60a5fa', radius: 7, linksCount: 12, influenceRank: 2, bridgingRank: 3 },
      { id: 'RAY SUNGADI', name: 'RAY SUNGADI', type: 'holder', category: 'individual', group: 2, color: '#60a5fa', radius: 6, linksCount: 5, influenceRank: 9, bridgingRank: 10 },
      { id: 'THERESIA INDRA WIRAWAN', name: 'THERESIA INDRA WIRAWAN', type: 'holder', category: 'individual', group: 2, color: '#60a5fa', radius: 6, linksCount: 5, influenceRank: 10, bridgingRank: 11 },

      // Group 1 - Gold / Amber Nodes (Left top & bottom)
      { id: 'RENDY HALIM', name: 'RENDY HALIM', type: 'holder', category: 'individual', group: 1, color: '#e3ac52', radius: 6, linksCount: 7, influenceRank: 6, bridgingRank: 7 },
      { id: 'CHANDRA HALIM', name: 'CHANDRA HALIM', type: 'holder', category: 'individual', group: 1, color: '#e3ac52', radius: 6.5, linksCount: 9, influenceRank: 5, bridgingRank: 6 },
      { id: 'PT GRAHA INTI GUNA PERSADA', name: 'PT GRAHA INTI GUNA PERSADA', type: 'holder', category: 'corporate', group: 1, color: '#e3ac52', radius: 6.5, linksCount: 10, influenceRank: 4, bridgingRank: 5 },
      { id: 'REKSA DANA NARADA SAHAM IND...', name: 'REKSA DANA NARADA SAHAM IND...', type: 'holder', category: 'institution', group: 1, color: '#e3ac52', radius: 6, linksCount: 6, influenceRank: 8, bridgingRank: 8 },
      { id: 'PT OMUDAS INVESTMENT HOLDCO', name: 'PT OMUDAS INVESTMENT HOLDCO', type: 'holder', category: 'corporate', group: 1, color: '#e3ac52', radius: 6.5, linksCount: 7, influenceRank: 6, bridgingRank: 7 },
      { id: 'PT REPUBLIK CAPITAL INDONES...', name: 'PT REPUBLIK CAPITAL INDONES...', type: 'holder', category: 'corporate', group: 1, color: '#e3ac52', radius: 6.5, linksCount: 8, influenceRank: 5, bridgingRank: 6 },
      { id: 'MORIENTES', name: 'MORIENTES', type: 'holder', category: 'individual', group: 1, color: '#e3ac52', radius: 5.5, linksCount: 4, influenceRank: 11, bridgingRank: 12 },

      // Group 3 - Cyan / Teal Nodes (Bottom left)
      { id: 'PT AIMS INDO INVESTAMA', name: 'PT AIMS INDO INVESTAMA', type: 'holder', category: 'corporate', group: 3, color: '#2dd4bf', radius: 7.5, linksCount: 14, influenceRank: 2, bridgingRank: 2 },
      { id: 'IR EFENDI LEMAN', name: 'IR EFENDI LEMAN', type: 'holder', category: 'individual', group: 3, color: '#2dd4bf', radius: 6, linksCount: 6, influenceRank: 7, bridgingRank: 8 },
      { id: 'HADI WIJAYA', name: 'HADI WIJAYA', type: 'holder', category: 'individual', group: 3, color: '#2dd4bf', radius: 6, linksCount: 7, influenceRank: 6, bridgingRank: 7 },
      { id: 'CHRIST JONATAN DAELY', name: 'CHRIST JONATAN DAELY', type: 'holder', category: 'individual', group: 3, color: '#2dd4bf', radius: 6, linksCount: 5, influenceRank: 9, bridgingRank: 10 },
      { id: 'ANTHONY SETIADI', name: 'ANTHONY SETIADI', type: 'holder', category: 'individual', group: 3, color: '#2dd4bf', radius: 6, linksCount: 6, influenceRank: 8, bridgingRank: 9 },

      // Stock Nodes (shown when mode === 'all')
      { id: 'INPS', name: 'INPS', ticker: 'INPS', type: 'stock', category: 'corporate', group: 2, color: '#f43f5e', radius: 10, linksCount: 5, influenceRank: 3, bridgingRank: 3, percentage: 10.02 },
      { id: 'CBRE', name: 'CBRE', ticker: 'CBRE', type: 'stock', category: 'corporate', group: 2, color: '#3b82f6', radius: 9, linksCount: 6, influenceRank: 4, bridgingRank: 4, percentage: 2.0 },
      { id: 'FLMC', name: 'FLMC', ticker: 'FLMC', type: 'stock', category: 'corporate', group: 2, color: '#1d4ed8', radius: 8.5, linksCount: 4, influenceRank: 5, bridgingRank: 5, percentage: 1.13, isNew: true },
      { id: 'AIMS', name: 'AIMS', ticker: 'AIMS', type: 'stock', category: 'corporate', group: 3, color: '#ec4899', radius: 8.5, linksCount: 5, influenceRank: 5, bridgingRank: 5, percentage: 1.05, isNew: true },
    ],
    edges: [
      { source: 'ANDRY HAKIM', target: 'HANS SAPUTRA', isDirect: true },
      { source: 'ANDRY HAKIM', target: 'WILLY DJUNAYDY KUSNANTO', isDirect: true },
      { source: 'ANDRY HAKIM', target: 'ROSALINA INDRA WIRAWATI', isDirect: true },
      { source: 'ANDRY HAKIM', target: 'BEN DAVID SIDHARTA TJAHJADI', isDirect: true },
      { source: 'ANDRY HAKIM', target: 'BILLY LINJAYA LESMANA', isDirect: true },
      { source: 'ANDRY HAKIM', target: 'FALMACO PTE LTD', isDirect: true },
      { source: 'ANDRY HAKIM', target: 'RAY SUNGADI', isDirect: true },
      { source: 'ANDRY HAKIM', target: 'THERESIA INDRA WIRAWAN', isDirect: true },
      { source: 'ANDRY HAKIM', target: 'RENDY HALIM', isDirect: true },
      { source: 'ANDRY HAKIM', target: 'CHANDRA HALIM', isDirect: true },
      { source: 'ANDRY HAKIM', target: 'PT GRAHA INTI GUNA PERSADA', isDirect: true },
      { source: 'ANDRY HAKIM', target: 'PT AIMS INDO INVESTAMA', isDirect: true },
      { source: 'ANDRY HAKIM', target: 'PT OMUDAS INVESTMENT HOLDCO', isDirect: true },
      { source: 'ANDRY HAKIM', target: 'PT REPUBLIK CAPITAL INDONES...', isDirect: true },
      { source: 'ANDRY HAKIM', target: 'MORIENTES', isDirect: true },

      { source: 'HANS SAPUTRA', target: 'WILLY DJUNAYDY KUSNANTO' },
      { source: 'WILLY DJUNAYDY KUSNANTO', target: 'ROSALINA INDRA WIRAWATI' },
      { source: 'WILLY DJUNAYDY KUSNANTO', target: 'BEN DAVID SIDHARTA TJAHJADI' },
      { source: 'BEN DAVID SIDHARTA TJAHJADI', target: 'BILLY LINJAYA LESMANA' },
      { source: 'BEN DAVID SIDHARTA TJAHJADI', target: 'FALMACO PTE LTD' },
      { source: 'FALMACO PTE LTD', target: 'RAY SUNGADI' },
      { source: 'RAY SUNGADI', target: 'THERESIA INDRA WIRAWAN' },
      { source: 'FALMACO PTE LTD', target: 'WILLY DJUNAYDY KUSNANTO' },

      { source: 'RENDY HALIM', target: 'CHANDRA HALIM' },
      { source: 'CHANDRA HALIM', target: 'PT GRAHA INTI GUNA PERSADA' },
      { source: 'CHANDRA HALIM', target: 'REKSA DANA NARADA SAHAM IND...' },
      { source: 'PT GRAHA INTI GUNA PERSADA', target: 'RENDY HALIM' },
      { source: 'PT OMUDAS INVESTMENT HOLDCO', target: 'PT REPUBLIK CAPITAL INDONES...' },
      { source: 'PT REPUBLIK CAPITAL INDONES...', target: 'MORIENTES' },

      { source: 'PT AIMS INDO INVESTAMA', target: 'IR EFENDI LEMAN' },
      { source: 'PT AIMS INDO INVESTAMA', target: 'HADI WIJAYA' },
      { source: 'HADI WIJAYA', target: 'CHRIST JONATAN DAELY' },
      { source: 'CHRIST JONATAN DAELY', target: 'ANTHONY SETIADI' },
      { source: 'IR EFENDI LEMAN', target: 'HADI WIJAYA' },

      { source: 'ANDRY HAKIM', target: 'INPS', isDirect: true },
      { source: 'ANDRY HAKIM', target: 'CBRE', isDirect: true },
      { source: 'ANDRY HAKIM', target: 'FLMC', isDirect: true },
      { source: 'ANDRY HAKIM', target: 'AIMS', isDirect: true },
      { source: 'FALMACO PTE LTD', target: 'FLMC' },
      { source: 'PT AIMS INDO INVESTAMA', target: 'AIMS' },
    ],
  },
  {
    id: 'prajogo_pangestu',
    rootName: 'PRAJOGO PANGESTU',
    title: 'PRAJOGO PANGESTU / BARITO',
    subtitle: 'Pengendali Barito Pacific Group',
    category: 'individual',
    groupName: 'Barito Core',
    linksCount: 38,
    influenceRank: '#1',
    bridgingRank: '#1',
    totalNodes: 42,
    holdings: [
      { ticker: 'BREN', companyName: 'PT Barito Renewables Energy Tbk', type: 'Ultimate Shareholder', percentage: 46.2, shares: '61.8B shares', logoColor: '#059669', logoShape: 'up-triangle' },
      { ticker: 'BRPT', companyName: 'PT Barito Pacific Tbk', type: 'Pengendali Utama', percentage: 71.19, shares: '66.7B shares', logoColor: '#0284c7', logoShape: 'split-circle' },
      { ticker: 'CUAN', companyName: 'PT Petrindo Jaya Kreasi Tbk', type: 'Pengendali Utama', percentage: 85.07, shares: '9.5B shares', logoColor: '#d97706', logoShape: 'star' },
      { ticker: 'TPIA', companyName: 'PT Chandra Asri Pacific Tbk', type: 'Afiliasi / Induk', percentage: 34.63, shares: '29.9B shares', logoColor: '#7c3aed', logoShape: 'circle-slash' },
      { ticker: 'PTRO', companyName: 'PT Petrosea Tbk', type: 'Grup Petrindo / Barito', percentage: 34.0, shares: '342.8M shares', logoColor: '#ea580c', logoShape: 'blue-arc' },
    ],
    nodes: [
      { id: 'PRAJOGO PANGESTU', name: 'PRAJOGO PANGESTU', type: 'holder', category: 'individual', group: 1, color: '#e3ac52', radius: 15, isCenter: true, linksCount: 38, influenceRank: 1, bridgingRank: 1 },
      { id: 'PT BARITO PACIFIC TBK', name: 'PT BARITO PACIFIC TBK', type: 'holder', category: 'corporate', group: 1, color: '#60a5fa', radius: 9, linksCount: 22, influenceRank: 2, bridgingRank: 2 },
      { id: 'STAR ENERGY GROUP HOLDINGS', name: 'STAR ENERGY GROUP', type: 'holder', category: 'corporate', group: 1, color: '#60a5fa', radius: 8, linksCount: 14, influenceRank: 3, bridgingRank: 3 },
      { id: 'GREEN ERA ENERGY PTE LTD', name: 'GREEN ERA ENERGY PTE', type: 'holder', category: 'corporate', group: 2, color: '#2dd4bf', radius: 7.5, linksCount: 10, influenceRank: 4, bridgingRank: 4 },
      { id: 'PT KREASI ENERGI ALAM', name: 'PT KREASI ENERGI ALAM', type: 'holder', category: 'corporate', group: 2, color: '#2dd4bf', radius: 7, linksCount: 8, influenceRank: 5, bridgingRank: 5 },
      { id: 'SCG CHEMICALS PUBLIC CO', name: 'SCG CHEMICALS', type: 'holder', category: 'institution', group: 3, color: '#e3ac52', radius: 7, linksCount: 9, influenceRank: 6, bridgingRank: 6 },
      { id: 'BREN', name: 'BREN', ticker: 'BREN', type: 'stock', category: 'corporate', group: 1, color: '#059669', radius: 10, linksCount: 8, influenceRank: 2, bridgingRank: 2, percentage: 46.2 },
      { id: 'BRPT', name: 'BRPT', ticker: 'BRPT', type: 'stock', category: 'corporate', group: 1, color: '#0284c7', radius: 10, linksCount: 9, influenceRank: 2, bridgingRank: 2, percentage: 71.19 },
      { id: 'CUAN', name: 'CUAN', ticker: 'CUAN', type: 'stock', category: 'corporate', group: 2, color: '#d97706', radius: 9, linksCount: 7, influenceRank: 3, bridgingRank: 3, percentage: 85.07 },
      { id: 'TPIA', name: 'TPIA', ticker: 'TPIA', type: 'stock', category: 'corporate', group: 3, color: '#7c3aed', radius: 9, linksCount: 6, influenceRank: 4, bridgingRank: 4, percentage: 34.63 },
    ],
    edges: [
      { source: 'PRAJOGO PANGESTU', target: 'PT BARITO PACIFIC TBK', isDirect: true },
      { source: 'PRAJOGO PANGESTU', target: 'BREN', isDirect: true },
      { source: 'PRAJOGO PANGESTU', target: 'BRPT', isDirect: true },
      { source: 'PRAJOGO PANGESTU', target: 'CUAN', isDirect: true },
      { source: 'PRAJOGO PANGESTU', target: 'GREEN ERA ENERGY PTE LTD', isDirect: true },
      { source: 'PT BARITO PACIFIC TBK', target: 'BREN' },
      { source: 'PT BARITO PACIFIC TBK', target: 'TPIA' },
      { source: 'STAR ENERGY GROUP HOLDINGS', target: 'BREN' },
      { source: 'SCG CHEMICALS PUBLIC CO', target: 'TPIA' },
    ],
  },
  {
    id: 'lo_kheng_hong',
    rootName: 'LO KHENG HONG',
    title: 'LO KHENG HONG (LKH)',
    subtitle: 'Individual · Value Investor Legendaris',
    category: 'individual',
    groupName: 'LKH Portfolio Network',
    linksCount: 18,
    influenceRank: '#1',
    bridgingRank: '#1',
    totalNodes: 19,
    holdings: [
      { ticker: 'DILD', companyName: 'PT Intiland Development Tbk', type: 'Individual · Local', percentage: 6.62, shares: '686.4M shares', logoColor: '#0284c7', logoShape: 'up-triangle' },
      { ticker: 'BMTR', companyName: 'PT Global Mediacom Tbk', type: 'Individual · Local', percentage: 6.53, shares: '1.08B shares', logoColor: '#ea580c', logoShape: 'blue-arc' },
      { ticker: 'ABMM', companyName: 'PT ABM Investama Tbk', type: 'Individual · Local', percentage: 5.01, shares: '137.9M shares', logoColor: '#059669', logoShape: 'split-circle' },
      { ticker: 'GJTL', companyName: 'PT Gajah Tunggal Tbk', type: 'Individual · Local', percentage: 5.06, shares: '176.4M shares', logoColor: '#dc2626', logoShape: 'circle-slash' },
      { ticker: 'CFIN', companyName: 'PT Clipan Finance Indonesia Tbk', type: 'Individual · Local', percentage: 5.12, shares: '203.9M shares', logoColor: '#7c3aed', logoShape: 'star' },
    ],
    nodes: [
      { id: 'LO KHENG HONG', name: 'LO KHENG HONG', type: 'holder', category: 'individual', group: 1, color: '#e3ac52', radius: 14, isCenter: true, linksCount: 18, influenceRank: 1, bridgingRank: 1 },
      { id: 'DILD', name: 'DILD', ticker: 'DILD', type: 'stock', category: 'corporate', group: 1, color: '#0284c7', radius: 9, linksCount: 4, influenceRank: 2, bridgingRank: 2, percentage: 6.62 },
      { id: 'BMTR', name: 'BMTR', ticker: 'BMTR', type: 'stock', category: 'corporate', group: 2, color: '#ea580c', radius: 9, linksCount: 5, influenceRank: 2, bridgingRank: 2, percentage: 6.53 },
      { id: 'ABMM', name: 'ABMM', ticker: 'ABMM', type: 'stock', category: 'corporate', group: 2, color: '#059669', radius: 9, linksCount: 4, influenceRank: 3, bridgingRank: 3, percentage: 5.01 },
      { id: 'GJTL', name: 'GJTL', ticker: 'GJTL', type: 'stock', category: 'corporate', group: 3, color: '#dc2626', radius: 9, linksCount: 4, influenceRank: 3, bridgingRank: 3, percentage: 5.06 },
      { id: 'CFIN', name: 'CFIN', ticker: 'CFIN', type: 'stock', category: 'corporate', group: 3, color: '#7c3aed', radius: 9, linksCount: 4, influenceRank: 4, bridgingRank: 4, percentage: 5.12 },
    ],
    edges: [
      { source: 'LO KHENG HONG', target: 'DILD', isDirect: true },
      { source: 'LO KHENG HONG', target: 'BMTR', isDirect: true },
      { source: 'LO KHENG HONG', target: 'ABMM', isDirect: true },
      { source: 'LO KHENG HONG', target: 'GJTL', isDirect: true },
      { source: 'LO KHENG HONG', target: 'CFIN', isDirect: true },
    ],
  },
];

export const ShareholderNetworkView: React.FC<ShareholderNetworkViewProps> = ({
  stocks,
  onSelectStock,
  onOpenLotCalculator,
  onBackToMarket,
}) => {
  // Preset list with dynamic BEI data merger
  const [networkPresets, setNetworkPresets] = useState<NetworkPreset[]>(INITIAL_PRESET_NETWORKS);
  const [activePresetId, setActivePresetId] = useState<string>('andry_hakim');
  const [viewMode, setViewMode] = useState<'holders_only' | 'all'>('holders_only');
  const [depth, setDepth] = useState<number>(1);
  const [activeCategories, setActiveCategories] = useState<{
    individual: boolean;
    corporate: boolean;
    institution: boolean;
    custodian: boolean;
  }>({
    individual: true,
    corporate: true,
    institution: true,
    custodian: true,
  });

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState<boolean>(false);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<'all' | 1 | 2 | 3>('all');
  const [displayMenuOpen, setDisplayMenuOpen] = useState<boolean>(false);
  const [groupMenuOpen, setGroupMenuOpen] = useState<boolean>(false);

  // Display Options
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showMeshLines, setShowMeshLines] = useState<boolean>(true);
  const [physicsActive, setPhysicsActive] = useState<boolean>(true);

  // Selected Node for Right Side Inspection Panel
  const [selectedNodeId, setSelectedNodeId] = useState<string>('ANDRY HAKIM');
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(true);

  // Real-time BEI Auto-Sync Engine State
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [recentFilings, setRecentFilings] = useState<BeiFiling[]>([]);
  const [filingsModalOpen, setFilingsModalOpen] = useState<boolean>(false);
  const [newUpdateBanner, setNewUpdateBanner] = useState<{
    message: string;
    ticker: string;
    holder: string;
    timestamp: string;
  } | null>(null);

  // SVG Canvas Transform (Pan & Zoom)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // Tooltip
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dynamic coordinates layout generator
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});

  const activePreset = useMemo(() => {
    return networkPresets.find((p) => p.id === activePresetId) || networkPresets[0];
  }, [networkPresets, activePresetId]);

  // Synchronize with BEI Live Feed & auto-add changes
  const fetchBeiShareholderFeed = useCallback(async () => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/shareholder-network/feed');
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.recentFilings)) {
          setRecentFilings(data.recentFilings);
          setLastSyncTime(data.serverTime || new Date().toLocaleTimeString('id-ID'));

          // Check if there are newly filed records that apply to the active preset
          const latestFiling = data.recentFilings[0] as BeiFiling | undefined;
          if (latestFiling) {
            setNetworkPresets((prevPresets) => {
              return prevPresets.map((preset) => {
                // If filing matches this preset's root holder
                if (
                  latestFiling.holderName.toLowerCase() === preset.rootName.toLowerCase() ||
                  preset.rootName.toLowerCase().includes(latestFiling.holderName.toLowerCase())
                ) {
                  const existingHolding = preset.holdings.find((h) => h.ticker === latestFiling.ticker);
                  const isAlreadyIn = !!existingHolding;

                  // If not yet in holdings or percentage changed, automatically integrate
                  if (!isAlreadyIn || existingHolding.percentage !== latestFiling.currentPercentage) {
                    const updatedHoldings = isAlreadyIn
                      ? preset.holdings.map((h) =>
                          h.ticker === latestFiling.ticker
                            ? {
                                ...h,
                                percentage: latestFiling.currentPercentage,
                                changePercent: latestFiling.change,
                                shares: `${latestFiling.shares} shares`,
                                isNew: !isAlreadyIn || latestFiling.type === 'PENAMBAHAN',
                              }
                            : h
                        )
                      : [
                          ...preset.holdings,
                          {
                            ticker: latestFiling.ticker,
                            companyName: latestFiling.companyName,
                            type: 'Individual · Local',
                            percentage: latestFiling.currentPercentage,
                            changePercent: latestFiling.change,
                            shares: `${latestFiling.shares} shares`,
                            isNew: true,
                            logoColor: '#3b82f6',
                            logoShape: 'split-circle' as const,
                          },
                        ];

                    // Also ensure stock node exists
                    const hasStockNode = preset.nodes.some((n) => n.id === latestFiling.ticker);
                    const updatedNodes = hasStockNode
                      ? preset.nodes.map((n) =>
                          n.id === latestFiling.ticker
                            ? { ...n, percentage: latestFiling.currentPercentage, isNew: true }
                            : n
                        )
                      : [
                          ...preset.nodes,
                          {
                            id: latestFiling.ticker,
                            name: latestFiling.ticker,
                            ticker: latestFiling.ticker,
                            type: 'stock' as const,
                            category: 'corporate' as const,
                            group: 2 as const,
                            color: '#3b82f6',
                            radius: 9,
                            linksCount: 4,
                            influenceRank: 3,
                            bridgingRank: 3,
                            percentage: latestFiling.currentPercentage,
                            isNew: true,
                          },
                        ];

                    const hasEdge = preset.edges.some(
                      (e) =>
                        (e.source === preset.rootName && e.target === latestFiling.ticker) ||
                        (e.target === preset.rootName && e.source === latestFiling.ticker)
                    );

                    const updatedEdges = hasEdge
                      ? preset.edges
                      : [
                          ...preset.edges,
                          { source: preset.rootName, target: latestFiling.ticker, isDirect: true },
                        ];

                    // Assign position for new node if not yet assigned
                    setNodePositions((pos) => {
                      if (!pos[latestFiling.ticker]) {
                        return {
                          ...pos,
                          [latestFiling.ticker]: {
                            x: 380 + (Math.random() - 0.5) * 260,
                            y: 330 + (Math.random() - 0.5) * 260,
                          },
                        };
                      }
                      return pos;
                    });

                    // Trigger toast notification
                    setNewUpdateBanner({
                      message: `⚡ Terdeteksi Perubahan BEI: ${latestFiling.holderName} ${latestFiling.type} di ${latestFiling.ticker} (${latestFiling.change >= 0 ? '+' : ''}${latestFiling.change}%) - Otomatis Ditambahkan ke Grafik!`,
                      ticker: latestFiling.ticker,
                      holder: latestFiling.holderName,
                      timestamp: latestFiling.time,
                    });

                    return {
                      ...preset,
                      holdings: updatedHoldings,
                      nodes: updatedNodes,
                      edges: updatedEdges,
                      linksCount: preset.linksCount + (!isAlreadyIn ? 1 : 0),
                    };
                  }
                }
                return preset;
              });
            });
          }
        }
      }
    } catch {
      // Keep existing data
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Ingest any changes directly from `stocks` (realtime BEI tick)
  useEffect(() => {
    if (!stocks || stocks.length === 0) return;

    setNetworkPresets((prevPresets) => {
      let anyChange = false;
      const updated = prevPresets.map((preset) => {
        // Match holdings prices & percentages from live stocks
        const updatedHoldings = preset.holdings.map((h) => {
          const liveStock = stocks.find((s) => s.ticker === h.ticker);
          if (liveStock) {
            // Check if liveStock has updated shareholder records for this holder
            const matchSh = liveStock.shareholders.find(
              (sh) =>
                sh.name.toLowerCase().includes(preset.rootName.toLowerCase()) ||
                preset.rootName.toLowerCase().includes(sh.name.toLowerCase())
            );

            if (matchSh && Math.abs(matchSh.percentage - h.percentage) > 0.001) {
              anyChange = true;
              return {
                ...h,
                percentage: matchSh.percentage,
                marketValueRp: liveStock.price * 1000000,
              };
            }
          }
          return h;
        });

        // Also check if any stock has newly reported this holder in its >1% / >5% shareholders list
        stocks.forEach((stk) => {
          const matchingHolder = stk.shareholders.find(
            (sh) =>
              sh.name.toLowerCase() === preset.rootName.toLowerCase() ||
              (preset.rootName.length > 5 && sh.name.toLowerCase().includes(preset.rootName.toLowerCase()))
          );

          if (matchingHolder && !updatedHoldings.some((h) => h.ticker === stk.ticker)) {
            // New holding found from BEI live stocks!
            anyChange = true;
            updatedHoldings.push({
              ticker: stk.ticker,
              companyName: stk.name,
              type: 'Individual · Local',
              percentage: matchingHolder.percentage,
              shares: 'Terkonfirmasi KSEI',
              changePercent: matchingHolder.percentage,
              isNew: true,
              logoColor: '#2563eb',
              logoShape: 'split-circle',
            });
          }
        });

        return { ...preset, holdings: updatedHoldings };
      });

      return anyChange ? updated : prevPresets;
    });
  }, [stocks]);

  // Initial and recurring BEI background feed poll (every 18 seconds)
  useEffect(() => {
    fetchBeiShareholderFeed();
    if (!autoSyncEnabled) return;
    const interval = setInterval(fetchBeiShareholderFeed, 18000);
    return () => clearInterval(interval);
  }, [autoSyncEnabled, fetchBeiShareholderFeed]);

  // Initialize node layout with high-fidelity positioning matching the screenshot
  useEffect(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const centerX = 380;
    const centerY = 330;

    // Center node
    positions[activePreset.rootName] = { x: centerX, y: centerY };

    // Group 2 Nodes (Blue cluster - upper right & right side)
    const g2Nodes = activePreset.nodes.filter((n) => n.group === 2 && !n.isCenter);
    const g2Angles = [-75, -55, -35, -15, 0, 15, 30, 45, 60];
    g2Nodes.forEach((n, idx) => {
      const angleDeg = g2Angles[idx % g2Angles.length];
      const rad = (angleDeg * Math.PI) / 180;
      const dist = 160 + (idx % 3) * 35;
      positions[n.id] = {
        x: centerX + Math.cos(rad) * dist + 40,
        y: centerY + Math.sin(rad) * dist - 30,
      };
    });

    // Group 1 Nodes (Gold cluster - upper left & bottom center)
    const g1Nodes = activePreset.nodes.filter((n) => n.group === 1 && !n.isCenter);
    const g1Angles = [-150, -135, -115, -95, 80, 95, 110];
    g1Nodes.forEach((n, idx) => {
      const angleDeg = g1Angles[idx % g1Angles.length];
      const rad = (angleDeg * Math.PI) / 180;
      const dist = idx < 4 ? 170 + (idx % 2) * 40 : 130 + (idx % 2) * 30;
      positions[n.id] = {
        x: centerX + Math.cos(rad) * dist - 30,
        y: centerY + Math.sin(rad) * dist,
      };
    });

    // Group 3 Nodes (Cyan cluster - lower left)
    const g3Nodes = activePreset.nodes.filter((n) => n.group === 3 && !n.isCenter);
    const g3Angles = [-170, 165, 145, 130, 115];
    g3Nodes.forEach((n, idx) => {
      const angleDeg = g3Angles[idx % g3Angles.length];
      const rad = (angleDeg * Math.PI) / 180;
      const dist = 110 + (idx % 3) * 30;
      positions[n.id] = {
        x: centerX + Math.cos(rad) * dist - 40,
        y: centerY + Math.sin(rad) * dist + 20,
      };
    });

    setNodePositions(positions);
    setSelectedNodeId(activePreset.rootName);
  }, [activePresetId, activePreset.rootName]);

  // Physics drift animation when physicsActive is true
  useEffect(() => {
    if (!physicsActive) return;
    const interval = setInterval(() => {
      setNodePositions((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          if (key === activePreset.rootName || key === draggedNodeId) return;
          const curr = next[key];
          if (!curr) return;
          const driftX = (Math.random() - 0.5) * 0.4;
          const driftY = (Math.random() - 0.5) * 0.4;
          next[key] = { x: curr.x + driftX, y: curr.y + driftY };
        });
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [physicsActive, activePreset.rootName, draggedNodeId]);

  // Dynamically discover all unique shareholders across all 900+ BEI stocks for instant universal search
  const universalBeiShareholders = useMemo(() => {
    const map = new Map<string, { name: string; tickers: string[]; totalStake: number }>();
    stocks.forEach((s) => {
      s.shareholders.forEach((sh) => {
        const cleanName = sh.name.trim();
        if (cleanName.length < 3 || cleanName.toLowerCase().includes('masyarakat') || cleanName.toLowerCase().includes('publik')) {
          return;
        }
        const existing = map.get(cleanName.toUpperCase());
        if (existing) {
          if (!existing.tickers.includes(s.ticker)) existing.tickers.push(s.ticker);
          existing.totalStake += sh.percentage;
        } else {
          map.set(cleanName.toUpperCase(), {
            name: cleanName,
            tickers: [s.ticker],
            totalStake: sh.percentage,
          });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => b.tickers.length - a.tickers.length);
  }, [stocks]);

  // Dynamically build a custom network when a user searches and selects any shareholder in the BEI universe
  const handleSelectUniversalShareholder = (shName: string) => {
    const clean = shName.toUpperCase();
    const existing = networkPresets.find((p) => p.rootName.toUpperCase() === clean);
    if (existing) {
      setActivePresetId(existing.id);
      setSelectedNodeId(existing.rootName);
      setSearchQuery('');
      setSearchDropdownOpen(false);
      return;
    }

    // Find all companies owned by this shareholder
    const holdingsFound: HoldingDetail[] = [];
    stocks.forEach((s) => {
      const match = s.shareholders.find((sh) => sh.name.toUpperCase() === clean);
      if (match) {
        holdingsFound.push({
          ticker: s.ticker,
          companyName: s.name,
          type: 'Individual / Institusi',
          percentage: match.percentage,
          shares: 'Kepemilikan Efek BEI',
          logoColor: '#3b82f6',
          logoShape: 'split-circle',
        });
      }
    });

    if (holdingsFound.length > 0) {
      const dynamicPresetId = `dyn_${Date.now()}`;
      const newPreset: NetworkPreset = {
        id: dynamicPresetId,
        rootName: shName,
        title: shName.length > 25 ? `${shName.slice(0, 23)}...` : shName,
        subtitle: 'Pemegang Saham Terdaftar BEI',
        category: 'individual',
        groupName: 'Jaringan Terdeteksi BEI',
        linksCount: holdingsFound.length * 3,
        influenceRank: '#1',
        bridgingRank: '#1',
        totalNodes: holdingsFound.length + 1,
        holdings: holdingsFound,
        nodes: [
          {
            id: shName,
            name: shName,
            type: 'holder',
            category: 'individual',
            group: 2,
            color: '#e3ac52',
            radius: 14,
            isCenter: true,
            linksCount: holdingsFound.length * 3,
            influenceRank: 1,
            bridgingRank: 1,
          },
          ...holdingsFound.map((h, idx) => ({
            id: h.ticker,
            name: h.ticker,
            ticker: h.ticker,
            type: 'stock' as const,
            category: 'corporate' as const,
            group: ((idx % 3) + 1) as 1 | 2 | 3,
            color: idx % 2 === 0 ? '#60a5fa' : '#2dd4bf',
            radius: 9,
            linksCount: 3,
            influenceRank: 2,
            bridgingRank: 2,
            percentage: h.percentage,
          })),
        ],
        edges: holdingsFound.map((h) => ({
          source: shName,
          target: h.ticker,
          isDirect: true,
        })),
      };

      setNetworkPresets((prev) => [newPreset, ...prev]);
      setActivePresetId(dynamicPresetId);
      setSelectedNodeId(shName);
      setSearchQuery('');
      setSearchDropdownOpen(false);
      setNewUpdateBanner({
        message: `🌐 Jaringan Pemegang Saham "${shName}" Berhasil Dibuat dari Data BEI! (${holdingsFound.length} emiten terhubung)`,
        ticker: holdingsFound[0].ticker,
        holder: shName,
        timestamp: new Date().toLocaleTimeString('id-ID'),
      });
    }
  };

  // Filtered nodes
  const visibleNodes = useMemo(() => {
    return activePreset.nodes.filter((node) => {
      // View mode filter: if 'holders_only', omit stock nodes
      if (viewMode === 'holders_only' && node.type === 'stock') {
        return false;
      }
      // Group filter
      if (selectedGroupFilter !== 'all' && node.group !== selectedGroupFilter) {
        return false;
      }
      // Category filter
      if (!activeCategories[node.category]) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return node.name.toLowerCase().includes(q) || (node.ticker && node.ticker.toLowerCase().includes(q));
      }
      return true;
    });
  }, [activePreset, viewMode, selectedGroupFilter, activeCategories, searchQuery]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);

  // Filtered edges
  const visibleEdges = useMemo(() => {
    return activePreset.edges.filter((e) => {
      if (!visibleNodeIds.has(e.source) || !visibleNodeIds.has(e.target)) return false;
      if (!showMeshLines && !e.isDirect) return false;
      return true;
    });
  }, [activePreset, visibleNodeIds, showMeshLines]);

  // Current selected node details
  const inspectedNode = useMemo(() => {
    return activePreset.nodes.find((n) => n.id === selectedNodeId) || activePreset.nodes[0];
  }, [activePreset, selectedNodeId]);

  // Pan & Zoom handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.min(Math.max(z * zoomFactor, 0.4), 3.0));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggedNodeId) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId) {
      const svg = e.currentTarget.getBoundingClientRect();
      const clientX = e.clientX - svg.left;
      const clientY = e.clientY - svg.top;
      const svgX = (clientX - pan.x) / zoom;
      const svgY = (clientY - pan.y) / zoom;
      setNodePositions((prev) => ({
        ...prev,
        [draggedNodeId]: { x: svgX, y: svgY },
      }));
      return;
    }
    if (!isPanning) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNodeId(activePreset.rootName);
    setSelectedGroupFilter('all');
  };

  const toggleCategory = (cat: 'individual' | 'corporate' | 'institution' | 'custodian') => {
    setActiveCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  return (
    <div className="space-y-3.5 select-none font-sans">
      {/* ========================================================
          1. TOP MAIN CONTROL BAR (Matching screenshot exactly)
         ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0f171b] border border-[#22323a] text-[#f3eee4] shadow-2xl">
        {/* Left: Title + Mode Toggle (Holders & stocks | Holders only) */}
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span>Shareholder Network</span>
          </h2>

          {/* Mode Switcher */}
          <div className="inline-flex items-center p-1 rounded-xl bg-[#162329] border border-[#2b3c44] text-xs">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              Holders & stocks
            </button>
            <button
              onClick={() => setViewMode('holders_only')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'holders_only'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              Holders only
            </button>
          </div>
        </div>

        {/* Center: Search Bar with Universal BEI Shareholder Discovery */}
        <div className="relative flex-1 max-w-xs min-w-[200px]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#162329] border border-[#2b3c44] text-xs text-[#cbd5e1] focus-within:border-blue-500 transition-colors">
            <span className="text-[#64748b]">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchDropdownOpen(true)}
              placeholder="Cari pemegang saham atau emiten..."
              className="bg-transparent border-none outline-none w-full text-xs text-white placeholder-[#64748b]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#64748b] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Autocomplete Suggestions Dropdown from BEI Universe */}
          {searchDropdownOpen && (
            <div
              className="absolute left-0 right-0 top-full mt-1.5 rounded-xl bg-[#162329] border border-[#2b3c44] shadow-2xl py-1.5 z-50 text-xs max-h-72 overflow-y-auto divide-y divide-[#263740]"
              onMouseLeave={() => setSearchDropdownOpen(false)}
            >
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#64748b] flex items-center justify-between">
                <span>Jaringan Pemegang Saham BEI</span>
                <span className="text-emerald-400 font-mono">Live BEI Data</span>
              </div>

              {/* Active preset matching */}
              <div className="py-1">
                {networkPresets
                  .filter((p) => !searchQuery || p.rootName.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActivePresetId(p.id);
                        setSelectedNodeId(p.rootName);
                        setSearchQuery('');
                        setSearchDropdownOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#20313a] cursor-pointer"
                    >
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <span className="text-amber-400">★</span>
                        <span>{p.rootName}</span>
                      </span>
                      <span className="text-[10px] text-blue-400 font-mono font-bold">
                        {p.holdings.length} Emiten
                      </span>
                    </button>
                  ))}
              </div>

              {/* Universal BEI Shareholder matches across all 900+ stocks */}
              <div className="py-1">
                <div className="px-3 py-0.5 text-[9.5px] uppercase font-semibold text-[#80887f]">
                  Daftar Pemegang Saham Seluruh Emiten BEI:
                </div>
                {universalBeiShareholders
                  .filter((sh) => !searchQuery || sh.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice(0, 10)
                  .map((sh, idx) => (
                    <button
                      key={`${sh.name}-${idx}`}
                      onClick={() => handleSelectUniversalShareholder(sh.name)}
                      className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#20313a] cursor-pointer"
                    >
                      <div className="truncate mr-2">
                        <b className="text-white block truncate">{sh.name}</b>
                        <span className="text-[10px] text-[#94a3b8] font-mono">
                          {sh.tickers.join(', ')}
                        </span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold font-mono flex-none">
                        + Buka Graf
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Depth & Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Depth Selector: 1 2 3 4 */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#94a3b8] text-[11px] font-semibold mr-0.5">Depth</span>
            {[1, 2, 3, 4].map((d) => (
              <button
                key={d}
                onClick={() => setDepth(d)}
                className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs transition-colors cursor-pointer ${
                  depth === d
                    ? 'bg-blue-600 text-white'
                    : 'text-[#94a3b8] hover:bg-[#1a2b33]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-[#2b3c44] mx-1 hidden sm:block" />

          {/* Category Chips: Individuals, Corporates, Institutions, Custodians */}
          <div className="flex items-center gap-1.5">
            {[
              { key: 'individual' as const, label: 'Individuals' },
              { key: 'corporate' as const, label: 'Corporates' },
              { key: 'institution' as const, label: 'Institutions' },
              { key: 'custodian' as const, label: 'Custodians' },
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => toggleCategory(cat.key)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  activeCategories[cat.key]
                    ? 'bg-[#1e3a5f]/40 border-blue-500/60 text-blue-300'
                    : 'bg-transparent border-[#2b3c44] text-[#64748b] hover:border-[#3d525c]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Display Settings Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDisplayMenuOpen(!displayMenuOpen)}
              className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#162329] border border-[#2b3c44] text-[#cbd5e1] hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>⚙ Display</span>
              <span className="text-[10px]">▾</span>
            </button>

            {displayMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 w-52 rounded-xl bg-[#162329] border border-[#2b3c44] shadow-2xl p-2 z-50 text-xs space-y-1.5"
                onMouseLeave={() => setDisplayMenuOpen(false)}
              >
                <label className="flex items-center justify-between text-[#cbd5e1] cursor-pointer hover:bg-[#20313a] p-1 rounded">
                  <span>Tampilkan Label Nama</span>
                  <input
                    type="checkbox"
                    checked={showLabels}
                    onChange={(e) => setShowLabels(e.target.checked)}
                    className="accent-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between text-[#cbd5e1] cursor-pointer hover:bg-[#20313a] p-1 rounded">
                  <span>Jaring Relasi (Mesh)</span>
                  <input
                    type="checkbox"
                    checked={showMeshLines}
                    onChange={(e) => setShowMeshLines(e.target.checked)}
                    className="accent-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between text-[#cbd5e1] cursor-pointer hover:bg-[#20313a] p-1 rounded">
                  <span>Simulasi Fisika Gerak</span>
                  <input
                    type="checkbox"
                    checked={physicsActive}
                    onChange={(e) => setPhysicsActive(e.target.checked)}
                    className="accent-blue-500"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          1.5 REAL-TIME AUTO-SYNC BAR (Otomatis Menambahkan Perubahan BEI)
         ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-[#111c21] border border-[#1e2f38] text-[11px] text-[#cbd5e1]">
        {/* Left: Live Sync Indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="font-bold text-emerald-400">
            Auto-Sync BEI & KSEI: AKTIF
          </span>
          <span className="text-[#64748b] hidden sm:inline">·</span>
          <span className="text-[#94a3b8] hidden sm:inline">
            Grafik otomatis menambahkan node dan kepemilikan baru saat keterbukaan informasi BEI dirilis
          </span>
        </div>

        {/* Right: Quick Action Buttons & Status */}
        <div className="flex items-center gap-2">
          {lastSyncTime && (
            <span className="text-[#64748b] font-mono hidden md:inline">
              Sinkron: {lastSyncTime}
            </span>
          )}

          {/* Filings Trail Modal Trigger */}
          <button
            onClick={() => setFilingsModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-[#162329] hover:bg-[#1f3038] border border-[#2b3c44] text-[#cbd5e1] font-bold text-[10px] cursor-pointer flex items-center gap-1 transition-colors"
            title="Lihat Keterbukaan Informasi & Perubahan Registrasi Saham BEI Terkini"
          >
            <span>📋 Riwayat Pelaporan BEI</span>
            {recentFilings.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-500/30 text-blue-300 font-mono">
                {recentFilings.length}
              </span>
            )}
          </button>

          {/* Manual Refresh / Trigger Sync */}
          <button
            onClick={fetchBeiShareholderFeed}
            disabled={isSyncing}
            className={`px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] cursor-pointer flex items-center gap-1 transition-colors ${
              isSyncing ? 'opacity-70' : ''
            }`}
            title="Periksa Pembaruan Data BEI Sekarang"
          >
            <span className={isSyncing ? 'animate-spin' : ''}>🔄</span>
            <span>{isSyncing ? 'Menyinkronkan...' : 'Cek Pembaruan BEI'}</span>
          </button>
        </div>
      </div>

      {/* Floating Alert Banner when a change is detected from BEI */}
      {newUpdateBanner && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-900/60 to-emerald-900/60 border border-blue-500/60 text-white shadow-xl animate-fade-in text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-base select-none">⚡</span>
            <div>
              <b className="block font-bold">{newUpdateBanner.message}</b>
              <span className="text-[10px] text-blue-200 font-mono">
                Terdeteksi pukul {newUpdateBanner.timestamp} · Tercatat resmi di KSEI & Sistem Keterbukaan Informasi BEI
              </span>
            </div>
          </div>
          <button
            onClick={() => setNewUpdateBanner(null)}
            className="text-white hover:text-blue-200 text-sm font-bold px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================
          2. MAIN GRAPH VIEWPORT + RIGHT INSPECTION DRAWER
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT / CENTER: Interactive Graph Canvas (lg:col-span-8 or 9) */}
        <div
          className={`${
            inspectorOpen ? 'lg:col-span-8 xl:col-span-8' : 'lg:col-span-12'
          } rounded-2xl bg-[#090e11] border border-[#22323a] relative overflow-hidden h-[620px] shadow-2xl flex flex-col`}
        >
          {/* Overlay Bar inside Canvas */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
            {/* Group Selector Dropdown */}
            <div className="relative pointer-events-auto">
              <button
                onClick={() => setGroupMenuOpen(!groupMenuOpen)}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#142026]/90 border border-[#2b3c44] text-[#cbd5e1] hover:text-white flex items-center gap-1.5 backdrop-blur-md cursor-pointer shadow-lg"
              >
                <span>
                  {selectedGroupFilter === 'all'
                    ? '3 groups'
                    : `Group ${selectedGroupFilter}`}
                </span>
                <span className="text-[10px]">▾</span>
              </button>

              {groupMenuOpen && (
                <div
                  className="absolute left-0 top-full mt-1.5 w-48 rounded-xl bg-[#162329] border border-[#2b3c44] shadow-2xl py-1 text-xs z-50 font-semibold"
                  onClick={() => setGroupMenuOpen(false)}
                >
                  <button
                    onClick={() => setSelectedGroupFilter('all')}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#20313a] ${
                      selectedGroupFilter === 'all' ? 'text-blue-400 font-bold' : 'text-white'
                    }`}
                  >
                    <span>Semua Grup (3 Groups)</span>
                    {selectedGroupFilter === 'all' && <span>✓</span>}
                  </button>
                  <button
                    onClick={() => setSelectedGroupFilter(1)}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#20313a] ${
                      selectedGroupFilter === 1 ? 'text-amber-400 font-bold' : 'text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>Group 1 (Gold)</span>
                    </span>
                    {selectedGroupFilter === 1 && <span>✓</span>}
                  </button>
                  <button
                    onClick={() => setSelectedGroupFilter(2)}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#20313a] ${
                      selectedGroupFilter === 2 ? 'text-blue-400 font-bold' : 'text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      <span>Group 2 (Blue)</span>
                    </span>
                    {selectedGroupFilter === 2 && <span>✓</span>}
                  </button>
                  <button
                    onClick={() => setSelectedGroupFilter(3)}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#20313a] ${
                      selectedGroupFilter === 3 ? 'text-teal-400 font-bold' : 'text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-400" />
                      <span>Group 3 (Cyan)</span>
                    </span>
                    {selectedGroupFilter === 3 && <span>✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Context Pill: Network of ANDRY HAKIM · 1 step + Back to market */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#142026]/90 border border-blue-500/50 backdrop-blur-md text-xs shadow-lg">
                <span className="text-[#cbd5e1]">
                  Network of <b className="text-white">{activePreset.rootName}</b> · {depth} step
                </span>
                <button
                  onClick={resetView}
                  className="px-2 py-0.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] cursor-pointer transition-colors shadow-sm"
                >
                  Back to market
                </button>
              </div>

              {!inspectorOpen && (
                <button
                  onClick={() => setInspectorOpen(true)}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-lg cursor-pointer hover:bg-blue-500 flex items-center gap-1"
                  title="Buka Panel Rincian"
                >
                  <span>Lihat Detail</span>
                  <span>›</span>
                </button>
              )}
            </div>
          </div>

          {/* SVG Interactive Canvas */}
          <div
            className="flex-1 w-full h-full cursor-grab active:cursor-grabbing relative"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <svg
              className="w-full h-full"
              viewBox="0 0 760 620"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="halo-glow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {/* 1. EDGES / CONNECTING LINES */}
                {visibleEdges.map((edge, idx) => {
                  const sourcePos = nodePositions[edge.source];
                  const targetPos = nodePositions[edge.target];
                  if (!sourcePos || !targetPos) return null;

                  const isSourceSelected = edge.source === selectedNodeId;
                  const isTargetSelected = edge.target === selectedNodeId;
                  const isHighlighted = isSourceSelected || isTargetSelected;

                  return (
                    <line
                      key={`${edge.source}-${edge.target}-${idx}`}
                      x1={sourcePos.x}
                      y1={sourcePos.y}
                      x2={targetPos.x}
                      y2={targetPos.y}
                      stroke={
                        isHighlighted
                          ? '#60a5fa'
                          : edge.isDirect
                          ? '#1e3a5f'
                          : 'rgba(30, 58, 95, 0.45)'
                      }
                      strokeWidth={isHighlighted ? 2.2 : edge.isDirect ? 1.4 : 0.75}
                      strokeDasharray={edge.isDirect ? undefined : '2,2'}
                      opacity={isHighlighted ? 0.95 : edge.isDirect ? 0.7 : 0.4}
                      className="transition-all duration-300"
                    />
                  );
                })}

                {/* 2. NODES */}
                {visibleNodes.map((node) => {
                  const pos = nodePositions[node.id];
                  if (!pos) return null;

                  const isSelected = node.id === selectedNodeId;
                  const isCenter = node.isCenter;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      className="cursor-pointer group"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggedNodeId(node.id);
                        setSelectedNodeId(node.id);
                        setInspectorOpen(true);
                      }}
                      onMouseEnter={(e) => {
                        setHoveredNode(node);
                        setTooltipPos({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      {/* Halo Rings for Center Node */}
                      {isCenter && (
                        <>
                          <circle
                            r="28"
                            fill="none"
                            stroke="#e3ac52"
                            strokeWidth="1.2"
                            strokeDasharray="4,3"
                            opacity="0.4"
                            className="animate-spin"
                            style={{ animationDuration: '30s', transformOrigin: '0 0' }}
                          />
                          <circle
                            r="20"
                            fill="none"
                            stroke="#e3ac52"
                            strokeWidth="1.8"
                            opacity="0.65"
                          />
                        </>
                      )}

                      {/* Selected Outer Ring */}
                      {isSelected && !isCenter && (
                        <circle
                          r={node.radius + 6}
                          fill="none"
                          stroke="#60a5fa"
                          strokeWidth="2"
                          opacity="0.8"
                          filter="url(#node-glow)"
                        />
                      )}

                      {/* Newly Added Node Pulse Ring */}
                      {node.isNew && (
                        <circle
                          r={node.radius + 4}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          className="animate-ping"
                          opacity="0.6"
                        />
                      )}

                      {/* Node Body */}
                      {node.type === 'stock' ? (
                        <rect
                          x={-node.radius * 1.2}
                          y={-node.radius * 0.9}
                          width={node.radius * 2.4}
                          height={node.radius * 1.8}
                          rx="4"
                          fill={node.color}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          filter="url(#node-glow)"
                        />
                      ) : (
                        <circle
                          r={node.radius}
                          fill={node.color}
                          stroke={isCenter ? '#ffffff' : '#142026'}
                          strokeWidth={isCenter ? 2.5 : 1.5}
                          filter={isCenter ? 'url(#halo-glow)' : undefined}
                          className="transition-transform duration-150 group-hover:scale-125"
                        />
                      )}

                      {/* Node Labels */}
                      {showLabels && (
                        <text
                          y={node.radius + 11}
                          textAnchor="middle"
                          fill={isSelected || isCenter ? '#ffffff' : '#cbd5e1'}
                          fontSize={isCenter ? '10.5' : '8.5'}
                          fontWeight={isCenter || isSelected ? '800' : '600'}
                          className="pointer-events-none select-none tracking-tight font-sans drop-shadow-md"
                        >
                          {node.name.length > 24
                            ? `${node.name.slice(0, 22)}...`
                            : node.name}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Hover Tooltip */}
            {hoveredNode && (
              <div
                className="fixed z-50 pointer-events-none px-3 py-2 rounded-xl bg-[#162329]/95 border border-blue-500/50 shadow-2xl backdrop-blur-md text-xs text-white transform -translate-x-1/2 -translate-y-full mb-3 space-y-0.5"
                style={{ left: tooltipPos.x, top: tooltipPos.y - 12 }}
              >
                <div className="font-bold text-sm text-blue-300 flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: hoveredNode.color }}
                  />
                  <span>{hoveredNode.name}</span>
                </div>
                <div className="text-[10px] text-[#94a3b8] flex items-center justify-between gap-3">
                  <span>Klasifikasi:</span>
                  <b className="text-white capitalize">{hoveredNode.category}</b>
                </div>
                <div className="text-[10px] text-[#94a3b8] flex items-center justify-between gap-3">
                  <span>Relasi Terhubung:</span>
                  <b className="text-white font-mono">{hoveredNode.linksCount} links</b>
                </div>
                {hoveredNode.percentage && (
                  <div className="text-[10px] text-[#94a3b8] flex items-center justify-between gap-3 pt-0.5 border-t border-[#2b3c44]">
                    <span>Kepemilikan:</span>
                    <b className="text-emerald-400 font-mono">{hoveredNode.percentage}%</b>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom-left Floating Controls: Layout, +, -, Fit */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 z-20 bg-[#142026]/90 border border-[#2b3c44] backdrop-blur-md p-1.5 rounded-xl shadow-xl">
            <button
              onClick={() => setPhysicsActive(!physicsActive)}
              className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                physicsActive
                  ? 'bg-blue-600 text-white'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
              title="Atur Simulasi Gerak Fisika"
            >
              <span>{physicsActive ? '⏸ Layout' : '▶ Layout'}</span>
            </button>
            <div className="h-4 w-px bg-[#2b3c44]" />
            <button
              onClick={() => setZoom((z) => Math.min(z * 1.2, 3.0))}
              className="w-7 h-7 rounded-lg text-xs font-bold text-[#94a3b8] hover:text-white hover:bg-[#1f3038] flex items-center justify-center cursor-pointer"
              title="Perbesar (Zoom In)"
            >
              +
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z / 1.2, 0.4))}
              className="w-7 h-7 rounded-lg text-xs font-bold text-[#94a3b8] hover:text-white hover:bg-[#1f3038] flex items-center justify-center cursor-pointer"
              title="Perkecil (Zoom Out)"
            >
              -
            </button>
            <button
              onClick={resetView}
              className="w-7 h-7 rounded-lg text-xs font-bold text-[#94a3b8] hover:text-white hover:bg-[#1f3038] flex items-center justify-center cursor-pointer"
              title="Pusatkan Tampilan (Fit)"
            >
              ⛶
            </button>
          </div>
        </div>

        {/* ========================================================
            3. RIGHT INSPECTION PANEL (Matching screenshot exactly)
           ======================================================== */}
        {inspectorOpen && (
          <div className="lg:col-span-4 xl:col-span-4 rounded-2xl bg-[#0f171b] border border-[#22323a] p-4 text-[#f3eee4] shadow-2xl flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Header: Dot + Name + Subtitle + Close 'X' */}
              <div className="flex items-start justify-between pb-3 border-b border-[#22323a]">
                <div className="flex items-start gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full mt-1 flex-none shadow-sm"
                    style={{ backgroundColor: inspectedNode.color }}
                  />
                  <div>
                    <h3 className="text-base font-black tracking-tight text-white leading-tight">
                      {inspectedNode.name}
                    </h3>
                    <p className="text-xs text-[#94a3b8] font-medium capitalize">
                      {inspectedNode.category} · Local
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setInspectorOpen(false)}
                  className="w-6 h-6 rounded-lg text-xs text-[#64748b] hover:text-white hover:bg-[#1f3038] flex items-center justify-center cursor-pointer transition-colors"
                  title="Tutup Panel"
                >
                  ✕
                </button>
              </div>

              {/* Group & Rank Section */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#cbd5e1] flex items-center gap-1.5">
                  <span className="text-amber-400">■</span>
                  <span>Group {inspectedNode.group} · {inspectedNode.linksCount} within 1 step</span>
                </div>

                {/* 3 Metric Cards: LINKS | INFLUENCE | BRIDGING */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-[#162329] border border-[#263740]">
                    <span className="text-[10px] text-[#94a3b8] font-bold block uppercase tracking-wider">
                      LINKS
                    </span>
                    <b className="text-base font-black text-white font-mono">
                      {inspectedNode.linksCount}
                    </b>
                  </div>

                  <div className="p-2 rounded-xl bg-[#162329] border border-[#263740]">
                    <span className="text-[10px] text-[#94a3b8] font-bold block uppercase tracking-wider">
                      INFLUENCE
                    </span>
                    <b className="text-base font-black text-white font-mono">
                      #{inspectedNode.influenceRank}
                    </b>
                  </div>

                  <div className="p-2 rounded-xl bg-[#162329] border border-[#263740]">
                    <span className="text-[10px] text-[#94a3b8] font-bold block uppercase tracking-wider">
                      BRIDGING
                    </span>
                    <b className="text-base font-black text-white font-mono">
                      #{inspectedNode.bridgingRank}
                    </b>
                  </div>
                </div>

                <p className="text-[10px] text-[#64748b] text-center font-medium">
                  Ranks of {activePreset.totalNodes} nodes
                </p>

                {/* Back to market Button */}
                <button
                  onClick={resetView}
                  className="w-full py-2 rounded-xl bg-[#162329] hover:bg-[#1f3038] border border-[#2b3c44] text-xs font-bold text-white transition-colors cursor-pointer shadow-sm text-center block"
                >
                  Back to market
                </button>
              </div>

              {/* Holdings Section: Title + Holdings list */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-white">
                    {activePreset.rootName} · {activePreset.holdings.length} holdings above 1%
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Realtime BEI</span>
                  </span>
                </div>

                {/* Individual Holdings Cards */}
                <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                  {activePreset.holdings.map((h) => {
                    const liveStock = stocks.find((s) => s.ticker === h.ticker);
                    const isUp = (h.changePercent ?? 0) >= 0;

                    return (
                      <div
                        key={h.ticker}
                        className="p-3 rounded-xl bg-[#142026] border border-[#22323a] hover:border-blue-500/50 transition-all space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          {/* Stock Logo + Ticker */}
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm flex-none"
                              style={{ backgroundColor: h.logoColor }}
                            >
                              {h.ticker.slice(0, 2)}
                            </div>

                            <div>
                              <div className="flex items-center gap-1.5">
                                <b className="text-sm font-black text-white tracking-tight">
                                  {h.ticker}
                                </b>
                                {h.isNew && (
                                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/40 animate-pulse">
                                    NEW
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#94a3b8] block">
                                {h.type} {liveStock ? `· Rp${liveStock.price.toLocaleString('id-ID')}` : ''}
                              </span>
                            </div>
                          </div>

                          {/* Ownership Percentage + Change */}
                          <div className="text-right">
                            <div className="text-sm font-black text-white font-mono">
                              {h.percentage.toFixed(2)}%
                            </div>
                            {h.changePercent !== undefined ? (
                              <div
                                className={`text-[10px] font-bold font-mono ${
                                  isUp ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {isUp ? '+' : ''}
                                {h.changePercent.toFixed(2)}%
                              </div>
                            ) : (
                              <div className="text-[10px] text-[#64748b] font-mono">
                                Tetap
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar & Share Count */}
                        <div className="space-y-1">
                          <div className="w-full h-1.5 rounded-full bg-[#1e2f38] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{ width: `${Math.min(h.percentage * 8, 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-[#94a3b8] font-mono">
                            <span>{h.shares}</span>
                            <div className="flex items-center gap-2">
                              {liveStock && onOpenLotCalculator && (
                                <button
                                  onClick={() => onOpenLotCalculator(liveStock)}
                                  className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                                >
                                  Hitung Lot
                                </button>
                              )}
                              <button
                                onClick={() => onSelectStock(h.ticker)}
                                className="text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer"
                              >
                                Buka Grafik ›
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Quick Network Preset Switcher */}
            <div className="pt-2 border-t border-[#22323a] space-y-1.5">
              <span className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider block">
                Jaringan Pemegang Saham BEI Terverifikasi:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {networkPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setActivePresetId(preset.id);
                      setSelectedNodeId(preset.rootName);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      activePresetId === preset.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-[#162329] text-[#94a3b8] hover:text-white'
                    }`}
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          4. OFFICIAL BEI FILINGS MODAL (Keterbukaan Informasi BEI)
         ======================================================== */}
      {filingsModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setFilingsModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-[#0f171b] border border-[#2b3c44] shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto text-[#f3eee4]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#22323a]">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>📋</span>
                  <span>Riwayat Keterbukaan Informasi & Perubahan Kepemilikan BEI</span>
                </h3>
                <p className="text-xs text-[#94a3b8]">
                  Laporan resmi KSEI dan Keterbukaan Informasi Bursa Efek Indonesia per tanggal hari ini
                </p>
              </div>
              <button
                onClick={() => setFilingsModalOpen(false)}
                className="w-7 h-7 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#1a2b33] flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              {recentFilings.map((filing) => (
                <div
                  key={filing.id}
                  className="p-3.5 rounded-xl bg-[#162329] border border-[#263740] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <b className="text-sm font-black text-white">{filing.ticker}</b>
                      <span className="text-xs text-[#94a3b8]">({filing.companyName})</span>
                      <span
                        className={`text-[9.5px] px-2 py-0.5 rounded font-black uppercase ${
                          filing.type === 'PENAMBAHAN'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : filing.type === 'PENGURANGAN'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {filing.type}
                      </span>
                    </div>

                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/40 px-2 py-0.5 rounded">
                      ✓ {filing.status}
                    </span>
                  </div>

                  <div className="text-xs text-white">
                    Nama Pemegang: <b className="text-amber-300">{filing.holderName}</b>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-[#cbd5e1] pt-1 border-t border-[#22323a]">
                    <div className="space-x-3 font-mono text-[11px]">
                      <span>Sebelum: <b>{filing.previousPercentage}%</b></span>
                      <span>Sesudah: <b className="text-white">{filing.currentPercentage}%</b></span>
                      <span>Perubahan: <b className={filing.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{filing.change >= 0 ? '+' : ''}{filing.change}%</b></span>
                      <span>Volume: <b>{filing.shares} lbr</b></span>
                    </div>
                    <span className="text-[10px] text-[#64748b] font-mono">
                      Ref: {filing.filingRef} · {filing.time}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#94a3b8] italic">
                    "{filing.notes}"
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#22323a] flex items-center justify-between text-xs text-[#64748b]">
              <span>Sinkronisasi otomatis berjalan tiap 18 detik</span>
              <button
                onClick={() => setFilingsModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
