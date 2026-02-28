/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Thermometer, 
  Wind, 
  Waves, 
  Sunrise, 
  Sunset, 
  Moon, 
  RefreshCw, 
  Clock,
  MapPin,
  MoonStar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchBajaData, type BajaData } from './services/bajaService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const InfoCard = ({ 
  title, 
  value, 
  icon: Icon, 
  delay = 0,
  unit = ""
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  delay?: number;
  unit?: string;
}) => {
  const displayValue = value && String(value).trim() !== "" ? value : "--";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white/80 backdrop-blur-md border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-zinc-100 rounded-xl group-hover:bg-zinc-900 group-hover:text-white transition-colors">
          <Icon size={20} />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">Live Data</span>
      </div>
      <h3 className="text-zinc-500 text-xs font-medium uppercase tracking-tight mb-1">{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-zinc-900 tabular-nums">{displayValue}</span>
        {unit && displayValue !== "--" && <span className="text-sm text-zinc-400 font-medium">{unit}</span>}
      </div>
    </motion.div>
  );
};

export default function App() {
  const [data, setData] = useState<BajaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchBajaData();
      setData(result);
      setError(null);
    } catch (err) {
      setError("Nem sikerült az adatok betöltése. Kérjük, próbálja újra később.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Refresh every 15 minutes
    const interval = setInterval(loadData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 pt-12 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <MapPin size={16} />
            <span className="text-sm font-medium uppercase tracking-widest">Magyarország, Bács-Kiskun</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-zinc-900">
            Baja <span className="text-zinc-300">Város</span>
          </h1>
          <div className="mt-2 flex items-center gap-2 text-zinc-400 font-mono text-xs font-semibold uppercase tracking-wider">
            <Clock size={14} />
            <span>{new Date().toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</span>
          </div>
          <p className="mt-4 text-zinc-500 max-w-md font-medium">
            Valós idejű információs műszerfal: időjárás, vízállás és csillagászati adatok Baja térségéből.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3 bg-white border border-zinc-200 rounded-full px-4 py-2 shadow-sm">
            <div className={cn("w-2 h-2 rounded-full bg-emerald-500", isRefreshing && "animate-pulse")} />
            <span className="text-xs font-mono font-medium text-zinc-600">
              {data ? `Utolsó frissítés: ${data.lastUpdated}` : 'Frissítés...'}
            </span>
            <button 
              onClick={loadData}
              disabled={isRefreshing}
              className="p-1 hover:bg-zinc-100 rounded-full transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={cn(isRefreshing && "animate-spin")} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-40 bg-zinc-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-2xl text-center">
            <p className="font-medium">{error}</p>
            <button 
              onClick={loadData}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Újrapróbálkozás
            </button>
          </div>
        ) : data ? (
          <div className="space-y-12">
            {/* Environmental Data */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px flex-1 bg-zinc-200" />
                <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 font-bold">Környezeti Adatok</h2>
                <div className="h-px flex-1 bg-zinc-200" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoCard 
                  title="Hőmérséklet" 
                  value={String(data.temperature).match(/[0-9.-]+/)?.[0] || data.temperature} 
                  unit="°C"
                  icon={Thermometer} 
                  delay={0.1} 
                />
                <InfoCard 
                  title="Szélerősség" 
                  value={String(data.windSpeed).match(/[0-9.-]+/)?.[0] || data.windSpeed} 
                  unit="km/h"
                  icon={Wind} 
                  delay={0.2} 
                />
                <InfoCard 
                  title="Dunai Vízállás" 
                  value={String(data.waterLevel).match(/[0-9.-]+/)?.[0] || data.waterLevel} 
                  unit="cm"
                  icon={Waves} 
                  delay={0.3} 
                />
              </div>
            </section>

            {/* Astronomical Data */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px flex-1 bg-zinc-200" />
                <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 font-bold">Csillagászati Adatok</h2>
                <div className="h-px flex-1 bg-zinc-200" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <InfoCard title="Napkelte" value={data.sunrise} icon={Sunrise} delay={0.4} />
                <InfoCard title="Napnyugta" value={data.sunset} icon={Sunset} delay={0.5} />
                <InfoCard title="Holdkelte" value={data.moonrise} icon={Moon} delay={0.6} />
                <InfoCard title="Holdnyugta" value={data.moonset} icon={MoonStar} delay={0.7} />
                <InfoCard title="Holdfázis" value={data.moonPhase} icon={Moon} delay={0.8} />
                <InfoCard title="Következő Telihold" value={data.nextFullMoon} icon={Clock} delay={0.9} />
              </div>
            </section>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-400 text-xs font-medium uppercase tracking-widest">
        <p>© 2026 Baja Város Info Dashboard</p>
        <div className="flex items-center gap-6">
          <a href="https://www.hydroinfo.hu" target="_blank" rel="noreferrer" className="hover:text-zinc-900 transition-colors">Hydroinfo</a>
          <a href="https://www.idokep.hu" target="_blank" rel="noreferrer" className="hover:text-zinc-900 transition-colors">Időkép</a>
        </div>
      </footer>
    </div>
  );
}
