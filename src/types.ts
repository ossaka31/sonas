// Minecraft Oyuncu Veri Tipleri

export interface PlayerStats {
  [key: string]: number;
}

export interface PlayerPosition {
  0: number; // x
  1: number; // y
  2: number; // z
}

export interface PlayerData {
  // Kimlik
  UUID?: string;
  playerName?: string;
  
  // Oyun durumu
  GameType?: number; // 0=survival, 1=creative, 2=adventure, 3=spectator
  previousPlayerGameType?: number;
  
  // Pozisyon
  Pos?: number[];
  Rotation?: number[];
  Dimension?: string;
  
  // Sağlık ve açlık
  Health?: number;
  foodLevel?: number;
  foodSaturationLevel?: number;
  foodExhaustionLevel?: number;
  
  // Deneyim
  XpLevel?: number;
  XpTotal?: number;
  XpP?: number;
  XpSeed?: number;
  
  // Envanter
  Inventory?: InventoryItem[];
  EnderItems?: InventoryItem[];
  
  // İstatistikler
  Stats?: PlayerStats;
  
  // Yetenekler
  abilities?: {
    invulnerable?: boolean;
    mayfly?: boolean;
    instabuild?: boolean;
    flyingSpeed?: number;
    walkSpeed?: number;
  };
  
  // Diğer
  SpawnX?: number;
  SpawnY?: number;
  SpawnZ?: number;
  SpawnDimension?: string;
  SleepTimer?: number;
  Air?: number;
  OnGround?: number | boolean;
  FallDistance?: number;
  Fire?: number;
  HurtTime?: number;
  DeathTime?: number;
  SeenCredits?: boolean;
  recipeBook?: any;
  recipes?: string[];
  
  // Ham veri (tüm alanları saklamak için)
  [key: string]: any;
}

export interface InventoryItem {
  Slot?: number;
  id?: string;
  Count?: number;
  tag?: any;
  [key: string]: any;
}

export interface UserCacheEntry {
  uuid: string;
  name: string;
}

export interface LoadedFile {
  fileName: string;
  data: PlayerData;
  uuid?: string;
  playerName?: string;
  loadedAt: Date;
}

export interface AnalysisResult {
  player: LoadedFile;
  summary: PlayerSummary;
  narratives: NarrativeSection[];
  comparisons?: ComparisonResult[];
}

export interface PlayerSummary {
  playerName: string;
  uuid: string;
  gameType: string;
  dimension: string;
  position: { x: number; y: number; z: number };
  health: number;
  foodLevel: number;
  xpLevel: number;
  xpTotal: number;
  inventorySize: number;
  inventoryValue: number;
  totalBlocksMined: number;
  totalItemsCrafted: number;
  totalMobsKilled: number;
  totalDistanceWalked: number;
  totalDistanceFlown: number;
  totalDistanceSwum: number;
  totalJumps: number;
  deaths: number;
  killsByMobs: number;
  playTimeMinutes: number;
  advancementsCount: number;
  topMinedBlocks: { name: string; count: number }[];
  topCraftedItems: { name: string; count: number }[];
  topKilledMobs: { name: string; count: number }[];
  topUsedItems: { name: string; count: number }[];
  topBrokenTools: { name: string; count: number }[];
  allStats: { category: string; name: string; value: number }[];
}

export interface NarrativeSection {
  title: string;
  icon: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'comparison' | 'highlight';
}

export interface ComparisonResult {
  metric: string;
  oldValue: number;
  newValue: number;
  change: number;
  changePercent: number;
  narrative: string;
}
