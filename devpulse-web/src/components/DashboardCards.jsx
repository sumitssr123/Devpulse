import { motion } from 'framer-motion';
import { Code2, Braces, Terminal } from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } };
const cardVariants = { hidden: { y: 30, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 12 } } };

export default function DashboardCards({ platformData }) {
  if (!platformData) return null;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
      <PlatformCard title="Codeforces" color="#3b82f6" icon={<Terminal size={24} color="#3b82f6"/>} data={platformData.codeforces} />
      <PlatformCard title="LeetCode" color="#f59e0b" icon={<Code2 size={24} color="#f59e0b"/>} data={platformData.leetcode} />
      <PlatformCard title="AtCoder" color="#10b981" icon={<Braces size={24} color="#10b981"/>} data={platformData.atcoder} />
    </motion.div>
  );
}

function PlatformCard({ title, color, icon, data }) {
  return (
    <motion.div variants={cardVariants} whileHover={{ y: -8, boxShadow: "0px 12px 24px rgba(0,0,0,0.1)" }} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', borderTop: `4px solid ${color}`, boxShadow: '0px 4px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
        {icon}
        <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem' }}>{title}</h3>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#64748b' }}>Handle</span>
        <span style={{ fontWeight: 'bold', color: '#334155' }}>{data.handle}</span>
      </div>
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <StatBox label="Rating" value={data.rating} color={color} />
        <StatBox label="Solved" value={data.total_solved} color={color} />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <StatBox label="Graphs" value={data.graph_solved} color="#64748b" small />
        <StatBox label="DP" value={data.dp_solved} color="#64748b" small />
      </div>
    </motion.div>
  );
}

function StatBox({ label, value, color, small }) {
  return (
    <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: small ? '8px' : '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: small ? '1.1rem' : '1.5rem', fontWeight: 'bold', color: color }}>{value}</div>
    </div>
  );
}