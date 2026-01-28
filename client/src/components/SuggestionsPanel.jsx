import React, { useState, useEffect } from 'react';
import { Lightbulb, X, ChevronRight, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { getProjectSuggestions, getUserSuggestions } from '../services/suggestionService';

/**
 * AI Suggestions Panel
 * Displays intelligent, rule-based suggestions
 */
const SuggestionsPanel = ({ projectId, userId, type = 'project' }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(new Set());
  const [expanded, setExpanded] = useState(true);
  
  useEffect(() => {
    loadSuggestions();
  }, [projectId, userId, type]);
  
  const loadSuggestions = async () => {
    setLoading(true);
    try {
      let results = [];
      if (type === 'project' && projectId) {
        results = await getProjectSuggestions(projectId, userId);
      } else if (type === 'user' && userId) {
        results = await getUserSuggestions(userId);
      }
      setSuggestions(results);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const dismissSuggestion = (id) => {
    setDismissed(prev => new Set([...prev, id]));
  };
  
  const visibleSuggestions = suggestions.filter(s => !dismissed.has(s.id));
  
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }
  
  if (visibleSuggestions.length === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
              All Clear! 🎉
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              No suggestions at the moment. Your project is running smoothly!
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Smart Suggestions
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {visibleSuggestions.length} recommendation{visibleSuggestions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <ChevronRight 
          className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
        />
      </button>
      
      {/* Suggestions List */}
      {expanded && (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {visibleSuggestions.map((suggestion) => (
            <SuggestionCard 
              key={suggestion.id}
              suggestion={suggestion}
              onDismiss={() => dismissSuggestion(suggestion.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Individual Suggestion Card
 */
const SuggestionCard = ({ suggestion, onDismiss }) => {
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical':
        return <AlertCircle className="w-4 h-4" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <Info className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          icon: 'text-red-600 dark:text-red-400',
          text: 'text-red-900 dark:text-red-100',
          badge: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
        };
      case 'high':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          icon: 'text-orange-600 dark:text-orange-400',
          text: 'text-orange-900 dark:text-orange-100',
          badge: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'
        };
      case 'medium':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          icon: 'text-blue-600 dark:text-blue-400',
          text: 'text-blue-900 dark:text-blue-100',
          badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-700/50',
          border: 'border-gray-200 dark:border-gray-700',
          icon: 'text-gray-600 dark:text-gray-400',
          text: 'text-gray-900 dark:text-gray-100',
          badge: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        };
    }
  };
  
  const colors = getPriorityColor(suggestion.priority);
  
  return (
    <div className={`p-4 ${colors.bg} border-l-4 ${colors.border}`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 text-2xl mt-1">
          {suggestion.icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className={`font-semibold ${colors.text}`}>
              {suggestion.title}
            </h4>
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            {suggestion.description}
          </p>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Priority Badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
              {getPriorityIcon(suggestion.priority)}
              <span className="capitalize">{suggestion.priority}</span>
            </span>
            
            {/* Type Badge */}
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
              {suggestion.type}
            </span>
            
            {/* Action Button */}
            {suggestion.action && (
              <button className="ml-auto text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
                {suggestion.action}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionsPanel;
