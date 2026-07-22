import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function DashboardCards({ globalUsername }) {
  // Individual state for each card, falling back to the global username
  const [cfHandle, setCfHandle] = useState(globalUsername || '');
  const [lcHandle, setLcHandle] = useState(globalUsername || '');
  const [acHandle, setAcHandle] = useState(globalUsername || '');

  const handleIndividualSync = (platform, handle) => {
    console.log(`Syncing ${platform} for handle: ${handle}`);
    // Here you will call your C++ backend for the specific platform
  };

  const platforms = [
    { 
      name: 'Codeforces', 
      handle: cfHandle, 
      setHandle: setCfHandle,
      color: 'blue', 
      rating: 1456, solved: 50, graphs: 10, dp: 15,
      borderStyle: 'border-t-blue-500'
    },
    { 
      name: 'LeetCode', 
      handle: lcHandle, 
      setHandle: setLcHandle,
      color: 'orange', 
      rating: 1500, solved: 269, graphs: 15, dp: 20,
      borderStyle: 'border-t-orange-400'
    },
    { 
      name: 'AtCoder', 
      handle: acHandle, 
      setHandle: setAcHandle,
      color: 'green', 
      rating: 329, solved: 20, graphs: 2, dp: 5,
      borderStyle: 'border-t-green-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {platforms.map((p, idx) => (
        <motion.div 
          key={p.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 ${p.borderStyle} p-5`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-slate-800">{p.name}</h3>
          </div>

          {/* Individual Username Input */}
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={p.handle}
              onChange={(e) => p.setHandle(e.target.value)}
              placeholder="Username"
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-blue-400"
            />
            <button 
              onClick={() => handleIndividualSync(p.name, p.handle)}
              className="bg-slate-800 text-white px-3 py-1.5 rounded-md text-sm hover:bg-slate-700 transition"
            >
              Sync
            </button>
          </div>

          {/* Stats Grid */}
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
  );
}