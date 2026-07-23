import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, BarChart2, Activity } from 'lucide-react';
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
      });
  }, [globalUsername]);

  const updateHandles = async () => {
    await fetch(`http://localhost:8080/api/user/${globalUsername}/handles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cf_handle: cfHandle || 'None', lc_handle: lcHandle || 'None', ac_handle: acHandle || 'None' })
    });
  };

  const handleSyncSuccess = (data) => setStatsData(data.platforms);

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
    { id: 'cf', name: 'Codeforces', handle: cfHandle, setHandle: setCfHandle, placeholder: "Update Codeforces ID", ...cfData },
    { id: 'lc', name: 'LeetCode', handle: lcHandle, setHandle: setLcHandle, placeholder: "Update LeetCode ID", ...lcData },
    { id: 'ac', name: 'AtCoder', handle: acHandle, setHandle: setAcHandle, placeholder: "Update AtCoder ID", ...acData }
  ];

  const totalCompletedTopics = (cfData.graphs + cfData.dp) + (lcData.graphs + lcData.dp) + (acData.graphs + acData.dp);
  const TOTAL_EXPECTED_TOPICS = 100;
  const activePlatform = platforms.find(p => p.id === activeTab);

  return (
    <div className="flex flex-col gap-8">
      
      {/* HEADER: Dynamic based on active tab */}
      <div className="flex justify-between items-end border-b-2 border-slate-200 pb-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 flex items-center gap-3">
            <BarChart2 size={36} className="text-blue-600" />
            {activeTab === 'combined' ? "Combined Progress Overview" : `${activePlatform.name} Analysis`}
          </h2>
          <p className="text-slate-500 mt-2 text-lg">
            {activeTab === 'combined' 
              ? "Aggregated data across all connected platforms." 
              : `Deep dive into your ${activePlatform.name} performance metrics.`}
          </p>
        </div>
      </div>

      {/* ISOLATED PLATFORM SETTINGS */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
            <Settings size={22} className="text-slate-400"/> 
            {activeTab === 'combined' ? "Global Platform IDs" : `${activePlatform.name} Configuration`}
          </h3>
          <div onClick={updateHandles}>
            <SyncButton username={globalUsername} onSyncSuccess={handleSyncSuccess} />
          </div>
        </div>
        
        {/* Dynamic Inputs: Show all if combined, show only specific if isolated */}
        <div className={`grid grid-cols-1 ${activeTab === 'combined' ? 'md:grid-cols-3' : 'md:grid-cols-1'} gap-4`}>
          {activeTab === 'combined' ? (
            platforms.map(p => (
              <input key={p.id} className="bg-slate-50 border-2 border-slate-200 p-4 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition font-medium" placeholder={p.placeholder} value={p.handle} onChange={e => p.setHandle(e.target.value)} />
            ))
          ) : (
            <input className="bg-slate-50 border-2 border-slate-200 p-4 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition font-medium w-full max-w-md" placeholder={activePlatform.placeholder} value={activePlatform.handle} onChange={e => activePlatform.setHandle(e.target.value)} />
          )}
        </div>
      </div>

      {/* RENDER STATS */}
      {activeTab === 'combined' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-slate-50 p-8 rounded-2xl border-2 border-slate-100">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Rating</p>
              <p className="text-5xl font-black text-slate-800 mt-4">{cfData.rating + lcData.rating + acData.rating}</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-2xl border-2 border-slate-100">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Solved</p>
              <p className="text-5xl font-black text-slate-800 mt-4">{cfData.solved + lcData.solved + acData.solved}</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-2xl border-2 border-slate-100">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Mastery Progress</p>
              <p className="text-5xl font-black text-blue-600 mt-4">{totalCompletedTopics} <span className="text-slate-300 text-4xl">/</span> <span className="text-slate-400 text-3xl">{TOTAL_EXPECTED_TOPICS}</span></p>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full">
          <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-t-8 ${activePlatform.borderStyle} p-8 w-full`}>
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
              <h3 className="font-black text-3xl text-slate-800">{activePlatform.name} Stats</h3>
              <span className="text-lg text-slate-600 font-bold bg-slate-100 px-6 py-2 rounded-full border border-slate-200">
                {activePlatform.handle || 'No Handle Set'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center justify-center border-2 border-slate-100 md:col-span-2">
                <span className="text-sm text-slate-500 font-bold tracking-widest mb-2">CURRENT RATING</span>
                <span className={`text-6xl font-black text-${activePlatform.color}-500`}>{activePlatform.rating}</span>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center justify-center border-2 border-slate-100 md:col-span-2">
                <span className="text-sm text-slate-500 font-bold tracking-widest mb-2">PROBLEMS SOLVED</span>
                <span className="text-6xl font-black text-slate-800">{activePlatform.solved}</span>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center justify-center border-2 border-slate-100 md:col-span-2 mt-2">
                <span className="text-sm text-slate-500 font-bold tracking-widest mb-2">GRAPH THEORY</span>
                <span className="text-3xl font-black text-slate-700">{activePlatform.graphs}</span>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center justify-center border-2 border-slate-100 md:col-span-2 mt-2">
                <span className="text-sm text-slate-500 font-bold tracking-widest mb-2">DYNAMIC PROGRAMMING</span>
                <span className="text-3xl font-black text-slate-700">{activePlatform.dp}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOWNSIDE: Recommendations */}
      <Recommendations analysisMode={activeTab} />
    </div>
  );
}