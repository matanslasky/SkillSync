import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Linkedin, Github, MapPin, Calendar, Award, Code, Briefcase, Star } from 'lucide-react'
import { mockUsers } from '../data/mockData'
import GamificationPanel from '../components/GamificationPanel'

const Profile = () => {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  
  // For now, use mock data. In production, fetch from Firestore
  const profileUser = mockUsers.find(u => u.id === id) || currentUser || {
    name: 'User',
    role: 'Developer',
    email: 'user@example.com',
    bio: 'Passionate about building amazing things',
    commitmentScore: 75,
    skills: ['React', 'Node.js', 'Firebase', 'UI/UX'],
    location: 'Remote',
    joinedDate: '2024-01-15',
    projectsCompleted: 3,
    tasksCompleted: 24
  }

  const isOwnProfile = currentUser?.uid === id || !id

  // Mock skills data - in production, this would come from Firestore
  const skills = profileUser.skills || [
    'React', 'JavaScript', 'TypeScript', 'Node.js', 
    'Firebase', 'Tailwind CSS', 'Git', 'UI/UX Design'
  ]

  const projects = [
    { id: 1, name: 'EcoTrack', role: 'Frontend Developer', status: 'Completed' },
    { id: 2, name: 'LearnHub', role: 'Full Stack Developer', status: 'Active' },
    { id: 3, name: 'TaskMaster', role: 'UI Designer', status: 'Completed' }
  ]

  return (
    <div className="flex h-screen bg-dark">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="glass-effect rounded-xl p-8 border border-gray-800 mb-8">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-5xl font-bold flex-shrink-0">
                {profileUser.name?.charAt(0) || 'U'}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{profileUser.name}</h1>
                    <p className="text-xl text-neon-blue">{profileUser.role}</p>
                  </div>
                  {isOwnProfile && (
                    <button 
                      onClick={() => navigate('/settings')}
                      className="px-4 py-2 bg-dark-lighter border border-gray-800 rounded-lg hover:border-gray-700 transition-all font-medium"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                <p className="text-gray-400 mb-4">{profileUser.bio || 'No bio yet'}</p>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 text-sm">
                  {profileUser.email && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail size={16} />
                      <span>{profileUser.email}</span>
                    </div>
                  )}
                  {profileUser.location && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin size={16} />
                      <span>{profileUser.location}</span>
                    </div>
                  )}
                  {profileUser.joinedDate && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar size={16} />
                      <span>Joined {new Date(profileUser.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex gap-3 mt-4">
                  {profileUser.github && (
                    <button 
                      onClick={() => window.open(`https://github.com/${profileUser.github}`, '_blank')}
                      className="p-2 bg-dark-lighter border border-gray-800 rounded-lg hover:border-neon-blue/30 transition-all"
                    >
                      <Github size={18} className="text-gray-400" />
                    </button>
                  )}
                  {profileUser.linkedin && (
                    <button 
                      onClick={() => window.open(`https://linkedin.com/in/${profileUser.linkedin}`, '_blank')}
                      className="p-2 bg-dark-lighter border border-gray-800 rounded-lg hover:border-neon-blue/30 transition-all"
                    >
                      <Linkedin size={18} className="text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="glass-effect rounded-xl p-6 border border-gray-800 text-center">
              <div className="w-12 h-12 bg-neon-green/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Award className="text-neon-green" size={24} />
              </div>
              <p className="text-3xl font-bold text-neon-green mb-1">{profileUser.commitmentScore || 0}%</p>
              <p className="text-sm text-gray-500">Commitment Score</p>
            </div>

            <div className="glass-effect rounded-xl p-6 border border-gray-800 text-center">
              <div className="w-12 h-12 bg-neon-blue/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Briefcase className="text-neon-blue" size={24} />
              </div>
              <p className="text-3xl font-bold mb-1">{profileUser.projectsCompleted || 0}</p>
              <p className="text-sm text-gray-500">Projects Completed</p>
            </div>

            <div className="glass-effect rounded-xl p-6 border border-gray-800 text-center">
              <div className="w-12 h-12 bg-neon-purple/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Star className="text-neon-purple" size={24} />
              </div>
              <p className="text-3xl font-bold mb-1">{profileUser.tasksCompleted || 0}</p>
              <p className="text-sm text-gray-500">Tasks Completed</p>
            </div>
          </div>

          {/* Skills Section */}
          <div className="glass-effect rounded-xl p-6 border border-gray-800 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Code className="text-neon-green" size={24} />
              <h3 className="text-2xl font-bold">Skills & Technologies</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill, idx) => (
                <span 
                  key={idx}
                  className="px-4 py-2 bg-dark-lighter border border-gray-800 rounded-lg text-sm font-medium hover:border-neon-green/30 transition-all"
                >
                  {skill}
                </span>
              ))}
            </div>
            {isOwnProfile && (
              <button className="mt-4 text-sm text-neon-blue hover:text-neon-green transition-colors">
                + Add More Skills
              </button>
            )}
          </div>

          {/* Projects */}
          <div className="glass-effect rounded-xl p-6 border border-gray-800 mb-8">
            <h3 className="text-2xl font-bold mb-4">Projects</h3>
            <div className="space-y-3">
              {projects.map((project) => (
                <div 
                  key={project.id}
                  className="flex items-center justify-between p-4 bg-dark-lighter rounded-lg border border-gray-800 hover:border-gray-700 transition-all"
                >
                  <div>
                    <h4 className="font-semibold text-white">{project.name}</h4>
                    <p className="text-sm text-gray-400">{project.role}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    project.status === 'Active' 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                      : 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                  }`}>
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Gamification Panel */}
          {isOwnProfile && <GamificationPanel />}
        </div>
      </main>
    </div>
  )
}

export default Profile
