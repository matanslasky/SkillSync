import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import NotificationBell from '../components/NotificationBell'
import { Search, Plus, Users, Calendar, TrendingUp, Sparkles, SlidersHorizontal } from 'lucide-react'
import { mockProjects, calculateDaysRemaining } from '../data/mockData'
import { ROLE_LIST } from '../constants/roles'
import { getProjects, searchProjects } from '../services/projectService'
import { findProjectsForUser } from '../services/firestoreService'
import { ProjectCardSkeleton, EmptyProjects, EmptySearch } from '../components/LoadingSkeletons'
import { useAuth } from '../contexts/AuthContext'

const Marketplace = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recent') // recent, trending, deadline, name
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [projects, setProjects] = useState([])
  const [recommendedProjects, setRecommendedProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [useMockData, setUseMockData] = useState(false)

  const categories = ['All', 'Social Impact', 'EdTech', 'E-commerce', 'FinTech', 'HealthTech']

  // Load projects from Firestore
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true)
        const filters = selectedCategory !== 'all' ? { category: selectedCategory } : {}
        const fetchedProjects = await getProjects(filters)
        
        // If no projects exist, use mock data
        if (fetchedProjects.length === 0) {
          setProjects(mockProjects)
          setUseMockData(true)
        } else {
          setProjects(fetchedProjects)
          setUseMockData(false)
        }
        
        // Load skill-based recommendations
        if (user?.skills && user.skills.length > 0) {
          const recommended = await findProjectsForUser(user.skills)
          setRecommendedProjects(recommended.slice(0, 3)) // Top 3 matches
        }
      } catch (error) {
        console.error('Error loading projects:', error)
        // Fallback to mock data on error
        setProjects(mockProjects)
        setUseMockData(true)
      } finally {
        setLoading(false)
      }
    }
    
    loadProjects()
  }, [selectedCategory, user])

  // Search handler with debounce
  useEffect(() => {
    if (!searchTerm) return
    
    const timeoutId = setTimeout(async () => {
      if (useMockData) {
        // Search mock data
        const filtered = mockProjects.filter(project => {
          const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               project.description.toLowerCase().includes(searchTerm.toLowerCase())
          const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory
          return matchesSearch && matchesCategory
        })
        setProjects(filtered)
      } else {
        try {
          const results = await searchProjects(searchTerm)
          const filtered = selectedCategory !== 'all' 
            ? results.filter(p => p.category === selectedCategory)
            : results
          setProjects(filtered)
        } catch (error) {
          console.error('Error searching projects:', error)
        }
      }
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCategory, useMockData])

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'trending':
        return (b.team?.length || 0) - (a.team?.length || 0)
      case 'deadline':
        return new Date(a.deadline) - new Date(b.deadline)
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  const filteredProjects = projects

  return (
    <div className="flex h-screen bg-dark">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Project Marketplace</h2>
              <p className="text-gray-500">Discover exciting student-led projects or create your own</p>
            </div>
            <div className="flex items-center gap-4">
              {/* NotificationBell temporarily disabled - Create Firestore indexes first */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-neon-green text-dark font-semibold rounded-lg hover:shadow-neon-green transition-all"
              >
                <Plus size={20} />
                Create Project
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search projects..."
                className="w-full bg-dark-lighter border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all"
            >
              {categories.map(cat => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border rounded-lg transition-all flex items-center gap-2 ${
                showFilters 
                  ? 'bg-neon-blue/20 border-neon-blue text-neon-blue' 
                  : 'bg-dark-lighter border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <SlidersHorizontal size={18} />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="glass-effect rounded-xl p-4 border border-gray-800 mb-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-400">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-dark-lighter border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-neon-green focus:outline-none"
                >
                  <option value="recent">Recently Created</option>
                  <option value="trending">Most Popular</option>
                  <option value="deadline">Deadline (Soonest)</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Recommended Projects Section */}
        {recommendedProjects.length > 0 && !searchTerm && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-neon-green" size={24} />
              <h3 className="text-xl font-bold">Recommended for You</h3>
              <span className="text-xs text-gray-500 ml-2">Based on your skills</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedProjects.map(project => (
                <ProjectCard key={project.id} project={project} isRecommended={true} />
              ))}
            </div>
          </div>
        )}

        {/* All Projects Section */}
        <div className="mb-4">
          <h3 className="text-xl font-bold">{searchTerm ? 'Search Results' : 'All Projects'}</h3>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))
          ) : (
            sortedProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </div>

        {!loading && sortedProjects.length === 0 && (
          searchTerm ? (
            <EmptySearch searchTerm={searchTerm} />
          ) : (
            <EmptyProjects onCreateProject={() => setShowCreateModal(true)} />
          )
        )}

        {/* Create Project Modal */}
        {showCreateModal && (
          <CreateProjectModal 
            onClose={() => setShowCreateModal(false)} 
            onProjectCreated={(newProject) => {
              setProjects([newProject, ...projects])
              setUseMockData(false)
              setShowCreateModal(false)
            }}
          />
        )}
      </main>
    </div>
  )
}

const ProjectCard = ({ project, isRecommended = false }) => {
  const daysRemaining = calculateDaysRemaining(project.deadline)
  
  return (
    <div className={`glass-effect rounded-xl p-6 border transition-all cursor-pointer flex flex-col h-full ${
      isRecommended 
        ? 'border-neon-green/50 bg-neon-green/5 hover:border-neon-green' 
        : 'border-gray-800 hover:border-neon-green/30'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex-1">{project.name}</h3>
        <div className="flex flex-col gap-2 items-end">
          <span className="px-3 py-1 bg-neon-blue/20 text-neon-blue text-xs font-semibold rounded-full border border-neon-blue/30 flex items-center justify-center">
            {project.category}
          </span>
          {isRecommended && (
            <span className="px-2 py-1 bg-neon-green/20 text-neon-green text-xs font-semibold rounded-full border border-neon-green/30 flex items-center gap-1">
              <Sparkles size={12} />
              Match
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{project.description}</p>

      <div className="space-y-3 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <Users size={16} className="text-gray-500" />
          <span className="text-gray-400">{project.team.length} members</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={16} className="text-gray-500" />
          <span className="text-gray-400">{daysRemaining} days remaining</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp size={16} className="text-gray-500" />
          <span className="text-gray-400">{project.progress}% complete</span>
        </div>
      </div>

      <button className="w-full mt-4 bg-dark-lighter border border-neon-green/30 text-neon-green font-semibold py-2 rounded-lg hover:bg-neon-green/10 transition-all">
        View Details
      </button>
    </div>
  )
}

const CreateProjectModal = ({ onClose, onProjectCreated }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Social Impact',
    rolesNeeded: []
  })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCreating(true)

    try {
      const { createProject } = await import('../services/projectService')
      
      const projectData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        lookingFor: formData.rolesNeeded,
        creatorId: user?.uid || 'unknown',
        creatorName: user?.name || 'Anonymous',
        teamMembers: [user?.uid || 'unknown'],
        team: [{
          id: user?.uid || 'unknown',
          name: user?.name || 'Anonymous',
          role: user?.role || 'Creator'
        }],
        progress: 0,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
        status: 'active'
      }

      const newProject = await createProject(projectData)
      
      if (onProjectCreated) {
        onProjectCreated(newProject)
      }
    } catch (error) {
      console.error('Error creating project:', error)
      setError('Failed to create project. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
        <h3 className="text-2xl font-bold mb-6">Create New Project</h3>

        {error && (
          <div className="mb-4 p-3 bg-neon-pink/10 border border-neon-pink/30 rounded-lg text-neon-pink text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none"
              placeholder="e.g., EcoTrack - Carbon Footprint App"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none"
              placeholder="Describe your project idea..."
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none"
            >
              <option>Social Impact</option>
              <option>EdTech</option>
              <option>E-commerce</option>
              <option>FinTech</option>
              <option>HealthTech</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Roles Needed
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_LIST.map(role => (
                <label key={role.value} className="flex items-center gap-2 p-3 bg-dark-lighter rounded-lg cursor-pointer hover:bg-dark-light transition-all">
                  <input
                    type="checkbox"
                    checked={formData.rolesNeeded.includes(role.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, rolesNeeded: [...formData.rolesNeeded, role.value] })
                      } else {
                        setFormData({ ...formData, rolesNeeded: formData.rolesNeeded.filter(r => r !== role.value) })
                      }
                    }}
                    className="accent-neon-green"
                  />
                  <span className="text-sm">{role.icon} {role.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="flex-1 bg-dark-lighter border border-gray-800 text-white font-semibold py-3 rounded-lg hover:bg-dark-light transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 bg-neon-green text-dark font-semibold py-3 rounded-lg hover:shadow-neon-green transition-all disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Marketplace
