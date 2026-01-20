import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
// NotificationBell temporarily disabled due to missing Firestore indexes
// import NotificationBell from '../components/NotificationBell'
import ProgressBar from '../components/ProgressBar'
import CommitmentGauge from '../components/CommitmentGauge'
import CommitmentScoreGauge from '../components/CommitmentScoreGauge'
import TeamList from '../components/TeamList'
import AIAssistantCard from '../components/AIAssistantCard'
import RoleContribution from '../components/RoleContribution'
import { useAuth } from '../contexts/AuthContext'
import { Rocket, GitBranch, Target, TrendingUp, Users, Calendar, CheckCircle2 } from 'lucide-react'
import { getProjects, getTasksByProject } from '../services/firestoreService'
import { mockProjects, mockTasks, mockUsers, calculateDaysRemaining } from '../data/mockData'

const DashboardPage = () => {
  const { user } = useAuth()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [activeProject, setActiveProject] = useState(null)
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [teamMembers] = useState(mockUsers.slice(0, 4))

  const commitmentScore = user?.commitmentScore || 85

  useEffect(() => {
    const loadProjects = async () => {
      try {
        // Try to fetch from Firebase first
        const projectsData = await getProjects()
        
        // If no Firebase data, use mock data
        if (projectsData.length === 0) {
          setProjects(mockProjects)
          const firstProject = mockProjects[0]
          const projectTasks = mockTasks.filter(t => t.projectId === firstProject.id)
          
          setActiveProject({
            ...firstProject,
            tasksCompleted: projectTasks.filter(t => t.status === 'Done').length,
            tasksTotal: projectTasks.length,
            daysRemaining: calculateDaysRemaining(firstProject.deadline)
          })
          setTasks(projectTasks)
        } else {
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
        }
      } catch (error) {
        console.error('Error loading projects:', error)
        // Fallback to mock data on error
        setProjects(mockProjects)
        setTasks(mockTasks)
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Rocket size={16} /> },
    { id: 'myteam', label: 'My Team', icon: <Users size={16} /> },
    { id: 'milestones', label: 'Milestones', icon: <Target size={16} /> },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'myteam':
        return renderMyTeam()
      case 'milestones':
        return renderMilestones()
      default:
        return renderOverview()
    }
  }

  const renderOverview = () => (
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
                  user={task.assignedToName || 'Team'}
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
            <CommitmentScoreGauge userId={user?.uid} showHistory={true} />
          </div>

          {/* AI Assistant Card */}
          <AIAssistantCard />

          {/* Team List */}
          <div className="glass-effect rounded-xl p-6">
            <TeamList members={teamMembers} />
          </div>
        </div>
      </div>
    </>
  )

  const renderMyTeam = () => (
    <div className="space-y-6">
      <div className="glass-effect rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">Team Members</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="glass-effect rounded-lg p-4 border border-gray-800 hover:border-neon-green/30 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-blue to-neon-green flex items-center justify-center text-lg font-bold">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-white">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
                <div className="ml-auto">
                  <span className={`w-2 h-2 rounded-full ${
                    member.status === 'online' ? 'bg-neon-green' :
                    member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-600'
                  } inline-block`}></span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Commitment Score</span>
                  <span className="text-neon-green font-semibold">{member.commitmentScore || member.score}</span>
                </div>
                {member.skills && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {member.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-dark-lighter text-xs text-gray-400 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderMilestones = () => (
    <div className="space-y-6">
      <div className="glass-effect rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">Project Milestones</h3>
        
        {activeProject ? (
          <div className="space-y-4">
            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-800"></div>
              
              {/* Milestone Items */}
              <div className="space-y-6 relative">
                <MilestoneItem
                  title="Project Kickoff"
                  date="Week 1"
                  status="completed"
                  description="Initial team meeting and project scope definition"
                />
                <MilestoneItem
                  title="MVP Development"
                  date="Week 2-4"
                  status="in-progress"
                  description="Core feature implementation and testing"
                />
                <MilestoneItem
                  title="Beta Testing"
                  date="Week 5-6"
                  status="upcoming"
                  description="User testing and feedback collection"
                />
                <MilestoneItem
                  title="Launch"
                  date="Week 7"
                  status="upcoming"
                  description="Product launch and marketing campaign"
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No active project selected</p>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-dark overflow-hidden">
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Welcome back, <span className="text-neon-green">{user?.name || 'Developer'}</span>
              </h2>
              <p className="text-gray-500">Here's what's happening with your projects today.</p>
            </div>
            {/* NotificationBell temporarily disabled - Create Firestore indexes first */}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-800">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-neon-green border-b-2 border-neon-green'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-neon-green">Loading projects...</div>
            </div>
          ) : (
            renderTabContent()
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

const MilestoneItem = ({ title, date, status, description }) => {
  const statusColors = {
    completed: 'bg-neon-green',
    'in-progress': 'bg-neon-blue',
    upcoming: 'bg-gray-600'
  }

  const statusIcons = {
    completed: <CheckCircle2 size={16} className="text-neon-green" />,
    'in-progress': <Target size={16} className="text-neon-blue" />,
    upcoming: <Calendar size={16} className="text-gray-400" />
  }

  return (
    <div className="flex gap-4 pl-0">
      <div className={`w-8 h-8 rounded-full ${statusColors[status]} flex items-center justify-center flex-shrink-0 relative z-10`}>
        {statusIcons[status]}
      </div>
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between mb-1">
          <h4 className="font-semibold text-white">{title}</h4>
          <span className="text-xs text-gray-500">{date}</span>
        </div>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  )
}

export default DashboardPage
