import { useState, useEffect } from 'react'
import { Users, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react'
import { 
  getProjectJoinRequests, 
  approveJoinRequest, 
  rejectJoinRequest,
  subscribeToProjectRequests 
} from '../services/joinRequestService'

const JoinRequestManager = ({ projectId, projectName, onRequestsChange }) => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    if (!projectId) return

    // Subscribe to real-time updates
    const unsubscribe = subscribeToProjectRequests(projectId, (newRequests) => {
      setRequests(newRequests)
      setLoading(false)
      if (onRequestsChange) {
        onRequestsChange(newRequests.length)
      }
    })

    return () => unsubscribe()
  }, [projectId, onRequestsChange])

  const handleApprove = async (request) => {
    setProcessing(request.id)
    try {
      await approveJoinRequest(request.id, projectId, request.userId)
      // Request will be removed from list via real-time subscription
    } catch (error) {
      console.error('Error approving request:', error)
      alert('Failed to approve request. Please try again.')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (request) => {
    setProcessing(request.id)
    try {
      await rejectJoinRequest(request.id)
      // Request will be removed from list via real-time subscription
    } catch (error) {
      console.error('Error rejecting request:', error)
      alert('Failed to reject request. Please try again.')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="glass-effect rounded-xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users size={24} className="text-neon-blue" />
          Join Requests
        </h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue mx-auto"></div>
        </div>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="glass-effect rounded-xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users size={24} className="text-neon-blue" />
          Join Requests
        </h3>
        <div className="text-center py-8">
          <Clock size={32} className="text-gray-600 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No pending join requests</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-effect rounded-xl p-6 border border-gray-800">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Users size={24} className="text-neon-blue" />
        Join Requests
        <span className="text-sm font-normal text-gray-500">({requests.length})</span>
      </h3>

      <div className="space-y-4">
        {requests.map((request) => (
          <div 
            key={request.id}
            className="p-4 bg-dark-lighter rounded-lg border border-gray-800 hover:border-gray-700 transition-all"
          >
            {/* User Info */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-white">{request.userName}</h4>
                <p className="text-xs text-gray-500">
                  {request.createdAt?.toDate ? 
                    request.createdAt.toDate().toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 
                    'Just now'
                  }
                </p>
              </div>
            </div>

            {/* Skills */}
            {request.skills && request.skills.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {request.skills.map((skill, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 bg-neon-blue/10 text-neon-blue text-xs rounded border border-neon-blue/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Message */}
            {request.message && (
              <div className="mb-4 p-3 bg-dark rounded-lg border border-gray-800">
                <div className="flex items-start gap-2 mb-2">
                  <MessageSquare size={14} className="text-gray-500 mt-0.5" />
                  <p className="text-xs text-gray-500">Message:</p>
                </div>
                <p className="text-sm text-gray-300">{request.message}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(request)}
                disabled={processing === request.id}
                className="flex-1 px-4 py-2 bg-neon-green/10 text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/20 transition-all font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processing === request.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neon-green"></div>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Approve
                  </>
                )}
              </button>
              <button
                onClick={() => handleReject(request)}
                disabled={processing === request.id}
                className="flex-1 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-all font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <XCircle size={16} />
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default JoinRequestManager
