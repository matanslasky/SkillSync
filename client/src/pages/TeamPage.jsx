import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { Search, Mail, Github, Linkedin, Trophy, TrendingUp, Calendar, Grid, List } from 'lucide-react'
import { mockUsers } from '../data/mockData'
import { getRoleIcon } from '../constants/roles'
import ProgressBar from '../components/ProgressBar'
import { getAllUsers, searchUsers } from '../services/userService'

const TeamPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [useMockData, setUseMockData] = useState(false)

  // Load team members from Firestore
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true)
        const filters = filterRole !== 'all' ? { role: filterRole } : {}
        const fetchedUsers = await getAllUsers(filters)
        
        // If no users exist, use mock data
        if (fetchedUsers.length === 0) {
          setMembers(mockUsers)
          setUseMockData(true)
        } else {
          setMembers(fetchedUsers)
          setUseMockData(false)
        }
      } catch (error) {
        console.error('Error loading team members:', error)
        // Fallback to mock data on error
        setMembers(mockUsers)
        setUseMockData(true)
      } finally {
        setLoading(false)
      }
    }
    
    loadMembers()
  }, [filterRole])

  // Search handler with debounce
  useEffect(() => {
    if (!searchTerm) return
    
    const timeoutId = setTimeout(async () => {
      if (useMockData) {
        // Search mock data
        const filtered = mockUsers.filter(member => {
          const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               member.role.toLowerCase().includes(searchTerm.toLowerCase())
          const matchesRole = filterRole === 'all' || member.role === filterRole
          return matchesSearch && matchesRole
        })
        setMembers(filtered)
      } else {
        try {
          const results = await searchUsers(searchTerm)
          const filtered = filterRole !== 'all' 
            ? results.filter(m => m.role === filterRole)
            : results
          setMembers(filtered)
        } catch (error) {
          console.error('Error searching users:', error)
        }
      }
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [searchTerm, filterRole, useMockData])

  const filteredMembers = members
  const roles = ['all', ...new Set(members.map(u => u.role))]

  return (
    <div className="flex h-screen bg-dark">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Team Directory</h2>
          <p className="text-gray-500">Connect with your team members across all projects</p>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search team members..."
              className="w-full bg-dark-lighter border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none transition-all"
          >
            {roles.map(role => (
              <option key={role} value={role}>
                {role === 'all' ? 'All Roles' : role}
              </option>
            ))}
          </select>
          
          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-dark-lighter border border-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-all ${
                viewMode === 'grid'
                  ? 'bg-neon-green text-dark'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-all ${
                viewMode === 'list'
                  ? 'bg-neon-green text-dark'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="List View"
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Trophy className="text-neon-green" />}
            label="Total Members"
            value={members.length.toString()}
          />
          <StatCard
            icon={<TrendingUp className="text-neon-blue" />}
            label="Avg Commitment"
            value={members.length > 0 ? Math.round(members.reduce((sum, u) => sum + (u.commitmentScore || 50), 0) / members.length) : 0}
          />
          <StatCard
            icon={<Calendar className="text-neon-pink" />}
            label="Online Now"
            value={members.filter(u => u.status === 'online').length.toString()}
          />
          <StatCard
            icon={<Trophy className="text-neon-purple" />}
            label="Active Projects"
            value="3"
          />
        </div>

        {/* Team Grid or List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-effect rounded-xl p-6 border border-gray-800 animate-pulse">
                <div className="h-6 bg-gray-800 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-800 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredMembers.map(member => (
              viewMode === 'grid' 
                ? <TeamMemberCard key={member.uid || member.id} member={member} />
                : <TeamMemberListItem key={member.uid || member.id} member={member} />
            ))}
          </div>
        )}

        {!loading && filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No team members found. Try adjusting your filters.</p>
            {useMockData && (
              <p className="text-gray-600 text-sm mt-2">Showing sample data - register real users to see them here!</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

const StatCard = ({ icon, label, value }) => (
  <div className="glass-effect rounded-xl p-4">
    <div className="flex items-center gap-3 mb-2">
      {icon}
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
)

const TeamMemberCard = ({ member }) => {
  const navigate = useNavigate()
  
  const handleMessage = () => {
    navigate('/messages', { state: { openChatWithUser: member } })
  }

  const handleGithub = () => {
    window.open('https://github.com', '_blank')
  }

  const handleLinkedIn = () => {
    window.open('https://linkedin.com', '_blank')
  }

  return (
    <div className="glass-effect rounded-xl p-6 border border-gray-800 hover:border-neon-green/30 transition-all flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-blue to-neon-green flex items-center justify-center text-2xl font-bold flex-shrink-0">
          {member.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
          <p className="text-sm text-gray-400 mb-2">
            {getRoleIcon(member.role)} {member.role}
          </p>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              member.status === 'online' ? 'bg-neon-green' :
              member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-600'
            }`}></span>
            <span className="text-xs text-gray-500 capitalize">{member.status}</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      {member.bio && (
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{member.bio}</p>
      )}

      {/* Skills */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">Skills</p>
        <div className="flex flex-wrap gap-1">
          {member.skills.slice(0, 4).map((skill, idx) => (
            <span key={idx} className="px-2 py-1 bg-dark-lighter text-xs text-gray-400 rounded border border-gray-800">
              {skill}
            </span>
          ))}
          {member.skills.length > 4 && (
            <span className="px-2 py-1 bg-dark-lighter text-xs text-gray-400 rounded border border-gray-800">
              +{member.skills.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Commitment Score */}
      <div className="mb-4 flex-1">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs text-gray-500">Commitment Score</p>
          <p className="text-sm font-bold text-neon-green">{member.commitmentScore}</p>
        </div>
        <ProgressBar progress={member.commitmentScore} color="green" />
      </div>

      {/* Actions - Always at bottom */}
      <div className="flex gap-2 mt-auto">
        <button 
          onClick={handleMessage}
          className="flex-1 flex items-center justify-center gap-2 bg-neon-green/10 text-neon-green border border-neon-green/30 py-2 rounded-lg hover:bg-neon-green/20 transition-all text-sm"
        >
          <Mail size={16} />
          Message
        </button>
        <button 
          onClick={handleGithub}
          className="p-2 bg-dark-lighter border border-gray-800 rounded-lg hover:border-neon-blue/30 transition-all"
        >
          <Github size={16} className="text-gray-400" />
        </button>
        <button 
          onClick={handleLinkedIn}
          className="p-2 bg-dark-lighter border border-gray-800 rounded-lg hover:border-neon-blue/30 transition-all"
        >
          <Linkedin size={16} className="text-gray-400" />
        </button>
      </div>
    </div>
  )
}

const TeamMemberListItem = ({ member }) => {
  const navigate = useNavigate()
  
  const handleMessage = () => {
    navigate('/messages', { state: { openChatWithUser: member } })
  }

  const handleGithub = () => {
    window.open('https://github.com', '_blank')
  }

  const handleLinkedIn = () => {
    window.open('https://linkedin.com', '_blank')
  }

  return (
    <div className="glass-effect rounded-xl p-6 border border-gray-800 hover:border-neon-green/30 transition-all">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-blue to-neon-green flex items-center justify-center text-2xl font-bold flex-shrink-0">
          {member.name.charAt(0)}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
              <p className="text-sm text-gray-400">
                {getRoleIcon(member.role)} {member.role}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                member.status === 'online' ? 'bg-neon-green' :
                member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-600'
              }`}></span>
              <span className="text-xs text-gray-500 capitalize">{member.status}</span>
            </div>
          </div>
          
          {/* Skills */}
          <div className="flex flex-wrap gap-1 mb-3">
            {member.skills.slice(0, 5).map((skill, idx) => (
              <span key={idx} className="px-2 py-1 bg-dark-lighter text-xs text-gray-400 rounded border border-gray-800">
                {skill}
              </span>
            ))}
            {member.skills.length > 5 && (
              <span className="px-2 py-1 bg-dark-lighter text-xs text-gray-400 rounded border border-gray-800">
                +{member.skills.length - 5}
              </span>
            )}
          </div>
          
          {/* Commitment Score */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-gray-500">Commitment Score</p>
                <p className="text-sm font-bold text-neon-green">{member.commitmentScore}%</p>
              </div>
              <ProgressBar progress={member.commitmentScore} color="green" />
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button 
            onClick={handleMessage}
            className="flex items-center gap-2 bg-neon-green/10 text-neon-green border border-neon-green/30 px-4 py-2 rounded-lg hover:bg-neon-green/20 transition-all text-sm font-medium"
          >
            <Mail size={16} />
            Message
          </button>
          <div className="flex gap-2">
            <button 
              onClick={handleGithub}
              className="p-2 bg-dark-lighter border border-gray-800 rounded-lg hover:border-neon-blue/30 transition-all"
            >
              <Github size={16} className="text-gray-400" />
            </button>
            <button 
              onClick={handleLinkedIn}
              className="p-2 bg-dark-lighter border border-gray-800 rounded-lg hover:border-neon-blue/30 transition-all"
            >
              <Linkedin size={16} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamPage
