import { useState } from 'react';
import { Brain, User, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { suggestTaskAssignment } from '../services/aiService';

const AITaskSuggestion = ({ task, teamMembers, onAssign }) => {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const loadSuggestion = async () => {
    if (suggestion) {
      setExpanded(!expanded);
      return;
    }

    setLoading(true);
    try {
      const result = await suggestTaskAssignment(task, teamMembers);
      setSuggestion(result);
      setExpanded(true);
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
    } finally {
      setLoading(false);
    }
  };

  const recommendedMember = suggestion?.recommendedMemberId 
    ? teamMembers.find(m => m.id === suggestion.recommendedMemberId)
    : null;

  const alternativeMember = suggestion?.alternativeMemberId
    ? teamMembers.find(m => m.id === suggestion.alternativeMemberId)
    : null;

  return (
    <div className="mt-4 border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={loadSuggestion}
        className="w-full flex items-center justify-between p-3 bg-dark-lighter hover:bg-dark-lighter/80 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain className="text-neon-purple" size={18} />
          <span className="text-sm font-medium text-white">AI Assignment Suggestion</span>
        </div>
        <span className="text-xs text-gray-500">
          {loading ? 'Analyzing...' : expanded ? 'Hide' : 'Show'}
        </span>
      </button>

      {expanded && !loading && suggestion && (
        <div className="p-4 bg-dark-light space-y-4">
          {/* Recommended Member */}
          {recommendedMember && (
            <div className="p-3 bg-neon-purple/5 border border-neon-purple/20 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-xs font-bold">
                    {recommendedMember.displayName?.[0] || recommendedMember.email?.[0] || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {recommendedMember.displayName || recommendedMember.email}
                    </p>
                    <p className="text-xs text-gray-500">{recommendedMember.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp size={14} className="text-neon-green" />
                  <span className="text-xs font-semibold text-neon-green">
                    {suggestion.confidence}% match
                  </span>
                </div>
              </div>

              {/* Reasoning */}
              <div className="mt-3 pt-3 border-t border-neon-purple/20">
                <p className="text-xs text-gray-400 leading-relaxed">
                  {suggestion.reasoning}
                </p>
              </div>

              {/* Estimated Time */}
              {suggestion.estimatedCompletionTime && (
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={12} />
                  <span>Est. completion: {suggestion.estimatedCompletionTime}</span>
                </div>
              )}

              {/* Assign Button */}
              {onAssign && (
                <button
                  onClick={() => onAssign(recommendedMember.id)}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-neon-purple hover:bg-neon-purple/80 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <CheckCircle size={16} />
                  Assign to {recommendedMember.displayName || recommendedMember.email}
                </button>
              )}
            </div>
          )}

          {/* Alternative Member */}
          {alternativeMember && (
            <div className="p-3 bg-dark-lighter rounded-lg border border-gray-800">
              <p className="text-xs text-gray-500 mb-2">Alternative option:</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold">
                    {alternativeMember.displayName?.[0] || alternativeMember.email?.[0] || '?'}
                  </div>
                  <span className="text-xs text-gray-400">
                    {alternativeMember.displayName || alternativeMember.email}
                  </span>
                </div>
                {onAssign && (
                  <button
                    onClick={() => onAssign(alternativeMember.id)}
                    className="text-xs text-neon-blue hover:text-neon-blue/80"
                  >
                    Assign
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Skills Match */}
          {recommendedMember?.skills && (
            <div className="pt-3 border-t border-gray-800">
              <p className="text-xs text-gray-500 mb-2">Relevant skills:</p>
              <div className="flex flex-wrap gap-1">
                {recommendedMember.skills.slice(0, 5).map((skill, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-1 bg-neon-purple/10 text-neon-purple text-xs rounded border border-neon-purple/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
            <p className="text-xs text-gray-600">
              AI-powered recommendation
            </p>
            <div className="flex items-center gap-1">
              <Brain size={12} className="text-neon-purple" />
              <span className="text-xs text-gray-600">Gemini AI</span>
            </div>
          </div>
        </div>
      )}

      {expanded && loading && (
        <div className="p-4 bg-dark-light">
          <div className="flex items-center gap-3">
            <Brain className="text-neon-purple animate-pulse" size={24} />
            <div className="flex-1">
              <div className="h-3 bg-gray-800 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-800 rounded animate-pulse w-2/3"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITaskSuggestion;
