import { useState } from 'react';
import { PlayerSummary, NarrativeSection, ComparisonResult, LoadedFile } from '../types';

interface TextReportProps {
  summaries: PlayerSummary[];
  narratives: NarrativeSection[][];
  comparisons: ComparisonResult[][];
  loadedFiles: LoadedFile[];
}

export default function TextReport({ summaries, narratives, comparisons, loadedFiles }: TextReportProps) {
  const [copied, setCopied] = useState(false);

  const generateTextReport = (): string => {
    let report = '';
    report += '═══════════════════════════════════════════════════════════\n';
    report += '     MINECRAFT OYUNCU İSTATİSTİK ANALİZ RAPORU\n';
    report += '═══════════════════════════════════════════════════════════\n';
    report += `Rapor Tarihi: ${new Date().toLocaleString('tr-TR')}\n`;
    report += `Toplam Veri Seti: ${summaries.length}\n`;
    report += `Toplam Oyuncu: ${new Set(summaries.map(s => s.playerName)).size}\n`;
    report += '═══════════════════════════════════════════════════════════\n\n';

    summaries.forEach((summary, idx) => {
      report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      report += `  OYUNCU: ${summary.playerName}\n`;
      report += `  Dosya: ${loadedFiles[idx]?.fileName || 'Bilinmiyor'}\n`;
      report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

      // Genel Bilgiler
      report += '📋 GENEL DURUM\n';
      report += '─────────────────────────────────\n';
      report += `  Oyun Modu: ${summary.gameType}\n`;
      report += `  Boyut: ${summary.dimension}\n`;
      report += `  Konum: X=${summary.position.x}, Y=${summary.position.y}, Z=${summary.position.z}\n`;
      report += `  Sağlık: ${summary.health}/20\n`;
      report += `  Açlık: ${summary.foodLevel}/20\n`;
      report += `  Deneyim Seviyesi: ${summary.xpLevel} (Toplam XP: ${summary.xpTotal})\n`;
      report += `  Oynama Süresi: ${summary.playTimeMinutes} dakika\n\n`;

      // Ana İstatistikler
      report += '📊 ANA İSTATİSTİKLER\n';
      report += '─────────────────────────────────\n';
      report += `  Toplam Kırılan Blok: ${summary.totalBlocksMined.toLocaleString('tr-TR')}\n`;
      report += `  Toplam Üretilen Eşya: ${summary.totalItemsCrafted.toLocaleString('tr-TR')}\n`;
      report += `  Toplam Öldürülen Yaratık: ${summary.totalMobsKilled.toLocaleString('tr-TR')}\n`;
      report += `  Yaratıklar Tarafından Öldürülme: ${summary.killsByMobs}\n`;
      report += `  Ölüm Sayısı: ${summary.deaths}\n`;
      report += `  Yürünen Mesafe: ${summary.totalDistanceWalked.toLocaleString('tr-TR')} metre\n`;
      report += `  Uçulan Mesafe: ${summary.totalDistanceFlown.toLocaleString('tr-TR')} metre\n`;
      report += `  Yüzülen Mesafe: ${summary.totalDistanceSwum.toLocaleString('tr-TR')} metre\n`;
      report += `  Zıplama Sayısı: ${summary.totalJumps.toLocaleString('tr-TR')}\n`;
      report += `  Envanter Doluluk: ${summary.inventorySize}/36 slot\n`;
      report += `  Envanter Değeri: ${summary.inventoryValue} puan\n\n`;

      // En Çok Kırılan Bloklar
      if (summary.topMinedBlocks.length > 0) {
        report += '⛏️ EN ÇOK KIRILAN BLOKLAR\n';
        report += '─────────────────────────────────\n';
        summary.topMinedBlocks.forEach((b, i) => {
          report += `  ${String(i + 1).padStart(2)}. ${b.name.padEnd(30)} ${b.count.toLocaleString('tr-TR')} adet\n`;
        });
        report += '\n';
      }

      // En Çok Üretilen Eşyalar
      if (summary.topCraftedItems.length > 0) {
        report += '🔨 EN ÇOK ÜRETİLEN EŞYALAR\n';
        report += '─────────────────────────────────\n';
        summary.topCraftedItems.forEach((item, i) => {
          report += `  ${String(i + 1).padStart(2)}. ${item.name.padEnd(30)} ${item.count.toLocaleString('tr-TR')} adet\n`;
        });
        report += '\n';
      }

      // En Çok Öldürülen Yaratıklar
      if (summary.topKilledMobs.length > 0) {
        report += '⚔️ EN ÇOK ÖLDÜRÜLEN YARATIKLAR\n';
        report += '─────────────────────────────────\n';
        summary.topKilledMobs.forEach((mob, i) => {
          report += `  ${String(i + 1).padStart(2)}. ${mob.name.padEnd(30)} ${mob.count.toLocaleString('tr-TR')} adet\n`;
        });
        report += '\n';
      }

      // Kırılan Aletler
      if (summary.topBrokenTools.length > 0) {
        report += '🔧 KIRILAN ALETLER\n';
        report += '─────────────────────────────────\n';
        summary.topBrokenTools.forEach((tool, i) => {
          report += `  ${String(i + 1).padStart(2)}. ${tool.name.padEnd(30)} ${tool.count} adet\n`;
        });
        report += '\n';
      }

      // Anlatılar
      const playerNarratives = narratives[idx] || [];
      if (playerNarratives.length > 0) {
        report += '📝 DETAYLI ANALİZ ANLATILARI\n';
        report += '═════════════════════════════════\n\n';
        
        playerNarratives.forEach((section) => {
          report += `  ${section.title}\n`;
          report += `  ${'─'.repeat(40)}\n`;
          // Markdown bold kaldır
          const cleanContent = section.content.replace(/\*\*(.*?)\*\*/g, '$1');
          report += `  ${cleanContent.split('\n').join('\n  ')}\n\n`;
        });
      }

      report += '\n';
    });

    // Karşılaştırmalar
    if (comparisons.length > 0) {
      report += '═══════════════════════════════════════════════════════════\n';
      report += '  KARŞILAŞTIRMA ANALİZLERİ\n';
      report += '═══════════════════════════════════════════════════════════\n\n';

      comparisons.forEach((comp, ci) => {
        report += `  Karşılaştırma #${ci + 1}\n`;
        report += `  ${'─'.repeat(60)}\n`;
        report += `  ${'Metrik'.padEnd(25)} ${'Önceki'.padStart(12)} ${'Sonraki'.padStart(12)} ${'Değişim'.padStart(10)} ${'Değişim%'.padStart(10)}\n`;
        report += `  ${'─'.repeat(60)}\n`;
        
        comp.forEach(c => {
          if (c.change !== 0) {
            const changeStr = c.change > 0 ? `+${c.change}` : `${c.change}`;
            const pctStr = c.changePercent > 0 ? `+${c.changePercent}%` : `${c.changePercent}%`;
            report += `  ${c.metric.padEnd(25)} ${String(c.oldValue).padStart(12)} ${String(c.newValue).padStart(12)} ${changeStr.padStart(10)} ${pctStr.padStart(10)}\n`;
          }
        });
        report += '\n';

        // Anlatılar
        comp.filter(c => c.change !== 0).forEach(c => {
          report += `  → ${c.narrative}\n`;
        });
        report += '\n';
      });
    }

    report += '═══════════════════════════════════════════════════════════\n';
    report += '  RAPOR SONU\n';
    report += '═══════════════════════════════════════════════════════════\n';
    report += `Bu rapor Minecraft İstatistik Analiz Sistemi tarafından oluşturulmuştur.\n`;
    report += `Oluşturulma: ${new Date().toLocaleString('tr-TR')}\n`;

    return report;
  };

  const reportText = generateTextReport();

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minecraft_analiz_raporu_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/30 to-blue-900/30 border border-emerald-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-emerald-400 mb-2">📄 Metin Raporu</h2>
            <p className="text-gray-400">
              Tüm analiz sonuçları detaylı metin formatında. Kopyalayabilir veya indirebilirsiniz.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                copied
                  ? 'bg-green-700 text-green-200'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {copied ? '✅ Kopyalandı!' : '📋 Kopyala'}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-emerald-700 text-white rounded-lg font-medium hover:bg-emerald-600 transition-all"
            >
              💾 İndir (.txt)
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 overflow-auto max-h-[70vh]">
        <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
          {reportText}
        </pre>
      </div>

      {/* Info */}
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div className="text-sm text-gray-400">
            <p className="font-semibold text-gray-300 mb-1">Rapor Hakkında</p>
            <p>
              Bu rapor, yüklenen tüm JSON dosyalarındaki verilerin tam analizini içermektedir.
              {summaries.length} veri seti, {new Set(summaries.map(s => s.playerName)).size} oyuncu,
              ve {comparisons.length} karşılaştırma analizi detaylı olarak raporlanmıştır.
              Raporu kopyalayıp herhangi bir metin düzenleyicide kullanabilir veya .txt formatında indirebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
