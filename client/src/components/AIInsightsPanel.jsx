import { useState, useEffect } from 'react';
import { Brain, Users, CheckCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { generateProgressReport, analyzeTeamSentiment } from '../services/aiService';

const AIInsightsPanel = ({ project, messages = [] }) => {
  const [insights, setInsights] = useState({
    progressReport: '',
    sentiment: null,
    loading: true,
  });

  useEffect(() => {
    if (project) {
      loadInsights();
    }
  }, [project?.id]);

  const loadInsights = async () => {
    setInsights(prev => ({ ...prev, loading: true }));
    
    try {
      const [report, sentimentData] = await Promise.all([
        generateProgressReport(project),
        messages.length > 0 ? analyzeTeamSentiment(messages) : Promise.resolve(null),
      ]);

      setInsights({
        progressReport: report,
        sentiment: sentimentData,
        loading: false,
      });
    } catch (error) {
      console.error('Error loading AI insights:', error);
      setInsights(prev => ({ ...prev, loading: false }));
    }
  };

  if (insights.loading) {
    return (
      <div className="bg-dark-light rounded-xl border border-gray-800 p-6 shadow-glass">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="text-neon-purple animate-pulse" size={24} />
          <h3 className="text-lg font-semibold text-white">AI Insights</h3>
        </div>
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-gray-800 rounded w-full"></div>
          <div className="h-4 bg-gray-800 rounded w-5/6"></div>
          <div className="h-4 bg-gray-800 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  const completedTasks = project.tasks?.filter(t => t.status === 'completed').length || 0;
  const totalTasks = project.tasks?.length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-neon-green';
      case 'negative': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="text-neon-green" size={20} />;
      case 'negative': return <AlertTriangle className="text-red-500" size={20} />;
      default: return <Clock className="text-yellow-500" size={20} />;
    }
  };

  return (
    <div className="bg-dark-light rounded-xl border border-gray-800 p-6 shadow-glass">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-neon-purple/10 rounded-lg">
          <Brain className="text-neon-purple" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">AI Insights</h3>
          <p className="text-sm text-gray-500">Powered by Gemini AI</p>
        </div>
      </div>

      {/* Progress Report */}
      {insights.progressReport && (
        <div className="mb-6 p-4 bg-dark-lighter rounded-lg border border-gray-800/50">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-neon-blue mt-1 flex-shrink-0" size={20} />
            <div className="flex-1">
              <h4 className="font-medium text-white mb-2">Progress Summary</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                {insights.progressReport}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-800/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-green">{progressPercent}%</div>
              <div className="text-xs text-gray-500 mt-1">Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-blue">{completedTasks}</div>
              <div className="text-xs text-gray-500 mt-1">Done</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">{totalTasks - completedTasks}</div>
              <div className="text-xs text-gray-500 mt-1">Remaining</div>
            </div>
          </div>
        </div>
      )}

      {/* Team Sentiment */}
      {insights.sentiment && (
        <div className="p-4 bg-dark-lighter rounded-lg border border-gray-800/50">
          <div className="flex items-start gap-3 mb-3">
            {getSentimentIcon(insights.sentiment.overallSentiment)}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">Team Sentiment</h4>
                <span className={`text-sm font-medium ${getSentimentColor(insights.sentiment.overallSentiment)}`}>
                  {insights.sentiment.overallSentiment?.toUpperCase()}
                </span>
              </div>
              
              {/* Sentiment Score Bar */}
              <div className="mb-3">
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      insights.sentiment.score >= 70 ? 'bg-neon-green' :
                      insights.sentiment.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${insights.sentiment.score}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-600">Negative</span>
                  <span className="text-xs text-gray-400">{insights.sentiment.score}/100</span>
                  <span className="text-xs text-gray-600">Positive</span>
                </div>
              </div>

              {/* Insights */}
              {insights.sentiment.insights && insights.sentiment.insights.length > 0 && (
                <div className="space-y-2">
                  {insights.sentiment.insights.slice(0, 3).map((insight, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
                      <span className="text-neon-blue">•</span>
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Concerns */}
              {insights.sentiment.concerns && insights.sentiment.concerns.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} className="text-yellow-500" />
                    <span className="text-xs font-medium text-yellow-500">Needs Attention</span>
                  </div>
                  {insights.sentiment.concerns.map((concern, i) => (
                    <div key={i} className="text-xs text-gray-400 ml-5">
                      • {concern}
                    </div>
                  ))}
                </div>
              )}

              {/* Strengths */}
              {insights.sentiment.strengths && insights.sentiment.strengths.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-neon-green" />
                    <span className="text-xs font-medium text-neon-green">Team Strengths</span>
                  </div>
                  {insights.sentiment.strengths.map((strength, i) => (
                    <div key={i} className="text-xs text-gray-400 ml-5">
                      • {strength}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!insights.progressReport && !insights.sentiment && (
        <div className="text-center py-8">
          <Users className="mx-auto text-gray-700 mb-3" size={48} />
          <p className="text-gray-500 text-sm">
            Not enough data for AI analysis yet.
            <br />
            Check back after more team activity.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-800/50 text-xs text-gray-600 text-center">
        AI analysis updates automatically • Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default AIInsightsPanel;
