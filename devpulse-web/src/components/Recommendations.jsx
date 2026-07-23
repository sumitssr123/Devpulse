import React from 'react';
import { Lightbulb, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Recommendations({ analysisMode }) {
  // Logic to swap recommendations based on the active tab
  let targetTopic = "Dynamic Programming";
  let targetDesc = "Based on combined data, you are struggling with DP optimizations.";
  let recList = [
    { name: "LC: Edit Distance (Hard)", points: "+15 ELO" },
    { name: "CF: K-Tree (Rating 1500)", points: "+20 Rating" }
  ];

  if (analysisMode === 'cf') {
    targetTopic = "Segment Trees & Ranges";
    targetDesc = "Codeforces heavily features range queries in Div2 C/D.";
    recList = [
      { name: "CF: Sereja and Brackets", points: "+25 Rating" },
      { name: "CF: Xenia and Bit Operations", points: "+15 Rating" }
    ];
  } else if (analysisMode === 'lc') {
    targetTopic = "Graph Theory (DFS/BFS)";
    targetDesc = "Your LeetCode times on graph traversals are slower than average.";
    recList = [
      { name: "LC: Word Ladder (Hard)", points: "+20 ELO" },
      { name: "LC: Number of Islands (Med)", points: "+10 ELO" }
    ];
  } else if (analysisMode === 'ac') {
    targetTopic = "Combinatorics & Math";
    targetDesc = "AtCoder Beginner Contests require strong Modulo Math logic.";
    recList = [
      { name: "AC: Knapsack 2 (DP)", points: "+30 Rating" },
      { name: "AC: Traveling Salesman", points: "+40 Rating" }
    ];
  }

  return (
    <motion.div 
      key={analysisMode} // Forces re-animation when mode changes
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100"
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
            <span className="px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded-full text-sm">{targetTopic}</span>
            <span className="px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded-full text-sm">Prefix Sums</span>
          </div>
          <p className="text-xs text-slate-500 mt-3">{targetDesc}</p>
        </div>

        {/* Suggested Problems */}
        <div className="p-4 border border-green-100 bg-green-50/50 rounded-lg">
          <div className="flex items-center gap-2 mb-3 text-green-700 font-semibold">
            <TrendingUp size={18} />
            <span>Next Target Questions</span>
          </div>
          <ul className="space-y-2 text-sm text-slate-700">
            {recList.map((item, index) => (
              <li key={index} className="flex justify-between items-center bg-white p-2 rounded border border-green-100 cursor-pointer hover:bg-green-50 transition">
                <span>{item.name}</span>
                <span className="text-xs font-bold text-green-600">{item.points}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}