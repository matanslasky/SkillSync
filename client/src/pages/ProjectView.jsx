import { useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import SynergyMeter from '../components/SynergyMeter'
import MilestoneTimeline from '../components/MilestoneTimeline'
import { mockProjects, mockUsers, mockTasks, getProjectById } from '../data/mockData'
import { getRoleIcon } from '../constants/roles'
import { Calendar, Target, Users, CheckCircle, Clock, Github, Linkedin, Mail, FileText, PenTool, TrendingUp } from 'lucide-react'

const ProjectView = () => {
  const { id } = useParams()
  const project = getProjectById(id)

  if (!project) {
    return (
      <div className="flex h-screen bg-dark">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold mb-4">Project Not Found</h2>
            <p className="text-gray-500">The project you're looking for doesn't exist.</p>
          </div>
        </main>
      </div>
    )
  }

  const teamMembers = mockUsers.filter(user => project.team.includes(user.id))
  const projectTasks = mockTasks.filter(task => task.projectId === id)
  const daysUntilDeadline = Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))

  // Role-specific action button mapping
  const getRoleActionButton = (role) => {
    const techRoles = ['Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Mobile Developer']
    
    if (techRoles.some(techRole => role.toLowerCase().includes(techRole.toLowerCase()) || techRole.toLowerCase().includes(role.toLowerCase()))) {
      return { 
        icon: <Github size={16} />, 
        label: 'GitHub', 
        className: 'px-3 py-2 bg-gray-500/10 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-500/20 transition-all flex items-center gap-2 text-sm font-medium'
      }
    }
    
    switch (role) {
      case 'Designer':
      case 'UI/UX Designer':
        return { 
          icon: <PenTool size={16} />, 
          label: 'Portfolio', 
          className: 'px-3 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-all flex items-center gap-2 text-sm font-medium'
        }
      case 'Product Manager':
        return { 
          icon: <FileText size={16} />, 
          label: 'Docs', 
          className: 'px-3 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-all flex items-center gap-2 text-sm font-medium'
        }
      case 'Growth Lead':
      case 'Marketing':
        return { 
          icon: <TrendingUp size={16} />, 
          label: 'Analytics', 
          className: 'px-3 py-2 bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-all flex items-center gap-2 text-sm font-medium'
        }
      case 'Legal Consultant':
      case 'Lawyer':
        return { 
          icon: <FileText size={16} />, 
          label: 'Legal Docs', 
          className: 'px-3 py-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/20 transition-all flex items-center gap-2 text-sm font-medium'
        }
      case 'User Researcher':
        return { 
          icon: <FileText size={16} />, 
          label: 'Research', 
          className: 'px-3 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/20 transition-all flex items-center gap-2 text-sm font-medium'
        }
      case 'Content Strategist':
      case 'Writer':
        return { 
          icon: <FileText size={16} />, 
          label: 'Content', 
          className: 'px-3 py-2 bg-pink-500/10 text-pink-400 border border-pink-500/30 rounded-lg hover:bg-pink-500/20 transition-all flex items-center gap-2 text-sm font-medium'
        }
      default:
        return { 
          icon: <Linkedin size={16} />, 
          label: 'LinkedIn', 
          className: 'px-3 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-all flex items-center gap-2 text-sm font-medium'
        }
    }
  }

  return (
    <div className="flex h-screen bg-dark">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-neon-blue/20 via-neon-purple/20 to-neon-pink/20 border-b border-gray-800 px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-neon-green/10 text-neon-green text-xs font-semibold rounded-full border border-neon-green/30">
                    {project.category}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    project.status === 'Active' 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                      : 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <h1 className="text-4xl font-bold mb-3">{project.name}</h1>
                <p className="text-gray-400 text-lg max-w-3xl">{project.description}</p>
              </div>
              
              <button className="px-6 py-3 bg-neon-green text-dark font-semibold rounded-lg hover:shadow-neon-green transition-all">
                Join Project
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="glass-effect rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-neon-blue/10 rounded-lg">
                  <Target className="text-neon-blue" size={24} />
                </div>
                <span className="text-gray-400 text-sm">Progress</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{project.progress}%</span>
              </div>
              <div className="w-full h-2 bg-dark-lighter rounded-full mt-3">
                <div 
                  className="h-full bg-gradient-to-r from-neon-blue to-neon-green rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <div className="glass-effect rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-neon-green/10 rounded-lg">
                  <CheckCircle className="text-neon-green" size={24} />
                </div>
                <span className="text-gray-400 text-sm">Tasks</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{project.tasksCompleted}</span>
                <span className="text-gray-500">/ {project.tasksTotal}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {project.tasksTotal - project.tasksCompleted} remaining
              </p>
            </div>

            <div className="glass-effect rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-neon-purple/10 rounded-lg">
                  <Users className="text-neon-purple" size={24} />
                </div>
                <span className="text-gray-400 text-sm">Team Size</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{teamMembers.length}</span>
                <span className="text-gray-500">members</span>
              </div>
              <div className="flex -space-x-2 mt-3">
                {teamMembers.slice(0, 4).map(member => (
                  <div 
                    key={member.id}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-green flex items-center justify-center text-xs font-bold border-2 border-dark"
                  >
                    {member.name.charAt(0)}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-effect rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-neon-pink/10 rounded-lg">
                  <Clock className="text-neon-pink" size={24} />
                </div>
                <span className="text-gray-400 text-sm">Deadline</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{daysUntilDeadline}</span>
                <span className="text-gray-500">days</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Left Column - Team & Tasks */}
            <div className="col-span-2 space-y-8">
              {/* Team Members */}
              <div className="glass-effect rounded-xl p-6 border border-gray-800">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Users size={24} className="text-neon-green" />
                  Team Members
                </h3>
                <div className="space-y-4">
                  {teamMembers.map(member => {
                    const actionButton = getRoleActionButton(member.role)
                    return (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-dark-lighter rounded-lg border border-gray-800 hover:border-gray-700 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-blue to-neon-green flex items-center justify-center text-lg font-bold">
                              {member.name.charAt(0)}
                            </div>
                            {member.status === 'online' && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-lighter" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{member.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-400">{getRoleIcon(member.role)} {member.role}</span>
                              <span className="text-gray-600">•</span>
                              <span className="text-xs text-neon-green font-semibold">{member.commitmentScore}% Score</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 bg-dark border border-gray-800 rounded-lg hover:border-neon-green transition-all">
                            <Mail size={16} className="text-gray-400" />
                          </button>
                          <button className={actionButton.className}>
                            {actionButton.icon}
                            {actionButton.label}
                          </button>
                          <button className="p-2 bg-dark border border-gray-800 rounded-lg hover:border-neon-blue transition-all">
                            <Linkedin size={16} className="text-gray-400" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Tasks */}
              <div className="glass-effect rounded-xl p-6 border border-gray-800">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <CheckCircle size={24} className="text-neon-green" />
                  Tasks
                </h3>
                <div className="space-y-3">
                  {projectTasks.map(task => (
                    <div key={task.id} className="p-4 bg-dark-lighter rounded-lg border border-gray-800 hover:border-gray-700 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3 flex-1">
                          <input 
                            type="checkbox" 
                            checked={task.status === 'Done'}
                            className="mt-1 w-4 h-4 rounded border-gray-700 text-neon-green focus:ring-neon-green"
                            readOnly
                          />
                          <div className="flex-1">
                            <h4 className={`font-medium ${task.status === 'Done' ? 'line-through text-gray-500' : 'text-white'}`}>
                              {task.title}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ml-4 ${
                          task.status === 'Done' 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                            : task.status === 'In Progress'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-pink-500/10 text-pink-400 border border-pink-500/30'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-3 ml-7">
                        <span>Assigned to: <span className="text-gray-400 font-medium">{task.assignedToName}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Project Details + New Features */}
            <div className="space-y-6">
              {/* Synergy Meter */}
              <SynergyMeter team={teamMembers} />
              
              <div className="glass-effect rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold mb-4">Project Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">Category</label>
                    <p className="text-white font-medium">{project.category}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">Status</label>
                    <p className="text-white font-medium">{project.status}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">Created</label>
                    <p className="text-white font-medium">
                      {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">Deadline</label>
                    <p className="text-white font-medium">
                      {new Date(project.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 bg-neon-green/10 text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/20 transition-all font-semibold text-sm">
                    Request to Join
                  </button>
                  <button className="w-full px-4 py-3 bg-dark-lighter border border-gray-800 text-white rounded-lg hover:border-gray-700 transition-all font-semibold text-sm">
                    Share Project
                  </button>
                  <button className="w-full px-4 py-3 bg-dark-lighter border border-gray-800 text-white rounded-lg hover:border-gray-700 transition-all font-semibold text-sm">
                    Report Issue
                  </button>
                </div>
              </div>

              <div className="glass-effect rounded-xl p-6 border border-neon-purple/20 bg-neon-purple/5">
                <h3 className="text-xl font-bold mb-3 text-neon-purple">💡 AI Suggestions</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Based on this project's needs, we recommend adding:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-neon-purple mt-0.5">•</span>
                    <span className="text-gray-300">A DevOps engineer for deployment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-neon-purple mt-0.5">•</span>
                    <span className="text-gray-300">Content writer for documentation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Milestone Timeline - Full Width */}
          <div className="mt-8">
            <MilestoneTimeline projectId={id} team={teamMembers} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProjectView
