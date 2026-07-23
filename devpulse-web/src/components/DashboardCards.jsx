import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import SyncButton from './SyncButton';
import Recommendations from './Recommendations';

export default function DashboardCards({ globalUsername }) {
  const [cfHandle, setCfHandle] = useState('');
  const [lcHandle, setLcHandle] = useState('');
  const [acHandle, setAcHandle] = useState('');
  const [statsData, setStatsData] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('combined'); // 'combined', 'cf', 'lc', 'ac'

  // Fetch initial handles
  useEffect(() => {
    fetch(`http://localhost:8080/api/user/${globalUsername}`)
      .then(res => res.json())
      .then(data => {
        setCfHandle(data.cf_handle || globalUsername);
        setLcHandle(data.lc_handle || globalUsername);
        setAcHandle(data.ac_handle || globalUsername);
      });
  }, [globalUsername]);

  // Save handles before sync
  const updateHandles = async () => {
    await fetch(`http://localhost:8080/api/user/${globalUsername}/handles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cf_handle: cfHandle, lc_handle: lcHandle, ac_handle: acHandle })
    });
  };

  const handleSyncSuccess = (data) => {
    setStatsData(data.platforms);
  };

  // Define platforms using the fetched data (or defaults if not synced)
  const getPlatformData = (key, defaultColor, defaultBorder) => {
    if (!statsData) return { rating: 0, solved: 0, graphs: 0, dp: 0, color: defaultColor, borderStyle: defaultBorder };
    return {
      rating: statsData[key].rating,
      solved: statsData[key].total_solved,
      graphs: statsData[key].graph_solved,
      dp: statsData[key].dp_solved,
      color: defaultColor,
      borderStyle: defaultBorder
    };
  };

  const cfData = getPlatformData('codeforces', 'blue', 'border-t-blue-500');
  const lcData = getPlatformData('leetcode', 'orange', 'border-t-orange-400');
  const acData = getPlatformData('atcoder', 'green', 'border-t-green-500');

  const platforms = [
    { name: 'Codeforces', handle: cfHandle, setHandle: setCfHandle, ...cfData },
    { name: 'LeetCode', handle: lcHandle, setHandle: setLcHandle, ...lcData },
    { name: 'AtCoder', handle: acHandle, setHandle: setAcHandle, ...acData }
  ];

  // Logic for Combined Stats
  const totalCompletedTopics = (cfData.graphs + cfData.dp) + (lcData.graphs + lcData.dp) + (acData.graphs + acData.dp);
  const TOTAL_EXPECTED_TOPICS = 100; // Example max

  return (
    <div className="flex flex-col gap-6">
      {/* UPSIDE: Handle Settings & Sync */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Settings size={18}/> Update Platform IDs</h3>
          <div onClick={updateHandles}>
            <SyncButton username={globalUsername} onSyncSuccess={handleSyncSuccess} />
          </div>
        </div>
        <div className="flex gap-4">
          <input className="border p-2 rounded w-full outline-none focus:border-blue-400" placeholder="Codeforces ID" value={cfHandle} onChange={e => setCfHandle(e.target.value)} />
          <input className="border p-2 rounded w-full outline-none focus:border-blue-400" placeholder="LeetCode ID" value={lcHandle} onChange={e => setLcHandle(e.target.value)} />
          <input className="border p-2 rounded w-full outline-none focus:border-blue-400" placeholder="AtCoder ID" value={acHandle} onChange={e => setAcHandle(e.target.value)} />
        </div>
      </div>

      {/* MIDDLE: Analysis Toggle */}
      <div className="flex gap-2">
        <button onClick={() => setAnalysisMode('combined')} className={`px-4 py-2 font-bold rounded ${analysisMode === 'combined' ? 'bg-slate-800 text-white' : 'bg-white border text-slate-500'}`}>Analyze Together</button>
        <button onClick={() => setAnalysisMode('cf')} className={`px-4 py-2 font-bold rounded ${analysisMode === 'cf' ? 'bg-blue-500 text-white' : 'bg-white border text-slate-500'}`}>Codeforces Only</button>
        <button onClick={() => setAnalysisMode('lc')} className={`px-4 py-2 font-bold rounded ${analysisMode === 'lc' ? 'bg-orange-400 text-white' : 'bg-white border text-slate-500'}`}>LeetCode Only</button>
        <button onClick={() => setAnalysisMode('ac')} className={`px-4 py-2 font-bold rounded ${analysisMode === 'ac' ? 'bg-green-500 text-white' : 'bg-white border text-slate-500'}`}>AtCoder Only</button>
      </div>

      {/* RENDER STATS BASED ON TOGGLE */}
      {analysisMode === 'combined' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-xl mb-4 text-slate-800">Combined Progress (All Platforms)</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-50 p-4 rounded-lg border">
              <p className="text-sm font-bold text-slate-500">Total Rating</p>
              <p className="text-3xl font-black">{cfData.rating + lcData.rating + acData.rating}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border">
              <p className="text-sm font-bold text-slate-500">Total Solved</p>
              <p className="text-3xl font-black">{cfData.solved + lcData.solved + acData.solved}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border">
              <p className="text-sm font-bold text-slate-500">Topics Completed / Remaining</p>
              <p className="text-3xl font-black text-blue-600">{totalCompletedTopics} <span className="text-slate-300">/</span> <span className="text-red-400">{TOTAL_EXPECTED_TOPICS - totalCompletedTopics}</span></p>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {platforms.filter(p => p.name.toLowerCase().includes(analysisMode.toLowerCase()) || analysisMode === 'combined').map((p, idx) => (
            <motion.div key={p.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className={`bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 ${p.borderStyle} p-5 col-span-3 md:col-span-1`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800">{p.name}</h3>
                <span className="text-sm text-slate-400 font-semibold">{p.handle}</span>
              </div>

              {/* Your exact original Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-slate-50 p-3 rounded-lg flex flex-col items-center justify-center border border-slate-100">
                  <span className="text-xs text-slate-400 font-semibold tracking-wider">RATING</span>
                  <span className={`text-2xl font-bold text-${p.color}-500`}>{p.rating}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg flex flex-col items-center justify-center border border-slate-100">
                  <span className="text-xs text-slate-400 font-semibold tracking-wider">SOLVED</span>
                  <span className="text-2xl font-bold text-slate-700">{p.solved}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 py-2 rounded-lg flex flex-col items-center justify-center border border-slate-100">
                  <span className="text-xs text-slate-400 font-semibold tracking-wider">GRAPHS</span>
                  <span className="text-lg font-bold text-slate-600">{p.graphs}</span>
                </div>
                <div className="bg-slate-50 py-2 rounded-lg flex flex-col items-center justify-center border border-slate-100">
                  <span className="text-xs text-slate-400 font-semibold tracking-wider">DP</span>
                  <span className="text-lg font-bold text-slate-600">{p.dp}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* DOWNSIDE: Recommendations */}
      <Recommendations analysisMode={analysisMode} />
    </div>
  );
}