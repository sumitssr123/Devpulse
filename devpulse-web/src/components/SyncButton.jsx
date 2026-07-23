import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function SyncButton({ username, platform, onSyncSuccess }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusText, setStatusText] = useState("Sync Data");
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSync = async () => {
    if (!username) return;
    setIsSyncing(true);
    setStatusText("Fetching...");
    setErrorMsg(null);

    try {
      const response = await fetch('http://localhost:8080/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, platform: platform }) 
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === "success") {
        setStatusText("Synced Successfully!");
        if (onSyncSuccess) onSyncSuccess(data); 
        setTimeout(() => setStatusText("Sync Data"), 2000);
      } else {
        // Triggers the Red Alert if C++ returns an error
        setStatusText("Sync Failed");
        setErrorMsg(data.message || "Invalid Username or Data not found.");
        setTimeout(() => {
          setStatusText("Sync Data");
          setErrorMsg(null);
        }, 4000);
      }
    } catch (error) {
      console.error("Sync error:", error);
      setStatusText("Server Offline");
      setErrorMsg("Backend server is not running.");
      setTimeout(() => {
        setStatusText("Sync Data");
        setErrorMsg(null);
      }, 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="relative flex flex-col items-end">
      <motion.button
        onClick={handleSync}
        disabled={isSyncing}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center gap-2 px-6 py-3 text-white font-bold rounded-xl shadow-md transition-all ${
          statusText === "Sync Failed" || statusText === "Server Offline" 
            ? "bg-red-500 shadow-red-500/30" 
            : statusText === "Synced Successfully!" 
            ? "bg-emerald-500 shadow-emerald-500/30"
            : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30"
        }`}
      >
        <motion.div animate={{ rotate: isSyncing ? 360 : 0 }} transition={{ repeat: isSyncing ? Infinity : 0, duration: 1, ease: "linear" }}>
          <RefreshCw size={18} />
        </motion.div>
        {statusText}
      </motion.button>

      {/* FLOATING RED ALERT TOAST */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 10, x: 10 }} 
            animate={{ opacity: 1, y: 0, x: [0, -5, 5, -5, 5, 0] }} // Shake effect
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="absolute top-16 right-0 bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 text-sm font-bold whitespace-nowrap z-50"
          >
            <AlertCircle size={18} />
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}