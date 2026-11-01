import { PlayerSummary, NarrativeSection } from '../types';

interface NarrativePanelProps {
  narratives: NarrativeSection[][];
  summaries: PlayerSummary[];
  selectedIndex: number;
  onSelectPlayer: (index: number) => void;
}

export default function NarrativePanel({ narratives, summaries, selectedIndex, onSelectPlayer }: NarrativePanelProps) {
  const playerNarratives = narratives[selectedIndex] || narratives[0] || [];
  const summary = summaries[selectedIndex] || summaries[0];

  if (!summary || playerNarratives.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">📝</div>
        <h2 className="text-2xl font-bold text-gray-300 mb-2">Anlatı Bulunamadı</h2>
        <p className="text-gray-500">Henüz analiz yapılmamış. Lütfen JSON dosyası yükleyin.</p>
      </div>
    );
  }

  const typeStyles: Record<string, string> = {
    info: 'border-blue-700/50 bg-blue-900/10',
    warning: 'border-yellow-700/50 bg-yellow-900/10',
    success: 'border-green-700/50 bg-green-900/10',
    comparison: 'border-purple-700/50 bg-purple-900/10',
    highlight: 'border-emerald-700/50 bg-emerald-900/10',
  };

  const typeIcons: Record<string, string> = {
    info: 'ℹ️',
    warning: '⚠️',
    success: '✅',
    comparison: '🔄',
    highlight: '🌟',
  };

  // Markdown benzeri formatlamayı basit HTML'e çevir
  const formatText = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        // Bold
        let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
        // Emoji prefix
        return `<p key="${i}" class="${line.startsWith('•') ? 'ml-4' : ''} ${line === '' ? 'h-2' : ''}">${formatted}</p>`;
      })
      .join('');
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
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              📝 {s.playerName}
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/30 to-blue-900/30 border border-emerald-700/50 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-emerald-400 mb-2">
          📝 Detaylı Anlatı Raporu
        </h2>
        <p className="text-gray-400">
          <strong className="text-white">{summary.playerName}</strong> adlı oyuncunun tüm istatistikleri 
          detaylı Türkçe anlatılarla açıklanmaktadır. Her bir veri noktası değerlendirilmiş ve yorumlanmıştır.
        </p>
        <div className="mt-3 flex gap-4 text-sm">
          <span className="text-gray-400">Toplam anlatı: <strong className="text-emerald-400">{playerNarratives.length} bölüm</strong></span>
          <span className="text-gray-400">İstatistik sayısı: <strong className="text-emerald-400">{summary.allStats.length}</strong></span>
        </div>
      </div>

      {/* Narrative Sections */}
      <div className="space-y-4">
        {playerNarratives.map((section, i) => (
          <div
            key={i}
            className={`border rounded-xl p-5 transition-all hover:shadow-lg ${typeStyles[section.type] || typeStyles.info}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{typeIcons[section.type] || '📌'}</span>
              <h3 className="text-lg font-bold text-white">{section.title}</h3>
            </div>
            <div className="text-gray-300 leading-relaxed text-sm space-y-1">
              {section.content.split('\n').map((line, li) => {
                if (line.trim() === '') return <br key={li} />;
                
                // Bold işleme
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                  <p key={li} className={`${line.startsWith('•') ? 'ml-4' : ''} ${line.startsWith('→') ? 'ml-8 text-gray-400' : ''}`}>
                    {parts.map((part, pi) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={pi} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
                      }
                      return <span key={pi}>{part}</span>;
                    })}
                  </p>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Alt bilgi */}
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-500">
          💡 Bu anlatılar, oyuncunun JSON verilerindeki istatistiklerden otomatik olarak üretilmiştir.
          Her bir veri noktası dikkate alınmış ve detaylı yorumlanmıştır.
        </p>
      </div>
    </div>
  );
}
