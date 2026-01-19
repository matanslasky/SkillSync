import { useState } from 'react'
import { X, Send, Briefcase, AlertCircle, Check } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { sendJoinRequest } from '../services/joinRequestService'

const JoinRequestModal = ({ isOpen, onClose, project }) => {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [skills, setSkills] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSending(true)

    try {
      // Parse skills (comma-separated)
      const skillArray = skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)

      await sendJoinRequest({
        projectId: project.id,
        projectName: project.name || project.title,
        userId: user.uid,
        userName: user.name,
        message,
        skills: skillArray
      })

      setSuccess(true)
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setMessage('')
        setSkills('')
      }, 2000)
    } catch (error) {
      console.error('Error sending join request:', error)
      setError(error.message || 'Failed to send request. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    if (!sending) {
      onClose()
      setError('')
      setMessage('')
      setSkills('')
      setSuccess(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-xl p-8 max-w-lg w-full border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neon-green/10 rounded-lg">
              <Briefcase className="text-neon-green" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Join Team Request</h3>
              <p className="text-sm text-gray-400">{project?.name || project?.title}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={sending}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-neon-green" size={32} />
            </div>
            <h4 className="text-xl font-bold mb-2">Request Sent!</h4>
            <p className="text-gray-400">
              The project owner will review your request and get back to you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Skills Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Relevant Skills <span className="text-gray-500">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g., React, UI/UX Design, Project Management"
                className="w-full px-4 py-3 bg-dark-lighter border border-gray-800 rounded-lg focus:outline-none focus:border-neon-green/50 transition-colors"
                disabled={sending}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                List the skills you can contribute to this project
              </p>
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Message to Project Owner
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell them why you'd be a great fit for this team..."
                rows={4}
                className="w-full px-4 py-3 bg-dark-lighter border border-gray-800 rounded-lg focus:outline-none focus:border-neon-green/50 transition-colors resize-none"
                disabled={sending}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Explain your motivation and what you can bring to the team
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={sending}
                className="flex-1 px-6 py-3 bg-dark-lighter border border-gray-800 rounded-lg font-medium hover:border-gray-700 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending || !message.trim() || !skills.trim()}
                className="flex-1 px-6 py-3 bg-neon-green text-dark font-semibold rounded-lg hover:shadow-neon-green transition-all disabled:opacity-50 disabled:hover:shadow-none flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-dark"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Request
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default JoinRequestModal
