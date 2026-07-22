import React from 'react';
import { Lightbulb, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Recommendations() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100"
    >
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="text-yellow-500" />
        <h2 className="text-xl font-bold text-slate-800">Smart Recommendations</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recommended Topics */}
        <div className="p-4 border border-blue-100 bg-blue-50/50 rounded-lg">
          <div className="flex items-center gap-2 mb-3 text-blue-700 font-semibold">
            <Target size={18} />
            <span>Topics to Practice</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded-full text-sm">Dynamic Programming</span>
            <span className="px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded-full text-sm">Graph Theory (DFS/BFS)</span>
            <span className="px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded-full text-sm">Prefix Sums</span>
          </div>
          <p className="text-xs text-slate-500 mt-3">Based on your recent LeetCode performance, you are struggling with DP optimizations.</p>
        </div>

        {/* Suggested Problems */}
        <div className="p-4 border border-green-100 bg-green-50/50 rounded-lg">
          <div className="flex items-center gap-2 mb-3 text-green-700 font-semibold">
            <TrendingUp size={18} />
            <span>Next Target Questions</span>
          </div>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex justify-between items-center bg-white p-2 rounded border border-green-100 cursor-pointer hover:bg-green-50 transition">
              <span>LC: Edit Distance (Hard)</span>
              <span className="text-xs font-bold text-green-600">+15 ELO</span>
            </li>
            <li className="flex justify-between items-center bg-white p-2 rounded border border-green-100 cursor-pointer hover:bg-green-50 transition">
              <span>CF: K-Tree (Rating 1500)</span>
              <span className="text-xs font-bold text-green-600">+20 Rating</span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}