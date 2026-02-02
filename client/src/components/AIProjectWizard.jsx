import { useState } from 'react';
import { X, Wand2, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { isAIConfigured } from '../services/aiService';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

const AIProjectWizard = ({ isOpen, onClose, onCreate }) => {
  const [step, setStep] = useState(1); // 1: Input, 2: Generated, 3: Review
  const [naturalInput, setNaturalInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedProject, setGeneratedProject] = useState(null);

  const aiConfigured = isAIConfigured();

  const generateProjectFromText = async () => {
    if (!naturalInput.trim()) return;

    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        generationConfig: { temperature: 0.7 }
      });

      const prompt = `You are a project planning assistant. Convert this natural language description into a structured project plan.

User's Description:
"${naturalInput}"

Generate a complete project structure with:
1. Clear, professional project title
2. Detailed description (2-3 sentences)
3. Appropriate category (Social Impact, EdTech, E-commerce, FinTech, or HealthTech)
4. Required skills (3-5 specific technical skills)
5. Suggested team roles (3-5 roles like Frontend Developer, Designer, etc.)
6. 5-7 initial tasks/milestones
7. Realistic timeline (in weeks)
8. Success metrics

Return ONLY valid JSON in this exact format:
{
  "title": "string",
  "description": "string",
  "category": "string",
  "requiredSkills": ["skill1", "skill2", "skill3"],
  "teamRoles": ["role1", "role2", "role3"],
  "tasks": [
    {"title": "task1", "description": "details", "priority": "high|medium|low"},
    {"title": "task2", "description": "details", "priority": "high|medium|low"}
  ],
  "timelineWeeks": number,
  "successMetrics": ["metric1", "metric2", "metric3"]
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse AI response');
      }

      const projectData = JSON.parse(jsonMatch[0]);
      setGeneratedProject(projectData);
      setStep(2);
    } catch (error) {
      console.error('Error generating project:', error);
      
      // More detailed error message
      let errorMessage = 'Failed to generate project. ';
      if (error.message?.includes('API key')) {
        errorMessage += 'Invalid API key. Please check your Gemini API key in .env file.';
      } else if (error.message?.includes('quota')) {
        errorMessage += 'API quota exceeded. Try again later.';
      } else if (error.message?.includes('parse')) {
        errorMessage += 'AI response format error. Try rephrasing your description.';
      } else {
        errorMessage += `Error: ${error.message || 'Unknown error'}. Please try again or create manually.`;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (generatedProject && onCreate) {
      onCreate(generatedProject);
      handleClose();
    }
  };

  const handleClose = () => {
    setStep(1);
    setNaturalInput('');
    setGeneratedProject(null);
    onClose();
  };

  if (!isOpen) return null;

  if (!aiConfigured) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-dark-light rounded-2xl max-w-md w-full p-6 border border-gray-800">
          <div className="text-center">
            <Wand2 className="mx-auto text-gray-600 mb-4" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">AI Features Unavailable</h3>
            <p className="text-gray-400 mb-4">
              Configure your Gemini API key to use AI-powered project creation.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-light rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-800 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-neon-purple/10 to-neon-blue/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neon-purple/20 rounded-lg">
                <Wand2 className="text-neon-purple" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Project Wizard</h2>
                <p className="text-sm text-gray-400">Describe your idea in plain English</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-dark-lighter rounded-lg transition-colors"
            >
              <X className="text-gray-400 hover:text-white" size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Describe your project idea
                </label>
                <textarea
                  value={naturalInput}
                  onChange={(e) => setNaturalInput(e.target.value)}
                  placeholder="Example: I want to build a mobile app that helps students find study groups near them. It should match people based on their courses and learning styles. We'll need a React Native developer, a designer, and someone for the backend..."
                  className="w-full h-48 px-4 py-3 bg-dark-lighter border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple resize-none"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Include details about features, team needs, timeline, and goals
                </p>
              </div>

              <div className="bg-neon-purple/5 border border-neon-purple/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="text-neon-purple flex-shrink-0 mt-1" size={20} />
                  <div className="text-sm text-gray-400">
                    <p className="font-medium text-white mb-1">AI will generate:</p>
                    <ul className="space-y-1">
                      <li>• Professional title and description</li>
                      <li>• Required skills and team roles</li>
                      <li>• Initial tasks and milestones</li>
                      <li>• Timeline and success metrics</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && generatedProject && (
            <div className="space-y-6">
              <div className="bg-neon-green/5 border border-neon-green/20 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="text-neon-green" size={24} />
                <div>
                  <p className="font-medium text-white">Project Generated!</p>
                  <p className="text-sm text-gray-400">Review and customize below</p>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Project Title</label>
                <input
                  type="text"
                  value={generatedProject.title}
                  onChange={(e) => setGeneratedProject({...generatedProject, title: e.target.value})}
                  className="w-full px-4 py-2 bg-dark-lighter border border-gray-800 rounded-lg text-white focus:outline-none focus:border-neon-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea
                  value={generatedProject.description}
                  onChange={(e) => setGeneratedProject({...generatedProject, description: e.target.value})}
                  className="w-full h-24 px-4 py-2 bg-dark-lighter border border-gray-800 rounded-lg text-white focus:outline-none focus:border-neon-blue resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                  <select
                    value={generatedProject.category}
                    onChange={(e) => setGeneratedProject({...generatedProject, category: e.target.value})}
                    className="w-full px-4 py-2 bg-dark-lighter border border-gray-800 rounded-lg text-white focus:outline-none focus:border-neon-blue"
                  >
                    <option value="Social Impact">Social Impact</option>
                    <option value="EdTech">EdTech</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="FinTech">FinTech</option>
                    <option value="HealthTech">HealthTech</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Timeline</label>
                  <div className="flex items-center gap-2 px-4 py-2 bg-dark-lighter border border-gray-800 rounded-lg">
                    <input
                      type="number"
                      value={generatedProject.timelineWeeks}
                      onChange={(e) => setGeneratedProject({...generatedProject, timelineWeeks: parseInt(e.target.value)})}
                      className="flex-1 bg-transparent text-white focus:outline-none"
                      min="1"
                    />
                    <span className="text-gray-400 text-sm">weeks</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Required Skills</label>
                <div className="flex flex-wrap gap-2">
                  {generatedProject.requiredSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-neon-blue/10 text-neon-blue border border-neon-blue/30 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Team Roles */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Team Roles</label>
                <div className="flex flex-wrap gap-2">
                  {generatedProject.teamRoles.map((role, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-neon-green/10 text-neon-green border border-neon-green/30 rounded-full text-sm"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tasks */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Initial Tasks ({generatedProject.tasks.length})</label>
                <div className="space-y-2">
                  {generatedProject.tasks.slice(0, 5).map((task, idx) => (
                    <div key={idx} className="p-3 bg-dark-lighter rounded-lg border border-gray-800">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-white text-sm">{task.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded ${
                          task.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                          task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-gray-500/10 text-gray-400'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Success Metrics */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Success Metrics</label>
                <ul className="space-y-1">
                  {generatedProject.successMetrics.map((metric, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                      <CheckCircle size={16} className="text-neon-green mt-0.5 flex-shrink-0" />
                      <span>{metric}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 bg-dark-lighter flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Sparkles size={14} className="text-neon-purple" />
            <span>Powered by Gemini AI</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>

            {step === 1 && (
              <button
                onClick={generateProjectFromText}
                disabled={loading || !naturalInput.trim()}
                className="px-6 py-2 bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 text-white rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 size={18} />
                    Generate Project
                  </>
                )}
              </button>
            )}

            {step === 2 && (
              <button
                onClick={handleCreate}
                className="px-6 py-2 bg-neon-green hover:bg-neon-green/80 text-dark rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <CheckCircle size={18} />
                Create Project
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIProjectWizard;
