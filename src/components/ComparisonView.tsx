import { Bar, Line } from 'react-chartjs-2';
import { PlayerSummary, ComparisonResult } from '../types';

interface ComparisonViewProps {
  summaries: PlayerSummary[];
  comparisons: ComparisonResult[][];
}

export default function ComparisonView({ summaries, comparisons }: ComparisonViewProps) {
  if (summaries.length < 2) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🔄</div>
        <h2 className="text-2xl font-bold text-gray-300 mb-2">Karşılaştırma İçin Yetersiz Veri</h2>
        <p className="text-gray-500">
          Karşılaştırma yapabilmek için en az 2 farklı JSON dosyası yüklemeniz gerekiyor.
          <br />
          <span className="text-sm text-gray-600">
            İpucu: Aynı oyuncunun farklı günlerdeki dosyalarını yükleyerek günlük gelişiminizi takip edebilirsiniz.
          </span>
        </p>
      </div>
    );
  }

  const chartColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Oyuncular arası karşılaştırma grafikleri
  const metricsForComparison = [
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

  // Çoklu oyuncu karşılaştırma bar grafiği
  const multiPlayerBarData = {
    labels: metricsForComparison.map(m => m.label),
    datasets: summaries.map((s, i) => ({
      label: s.playerName + (summaries.filter(ss => ss.playerName === s.playerName).length > 1 ? ` (${i + 1})` : ''),
      data: metricsForComparison.map(m => (s as any)[m.key] || 0),
      backgroundColor: chartColors[i % chartColors.length] + '80',
      borderColor: chartColors[i % chartColors.length],
      borderWidth: 1,
    })),
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#9ca3af' } },
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af', font: { size: 10 }, maxRotation: 45 },
        grid: { color: '#374151' },
      },
      y: {
        ticks: { color: '#9ca3af' },
        grid: { color: '#374151' },
      },
    },
  };

  // Aynı oyuncunun farklı zamanlardaki verilerini çizgi grafik ile göster
  const playerGroups: Record<string, PlayerSummary[]> = {};
  summaries.forEach((s, i) => {
    if (!playerGroups[s.playerName]) playerGroups[s.playerName] = [];
    playerGroups[s.playerName].push(s);
  });

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
        <h2 className="text-2xl font-bold text-emerald-400 mb-2">🔄 Karşılaştırma Analizi</h2>
        <p className="text-gray-400">
          {summaries.length} veri seti arasında detaylı karşılaştırma yapılıyor.
          {Object.keys(playerGroups).length} farklı oyuncu tespit edildi.
        </p>
      </div>

      {/* Çoklu Oyuncu Karşılaştırma Grafiği */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-blue-400 mb-4">📊 Oyuncular Arası Genel Karşılaştırma</h3>
        <div className="h-96">
          <Bar data={multiPlayerBarData} options={barOptions} />
        </div>
      </div>

      {/* Günlük İlerleme (Aynı oyuncu için) */}
      {Object.entries(playerGroups).map(([playerName, playerSummaries]) => {
        if (playerSummaries.length < 2) return null;
        
        return (
          <div key={playerName} className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4">
              📈 {playerName} - Günlük İlerleme Grafiği
            </h3>
            <div className="h-80">
              <Line
                data={{
                  labels: playerSummaries.map((_, i) => `Veri ${i + 1}`),
                  datasets: [
                    {
                      label: 'Kırılan Blok',
                      data: playerSummaries.map(s => s.totalBlocksMined),
                      borderColor: '#10b981',
                      backgroundColor: '#10b98120',
                      fill: true,
                      tension: 0.3,
                    },
                    {
                      label: 'XP Seviyesi',
                      data: playerSummaries.map(s => s.xpLevel),
                      borderColor: '#8b5cf6',
                      backgroundColor: '#8b5cf620',
                      fill: true,
                      tension: 0.3,
                    },
                    {
                      label: 'Öldürülen Yaratık',
                      data: playerSummaries.map(s => s.totalMobsKilled),
                      borderColor: '#ef4444',
                      backgroundColor: '#ef444420',
                      fill: true,
                      tension: 0.3,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { labels: { color: '#9ca3af' } } },
                  scales: {
                    x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                    y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                  },
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Detaylı Karşılaştırma Tabloları */}
      {comparisons.length > 0 && comparisons.map((comp, ci) => (
        <div key={ci} className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-amber-400 mb-4">
            📋 Detaylı Karşılaştırma #{ci + 1}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-3 text-gray-400">Metrik</th>
                  <th className="text-right py-2 px-3 text-gray-400">Önceki</th>
                  <th className="text-right py-2 px-3 text-gray-400">Sonraki</th>
                  <th className="text-right py-2 px-3 text-gray-400">Değişim</th>
                  <th className="text-right py-2 px-3 text-gray-400">Değişim %</th>
                </tr>
              </thead>
              <tbody>
                {comp.map((c, i) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-gray-700/20">
                    <td className="py-2 px-3 text-white">{c.metric}</td>
                    <td className="py-2 px-3 text-right text-gray-400 font-mono">{c.oldValue.toLocaleString('tr-TR')}</td>
                    <td className="py-2 px-3 text-right text-white font-mono">{c.newValue.toLocaleString('tr-TR')}</td>
                    <td className={`py-2 px-3 text-right font-mono font-semibold ${
                      c.change > 0 ? 'text-green-400' : c.change < 0 ? 'text-red-400' : 'text-gray-500'
                    }`}>
                      {c.change > 0 ? '+' : ''}{c.change.toLocaleString('tr-TR')}
                    </td>
                    <td className={`py-2 px-3 text-right font-mono ${
                      c.changePercent > 0 ? 'text-green-400' : c.changePercent < 0 ? 'text-red-400' : 'text-gray-500'
                    }`}>
                      {c.changePercent > 0 ? '+' : ''}{c.changePercent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Karşılaştırma anlatıları */}
          <div className="mt-4 space-y-2">
            {comp.filter(c => c.change !== 0).slice(0, 5).map((c, i) => (
              <div key={i} className="bg-gray-900/50 rounded-lg p-3 text-sm text-gray-300">
                {c.narrative}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Karşılaştırma Özeti */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-emerald-400 mb-4">🏆 Karşılaştırma Özeti</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summaries.map((s, i) => {
            const totalScore = 
              s.totalBlocksMined * 0.1 +
              s.totalItemsCrafted * 0.2 +
              s.totalMobsKilled * 0.5 +
              s.xpLevel * 10 +
              s.totalDistanceWalked * 0.01 -
              s.deaths * 5;
            
            return (
              <div key={i} className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">{s.playerName}</span>
                  <span className="text-emerald-400 font-bold">{Math.round(totalScore)} puan</span>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>⛏️ Blok: {s.totalBlocksMined.toLocaleString('tr-TR')}</div>
                  <div>⚔️ Yaratık: {s.totalMobsKilled.toLocaleString('tr-TR')}</div>
                  <div>✨ XP: {s.xpLevel} seviye</div>
                  <div>💀 Ölüm: {s.deaths}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
