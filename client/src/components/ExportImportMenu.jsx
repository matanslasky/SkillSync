import { useState } from 'react';
import { Download, Upload, FileJson, FileText, Table } from 'lucide-react';
import {
  exportProject,
  exportToCSV,
  exportToMarkdown,
  importProject
} from '../services/exportImportService';
import { useAuth } from '../contexts/AuthContext';

const ExportImportMenu = ({ projectId, onImportSuccess }) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleExport = async (type) => {
    setLoading(true);
    setMessage(null);
    try {
      let result;
      switch (type) {
        case 'json':
          result = await exportProject(projectId);
          break;
        case 'csv':
          result = await exportToCSV(projectId);
          break;
        case 'markdown':
          result = await exportToMarkdown(projectId);
          break;
        default:
          throw new Error('Unknown export type');
      }
      
      setMessage({ type: 'success', text: `Exported as ${result.fileName}` });
      setTimeout(() => setShowMenu(false), 2000);
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ type: 'error', text: 'Export failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage(null);
    try {
      const result = await importProject(file, user.uid);
      setMessage({ 
        type: 'success', 
        text: `Imported! ${result.tasksImported} tasks added.` 
      });
      onImportSuccess && onImportSuccess(result.projectId);
      setTimeout(() => setShowMenu(false), 2000);
    } catch (error) {
      console.error('Import error:', error);
      setMessage({ type: 'error', text: error.message || 'Import failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        title="Export/Import"
      >
        <Download size={20} className="text-gray-400 hover:text-white" />
      </button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-12 w-64 bg-dark-light border border-gray-800 rounded-lg shadow-xl z-50 overflow-hidden">
            {/* Export Options */}
            <div className="p-2 border-b border-gray-800">
              <div className="text-xs text-gray-400 px-3 py-2 font-medium">Export As</div>
              <button
                onClick={() => handleExport('json')}
                disabled={loading}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors text-left"
              >
                <FileJson size={18} className="text-neon-blue" />
                <div>
                  <div className="text-sm text-white">JSON</div>
                  <div className="text-xs text-gray-400">Full project backup</div>
                </div>
              </button>
              <button
                onClick={() => handleExport('csv')}
                disabled={loading}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors text-left"
              >
                <Table size={18} className="text-neon-green" />
                <div>
                  <div className="text-sm text-white">CSV</div>
                  <div className="text-xs text-gray-400">Tasks spreadsheet</div>
                </div>
              </button>
              <button
                onClick={() => handleExport('markdown')}
                disabled={loading}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors text-left"
              >
                <FileText size={18} className="text-neon-pink" />
                <div>
                  <div className="text-sm text-white">Markdown</div>
                  <div className="text-xs text-gray-400">Documentation format</div>
                </div>
              </button>
            </div>

            {/* Import Option */}
            <div className="p-2">
              <div className="text-xs text-gray-400 px-3 py-2 font-medium">Import</div>
              <label className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
                <Upload size={18} className="text-yellow-500" />
                <div>
                  <div className="text-sm text-white">Import JSON</div>
                  <div className="text-xs text-gray-400">Restore from backup</div>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={loading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Status Message */}
            {message && (
              <div className={`px-4 py-3 text-sm border-t border-gray-800 ${
                message.type === 'success' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
              }`}>
                {message.text}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="px-4 py-3 text-sm text-center text-gray-400 border-t border-gray-800">
                Processing...
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ExportImportMenu;
