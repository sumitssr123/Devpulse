import React, { useState, useEffect } from 'react';
import { Lightbulb, Target, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Fetching the API Key securely from the .env file
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 

export default function Recommendations({ analysisMode, statsData }) {
  const [aiAdvice, setAiAdvice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Prevent AI call if there is no data to analyze yet
    if (!statsData) return;
    generateAIAdvice();
  }, [analysisMode, statsData]);

  const generateAIAdvice = async () => {
    setIsLoading(true);
    try {
      // Prompt tailored to focus on algorithm optimization, memory management, and theoretical foundations
      const prompt = `Act as an expert computer science and competitive programming coach. My current status is: 
      Mode: ${analysisMode}. 
      Codeforces Rating: ${statsData?.codeforces?.rating || 0}, Solved: ${statsData?.codeforces?.total_solved || 0}. 
      LeetCode Rating: ${statsData?.leetcode?.rating || 0}, Solved: ${statsData?.leetcode?.total_solved || 0}. 
      AtCoder Rating: ${statsData?.atcoder?.rating || 0}, Solved: ${statsData?.atcoder?.total_solved || 0}.
      
      Give me a highly analytical 3-sentence training strategy. Focus heavily on advanced computer science concepts, algorithm optimization, and theoretical foundations (like memory management or cache design when writing C++ code). Keep it professional and direct. Do not use markdown formatting in the response.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates.length > 0) {
        setAiAdvice(data.candidates[0].content.parts[0].text);
      } else {
        setAiAdvice("Focus on core algorithm optimization and theoretical foundations to improve performance.");
      }
    } catch (error) {
      setAiAdvice("AI Engine offline. Ensure your API key is set correctly in the .env file and you have internet access.");
    }
    setIsLoading(false);
  };

  return (
    <motion.div key={analysisMode} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-3 rounded-2xl text-purple-600">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-black text-slate-800">DevPulse AI Engine</h2>
        </div>
        <button 
          onClick={generateAIAdvice} 
          disabled={isLoading}
          className="text-sm font-bold text-purple-600 bg-purple-50 px-4 py-2 rounded-lg hover:bg-purple-100 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Lightbulb size={16} />}
          Refresh AI Strategy
        </button>
      </div>

      <div className="p-8 border border-purple-100 bg-gradient-to-br from-purple-50/50 to-white rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-purple-400"></div>
        <div className="flex items-center gap-2 mb-4 text-purple-800 font-black text-lg">
          <Target size={20} /> Deep Analysis & Focus
        </div>
        
        {isLoading ? (
          <div className="flex items-center gap-3 text-slate-400 font-medium animate-pulse">
            <Loader2 size={20} className="animate-spin" /> Analyzing your metrics and theoretical foundation...
          </div>
        ) : (
          <p className="text-[15px] text-slate-700 font-medium leading-relaxed">
            {aiAdvice || "Sync data to generate personalized algorithmic recommendations."}
          </p>
        )}
      </div>
    </motion.div>
  );
}