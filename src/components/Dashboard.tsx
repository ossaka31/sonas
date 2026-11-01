import { Bar, Doughnut, Radar } from 'react-chartjs-2';
import { PlayerSummary, LoadedFile } from '../types';

interface DashboardProps {
  summaries: PlayerSummary[];
  loadedFiles: LoadedFile[];
  selectedIndex: number;
  onSelectPlayer: (index: number) => void;
}

export default function Dashboard({ summaries, loadedFiles, selectedIndex, onSelectPlayer }: DashboardProps) {
  const summary = summaries[selectedIndex] || summaries[0];
  if (!summary) return null;

  const chartColors = [
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
    '#14b8a6', '#e11d48', '#a855f7', '#0ea5e9', '#eab308',
  ];

  // Kırılan Bloklar Grafiği
  const minedChartData = {
    labels: summary.topMinedBlocks.slice(0, 10).map(b => b.name),
    datasets: [{
      label: 'Kırılan Blok Sayısı',
      data: summary.topMinedBlocks.slice(0, 10).map(b => b.count),
      backgroundColor: chartColors.slice(0, 10).map(c => c + '80'),
      borderColor: chartColors.slice(0, 10),
      borderWidth: 1,
    }],
  };

  // Üretilen Eşyalar Grafiği
  const craftedChartData = {
    labels: summary.topCraftedItems.slice(0, 10).map(i => i.name),
    datasets: [{
      label: 'Üretilen Eşya Sayısı',
      data: summary.topCraftedItems.slice(0, 10).map(i => i.count),
      backgroundColor: chartColors.slice(0, 10).map(c => c + '80'),
      borderColor: chartColors.slice(0, 10),
      borderWidth: 1,
    }],
  };

  // Öldürülen Yaratıklar Grafiği
  const killedChartData = {
    labels: summary.topKilledMobs.slice(0, 10).map(m => m.name),
    datasets: [{
      label: 'Öldürülen Yaratık Sayısı',
      data: summary.topKilledMobs.slice(0, 10).map(m => m.count),
      backgroundColor: chartColors.slice(0, 10).map(c => c + '80'),
      borderColor: chartColors.slice(0, 10),
      borderWidth: 1,
    }],
  };

  // Radar Grafiği - Genel Performans
  const radarChartData = {
    labels: ['Madencilik', 'Üretim', 'Savaş', 'Keşif', 'Hayatta Kalma', 'Deneyim'],
    datasets: [{
      label: summary.playerName,
      data: [
        Math.min(100, (summary.totalBlocksMined / 500) * 10),
        Math.min(100, (summary.totalItemsCrafted / 300) * 10),
        Math.min(100, (summary.totalMobsKilled / 200) * 10),
        Math.min(100, (summary.totalDistanceWalked / 5000) * 10),
        Math.max(0, 100 - (summary.deaths * 5)),
        Math.min(100, (summary.xpLevel / 3) * 10),
      ],
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      borderColor: '#10b981',
      borderWidth: 2,
      pointBackgroundColor: '#10b981',
    }],
  };

  // Envanter Pasta Grafiği
  const inventoryChartData = {
    labels: ['Dolu Slotlar', 'Boş Slotlar'],
    datasets: [{
      data: [summary.inventorySize, Math.max(0, 36 - summary.inventorySize)],
      backgroundColor: ['#10b981', '#374151'],
      borderColor: ['#10b981', '#4b5563'],
      borderWidth: 2,
    }],
  };

  // Kullanılan Eşyalar Grafiği
  const usedChartData = {
    labels: summary.topUsedItems.slice(0, 8).map(i => i.name),
    datasets: [{
      label: 'Kullanım Sayısı',
      data: summary.topUsedItems.slice(0, 8).map(i => i.count),
      backgroundColor: chartColors.slice(0, 8).map(c => c + '80'),
      borderColor: chartColors.slice(0, 8),
      borderWidth: 1,
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
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

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#9ca3af' } } },
    scales: {
      r: {
        ticks: { color: '#9ca3af', backdropColor: 'transparent' },
        grid: { color: '#374151' },
        pointLabels: { color: '#d1d5db', font: { size: 12 } },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Player Selector */}
      {summaries.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {summaries.map((s, i) => (
            <button
              key={i}
              onClick={() => onSelectPlayer(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                i === selectedIndex
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {s.playerName} {loadedFiles[i] ? `(${loadedFiles[i].fileName})` : ''}
            </button>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard icon="⛏️" label="Kırılan Blok" value={summary.totalBlocksMined.toLocaleString('tr-TR')} color="emerald" />
        <StatCard icon="🔨" label="Üretilen Eşya" value={summary.totalItemsCrafted.toLocaleString('tr-TR')} color="blue" />
        <StatCard icon="⚔️" label="Öldürülen Yaratık" value={summary.totalMobsKilled.toLocaleString('tr-TR')} color="red" />
        <StatCard icon="🚶" label="Yürünen Mesafe" value={`${summary.totalDistanceWalked.toLocaleString('tr-TR')} m`} color="yellow" />
        <StatCard icon="✨" label="XP Seviyesi" value={summary.xpLevel.toString()} color="purple" />
        <StatCard icon="💀" label="Ölüm Sayısı" value={summary.deaths.toString()} color="gray" />
        <StatCard icon="❤️" label="Sağlık" value={`${summary.health}/20`} color="pink" />
        <StatCard icon="🍖" label="Açlık" value={`${summary.foodLevel}/20`} color="orange" />
        <StatCard icon="🕊️" label="Uçulan Mesafe" value={`${summary.totalDistanceFlown.toLocaleString('tr-TR')} m`} color="cyan" />
        <StatCard icon="🏊" label="Yüzülen Mesafe" value={`${summary.totalDistanceSwum.toLocaleString('tr-TR')} m`} color="teal" />
        <StatCard icon="🦘" label="Zıplama" value={summary.totalJumps.toLocaleString('tr-TR')} color="indigo" />
        <StatCard icon="⏰" label="Oynama Süresi" value={`${summary.playTimeMinutes} dk`} color="lime" />
      </div>

      {/* Player Info Bar */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Oyuncu:</span>
            <span className="ml-2 text-emerald-400 font-semibold">{summary.playerName}</span>
          </div>
          <div>
            <span className="text-gray-400">Mod:</span>
            <span className="ml-2 text-white">{summary.gameType}</span>
          </div>
          <div>
            <span className="text-gray-400">Boyut:</span>
            <span className="ml-2 text-white">{summary.dimension}</span>
          </div>
          <div>
            <span className="text-gray-400">Konum:</span>
            <span className="ml-2 text-white">{summary.position.x}, {summary.position.y}, {summary.position.z}</span>
          </div>
          <div>
            <span className="text-gray-400">Envanter:</span>
            <span className="ml-2 text-white">{summary.inventorySize}/36 slot</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kırılan Bloklar */}
        {summary.topMinedBlocks.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4">⛏️ En Çok Kırılan Bloklar</h3>
            <div className="h-72">
              <Bar data={minedChartData} options={barOptions} />
            </div>
          </div>
        )}

        {/* Üretilen Eşyalar */}
        {summary.topCraftedItems.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-blue-400 mb-4">🔨 En Çok Üretilen Eşyalar</h3>
            <div className="h-72">
              <Bar data={craftedChartData} options={barOptions} />
            </div>
          </div>
        )}

        {/* Öldürülen Yaratıklar */}
        {summary.topKilledMobs.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-red-400 mb-4">⚔️ En Çok Öldürülen Yaratıklar</h3>
            <div className="h-72">
              <Bar data={killedChartData} options={barOptions} />
            </div>
          </div>
        )}

        {/* Radar - Genel Performans */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-purple-400 mb-4">🎯 Genel Performans Radar</h3>
          <div className="h-72">
            <Radar data={radarChartData} options={radarOptions} />
          </div>
        </div>

        {/* Envanter Doluluk */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">🎒 Envanter Doluluk Durumu</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="w-48 h-48">
              <Doughnut data={inventoryChartData} options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { labels: { color: '#9ca3af' } } },
              }} />
            </div>
          </div>
          <p className="text-center text-sm text-gray-400 mt-2">
            Envanter Değeri: <span className="text-yellow-400 font-semibold">{summary.inventoryValue} puan</span>
          </p>
        </div>

        {/* Kullanılan Eşyalar */}
        {summary.topUsedItems.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-amber-400 mb-4">🖐️ En Çok Kullanılan Eşyalar</h3>
            <div className="h-72">
              <Bar data={usedChartData} options={barOptions} />
            </div>
          </div>
        )}
      </div>

      {/* Kırılan Aletler Tablosu */}
      {summary.topBrokenTools.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-orange-400 mb-4">🔧 Kırılan Aletler</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-3 text-gray-400">#</th>
                  <th className="text-left py-2 px-3 text-gray-400">Alet</th>
                  <th className="text-right py-2 px-3 text-gray-400">Kırılma Sayısı</th>
                  <th className="text-right py-2 px-3 text-gray-400">Oran</th>
                </tr>
              </thead>
              <tbody>
                {summary.topBrokenTools.map((tool, i) => {
                  const total = summary.topBrokenTools.reduce((s, t) => s + t.count, 0);
                  const pct = ((tool.count / total) * 100).toFixed(1);
                  return (
                    <tr key={i} className="border-b border-gray-800 hover:bg-gray-700/30">
                      <td className="py-2 px-3 text-gray-500">{i + 1}</td>
                      <td className="py-2 px-3 text-white">{tool.name}</td>
                      <td className="py-2 px-3 text-right text-orange-300 font-mono">{tool.count}</td>
                      <td className="py-2 px-3 text-right text-gray-400">%{pct}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tüm İstatistikler Tablosu */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-emerald-400 mb-4">📋 Tüm İstatistikler (Detaylı Liste)</h3>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-800">
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-400">#</th>
                <th className="text-left py-2 px-3 text-gray-400">Kategori</th>
                <th className="text-left py-2 px-3 text-gray-400">İstatistik</th>
                <th className="text-right py-2 px-3 text-gray-400">Değer</th>
              </tr>
            </thead>
            <tbody>
              {summary.allStats.slice(0, 100).map((stat, i) => (
                <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-700/20">
                  <td className="py-1.5 px-3 text-gray-600 text-xs">{i + 1}</td>
                  <td className="py-1.5 px-3">
                    <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">{stat.category}</span>
                  </td>
                  <td className="py-1.5 px-3 text-white text-xs">{stat.name}</td>
                  <td className="py-1.5 px-3 text-right text-emerald-400 font-mono text-xs">{stat.value.toLocaleString('tr-TR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {summary.allStats.length > 100 && (
          <p className="text-center text-sm text-gray-500 mt-2">
            Toplam {summary.allStats.length} istatistikten ilk 100'ü gösteriliyor
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'border-emerald-700/50 bg-emerald-900/20',
    blue: 'border-blue-700/50 bg-blue-900/20',
    red: 'border-red-700/50 bg-red-900/20',
    yellow: 'border-yellow-700/50 bg-yellow-900/20',
    purple: 'border-purple-700/50 bg-purple-900/20',
    gray: 'border-gray-700/50 bg-gray-800/50',
    pink: 'border-pink-700/50 bg-pink-900/20',
    orange: 'border-orange-700/50 bg-orange-900/20',
    cyan: 'border-cyan-700/50 bg-cyan-900/20',
    teal: 'border-teal-700/50 bg-teal-900/20',
    indigo: 'border-indigo-700/50 bg-indigo-900/20',
    lime: 'border-lime-700/50 bg-lime-900/20',
  };

  return (
    <div className={`border rounded-lg p-3 ${colorMap[color] || colorMap.gray}`}>
      <div className="text-lg mb-1">{icon}</div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-sm font-bold text-white mt-0.5">{value}</div>
    </div>
  );
}
