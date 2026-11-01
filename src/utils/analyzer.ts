import { PlayerData, LoadedFile, PlayerSummary, InventoryItem, ComparisonResult } from '../types';

// Stat kategorileri
const STAT_CATEGORIES: Record<string, string> = {
  'minecraft:mined': 'Kırılan Bloklar',
  'minecraft:crafted': 'Üretilen Eşyalar',
  'minecraft:used': 'Kullanılan Eşyalar',
  'minecraft:broken': 'Kırılan Aletler',
  'minecraft:picked_up': 'Toplanan Eşyalar',
  'minecraft:dropped': 'Bırakılan Eşyalar',
  'minecraft:killed': 'Öldürülen Yaratıklar',
  'minecraft:killed_by': 'Tarafından Öldürülme',
  'minecraft:killed:entity': 'Öldürülen Varlıklar',
  'minecraft:custom': 'Özel İstatistikler',
  'stat_type.minecraft.mined': 'Kırılan Bloklar',
  'stat_type.minecraft.crafted': 'Üretilen Eşyalar',
  'stat_type.minecraft.used': 'Kullanılan Eşyalar',
  'stat_type.minecraft.broken': 'Kırılan Aletler',
  'stat_type.minecraft.picked_up': 'Toplanan Eşyalar',
  'stat_type.minecraft.dropped': 'Bırakılan Eşyalar',
  'stat_type.minecraft.killed': 'Öldürülen Yaratıklar',
  'stat_type.minecraft.killed_by': 'Tarafından Öldürülme',
  'stat_type.minecraft.killed:entity': 'Öldürülen Varlıklar',
};

// Özel istatistik isimleri
const CUSTOM_STATS: Record<string, string> = {
  'minecraft:play_time': 'Oynama Süresi (tick)',
  'minecraft:walk_one_cm': 'Yürünen Mesafe (cm)',
  'minecraft:crouch_one_cm': 'Eğilerek Yürüme (cm)',
  'minecraft:sprint_one_cm': 'Koşulan Mesafe (cm)',
  'minecraft:walk_on_water_one_cm': 'Su Üstünde Yürüme (cm)',
  'minecraft:fall_one_cm': 'Düşülen Mesafe (cm)',
  'minecraft:climb_one_cm': 'Tırmanılan Mesafe (cm)',
  'minecraft:fly_one_cm': 'Uçulan Mesafe (cm)',
  'minecraft:walk_under_water_one_cm': 'Su Altında Yürüme (cm)',
  'minecraft:minecart_one_cm': 'Maden Arabası Mesafesi (cm)',
  'minecraft:boat_one_cm': 'Tekne Mesafesi (cm)',
  'minecraft:pig_one_cm': 'Domuz Mesafesi (cm)',
  'minecraft:horse_one_cm': 'At Mesafesi (cm)',
  'minecraft:aviate_one_cm': 'Elitra Mesafesi (cm)',
  'minecraft:jump': 'Zıplama Sayısı',
  'minecraft:deaths': 'Ölüm Sayısı',
  'minecraft:damage_dealt': 'Verilen Hasar',
  'minecraft:damage_taken': 'Alınan Hasar',
  'minecraft:damage_dealt_absorbed': 'Emilen Hasar',
  'minecraft:damage_blocked_by_shield': 'Kalkanla Bloklanan Hasar',
  'minecraft:armor_cleaned': 'Temizlenen Zırh',
  'minecraft:banner_cleaned': 'Temizlenen Bayrak',
  'minecraft:beacon_interaction': 'Fener Etkileşimi',
  'minecraft:bell_ring': 'Çan Çalma',
  'minecraft:brewingstand_interaction': 'İksir Standı Etkileşimi',
  'minecraft:cake_slices_eaten': 'Yenen Pasta Dilimi',
  'minecraft:cauldron_filled': 'Doldurulan Kazan',
  'minecraft:chest_opened': 'Açılan Sandık',
  'minecraft:crafting_table_interaction': 'Çalışma Masası Etkileşimi',
  'minecraft:enderchest_opened': 'Açılan Ender Sandığı',
  'minecraft:enchant_item': 'Büyülenmiş Eşya',
  'minecraft:fish_caught': 'Tutulan Balık',
  'minecraft:furnace_interaction': 'Fırın Etkileşimi',
  'minecraft:hopper_inspected': 'Kontrol Edilen Huni',
  'minecraft:interact_with_anvil': 'Örs Etkileşimi',
  'minecraft:interact_with_blast_furnace': 'Maden Fırını Etkileşimi',
  'minecraft:interact_with_campfire': 'Kamp Ateşi Etkileşimi',
  'minecraft:interact_with_cartography_table': 'Haritacılık Masası Etkileşimi',
  'minecraft:interact_with_grindstone': 'Bileği Taşı Etkileşimi',
  'minecraft:interact_with_lectern': 'Kürsü Etkileşimi',
  'minecraft:interact_with_loom': 'Dokuma Tezgahı Etkileşimi',
  'minecraft:interact_with_smithing_table': 'Demirci Masası Etkileşimi',
  'minecraft:interact_with_smoker': 'Duman Fırını Etkileşimi',
  'minecraft:interact_with_stonecutter': 'Taş Kesici Etkileşimi',
  'minecraft:leave_game': 'Oyundan Çıkış',
  'minecraft:look_at_beehive': 'Arı Kovanına Bakma',
  'minecraft:mob_interactions': 'Yaratık Etkileşimleri',
  'minecraft:noteblock_played': 'Çalınan Nota Bloğu',
  'minecraft:noteblock_tuned': 'Ayarlanan Nota Bloğu',
  'minecraft:open_barrel': 'Açılan Varil',
  'minecraft:open_shulker_box': 'Açılan Shulker Kutusu',
  'minecraft:play_record': 'Çalınan Plak',
  'minecraft:pot_flower': 'Ekilen Çiçek',
  'minecraft:raid_trigger': 'Tetiklenen Baskın',
  'minecraft:raid_win': 'Kazanılan Baskın',
  'minecraft:sleep_in_bed': 'Yatakta Uyuma',
  'minecraft:sneak_time': 'Eğilme Süresi',
  'minecraft:talked_to_villager': 'Köylü ile Konuşma',
  'minecraft:target_hit': 'Hedef Vurma',
  'minecraft:time_since_death': 'Son Ölümden Beri',
  'minecraft:time_since_rest': 'Son Uyumadan Beri',
  'minecraft:totem_used': 'Kullanılan Totem',
  'minecraft:traded_with_villager': 'Köylü ile Ticaret',
  'minecraft:trigger_trapped_chest': 'Tetiklenen Tuzaklı Sandık',
  'minecraft:use_cauldron': 'Kazan Kullanımı',
  'minecraft:inspect_dispenser': 'Kontrol Edilen Fırlatıcı',
  'minecraft:inspect_dropper': 'Kontrol Edilen Düşürücü',
  'minecraft:inspect_hopper': 'Kontrol Edilen Huni',
  'minecraft:strider_one_cm': 'Strider Binme Mesafesi',
};

// Boyut isimleri
const DIMENSION_NAMES: Record<string, string> = {
  'minecraft:overworld': 'Dünya (Overworld)',
  'minecraft:the_nether': 'Nether',
  'minecraft:the_end': 'End',
  'minecraft:overworld_caves': 'Dünya Mağaraları',
};

// Oyun modu isimleri
const GAMETYPE_NAMES: Record<number, string> = {
  0: 'Hayatta Kalma (Survival)',
  1: 'Yaratıcı (Creative)',
  2: 'Macera (Adventure)',
  3: 'İzleyici (Spectator)',
};

// Eşya/blok isimlerini Türkçeleştir
function translateItemName(name: string): string {
  if (!name) return 'Bilinmiyor';
  
  // minecraft: prefix'ini kaldır
  const cleanName = name.replace('minecraft:', '');
  
  const translations: Record<string, string> = {
    'stone': 'Taş', 'granite': 'Granit', 'diorite': 'Diyorit', 'andesite': 'Andezit',
    'dirt': 'Toprak', 'grass_block': 'Çimen Bloğu', 'cobblestone': 'Kaldırım Taşı',
    'oak_log': 'Meşe Kütüğü', 'birch_log': 'Huş Kütüğü', 'spruce_log': 'Ladin Kütüğü',
    'oak_planks': 'Meşe Tahta', 'birch_planks': 'Huş Tahta', 'spruce_planks': 'Ladin Tahta',
    'sand': 'Kum', 'gravel': 'Çakıl', 'iron_ore': 'Demir Cevheri', 'gold_ore': 'Altın Cevheri',
    'diamond_ore': 'Elmas Cevheri', 'coal_ore': 'Kömür Cevheri', 'redstone_ore': 'Redstone Cevheri',
    'lapis_ore': 'Lapis Cevheri', 'emerald_ore': 'Zümrüt Cevheri', 'copper_ore': 'Bakır Cevheri',
    'deepslate_iron_ore': 'Kayrak Taşı Demir Cevheri', 'deepslate_gold_ore': 'Kayrak Taşı Altın Cevheri',
    'deepslate_diamond_ore': 'Kayrak Taşı Elmas Cevheri', 'deepslate_coal_ore': 'Kayrak Taşı Kömür Cevheri',
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
    'wooden_hoe': 'Tahta Çapa', 'stone_hoe': 'Taş Çapa',
    'iron_hoe': 'Demir Çapa', 'golden_hoe': 'Altın Çapa',
    'diamond_hoe': 'Elmas Çapa', 'netherite_hoe': 'Netherit Çapa',
    'bow': 'Yay', 'crossbow': 'Arbalet', 'trident': 'Üçlü Mızrak',
    'arrow': 'Ok', 'spectral_arrow': 'Hayalet Ok', 'tipped_arrow': 'İksirli Ok',
    'shield': 'Kalkan', 'totem_of_undying': 'Ölümsüzlük Totemi',
    'elytra': 'Elitra', 'firework_rocket': 'Havai Fişek',
    'apple': 'Elma', 'golden_apple': 'Altın Elma', 'enchanted_golden_apple': 'Büyülü Altın Elma',
    'bread': 'Ekmek', 'cooked_beef': 'Pişmiş Biftek', 'cooked_porkchop': 'Pişmiş Domuz Pirzola',
    'cooked_chicken': 'Pişmiş Tavuk', 'cooked_mutton': 'Pişmiş Koyun Eti',
    'cooked_salmon': 'Pişmiş Somon', 'cooked_cod': 'Pişmiş Morina',
    'cake': 'Pasta', 'cookie': 'Kurabiye', 'melon_slice': 'Karpuz Dilimi',
    'sweet_berries': 'Tatlı Meyveler', 'glow_berries': 'Parlayan Meyveler',
    'potion': 'İksir', 'splash_potion': 'Patlayıcı İksir', 'lingering_potion': 'Kalıcı İksir',
    'ender_pearl': 'Ender İncisi', 'eye_of_ender': 'Ender Gözü',
    'ender_eye': 'Ender Gözü', 'blaze_rod': 'Blaze Çubuğu', 'blaze_powder': 'Blaze Tozu',
    'ghast_tear': 'Ghast Gözyaşı', 'spider_eye': 'Örümcek Gözü',
    'gunpowder': 'Barut', 'string': 'İp', 'feather': 'Tüy',
    'bone': 'Kemik', 'bone_meal': 'Kemik Tozu', 'leather': 'Deri',
    'rabbit_hide': 'Tavşan Derisi', 'rabbit_foot': 'Tavşan Ayağı',
    'slime_ball': 'Balçık Topu', 'magma_cream': 'Magma Kremi',
    'phantom_membrane': 'Hayalet Zarı', 'shulker_shell': 'Shulker Kabuğu',
    'nether_star': 'Nether Yıldızı', 'dragon_egg': 'Ejderha Yumurtası',
    'dragon_head': 'Ejderha Kafası', 'dragon_breath': 'Ejderha Nefesi',
    'experience_bottle': 'Deneyim Şişesi', 'enchanted_book': 'Büyülü Kitap',
    'book': 'Kitap', 'paper': 'Kağıt', 'writable_book': 'Yazılabilir Kitap',
    'written_book': 'Yazılmış Kitap', 'name_tag': 'İsim Etiketi',
    'lead': 'Tasma', 'saddle': 'Eyer', 'carrot_on_a_stick': 'Havuçlu Olta',
    'fishing_rod': 'Olta', 'flint_and_steel': 'Çakmak Taşı ve Çelik',
    'shears': 'Makas', 'bucket': 'Kova', 'water_bucket': 'Su Kovası',
    'lava_bucket': 'Lav Kovası', 'milk_bucket': 'Süt Kovası',
    'powder_snow_bucket': 'Toz Kar Kovası', 'axolotl_bucket': 'Axolotl Kovası',
    'cod_bucket': 'Morina Kovası', 'salmon_bucket': 'Somon Kovası',
    'tropical_fish_bucket': 'Tropikal Balık Kovası', 'pufferfish_bucket': 'Balon Balığı Kovası',
    'tnt': 'TNT', 'torch': 'Meşale', 'soul_torch': 'Ruh Meşalesi',
    'lantern': 'Fener', 'soul_lantern': 'Ruh Feneri',
    'crafting_table': 'Çalışma Masası', 'furnace': 'Fırın',
    'blast_furnace': 'Maden Fırını', 'smoker': 'Duman Fırını',
    'anvil': 'Örs', 'chipped_anvil': 'Çatlak Örs', 'damaged_anvil': 'Hasarlı Örs',
    'enchanting_table': 'Büyü Masası', 'brewing_stand': 'İksir Standı',
    'beacon': 'Fener', 'ender_chest': 'Ender Sandığı',
    'chest': 'Sandık', 'barrel': 'Varil', 'shulker_box': 'Shulker Kutusu',
    'hopper': 'Huni', 'dispenser': 'Fırlatıcı', 'dropper': 'Düşürücü',
    'observer': 'Gözlemci', 'piston': 'Piston', 'sticky_piston': 'Yapışkan Piston',
    'redstone_block': 'Redstone Bloğu', 'redstone_torch': 'Redstone Meşalesi',
    'repeater': 'Tekrarlayıcı', 'comparator': 'Karşılaştırıcı',
    'lever': 'Şalter', 'button': 'Düğme', 'pressure_plate': 'Basınç Plakası',
    'tripwire_hook': 'Tuzaklı Tel Kancası', 'daylight_detector': 'Gün Işığı Dedektörü',
    'note_block': 'Nota Bloğu', 'jukebox': 'Müzik Kutusu',
    'glass': 'Cam', 'glass_pane': 'Cam Panel', 'tinted_glass': 'Koyu Cam',
    'bricks': 'Tuğla', 'stone_bricks': 'Taş Tuğla', 'nether_bricks': 'Nether Tuğlası',
    'end_stone_bricks': 'End Taş Tuğlası', 'quartz_block': 'Kuvars Bloğu',
    'prismarine': 'Prizmarin', 'sea_lantern': 'Deniz Feneri',
    'concrete': 'Beton', 'terracotta': 'Terakota', 'wool': 'Yün',
    'oak_door': 'Meşe Kapı', 'iron_door': 'Demir Kapı', 'oak_trapdoor': 'Meşe Tuzak Kapısı',
    'iron_trapdoor': 'Demir Tuzak Kapısı', 'oak_fence': 'Meşe Çit',
    'oak_fence_gate': 'Meşe Çit Kapısı', 'oak_stairs': 'Meşe Merdiven',
    'oak_slab': 'Meşe Basamak', 'oak_sign': 'Meşe Tabela',
    'oak_boat': 'Meşe Tekne', 'oak_chest_boat': 'Meşe Sandıklı Tekne',
    'rail': 'Ray', 'powered_rail': 'Güçlü Ray', 'detector_rail': 'Dedektör Rayı',
    'activator_rail': 'Aktivatör Rayı', 'minecart': 'Maden Arabası',
    'chest_minecart': 'Sandıklı Maden Arabası', 'furnace_minecart': 'Fırınlı Maden Arabası',
    'tnt_minecart': 'TNT Maden Arabası', 'hopper_minecart': 'Hunili Maden Arabası',
    'wheat': 'Buğday', 'wheat_seeds': 'Buğday Tohumu', 'carrot': 'Havuç',
    'potato': 'Patates', 'baked_potato': 'Pişmiş Patates', 'beetroot': 'Pancar',
    'beetroot_seeds': 'Pancar Tohumu', 'pumpkin': 'Balkabağı', 'carved_pumpkin': 'Oyulmuş Balkabağı',
    'pumpkin_seeds': 'Balkabağı Tohumu', 'melon': 'Karpuz', 'melon_seeds': 'Karpuz Tohumu',
    'sugar_cane': 'Şeker Kamışı', 'cactus': 'Kaktüs', 'bamboo': 'Bambu',
    'kelp': 'Su Yosunu', 'dried_kelp': 'Kurutulmuş Su Yosunu',
    'sugar': 'Şeker', 'honey_bottle': 'Bal Şişesi', 'honeycomb': 'Bal Peteği',
    'nether_wart': 'Nether Mantarı', 'chorus_fruit': 'Koro Meyvesi',
    'popped_chorus_fruit': 'Patlamış Koro Meyvesi',
    'mushroom_stew': 'Mantar Güveç', 'rabbit_stew': 'Tavşan Güveç',
    'beetroot_soup': 'Pancar Çorbası', 'suspicious_stew': 'Şüpheli Güveç',
    'zombie': 'Zombi', 'skeleton': 'İskelet', 'creeper': 'Creeper',
    'spider': 'Örümcek', 'enderman': 'Enderman', 'blaze': 'Blaze',
    'ghast': 'Ghast', 'wither_skeleton': 'Wither İskeleti', 'piglin': 'Piglin',
    'piglin_brute': 'Piglin Brute', 'hoglin': 'Hoglin', 'zoglin': 'Zoglin',
    'ender_dragon': 'Ender Ejderhası', 'wither': 'Wither', 'warden': 'Warden',
    'villager': 'Köylü', 'iron_golem': 'Demir Golem', 'snow_golem': 'Kar Golem',
    'wolf': 'Kurt', 'cat': 'Kedi', 'horse': 'At', 'donkey': 'Eşek',
    'mule': 'Katır', 'llama': 'Lama', 'axolotl': 'Axolotl',
    'bee': 'Arı', 'dolphin': 'Yunus', 'turtle': 'Kaplumbağa',
    'squid': 'Mürekkep Balığı', 'glow_squid': 'Parlayan Mürekkep Balığı',
    'cod': 'Morina', 'salmon': 'Somon', 'tropical_fish': 'Tropikal Balık',
    'pufferfish': 'Balon Balığı', 'phantom': 'Hayalet', 'drowned': 'Boğuk',
    'husk': 'Kurutulmuş Zombi', 'stray': 'Serseri İskelet',
    'magma_cube': 'Magma Küpü', 'slime': 'Balçık', 'silverfish': 'Gümüş Balığı',
    'endermite': 'Endermite', 'ravager': 'Yıkıcı', 'vindicator': 'İntikamcı',
    'evoker': 'Büyücü', 'pillager': 'Yağmacı', 'witch': 'Cadı',
  };

  return translations[cleanName] || cleanName.replace(/_/g, ' ');
}

// İstatistik anahtarını ayrıştır
function parseStatKey(key: string): { category: string; name: string; translatedName: string } {
  // Yeni format: stat_type.minecraft.mined -> minecraft:stone
  const statTypeMatch = key.match(/^stat_type\.minecraft\.(\w+)$/);
  if (statTypeMatch) {
    return {
      category: STAT_CATEGORIES[`stat_type.minecraft.${statTypeMatch[1]}`] || statTypeMatch[1],
      name: key,
      translatedName: key,
    };
  }

  // Eski format: minecraft:mined -> minecraft:stone
  const oldFormatMatch = key.match(/^minecraft:(\w+)$/);
  if (oldFormatMatch) {
    return {
      category: STAT_CATEGORIES[key] || oldFormatMatch[1],
      name: key,
      translatedName: key,
    };
  }

  return { category: 'Diğer', name: key, translatedName: translateItemName(key) };
}

// Envanter değeri hesaplama (basit bir değer sistemi)
function calculateInventoryValue(items: InventoryItem[]): number {
  const itemValues: Record<string, number> = {
    'minecraft:diamond': 100, 'minecraft:emerald': 80, 'minecraft:netherite_ingot': 200,
    'minecraft:netherite_scrap': 50, 'minecraft:gold_ingot': 20, 'minecraft:iron_ingot': 10,
    'minecraft:copper_ingot': 5, 'minecraft:coal': 2, 'minecraft:redstone': 3,
    'minecraft:lapis_lazuli': 5, 'minecraft:quartz': 4, 'minecraft:ancient_debris': 150,
    'minecraft:nether_star': 500, 'minecraft:elytra': 300, 'minecraft:totem_of_undying': 250,
    'minecraft:ender_pearl': 15, 'minecraft:blaze_rod': 20, 'minecraft:ghast_tear': 30,
    'minecraft:dragon_egg': 1000, 'minecraft:enchanted_golden_apple': 50,
    'minecraft:diamond_pickaxe': 300, 'minecraft:diamond_sword': 300,
    'minecraft:netherite_pickaxe': 500, 'minecraft:netherite_sword': 500,
    'minecraft:experience_bottle': 5, 'minecraft:golden_apple': 25,
  };

  let total = 0;
  for (const item of items) {
    if (item.id) {
      const baseValue = itemValues[item.id] || 1;
      total += baseValue * (item.Count || 1);
    }
  }
  return total;
}

// Ana analiz fonksiyonu
export function analyzePlayerData(loadedFile: LoadedFile): PlayerSummary {
  const data = loadedFile.data;
  
  // Oyun modu
  const gameType = GAMETYPE_NAMES[data.GameType ?? 0] || 'Bilinmiyor';
  
  // Boyut
  const dimension = DIMENSION_NAMES[data.Dimension || 'minecraft:overworld'] || data.Dimension || 'Dünya';
  
  // Pozisyon
  const pos = data.Pos || [0, 0, 0];
  const position = { x: Math.round(pos[0] || 0), y: Math.round(pos[1] || 0), z: Math.round(pos[2] || 0) };
  
  // Sağlık ve açlık
  const health = data.Health ?? 20;
  const foodLevel = data.foodLevel ?? 20;
  
  // Deneyim
  const xpLevel = data.XpLevel ?? 0;
  const xpTotal = data.XpTotal ?? 0;
  
  // Envanter
  const inventory = data.Inventory || [];
  const inventorySize = inventory.length;
  const inventoryValue = calculateInventoryValue(inventory);
  
  // İstatistikleri işle
  const stats = data.Stats || {};
  let totalBlocksMined = 0;
  let totalItemsCrafted = 0;
  let totalMobsKilled = 0;
  let totalDistanceWalked = 0;
  let totalDistanceFlown = 0;
  let totalDistanceSwum = 0;
  let totalJumps = 0;
  let deaths = 0;
  let killsByMobs = 0;
  let playTimeMinutes = 0;
  
  const topMinedBlocks: { name: string; count: number }[] = [];
  const topCraftedItems: { name: string; count: number }[] = [];
  const topKilledMobs: { name: string; count: number }[] = [];
  const topUsedItems: { name: string; count: number }[] = [];
  const topBrokenTools: { name: string; count: number }[] = [];
  const allStats: { category: string; name: string; value: number }[] = [];

  // Stats objesini işle - farklı formatları destekle
  for (const [categoryKey, categoryData] of Object.entries(stats)) {
    if (typeof categoryData === 'object' && categoryData !== null) {
      for (const [itemKey, value] of Object.entries(categoryData as Record<string, number>)) {
        if (typeof value !== 'number') continue;
        
        const translatedName = translateItemName(itemKey);
        const category = STAT_CATEGORIES[categoryKey] || categoryKey;
        
        allStats.push({ category, name: `${translatedName}`, value });
        
        // Kategorilere göre toplama
        if (categoryKey.includes('mined') || category === 'Kırılan Bloklar') {
          totalBlocksMined += value;
          topMinedBlocks.push({ name: translatedName, count: value });
        } else if (categoryKey.includes('crafted') || category === 'Üretilen Eşyalar') {
          totalItemsCrafted += value;
          topCraftedItems.push({ name: translatedName, count: value });
        } else if (categoryKey.includes('killed') && !categoryKey.includes('killed_by') || category === 'Öldürülen Yaratıklar') {
          totalMobsKilled += value;
          topKilledMobs.push({ name: translatedName, count: value });
        } else if (categoryKey.includes('killed_by') || category === 'Tarafından Öldürülme') {
          killsByMobs += value;
        } else if (categoryKey.includes('used') || category === 'Kullanılan Eşyalar') {
          topUsedItems.push({ name: translatedName, count: value });
        } else if (categoryKey.includes('broken') || category === 'Kırılan Aletler') {
          topBrokenTools.push({ name: translatedName, count: value });
        } else if (categoryKey.includes('custom') || category === 'Özel İstatistikler') {
          // Özel istatistikleri işle
          const cleanKey = itemKey.includes('minecraft:') ? itemKey : `minecraft:${itemKey}`;
          if (cleanKey === 'minecraft:play_time') {
            playTimeMinutes = Math.round(value / 1200); // tick -> dakika
          } else if (cleanKey === 'minecraft:walk_one_cm') {
            totalDistanceWalked = Math.round(value / 100); // cm -> metre
          } else if (cleanKey === 'minecraft:fly_one_cm') {
            totalDistanceFlown = Math.round(value / 100);
          } else if (cleanKey === 'minecraft:walk_under_water_one_cm' || cleanKey === 'minecraft:walk_on_water_one_cm') {
            totalDistanceSwum += Math.round(value / 100);
          } else if (cleanKey === 'minecraft:jump') {
            totalJumps = value;
          } else if (cleanKey === 'minecraft:deaths') {
            deaths = value;
          }
        }
      }
    } else if (typeof categoryData === 'number') {
      // Düz sayısal değerler
      allStats.push({ category: 'Genel', name: categoryKey, value: categoryData });
    }
  }

  // Sırala ve en üst 10'u al
  topMinedBlocks.sort((a, b) => b.count - a.count);
  topCraftedItems.sort((a, b) => b.count - a.count);
  topKilledMobs.sort((a, b) => b.count - a.count);
  topUsedItems.sort((a, b) => b.count - a.count);
  topBrokenTools.sort((a, b) => b.count - a.count);

  // Advancements say
  const advancementsCount = data.recipes ? data.recipes.length : 0;

  return {
    playerName: loadedFile.playerName || 'Bilinmeyen Oyuncu',
    uuid: loadedFile.uuid || data.UUID || 'Bilinmiyor',
    gameType,
    dimension,
    position,
    health,
    foodLevel,
    xpLevel,
    xpTotal,
    inventorySize,
    inventoryValue,
    totalBlocksMined,
    totalItemsCrafted,
    totalMobsKilled,
    totalDistanceWalked,
    totalDistanceFlown,
    totalDistanceSwum,
    totalJumps,
    deaths,
    killsByMobs,
    playTimeMinutes,
    advancementsCount,
    topMinedBlocks: topMinedBlocks.slice(0, 15),
    topCraftedItems: topCraftedItems.slice(0, 15),
    topKilledMobs: topKilledMobs.slice(0, 15),
    topUsedItems: topUsedItems.slice(0, 15),
    topBrokenTools: topBrokenTools.slice(0, 15),
    allStats: allStats.sort((a, b) => b.value - a.value),
  };
}

// İki oyuncu verisini karşılaştır
export function comparePlayers(player1: PlayerSummary, player2: PlayerSummary): ComparisonResult[] {
  const comparisons: ComparisonResult[] = [];
  
  const metrics = [
    { key: 'totalBlocksMined', label: 'Toplam Kırılan Blok' },
    { key: 'totalItemsCrafted', label: 'Toplam Üretilen Eşya' },
    { key: 'totalMobsKilled', label: 'Toplam Öldürülen Yaratık' },
    { key: 'totalDistanceWalked', label: 'Yürünen Mesafe (m)' },
    { key: 'totalDistanceFlown', label: 'Uçulan Mesafe (m)' },
    { key: 'totalDistanceSwum', label: 'Yüzülen Mesafe (m)' },
    { key: 'totalJumps', label: 'Zıplama Sayısı' },
    { key: 'deaths', label: 'Ölüm Sayısı' },
    { key: 'killsByMobs', label: 'Yaratıklar Tarafından Öldürülme' },
    { key: 'xpLevel', label: 'Deneyim Seviyesi' },
    { key: 'xpTotal', label: 'Toplam Deneyim' },
    { key: 'inventorySize', label: 'Envanter Doluluğu' },
    { key: 'inventoryValue', label: 'Envanter Değeri' },
    { key: 'playTimeMinutes', label: 'Oynama Süresi (dk)' },
    { key: 'health', label: 'Sağlık' },
    { key: 'foodLevel', label: 'Açlık Seviyesi' },
  ];

  for (const metric of metrics) {
    const oldVal = (player1 as any)[metric.key] || 0;
    const newVal = (player2 as any)[metric.key] || 0;
    const change = newVal - oldVal;
    const changePercent = oldVal !== 0 ? ((change / oldVal) * 100) : (newVal > 0 ? 100 : 0);
    
    comparisons.push({
      metric: metric.label,
      oldValue: oldVal,
      newValue: newVal,
      change,
      changePercent: Math.round(changePercent * 100) / 100,
      narrative: generateComparisonNarrative(metric.label, oldVal, newVal, change, changePercent),
    });
  }

  return comparisons;
}

function generateComparisonNarrative(metric: string, oldVal: number, newVal: number, change: number, changePercent: number): string {
  if (change === 0) return `${metric} değerinde bir değişiklik olmadı.`;
  
  const direction = change > 0 ? 'artış' : 'azalış';
  const absChange = Math.abs(change);
  
  if (metric === 'Ölüm Sayısı' || metric === 'Yaratıklar Tarafından Öldürülme') {
    if (change > 0) {
      return `⚠️ ${metric} ${absChange} adet arttı (%${Math.abs(changePercent).toFixed(1)}). Bu, oyuncunun daha tehlikeli bölgelere girdiğini veya daha zorlu yaratıklarla karşılaştığını gösterebilir. Dikkatli olmakta fayda var!`;
    } else {
      return `✅ ${metric} ${absChange} adet azaldı. Oyuncu daha dikkatli oynuyor veya daha güvenli bölgelerde vakit geçiriyor.`;
    }
  }
  
  if (metric === 'Deneyim Seviyesi' || metric === 'Toplam Deneyim') {
    if (change > 0) {
      return `🌟 Deneyim ${absChange} puan arttı! Oyuncu aktif olarak yaratık öldürüyor, maden yapıyor veya büyü yapıyor.`;
    }
  }
  
  if (metric === 'Oynama Süresi (dk)') {
    if (change > 0) {
      const hours = Math.floor(change / 60);
      const mins = change % 60;
      return `⏰ ${hours > 0 ? `${hours} saat ` : ''}${mins} dakika daha fazla oynanmış. Oyuncu aktif kalmaya devam ediyor!`;
    }
  }

  if (metric === 'Envanter Değeri') {
    if (change > 0) {
      return `💎 Envanter değeri ${absChange} puan arttı. Oyuncu değerli eşyalar toplamış veya üretmiş olmalı.`;
    } else {
      return `📦 Envanter değeri ${absChange} puan azaldı. Oyuncu eşya harcamış, takas yapmış veya eşya bırakmış olabilir.`;
    }
  }

  if (changePercent > 50) {
    return `📈 ${metric} %${changePercent.toFixed(1)} oranında büyük bir ${direction} gösterdi (${oldVal} → ${newVal}). Bu önemli bir gelişme!`;
  } else if (changePercent > 10) {
    return `📊 ${metric} %${changePercent.toFixed(1)} oranında ${direction} gösterdi (${oldVal} → ${newVal}). İstikrarlı bir ilerleme mevcut.`;
  } else {
    return `${metric} ${absChange} adet ${direction} gösterdi (${oldVal} → ${newVal}). Küçük bir değişiklik söz konusu.`;
  }
}
