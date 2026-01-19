import { useState, useEffect } from 'react'
import { X, Users, Send, Check, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getProjects } from '../services/projectService'
import { sendTeamInvite, checkInvitationExists } from '../services/teamInviteService'

const InviteToTeamModal = ({ isOpen, onClose, recipientUser }) => {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isOpen && user?.uid) {
      loadUserProjects()
    }
  }, [isOpen, user?.uid])

  const loadUserProjects = async () => {
    try {
      setLoading(true)
      // Get projects where user is creator or team member
      const allProjects = await getProjects()
      const userProjects = allProjects.filter(p => 
        p.creatorId === user.uid || p.teamMembers?.includes(user.uid)
      )
      setProjects(userProjects)
    } catch (error) {
      console.error('Error loading projects:', error)
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleSendInvite = async () => {
    if (!selectedProject || !recipientUser || !user) {
      setError('Please select a project')
      return
    }

    setSending(true)
    setError('')

    try {
      // Check if invitation already exists
      const exists = await checkInvitationExists(user.uid, recipientUser.uid || recipientUser.id, selectedProject.id)
      if (exists) {
        setError('You already sent an invitation to this user for this project')
        setSending(false)
        return
      }

      // Check if user is already in the project
      if (selectedProject.teamMembers?.includes(recipientUser.uid || recipientUser.id)) {
        setError('This user is already a member of this project')
        setSending(false)
        return
      }

      await sendTeamInvite({
        senderId: user.uid,
        senderName: user.name || user.displayName,
        recipientId: recipientUser.uid || recipientUser.id,
        recipientName: recipientUser.name,
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        message: message.trim() || `${user.name || user.displayName} invited you to join their project!`,
        role: recipientUser.role
      })

      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setSelectedProject(null)
        setMessage('')
      }, 2000)
    } catch (error) {
      console.error('Error sending invite:', error)
      setError('Failed to send invitation. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
              <Users className="text-neon-green" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Invite to Team</h2>
              <p className="text-sm text-gray-500">Invite {recipientUser?.name} to join your project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-lighter rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-neon-green/20 flex items-center justify-center mb-4">
                <Check className="text-neon-green" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Invitation Sent!</h3>
              <p className="text-gray-400 text-center">
                {recipientUser?.name} will receive your invitation
              </p>
            </div>
          ) : (
            <>
              {/* Select Project */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Project</label>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-green"></div>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8 bg-dark-lighter rounded-lg border border-gray-800">
                    <AlertCircle className="mx-auto mb-2 text-gray-500" size={24} />
                    <p className="text-gray-500">You don't have any projects yet</p>
                    <p className="text-sm text-gray-600 mt-1">Create a project first to invite teammates</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => setSelectedProject(project)}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          selectedProject?.id === project.id
                            ? 'bg-neon-green/10 border-neon-green/50'
                            : 'bg-dark-lighter border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{project.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs px-2 py-1 bg-neon-blue/20 text-neon-blue rounded">
                                {project.category}
                              </span>
                              <span className="text-xs text-gray-600">
                                {project.teamMembers?.length || 0} members
                              </span>
                            </div>
                          </div>
                          {selectedProject?.id === project.id && (
                            <Check className="text-neon-green flex-shrink-0 ml-2" size={20} />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Personal Message <span className="text-gray-600">(Optional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a personal message to your invitation..."
                  rows={4}
                  className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-neon-green focus:outline-none resize-none"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-4 bg-neon-pink/10 border border-neon-pink/30 rounded-lg">
                  <AlertCircle className="text-neon-pink flex-shrink-0" size={20} />
                  <p className="text-sm text-neon-pink">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-dark-lighter border border-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvite}
                  disabled={!selectedProject || sending}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-neon-green text-dark font-semibold rounded-lg hover:shadow-neon-green transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-dark"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default InviteToTeamModal
