import { Users, TrendingUp, Award } from 'lucide-react'

const SynergyMeter = ({ team }) => {
  // Calculate diversity score based on unique roles
  const calculateSynergyScore = (members) => {
    if (!members || members.length === 0) return 0
    
    const roleCategories = {
      'Technical': ['Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Mobile Developer'],
      'Design': ['Designer', 'UI/UX Designer'],
      'Business': ['Product Manager', 'Growth Lead'],
      'Legal': ['Legal Consultant', 'Lawyer'],
      'Research': ['User Researcher'],
      'Content': ['Content Strategist', 'Writer']
    }
    
    // Count unique categories
    const categoriesPresent = new Set()
    members.forEach(member => {
      for (const [category, roles] of Object.entries(roleCategories)) {
        if (roles.includes(member.role)) {
          categoriesPresent.add(category)
        }
      }
    })
    
    // Base score on team size
    const sizeScore = Math.min((members.length / 5) * 30, 30)
    
    // Diversity bonus: each unique category adds value
    const diversityScore = (categoriesPresent.size / Object.keys(roleCategories).length) * 70
    
    return Math.round(sizeScore + diversityScore)
  }
  
  const score = calculateSynergyScore(team)
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'neon-green'
    if (score >= 60) return 'neon-blue'
    if (score >= 40) return 'neon-purple'
    return 'neon-pink'
  }
  
  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Growing'
    return 'Building'
  }
  
  const scoreColor = getScoreColor(score)
  const scoreLabel = getScoreLabel(score)
  
  // Get missing role categories
  const getMissingCategories = () => {
    const roleCategories = {
      'Technical': ['Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Mobile Developer'],
      'Design': ['Designer', 'UI/UX Designer'],
      'Business': ['Product Manager', 'Growth Lead'],
      'Legal': ['Legal Consultant', 'Lawyer'],
      'Research': ['User Researcher'],
      'Content': ['Content Strategist', 'Writer']
    }
    
    const categoriesPresent = new Set()
    team.forEach(member => {
      for (const [category, roles] of Object.entries(roleCategories)) {
        if (roles.includes(member.role)) {
          categoriesPresent.add(category)
        }
      }
    })
    
    return Object.keys(roleCategories).filter(cat => !categoriesPresent.has(cat))
  }
  
  const missingCategories = getMissingCategories()
  
  return (
    <div className="glass-effect rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="text-neon-green" size={24} />
          Team Synergy Meter
        </h3>
        <div className={`px-3 py-1 bg-${scoreColor}/10 text-${scoreColor} border border-${scoreColor}/30 rounded-full text-sm font-semibold`}>
          {scoreLabel}
        </div>
      </div>
      
      {/* Score Display */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-2">
          <span className="text-4xl font-bold">{score}%</span>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Users size={16} />
            <span>{team.length} member{team.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-dark-lighter rounded-full overflow-hidden">
          <div 
            className={`absolute top-0 left-0 h-full bg-gradient-to-r from-${scoreColor} to-neon-blue transition-all duration-500 rounded-full`}
            style={{ width: `${score}%` }}
          >
            <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
          </div>
        </div>
      </div>
      
      {/* Insight */}
      <div className="space-y-3">
        <div className="p-3 bg-dark-lighter rounded-lg border border-gray-800">
          <p className="text-sm text-gray-300 mb-2">
            <Award className="inline mr-2 text-neon-blue" size={16} />
            <span className="font-semibold">Team Health:</span>
          </p>
          <p className="text-xs text-gray-400">
            {score >= 80 && "Outstanding! Your team has excellent role diversity. You're well-positioned to tackle all aspects of startup building."}
            {score >= 60 && score < 80 && "Good diversity! Consider adding specialists in missing areas to reach peak performance."}
            {score >= 40 && score < 60 && "Growing team! Add members from different disciplines to strengthen your startup foundation."}
            {score < 40 && "Building phase. Diverse teams with complementary skills are 35% more likely to secure funding and deliver successful products."}
          </p>
        </div>
        
        {missingCategories.length > 0 && (
          <div className="p-3 bg-neon-purple/5 rounded-lg border border-neon-purple/20">
            <p className="text-sm text-neon-purple font-semibold mb-2">💡 Boost Your Score</p>
            <p className="text-xs text-gray-400 mb-2">Consider adding roles from these areas:</p>
            <div className="flex flex-wrap gap-2">
              {missingCategories.map(cat => (
                <span key={cat} className="px-2 py-1 bg-dark-lighter text-xs text-gray-300 rounded border border-gray-700">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SynergyMeter
