import { reportError } from './errorReporting';

// Ollama configuration
const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'llama3.2';

// Cache for AI responses (24 hour TTL)
const responseCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * AI Service using Google Gemini
 * Provides intelligent features for team matching, task suggestions, and sentiment analysis
 */

/**
 * Call Ollama API
 * @param {string} prompt - The prompt to send
 * @param {Object} config - Configuration options
 * @returns {Promise<string>} Response text
 */
const callOllama = async (prompt, config = {}) => {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: config.temperature || 0.7,
        top_k: config.topK || 40,
        top_p: config.topP || 0.95,
        num_predict: config.maxOutputTokens || 1024,
      },
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.response;
};

/**
 * Generate cache key for responses
 * @param {string} prompt - The prompt
 * @param {Object} context - Context data
 * @returns {string} Cache key
 */
const getCacheKey = (prompt, context) => {
  return `${prompt}_${JSON.stringify(context)}`;
};

/**
 * Get cached response or generate new one
 * @param {string} cacheKey - Cache key
 * @param {Function} generator - Function to generate response
 * @returns {Promise<any>} Cached or generated response
 */
const getCachedOrGenerate = async (cacheKey, generator) => {
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const data = await generator();
  responseCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
};

/**
 * Calculate team match score using AI
 * @param {Object} user - User profile
 * @param {Object} project - Project details
 * @returns {Promise<Object>} Match analysis with score and reasoning
 */
export const calculateTeamMatchScore = async (user, project) => {
  try {
    const cacheKey = getCacheKey('team-match', { userId: user.id, projectId: project.id });
    
    return await getCachedOrGenerate(cacheKey, async () => {
      const prompt = `You are an AI assistant specializing in team matching for collaborative projects.

User Profile:
- Role: ${user.role || 'Not specified'}
- Skills: ${user.skills?.join(', ') || 'Not specified'}
- Experience: ${user.bio || 'Not specified'}
- Interests: ${user.interests?.join(', ') || 'Various'}

Project Details:
- Title: ${project.title}
- Description: ${project.description}
- Required Skills: ${project.requiredSkills?.join(', ') || 'Not specified'}
- Team Size: ${project.teamMembers?.length || 0}/${project.maxTeamSize || 'unlimited'}
- Status: ${project.status}

Analyze the match between this user and project. Provide:
1. Match Score (0-100): How well the user fits this project
2. Key Strengths: 2-3 specific reasons why they're a good fit
3. Growth Opportunities: 1-2 areas where they can learn
4. Recommendation: A brief sentence on whether they should join

Return ONLY valid JSON in this exact format:
{
  "matchScore": number,
  "strengths": ["reason1", "reason2"],
  "growthAreas": ["area1"],
  "recommendation": "string",
  "confidence": number
}`;

      const text = await callOllama(prompt, { temperature: 0.5 });
      
      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }
      
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        matchScore: Math.min(100, Math.max(0, analysis.matchScore || 0)),
        strengths: analysis.strengths || [],
        growthAreas: analysis.growthAreas || [],
        recommendation: analysis.recommendation || '',
        confidence: Math.min(100, Math.max(0, analysis.confidence || 50)),
      };
    });
  } catch (error) {
    reportError(error, {
      service: 'aiService',
      operation: 'calculateTeamMatchScore',
      data: { userSkillsCount: userSkills?.length, projectSkillsCount: projectSkills?.length },
    });
    return {
      matchScore: 0,
      strengths: [],
      growthAreas: [],
      recommendation: 'Unable to analyze match at this time.',
      confidence: 0,
      error: error.message,
    };
  }
};

/**
 * Suggest optimal team member for a task using AI
 * @param {Object} task - Task details
 * @param {Array} teamMembers - Available team members
 * @returns {Promise<Object>} Assignment suggestion with reasoning
 */
export const suggestTaskAssignment = async (task, teamMembers) => {
  try {
    const cacheKey = getCacheKey('task-assignment', { 
      taskId: task.id, 
      teamIds: teamMembers.map(m => m.id).join(',') 
    });
    
    return await getCachedOrGenerate(cacheKey, async () => {
      const prompt = `You are an AI task assignment specialist. Suggest the best team member for this task.

Task Details:
- Title: ${task.title}
- Description: ${task.description || 'No description'}
- Priority: ${task.priority || 'medium'}
- Status: ${task.status}
- Required Skills: ${task.requiredSkills?.join(', ') || 'General'}

Available Team Members:
${teamMembers.map((member, idx) => `
${idx + 1}. ${member.displayName || member.email}
   - Role: ${member.role || 'Not specified'}
   - Skills: ${member.skills?.join(', ') || 'Not specified'}
   - Current Tasks: ${member.currentTaskCount || 0}
`).join('')}

Analyze and recommend the best person for this task. Return ONLY valid JSON:
{
  "recommendedMemberId": "string",
  "confidence": number,
  "reasoning": "string",
  "alternativeMemberId": "string",
  "estimatedCompletionTime": "string"
}`;

      const text = await callOllama(prompt, { temperature: 0.7 });
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }
      
      return JSON.parse(jsonMatch[0]);
    });
  } catch (error) {
    reportError(error, {
      service: 'aiService',
      operation: 'suggestTaskAssignment',
      data: { taskTitle: task?.title, teamSize: teamMembers?.length },
    });
    return {
      recommendedMemberId: null,
      confidence: 0,
      reasoning: 'Unable to analyze task assignment.',
      error: error.message,
    };
  }
};

/**
 * Analyze sentiment of team messages and interactions
 * @param {Array} messages - Recent messages
 * @returns {Promise<Object>} Sentiment analysis
 */
export const analyzeTeamSentiment = async (messages) => {
  try {
    if (!messages || messages.length === 0) {
      return {
        overallSentiment: 'neutral',
        score: 50,
        insights: ['Not enough data for sentiment analysis'],
        trends: [],
      };
    }

    const cacheKey = getCacheKey('sentiment', { 
      messageIds: messages.slice(0, 10).map(m => m.id).join(',') 
    });
    
    return await getCachedOrGenerate(cacheKey, async () => {
      const recentMessages = messages.slice(0, 20).map(m => 
        `[${m.timestamp}] ${m.senderName}: ${m.content}`
      ).join('\n');
      
      const prompt = `You are a team dynamics analyst. Analyze the sentiment of these team messages.

Recent Messages:
${recentMessages}

Analyze the overall team sentiment and dynamics. Return ONLY valid JSON:
{
  "overallSentiment": "positive|neutral|negative",
  "score": number (0-100, higher is more positive),
  "insights": ["insight1", "insight2"],
  "trends": ["trend1", "trend2"],
  "concerns": ["concern1"] or [],
  "strengths": ["strength1"]
}`;

      const text = await callOllama(prompt, { temperature: 0.3 });
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }
      
      return JSON.parse(jsonMatch[0]);
    });
  } catch (error) {
    reportError(error, {
      service: 'aiService',
      operation: 'analyzeTeamSentiment',
      data: { messageCount: messages?.length },
    });
    return {
      overallSentiment: 'neutral',
      score: 50,
      insights: ['Unable to analyze sentiment at this time'],
      trends: [],
      error: error.message,
    };
  }
};

/**
 * Generate AI-powered project suggestions based on user profile
 * @param {Object} user - User profile
 * @param {Array} availableProjects - List of available projects
 * @returns {Promise<Array>} Ranked project recommendations
 */
export const generateProjectRecommendations = async (user, availableProjects) => {
  try {
    if (!availableProjects || availableProjects.length === 0) {
      return [];
    }

    const cacheKey = getCacheKey('project-recs', { 
      userId: user.id,
      projectIds: availableProjects.slice(0, 10).map(p => p.id).join(',')
    });
    
    return await getCachedOrGenerate(cacheKey, async () => {
      // Calculate match scores for each project
      const scoredProjects = await Promise.all(
        availableProjects.slice(0, 10).map(async (project) => {
          const matchAnalysis = await calculateTeamMatchScore(user, project);
          return {
            ...project,
            aiMatchScore: matchAnalysis.matchScore,
            aiStrengths: matchAnalysis.strengths,
            aiGrowthAreas: matchAnalysis.growthAreas,
            aiRecommendation: matchAnalysis.recommendation,
          };
        })
      );

      // Sort by match score
      return scoredProjects.sort((a, b) => b.aiMatchScore - a.aiMatchScore);
    });
  } catch (error) {
    reportError(error, {
      service: 'aiService',
      operation: 'generateProjectRecommendations',
      data: { userSkillsCount: userSkills?.length, projectCount: availableProjects?.length },
    });
    return availableProjects; // Return original list on error
  }
};

/**
 * Generate natural language summary of project progress
 * @param {Object} project - Project with tasks and team data
 * @returns {Promise<string>} AI-generated summary
 */
export const generateProgressReport = async (project) => {
  try {
    const cacheKey = getCacheKey('progress-report', { 
      projectId: project.id,
      timestamp: new Date().toDateString() // Cache per day
    });
    
    return await getCachedOrGenerate(cacheKey, async () => {
      const completedTasks = project.tasks?.filter(t => t.status === 'completed').length || 0;
      const totalTasks = project.tasks?.length || 0;
      const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      const prompt = `Generate a brief, encouraging progress report for this project.

Project: ${project.title}
Progress: ${completedTasks}/${totalTasks} tasks completed (${progressPercent}%)
Team Size: ${project.teamMembers?.length || 0}
Status: ${project.status}
Recent Activity: ${project.lastActivity || 'No recent activity'}

Write 2-3 sentences summarizing progress, highlighting achievements, and providing motivation.
Be positive, specific, and actionable. Return only the summary text, no JSON.`;

      const text = await callOllama(prompt, { temperature: 0.6 });
      return text.trim();
    });
  } catch (error) {
    reportError(error, {
      service: 'aiService',
      operation: 'generateProgressReport',
      data: { projectId: project?.id, taskCount: project.tasks?.length },
    });
    return `Progress: ${project.tasks?.filter(t => t.status === 'completed').length || 0} of ${project.tasks?.length || 0} tasks completed.`;
  }
};

/**
 * Clear AI response cache (useful for testing or manual refresh)
 */
export const clearAICache = () => {
  responseCache.clear();
};

/**
 * Check if AI service is configured correctly
 * @returns {boolean} True if API key is configured
 */
export const isAIConfigured = () => {
  return !!import.meta.env.VITE_GEMINI_API_KEY && 
         import.meta.env.VITE_GEMINI_API_KEY !== 'your_gemini_api_key_here';
};

export default {
  calculateTeamMatchScore,
  suggestTaskAssignment,
  analyzeTeamSentiment,
  generateProjectRecommendations,
  generateProgressReport,
  clearAICache,
  isAIConfigured,
};
