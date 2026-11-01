import { useState, useCallback, Component, ReactNode } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Doughnut, Radar, Line } from 'react-chartjs-2';

// Chart.js registration
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
);

// ===================== TYPES =====================
interface PlayerData {
  UUID?: string;
  GameType?: number;
  Pos?: number[];
  Dimension?: string;
  Health?: number;
  foodLevel?: number;
  XpLevel?: number;
  XpTotal?: number;
  Inventory?: any[];
  Stats?: Record<string, any>;
  [key: string]: any;
}

interface LoadedFile {
  fileName: string;
  data: PlayerData;
  uuid?: string;
  playerName?: string;
}

interface UserCacheEntry {
  uuid: string;
  name: string;
}

interface PlayerSummary {
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
  topMinedBlocks: { name: string; count: number }[];
  topCraftedItems: { name: string; count: number }[];
  topKilledMobs: { name: string; count: number }[];
  topUsedItems: { name: string; count: number }[];
  topBrokenTools: { name: string; count: number }[];
  allStats: { category: string; name: string; value: number }[];
}

interface ComparisonResult {
  metric: string;
  oldValue: number;
  newValue: number;
  change: number;
  changePercent: number;
  narrative: string;
}

// ===================== TRANSLATIONS =====================
const ITEM_TRANSLATIONS: Record<string, string> = {
  'stone': 'Taş', 'granite': 'Granit', 'diorite': 'Diyorit', 'andesite': 'Andezit',
  'dirt': 'Toprak', 'grass_block': 'Çimen Bloğu', 'cobblestone': 'Kaldırım Taşı',
  'oak_log': 'Meşe Kütüğü', 'birch_log': 'Huş Kütüğü', 'spruce_log': 'Ladin Kütüğü',
  'oak_planks': 'Meşe Tahta', 'birch_planks': 'Huş Tahta', 'spruce_planks': 'Ladin Tahta',
  'sand': 'Kum', 'gravel': 'Çakıl', 'iron_ore': 'Demir Cevheri', 'gold_ore': 'Altın Cevheri',
  'diamond_ore': 'Elmas Cevheri', 'coal_ore': 'Kömür Cevheri', 'redstone_ore': 'Redstone Cevheri',
  'lapis_ore': 'Lapis Cevheri', 'emerald_ore': 'Zümrüt Cevheri', 'copper_ore': 'Bakır Cevheri',
  'deepslate_iron_ore': 'Kayrak Demir Cevheri', 'deepslate_gold_ore': 'Kayrak Altın Cevheri',
  'deepslate_diamond_ore': 'Kayrak Elmas Cevheri', 'deepslate_coal_ore': 'Kayrak Kömür Cevheri',
  'deepslate': 'Kayrak Taşı', 'bedrock': 'Ana Kaya', 'obsidian': 'Obsidyen',
  'netherrack': 'Nether Taşı', 'end_stone': 'End Taşı', 'netherite_scrap': 'Netherit Parçası',
  'ancient_debris': 'Antik Kalıntı', 'nether_gold_ore': 'Nether Altın Cevheri',
  'nether_quartz_ore': 'Nether Kuvars Cevheri', 'glowstone': 'Işık Taşı',
  'soul_sand': 'Ruh Kumu', 'soul_soil': 'Ruh Toprağı', 'basalt': 'Bazalt',
  'blackstone': 'Kara Taş', 'crying_obsidian': 'Ağlayan Obsidyen',
  'iron_ingot': 'Demir Külçesi', 'gold_ingot': 'Altın Külçesi', 'diamond': 'Elmas',
  'emerald': 'Zümrüt', 'coal': 'Kömür', 'redstone': 'Redstone', 'lapis_lazuli': 'Lapis Lazuli',
  'netherite_ingot': 'Netherit Külçesi', 'copper_ingot': 'Bakır Külçesi',
  'wooden_pickaxe': 'Tahta Kazma', 'stone_pickaxe': 'Taş Kazma',
  'iron_pickaxe': 'Demir Kazma', 'golden_pickaxe': 'Altın Kazma',
  'diamond_pickaxe': 'Elmas Kazma', 'netherite_pickaxe': 'Netherit Kazma',
  'wooden_sword': 'Tahta Kılıç', 'stone_sword': 'Taş Kılıç',
  'iron_sword': 'Demir Kılıç', 'golden_sword': 'Altın Kılıç',
  'diamond_sword': 'Elmas Kılıç', 'netherite_sword': 'Netherit Kılıç',
  'wooden_axe': 'Tahta Balta', 'stone_axe': 'Taş Balta',
  'iron_axe': 'Demir Balta', 'golden_axe': 'Altın Balta',
  'diamond_axe': 'Elmas Balta', 'netherite_axe': 'Netherit Balta',
  'wooden_shovel': 'Tahta Kürek', 'stone_shovel': 'Taş Kürek',
  'iron_shovel': 'Demir Kürek', 'golden_shovel': 'Altın Kürek',
  'diamond_shovel': 'Elmas Kürek', 'netherite_shovel': 'Netherit Kürek',
  'bow': 'Yay', 'crossbow': 'Arbalet', 'trident': 'Üçlü Mızrak',
  'arrow': 'Ok', 'shield': 'Kalkan', 'totem_of_undying': 'Ölümsüzlük Totemi',
  'elytra': 'Elitra', 'firework_rocket': 'Havai Fişek',
  'apple': 'Elma', 'golden_apple': 'Altın Elma', 'enchanted_golden_apple': 'Büyülü Altın Elma',
  'bread': 'Ekmek', 'cooked_beef': 'Pişmiş Biftek', 'cooked_porkchop': 'Pişmiş Domuz Pirzola',
  'cooked_chicken': 'Pişmiş Tavuk', 'cooked_mutton': 'Pişmiş Koyun Eti',
  'cooked_salmon': 'Pişmiş Somon', 'cooked_cod': 'Pişmiş Morina',
  'cake': 'Pasta', 'cookie': 'Kurabiye', 'melon_slice': 'Karpuz Dilimi',
  'sweet_berries': 'Tatlı Meyveler', 'glow_berries': 'Parlayan Meyveler',
  'potion': 'İksir', 'splash_potion': 'Patlayıcı İksir',
  'ender_pearl': 'Ender İncisi', 'eye_of_ender': 'Ender Gözü',
  'blaze_rod': 'Blaze Çubuğu', 'blaze_powder': 'Blaze Tozu',
  'ghast_tear': 'Ghast Gözyaşı', 'spider_eye': 'Örümcek Gözü',
  'gunpowder': 'Barut', 'string': 'İp', 'feather': 'Tüy',
  'bone': 'Kemik', 'bone_meal': 'Kemik Tozu', 'leather': 'Deri',
  'slime_ball': 'Balçık Topu', 'magma_cream': 'Magma Kremi',
  'phantom_membrane': 'Hayalet Zarı', 'shulker_shell': 'Shulker Kabuğu',
  'nether_star': 'Nether Yıldızı', 'dragon_egg': 'Ejderha Yumurtası',
  'dragon_breath': 'Ejderha Nefesi', 'experience_bottle': 'Deneyim Şişesi',
  'enchanted_book': 'Büyülü Kitap', 'book': 'Kitap', 'paper': 'Kağıt',
  'name_tag': 'İsim Etiketi', 'lead': 'Tasma', 'saddle': 'Eyer',
  'fishing_rod': 'Olta', 'flint_and_steel': 'Çakmak Taşı',
  'shears': 'Makas', 'bucket': 'Kova', 'water_bucket': 'Su Kovası',
  'lava_bucket': 'Lav Kovası', 'tnt': 'TNT', 'torch': 'Meşale',
  'lantern': 'Fener', 'crafting_table': 'Çalışma Masası', 'furnace': 'Fırın',
  'blast_furnace': 'Maden Fırını', 'smoker': 'Duman Fırını',
  'anvil': 'Örs', 'enchanting_table': 'Büyü Masası', 'brewing_stand': 'İksir Standı',
  'beacon': 'Fener', 'ender_chest': 'Ender Sandığı', 'chest': 'Sandık',
  'barrel': 'Varil', 'shulker_box': 'Shulker Kutusu', 'hopper': 'Huni',
  'glass': 'Cam', 'bricks': 'Tuğla', 'stone_bricks': 'Taş Tuğla',
  'nether_bricks': 'Nether Tuğlası', 'quartz_block': 'Kuvars Bloğu',
  'oak_door': 'Meşe Kapı', 'iron_door': 'Demir Kapı',
  'oak_fence': 'Meşe Çit', 'oak_stairs': 'Meşe Merdiven',
  'oak_slab': 'Meşe Basamak', 'rail': 'Ray', 'minecart': 'Maden Arabası',
  'wheat': 'Buğday', 'carrot': 'Havuç', 'potato': 'Patates',
  'pumpkin': 'Balkabağı', 'melon': 'Karpuz', 'sugar_cane': 'Şeker Kamışı',
  'cactus': 'Kaktüs', 'bamboo': 'Bambu', 'sugar': 'Şeker',
  'honey_bottle': 'Bal Şişesi', 'honeycomb': 'Bal Peteği',
  'nether_wart': 'Nether Mantarı', 'chorus_fruit': 'Koro Meyvesi',
  'bookshelf': 'Kitaplık', 'stick': 'Çubuk',
  'zombie': 'Zombi', 'skeleton': 'İskelet', 'creeper': 'Creeper',
  'spider': 'Örümcek', 'enderman': 'Enderman', 'blaze': 'Blaze',
  'ghast': 'Ghast', 'wither_skeleton': 'Wither İskeleti', 'piglin': 'Piglin',
  'piglin_brute': 'Piglin Brute', 'hoglin': 'Hoglin', 'zoglin': 'Zoglin',
  'ender_dragon': 'Ender Ejderhası', 'wither': 'Wither', 'warden': 'Warden',
  'villager': 'Köylü', 'iron_golem': 'Demir Golem', 'wolf': 'Kurt',
  'cat': 'Kedi', 'horse': 'At', 'axolotl': 'Axolotl',
  'bee': 'Arı', 'dolphin': 'Yunus', 'turtle': 'Kaplumbağa',
  'squid': 'Mürekkep Balığı', 'cod': 'Morina', 'salmon': 'Somon',
  'tropical_fish': 'Tropikal Balık', 'pufferfish': 'Balon Balığı',
  'phantom': 'Hayalet', 'drowned': 'Boğuk', 'husk': 'Kurutulmuş Zombi',
  'stray': 'Serseri İskelet', 'magma_cube': 'Magma Küpü', 'slime': 'Balçık',
  'silverfish': 'Gümüş Balığı', 'ravager': 'Yıkıcı', 'vindicator': 'İntikamcı',
  'evoker': 'Büyücü', 'pillager': 'Yağmacı', 'witch': 'Cadı',
};

const DIMENSION_NAMES: Record<string, string> = {
  'minecraft:overworld': 'Dünya (Overworld)',
  'minecraft:the_nether': 'Nether',
  'minecraft:the_end': 'End',
};

const GAMETYPE_NAMES: Record<number, string> = {
  0: 'Hayatta Kalma',
  1: 'Yaratıcı',
  2: 'Macera',
  3: 'İzleyici',
};

const STAT_CATEGORIES: Record<string, string> = {
  'minecraft:mined': 'Kırılan Bloklar',
  'minecraft:crafted': 'Üretilen Eşyalar',
  'minecraft:used': 'Kullanılan Eşyalar',
  'minecraft:broken': 'Kırılan Aletler',
  'minecraft:picked_up': 'Toplanan Eşyalar',
  'minecraft:dropped': 'Bırakılan Eşyalar',
  'minecraft:killed': 'Öldürülen Yaratıklar',
  'minecraft:killed_by': 'Tarafından Öldürülme',
  'minecraft:custom': 'Özel İstatistikler',
};

function translateItem(name: string): string {
  if (!name) return 'Bilinmiyor';
  const clean = name.replace('minecraft:', '');
  return ITEM_TRANSLATIONS[clean] || clean.replace(/_/g, ' ');
}

// ===================== ANALYZER =====================
function analyzePlayerData(loadedFile: LoadedFile): PlayerSummary {
  const data = loadedFile.data;
  const gameType = GAMETYPE_NAMES[data.GameType ?? 0] || 'Bilinmiyor';
  const dimension = DIMENSION_NAMES[data.Dimension || 'minecraft:overworld'] || 'Dünya';
  const pos = data.Pos || [0, 0, 0];
  const position = { x: Math.round(pos[0] || 0), y: Math.round(pos[1] || 0), z: Math.round(pos[2] || 0) };
  const health = data.Health ?? 20;
  const foodLevel = data.foodLevel ?? 20;
  const xpLevel = data.XpLevel ?? 0;
  const xpTotal = data.XpTotal ?? 0;
  const inventory = data.Inventory || [];
  const inventorySize = inventory.length;

  // Envanter değeri
  const itemValues: Record<string, number> = {
    'minecraft:diamond': 100, 'minecraft:emerald': 80, 'minecraft:netherite_ingot': 200,
    'minecraft:netherite_scrap': 50, 'minecraft:gold_ingot': 20, 'minecraft:iron_ingot': 10,
    'minecraft:coal': 2, 'minecraft:redstone': 3, 'minecraft:ancient_debris': 150,
    'minecraft:nether_star': 500, 'minecraft:elytra': 300, 'minecraft:totem_of_undying': 250,
    'minecraft:ender_pearl': 15, 'minecraft:blaze_rod': 20, 'minecraft:dragon_egg': 1000,
    'minecraft:enchanted_golden_apple': 50, 'minecraft:diamond_pickaxe': 300,
    'minecraft:netherite_pickaxe': 500, 'minecraft:golden_apple': 25,
  };
  let inventoryValue = 0;
  for (const item of inventory) {
    if (item && item.id) {
      inventoryValue += (itemValues[item.id] || 1) * (item.Count || 1);
    }
  }

  // Stats işleme
  const stats = data.Stats || {};
  let totalBlocksMined = 0, totalItemsCrafted = 0, totalMobsKilled = 0;
  let totalDistanceWalked = 0, totalDistanceFlown = 0, totalDistanceSwum = 0;
  let totalJumps = 0, deaths = 0, killsByMobs = 0, playTimeMinutes = 0;
  const topMinedBlocks: { name: string; count: number }[] = [];
  const topCraftedItems: { name: string; count: number }[] = [];
  const topKilledMobs: { name: string; count: number }[] = [];
  const topUsedItems: { name: string; count: number }[] = [];
  const topBrokenTools: { name: string; count: number }[] = [];
  const allStats: { category: string; name: string; value: number }[] = [];

  for (const [categoryKey, categoryData] of Object.entries(stats)) {
    if (typeof categoryData === 'object' && categoryData !== null) {
      const category = STAT_CATEGORIES[categoryKey] || categoryKey;
      for (const [itemKey, value] of Object.entries(categoryData as Record<string, number>)) {
        if (typeof value !== 'number') continue;
        const translatedName = translateItem(itemKey);
        allStats.push({ category, name: translatedName, value });

        if (category === 'Kırılan Bloklar') {
          totalBlocksMined += value;
          topMinedBlocks.push({ name: translatedName, count: value });
        } else if (category === 'Üretilen Eşyalar') {
          totalItemsCrafted += value;
          topCraftedItems.push({ name: translatedName, count: value });
        } else if (category === 'Öldürülen Yaratıklar') {
          totalMobsKilled += value;
          topKilledMobs.push({ name: translatedName, count: value });
        } else if (category === 'Tarafından Öldürülme') {
          killsByMobs += value;
        } else if (category === 'Kullanılan Eşyalar') {
          topUsedItems.push({ name: translatedName, count: value });
        } else if (category === 'Kırılan Aletler') {
          topBrokenTools.push({ name: translatedName, count: value });
        } else if (category === 'Özel İstatistikler') {
          const cleanKey = itemKey.includes('minecraft:') ? itemKey : `minecraft:${itemKey}`;
          if (cleanKey === 'minecraft:play_time') playTimeMinutes = Math.round(value / 1200);
          else if (cleanKey === 'minecraft:walk_one_cm') totalDistanceWalked = Math.round(value / 100);
          else if (cleanKey === 'minecraft:fly_one_cm') totalDistanceFlown = Math.round(value / 100);
          else if (cleanKey === 'minecraft:walk_under_water_one_cm' || cleanKey === 'minecraft:walk_on_water_one_cm') totalDistanceSwum += Math.round(value / 100);
          else if (cleanKey === 'minecraft:jump') totalJumps = value;
          else if (cleanKey === 'minecraft:deaths') deaths = value;
        }
      }
    }
  }

  topMinedBlocks.sort((a, b) => b.count - a.count);
  topCraftedItems.sort((a, b) => b.count - a.count);
  topKilledMobs.sort((a, b) => b.count - a.count);
  topUsedItems.sort((a, b) => b.count - a.count);
  topBrokenTools.sort((a, b) => b.count - a.count);

  return {
    playerName: loadedFile.playerName || 'Bilinmeyen Oyuncu',
    uuid: loadedFile.uuid || data.UUID || 'Bilinmiyor',
    gameType, dimension, position, health, foodLevel, xpLevel, xpTotal,
    inventorySize, inventoryValue, totalBlocksMined, totalItemsCrafted,
    totalMobsKilled, totalDistanceWalked, totalDistanceFlown, totalDistanceSwum,
    totalJumps, deaths, killsByMobs, playTimeMinutes,
    topMinedBlocks: topMinedBlocks.slice(0, 15),
    topCraftedItems: topCraftedItems.slice(0, 15),
    topKilledMobs: topKilledMobs.slice(0, 15),
    topUsedItems: topUsedItems.slice(0, 15),
    topBrokenTools: topBrokenTools.slice(0, 15),
    allStats: allStats.sort((a, b) => b.value - a.value),
  };
}

// ===================== COMPARISON =====================
function comparePlayers(p1: PlayerSummary, p2: PlayerSummary): ComparisonResult[] {
  const metrics = [
    { key: 'totalBlocksMined', label: 'Kırılan Blok' },
    { key: 'totalItemsCrafted', label: 'Üretilen Eşya' },
    { key: 'totalMobsKilled', label: 'Öldürülen Yaratık' },
    { key: 'totalDistanceWalked', label: 'Yürünen Mesafe (m)' },
    { key: 'totalDistanceFlown', label: 'Uçulan Mesafe (m)' },
    { key: 'xpLevel', label: 'XP Seviyesi' },
    { key: 'xpTotal', label: 'Toplam XP' },
    { key: 'deaths', label: 'Ölüm Sayısı' },
    { key: 'playTimeMinutes', label: 'Oynama Süresi (dk)' },
    { key: 'inventoryValue', label: 'Envanter Değeri' },
  ];

  return metrics.map(m => {
    const oldVal = (p1 as any)[m.key] || 0;
    const newVal = (p2 as any)[m.key] || 0;
    const change = newVal - oldVal;
    const changePercent = oldVal !== 0 ? Math.round(((change / oldVal) * 100) * 100) / 100 : (newVal > 0 ? 100 : 0);
    
    let narrative = '';
    if (change === 0) narrative = `${m.label} değişmedi.`;
    else if (m.label === 'Ölüm Sayısı' && change > 0) narrative = `⚠️ ${change} kez daha ölmüşsünüz. Daha dikkatli olun!`;
    else if (change > 0) narrative = `📈 ${m.label} ${change} arttı (%${changePercent}). ${change > oldVal ? 'Büyük bir gelişme!' : 'İstikrarlı ilerleme.'}`;
    else narrative = `📉 ${m.label} ${Math.abs(change)} azaldı.`;

    return { metric: m.label, oldValue: oldVal, newValue: newVal, change, changePercent, narrative };
  });
}

// ===================== NARRATIVE GENERATOR =====================
function generateNarratives(s: PlayerSummary, prev?: PlayerSummary): string[] {
  const narratives: string[] = [];

  // 1. Genel Bakış
  let n1 = `📋 GENEL DURUM\n\n`;
  n1 += `Oyuncu: ${s.playerName}\n`;
  n1 += `Oyun Modu: ${s.gameType}\n`;
  n1 += `Boyut: ${s.dimension}\n`;
  n1 += `Konum: X=${s.position.x}, Y=${s.position.y}, Z=${s.position.z}\n`;
  n1 += `Sağlık: ${s.health}/20 ${s.health >= 15 ? '(İyi)' : s.health >= 5 ? '(Dikkat!)' : '(TEHLİKE!)'}\n`;
  n1 += `Açlık: ${s.foodLevel}/20\n`;
  n1 += `XP Seviyesi: ${s.xpLevel} (Toplam: ${s.xpTotal})\n`;
  if (s.position.y < 0) n1 += `\n⚠️ Yer altındasınız (Y=${s.position.y}). Muhtemelen madencilik yapıyorsunuz.\n`;
  if (s.dimension.includes('Nether')) n1 += `\n🔥 Nether'dasınız! Tehlikeli bir ortam.\n`;
  if (s.dimension.includes('End')) n1 += `\n🌌 End'desiniz! Ejderha ile savaşabilirsiniz.\n`;
  narratives.push(n1);

  // 2. Madencilik
  if (s.totalBlocksMined > 0) {
    let n2 = `⛏️ MADENCİLİK FAALİYETLERİ\n\n`;
    n2 += `Toplam ${s.totalBlocksMined.toLocaleString('tr-TR')} blok kırılmış.\n\n`;
    n2 += `En çok kırılan bloklar:\n`;
    s.topMinedBlocks.slice(0, 10).forEach((b, i) => {
      n2 += `  ${i + 1}. ${b.name}: ${b.count.toLocaleString('tr-TR')} adet\n`;
    });
    if (s.topMinedBlocks.some(b => b.name.includes('Elmas'))) n2 += `\n💎 Elmas cevheri kırmışsınız! Derinlere inmişsiniz.\n`;
    if (s.topMinedBlocks.some(b => b.name.includes('Antik Kalıntı'))) n2 += `\n🔥 Antik kalıntı bulmuşsunuz! Netherit ekipman yapabilirsiniz.\n`;
    if (s.totalBlocksMined > 10000) n2 += `\n🏆 İnanılmaz madencilik! Gerçek bir madencisiniz!\n`;
    narratives.push(n2);
  }

  // 3. Üretim
  if (s.totalItemsCrafted > 0) {
    let n3 = `🔨 ÜRETİM VE CRAFTING\n\n`;
    n3 += `Toplam ${s.totalItemsCrafted.toLocaleString('tr-TR')} eşya üretilmiş.\n\n`;
    n3 += `En çok üretilen eşyalar:\n`;
    s.topCraftedItems.slice(0, 10).forEach((item, i) => {
      n3 += `  ${i + 1}. ${item.name}: ${item.count.toLocaleString('tr-TR')} adet\n`;
    });
    if (s.topCraftedItems.some(i => i.name.includes('Kazma') || i.name.includes('Kılıç'))) n3 += `\n🔧 Alet üretimi yapılmış. Hayatta kalma ekipmanları hazırlanmış.\n`;
    if (s.topCraftedItems.some(i => i.name.includes('Büyü') || i.name.includes('Kitaplık'))) n3 += `\n✨ Büyü masası ve kitaplıklar üretilmiş. Büyü sistemi kurulmuş!\n`;
    narratives.push(n3);
  }

  // 4. Savaş
  if (s.totalMobsKilled > 0 || s.deaths > 0) {
    let n4 = `⚔️ SAVAŞ İSTATİSTİKLERİ\n\n`;
    if (s.totalMobsKilled > 0) {
      n4 += `Toplam ${s.totalMobsKilled.toLocaleString('tr-TR')} yaratık öldürülmüş.\n\n`;
      n4 += `En çok öldürülen yaratıklar:\n`;
      s.topKilledMobs.slice(0, 10).forEach((mob, i) => {
        n4 += `  ${i + 1}. ${mob.name}: ${mob.count.toLocaleString('tr-TR')} adet\n`;
      });
      if (s.topKilledMobs.some(m => m.name.includes('Ejderha'))) n4 += `\n🐉 EJDERHA YENİLMİŞ! Nihai boss yenildi!\n`;
      if (s.topKilledMobs.some(m => m.name.includes('Warden'))) n4 += `\n👁️ WARDEN YENİLMİŞ! Çok nadir bir başarı!\n`;
      if (s.topKilledMobs.some(m => m.name.includes('Wither'))) n4 += `\n💀 WITHER YENİLMİŞ!\n`;
    }
    if (s.deaths > 0) {
      n4 += `\n💀 Ölüm Sayısı: ${s.deaths}\n`;
      if (s.deaths > 20) n4 += `Çok fazla ölüm! Daha dikkatli olun.\n`;
      else if (s.deaths > 10) n4 += `Birkaç ölüm yaşanmış. Macera dolu!\n`;
      else n4 += `Az ölüm - dikkatli oynanıyor!\n`;
    }
    if (s.killsByMobs > 0) n4 += `\n☠️ Yaratıklar tarafından öldürülme: ${s.killsByMobs} kez\n`;
    narratives.push(n4);
  }

  // 5. Hareket
  let n5 = `🏃 HAREKET VE SEYAHAT\n\n`;
  if (s.totalDistanceWalked > 0) n5 += `🚶 Yürünen: ${(s.totalDistanceWalked / 1000).toFixed(2)} km\n`;
  if (s.totalDistanceFlown > 0) n5 += `🕊️ Uçulan: ${(s.totalDistanceFlown / 1000).toFixed(2)} km\n`;
  if (s.totalDistanceSwum > 0) n5 += `🏊 Yüzülen: ${s.totalDistanceSwum.toLocaleString('tr-TR')} metre\n`;
  if (s.totalJumps > 0) n5 += `🦘 Zıplama: ${s.totalJumps.toLocaleString('tr-TR')}\n`;
  const dist = Math.round(Math.sqrt(s.position.x ** 2 + s.position.z ** 2));
  n5 += `\n📍 Spawn'dan uzaklık: ${dist.toLocaleString('tr-TR')} blok\n`;
  if (dist > 10000) n5 += `Çok uzak keşif yapılmış!\n`;
  else if (dist > 5000) n5 += `Oldukça uzak mesafe kat edilmiş.\n`;
  narratives.push(n5);

  // 6. Envanter
  let n6 = `🎒 ENVANTER DEĞERLENDİRMESİ\n\n`;
  n6 += `Dolu Slot: ${s.inventorySize}/36\n`;
  n6 += `Tahmini Değer: ${s.inventoryValue} puan\n\n`;
  if (s.inventoryValue > 1000) n6 += `💎 Çok zengin bir envanter! Değerli eşyalar mevcut.\n`;
  else if (s.inventoryValue > 500) n6 += `🏅 İyi seviyede envanter.\n`;
  else n6 += `📦 Orta seviye envanter.\n`;
  if (s.inventorySize >= 36) n6 += `\n⚠️ Envanter tamamen dolu! Yer açmanız gerekebilir.\n`;
  narratives.push(n6);

  // 7. Hayatta Kalma
  let n7 = `❤️ HAYATTA KALMA DURUMU\n\n`;
  n7 += `Sağlık: ${s.health}/20 (${Math.round((s.health / 20) * 100)}%)\n`;
  n7 += `Açlık: ${s.foodLevel}/20 (${Math.round((s.foodLevel / 20) * 100)}%)\n`;
  if (s.health >= 18) n7 += `\n✅ Sağlık mükemmel.\n`;
  else if (s.health >= 10) n7 += `\n⚠️ Sağlık yarıdan fazla, dikkatli olun.\n`;
  else n7 += `\n🚨 Sağlık kritik! Hemen iyileşin!\n`;
  if (s.foodLevel >= 18) n7 += `✅ Tokluk iyi.\n`;
  else if (s.foodLevel >= 10) n7 += `🍖 Açlık hissediliyor.\n`;
  else n7 += `⚠️ Çok açsınız!\n`;
  narratives.push(n7);

  // 8. Kırılan Aletler
  if (s.topBrokenTools.length > 0) {
    let n8 = `🔧 ALET KULLANIMI\n\n`;
    n8 += `Toplam ${s.topBrokenTools.reduce((sum, t) => sum + t.count, 0)} alet kırılmış.\n\n`;
    s.topBrokenTools.slice(0, 8).forEach((tool, i) => {
      n8 += `  ${i + 1}. ${tool.name}: ${tool.count} adet\n`;
    });
    if (s.topBrokenTools.some(t => t.name.includes('Netherit'))) n8 += `\n🔥 Netherit aletler kırılmış! Yoğun kullanım.\n`;
    if (s.topBrokenTools.some(t => t.name.includes('Elmas'))) n8 += `\n💎 Elmas aletler kırılmış. Tasarruf yapmayı düşünün.\n`;
    narratives.push(n8);
  }

  // 9. Günlük Karşılaştırma
  if (prev) {
    let n9 = `📊 GÜNLÜK KARŞILAŞTIRMA\n\n`;
    n9 += `Önceki veri ile mevcut veri arasındaki farklar:\n\n`;
    const blockDiff = s.totalBlocksMined - prev.totalBlocksMined;
    const mobDiff = s.totalMobsKilled - prev.totalMobsKilled;
    const xpDiff = s.xpTotal - prev.xpTotal;
    const deathDiff = s.deaths - prev.deaths;
    const timeDiff = s.playTimeMinutes - prev.playTimeMinutes;
    const posDiff = Math.round(Math.sqrt((s.position.x - prev.position.x) ** 2 + (s.position.z - prev.position.z) ** 2));

    if (timeDiff > 0) n9 += `⏰ Bu oturumda ${timeDiff} dakika oynanmış.\n`;
    if (blockDiff > 0) n9 += `⛏️ ${blockDiff.toLocaleString('tr-TR')} blok daha kırılmış.\n`;
    if (mobDiff > 0) n9 += `⚔️ ${mobDiff.toLocaleString('tr-TR')} yaratık daha öldürülmüş.\n`;
    if (xpDiff > 0) n9 += `✨ ${xpDiff.toLocaleString('tr-TR')} XP kazanılmış.\n`;
    if (deathDiff > 0) n9 += `💀 ${deathDiff} kez daha ölmüşsünüz.\n`;
    if (posDiff > 0) n9 += `🗺️ ${posDiff} blok hareket edilmiş.\n`;
    
    n9 += `\nXP Seviyesi: ${prev.xpLevel} → ${s.xpLevel}\n`;
    n9 += `Envanter Değeri: ${prev.inventoryValue} → ${s.inventoryValue}\n`;
    narratives.push(n9);
  }

  // 10. Genel Değerlendirme
  let n10 = `🏆 GENEL DEĞERLENDİRME\n\n`;
  let score = 0;
  if (s.totalBlocksMined > 10000) score += 20; else if (s.totalBlocksMined > 5000) score += 15; else if (s.totalBlocksMined > 1000) score += 10; else score += 5;
  if (s.totalMobsKilled > 1000) score += 20; else if (s.totalMobsKilled > 500) score += 15; else if (s.totalMobsKilled > 100) score += 10; else score += 5;
  if (s.xpLevel >= 30) score += 20; else if (s.xpLevel >= 20) score += 15; else if (s.xpLevel >= 10) score += 10; else score += 5;
  if (s.totalDistanceWalked > 100000) score += 20; else if (s.totalDistanceWalked > 50000) score += 15; else if (s.totalDistanceWalked > 10000) score += 10; else score += 5;
  if (s.deaths === 0) score += 20; else if (s.deaths <= 3) score += 15; else if (s.deaths <= 10) score += 10; else score += 5;

  const pct = score;
  n10 += `Performans Puanı: ${score}/100\n\n`;
  if (pct >= 80) n10 += `🏆 EFSANEVI OYUNCU! Mükemmel performans!\n`;
  else if (pct >= 60) n10 += `⭐ DENEYİMLİ OYUNCU! İyi ilerleme!\n`;
  else if (pct >= 40) n10 += `📈 GELİŞEN OYUNCU! Temel mekanikler öğrenilmiş.\n`;
  else n10 += `🌱 BAŞLANGIÇ SEVİYESİ. Keşfe devam!\n`;

  n10 += `\n💡 Tavsiyeler:\n`;
  if (s.totalBlocksMined < 1000) n10 += `• Daha fazla madencilik yapın\n`;
  if (s.totalMobsKilled < 100) n10 += `• Daha fazla yaratık öldürün\n`;
  if (s.xpLevel < 15) n10 += `• XP seviyenizi artırın\n`;
  if (s.deaths > 10) n10 += `• Daha dikkatli oynayın\n`;
  if (s.dimension === 'Dünya (Overworld)') n10 += `• Nether ve End'i keşfedin\n`;
  narratives.push(n10);

  return narratives;
}

// ===================== ERROR BOUNDARY =====================
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: 'white', fontFamily: 'sans-serif', background: '#1a1a2e', minHeight: '100vh' }}>
          <h1 style={{ color: '#ef4444' }}>⚠️ Bir hata oluştu</h1>
          <p style={{ color: '#ccc' }}>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Sayfayı Yenile
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ===================== MAIN APP =====================
type AppView = 'upload' | 'dashboard' | 'comparison' | 'narrative' | 'report';

function App() {
  const [loadedFiles, setLoadedFiles] = useState<LoadedFile[]>([]);
  const [summaries, setSummaries] = useState<PlayerSummary[]>([]);
  const [narratives, setNarratives] = useState<string[][]>([]);
  const [comparisons, setComparisons] = useState<ComparisonResult[][]>([]);
  const [userCache, setUserCache] = useState<UserCacheEntry[]>([]);
  const [currentView, setCurrentView] = useState<AppView>('upload');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [cacheLoaded, setCacheLoaded] = useState(false);

  const processFiles = useCallback(async (files: File[]) => {
    const newFiles: LoadedFile[] = [];
    const newSummaries: PlayerSummary[] = [];

    for (const file of files) {
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        let playerName = file.name.replace('.json', '');
        let uuid = data.UUID || '';

        if (userCache.length > 0 && uuid) {
          const entry = userCache.find(e => e.uuid === uuid);
          if (entry) playerName = entry.name;
        }
        if (!uuid && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(file.name.replace('.json', ''))) {
          uuid = file.name.replace('.json', '');
          const entry = userCache.find(e => e.uuid === uuid);
          if (entry) playerName = entry.name;
        }

        const lf: LoadedFile = { fileName: file.name, data, uuid, playerName };
        newFiles.push(lf);
        newSummaries.push(analyzePlayerData(lf));
      } catch (e) {
        console.error('Dosya hatası:', file.name, e);
      }
    }

    const allFiles = [...loadedFiles, ...newFiles];
    const allSummaries = [...summaries, ...newSummaries];
    setLoadedFiles(allFiles);
    setSummaries(allSummaries);

    // Narratives
    const newNarrs: string[][] = [];
    for (const s of newSummaries) {
      const prev = summaries.filter(x => x.playerName === s.playerName);
      const prevS = prev.length > 0 ? prev[prev.length - 1] : undefined;
      newNarrs.push(generateNarratives(s, prevS));
    }
    setNarratives(prev => [...prev, ...newNarrs]);

    // Comparisons
    const newComps: ComparisonResult[][] = [];
    const groups: Record<string, PlayerSummary[]> = {};
    allSummaries.forEach(s => {
      if (!groups[s.playerName]) groups[s.playerName] = [];
      groups[s.playerName].push(s);
    });
    for (const versions of Object.values(groups)) {
      if (versions.length >= 2) {
        for (let i = 1; i < versions.length; i++) {
          newComps.push(comparePlayers(versions[i - 1], versions[i]));
        }
      }
    }
    const latest = Object.values(groups).map(v => v[v.length - 1]);
    if (latest.length > 1) {
      for (let i = 0; i < latest.length; i++) {
        for (let j = i + 1; j < latest.length; j++) {
          newComps.push(comparePlayers(latest[i], latest[j]));
        }
      }
    }
    setComparisons(newComps);
    setCurrentView('dashboard');
  }, [loadedFiles, summaries, userCache]);

  const handleCacheUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (Array.isArray(data)) { setUserCache(data); setCacheLoaded(true); }
      } catch (err) { console.error(err); }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) processFiles(files);
  };

  const loadDemo = () => {
    const demo1: PlayerData = {
      UUID: "12345678-1234-1234-1234-123456789012",
      GameType: 0, Pos: [150, 64, -230], Dimension: "minecraft:overworld",
      Health: 18, foodLevel: 16, XpLevel: 24, XpTotal: 3420,
      Inventory: [
        { Slot: 0, id: "minecraft:diamond_pickaxe", Count: 1 },
        { Slot: 1, id: "minecraft:diamond_sword", Count: 1 },
        { Slot: 2, id: "minecraft:diamond", Count: 23 },
        { Slot: 3, id: "minecraft:iron_ingot", Count: 64 },
        { Slot: 4, id: "minecraft:cooked_beef", Count: 64 },
        { Slot: 5, id: "minecraft:obsidian", Count: 32 },
        { Slot: 6, id: "minecraft:ender_pearl", Count: 16 },
        { Slot: 7, id: "minecraft:golden_apple", Count: 5 },
        { Slot: 8, id: "minecraft:torch", Count: 128 },
      ],
      Stats: {
        "minecraft:mined": { "minecraft:stone": 4523, "minecraft:dirt": 2341, "minecraft:cobblestone": 1890, "minecraft:oak_log": 890, "minecraft:iron_ore": 456, "minecraft:coal_ore": 678, "minecraft:diamond_ore": 34, "minecraft:deepslate": 1234, "minecraft:gravel": 567, "minecraft:deepslate_iron_ore": 234, "minecraft:deepslate_diamond_ore": 12, "minecraft:ancient_debris": 8, "minecraft:netherrack": 3456, "minecraft:redstone_ore": 345, "minecraft:gold_ore": 123 },
        "minecraft:crafted": { "minecraft:crafting_table": 12, "minecraft:furnace": 8, "minecraft:iron_pickaxe": 5, "minecraft:diamond_pickaxe": 2, "minecraft:torch": 256, "minecraft:oak_planks": 340, "minecraft:stick": 450, "minecraft:iron_ingot": 180, "minecraft:diamond_sword": 1, "minecraft:stone_bricks": 890, "minecraft:chest": 15, "minecraft:shield": 1 },
        "minecraft:used": { "minecraft:diamond_pickaxe": 3456, "minecraft:iron_pickaxe": 1234, "minecraft:diamond_sword": 890, "minecraft:crafting_table": 456, "minecraft:furnace": 234, "minecraft:torch": 567, "minecraft:cobblestone": 1890, "minecraft:oak_planks": 678 },
        "minecraft:broken": { "minecraft:iron_pickaxe": 12, "minecraft:stone_pickaxe": 34, "minecraft:iron_sword": 5, "minecraft:stone_sword": 8, "minecraft:iron_axe": 3, "minecraft:fishing_rod": 2, "minecraft:shield": 4, "minecraft:iron_shovel": 6 },
        "minecraft:killed": { "minecraft:zombie": 234, "minecraft:skeleton": 189, "minecraft:creeper": 67, "minecraft:spider": 123, "minecraft:enderman": 45, "minecraft:blaze": 78, "minecraft:piglin": 34, "minecraft:witch": 12, "minecraft:ghast": 8, "minecraft:wither_skeleton": 23, "minecraft:slime": 56, "minecraft:phantom": 15 },
        "minecraft:killed_by": { "minecraft:creeper": 5, "minecraft:zombie": 3, "minecraft:skeleton": 4, "minecraft:enderman": 1, "minecraft:fall": 2, "minecraft:lava": 3 },
        "minecraft:custom": { "minecraft:play_time": 2160000, "minecraft:walk_one_cm": 8923456, "minecraft:sprint_one_cm": 3456789, "minecraft:fly_one_cm": 234567, "minecraft:walk_under_water_one_cm": 456789, "minecraft:jump": 34567, "minecraft:deaths": 18, "minecraft:damage_dealt": 456789, "minecraft:damage_taken": 234567, "minecraft:chest_opened": 89, "minecraft:crafting_table_interaction": 456, "minecraft:furnace_interaction": 234, "minecraft:enchant_item": 34, "minecraft:fish_caught": 67, "minecraft:sleep_in_bed": 45 },
        "minecraft:picked_up": { "minecraft:cobblestone": 5678, "minecraft:dirt": 3456, "minecraft:iron_ingot": 234, "minecraft:diamond": 34, "minecraft:coal": 456, "minecraft:oak_log": 890 },
      },
    };
    const demo2: PlayerData = {
      ...demo1,
      Pos: [320, 45, -450], Health: 20, foodLevel: 20, XpLevel: 31, XpTotal: 5670,
      Inventory: [
        { Slot: 0, id: "minecraft:netherite_pickaxe", Count: 1 },
        { Slot: 1, id: "minecraft:diamond_sword", Count: 1 },
        { Slot: 2, id: "minecraft:diamond", Count: 45 },
        { Slot: 3, id: "minecraft:netherite_ingot", Count: 4 },
        { Slot: 4, id: "minecraft:cooked_beef", Count: 64 },
        { Slot: 5, id: "minecraft:elytra", Count: 1 },
        { Slot: 6, id: "minecraft:ender_pearl", Count: 32 },
        { Slot: 7, id: "minecraft:enchanted_golden_apple", Count: 3 },
        { Slot: 8, id: "minecraft:totem_of_undying", Count: 2 },
        { Slot: 9, id: "minecraft:obsidian", Count: 64 },
      ],
      Stats: {
        "minecraft:mined": { "minecraft:stone": 6234, "minecraft:dirt": 3100, "minecraft:cobblestone": 2567, "minecraft:oak_log": 1234, "minecraft:iron_ore": 678, "minecraft:coal_ore": 890, "minecraft:diamond_ore": 56, "minecraft:deepslate": 2345, "minecraft:gravel": 789, "minecraft:deepslate_iron_ore": 456, "minecraft:deepslate_diamond_ore": 23, "minecraft:ancient_debris": 15, "minecraft:netherrack": 5678, "minecraft:redstone_ore": 567, "minecraft:gold_ore": 234, "minecraft:emerald_ore": 8, "minecraft:end_stone": 345 },
        "minecraft:crafted": { "minecraft:crafting_table": 15, "minecraft:furnace": 12, "minecraft:iron_pickaxe": 5, "minecraft:diamond_pickaxe": 3, "minecraft:netherite_pickaxe": 1, "minecraft:torch": 456, "minecraft:oak_planks": 567, "minecraft:stick": 678, "minecraft:iron_ingot": 345, "minecraft:diamond_sword": 2, "minecraft:stone_bricks": 1234, "minecraft:chest": 23, "minecraft:shield": 2, "minecraft:enchanting_table": 1, "minecraft:bookshelf": 15, "minecraft:anvil": 1, "minecraft:beacon": 1 },
        "minecraft:used": { "minecraft:diamond_pickaxe": 4567, "minecraft:netherite_pickaxe": 1234, "minecraft:diamond_sword": 1456, "minecraft:crafting_table": 678, "minecraft:furnace": 345, "minecraft:torch": 890, "minecraft:cobblestone": 2567, "minecraft:oak_planks": 890, "minecraft:elytra": 567, "minecraft:ender_pearl": 234 },
        "minecraft:broken": { "minecraft:iron_pickaxe": 15, "minecraft:stone_pickaxe": 40, "minecraft:iron_sword": 8, "minecraft:stone_sword": 12, "minecraft:iron_axe": 5, "minecraft:fishing_rod": 3, "minecraft:shield": 6, "minecraft:iron_shovel": 8, "minecraft:diamond_pickaxe": 2 },
        "minecraft:killed": { "minecraft:zombie": 345, "minecraft:skeleton": 267, "minecraft:creeper": 89, "minecraft:spider": 178, "minecraft:enderman": 67, "minecraft:blaze": 123, "minecraft:piglin": 56, "minecraft:witch": 23, "minecraft:ghast": 15, "minecraft:wither_skeleton": 45, "minecraft:slime": 78, "minecraft:phantom": 23, "minecraft:ender_dragon": 1, "minecraft:warden": 1, "minecraft:piglin_brute": 12, "minecraft:hoglin": 34 },
        "minecraft:killed_by": { "minecraft:creeper": 7, "minecraft:zombie": 4, "minecraft:skeleton": 5, "minecraft:enderman": 2, "minecraft:fall": 3, "minecraft:lava": 4, "minecraft:warden": 2, "minecraft:wither_skeleton": 1 },
        "minecraft:custom": { "minecraft:play_time": 3240000, "minecraft:walk_one_cm": 12345678, "minecraft:sprint_one_cm": 5678901, "minecraft:fly_one_cm": 1234567, "minecraft:walk_under_water_one_cm": 678901, "minecraft:jump": 45678, "minecraft:deaths": 28, "minecraft:damage_dealt": 789012, "minecraft:damage_taken": 345678, "minecraft:chest_opened": 134, "minecraft:crafting_table_interaction": 678, "minecraft:furnace_interaction": 345, "minecraft:enchant_item": 67, "minecraft:fish_caught": 89, "minecraft:sleep_in_bed": 67, "minecraft:raid_win": 3, "minecraft:totem_used": 2 },
        "minecraft:picked_up": { "minecraft:cobblestone": 7890, "minecraft:dirt": 4567, "minecraft:iron_ingot": 345, "minecraft:diamond": 56, "minecraft:coal": 678, "minecraft:oak_log": 1234, "minecraft:netherite_scrap": 15, "minecraft:ender_pearl": 45 },
      },
    };

    const f1 = new File([JSON.stringify(demo1)], 'Steve_dun.json');
    const f2 = new File([JSON.stringify(demo2)], 'Steve_bugun.json');
    processFiles([f1, f2]);
  };

  const reset = () => {
    setLoadedFiles([]); setSummaries([]); setNarratives([]); setComparisons([]);
    setCurrentView('upload'); setSelectedIdx(0);
  };

  const s = summaries[selectedIdx] || summaries[0];
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];
  const barOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#9ca3af', font: { size: 10 } }, grid: { color: '#374151' } }, y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } } } };

  // Generate text report
  const generateReport = (): string => {
    let r = '═══════════════════════════════════════════════════\n';
    r += '   MINECRAFT OYUNCU İSTATİSTİK ANALİZ RAPORU\n';
    r += '═══════════════════════════════════════════════════\n';
    r += `Tarih: ${new Date().toLocaleString('tr-TR')}\n`;
    r += `Veri Seti: ${summaries.length} | Oyuncu: ${new Set(summaries.map(s => s.playerName)).size}\n\n`;

    summaries.forEach((sm, idx) => {
      r += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      r += `  OYUNCU: ${sm.playerName} (${loadedFiles[idx]?.fileName})\n`;
      r += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      r += `Mod: ${sm.gameType} | Boyut: ${sm.dimension}\n`;
      r += `Konum: ${sm.position.x}, ${sm.position.y}, ${sm.position.z}\n`;
      r += `Sağlık: ${sm.health}/20 | Açlık: ${sm.foodLevel}/20\n`;
      r += `XP: ${sm.xpLevel} (${sm.xpTotal}) | Süre: ${sm.playTimeMinutes} dk\n\n`;
      r += `Kırılan Blok: ${sm.totalBlocksMined.toLocaleString('tr-TR')}\n`;
      r += `Üretilen Eşya: ${sm.totalItemsCrafted.toLocaleString('tr-TR')}\n`;
      r += `Öldürülen Yaratık: ${sm.totalMobsKilled.toLocaleString('tr-TR')}\n`;
      r += `Ölüm: ${sm.deaths} | Yürünen: ${sm.totalDistanceWalked}m\n`;
      r += `Uçulan: ${sm.totalDistanceFlown}m | Yüzülen: ${sm.totalDistanceSwum}m\n`;
      r += `Envanter: ${sm.inventorySize}/36 (Değer: ${sm.inventoryValue})\n\n`;

      if (sm.topMinedBlocks.length > 0) {
        r += `En Çok Kırılan Bloklar:\n`;
        sm.topMinedBlocks.slice(0, 10).forEach((b, i) => { r += `  ${i + 1}. ${b.name}: ${b.count}\n`; });
        r += '\n';
      }
      if (sm.topKilledMobs.length > 0) {
        r += `En Çok Öldürülen Yaratıklar:\n`;
        sm.topKilledMobs.slice(0, 10).forEach((m, i) => { r += `  ${i + 1}. ${m.name}: ${m.count}\n`; });
        r += '\n';
      }

      const narrs = narratives[idx] || [];
      if (narrs.length > 0) {
        r += `DETAYLI ANALİZ:\n`;
        narrs.forEach(n => { r += `\n${n}\n`; });
      }
      r += '\n';
    });

    if (comparisons.length > 0) {
      r += `═══════════════════════════════════════════════════\n`;
      r += `  KARŞILAŞTIRMALAR\n`;
      r += `═══════════════════════════════════════════════════\n\n`;
      comparisons.forEach((comp, ci) => {
        r += `Karşılaştırma #${ci + 1}:\n`;
        comp.filter(c => c.change !== 0).forEach(c => {
          r += `  ${c.metric}: ${c.oldValue} → ${c.newValue} (${c.change > 0 ? '+' : ''}${c.change}, %${c.changePercent})\n`;
          r += `    ${c.narrative}\n`;
        });
        r += '\n';
      });
    }
    return r;
  };

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #0f172a 100%)', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
        {/* Header */}
        <header style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(16,185,129,0.3)', padding: '12px 20px', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(8px)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '28px' }}>⛏️</span>
              <div>
                <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', margin: 0 }}>Minecraft İstatistik Analiz Sistemi</h1>
                <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>JSON dosyalarınızı analiz edin, grafiklerle görselleştirin</p>
              </div>
            </div>
            {loadedFiles.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {(['dashboard', 'comparison', 'narrative', 'report'] as AppView[]).map(v => (
                  <button key={v} onClick={() => setCurrentView(v)} style={{
                    padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, border: 'none', cursor: 'pointer',
                    background: currentView === v ? '#059669' : '#1f2937', color: currentView === v ? 'white' : '#d1d5db',
                  }}>
                    {v === 'dashboard' ? '📊 Panel' : v === 'comparison' ? '🔄 Karşılaştır' : v === 'narrative' ? '📝 Anlatı' : '📄 Rapor'}
                  </button>
                ))}
                <button onClick={reset} style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '13px', border: 'none', cursor: 'pointer', background: '#7f1d1d', color: '#fca5a5' }}>🗑️ Sıfırla</button>
              </div>
            )}
          </div>
        </header>

        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>
          {/* UPLOAD VIEW */}
          {currentView === 'upload' && (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>⛏️</div>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: '12px' }}>Minecraft İstatistik Analiz Sistemi</h1>
                <p style={{ color: '#9ca3af', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
                  Oyuncu JSON dosyalarınızı yükleyin, detaylı analizler, grafikler ve Türkçe anlatılar ile oyun ilerlemenizi takip edin.
                </p>
              </div>

              {/* User Cache */}
              <div style={{ background: 'rgba(31,41,55,0.5)', border: '1px solid #374151', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ color: '#fbbf24', margin: '0 0 4px 0' }}>📋 usercache.json (Opsiyonel)</h3>
                    <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>UUID → Oyuncu adı eşleştirmesi için</p>
                  </div>
                  <label style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', background: cacheLoaded ? '#065f46' : '#78350f', color: cacheLoaded ? '#6ee7b7' : '#fde68a', border: `1px solid ${cacheLoaded ? '#059669' : '#b45309'}`, fontSize: '14px' }}>
                    {cacheLoaded ? '✅ Yüklendi' : '📁 Dosya Seç'}
                    <input type="file" accept=".json" onChange={handleCacheUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* File Upload */}
              <div style={{ border: '2px dashed #4b5563', borderRadius: '12px', padding: '40px', textAlign: 'center', background: 'rgba(31,41,55,0.3)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
                <h3 style={{ color: '#6ee7b7', marginBottom: '8px' }}>Oyuncu JSON Dosyalarını Yükleyin</h3>
                <p style={{ color: '#9ca3af', marginBottom: '20px', fontSize: '14px' }}>Birden fazla dosya yükleyebilirsiniz. Her dosya farklı bir zaman dilimini temsil eder.</p>
                <label style={{ padding: '12px 24px', background: '#059669', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', display: 'inline-block' }}>
                  📁 Dosya Seç
                  <input type="file" accept=".json" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>

              {/* Demo Button */}
              {loadedFiles.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <button onClick={loadDemo} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '15px' }}>
                    🎮 Demo Veri ile Dene
                  </button>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Örnek verilerle sistemi hemen test edin</p>
                </div>
              )}

              {/* Loaded Files */}
              {loadedFiles.length > 0 && (
                <div style={{ background: 'rgba(31,41,55,0.5)', border: '1px solid #374151', borderRadius: '12px', padding: '20px', marginTop: '20px' }}>
                  <h3 style={{ color: '#10b981', marginBottom: '12px' }}>📊 Yüklenen Dosyalar ({loadedFiles.length})</h3>
                  {loadedFiles.map((f, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(17,24,39,0.5)', borderRadius: '8px', padding: '8px 16px', marginBottom: '6px' }}>
                      <span style={{ color: '#d1d5db', fontSize: '13px' }}>📄 {f.fileName}</span>
                      <span style={{ color: '#6ee7b7', fontSize: '12px' }}>✅ {f.playerName}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Info Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '32px' }}>
                {[
                  { icon: '📈', title: 'Detaylı Grafikler', desc: 'Tüm istatistikler çubuk, pasta ve radar grafiklerle' },
                  { icon: '📝', title: 'Türkçe Anlatı', desc: 'Her veri detaylı Türkçe anlatılarla açıklanır' },
                  { icon: '🔄', title: 'Günlük Karşılaştırma', desc: 'Farklı günlerin verilerini karşılaştırın' },
                ].map((card, i) => (
                  <div key={i} style={{ background: 'rgba(31,41,55,0.3)', border: '1px solid rgba(55,65,81,0.5)', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{card.icon}</div>
                    <h4 style={{ color: '#6ee7b7', marginBottom: '4px', fontSize: '14px' }}>{card.title}</h4>
                    <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DASHBOARD VIEW */}
          {currentView === 'dashboard' && s && (
            <div>
              {/* Player Selector */}
              {summaries.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {summaries.map((sm, i) => (
                    <button key={i} onClick={() => setSelectedIdx(i)} style={{
                      padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                      background: i === selectedIdx ? '#059669' : '#1f2937', color: i === selectedIdx ? 'white' : '#d1d5db',
                    }}>
                      {sm.playerName} ({loadedFiles[i]?.fileName})
                    </button>
                  ))}
                </div>
              )}

              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                {[
                  { icon: '⛏️', label: 'Kırılan Blok', value: s.totalBlocksMined.toLocaleString('tr-TR'), bg: '#064e3b' },
                  { icon: '🔨', label: 'Üretilen Eşya', value: s.totalItemsCrafted.toLocaleString('tr-TR'), bg: '#1e3a5f' },
                  { icon: '⚔️', label: 'Öldürülen Yaratık', value: s.totalMobsKilled.toLocaleString('tr-TR'), bg: '#5f1e1e' },
                  { icon: '🚶', label: 'Yürünen Mesafe', value: `${s.totalDistanceWalked.toLocaleString('tr-TR')} m`, bg: '#5f4b1e' },
                  { icon: '✨', label: 'XP Seviyesi', value: s.xpLevel.toString(), bg: '#3b1e5f' },
                  { icon: '💀', label: 'Ölüm', value: s.deaths.toString(), bg: '#374151' },
                  { icon: '❤️', label: 'Sağlık', value: `${s.health}/20`, bg: '#5f1e3b' },
                  { icon: '🍖', label: 'Açlık', value: `${s.foodLevel}/20`, bg: '#5f3b1e' },
                  { icon: '🕊️', label: 'Uçulan', value: `${s.totalDistanceFlown.toLocaleString('tr-TR')} m`, bg: '#1e4b5f' },
                  { icon: '🏊', label: 'Yüzülen', value: `${s.totalDistanceSwum.toLocaleString('tr-TR')} m`, bg: '#1e5f4b' },
                  { icon: '🦘', label: 'Zıplama', value: s.totalJumps.toLocaleString('tr-TR'), bg: '#2e1e5f' },
                  { icon: '⏰', label: 'Oynama', value: `${s.playTimeMinutes} dk`, bg: '#3b5f1e' },
                ].map((card, i) => (
                  <div key={i} style={{ background: card.bg, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '18px' }}>{card.icon}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>{card.label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '2px' }}>{card.value}</div>
                  </div>
                ))}
              </div>

              {/* Player Info */}
              <div style={{ background: 'rgba(31,41,55,0.5)', border: '1px solid #374151', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', fontSize: '13px' }}>
                  <div><span style={{ color: '#9ca3af' }}>Oyuncu:</span> <span style={{ color: '#10b981', fontWeight: 600 }}>{s.playerName}</span></div>
                  <div><span style={{ color: '#9ca3af' }}>Mod:</span> <span>{s.gameType}</span></div>
                  <div><span style={{ color: '#9ca3af' }}>Boyut:</span> <span>{s.dimension}</span></div>
                  <div><span style={{ color: '#9ca3af' }}>Konum:</span> <span>{s.position.x}, {s.position.y}, {s.position.z}</span></div>
                  <div><span style={{ color: '#9ca3af' }}>Envanter:</span> <span>{s.inventorySize}/36</span></div>
                </div>
              </div>

              {/* Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                {s.topMinedBlocks.length > 0 && (
                  <div style={{ background: 'rgba(31,41,55,0.5)', border: '1px solid #374151', borderRadius: '12px', padding: '20px' }}>
                    <h3 style={{ color: '#10b981', marginBottom: '16px' }}>⛏️ En Çok Kırılan Bloklar</h3>
                    <div style={{ height: '280px' }}>
                      <Bar data={{ labels: s.topMinedBlocks.slice(0, 10).map(b => b.name), datasets: [{ label: 'Adet', data: s.topMinedBlocks.slice(0, 10).map(b => b.count), backgroundColor: colors.slice(0, 10).map(c => c + '80'), borderColor: colors.slice(0, 10), borderWidth: 1 }] }} options={barOpts} />
                    </div>
                  </div>
                )}
                {s.topCraftedItems.length > 0 && (
                  <div style={{ background: 'rgba(31,41,55,0.5)', border: '1px solid #374151', borderRadius: '12px', padding: '20px' }}>
                    <h3 style={{ color: '#3b82f6', marginBottom: '16px' }}>🔨 En Çok Üretilen Eşyalar</h3>
                    <div style={{ height: '280px' }}>
                      <Bar data={{ labels: s.topCraftedItems.slice(0, 10).map(i => i.name), datasets: [{ label: 'Adet', data: s.topCraftedItems.slice(0, 10).map(i => i.count), backgroundColor: colors.slice(0, 10).map(c => c + '80'), borderColor: colors.slice(0, 10), borderWidth: 1 }] }} options={barOpts} />
                    </div>
                  </div>
                )}
                {s.topKilledMobs.length > 0 && (
                  <div style={{ background: 'rgba(31,41,55,0.5)', border: '1px solid #374151', borderRadius: '12px', padding: '20px' }}>
                    <h3 style={{ color: '#ef4444', marginBottom: '16px' }}>⚔️ En Çok Öldürülen Yaratıklar</h3>
                    <div style={{ height: '280px' }}>
                      <Bar data={{ labels: s.topKilledMobs.slice(0, 10).map(m => m.name), datasets: [{ label: 'Adet', data: s.topKilledMobs.slice(0, 10).map(m => m.count), backgroundColor: colors.slice(0, 10).map(c => c + '80'), borderColor: colors.slice(0, 10), borderWidth: 1 }] }} options={barOpts} />
                    </div>
                  </div>
                )}
                <div style={{ background: 'rgba(31,41,55,0.5)', border: '1px solid #374151', borderRadius: '12px', padding: '20px' }}>
                  <h3 style={{ color: '#8b5cf6', marginBottom: '16px' }}>🎯 Genel Performans</h3>
                  <div style={{ height: '280px' }}>
                    <Radar data={{
                      labels: ['Madencilik', 'Üretim', 'Savaş', 'Keşif', 'Hayatta Kalma', 'Deneyim'],
                      datasets: [{ label: s.playerName, data: [Math.min(100, s.totalBlocksMined / 50), Math.min(100, s.totalItemsCrafted / 30), Math.min(100, s.totalMobsKilled / 20), Math.min(100, s.totalDistanceWalked / 5000), Math.max(0, 100 - s.deaths * 5), Math.min(100, s.xpLevel / 3 * 10)], backgroundColor: 'rgba(16,185,129,0.2)', borderColor: '#10b981', borderWidth: 2, pointBackgroundColor: '#10b981' }]
                    }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#9ca3af' } } }, scales: { r: { ticks: { color: '#9ca3af', backdropColor: 'transparent' }, grid: { color: '#374151' }, pointLabels: { color: '#d1d5db' } } } }} />
                  </div>
                </div>
                <div style={{ background: 'rgba(31,41,55,0.5)', border: '1px solid #374151', borderRadius: '12px', padding: '20px' }}>
                  <h3 style={{ color: '#06b6d4', marginBottom: '16px' }}>🎒 Envanter Doluluk</h3>
                  <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '180px', height: '180px' }}>
                      <Doughnut data={{ labels: ['Dolu', 'Boş'], datasets: [{ data: [s.inventorySize, Math.max(0, 36 - s.inventorySize)], backgroundColor: ['#10b981', '#374151'], borderColor: ['#10b981', '#4b5563'], borderWidth: 2 }] }} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { labels: { color: '#9ca3af' } } } }} />
                    </div>
                  </div>
                  <p style={{ textAlign: 'center', fontSize: '13px', color: '#9ca3af' }}>Değer: <span style={{ color: '#fbbf24', fontWeight: 600 }}>{s.inventoryValue} puan</span></p>
                </div>
                {s.topUsedItems.length > 0 && (
                  <div style={{ background: 'rgba(31,41,55,0.5)', border: '1px solid #374151', borderRadius: '12px', padding: '20px' }}>
                    <h3 style={{ color: '#f59e0b', marginBottom: '16px' }}>🖐️ En Çok Kullanılan Eşyalar</h3>
                    <div style={{ height: '280px' }}>
                      <Bar data={{ labels: s.topUsedItems.slice(0, 8).map(i => i.name), datasets: [{ label: 'Kullanım', data: s.topUsedItems.slice(0, 8).map(i => i.count), backgroundColor: colors.slice(0, 8).map(c => c + '80'), borderColor: colors.slice(0, 8), borderWidth: 1 }] }} options={barOpts} />
                    </div>
                  </div>
                )}
              </div>

              {/* Broken Tools Table */}
              {s.topBrokenTools.length > 0 && (
                <div style={{ background: 'rgba(31,41,55,0.5)', border: '1px solid #374151', borderRadius: '12px', padding: '20px', marginTop: '20px' }}>
                  <h3 style={{ color: '#f97316', marginBottom: '16px' }}>🔧 Kırılan Aletler</h3>
                  <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ borderBottom: '1px solid #374151' }}>
                      <th style={{ textAlign: 'left', padding: '8px', color: '#9ca3af' }}>#</th>
                      <th style={{ textAlign: 'left', padding: '8px', color: '#9ca3af' }}>Alet</th>
                      <th style={{ textAlign: 'right', padding: '8px', color: '#9ca3af' }}>Sayı</th>
                    </tr></thead>
                    <tbody>
                      {s.topBrokenTools.map((t, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #1f2937' }}>
                          <td style={{ padding: '8px', color: '#6b7280' }}>{i + 1}</td>
                          <td style={{ padding: '8px' }}>{t.name}</td>
                          <td style={{ padding: '8px', textAlign: 'right', color: '#fb923c', fontFamily: 'monospace' }}>{t.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* All Stats Table */}
              <div style={{ background: 'rgba(31,41,55,0.5)', border: '1px solid #374151', borderRadius: '12px', padding: '20px', marginTop: '20px' }}>
                <h3 style={{ color: '#10b981', marginBottom: '16px' }}>📋 Tüm İstatistikler ({s.allStats.length} kayıt)</h3>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#1f2937' }}><tr style={{ borderBottom: '1px solid #374151' }}>
                      <th style={{ textAlign: 'left', padding: '6px', color: '#9ca3af' }}>#</th>
                      <th style={{ textAlign: 'left', padding: '6px', color: '#9ca3af' }}>Kategori</th>
                      <th style={{ textAlign: 'left', padding: '6px', color: '#9ca3af' }}>İstatistik</th>
                      <th style={{ textAlign: 'right', padding: '6px', color: '#9ca3af' }}>Değer</th>
                    </tr></thead>
                    <tbody>
                      {s.allStats.slice(0, 100).map((st, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(31,41,55,0.5)' }}>
                          <td style={{ padding: '4px 6px', color: '#4b5563' }}>{i + 1}</td>
                          <td style={{ padding: '4px 6px' }}><span style={{ background: '#374151', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>{st.category}</span></td>
                          <td style={{ padding: '4px 6px', color: '#d1d5db' }}>{st.name}</td>
                          <td style={{ padding: '4px 6px', textAlign: 'right', color: '#10b981', fontFamily: 'monospace' }}>{st.value.toLocaleString('tr-TR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* COMPARISON VIEW */}
          {currentView === 'comparison' && (
            <div>
              {summaries.length < 2 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
                  <h2 style={{ color: '#d1d5db' }}>Karşılaştırma İçin En Az 2 Dosya Gerekli</h2>
                  <p style={{ color: '#6b7280' }}>Aynı oyuncunun farklı günlerdeki dosyalarını yükleyin.</p>
                </div>
              ) : (
                <div>
                  <div style={{ background: 'rgba(31,41,55,0.5)', border: '1px solid #374151', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                    <h2 style={{ color: '#10b981', marginBottom: '8px' }}>🔄 Karşılaştırma Analizi</h2>
                    <p style={{ color: '#9ca3af' }}>{summaries.length} veri seti karşılaştırılıyor.</p>
                  </div>

                  {/* Multi-player bar */}
                  <div style={{ background: 'rgba(31,41,55,0.5)', border: '1px solid #374151', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                    <h3 style={{ color: '#3b82f6', marginBottom: '16px' }}>📊 Oyuncular Arası Karşılaştırma</h3>
                    <div style={{ height: '350px' }}>
                      <Bar data={{
                        labels: ['Kırılan Blok', 'Üretilen Eşya', 'Öldürülen Yaratık', 'Yürünen (m)', 'XP Seviyesi', 'Ölüm', 'Oynama (dk)', 'Envanter Değeri'],
                        datasets: summaries.map((sm, i) => ({
                          label: sm.playerName + (summaries.filter(x => x.playerName === sm.playerName).length > 1 ? ` (${i + 1})` : ''),
                          data: [sm.totalBlocksMined, sm.totalItemsCrafted, sm.totalMobsKilled, sm.totalDistanceWalked, sm.xpLevel, sm.deaths, sm.playTimeMinutes, sm.inventoryValue],
                          backgroundColor: colors[i % colors.length] + '80', borderColor: colors[i % colors.length], borderWidth: 1,
                        })),
                      }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#9ca3af' } } }, scales: { x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }, y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } } } }} />
                    </div>
                  </div>

                  {/* Daily progress for same player */}
                  {(() => {
                    const groups: Record<string, PlayerSummary[]> = {};
                    summaries.forEach(sm => { if (!groups[sm.playerName]) groups[sm.playerName] = []; groups[sm.playerName].push(sm); });
                    return Object.entries(groups).filter(([, v]) => v.length >= 2).map(([name, versions]) => (
                      <div key={name} style={{ background: 'rgba(31,41,55,0.5)', border: '1px solid #374151', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                        <h3 style={{ color: '#10b981', marginBottom: '16px' }}>📈 {name} - Günlük İlerleme</h3>
                        <div style={{ height: '300px' }}>
                          <Line data={{
                            labels: versions.map((_, i) => `Veri ${i + 1}`),
                            datasets: [
                              { label: 'Kırılan Blok', data: versions.map(v => v.totalBlocksMined), borderColor: '#10b981', backgroundColor: '#10b98120', fill: true, tension: 0.3 },
                              { label: 'XP Seviyesi', data: versions.map(v => v.xpLevel), borderColor: '#8b5cf6', backgroundColor: '#8b5cf620', fill: true, tension: 0.3 },
                              { label: 'Öldürülen Yaratık', data: versions.map(v => v.totalMobsKilled), borderColor: '#ef4444', backgroundColor: '#ef444420', fill: true, tension: 0.3 },
                            ]
                          }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#9ca3af' } } }, scales: { x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }, y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } } } }} />
                        </div>
                      </div>
                    ));
                  })()}

                  {/* Comparison Tables */}
                  {comparisons.map((comp, ci) => (
                    <div key={ci} style={{ background: 'rgba(31,41,55,0.5)', border: '1px solid #374151', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                      <h3 style={{ color: '#f59e0b', marginBottom: '16px' }}>📋 Detaylı Karşılaştırma #{ci + 1}</h3>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                          <thead><tr style={{ borderBottom: '1px solid #374151' }}>
                            <th style={{ textAlign: 'left', padding: '8px', color: '#9ca3af' }}>Metrik</th>
                            <th style={{ textAlign: 'right', padding: '8px', color: '#9ca3af' }}>Önceki</th>
                            <th style={{ textAlign: 'right', padding: '8px', color: '#9ca3af' }}>Sonraki</th>
                            <th style={{ textAlign: 'right', padding: '8px', color: '#9ca3af' }}>Değişim</th>
                            <th style={{ textAlign: 'right', padding: '8px', color: '#9ca3af' }}>%</th>
                          </tr></thead>
                          <tbody>
                            {comp.map((c, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid #1f2937' }}>
                                <td style={{ padding: '8px' }}>{c.metric}</td>
                                <td style={{ padding: '8px', textAlign: 'right', color: '#9ca3af', fontFamily: 'monospace' }}>{c.oldValue.toLocaleString('tr-TR')}</td>
                                <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace' }}>{c.newValue.toLocaleString('tr-TR')}</td>
                                <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: c.change > 0 ? '#4ade80' : c.change < 0 ? '#f87171' : '#6b7280' }}>{c.change > 0 ? '+' : ''}{c.change.toLocaleString('tr-TR')}</td>
                                <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace', color: c.changePercent > 0 ? '#4ade80' : c.changePercent < 0 ? '#f87171' : '#6b7280' }}>{c.changePercent > 0 ? '+' : ''}{c.changePercent}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ marginTop: '16px' }}>
                        {comp.filter(c => c.change !== 0).slice(0, 5).map((c, i) => (
                          <div key={i} style={{ background: 'rgba(17,24,39,0.5)', borderRadius: '8px', padding: '10px', marginBottom: '6px', fontSize: '13px', color: '#d1d5db' }}>{c.narrative}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NARRATIVE VIEW */}
          {currentView === 'narrative' && s && (
            <div>
              {summaries.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {summaries.map((sm, i) => (
                    <button key={i} onClick={() => setSelectedIdx(i)} style={{
                      padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px',
                      background: i === selectedIdx ? '#059669' : '#1f2937', color: i === selectedIdx ? 'white' : '#d1d5db',
                    }}>📝 {sm.playerName}</button>
                  ))}
                </div>
              )}

              <div style={{ background: 'linear-gradient(135deg, rgba(6,78,59,0.3), rgba(30,58,138,0.3))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
                <h2 style={{ color: '#10b981', marginBottom: '8px' }}>📝 Detaylı Anlatı Raporu</h2>
                <p style={{ color: '#9ca3af' }}><strong style={{ color: 'white' }}>{s.playerName}</strong> için tüm istatistikler detaylı Türkçe anlatılarla açıklanmaktadır.</p>
              </div>

              {(narratives[selectedIdx] || []).map((section, i) => (
                <div key={i} style={{ border: '1px solid rgba(55,65,81,0.5)', borderRadius: '12px', padding: '20px', marginBottom: '12px', background: 'rgba(31,41,55,0.3)' }}>
                  {section.split('\n').map((line, li) => {
                    if (li === 0) return <h3 key={li} style={{ color: '#6ee7b7', marginBottom: '12px', fontSize: '16px' }}>{line}</h3>;
                    if (line.trim() === '') return <br key={li} />;
                    return <p key={li} style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.6', margin: '2px 0' }}>{line}</p>;
                  })}
                </div>
              ))}
            </div>
          )}

          {/* REPORT VIEW */}
          {currentView === 'report' && (
            <div>
              <div style={{ background: 'linear-gradient(135deg, rgba(6,78,59,0.3), rgba(30,58,138,0.3))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ color: '#10b981', marginBottom: '4px' }}>📄 Metin Raporu</h2>
                  <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>Tüm analiz sonuçları metin formatında</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { navigator.clipboard.writeText(generateReport()); }} style={{ padding: '8px 16px', background: '#374151', color: '#d1d5db', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>📋 Kopyala</button>
                  <button onClick={() => { const blob = new Blob([generateReport()], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `mc_rapor_${new Date().toISOString().slice(0, 10)}.txt`; a.click(); }} style={{ padding: '8px 16px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>💾 İndir</button>
                </div>
              </div>
              <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: '12px', padding: '24px', maxHeight: '70vh', overflow: 'auto' }}>
                <pre style={{ color: '#d1d5db', fontSize: '13px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: '1.6', margin: 0 }}>{generateReport()}</pre>
              </div>
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
