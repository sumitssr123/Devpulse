import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, BarChart2, CheckCircle2 } from 'lucide-react';
import SyncButton from './SyncButton';
import Recommendations from './Recommendations';

export default function DashboardCards({ globalUsername, activeTab }) {
  const [cfHandle, setCfHandle] = useState('');
  const [lcHandle, setLcHandle] = useState('');
  const [acHandle, setAcHandle] = useState('');
  const [statsData, setStatsData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8080/api/user/${globalUsername}`)
      .then(res => res.json())
      .then(data => {
        setCfHandle(!data.cf_handle || data.cf_handle === 'None' ? '' : data.cf_handle);
        setLcHandle(!data.lc_handle || data.lc_handle === 'None' ? '' : data.lc_handle);
        setAcHandle(!data.ac_handle || data.ac_handle === 'None' ? '' : data.ac_handle);
      })
      .catch(err => console.error("Could not fetch user handles:", err));
  }, [globalUsername]);

  const updateHandles = async () => {
    await fetch(`http://localhost:8080/api/user/${globalUsername}/handles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        cf_handle: cfHandle || 'None', 
        lc_handle: lcHandle || 'None', 
        ac_handle: acHandle || 'None'
      })
    });
  };

  const handleSyncSuccess = (data) => {
    if (data && data.platforms) setStatsData(data.platforms);
  };

  const getPlatformData = (key, hexColor) => {
    if (!statsData || !statsData[key]) return { rating: 0, solved: 0, color: hexColor };
    return {
      rating: statsData[key].rating || 0,
      solved: statsData[key].total_solved || 0,
      color: hexColor
    };
  };

  // Strictly 3 Platforms as requested
  const platforms = [
    { id: 'lc', key: 'leetcode', name: 'LeetCode', handle: lcHandle, setHandle: setLcHandle, placeholder: "LeetCode Username", ...getPlatformData('leetcode', '#f59e0b') }, 
    { id: 'cf', key: 'codeforces', name: 'Codeforces', handle: cfHandle, setHandle: setCfHandle, placeholder: "Codeforces Handle", ...getPlatformData('codeforces', '#3b82f6') }, 
    { id: 'ac', key: 'atcoder', name: 'AtCoder', handle: acHandle, setHandle: setAcHandle, placeholder: "AtCoder ID", ...getPlatformData('atcoder', '#10b981') } 
  ];

  const activePlatform = platforms.find(p => p.id === activeTab);
  const totalSolvedGlobal = platforms.reduce((acc, curr) => acc + curr.solved, 0);

  return (
    <div className="flex flex-col gap-8">
      
      <div className="flex justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 flex items-center gap-3">
            <BarChart2 size={36} className="text-blue-600" />
            {activeTab === 'combined' ? "Global Progress Dashboard" : `${activePlatform.name} Analysis`}
          </h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">
            {activeTab === 'combined' ? "Individual rating metrics and total problems solved." : `Deep dive metrics and AI recommendations for ${activePlatform.name}.`}
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
            <Settings size={22} className="text-slate-400"/> 
            {activeTab === 'combined' ? "Configure All Handles" : `${activePlatform.name} Credentials`}
          </h3>
          <div onClick={updateHandles}>
            <SyncButton username={globalUsername} platform={activeTab === 'combined' ? 'all' : activePlatform.key} onSyncSuccess={handleSyncSuccess} />
          </div>
        </div>
        
        <div className={`grid grid-cols-1 ${activeTab === 'combined' ? 'md:grid-cols-3' : 'md:grid-cols-1'} gap-4`}>
          {activeTab === 'combined' ? platforms.map(p => (
            <div key={p.id} className="relative">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">{p.name}</label>
              <input className="bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-blue-500 focus:bg-white w-full text-slate-700 font-medium transition-all" placeholder={p.placeholder} value={p.handle} onChange={e => p.setHandle(e.target.value)} />
            </div>
          )) : (
            <div className="relative max-w-md">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">{activePlatform.name} ID</label>
              <input className="bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none focus:border-blue-500 focus:bg-white w-full text-slate-700 font-medium transition-all" placeholder={activePlatform.placeholder} value={activePlatform.handle} onChange={e => activePlatform.setHandle(e.target.value)} />
            </div>
          )}
        </div>
      </div>

      {activeTab === 'combined' ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl flex justify-between items-center relative overflow-hidden">
            <div className="z-10">
              <p className="text-slate-400 font-bold tracking-widest text-sm uppercase mb-2">Total Problems Conquered (All Platforms)</p>
              <h2 className="text-6xl font-black">{totalSolvedGlobal}</h2>
            </div>
          </div>

          {/* ADVANCED RECTANGULAR DASHBOARD (INDIVIDUAL RATINGS) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {platforms.map((p, i) => (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={p.id} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: p.color }}></div>
                <h4 className="font-black text-2xl text-slate-800 mb-8">{p.name}</h4>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Rating</p>
                    <p className="text-5xl font-black" style={{ color: p.color }}>{p.rating}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Solved</p>
                    <p className="text-3xl font-bold text-slate-700">{p.solved}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: activePlatform.color }}></div>
          <div className="flex justify-between items-center mb-10 border-b border-slate-100 pb-6 mt-2">
            <h3 className="font-black text-3xl text-slate-800">{activePlatform.name} Performance</h3>
            <span className="text-sm text-slate-500 font-bold bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
              <CheckCircle2 size={16} style={{ color: activePlatform.color }} />
              {activePlatform.handle || 'No Handle Configured'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100">
              <span className="text-sm text-slate-400 font-bold tracking-widest uppercase block mb-3">Current Rating</span>
              <span className="text-[80px] leading-none font-black block" style={{ color: activePlatform.color }}>{activePlatform.rating}</span>
            </div>
            <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100">
              <span className="text-sm text-slate-400 font-bold tracking-widest uppercase block mb-3">Problems Solved</span>
              <span className="text-[80px] leading-none font-black text-slate-800 block">{activePlatform.solved}</span>
            </div>
          </div>
        </div>
      )}

      <Recommendations analysisMode={activeTab} />
    </div>
  );
}