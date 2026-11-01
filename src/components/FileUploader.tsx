import { useState, useRef, useCallback } from 'react';
import { LoadedFile, UserCacheEntry } from '../types';

interface FileUploaderProps {
  onFilesUpload: (files: File[]) => void;
  onUserCacheUpload: (entries: UserCacheEntry[]) => void;
  onStartAnalysis: () => void;
  loadedFiles: LoadedFile[];
  isAnalyzing: boolean;
}

export default function FileUploader({
  onFilesUpload,
  onUserCacheUpload,
  onStartAnalysis,
  loadedFiles,
  isAnalyzing,
}: FileUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const playerInputRef = useRef<HTMLInputElement>(null);
  const cacheInputRef = useRef<HTMLInputElement>(null);

  const handlePlayerFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesUpload(files);
    }
  }, [onFilesUpload]);

  const handleCacheFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          onUserCacheUpload(data);
          setCacheLoaded(true);
        }
      } catch (err) {
        console.error('usercache.json okunamadı:', err);
      }
    }
  }, [onUserCacheUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.json'));
    if (files.length > 0) {
      // usercache.json kontrolü
      const cacheFile = files.find(f => f.name === 'usercache.json');
      const playerFiles = files.filter(f => f.name !== 'usercache.json');
      
      if (cacheFile) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target?.result as string);
            if (Array.isArray(data)) {
              onUserCacheUpload(data);
              setCacheLoaded(true);
            }
          } catch (err) {
            console.error('usercache.json okunamadı:', err);
          }
        };
        reader.readAsText(cacheFile);
      }
      
      if (playerFiles.length > 0) {
        onFilesUpload(playerFiles);
      }
    }
  }, [onFilesUpload, onUserCacheUpload]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">⛏️</div>
        <h1 className="text-4xl font-bold text-emerald-400 mb-3">
          Minecraft İstatistik Analiz Sistemi
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Oyuncu JSON dosyalarınızı yükleyin, detaylı analizler, grafikler ve Türkçe anlatılar ile 
          oyun ilerlemenizi takip edin. Günlük karşılaştırmalar yapın, gelişiminizi görün.
        </p>
      </div>

      {/* User Cache Upload */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-yellow-400">📋 usercache.json (Opsiyonel)</h3>
            <p className="text-sm text-gray-400">UUID'leri oyuncu isimlerine eşleştirmek için yükleyin</p>
          </div>
          <button
            onClick={() => cacheInputRef.current?.click()}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              cacheLoaded 
                ? 'bg-green-700/50 text-green-300 border border-green-600' 
                : 'bg-yellow-700/50 text-yellow-300 hover:bg-yellow-600/50 border border-yellow-600'
            }`}
          >
            {cacheLoaded ? '✅ Yüklendi' : '📁 Dosya Seç'}
          </button>
          <input
            ref={cacheInputRef}
            type="file"
            accept=".json"
            onChange={handleCacheFile}
            className="hidden"
          />
        </div>
        {cacheLoaded && (
          <p className="text-sm text-green-400">✅ usercache.json başarıyla yüklendi. Oyuncu isimleri otomatik eşleştirilecek.</p>
        )}
      </div>

      {/* Player Data Upload */}
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
          dragOver
            ? 'border-emerald-400 bg-emerald-900/20'
            : 'border-gray-600 bg-gray-800/30 hover:border-emerald-600'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="text-5xl mb-4">📂</div>
        <h3 className="text-xl font-semibold text-emerald-300 mb-2">
          Oyuncu JSON Dosyalarını Sürükle & Bırak
        </h3>
        <p className="text-gray-400 mb-4">
          Birden fazla dosya yükleyebilirsiniz. Her dosya ayrı bir zaman dilimini temsil eder.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Örnek: Oyuncu1.json (dün), Oyuncu1_bugun.json (bugün) → Günlük karşılaştırma yapılır
        </p>
        
        <button
          onClick={() => playerInputRef.current?.click()}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-all shadow-lg shadow-emerald-900/50"
        >
          📁 Dosya Seç
        </button>
        <input
          ref={playerInputRef}
          type="file"
          accept=".json"
          multiple
          onChange={handlePlayerFiles}
          className="hidden"
        />
      </div>

      {/* Loaded Files List */}
      {loadedFiles.length > 0 && (
        <div className="mt-6 bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-emerald-400 mb-3">
            📊 Yüklenen Dosyalar ({loadedFiles.length})
          </h3>
          <div className="space-y-2">
            {loadedFiles.map((file, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-900/50 rounded-lg px-4 py-2">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400">📄</span>
                  <span className="text-sm text-gray-300">{file.fileName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    Oyuncu: {file.playerName}
                  </span>
                  <span className="text-green-400 text-xs">✅ Analiz edildi</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => playerInputRef.current?.click()}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-all"
            >
              + Daha Fazla Dosya Ekle
            </button>
            <button
              onClick={onStartAnalysis}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-all"
            >
              📊 Analiz Paneline Git →
            </button>
          </div>
        </div>
      )}

      {/* Demo Button */}
      {loadedFiles.length === 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              // Demo verisi oluştur
              const demoData1 = {
                UUID: "12345678-1234-1234-1234-123456789012",
                GameType: 0,
                Pos: [150, 64, -230],
                Dimension: "minecraft:overworld",
                Health: 18,
                foodLevel: 16,
                XpLevel: 24,
                XpTotal: 3420,
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
                  "minecraft:mined": {
                    "minecraft:stone": 4523,
                    "minecraft:dirt": 2341,
                    "minecraft:cobblestone": 1890,
                    "minecraft:oak_log": 890,
                    "minecraft:iron_ore": 456,
                    "minecraft:coal_ore": 678,
                    "minecraft:diamond_ore": 34,
                    "minecraft:deepslate": 1234,
                    "minecraft:gravel": 567,
                    "minecraft:deepslate_iron_ore": 234,
                    "minecraft:deepslate_diamond_ore": 12,
                    "minecraft:ancient_debris": 8,
                    "minecraft:netherrack": 3456,
                    "minecraft:redstone_ore": 345,
                    "minecraft:gold_ore": 123,
                  },
                  "minecraft:crafted": {
                    "minecraft:crafting_table": 12,
                    "minecraft:furnace": 8,
                    "minecraft:iron_pickaxe": 5,
                    "minecraft:diamond_pickaxe": 2,
                    "minecraft:torch": 256,
                    "minecraft:oak_planks": 340,
                    "minecraft:stick": 450,
                    "minecraft:iron_ingot": 180,
                    "minecraft:diamond_sword": 1,
                    "minecraft:stone_bricks": 890,
                    "minecraft:chest": 15,
                    "minecraft:shield": 1,
                  },
                  "minecraft:used": {
                    "minecraft:diamond_pickaxe": 3456,
                    "minecraft:iron_pickaxe": 1234,
                    "minecraft:diamond_sword": 890,
                    "minecraft:crafting_table": 456,
                    "minecraft:furnace": 234,
                    "minecraft:torch": 567,
                    "minecraft:cobblestone": 1890,
                    "minecraft:oak_planks": 678,
                  },
                  "minecraft:broken": {
                    "minecraft:iron_pickaxe": 12,
                    "minecraft:stone_pickaxe": 34,
                    "minecraft:iron_sword": 5,
                    "minecraft:stone_sword": 8,
                    "minecraft:iron_axe": 3,
                    "minecraft:fishing_rod": 2,
                    "minecraft:shield": 4,
                    "minecraft:iron_shovel": 6,
                  },
                  "minecraft:killed": {
                    "minecraft:zombie": 234,
                    "minecraft:skeleton": 189,
                    "minecraft:creeper": 67,
                    "minecraft:spider": 123,
                    "minecraft:enderman": 45,
                    "minecraft:blaze": 78,
                    "minecraft:piglin": 34,
                    "minecraft:witch": 12,
                    "minecraft:ghast": 8,
                    "minecraft:wither_skeleton": 23,
                    "minecraft:slime": 56,
                    "minecraft:phantom": 15,
                  },
                  "minecraft:killed_by": {
                    "minecraft:creeper": 5,
                    "minecraft:zombie": 3,
                    "minecraft:skeleton": 4,
                    "minecraft:enderman": 1,
                    "minecraft:fall": 2,
                    "minecraft:lava": 3,
                  },
                  "minecraft:custom": {
                    "minecraft:play_time": 2160000,
                    "minecraft:walk_one_cm": 8923456,
                    "minecraft:sprint_one_cm": 3456789,
                    "minecraft:fly_one_cm": 234567,
                    "minecraft:walk_under_water_one_cm": 456789,
                    "minecraft:jump": 34567,
                    "minecraft:deaths": 18,
                    "minecraft:damage_dealt": 456789,
                    "minecraft:damage_taken": 234567,
                    "minecraft:chest_opened": 89,
                    "minecraft:enderchest_opened": 23,
                    "minecraft:crafting_table_interaction": 456,
                    "minecraft:furnace_interaction": 234,
                    "minecraft:enchant_item": 34,
                    "minecraft:fish_caught": 67,
                    "minecraft:sleep_in_bed": 45,
                    "minecraft:talked_to_villager": 23,
                    "minecraft:traded_with_villager": 18,
                    "minecraft:bell_ring": 5,
                  },
                  "minecraft:picked_up": {
                    "minecraft:cobblestone": 5678,
                    "minecraft:dirt": 3456,
                    "minecraft:iron_ingot": 234,
                    "minecraft:diamond": 34,
                    "minecraft:coal": 456,
                    "minecraft:oak_log": 890,
                    "minecraft:experience_orb": 12345,
                  },
                },
                SpawnX: 0,
                SpawnY: 64,
                SpawnZ: 0,
                SpawnDimension: "minecraft:overworld",
              };

              const demoData2 = {
                ...demoData1,
                Pos: [320, 45, -450],
                Health: 20,
                foodLevel: 20,
                XpLevel: 31,
                XpTotal: 5670,
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
                  "minecraft:mined": {
                    "minecraft:stone": 6234,
                    "minecraft:dirt": 3100,
                    "minecraft:cobblestone": 2567,
                    "minecraft:oak_log": 1234,
                    "minecraft:iron_ore": 678,
                    "minecraft:coal_ore": 890,
                    "minecraft:diamond_ore": 56,
                    "minecraft:deepslate": 2345,
                    "minecraft:gravel": 789,
                    "minecraft:deepslate_iron_ore": 456,
                    "minecraft:deepslate_diamond_ore": 23,
                    "minecraft:ancient_debris": 15,
                    "minecraft:netherrack": 5678,
                    "minecraft:redstone_ore": 567,
                    "minecraft:gold_ore": 234,
                    "minecraft:emerald_ore": 8,
                    "minecraft:end_stone": 345,
                  },
                  "minecraft:crafted": {
                    "minecraft:crafting_table": 15,
                    "minecraft:furnace": 12,
                    "minecraft:iron_pickaxe": 5,
                    "minecraft:diamond_pickaxe": 3,
                    "minecraft:netherite_pickaxe": 1,
                    "minecraft:torch": 456,
                    "minecraft:oak_planks": 567,
                    "minecraft:stick": 678,
                    "minecraft:iron_ingot": 345,
                    "minecraft:diamond_sword": 2,
                    "minecraft:stone_bricks": 1234,
                    "minecraft:chest": 23,
                    "minecraft:shield": 2,
                    "minecraft:enchanting_table": 1,
                    "minecraft:bookshelf": 15,
                    "minecraft:anvil": 1,
                    "minecraft:beacon": 1,
                  },
                  "minecraft:used": {
                    "minecraft:diamond_pickaxe": 4567,
                    "minecraft:netherite_pickaxe": 1234,
                    "minecraft:diamond_sword": 1456,
                    "minecraft:crafting_table": 678,
                    "minecraft:furnace": 345,
                    "minecraft:torch": 890,
                    "minecraft:cobblestone": 2567,
                    "minecraft:oak_planks": 890,
                    "minecraft:elytra": 567,
                    "minecraft:ender_pearl": 234,
                  },
                  "minecraft:broken": {
                    "minecraft:iron_pickaxe": 15,
                    "minecraft:stone_pickaxe": 40,
                    "minecraft:iron_sword": 8,
                    "minecraft:stone_sword": 12,
                    "minecraft:iron_axe": 5,
                    "minecraft:fishing_rod": 3,
                    "minecraft:shield": 6,
                    "minecraft:iron_shovel": 8,
                    "minecraft:diamond_pickaxe": 2,
                  },
                  "minecraft:killed": {
                    "minecraft:zombie": 345,
                    "minecraft:skeleton": 267,
                    "minecraft:creeper": 89,
                    "minecraft:spider": 178,
                    "minecraft:enderman": 67,
                    "minecraft:blaze": 123,
                    "minecraft:piglin": 56,
                    "minecraft:witch": 23,
                    "minecraft:ghast": 15,
                    "minecraft:wither_skeleton": 45,
                    "minecraft:slime": 78,
                    "minecraft:phantom": 23,
                    "minecraft:ender_dragon": 1,
                    "minecraft:warden": 1,
                    "minecraft:piglin_brute": 12,
                    "minecraft:hoglin": 34,
                  },
                  "minecraft:killed_by": {
                    "minecraft:creeper": 7,
                    "minecraft:zombie": 4,
                    "minecraft:skeleton": 5,
                    "minecraft:enderman": 2,
                    "minecraft:fall": 3,
                    "minecraft:lava": 4,
                    "minecraft:warden": 2,
                    "minecraft:wither_skeleton": 1,
                  },
                  "minecraft:custom": {
                    "minecraft:play_time": 3240000,
                    "minecraft:walk_one_cm": 12345678,
                    "minecraft:sprint_one_cm": 5678901,
                    "minecraft:fly_one_cm": 1234567,
                    "minecraft:walk_under_water_one_cm": 678901,
                    "minecraft:jump": 45678,
                    "minecraft:deaths": 28,
                    "minecraft:damage_dealt": 789012,
                    "minecraft:damage_taken": 345678,
                    "minecraft:chest_opened": 134,
                    "minecraft:enderchest_opened": 45,
                    "minecraft:crafting_table_interaction": 678,
                    "minecraft:furnace_interaction": 345,
                    "minecraft:enchant_item": 67,
                    "minecraft:fish_caught": 89,
                    "minecraft:sleep_in_bed": 67,
                    "minecraft:talked_to_villager": 45,
                    "minecraft:traded_with_villager": 34,
                    "minecraft:bell_ring": 8,
                    "minecraft:raid_win": 3,
                    "minecraft:totem_used": 2,
                  },
                  "minecraft:picked_up": {
                    "minecraft:cobblestone": 7890,
                    "minecraft:dirt": 4567,
                    "minecraft:iron_ingot": 345,
                    "minecraft:diamond": 56,
                    "minecraft:coal": 678,
                    "minecraft:oak_log": 1234,
                    "minecraft:experience_orb": 23456,
                    "minecraft:netherite_scrap": 15,
                    "minecraft:ender_pearl": 45,
                  },
                },
                SpawnX: 0,
                SpawnY: 64,
                SpawnZ: 0,
                SpawnDimension: "minecraft:overworld",
              };

              const file1 = new File([JSON.stringify(demoData1)], 'Steve_gun.json', { type: 'application/json' });
              const file2 = new File([JSON.stringify(demoData2)], 'Steve_bugun.json', { type: 'application/json' });
              onFilesUpload([file1, file2]);
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg font-semibold transition-all shadow-lg"
          >
            🎮 Demo Veri ile Dene
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Örnek Minecraft oyuncu verileri ile sistemi hemen test edin
          </p>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-5">
          <div className="text-2xl mb-2">📈</div>
          <h4 className="font-semibold text-emerald-300 mb-1">Detaylı Grafikler</h4>
          <p className="text-sm text-gray-400">
            Tüm istatistikleriniz çubuk, pasta ve çizgi grafiklerle görselleştirilir.
          </p>
        </div>
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-5">
          <div className="text-2xl mb-2">📝</div>
          <h4 className="font-semibold text-emerald-300 mb-1">Türkçe Anlatı</h4>
          <p className="text-sm text-gray-400">
            Her veri detaylı Türkçe anlatılarla açıklanır. Ne olmuş, neden olmuş, ne yapmalı?
          </p>
        </div>
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-5">
          <div className="text-2xl mb-2">🔄</div>
          <h4 className="font-semibold text-emerald-300 mb-1">Günlük Karşılaştırma</h4>
          <p className="text-sm text-gray-400">
            Farklı günlerin verilerini karşılaştırın, gelişiminizi takip edin.
          </p>
        </div>
      </div>

      {/* Analyzing Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-emerald-700 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4 animate-bounce">⛏️</div>
            <h3 className="text-xl font-bold text-emerald-400 mb-2">Analiz Ediliyor...</h3>
            <p className="text-gray-400">JSON dosyaları işleniyor ve grafikler hazırlanıyor</p>
            <div className="mt-4 w-48 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-emerald-500 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
