import { useState } from 'react'
import { Calendar, Upload, Github, FileText, TrendingUp, Link as LinkIcon, CheckCircle, Clock, Plus } from 'lucide-react'
import { getRoleIcon } from '../constants/roles'

const MilestoneTimeline = ({ projectId, team }) => {
  const [milestones, setMilestones] = useState([
    {
      id: 1,
      title: 'Project Kickoff',
      date: '2026-01-15',
      status: 'completed',
      deliverables: [
        { role: 'Product Manager', type: 'document', title: 'Project Charter', url: '#', uploadedBy: 'Sarah Chen' },
        { role: 'Developer', type: 'github', title: 'Repository Created', url: 'https://github.com', uploadedBy: 'Alex Rodriguez' }
      ]
    },
    {
      id: 2,
      title: 'Design & Planning',
      date: '2026-01-18',
      status: 'in-progress',
      deliverables: [
        { role: 'Designer', type: 'document', title: 'Branding Kit v1', url: '#', uploadedBy: 'Jamie Lee' },
        { role: 'Legal Consultant', type: 'document', title: 'Founder Agreement Draft', url: '#', uploadedBy: 'Marcus Thompson' }
      ]
    },
    {
      id: 3,
      title: 'MVP Development',
      date: '2026-01-22',
      status: 'upcoming',
      deliverables: []
    }
  ])
  
  const [showAddMilestone, setShowAddMilestone] = useState(false)
  const [showAddDeliverable, setShowAddDeliverable] = useState(null)
  
  const deliverableTypes = {
    github: { icon: Github, label: 'GitHub Link', color: 'gray' },
    document: { icon: FileText, label: 'Document', color: 'blue' },
    link: { icon: LinkIcon, label: 'External Link', color: 'purple' },
    marketing: { icon: TrendingUp, label: 'Marketing Asset', color: 'pink' }
  }
  
  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-neon-green/10 text-neon-green border-neon-green/30'
      case 'in-progress':
        return 'bg-neon-blue/10 text-neon-blue border-neon-blue/30'
      case 'upcoming':
        return 'bg-gray-800 text-gray-400 border-gray-700'
      default:
        return ''
    }
  }
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-neon-green" />
      case 'in-progress':
        return <Clock size={20} className="text-neon-blue" />
      case 'upcoming':
        return <Calendar size={20} className="text-gray-500" />
      default:
        return null
    }
  }
  
  const handleAddDeliverable = (milestoneId, deliverableData) => {
    setMilestones(milestones.map(m => {
      if (m.id === milestoneId) {
        return {
          ...m,
          deliverables: [...m.deliverables, { ...deliverableData, id: Date.now() }]
        }
      }
      return m
    }))
    setShowAddDeliverable(null)
  }
  
  return (
    <div className="glass-effect rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="text-neon-blue" size={24} />
          Milestone Timeline
        </h3>
        <button 
          onClick={() => setShowAddMilestone(true)}
          className="flex items-center gap-2 px-4 py-2 bg-neon-green/10 text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/20 transition-all text-sm font-semibold"
        >
          <Plus size={16} />
          Add Milestone
        </button>
      </div>
      
      <div className="space-y-6">
        {milestones.map((milestone, index) => (
          <div key={milestone.id} className="relative">
            {/* Timeline Line */}
            {index < milestones.length - 1 && (
              <div className="absolute left-5 top-12 w-0.5 h-full bg-gradient-to-b from-neon-blue to-gray-800"></div>
            )}
            
            <div className="flex gap-4">
              {/* Timeline Dot */}
              <div className="relative z-10 flex-shrink-0">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                  milestone.status === 'completed' ? 'bg-neon-green/20 border-neon-green' :
                  milestone.status === 'in-progress' ? 'bg-neon-blue/20 border-neon-blue' :
                  'bg-dark border-gray-700'
                }`}>
                  {getStatusIcon(milestone.status)}
                </div>
              </div>
              
              {/* Milestone Content */}
              <div className="flex-1 pb-6">
                <div className="bg-dark-lighter rounded-lg border border-gray-800 p-4 hover:border-gray-700 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">{milestone.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(milestone.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusStyle(milestone.status)}`}>
                      {milestone.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Deliverables */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-400">
                        Deliverables ({milestone.deliverables.length})
                      </p>
                      {milestone.status !== 'upcoming' && (
                        <button
                          onClick={() => setShowAddDeliverable(milestone.id)}
                          className="text-xs text-neon-green hover:text-neon-green/80 flex items-center gap-1"
                        >
                          <Upload size={14} />
                          Upload
                        </button>
                      )}
                    </div>
                    
                    {milestone.deliverables.length === 0 ? (
                      <p className="text-xs text-gray-600 italic py-2">No deliverables uploaded yet</p>
                    ) : (
                      <div className="space-y-2">
                        {milestone.deliverables.map((deliverable, idx) => {
                          const TypeIcon = deliverableTypes[deliverable.type]?.icon || FileText
                          const typeColor = deliverableTypes[deliverable.type]?.color || 'gray'
                          
                          return (
                            <div 
                              key={idx}
                              className="flex items-start gap-3 p-3 bg-dark rounded-lg border border-gray-800 hover:border-gray-700 transition-all"
                            >
                              <div className={`p-2 bg-${typeColor}-500/10 rounded-lg flex-shrink-0`}>
                                <TypeIcon size={18} className={`text-${typeColor}-400`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <a 
                                      href={deliverable.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm font-medium text-white hover:text-neon-blue transition-all"
                                    >
                                      {deliverable.title}
                                    </a>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-gray-500">
                                        {getRoleIcon(deliverable.role)} {deliverable.role}
                                      </span>
                                      <span className="text-gray-700">•</span>
                                      <span className="text-xs text-gray-600">{deliverable.uploadedBy}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Add Deliverable Form */}
                  {showAddDeliverable === milestone.id && (
                    <AddDeliverableForm
                      team={team}
                      onSubmit={(data) => handleAddDeliverable(milestone.id, data)}
                      onCancel={() => setShowAddDeliverable(null)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const AddDeliverableForm = ({ team, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    role: team[0]?.role || 'Developer',
    type: 'github',
    title: '',
    url: '',
    uploadedBy: team[0]?.name || 'Current User'
  })
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.title && formData.url) {
      onSubmit(formData)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-dark rounded-lg border border-neon-blue/30">
      <p className="text-sm font-semibold text-neon-blue mb-3">Add Proof of Work</p>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="bg-dark-lighter border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-neon-blue focus:outline-none"
          >
            {team.map(member => (
              <option key={member.id} value={member.role}>{member.role}</option>
            ))}
          </select>
          
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="bg-dark-lighter border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-neon-blue focus:outline-none"
          >
            <option value="github">GitHub Link</option>
            <option value="document">Document</option>
            <option value="link">External Link</option>
            <option value="marketing">Marketing Asset</option>
          </select>
        </div>
        
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Deliverable title (e.g., 'Login Feature PR')"
          className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-neon-blue focus:outline-none"
          required
        />
        
        <input
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="URL (GitHub, Google Drive, etc.)"
          className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-neon-blue focus:outline-none"
          required
        />
        
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-neon-blue text-dark font-semibold py-2 rounded-lg hover:shadow-neon-blue transition-all text-sm"
          >
            Add Deliverable
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 bg-dark-lighter border border-gray-800 text-white py-2 rounded-lg hover:bg-dark transition-all text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}

export default MilestoneTimeline
