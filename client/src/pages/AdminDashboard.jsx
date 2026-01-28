import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Activity,
  Search,
  Shield,
  Ban,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Calendar,
  BarChart3,
  UserX,
  UserCheck,
  Settings
} from 'lucide-react'
import { 
  getAllUsers, 
  getSystemStats, 
  updateUserStatus, 
  updateUserRole,
  bulkUpdateUserStatus,
  getUserActivity
} from '../services/adminService'
import { getProjects } from '../services/firestoreService'

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [systemStats, setSystemStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [showUserDetails, setShowUserDetails] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [usersData, projectsData, statsData] = await Promise.all([
        getAllUsers(),
        getProjects(),
        getSystemStats()
      ])
      setUsers(usersData)
      setProjects(projectsData)
      setSystemStats(statsData)
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const stats = systemStats || {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    avgCommitment: users.length > 0 
      ? Math.round(users.reduce((sum, u) => sum + (u.commitmentScore || 50), 0) / users.length)
      : 0,
    recentSignups: users.filter(u => {
      if (!u.createdAt) return false
      const created = u.createdAt.toDate ? u.createdAt.toDate() : new Date(u.createdAt)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return created > weekAgo
    }).length
  }

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredProjects = projects.filter(project =>
    project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleUpdateUserStatus = async (userId, status) => {
    try {
      await updateUserStatus(userId, status)
      await loadData() // Reload data
      alert(`User status updated to ${status}`)
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('Failed to update user status')
    }
  }

  const handleUpdateUserRole = async (userId, role) => {
    try {
      await updateUserRole(userId, role)
      await loadData() // Reload data
      alert(`User role updated to ${role}`)
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Failed to update user role')
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      alert('Please select users first')
      return
    }
    
    if (!confirm(`Are you sure you want to ${action} ${selectedUsers.length} user(s)?`)) {
      return
    }
    
    try {
      await bulkUpdateUserStatus(selectedUsers, action)
      setSelectedUsers([])
      await loadData()
      alert(`Successfully ${action}ed ${selectedUsers.length} user(s)`)
    } catch (error) {
      console.error('Error performing bulk action:', error)
      alert('Failed to perform bulk action')
    }
  }

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  return (
    <div className="flex h-screen bg-dark">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-neon-pink" size={32} />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-gray-400">Manage users, projects, and monitor platform activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="text-neon-blue" />}
            label="Total Users"
            value={stats.totalUsers}
            subtext={`${stats.recentSignups} new this week`}
            trend="up"
          />
          <StatCard
            icon={<Activity className="text-neon-green" />}
            label="Active Users"
            value={stats.activeUsers}
            subtext={`${Math.round((stats.activeUsers / stats.totalUsers) * 100 || 0)}% of total`}
          />
          <StatCard
            icon={<Briefcase className="text-neon-purple" />}
            label="Total Projects"
            value={stats.totalProjects}
            subtext={`${stats.activeProjects} active`}
          />
          <StatCard
            icon={<TrendingUp className="text-neon-pink" />}
            label="Avg Commitment"
            value={`${stats.avgCommitment}%`}
            subtext="Platform average"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={<BarChart3 size={16} />}
            label="Overview"
          />
          <TabButton
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
            icon={<Users size={16} />}
            label="Users"
          />
          <TabButton
            active={activeTab === 'projects'}
            onClick={() => setActiveTab('projects')}
            icon={<Briefcase size={16} />}
            label="Projects"
          />
        </div>

        {/* Search Bar */}
        {(activeTab === 'users' || activeTab === 'projects') && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-dark-light border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue"
              />
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab users={users} projects={projects} stats={stats} />}
            {activeTab === 'users' && (
              <UsersTab 
                users={filteredUsers} 
                selectedUsers={selectedUsers}
                onToggleUser={toggleUserSelection}
                onUpdateStatus={handleUpdateUserStatus}
                onUpdateRole={handleUpdateUserRole}
                onBulkAction={handleBulkAction}
              />
            )}
            {activeTab === 'projects' && <ProjectsTab projects={filteredProjects} />}
          </>
        )}
      </main>
    </div>
  )
}

const StatCard = ({ icon, label, value, subtext, trend }) => (
  <div className="glass-effect rounded-xl p-6 border border-gray-800">
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 rounded-lg bg-dark-lighter flex items-center justify-center">
        {icon}
      </div>
      {trend && (
        <span className={`text-xs px-2 py-1 rounded ${trend === 'up' ? 'bg-neon-green/20 text-neon-green' : 'bg-neon-pink/20 text-neon-pink'}`}>
          {trend === 'up' ? '↑' : '↓'}
        </span>
      )}
    </div>
    <div className="text-3xl font-bold mb-1">{value}</div>
    <div className="text-sm text-gray-500">{label}</div>
    {subtext && <div className="text-xs text-gray-600 mt-2">{subtext}</div>}
  </div>
)

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
      active
        ? 'text-neon-green border-b-2 border-neon-green'
        : 'text-gray-500 hover:text-gray-300'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
)

const OverviewTab = ({ users, projects, stats }) => {
  const roleDistribution = {}
  users.forEach(user => {
    const role = user.role || 'Unknown'
    roleDistribution[role] = (roleDistribution[role] || 0) + 1
  })

  const categoryDistribution = {}
  projects.forEach(project => {
    const category = project.category || 'Unknown'
    categoryDistribution[category] = (categoryDistribution[category] || 0) + 1
  })

  return (
    <div className="space-y-6">
      {/* Activity Feed */}
      <div className="glass-effect rounded-xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Activity className="text-neon-green" size={20} />
          Platform Activity
        </h3>
        <div className="space-y-3">
          <ActivityItem
            icon="👤"
            text={`${stats.totalUsers} users registered`}
            time="Total"
          />
          <ActivityItem
            icon="📁"
            text={`${stats.totalProjects} projects created`}
            time="Total"
          />
          <ActivityItem
            icon="✨"
            text={`${stats.recentSignups} new signups this week`}
            time="Last 7 days"
          />
        </div>
      </div>

      {/* Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-effect rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-bold mb-4">Role Distribution</h3>
          <div className="space-y-3">
            {Object.entries(roleDistribution).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-gray-400">{role}</span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-bold mb-4">Project Categories</h3>
          <div className="space-y-3">
            {Object.entries(categoryDistribution).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-gray-400">{category}</span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const ActivityItem = ({ icon, text, time }) => (
  <div className="flex items-start gap-3 p-3 bg-dark-lighter rounded-lg">
    <span className="text-2xl">{icon}</span>
    <div className="flex-1">
      <p className="text-sm text-white">{text}</p>
      <p className="text-xs text-gray-500 mt-1">{time}</p>
    </div>
  </div>
)

const UsersTab = ({ users, selectedUsers, onToggleUser, onUpdateStatus, onUpdateRole, onBulkAction }) => (
  <div className="space-y-4">
    {/* Bulk Actions Bar */}
    {selectedUsers && selectedUsers.length > 0 && (
      <div className="glass-effect rounded-lg p-4 border border-neon-green/30 flex items-center justify-between">
        <span className="text-sm">
          {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onBulkAction('active')}
            className="px-4 py-2 bg-neon-green/20 text-neon-green rounded-lg hover:bg-neon-green/30 transition-colors text-sm flex items-center gap-2"
          >
            <UserCheck size={16} />
            Activate
          </button>
          <button
            onClick={() => onBulkAction('suspended')}
            className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors text-sm flex items-center gap-2"
          >
            <Ban size={16} />
            Suspend
          </button>
        </div>
      </div>
    )}
    
    <div className="glass-effect rounded-xl border border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-lighter border-b border-gray-800">
            <tr>
              {selectedUsers !== undefined && (
                <th className="px-6 py-4 text-left text-sm font-semibold w-12">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        users.forEach(u => onToggleUser(u.uid || u.id))
                      } else {
                        users.forEach(u => onToggleUser(u.uid || u.id))
                      }
                    }}
                    className="w-4 h-4"
                  />
                </th>
              )}
              <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Commitment</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {users.map((user) => {
              const userId = user.uid || user.id
              return (
                <tr key={userId} className="hover:bg-dark-lighter transition-colors">
                  {selectedUsers !== undefined && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(userId)}
                        onChange={() => onToggleUser(userId)}
                        className="w-4 h-4"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}`}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-medium">{user.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role || 'Developer'}
                      onChange={(e) => onUpdateRole && onUpdateRole(userId, e.target.value)}
                      className="px-3 py-1 bg-neon-blue/20 text-neon-blue rounded-full text-sm border-none outline-none cursor-pointer"
                    >
                      <option value="Developer">Developer</option>
                      <option value="Designer">Designer</option>
                      <option value="Product Manager">Product Manager</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-dark-lighter rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-neon-pink to-neon-green"
                          style={{ width: `${user.commitmentScore || 50}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{user.commitmentScore || 50}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {(user.status === 'active' || user.isActive !== false) ? (
                      <span className="flex items-center gap-1 text-neon-green text-sm">
                        <CheckCircle size={16} /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-500 text-sm">
                        <Ban size={16} /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {(user.status === 'active' || user.isActive !== false) ? (
                        <button
                          onClick={() => onUpdateStatus && onUpdateStatus(userId, 'suspended')}
                          className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
                          title="Suspend user"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateStatus && onUpdateStatus(userId, 'active')}
                          className="text-neon-green hover:text-neon-blue text-sm font-medium transition-colors"
                          title="Activate user"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const ProjectsTab = ({ projects }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {projects.map((project) => (
      <div key={project.id} className="glass-effect rounded-xl p-6 border border-gray-800">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold mb-1">{project.name}</h3>
            <p className="text-sm text-gray-500">{project.category}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs ${
            project.status === 'active'
              ? 'bg-neon-green/20 text-neon-green'
              : project.status === 'completed'
              ? 'bg-neon-blue/20 text-neon-blue'
              : 'bg-gray-800 text-gray-500'
          }`}>
            {project.status || 'Unknown'}
          </span>
        </div>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {project.description}
        </p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <Users size={16} />
            <span>{project.teamMembers?.length || 0} members</span>
          </div>
          <button className="text-neon-blue hover:text-neon-green font-medium transition-colors">
            View Details
          </button>
        </div>
      </div>
    ))}
  </div>
)

export default AdminDashboard
