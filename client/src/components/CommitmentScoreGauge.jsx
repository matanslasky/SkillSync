import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, Award } from 'lucide-react'
import { getScoreHistory, getScoreTrend, calculateCommitmentScore } from '../services/commitmentScoreService'
import { useAuth } from '../contexts/AuthContext'

const CommitmentScoreGauge = ({ userId, showHistory = false }) => {
  const { user } = useAuth()
  const [score, setScore] = useState(null)
  const [trend, setTrend] = useState('stable')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const targetUserId = userId || user?.uid

  useEffect(() => {
    if (targetUserId) {
      loadScoreData()
    }
  }, [targetUserId])

  const loadScoreData = async () => {
    setLoading(true)
    try {
      const currentScore = await calculateCommitmentScore(targetUserId)
      const scoreTrend = await getScoreTrend(targetUserId)
      
      setScore(currentScore)
      setTrend(scoreTrend)

      if (showHistory) {
        const scoreHistory = await getScoreHistory(targetUserId, 30)
        setHistory(scoreHistory)
      }
    } catch (error) {
      console.error('Error loading score data:', error)
      setScore(50) // Default
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadScoreData()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="glass-effect rounded-xl p-6 border border-gray-800 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green mx-auto"></div>
      </div>
    )
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-neon-green'
    if (score >= 60) return 'text-neon-blue'
    if (score >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreGradient = (score) => {
    if (score >= 80) return 'from-neon-green to-green-400'
    if (score >= 60) return 'from-neon-blue to-blue-400'
    if (score >= 40) return 'from-yellow-400 to-yellow-500'
    return 'from-red-400 to-red-500'
  }

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp size={16} className="text-neon-green" />
    if (trend === 'down') return <TrendingDown size={16} className="text-red-400" />
    return <Minus size={16} className="text-gray-500" />
  }

  const getTrendText = () => {
    if (trend === 'up') return 'Trending Up'
    if (trend === 'down') return 'Trending Down'
    return 'Stable'
  }

  return (
    <div className="space-y-4">
      {/* Score Gauge */}
      <div className="glass-effect rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neon-green/10 rounded-lg">
              <Award className="text-neon-green" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Commitment Score</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {getTrendIcon()}
                <span>{getTrendText()}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-1 bg-dark-lighter border border-gray-800 rounded-lg text-sm hover:border-neon-green/30 transition-all disabled:opacity-50"
          >
            {refreshing ? 'Updating...' : 'Refresh'}
          </button>
        </div>

        {/* Circular Gauge */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="rgb(31, 41, 55)"
              strokeWidth="20"
            />
            {/* Score circle */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 502} 502`}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className={`${getScoreGradient(score).split(' ')[0]}`} />
                <stop offset="100%" className={`${getScoreGradient(score).split(' ')[1]}`} />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Score text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-5xl font-bold ${getScoreColor(score)}`}>
                {score}
              </div>
              <div className="text-sm text-gray-500 mt-1">out of 100</div>
            </div>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div className="p-3 bg-dark-lighter rounded-lg">
            <p className="text-gray-500 mb-1">On-Time</p>
            <p className="font-bold text-neon-green">50%</p>
          </div>
          <div className="p-3 bg-dark-lighter rounded-lg">
            <p className="text-gray-500 mb-1">Completion</p>
            <p className="font-bold text-neon-blue">30%</p>
          </div>
          <div className="p-3 bg-dark-lighter rounded-lg">
            <p className="text-gray-500 mb-1">Peer Review</p>
            <p className="font-bold text-neon-purple">20%</p>
          </div>
        </div>
      </div>

      {/* Score History Chart */}
      {showHistory && history.length > 0 && (
        <div className="glass-effect rounded-xl p-6 border border-gray-800">
          <h4 className="font-bold mb-4">Score History (Last 30 Days)</h4>
          <div className="h-48 flex items-end gap-2">
            {history.map((entry, idx) => {
              const height = (entry.score / 100) * 100
              return (
                <div
                  key={entry.id || idx}
                  className="flex-1 group relative"
                >
                  <div
                    className={`bg-gradient-to-t ${getScoreGradient(entry.score)} rounded-t transition-all hover:opacity-80`}
                    style={{ height: `${height}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                      <div className="bg-dark border border-gray-700 rounded px-2 py-1 text-xs whitespace-nowrap">
                        <div className="font-bold">{entry.score}</div>
                        <div className="text-gray-500">
                          {entry.timestamp?.toDate ? 
                            entry.timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
                            'N/A'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>
              {history[0]?.timestamp?.toDate ? 
                history[0].timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
                '30 days ago'
              }
            </span>
            <span>Today</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommitmentScoreGauge
