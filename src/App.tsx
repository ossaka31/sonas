import { useState, useCallback } from 'react';
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
import { LoadedFile, PlayerSummary, NarrativeSection, ComparisonResult, UserCacheEntry } from './types';
import { analyzePlayerData, comparePlayers } from './utils/analyzer';
import { generateNarratives } from './utils/narrative';
import FileUploader from './components/FileUploader';
import Dashboard from './components/Dashboard';
import ComparisonView from './components/ComparisonView';
import NarrativePanel from './components/NarrativePanel';
import TextReport from './components/TextReport';

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

type AppView = 'upload' | 'dashboard' | 'comparison' | 'narrative' | 'report';

export default function App() {
  const [loadedFiles, setLoadedFiles] = useState<LoadedFile[]>([]);
  const [summaries, setSummaries] = useState<PlayerSummary[]>([]);
  const [narratives, setNarratives] = useState<NarrativeSection[][]>([]);
  const [comparisons, setComparisons] = useState<ComparisonResult[][]>([]);
  const [userCache, setUserCache] = useState<UserCacheEntry[]>([]);
  const [currentView, setCurrentView] = useState<AppView>('upload');
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleUserCacheUpload = useCallback((entries: UserCacheEntry[]) => {
    setUserCache(entries);
  }, []);

  const handleFilesUpload = useCallback(async (files: File[]) => {
    setIsAnalyzing(true);
    const newLoadedFiles: LoadedFile[] = [];
    const newSummaries: PlayerSummary[] = [];
    const newNarratives: NarrativeSection[][] = [];

    for (const file of files) {
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // UUID'den oyuncu adını bul
        let playerName = file.name.replace('.json', '');
        let uuid = data.UUID || '';
        
        if (userCache.length > 0 && uuid) {
          const cacheEntry = userCache.find(e => e.uuid === uuid);
          if (cacheEntry) {
            playerName = cacheEntry.name;
          }
        }

        // Eğer UUID yoksa ama dosya adında UUID varsa
        if (!uuid && file.name.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          uuid = file.name.replace('.json', '');
          const cacheEntry = userCache.find(e => e.uuid === uuid);
          if (cacheEntry) {
            playerName = cacheEntry.name;
          }
        }

        const loadedFile: LoadedFile = {
          fileName: file.name,
          data,
          uuid,
          playerName,
          loadedAt: new Date(),
        };

        newLoadedFiles.push(loadedFile);
        
        // Analiz yap
        const summary = analyzePlayerData(loadedFile);
        newSummaries.push(summary);
      } catch (err) {
        console.error(`Dosya işlenirken hata: ${file.name}`, err);
      }
    }

    // Tüm state'leri güncelle
    const allLoadedFiles = [...loadedFiles, ...newLoadedFiles];
    const allSummaries = [...summaries, ...newSummaries];

    // Anlatıları üret - aynı oyuncunun önceki verisi varsa karşılaştır
    for (let i = 0; i < newSummaries.length; i++) {
      const current = newSummaries[i];
      // Bu oyuncunun daha önceki son verisini bul
      const previousVersions = summaries.filter(s => s.playerName === current.playerName);
      const prevSummary = previousVersions.length > 0 ? previousVersions[previousVersions.length - 1] : undefined;
      const playerNarratives = generateNarratives(current, prevSummary);
      newNarratives.push(playerNarratives);
    }

    setLoadedFiles(allLoadedFiles);
    setSummaries(allSummaries);
    setNarratives(prev => [...prev, ...newNarratives]);

    // Karşılaştırmaları oluştur
    const newComparisons: ComparisonResult[][] = [];
    
    // Aynı oyuncunun farklı zamanlardaki verilerini karşılaştır
    const playerGroups: Record<string, PlayerSummary[]> = {};
    allSummaries.forEach(s => {
      if (!playerGroups[s.playerName]) playerGroups[s.playerName] = [];
      playerGroups[s.playerName].push(s);
    });

    for (const [, versions] of Object.entries(playerGroups)) {
      if (versions.length >= 2) {
        // Ardışık karşılaştırmalar
        for (let i = 1; i < versions.length; i++) {
          newComparisons.push(comparePlayers(versions[i - 1], versions[i]));
        }
      }
    }

    // Farklı oyuncular arası karşılaştırma (son versiyonları)
    const latestPerPlayer = Object.values(playerGroups).map(v => v[v.length - 1]);
    if (latestPerPlayer.length > 1) {
      for (let i = 0; i < latestPerPlayer.length; i++) {
        for (let j = i + 1; j < latestPerPlayer.length; j++) {
          newComparisons.push(comparePlayers(latestPerPlayer[i], latestPerPlayer[j]));
        }
      }
    }

    setComparisons(newComparisons);
    setIsAnalyzing(false);
    setCurrentView('dashboard');
  }, [summaries, loadedFiles, userCache]);

  const handleReset = () => {
    setLoadedFiles([]);
    setSummaries([]);
    setNarratives([]);
    setComparisons([]);
    setCurrentView('upload');
    setSelectedPlayerIndex(0);
  };

  const handleStartAnalysis = () => {
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-sm border-b border-emerald-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">⛏️</div>
            <div>
              <h1 className="text-xl font-bold text-emerald-400">Minecraft İstatistik Analiz Sistemi</h1>
              <p className="text-xs text-gray-400">Oyuncu verilerini analiz et, grafiklerle görselleştir, detaylı rapor oluştur</p>
            </div>
          </div>
          
          {loadedFiles.length > 0 && (
            <div className="flex items-center gap-2">
              <nav className="flex gap-1 mr-4">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    currentView === 'dashboard' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  📊 Panel
                </button>
                <button
                  onClick={() => setCurrentView('comparison')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    currentView === 'comparison' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  🔄 Karşılaştır
                </button>
                <button
                  onClick={() => setCurrentView('narrative')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    currentView === 'narrative' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  📝 Anlatı
                </button>
                <button
                  onClick={() => setCurrentView('report')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    currentView === 'report' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  📄 Rapor
                </button>
              </nav>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 bg-red-900/50 text-red-300 rounded text-sm hover:bg-red-800/50 transition-all"
              >
                🗑️ Sıfırla
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentView === 'upload' && (
          <FileUploader
            onFilesUpload={handleFilesUpload}
            onUserCacheUpload={handleUserCacheUpload}
            onStartAnalysis={handleStartAnalysis}
            loadedFiles={loadedFiles}
            isAnalyzing={isAnalyzing}
          />
        )}

        {currentView === 'dashboard' && summaries.length > 0 && (
          <Dashboard
            summaries={summaries}
            loadedFiles={loadedFiles}
            selectedIndex={selectedPlayerIndex}
            onSelectPlayer={setSelectedPlayerIndex}
          />
        )}

        {currentView === 'comparison' && (
          <ComparisonView
            summaries={summaries}
            comparisons={comparisons}
          />
        )}

        {currentView === 'narrative' && (
          <NarrativePanel
            narratives={narratives}
            summaries={summaries}
            selectedIndex={selectedPlayerIndex}
            onSelectPlayer={setSelectedPlayerIndex}
          />
        )}

        {currentView === 'report' && (
          <TextReport
            summaries={summaries}
            narratives={narratives}
            comparisons={comparisons}
            loadedFiles={loadedFiles}
          />
        )}
      </main>
    </div>
  );
}
