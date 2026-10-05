/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ActiveNav, BlastRecord } from './types';
import { DEFAULT_BLAST, INITIAL_BLAST_HISTORY } from './data/blastData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AnalysisView } from './components/AnalysisView';
import { DashboardView } from './components/DashboardView';
import { HistoryView } from './components/HistoryView';
import { AboutView } from './components/AboutView';

// Import klien Supabase yang sudah kita buat
import { supabase } from './lib/supabaseClient'; 

export default function App() {
  const [activeNav, setActiveNav] = useState<ActiveNav>('analisis-baru');
  const [currentBlast, setCurrentBlast] = useState<BlastRecord>(DEFAULT_BLAST);
  
  const [history, setHistory] = useState<BlastRecord[]>(INITIAL_BLAST_HISTORY);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. Tarik data dari Supabase dan mapping ke tipe BlastRecord
  useEffect(() => {
    const fetchHistoryFromDB = async () => {
      const { data, error } = await supabase
        .from('blast_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Gagal mengambil data dari Supabase:', error);
        return;
      }

      if (data && data.length > 0) {
        const mappedHistory: BlastRecord[] = data.map((row) => ({
          ...DEFAULT_BLAST, // Amankan properti bersarang seperti polygons & sieve
          id: row.id,
          blastId: `BLAST-${row.id.substring(0,4).toUpperCase()}`,
          pitBench: row.location || 'Area Tidak Diketahui',
          blastDate: row.created_at,
          imageUrl: row.original_image_url || '',
          oversizePercentage: row.oversize_percentage || 0,
          evaluationStatus: row.oversize_percentage > 15 ? 'Kritis' : 'Optimal',
          recommendationQuote: row.ai_recommendation || 'Tidak ada rekomendasi',
          percentiles: {
            ...DEFAULT_BLAST.percentiles, 
            p50: row.d50_score || 0,
            p80: row.d80_score || 0,
          },
          createdAt: row.created_at
        }));
        
        setHistory(mappedHistory);
      }
    };

    fetchHistoryFromDB();
  }, []);

  // 2. Simpan ke Supabase sekaligus update UI lokal
  const handleSaveToHistory = async (recordToSave: BlastRecord) => {
    // Update UI Lokal lebih dulu (Optimistic Update)
    setHistory((prev) => {
      const existingIdx = prev.findIndex((b) => b.id === recordToSave.id);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = recordToSave;
        return next;
      }
        return [recordToSave, ...prev];
    });

    // Simpan ke Database
    const { error } = await supabase
      .from('blast_records')
      .insert([
        {
          location: recordToSave.pitBench,
          d50_score: recordToSave.percentiles.p50,
          d80_score: recordToSave.percentiles.p80,
          oversize_percentage: recordToSave.oversizePercentage,
          ai_recommendation: recordToSave.recommendationQuote,
          original_image_url: recordToSave.imageUrl,
        }
      ]);

    if (error) {
      console.error('Gagal menyimpan data ke Supabase:', error);
      alert('Terjadi kesalahan saat sinkronisasi data ke cloud.');
    }
  };

  // Switch preset from dropdown or history
  const handleSelectPresetRecord = (recordId: string) => {
    const found = history.find((b) => b.id === recordId) || DEFAULT_BLAST;
    setCurrentBlast(found);
  };

  // Inspect blast from history or dashboard
  const handleInspectBlast = (blast: BlastRecord) => {
    setCurrentBlast(blast);
    setActiveNav('analisis-baru');
  };

  return (
    <div className="min-h-screen bg-[#0f141a] text-[#dee3eb] font-['Montserrat',sans-serif] flex">
      {/* Navigation Sidebar */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-h-screen w-full min-w-0">
        <Header
          onToggleMobile={() => setIsMobileMenuOpen((prev) => !prev)}
          currentBlastId={currentBlast.blastId}
        />

        <main className="w-full pt-16 flex-1 bg-[#0f141a]">
          {activeNav === 'analisis-baru' && (
            <AnalysisView
              currentBlast={currentBlast}
              setCurrentBlast={setCurrentBlast}
              onSaveToHistory={handleSaveToHistory}
              onSelectPresetRecord={handleSelectPresetRecord}
            />
          )}

          {activeNav === 'dashboard' && (
            <DashboardView
              history={history}
              onSelectBlast={handleInspectBlast}
              onGoToAnalysis={() => setActiveNav('analisis-baru')}
            />
          )}

          {activeNav === 'riwayat' && (
            <HistoryView
              history={history}
              onSelectBlast={handleInspectBlast}
              onGoToAnalysis={() => setActiveNav('analisis-baru')}
            />
          )}

          {activeNav === 'tentang-sistem' && <AboutView />}
        </main>
      </div>
    </div>
  );
}