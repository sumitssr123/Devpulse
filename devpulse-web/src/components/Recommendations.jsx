import React, { useState, useEffect } from 'react';
import { Target, Sparkles, Loader2, Database } from 'lucide-react';
import { motion } from 'framer-motion';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 

export default function Recommendations({ analysisMode, statsData }) {
  const [aiAdvice, setAiAdvice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!statsData) return;
    generateAIAdvice();
  }, [analysisMode, statsData]);

  const generateAIAdvice = async () => {
    setIsLoading(true);
    try {
      // Safely parse recent problems (assuming backend sends them as an array of strings)
      const cfRecent = statsData?.codeforces?.recent_problems?.join(", ") || "No recent data";
      const lcRecent = statsData?.leetcode?.recent_problems?.join(", ") || "No recent data";
      const acRecent = statsData?.atcoder?.recent_problems?.join(", ") || "No recent data";

      const prompt = `Act as an elite systems and algorithms coach. 
      Mode: ${analysisMode}. 
      Codeforces: Rating ${statsData?.codeforces?.rating || 0}, Solved ${statsData?.codeforces?.total_solved || 0}. 
      Recent CF Problems: [${cfRecent}]
      
      LeetCode: Rating ${statsData?.leetcode?.rating || 0}, Solved ${statsData?.leetcode?.total_solved || 0}. 
      Recent LC Problems: [${lcRecent}]
      
      AtCoder: Rating ${statsData?.atcoder?.rating || 0}, Solved ${statsData?.atcoder?.total_solved || 0}.
      Recent AC Problems: [${acRecent}]
      
      Provide a highly analytical, 5 to 10 line personalized training strategy. 
      CRITICAL INSTRUCTIONS: 
      1. Give a completely UNIQUE response every time. Do not repeat previous advice.
      2. Analyze the exact topics of my RECENTLY SOLVED problems provided above.
      3. Focus your recommendations heavily on advanced computer science concepts, memory management, cache design, network protocols, or algorithm optimization.
      Do not use markdown formatting. Keep the tone professional, direct, and highly technical.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9, // Higher temp for unique answers
            maxOutputTokens: 300,
          }
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates.length > 0) {
        setAiAdvice(data.candidates[0].content.parts[0].text);
      } else {
        setAiAdvice("Focus on core algorithm optimization and memory systems to improve performance.");
      }
    } catch (error) {
      setAiAdvice("AI Engine offline. Ensure your API key is set correctly in the .env file.");
    }
    setIsLoading(false);
  };

  return (
    <motion.div 
      key={analysisMode} 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="mt-6 bg-[#0f172a] p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-700"
    >
      <div className="flex items-center justify-between mb-8 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-500/20 p-3 rounded-2xl text-indigo-400">
            <Sparkles size={28} />
          </div>
          <h2 className="text-2xl font-black text-slate-100">AI Deep Analysis</h2>
        </div>
        <button 
          onClick={generateAIAdvice} 
          disabled={isLoading}
          className="text-sm font-bold text-white bg-indigo-600 px-5 py-2.5 rounded-xl hover:bg-indigo-500 flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Database size={18} />}
          Fetch Deep Strategy
        </button>
      </div>

      <div className="p-6 sm:p-8 bg-slate-800/50 rounded-2xl border border-slate-700 relative overflow-hidden">
        {/* Left highlight bar */}
        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
        
        <div className="flex items-center gap-3 mb-4 text-indigo-300 font-bold text-lg uppercase tracking-wide">
          <Target size={22} /> Strategic Focus
        </div>
        
        {isLoading ? (
          <div className="flex items-center gap-3 text-slate-400 font-medium animate-pulse mt-6">
            <Loader2 size={24} className="animate-spin text-indigo-400" /> 
            <span>Extracting memory patterns from recent 30 problem submissions...</span>
          </div>
        ) : (
          <p className="text-[15px] sm:text-[16px] text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
            {aiAdvice || "Sync data to generate personalized algorithmic recommendations."}
          </p>
        )}
      </div>
    </motion.div>
  );
}