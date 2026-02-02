import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { generateProjectRecommendations, isAIConfigured } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';

const AIRecommendationsCard = ({ projects = [] }) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const aiConfigured = isAIConfigured();

  useEffect(() => {
    if (aiConfigured && user && projects.length > 0) {
      loadRecommendations();
    }
  }, [user, projects.length, aiConfigured]);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const recs = await generateProjectRecommendations(user, projects);
      setRecommendations(recs.slice(0, 5)); // Top 5
    } catch (err) {
      setError('Unable to load AI recommendations');
      console.error('AI recommendations error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!aiConfigured) {
    return (
      <div className="bg-dark-light rounded-xl border border-gray-800 p-6 shadow-glass">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-500 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-gray-300 mb-1">AI Features Unavailable</h3>
            <p className="text-sm text-gray-500">
              Configure your Gemini API key to enable AI-powered recommendations.
            </p>
            <a 
              href="https://ai.google.dev/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-neon-blue text-sm hover:underline mt-2 inline-block"
            >
              Get API Key →
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-dark-light rounded-xl border border-gray-800 p-6 shadow-glass">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="text-neon-blue animate-pulse" size={24} />
          <h3 className="text-lg font-semibold text-white">AI Analyzing Projects...</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark-light rounded-xl border border-gray-800 p-6 shadow-glass">
        <div className="flex items-start gap-3 mb-3">
          <AlertCircle className="text-red-500 mt-1" size={20} />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-300 mb-1">Unable to Load Recommendations</h3>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        </div>
        <button
          onClick={loadRecommendations}
          className="flex items-center gap-2 text-neon-blue hover:text-neon-blue/80 text-sm"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  const displayedRecs = showAll ? recommendations : recommendations.slice(0, 3);

  return (
    <div className="bg-dark-light rounded-xl border border-gray-800 p-6 shadow-glass hover:shadow-neon-blue/20 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neon-blue/10 rounded-lg">
            <Sparkles className="text-neon-blue" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Recommendations</h3>
            <p className="text-sm text-gray-500">Projects matched to your skills</p>
          </div>
        </div>
        <button
          onClick={loadRecommendations}
          className="p-2 hover:bg-dark-lighter rounded-lg transition-colors"
          title="Refresh recommendations"
        >
          <RefreshCw size={18} className="text-gray-400 hover:text-neon-blue" />
        </button>
      </div>

      <div className="space-y-3">
        {displayedRecs.map((project, index) => (
          <div
            key={project.id}
            className="p-4 bg-dark-lighter rounded-lg border border-gray-800/50 hover:border-neon-blue/30 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-neon-green">
                    #{index + 1}
                  </span>
                  <h4 className="font-medium text-white group-hover:text-neon-blue transition-colors">
                    {project.title}
                  </h4>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {project.description}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1">
                  <TrendingUp size={14} className="text-neon-blue" />
                  <span className="text-sm font-semibold text-neon-blue">
                    {project.aiMatchScore || 0}%
                  </span>
                </div>
                <span className="text-xs text-gray-600">match</span>
              </div>
            </div>

            {project.aiStrengths && project.aiStrengths.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-800/50">
                <div className="flex items-start gap-2">
                  <Zap size={14} className="text-neon-green mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Why this fits:</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      {project.aiStrengths.slice(0, 2).map((strength, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-neon-green">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {project.aiRecommendation && (
              <div className="mt-2 text-xs text-gray-400 italic">
                "{project.aiRecommendation}"
              </div>
            )}
          </div>
        ))}
      </div>

      {recommendations.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full text-sm text-neon-blue hover:text-neon-blue/80 font-medium"
        >
          {showAll ? 'Show Less' : `Show ${recommendations.length - 3} More`}
        </button>
      )}

      <div className="mt-4 pt-4 border-t border-gray-800/50 flex items-center justify-between">
        <p className="text-xs text-gray-600">
          Powered by AI • Updated {new Date().toLocaleDateString()}
        </p>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Sparkles size={12} className="text-neon-blue" />
          <span>Gemini 1.5</span>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendationsCard;
