import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { LayoutDashboard, FileText, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get('/dashboard/user-stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return <div className="space-y-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />)}
      </div>
    </div>;
  }

  const cards = [
    { name: 'Total Projects', value: stats?.projects_count || 0, icon: LayoutDashboard },
    { name: 'Reports Generated', value: stats?.reports_generated || 0, icon: FileText },
    { name: 'Current Tier', value: stats?.plan_status || 'Free', icon: Activity },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">Welcome back</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={card.name}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm"
          >
            <div className="flex items-center">
              <div className="p-3 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-lg">
                <card.icon className="h-6 w-6" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {card.name}
                </p>
                <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                  {card.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm text-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Ready to analyze another project?</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Upload your PDFs or Docs and let AI do the heavy lifting for summaries, insights, and structural reports.
        </p>
        <div className="mt-6">
          <a href="/projects" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors">
            Go to Projects
          </a>
        </div>
      </div>
    </div>
  );
}
