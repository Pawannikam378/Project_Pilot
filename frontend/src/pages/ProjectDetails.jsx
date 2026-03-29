import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/axios';
import { ArrowLeft, Play, Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Poll for status if processing
  useEffect(() => {
    let interval;
    if (report && (report.status === 'pending' || report.status === 'processing')) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/ai/task-status/${report.task_id}`);
          setReport(res.data);
          if (res.data.status === 'completed' || res.data.status === 'failed') {
            clearInterval(interval);
            setGenerating(false);
          }
        } catch (err) {
          clearInterval(interval);
          setGenerating(false);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [report?.status, report?.task_id]);

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await api.get('/projects');
        const proj = res.data.find(p => p.id === id);
        if (proj) {
          setProject(proj);
          if (proj.reports && proj.reports.length > 0) {
            setReport(proj.reports[0]);
          }
        }
      } catch (err) {
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [id]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await api.post(`/ai/generate-report/${id}`);
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start generation');
      setGenerating(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="animate-spin h-8 w-8 text-brand-500" />
    </div>
  );

  if (!project) return (
    <div className="text-center py-12">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Project not found</h3>
      <Link to="/projects" className="mt-4 inline-flex text-brand-600 hover:text-brand-500">Go back</Link>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link to="/projects" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to projects
      </Link>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Uploaded on {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div>
            {!report || report.status === 'failed' ? (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex w-full md:w-auto items-center justify-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                {generating ? (
                  <><Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> Analyzing...</>
                ) : (
                  <><Play className="-ml-1 mr-2 h-4 w-4" /> Generate AI Report</>
                )}
              </button>
            ) : report.status === 'completed' && report.ppt_url ? (
               <a
                href={import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api','') + report.ppt_url : `http://localhost:8000${report.ppt_url}`}
                target="_blank" rel="noreferrer"
                className="inline-flex w-full md:w-auto items-center justify-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-brand-700 bg-brand-100 hover:bg-brand-200 transition-colors"
                download
              >
                <Download className="-ml-1 mr-2 h-4 w-4" /> Download Presentation (PPTX)
              </a>
            )}
          </div>
        </div>

        {error && <div className="mt-4 p-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
      </div>

      <AnimatePresence>
        {report && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-6"
          >
            {/* Status Banner */}
            <div className={`rounded-xl p-4 flex items-center shadow-sm border ${
              report.status === 'completed' ? 'bg-green-50 border-green-100 text-green-800' :
              report.status === 'failed' ? 'bg-red-50 border-red-100 text-red-800' :
              'bg-blue-50 border-blue-100 text-blue-800'
            }`}>
              {report.status === 'completed' ? <CheckCircle2 className="h-5 w-5 mr-3" /> :
               report.status === 'failed' ? <AlertCircle className="h-5 w-5 mr-3" /> :
               <Loader2 className="h-5 w-5 mr-3 animate-spin" />}
              <span className="font-medium capitalize">
                {report.status === 'pending' || report.status === 'processing' 
                  ? 'AI agent is actively processing your document. This may take a minute...' 
                  : `Analysis ${report.status}`}
              </span>
            </div>

            {/* Content Results */}
            {report.status === 'completed' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                  {['Abstract', 'Introduction', 'Methodology', 'Results', 'Conclusion'].map((section) => (
                    report[section.toLowerCase()] && (
                      <div key={section} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{section}</h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed tabular-nums">
                          {report[section.toLowerCase()]}
                        </p>
                      </div>
                    )
                  ))}
                </div>

                {/* Sidebar Metrics */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Plagiarism Score</h3>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {report.plagiarism_score?.toFixed(1) || '0'}%
                      </span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Viva Questions</h3>
                    <ul className="space-y-3">
                      {report.viva_questions && JSON.parse(report.viva_questions).map((q, i) => (
                        <li key={i} className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium text-brand-500">Q{i+1}.</span> {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
