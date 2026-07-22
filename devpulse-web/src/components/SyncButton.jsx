import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export default function SyncButton({ username, onSyncSuccess }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusText, setStatusText] = useState("Sync Data");

  const handleSync = async () => {
    if (!username) return;
    setIsSyncing(true);
    setStatusText("Fetching...");

    try {
      const response = await fetch('http://localhost:8080/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username })
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === "success") {
        setStatusText("Synced!");
        if (onSyncSuccess) onSyncSuccess(data); // Send data back to App.jsx
        setTimeout(() => setStatusText("Sync Data"), 2000);
      } else {
        setStatusText("Failed");
        setTimeout(() => setStatusText("Sync Data"), 2000);
      }
    } catch (error) {
      console.error("Sync error:", error);
      setStatusText("Server Offline");
      setTimeout(() => setStatusText("Sync Data"), 2000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <motion.button
      onClick={handleSync}
      disabled={isSyncing}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: isSyncing ? 'wait' : 'pointer', opacity: isSyncing ? 0.8 : 1, boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)' }}
    >
      <motion.div animate={{ rotate: isSyncing ? 360 : 0 }} transition={{ repeat: isSyncing ? Infinity : 0, duration: 1, ease: "linear" }}>
        <RefreshCw size={18} />
      </motion.div>
      {statusText}
    </motion.button>
  );
}