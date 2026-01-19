import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import ProgressBar from '../components/ProgressBar'
import CommitmentGauge from '../components/CommitmentGauge'
import TeamList from '../components/TeamList'
import { useAuth } from '../contexts/AuthContext'
import { Rocket, GitBranch, Target, TrendingUp } from 'lucide-react'
import { getProjects, getTasksByProject } from '../services/firestoreService'

const DashboardPage = () => {
  const { user } = useAuth()
  
  const [activeProject, setActiveProject] = useState(null)
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [teamMembers] = useState([
    { id: 1, name: 'Alex Chen', role: 'Frontend Dev', status: 'online', score: 92 },
    { id: 2, name: 'Sarah Kim', role: 'Designer', status: 'online', score: 88 },
    { id: 3, name: 'Mike Torres', role: 'Backend Dev', status: 'away', score: 75 },
    { id: 4, name: 'Emma Wilson', role: 'Marketing', status: 'offline', score: 81 },
  ])

  const commitmentScore = user?.commitmentScore || 85

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await getProjects()
        setProjects(projectsData)
        
        if (projectsData.length > 0) {
          const firstProject = projectsData[0]
          const projectTasks = await getTasksByProject(firstProject.id)
          
          setActiveProject({
            ...firstProject,
            tasksCompleted: projectTasks.filter(t => t.status === 'Done').length,
            tasksTotal: projectTasks.length,
            daysRemaining: calculateDaysRemaining(firstProject.deadline)
          })
          setTasks(projectTasks)
        }
      } catch (error) {
        console.error('Error loading projects:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  const calculateDaysRemaining = (deadline) => {
    if (!deadline) return 0
    const now = new Date()
    const end = new Date(deadline)
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
  }

  return (
    <div className="flex h-screen bg-dark overflow-hidden">
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              Welcome back, <span className="text-neon-green">{user?.name || 'Developer'}</span>
            </h2>
            <p className="text-gray-500">Here's what's happening with your projects today.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-neon-green">Loading projects...</div>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                  icon={<Rocket className="text-neon-green" />}
                  label="Active Projects"
                  value={projects.length.toString()}
                  change={`+${Math.floor(projects.length / 2)} this month`}
                />
                <StatCard
                  icon={<GitBranch className="text-neon-blue" />}
                  label="Commits This Week"
                  value="47"
                  change="+12 from last week"
                />
                <StatCard
                  icon={<Target className="text-neon-pink" />}
                  label="Tasks Completed"
                  value={tasks.filter(t => t.status === 'Done').length.toString()}
                  change={`${tasks.filter(t => t.status !== 'Done').length} pending`}
                />
                <StatCard
                  icon={<TrendingUp className="text-neon-green" />}
                  label="Team Velocity"
                  value="High"
                  change="Above average"
                />
              </div>

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Active Project */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Active Project Card */}
                  {activeProject ? (
                    <div className="glass-effect rounded-xl p-6 border border-neon-green/20">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">{activeProject.name}</h3>
                          <p className="text-gray-400 text-sm">{activeProject.description}</p>
                        </div>
                        <span className="px-3 py-1 bg-neon-green/20 text-neon-green text-xs rounded-full border border-neon-green/30">
                          {activeProject.status}
                        </span>
                      </div>

                      <ProgressBar 
                        progress={activeProject.tasksTotal > 0 ? Math.round((activeProject.tasksCompleted / activeProject.tasksTotal) * 100) : 0} 
                        label="Project Progress" 
                        color="green" 
                      />

                      <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-neon-blue">{activeProject.tasksCompleted}/{activeProject.tasksTotal}</p>
                          <p className="text-xs text-gray-500 mt-1">Tasks Done</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-neon-pink">{activeProject.daysRemaining}</p>
                          <p className="text-xs text-gray-500 mt-1">Days Left</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-neon-green">{activeProject.team?.length || teamMembers.length}</p>
                          <p className="text-xs text-gray-500 mt-1">Team Size</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-effect rounded-xl p-6 border border-gray-700">
                      <p className="text-gray-400 text-center">No active projects. Create one in the Marketplace!</p>
                    </div>
                  )}

                  {/* Recent Activity */}
                  <div className="glass-effect rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {tasks.slice(0, 3).map((task) => (
                        <ActivityItem
                          key={task.id}
                          user={task.assignedTo || 'Team'}
                          action={task.status === 'Done' ? 'completed task' : 'working on'}
                          target={task.title}
                          time="Recently"
                        />
                      ))}
                      {tasks.length === 0 && (
                        <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Commitment Score & Team */}
                <div className="space-y-6">
                  {/* Commitment Score */}
                  <div className="glass-effect rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-6">Your Commitment Score</h3>
                    <div className="flex justify-center">
                      <CommitmentGauge score={commitmentScore} />
                    </div>
                    <div className="mt-6 space-y-2">
                      <ProgressBar progress={90} label="GitHub Activity" color="green" />
                      <ProgressBar progress={85} label="Deadline Compliance" color="blue" />
                      <ProgressBar progress={78} label="Meeting Attendance" color="pink" />
                    </div>
                  </div>

                  {/* Team List */}
                  <div className="glass-effect rounded-xl p-6">
                    <TeamList members={teamMembers} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

const StatCard = ({ icon, label, value, change }) => (
  <div className="glass-effect rounded-xl p-6 hover:border-neon-green/30 transition-all">
    <div className="flex items-center justify-between mb-4">
      {icon}
    </div>
    <p className="text-3xl font-bold text-white mb-1">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
    {change && <p className="text-xs text-neon-green mt-2">{change}</p>}
  </div>
)

const ActivityItem = ({ user, action, target, time }) => (
  <div className="flex items-start gap-3 p-3 hover:bg-dark-lighter rounded-lg transition-all">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-green flex items-center justify-center text-xs font-bold flex-shrink-0">
      {user.charAt(0)}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm">
        <span className="font-semibold text-white">{user}</span>{' '}
        <span className="text-gray-400">{action}</span>{' '}
        <span className="text-neon-blue">{target}</span>
      </p>
      <p className="text-xs text-gray-600 mt-0.5">{time}</p>
    </div>
  </div>
)

export default DashboardPage
