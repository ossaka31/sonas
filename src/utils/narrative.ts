import { PlayerSummary, NarrativeSection, ComparisonResult } from '../types';

export function generateNarratives(summary: PlayerSummary, previousSummary?: PlayerSummary): NarrativeSection[] {
  const narratives: NarrativeSection[] = [];

  // 1. Genel Bakış
  narratives.push({
    title: '📋 Genel Durum Özeti',
    icon: '📋',
    content: generateOverviewNarrative(summary),
    type: 'info',
  });

  // 2. Konum ve Keşif
  narratives.push({
    title: '🗺️ Konum ve Keşif Durumu',
    icon: '🗺️',
    content: generateLocationNarrative(summary),
    type: 'info',
  });

  // 3. Madencilik Analizi
  if (summary.totalBlocksMined > 0) {
    narratives.push({
      title: '⛏️ Madencilik Faaliyetleri',
      icon: '⛏️',
      content: generateMiningNarrative(summary),
      type: 'success',
    });
  }

  // 4. Üretim ve Crafting
  if (summary.totalItemsCrafted > 0) {
    narratives.push({
      title: '🔨 Üretim ve Crafting',
      icon: '🔨',
      content: generateCraftingNarrative(summary),
      type: 'success',
    });
  }

  // 5. Savaş ve Yaratıklar
  if (summary.totalMobsKilled > 0 || summary.killsByMobs > 0) {
    narratives.push({
      title: '⚔️ Savaş İstatistikleri',
      icon: '⚔️',
      content: generateCombatNarrative(summary),
      type: summary.deaths > 5 ? 'warning' : 'success',
    });
  }

  // 6. Hareket ve Keşif
  narratives.push({
    title: '🏃 Hareket ve Seyahat',
    icon: '🏃',
    content: generateMovementNarrative(summary),
    type: 'info',
  });

  // 7. Deneyim ve Seviye
  if (summary.xpLevel > 0 || summary.xpTotal > 0) {
    narratives.push({
      title: '✨ Deneyim ve İlerleme',
      icon: '✨',
      content: generateXPNarrative(summary),
      type: 'success',
    });
  }

  // 8. Envanter Değerlendirmesi
  narratives.push({
    title: '🎒 Envanter ve Kaynaklar',
    icon: '🎒',
    content: generateInventoryNarrative(summary),
    type: summary.inventoryValue > 500 ? 'highlight' : 'info',
  });

  // 9. Hayatta Kalma
  narratives.push({
    title: '❤️ Hayatta Kalma Durumu',
    icon: '❤️',
    content: generateSurvivalNarrative(summary),
    type: summary.health < 10 ? 'warning' : 'success',
  });

  // 10. Oyun Süresi ve Aktivite
  if (summary.playTimeMinutes > 0) {
    narratives.push({
      title: '⏰ Oyun Süresi ve Aktivite',
      icon: '⏰',
      content: generatePlaytimeNarrative(summary),
      type: 'info',
    });
  }

  // 11. Kırılan Aletler
  if (summary.topBrokenTools.length > 0) {
    narratives.push({
      title: '🔧 Alet Kullanımı ve Kırılma',
      icon: '🔧',
      content: generateToolNarrative(summary),
      type: 'warning',
    });
  }

  // 12. Karşılaştırma (varsa)
  if (previousSummary) {
    narratives.push({
      title: '📊 Günlük Karşılaştırma Analizi',
      icon: '📊',
      content: generateDayComparisonNarrative(summary, previousSummary),
      type: 'comparison',
    });
  }

  // 13. Genel Değerlendirme
  narratives.push({
    title: '🏆 Genel Değerlendirme ve Tavsiyeler',
    icon: '🏆',
    content: generateOverallAssessment(summary),
    type: 'highlight',
  });

  return narratives;
}

function generateOverviewNarrative(s: PlayerSummary): string {
  let text = `**${s.playerName}** adlı oyuncunun mevcut durum raporu:\n\n`;
  text += `• **Oyun Modu:** ${s.gameType}\n`;
  text += `• **Bulunulan Boyut:** ${s.dimension}\n`;
  text += `• **Mevcut Konum:** X: ${s.position.x}, Y: ${s.position.y}, Z: ${s.position.z}\n`;
  text += `• **Sağlık:** ${s.health}/20 (${s.health >= 15 ? 'İyi durumda' : s.health >= 5 ? 'Dikkatli olmalı' : 'TEHLİKEDE!'})\n`;
  text += `• **Açlık:** ${s.foodLevel}/20\n`;
  text += `• **Deneyim Seviyesi:** ${s.xpLevel} (Toplam: ${s.xpTotal} XP)\n\n`;

  if (s.position.y < 0) {
    text += `⚠️ Oyuncu yer altındadır (Y=${s.position.y}). Muhtemelen madencilik yapıyor veya bir mağarada bulunuyor.\n`;
  } else if (s.position.y > 100) {
    text += `🏔️ Oyuncu yüksek bir rakımda bulunuyor. Muhtemelen bir dağın tepesinde veya inşa ettiği bir yapıda.\n`;
  }

  if (s.dimension.includes('Nether')) {
    text += `🔥 Oyuncu şu anda Nether boyutunda! Tehlikeli bir ortamda bulunuyor - dikkatli olmalı.\n`;
  } else if (s.dimension.includes('End')) {
    text += `🌌 Oyuncu End boyutunda! Ejderha ile savaş veya şehir keşfi yapıyor olabilir.\n`;
  }

  return text;
}

function generateLocationNarrative(s: PlayerSummary): string {
  let text = `Oyuncunun konum analizi:\n\n`;
  text += `**Mevcut Pozisyon:** ${s.position.x}, ${s.position.y}, ${s.position.z} koordinatlarında bulunuyor.\n\n`;

  // Biyom tahmini (Y koordinatına göre)
  if (s.position.y < 0) {
    text += `🕳️ Derin yer altı seviyesinde (-${Math.abs(s.position.y)} blok derinlik). Bu derinlikte genellikle elmas, redstone ve lapis cevherleri bulunur. `;
    if (s.position.y < -50) {
      text += `Deepslate katmanındasınız - burada deepslate cevherleri daha yaygındır.\n`;
    } else {
      text += `Normal yer altı seviyesindesiniz.\n`;
    }
  } else if (s.position.y > 63) {
    text += `🏔️ Deniz seviyesinin üzerinde (${s.position.y} blok). Muhtemelen dağlık bir bölgedesiniz.\n`;
  } else {
    text += `🌊 Deniz seviyesine yakın bir konumdasınız (${s.position.y} blok).\n`;
  }

  // XZ mesafesi (spawn'dan uzaklık tahmini)
  const distanceFromOrigin = Math.round(Math.sqrt(s.position.x ** 2 + s.position.z ** 2));
  text += `\n📍 Spawn noktasından tahmini uzaklık: **${distanceFromOrigin} blok**\n`;

  if (distanceFromOrigin > 10000) {
    text += `Çok uzak bir keşif yapmışsınız! Bu mesafede genellikle daha nadir biyomlar ve yapılar bulunur.\n`;
  } else if (distanceFromOrigin > 5000) {
    text += `Oldukça uzak bir mesafeye ilerlemişsiniz. Farklı biyomlar keşfetmiş olabilirsiniz.\n`;
  } else if (distanceFromOrigin > 1000) {
    text += `Spawn'dan makul bir uzaklıktasınız. Yerleşim için uygun bir bölge seçmiş olabilirsiniz.\n`;
  } else {
    text += `Henüz spawn bölgesine yakınsınız. Keşfe başlamak için daha uzağa gidebilirsiniz.\n`;
  }

  return text;
}

function generateMiningNarrative(s: PlayerSummary): string {
  let text = `Toplam **${s.totalBlocksMined.toLocaleString('tr-TR')}** blok kırılmış.\n\n`;

  if (s.topMinedBlocks.length > 0) {
    text += `**En çok kırılan bloklar:**\n`;
    s.topMinedBlocks.slice(0, 10).forEach((block, i) => {
      text += `${i + 1}. ${block.name}: **${block.count.toLocaleString('tr-TR')}** adet\n`;
    });
    text += '\n';
  }

  // Madencilik yorumları
  const hasDiamond = s.topMinedBlocks.some(b => b.name.includes('Elmas'));
  const hasNetherite = s.topMinedBlocks.some(b => b.name.includes('Antik Kalıntı') || b.name.includes('Netherit'));
  const hasDeepslate = s.topMinedBlocks.some(b => b.name.includes('Kayrak'));
  const hasObsidian = s.topMinedBlocks.some(b => b.name.includes('Obsidyen'));

  if (hasDiamond) {
    text += `💎 Elmas cevheri kırılmış! Derin madenlere inmişsiniz demektir.\n`;
  }
  if (hasNetherite) {
    text += `🔥 Antik kalıntı bulmuşsunuz! Nether'da derin madencilik yapmışsınız - en nadir kaynaklardan birini elde etmişsiniz.\n`;
  }
  if (hasDeepslate) {
    text += `⬛ Deepslate (kayrak taşı) katmanında aktif madencilik yapılmış. Derin mağaralara inilmiş.\n`;
  }
  if (hasObsidian) {
    text += `🟣 Obsidyen kırılmış. Nether portalı yapımı veya genişletmesi için çalışılmış olabilir.\n`;
  }

  if (s.totalBlocksMined > 10000) {
    text += `\n🏆 İnanılmaz bir madencilik aktivitesi! ${s.totalBlocksMined.toLocaleString('tr-TR')} blok kırmak ciddi bir emek gerektirir. Gerçek bir madencisiniz!\n`;
  } else if (s.totalBlocksMined > 5000) {
    text += `\n⛏️ Çok ciddi bir madencilik aktivitesi mevcut. Kaynak toplamada oldukça ilerisiniz.\n`;
  } else if (s.totalBlocksMined > 1000) {
    text += `\n🪨 İyi seviyede madencilik yapılmış. Temel kaynakları toplamışsınız.\n`;
  }

  return text;
}

function generateCraftingNarrative(s: PlayerSummary): string {
  let text = `Toplam **${s.totalItemsCrafted.toLocaleString('tr-TR')}** eşya üretilmiş.\n\n`;

  if (s.topCraftedItems.length > 0) {
    text += `**En çok üretilen eşyalar:**\n`;
    s.topCraftedItems.slice(0, 10).forEach((item, i) => {
      text += `${i + 1}. ${item.name}: **${item.count.toLocaleString('tr-TR')}** adet\n`;
    });
    text += '\n';
  }

  // Üretim analizi
  const hasTools = s.topCraftedItems.some(i => 
    i.name.includes('Kazma') || i.name.includes('Kılıç') || i.name.includes('Balta')
  );
  const hasBuilding = s.topCraftedItems.some(i => 
    i.name.includes('Tahta') || i.name.includes('Basamak') || i.name.includes('Merdiven')
  );
  const hasRedstone = s.topCraftedItems.some(i => 
    i.name.includes('Tekrarlayıcı') || i.name.includes('Piston') || i.name.includes('Gözlemci')
  );
  const hasFood = s.topCraftedItems.some(i => 
    i.name.includes('Ekmek') || i.name.includes('Pasta') || i.name.includes('Güveç')
  );

  if (hasTools) {
    text += `🔧 Alet üretimi yapılmış. Hayatta kalma için gerekli ekipmanları hazırlamışsınız.\n`;
  }
  if (hasBuilding) {
    text += `🏗️ Yapı malzemeleri üretilmiş. İnşaat projelerine başlanmış veya devam ediliyor.\n`;
  }
  if (hasRedstone) {
    text += `⚡ Redstone mekanizmaları üretilmiş! Otomasyon veya karmaşık cihazlar yapılmış.\n`;
  }
  if (hasFood) {
    text += `🍞 Yiyecek üretilmiş. Hayatta kalma için beslenme ihtiyacı karşılanmış.\n`;
  }

  if (s.totalItemsCrafted > 5000) {
    text += `\n🏭 Üretim konusunda bir fabrika gibi çalışıyorsunuz! ${s.totalItemsCrafted.toLocaleString('tr-TR')} eşya üretmek büyük bir başarı.\n`;
  }

  return text;
}

function generateCombatNarrative(s: PlayerSummary): string {
  let text = '';

  if (s.totalMobsKilled > 0) {
    text += `Toplam **${s.totalMobsKilled.toLocaleString('tr-TR')}** yaratık öldürülmüş.\n\n`;
    
    if (s.topKilledMobs.length > 0) {
      text += `**En çok öldürülen yaratıklar:**\n`;
      s.topKilledMobs.slice(0, 10).forEach((mob, i) => {
        text += `${i + 1}. ${mob.name}: **${mob.count.toLocaleString('tr-TR')}** adet\n`;
      });
      text += '\n';
    }

    // Özel yaratık yorumları
    const hasEnderDragon = s.topKilledMobs.some(m => m.name.includes('Ejderha'));
    const hasWither = s.topKilledMobs.some(m => m.name.includes('Wither'));
    const hasWarden = s.topKilledMobs.some(m => m.name.includes('Warden'));
    const hasBlaze = s.topKilledMobs.some(m => m.name.includes('Blaze'));
    const hasPiglin = s.topKilledMobs.some(m => m.name.includes('Piglin'));

    if (hasEnderDragon) {
      text += `🐉 **EJDERHA YENİLMİŞ!** Minecraft'ın nihai boss'u yenilmiş! Bu büyük bir başarı!\n`;
    }
    if (hasWither) {
      text += `💀 **Wither yenilmiş!** Üç kafalı boss yaratığı yok edilmiş!\n`;
    }
    if (hasWarden) {
      text += `👁️ **Warden yenilmiş!** Bu inanılmaz zorlu bir savaş - Warden'ı yenmek çok nadir bir başarıdır!\n`;
    }
    if (hasBlaze) {
      text += `🔥 Blaze'lar yenilmiş. Nether'da aktif savaş yapılmış, muhtemelen iksir standı için çubuklar toplanmış.\n`;
    }
    if (hasPiglin) {
      text += `🐷 Piglin'larla çatışma yaşanmış. Bastion kalıntılarına girilmiş olabilir.\n`;
    }
  }

  if (s.deaths > 0) {
    text += `\n💀 **Ölüm Sayısı:** ${s.deaths}\n`;
    if (s.deaths > 20) {
      text += `Çok fazla ölüm yaşanmış! Dikkatli olmakta fayda var. Belki daha iyi zırh veya silah kullanmalısınız.\n`;
    } else if (s.deaths > 10) {
      text += `Birkaç ölüm yaşanmış. Macera dolu bir oyun deneyimi!\n`;
    } else if (s.deaths > 5) {
      text += `Ortalama seviyede ölüm. Macerada bazı riskler alınmış.\n`;
    } else {
      text += `Az ölüm - dikkatli ve stratejik oynanıyor!\n`;
    }
  }

  if (s.killsByMobs > 0) {
    text += `\n☠️ Yaratıklar tarafından öldürülme: **${s.killsByMobs}** kez\n`;
    text += `Bu, hangi yaratıkların daha tehlikeli olduğunu gösterir. Dikkatli olunması gereken yaratıkları not edin.\n`;
  }

  // K/D oranı
  if (s.deaths > 0 && s.totalMobsKilled > 0) {
    const kd = (s.totalMobsKilled / s.deaths).toFixed(2);
    text += `\n📊 **K/D Oranı (Yaratık/Ölüm):** ${kd}\n`;
    if (parseFloat(kd) > 50) {
      text += `Mükemmel bir savaş performansı! Çok az ölümle çok yaratık yenmiş.\n`;
    } else if (parseFloat(kd) > 10) {
      text += `İyi bir savaş performansı sergileniyor.\n`;
    }
  }

  return text;
}

function generateMovementNarrative(s: PlayerSummary): string {
  let text = `Hareket istatistikleri:\n\n`;

  if (s.totalDistanceWalked > 0) {
    const km = (s.totalDistanceWalked / 1000).toFixed(2);
    text += `🚶 **Yürünen Mesafe:** ${s.totalDistanceWalked.toLocaleString('tr-TR')} metre (${km} km)\n`;
    
    if (s.totalDistanceWalked > 100000) {
      text += `   → Yüz kilometreden fazla yürümüşsünüz! Gerçek bir kaşifsiniz.\n`;
    } else if (s.totalDistanceWalked > 50000) {
      text += `   → Çok ciddi bir mesafe kat edilmiş. Harita büyük ölçüde keşfedilmiş.\n`;
    }
  }

  if (s.totalDistanceFlown > 0) {
    const km = (s.totalDistanceFlown / 1000).toFixed(2);
    text += `🕊️ **Uçulan Mesafe:** ${s.totalDistanceFlown.toLocaleString('tr-TR')} metre (${km} km)\n`;
    
    if (s.totalDistanceFlown > 10000) {
      text += `   → Elytra ile çok uçulmuş! Hızlı seyahat için elitra aktif kullanılıyor.\n`;
    }
  }

  if (s.totalDistanceSwum > 0) {
    text += `🏊 **Yüzülen Mesafe:** ${s.totalDistanceSwum.toLocaleString('tr-TR')} metre\n`;
    if (s.totalDistanceSwum > 5000) {
      text += `   → Oldukça fazla yüzülmüş. Su altı keşifleri yapılmış olabilir.\n`;
    }
  }

  if (s.totalJumps > 0) {
    text += `🦘 **Zıplama Sayısı:** ${s.totalJumps.toLocaleString('tr-TR')}\n`;
    if (s.totalJumps > 50000) {
      text += `   → On binlerce zıplama! Parkur veya madencilik sırasında çok zıplanmış.\n`;
    }
  }

  return text;
}

function generateXPNarrative(s: PlayerSummary): string {
  let text = `Deneyim durumu:\n\n`;
  text += `• **Mevcut Seviye:** ${s.xpLevel}\n`;
  text += `• **Toplam Kazanılan XP:** ${s.xpTotal.toLocaleString('tr-TR')}\n\n`;

  if (s.xpLevel >= 30) {
    text += `🌟 Seviye ${s.xpLevel} - Çok yüksek bir deneyim seviyesi! Büyü masasında en güçlü büyüler yapılabilir. `;
    text += `Bu seviyeye ulaşmak için ciddi miktarda yaratık öldürülmüş, madencilik yapılmış veya büyü yapılmış olmalı.\n`;
  } else if (s.xpLevel >= 15) {
    text += `✨ Seviye ${s.xpLevel} - İyi bir deneyim seviyesi. Temel büyüler yapılabilir durumda.\n`;
  } else if (s.xpLevel >= 5) {
    text += `📈 Seviye ${s.xpLevel} - Deneyim toplamaya başlanmış. Aktif oyun devam ediyor.\n`;
  } else {
    text += `🌱 Seviye ${s.xpLevel} - Henüz başlangıç aşamasında. Deneyim toplamaya devam edin!\n`;
  }

  // XP kaynağı tahmini
  if (s.xpTotal > 10000) {
    text += `\n💡 Bu kadar XP toplamak muhtemelen: Mob farm kullanımı, derin madencilik, veya çok sayıda büyü yapılması ile mümkün.\n`;
  }

  return text;
}

function generateInventoryNarrative(s: PlayerSummary): string {
  let text = `Envanter durumu:\n\n`;
  text += `• **Dolu Slot Sayısı:** ${s.inventorySize}\n`;
  text += `• **Tahmini Envanter Değeri:** ${s.inventoryValue} puan\n\n`;

  if (s.inventoryValue > 1000) {
    text += `💎 **Çok zengin bir envanter!** Binlerce puan değerinde eşya taşıyorsunuz. `;
    text += `Muhtemelen elmas/netherit ekipmanlar, değerli cevherler ve nadir eşyalar mevcut.\n`;
  } else if (s.inventoryValue > 500) {
    text += `🏅 Değerli bir envanter. İyi ekipmanlar ve kaynaklar biriktirilmiş.\n`;
  } else if (s.inventoryValue > 100) {
    text += `📦 Orta seviye bir envanter. Temel kaynaklar ve bazı değerli eşyalar mevcut.\n`;
  } else {
    text += `🎒 Hafif bir envanter. Yeni başlanmış veya eşyalar depolanmış olabilir.\n`;
  }

  if (s.inventorySize >= 36) {
    text += `\n⚠️ Envanter tamamen dolu! Yeni eşyalar için yer açmanız gerekebilir. `;
    text += `Gereksiz eşyaları sandıklara koymayı düşünün.\n`;
  } else if (s.inventorySize >= 27) {
    text += `\n📋 Envanter büyük ölçüde dolu (%${Math.round((s.inventorySize / 36) * 100)}). `;
    text += `Yakında yer açmanız gerekebilir.\n`;
  }

  return text;
}

function generateSurvivalNarrative(s: PlayerSummary): string {
  let text = `Hayatta kalma durumu:\n\n`;
  text += `• **Sağlık:** ${s.health}/20 (${Math.round((s.health / 20) * 100)}%)\n`;
  text += `• **Açlık:** ${s.foodLevel}/20 (${Math.round((s.foodLevel / 20) * 100)}%)\n`;
  text += `• **Ölüm Sayısı:** ${s.deaths}\n\n`;

  if (s.health >= 18) {
    text += `✅ Sağlık durumu mükemmel. Oyuncu tam kapasite ile hayatta.\n`;
  } else if (s.health >= 10) {
    text += `⚠️ Sağlık yarıdan fazla. Yakında yemek yemek veya iyileşmek gerekebilir.\n`;
  } else if (s.health >= 4) {
    text += `🚨 Sağlık kritik seviyede! Hemen iyileşme sağlanmalı.\n`;
  } else {
    text += `💀 TEHLİKE! Sağlık çok düşük. Her an ölüm gerçekleşebilir!\n`;
  }

  if (s.foodLevel >= 18) {
    text += `✅ Tokluk seviyesi iyi. Koşabilir ve iyileşebilirsiniz.\n`;
  } else if (s.foodLevel >= 10) {
    text += `🍖 Açlık hissedilmeye başlanmış. Yemek yemeniz önerilir.\n`;
  } else if (s.foodLevel >= 5) {
    text += `⚠️ Çok açsınız! Koşamazsınız ve yavaşça sağlık kaybedebilirsiniz.\n`;
  } else {
    text += `🚨 Açlıktan ölmek üzeresiniz! Acilen yemek yiyin!\n`;
  }

  return text;
}

function generatePlaytimeNarrative(s: PlayerSummary): string {
  let text = `Oyun süresi analizi:\n\n`;
  
  const hours = Math.floor(s.playTimeMinutes / 60);
  const minutes = s.playTimeMinutes % 60;
  
  text += `• **Toplam Oynama Süresi:** ${hours > 0 ? `${hours} saat ` : ''}${minutes} dakika\n\n`;

  if (hours > 100) {
    text += `🏆 ${hours} saatten fazla oynamışsınız! Bu, çok deneyimli bir oyuncu olduğunuzu gösteriyor. `;
    text += `Minecraft dünyasına tamamen hakim olmuşsunuz.\n`;
  } else if (hours > 50) {
    text += `⏰ 50+ saatlik oyun deneyimi. İyi seviyede bir Minecraft oyuncusunuz.\n`;
  } else if (hours > 20) {
    text += `📊 20+ saatlik oyun süresi. Oyun mekaniğine aşina olmaya başlamışsınız.\n`;
  } else if (hours > 5) {
    text += `🌱 Henüz başlangıç aşamasındasınız. Keşfedilecek çok şey var!\n`;
  }

  return text;
}

function generateToolNarrative(s: PlayerSummary): string {
  let text = `Alet kullanım analizi:\n\n`;
  text += `Toplam **${s.topBrokenTools.reduce((sum, t) => sum + t.count, 0)}** alet kırılmış.\n\n`;

  if (s.topBrokenTools.length > 0) {
    text += `**En çok kırılan aletler:**\n`;
    s.topBrokenTools.slice(0, 10).forEach((tool, i) => {
      text += `${i + 1}. ${tool.name}: **${tool.count}** adet\n`;
    });
    text += '\n';
  }

  // Alet materyal analizi
  const hasWooden = s.topBrokenTools.some(t => t.name.includes('Tahta'));
  const hasStone = s.topBrokenTools.some(t => t.name.includes('Taş'));
  const hasIron = s.topBrokenTools.some(t => t.name.includes('Demir'));
  const hasDiamond = s.topBrokenTools.some(t => t.name.includes('Elmas'));
  const hasNetherite = s.topBrokenTools.some(t => t.name.includes('Netherit'));

  if (hasWooden && !hasIron && !hasDiamond) {
    text += `🪵 Sadece tahta aletler kırılmış. Henüz daha iyi materyallere geçilmemiş olabilir.\n`;
  }
  if (hasIron) {
    text += `⚒️ Demir aletler kullanılmış ve kırılmış. Aktif madencilik yapılmış.\n`;
  }
  if (hasDiamond) {
    text += `💎 Elmas aletler kırılmış! Yoğun kullanım söz konusu - elmas tasarrufu yapmayı düşünün.\n`;
  }
  if (hasNetherite) {
    text += `🔥 Netherit aletler kırılmış! Bu çok nadir ve değerli aletlerin yoğun kullanımda olduğunu gösterir.\n`;
  }

  return text;
}

function generateDayComparisonNarrative(current: PlayerSummary, previous: PlayerSummary): string {
  let text = `📅 **Günlük İlerleme Raporu**\n\n`;
  text += `Önceki veri ile mevcut veri arasındaki karşılaştırma:\n\n`;

  const metrics = [
    { label: 'Kırılan Blok', old: previous.totalBlocksMined, new: current.totalBlocksMined },
    { label: 'Üretilen Eşya', old: previous.totalItemsCrafted, new: current.totalItemsCrafted },
    { label: 'Öldürülen Yaratık', old: previous.totalMobsKilled, new: current.totalMobsKilled },
    { label: 'Yürünen Mesafe (m)', old: previous.totalDistanceWalked, new: current.totalDistanceWalked },
    { label: 'Uçulan Mesafe (m)', old: previous.totalDistanceFlown, new: current.totalDistanceFlown },
    { label: 'Deneyim Seviyesi', old: previous.xpLevel, new: current.xpLevel },
    { label: 'Toplam XP', old: previous.xpTotal, new: current.xpTotal },
    { label: 'Ölüm Sayısı', old: previous.deaths, new: current.deaths },
    { label: 'Oynama Süresi (dk)', old: previous.playTimeMinutes, new: current.playTimeMinutes },
    { label: 'Envanter Değeri', old: previous.inventoryValue, new: current.inventoryValue },
  ];

  let totalPositive = 0;
  let totalNegative = 0;

  for (const m of metrics) {
    const diff = m.new - m.old;
    if (diff !== 0) {
      const emoji = diff > 0 ? '📈' : '📉';
      text += `${emoji} ${m.label}: ${m.old.toLocaleString('tr-TR')} → ${m.new.toLocaleString('tr-TR')} (**${diff > 0 ? '+' : ''}${diff.toLocaleString('tr-TR')}**)\n`;
      if (diff > 0) totalPositive++;
      else totalNegative++;
    }
  }

  text += '\n';

  // Genel yorum
  const timeDiff = current.playTimeMinutes - previous.playTimeMinutes;
  if (timeDiff > 0) {
    text += `⏰ Bu oturumda yaklaşık **${timeDiff} dakika** oynanmış.\n\n`;
  }

  const blockDiff = current.totalBlocksMined - previous.totalBlocksMined;
  const mobDiff = current.totalMobsKilled - previous.totalMobsKilled;
  const xpDiff = current.xpTotal - previous.xpTotal;

  if (blockDiff > 0) {
    text += `⛏️ Bu oturumda **${blockDiff.toLocaleString('tr-TR')}** blok kırılmış. `;
    if (blockDiff > 1000) text += `Çok verimli bir madencilik oturumu!\n`;
    else if (blockDiff > 500) text += `İyi seviyede madencilik yapılmış.\n`;
    else text += `Normal seviyede madencilik aktivitesi.\n`;
  }

  if (mobDiff > 0) {
    text += `⚔️ **${mobDiff.toLocaleString('tr-TR')}** yaratık öldürülmüş. `;
    if (mobDiff > 100) text += `Aktif bir savaş oturumu geçirilmiş!\n`;
    else if (mobDiff > 50) text += `İyi seviyede savaş aktivitesi.\n`;
    else text += `Normal seviyede yaratık avı.\n`;
  }

  if (xpDiff > 0) {
    text += `✨ **${xpDiff.toLocaleString('tr-TR')}** XP kazanılmış. `;
    if (xpDiff > 5000) text += `Muhteşem bir deneyim kazanımı!\n`;
    else if (xpDiff > 1000) text += `İyi miktarda deneyim toplanmış.\n`;
    else text += `Normal seviyede deneyim kazanılmış.\n`;
  }

  const deathDiff = current.deaths - previous.deaths;
  if (deathDiff > 0) {
    text += `\n💀 Bu oturumda **${deathDiff}** kez ölmüşsünüz. `;
    if (deathDiff > 5) text += `Çok tehlikeli bir oturum olmuş! Daha dikkatli olunmalı.\n`;
    else if (deathDiff > 2) text += `Birkaç ölüm yaşanmış. Riskli alanlara girilmiş olabilir.\n`;
    else text += `Tek bir ölüm - dikkatsizlik anı.\n`;
  }

  // Konum değişikliği
  const posDiff = Math.round(Math.sqrt(
    (current.position.x - previous.position.x) ** 2 + 
    (current.position.z - previous.position.z) ** 2
  ));
  if (posDiff > 0) {
    text += `\n🗺️ Yatay düzlemde **${posDiff} blok** hareket edilmiş. `;
    if (posDiff > 5000) text += `Büyük bir keşif yolculuğu!\n`;
    else if (posDiff > 1000) text += `Oldukça geniş bir alan keşfedilmiş.\n`;
    else if (posDiff > 100) text += `Orta mesafeli bir hareket.\n`;
    else text += `Kısa mesafeli bir hareket.\n`;
  }

  return text;
}

function generateOverallAssessment(s: PlayerSummary): string {
  let text = `**${s.playerName}** için genel değerlendirme:\n\n`;

  // Puanlama
  let score = 0;
  let maxScore = 0;

  // Madencilik puanı
  maxScore += 20;
  if (s.totalBlocksMined > 10000) score += 20;
  else if (s.totalBlocksMined > 5000) score += 15;
  else if (s.totalBlocksMined > 1000) score += 10;
  else if (s.totalBlocksMined > 100) score += 5;

  // Savaş puanı
  maxScore += 20;
  if (s.totalMobsKilled > 1000) score += 20;
  else if (s.totalMobsKilled > 500) score += 15;
  else if (s.totalMobsKilled > 100) score += 10;
  else if (s.totalMobsKilled > 10) score += 5;

  // Deneyim puanı
  maxScore += 20;
  if (s.xpLevel >= 30) score += 20;
  else if (s.xpLevel >= 20) score += 15;
  else if (s.xpLevel >= 10) score += 10;
  else if (s.xpLevel >= 5) score += 5;

  // Keşif puanı
  maxScore += 20;
  if (s.totalDistanceWalked > 100000) score += 20;
  else if (s.totalDistanceWalked > 50000) score += 15;
  else if (s.totalDistanceWalked > 10000) score += 10;
  else if (s.totalDistanceWalked > 1000) score += 5;

  // Hayatta kalma puanı
  maxScore += 20;
  if (s.deaths === 0) score += 20;
  else if (s.deaths <= 3) score += 15;
  else if (s.deaths <= 10) score += 10;
  else if (s.deaths <= 20) score += 5;

  const percentage = Math.round((score / maxScore) * 100);

  text += `📊 **Genel Performans Puanı:** ${score}/${maxScore} (%${percentage})\n\n`;

  if (percentage >= 80) {
    text += `🏆 **EFSANEVI OYUNCU!** Minecraft'ta gerçek bir uzmansınız. `;
    text += `Madencilik, savaş, keşif ve hayatta kalma konularında mükemmel bir performans sergiliyorsunuz.\n\n`;
  } else if (percentage >= 60) {
    text += `⭐ **DENeyimli Oyuncu!** İyi seviyede ilerleme kaydetmişsiniz. `;
    text += `Bazı alanlarda daha fazla gelişim mümkün.\n\n`;
  } else if (percentage >= 40) {
    text += `📈 **Gelişen Oyuncu!** Temel mekanikleri öğrenmişsiniz. `;
    text += `Daha fazla madencilik ve keşif ile seviyenizi yükseltebilirsiniz.\n\n`;
  } else {
    text += `🌱 **Başlangıç Seviyesi** Oyuncu. Minecraft dünyasını keşfetmeye yeni başlamışsınız. `;
    text += `Bol bol keşif yapın, madencilik yapın ve yaratıklarla savaşın!\n\n`;
  }

  // Tavsiyeler
  text += `💡 **Tavsiyeler:**\n\n`;

  if (s.totalBlocksMined < 1000) {
    text += `• Daha fazla madencilik yapın. Elmas ve netherit bulmak için derinlere inin (Y=-58 civarı).\n`;
  }
  if (s.totalMobsKilled < 100) {
    text += `• Daha fazla yaratık öldürün. Mob farm kurmayı düşünün.\n`;
  }
  if (s.xpLevel < 15) {
    text += `• Deneyim seviyenizi artırın. Yaratık öldürmek ve madencilik yapmak XP kazandırır.\n`;
  }
  if (s.totalDistanceWalked < 10000) {
    text += `• Daha fazla keşif yapın. Farklı biyomlar, köyler ve yapılar keşfedin.\n`;
  }
  if (s.deaths > 10) {
    text += `• Daha dikkatli oynayın. İyi zırh edinin ve tehlikeli alanlara hazırlıklı gidin.\n`;
  }
  if (s.dimension === 'Dünya (Overworld)' && s.totalMobsKilled > 100) {
    text += `• Nether ve End boyutlarını keşfetmeyi deneyin!\n`;
  }
  if (s.totalDistanceFlown === 0 && s.xpLevel > 20) {
    text += `• Elytra bulup uçmayı deneyin - harika bir deneyim!\n`;
  }

  return text;
}
