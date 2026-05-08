import React from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import ISSMap from './components/ISSMap';
import NewsDashboard from './components/NewsDashboard';
import DataViz from './components/DataViz';
import AIChatbot from './components/AIChatbot';
import { Toaster } from 'react-hot-toast';
import { Moon, Sun, LayoutDashboard, Rocket, Newspaper, Info } from 'lucide-react';

const DashboardContent = () => {
  const { theme, toggleTheme } = useDashboard();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 glass border-b-0 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <LayoutDashboard size={24} />
          </div>
          <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            ORBITA DASHBOARD
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 transition-all border border-slate-200 dark:border-slate-700"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-grow p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        {/* Left Column: ISS & DataViz */}
        <div className="xl:col-span-8 space-y-6">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Rocket size={18} />
              <h2 className="text-xs font-bold uppercase tracking-widest">Real-time ISS Tracker</h2>
            </div>
            <ISSMap />
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Info size={18} />
              <h2 className="text-xs font-bold uppercase tracking-widest">Telemetry & Analytics</h2>
            </div>
            <DataViz />
          </section>
        </div>

        {/* Right Column: News */}
        <div className="xl:col-span-4 space-y-6">
          <section className="space-y-4 h-full flex flex-col">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Newspaper size={18} />
              <h2 className="text-xs font-bold uppercase tracking-widest">Global News Feed</h2>
            </div>
            <div className="flex-grow">
              <NewsDashboard />
            </div>
          </section>
        </div>
      </main>

      <AIChatbot />
      <Toaster position="top-right" />
    </div>
  );
};

function App() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}

export default App;
