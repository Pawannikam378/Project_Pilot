import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { Upload, FileText, ChevronRight, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError(null);
    try {
      const res = await api.post('/projects/upload-project', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Navigate straight to the detail page on success
      navigate(`/projects/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload file');
      setUploading(false);
    }
  };

  const deleteProject = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Your Projects</h1>
        
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf,.docx,.pptx" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {uploading ? <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> : <Upload className="-ml-1 mr-2 h-4 w-4" />}
            {uploading ? 'Processing...' : 'Upload New Project'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-lg flex items-center justify-between">
          <p>{error}</p>
          <button onClick={() => setError(null)}><X className="h-5 w-5" /></button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-[72px] bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No projects</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by uploading a project file.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden">
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            <AnimatePresence>
              {projects.map((project) => (
                <motion.li
                  key={project.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Link to={`/projects/${project.id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center px-4 py-4 sm:px-6">
                      <div className="min-w-0 flex-1 flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                          <div>
                            <p className="text-sm font-medium text-brand-600 truncate">{project.title}</p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <span className="truncate">{new Date(project.created_at).toLocaleDateString()}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={(e) => deleteProject(project.id, e)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </div>
  );
}
