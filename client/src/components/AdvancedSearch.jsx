import { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, User, Tag, AlertCircle } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * AdvancedSearch Component
 * Provides multi-field search with filters for projects, tasks, and users
 */
const AdvancedSearch = ({ onClose, onResultSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all'); // all, projects, tasks, users
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignee: '',
    dateRange: ''
  });
  const [results, setResults] = useState({
    projects: [],
    tasks: [],
    users: []
  });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      performSearch();
    } else {
      setResults({ projects: [], tasks: [], users: [] });
    }
  }, [searchTerm, searchType, filters]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchResults = { projects: [], tasks: [], users: [] };

      // Search Projects
      if (searchType === 'all' || searchType === 'projects') {
        const projectsRef = collection(db, 'projects');
        const projectsSnapshot = await getDocs(projectsRef);
        
        searchResults.projects = projectsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(project => {
            const matchesSearch = 
              project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              project.description?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = !filters.status || project.status === filters.status;
            
            return matchesSearch && matchesStatus;
          })
          .slice(0, 10);
      }

      // Search Tasks
      if (searchType === 'all' || searchType === 'tasks') {
        const tasksRef = collection(db, 'tasks');
        const tasksSnapshot = await getDocs(tasksRef);
        
        searchResults.tasks = tasksSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(task => {
            const matchesSearch = 
              task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              task.description?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = !filters.status || task.status === filters.status;
            const matchesPriority = !filters.priority || task.priority === filters.priority;
            const matchesAssignee = !filters.assignee || task.assignedTo === filters.assignee;
            
            return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
          })
          .slice(0, 15);
      }

      // Search Users
      if (searchType === 'all' || searchType === 'users') {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        
        searchResults.users = usersSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => {
            const matchesSearch = 
              user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.role?.toLowerCase().includes(searchTerm.toLowerCase());
            
            return matchesSearch;
          })
          .slice(0, 10);
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      assignee: '',
      dateRange: ''
    });
  };

  const getTotalResults = () => {
    return results.projects.length + results.tasks.length + results.users.length;
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      'Active': 'bg-green-500/20 text-green-400',
      'todo': 'bg-gray-500/20 text-gray-400',
      'in-progress': 'bg-blue-500/20 text-blue-400',
      'in-review': 'bg-yellow-500/20 text-yellow-400',
      'done': 'bg-green-500/20 text-green-400',
      'Completed': 'bg-green-500/20 text-green-400',
      'On Hold': 'bg-orange-500/20 text-orange-400'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[status] || 'bg-gray-500/20 text-gray-400'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-4xl bg-dark-light border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Search Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search projects, tasks, or users..."
                className="w-full pl-12 pr-4 py-3 bg-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-green transition-colors"
                autoFocus
              />
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Search Type Tabs */}
          <div className="flex gap-2 mb-4">
            {['all', 'projects', 'tasks', 'users'].map(type => (
              <button
                key={type}
                onClick={() => setSearchType(type)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  searchType === type
                    ? 'bg-neon-green text-dark font-medium'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Filter size={16} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-dark border border-gray-800 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 bg-dark-light border border-gray-700 rounded-lg text-white focus:outline-none focus:border-neon-green"
                  >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="in-review">In Review</option>
                    <option value="done">Done</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="w-full px-3 py-2 bg-dark-light border border-gray-700 rounded-lg text-white focus:outline-none focus:border-neon-green"
                  >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="w-full px-3 py-2 bg-dark-light border border-gray-700 rounded-lg text-white focus:outline-none focus:border-neon-green"
                  >
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-400">
              Searching...
            </div>
          ) : searchTerm.length < 2 ? (
            <div className="text-center py-8 text-gray-400">
              <Search size={48} className="mx-auto mb-3 opacity-20" />
              <p>Type at least 2 characters to search</p>
            </div>
          ) : getTotalResults() === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <AlertCircle size={48} className="mx-auto mb-3 opacity-20" />
              <p>No results found for "{searchTerm}"</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Projects */}
              {results.projects.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Projects ({results.projects.length})
                  </h3>
                  <div className="space-y-2">
                    {results.projects.map(project => (
                      <button
                        key={project.id}
                        onClick={() => onResultSelect && onResultSelect('project', project.id)}
                        className="w-full p-4 bg-dark hover:bg-dark-lighter border border-gray-800 rounded-lg transition-all text-left"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-white font-medium mb-1">
                              {project.name || project.title}
                            </h4>
                            <p className="text-sm text-gray-400 line-clamp-2">
                              {project.description}
                            </p>
                          </div>
                          <StatusBadge status={project.status} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {results.tasks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Tasks ({results.tasks.length})
                  </h3>
                  <div className="space-y-2">
                    {results.tasks.map(task => (
                      <button
                        key={task.id}
                        onClick={() => onResultSelect && onResultSelect('task', task.id)}
                        className="w-full p-4 bg-dark hover:bg-dark-lighter border border-gray-800 rounded-lg transition-all text-left"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-white font-medium mb-1">
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-sm text-gray-400 line-clamp-1">
                                {task.description}
                              </p>
                            )}
                            <div className="flex gap-3 mt-2 text-xs text-gray-500">
                              {task.assignedToName && (
                                <span className="flex items-center gap-1">
                                  <User size={12} />
                                  {task.assignedToName}
                                </span>
                              )}
                              {task.priority && (
                                <span className="flex items-center gap-1">
                                  <Tag size={12} />
                                  {task.priority}
                                </span>
                              )}
                            </div>
                          </div>
                          <StatusBadge status={task.status} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {results.users.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Users ({results.users.length})
                  </h3>
                  <div className="space-y-2">
                    {results.users.map(user => (
                      <button
                        key={user.id}
                        onClick={() => onResultSelect && onResultSelect('user', user.id)}
                        className="w-full p-4 bg-dark hover:bg-dark-lighter border border-gray-800 rounded-lg transition-all text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-blue to-neon-pink flex items-center justify-center text-lg font-bold">
                            {(user.name || user.displayName || user.email)?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium">
                              {user.name || user.displayName}
                            </h4>
                            <p className="text-sm text-gray-400">{user.email}</p>
                            {user.role && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-neon-blue/20 text-neon-blue text-xs rounded">
                                {user.role}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        {getTotalResults() > 0 && (
          <div className="px-6 py-3 border-t border-gray-800 bg-dark-light">
            <p className="text-sm text-gray-400">
              Found {getTotalResults()} result{getTotalResults() !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;
