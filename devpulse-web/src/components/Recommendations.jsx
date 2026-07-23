import React from 'react';
import { Lightbulb, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Recommendations({ analysisMode }) {
  let targetTopic = "Dynamic Programming";
  let targetDesc = "Based on combined data across platforms, you are struggling with DP optimizations.";
  let recList = [
    { name: "LC: Edit Distance (Hard)", points: "+15 ELO" },
    { name: "CF: K-Tree (Rating 1500)", points: "+20 Rating" },
    { name: "CC: Coin Change (Med)", points: "+25 XP" }
  ];

  if (analysisMode === 'cf') {
    targetTopic = "Segment Trees & Ranges";
    targetDesc = "Codeforces heavily features range queries in Div2 C/D problems.";
    recList = [
      { name: "CF: Sereja and Brackets", points: "+25 Rating" },
      { name: "CF: Xenia and Bit Operations", points: "+15 Rating" }
    ];
  } else if (analysisMode === 'lc') {
    targetTopic = "Graph Theory (DFS/BFS)";
    targetDesc = "Your LeetCode times on graph traversals are slower than the platform average.";
    recList = [
      { name: "LC: Word Ladder (Hard)", points: "+20 ELO" },
      { name: "LC: Number of Islands (Med)", points: "+10 ELO" }
    ];
  } else if (analysisMode === 'ac') {
    targetTopic = "Combinatorics & Math";
    targetDesc = "AtCoder Beginner Contests require very strong Modulo Math logic.";
    recList = [
      { name: "AC: Knapsack 2 (DP)", points: "+30 Rating" },
      { name: "AC: Traveling Salesman", points: "+40 Rating" }
    ];
  } else if (analysisMode === 'cc') {
    targetTopic = "Greedy Algorithms";
    targetDesc = "CodeChef starters often utilize greedy paradigms for subtask optimizations.";
    recList = [
      { name: "CC: Maximize Colors", points: "+20 XP" },
      { name: "CC: Array Halves", points: "+15 XP" }
    ];
  }

  return (
    <motion.div 
      key={analysisMode} 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-yellow-100 p-2 rounded-xl text-yellow-600">
          <Lightbulb size={24} />
        </div>
        <h2 className="text-2xl font-black text-slate-800">Smart Recommendations</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recommended Topics */}
        <div className="p-6 border border-blue-100 bg-blue-50/50 rounded-2xl">
          <div className="flex items-center gap-2 mb-4 text-blue-700 font-bold text-lg">
            <Target size={20} />
            <span>Core Focus Areas</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-4 py-1.5 bg-white border border-blue-200 text-blue-700 rounded-full text-sm font-bold shadow-sm">{targetTopic}</span>
            {analysisMode === 'combined' && <span className="px-4 py-1.5 bg-white border border-blue-200 text-blue-700 rounded-full text-sm font-bold shadow-sm">Prefix Sums</span>}
          </div>
          <p className="text-sm text-slate-500 font-medium">{targetDesc}</p>
        </div>

        {/* Suggested Problems */}
        <div className="p-6 border border-emerald-100 bg-emerald-50/50 rounded-2xl">
          <div className="flex items-center gap-2 mb-4 text-emerald-700 font-bold text-lg">
            <TrendingUp size={20} />
            <span>Target Problem Sets</span>
          </div>
          <ul className="space-y-3 text-sm text-slate-700 font-medium">
            {recList.map((item, index) => (
              <li key={index} className="flex justify-between items-center bg-white p-3 rounded-xl border border-emerald-100 shadow-sm cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all">
                <span>{item.name}</span>
                <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">{item.points}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}