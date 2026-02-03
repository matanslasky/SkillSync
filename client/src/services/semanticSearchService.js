import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';
import { reportError } from './errorReporting';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

/**
 * Semantic Search Service using Gemini AI
 * Enables natural language search across projects, tasks, and team members
 */

/**
 * Search projects using natural language
 * @param {string} query - Natural language search query
 * @param {Array} projects - Array of projects to search
 * @returns {Promise<Array>} Ranked search results
 */
export const semanticProjectSearch = async (query, projects) => {
  try {
    if (!query || projects.length === 0) {
      return projects;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create a simplified representation of projects for AI
    const projectSummaries = projects.map(p => ({
      id: p.id,
      title: p.title || p.name,
      description: p.description || '',
      category: p.category || '',
      skills: p.requiredSkills?.join(', ') || p.skills?.join(', ') || '',
      status: p.status || '',
    }));

    const prompt = `You are a smart search assistant. Analyze this natural language search query and rank these projects by relevance.

Search Query: "${query}"

Projects:
${projectSummaries.map((p, idx) => `
${idx + 1}. ${p.title}
   Description: ${p.description}
   Category: ${p.category}
   Skills: ${p.skills}
   Status: ${p.status}
`).join('')}

Instructions:
1. Understand the user's intent (looking for specific skills, category, type of project, etc.)
2. Rank projects from most to least relevant (1 = most relevant)
3. Consider semantic meaning, not just keyword matching
4. Return ONLY a JSON array of project IDs in ranked order

Example: ["proj-123", "proj-456", "proj-789"]

Return the JSON array:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      logger.warn('Could not parse AI response, returning original order');
      return projects;
    }

    const rankedIds = JSON.parse(jsonMatch[0]);

    // Reorder projects based on AI ranking
    const rankedProjects = [];
    const projectMap = new Map(projects.map(p => [p.id, p]));

    for (const id of rankedIds) {
      const project = projectMap.get(id);
      if (project) {
        rankedProjects.push(project);
        projectMap.delete(id);
      }
    }

    // Add any remaining projects that weren't ranked
    for (const project of projectMap.values()) {
      rankedProjects.push(project);
    }

    return rankedProjects;
  } catch (error) {
    console.error('Semantic search error:', error);
    // Fallback to simple text search
    return simpleTextSearch(query, projects);
  }
};

/**
 * Fallback simple text search
 * @param {string} query - Search query
 * @param {Array} projects - Projects to search
 * @returns {Array} Filtered projects
 */
const simpleTextSearch = (query, projects) => {
  const lowerQuery = query.toLowerCase();
  return projects.filter(p => {
    const searchableText = `${p.title || p.name} ${p.description} ${p.category} ${(p.requiredSkills || p.skills || []).join(' ')}`.toLowerCase();
    return searchableText.includes(lowerQuery);
  });
};

/**
 * Generate search suggestions based on partial input
 * @param {string} partial - Partial search input
 * @param {Array} projects - Available projects
 * @returns {Promise<Array>} Search suggestions
 */
export const generateSearchSuggestions = async (partial, projects) => {
  try {
    if (!partial || partial.length < 2) {
      return [];
    }

    // Simple keyword extraction from existing projects
    const categories = [...new Set(projects.map(p => p.category).filter(Boolean))];
    const skills = [...new Set(projects.flatMap(p => p.requiredSkills || p.skills || []))];
    const titles = projects.map(p => p.title || p.name);

    const allKeywords = [...categories, ...skills.slice(0, 20), ...titles];
    
    const lowerPartial = partial.toLowerCase();
    const suggestions = allKeywords
      .filter(keyword => keyword && keyword.toLowerCase().includes(lowerPartial))
      .slice(0, 5);

    return suggestions;
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
};

/**
 * Extract intent from natural language query
 * @param {string} query - Natural language query
 * @returns {Promise<Object>} Extracted filters and intent
 */
export const extractSearchIntent = async (query) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { temperature: 0.3 }
    });

    const prompt = `Extract search filters from this natural language query.

Query: "${query}"

Extract:
- category (if mentioned: Social Impact, EdTech, E-commerce, FinTech, HealthTech)
- skills (array of technical skills mentioned)
- status (if mentioned: planning, in-progress, completed)
- urgency (if deadlines or urgency mentioned: urgent, soon, flexible)

Return ONLY valid JSON:
{
  "category": "string or null",
  "skills": ["skill1", "skill2"],
  "status": "string or null",
  "urgency": "string or null",
  "intent": "brief description of what user is looking for"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { intent: query };
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error extracting intent:', error);
    return { intent: query };
  }
};

export default {
  semanticProjectSearch,
  generateSearchSuggestions,
  extractSearchIntent,
};
