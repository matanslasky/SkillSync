const AIAssistantCard = ({ className = '' }) => {
  return (
    <div className={`glass-effect rounded-xl p-6 relative overflow-hidden ${className}`}>
      {/* Beta Badge */}
      <div className="absolute top-4 right-4">
        <span className="px-3 py-1 bg-neon-purple/20 text-neon-purple text-xs font-semibold rounded-full border border-neon-purple/30 pulse-glow">
          COMING SOON
        </span>
      </div>

      {/* Content */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-2xl">
            🤖
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Pivot Assistant</h3>
            <p className="text-xs text-gray-500">Beta Feature</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-400 mb-4">
          Get AI-powered recommendations when your project needs to pivot. Our smart assistant analyzes your progress, market trends, and team skills to suggest the best path forward.
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-neon-green text-lg">✓</span>
            <span className="text-xs text-gray-400">Market opportunity analysis</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-neon-green text-lg">✓</span>
            <span className="text-xs text-gray-400">Team skill optimization</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-neon-green text-lg">✓</span>
            <span className="text-xs text-gray-400">Pivot risk assessment</span>
          </div>
        </div>
      </div>

      {/* Disabled Button */}
      <button 
        disabled 
        className="w-full bg-gray-800 text-gray-500 font-semibold py-3 rounded-lg cursor-not-allowed opacity-50"
      >
        Join Waitlist
      </button>

      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 to-neon-blue/5 pointer-events-none"></div>
    </div>
  )
}

export default AIAssistantCard
