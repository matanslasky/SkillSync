import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Check, ArrowRight, ArrowLeft, User, Briefcase, Link as LinkIcon, Award } from 'lucide-react'
import { updateUser } from '../services/firestoreService'
import { useAuth } from '../contexts/AuthContext'

const ProfileCompletionWizard = ({ onComplete, onSkip }) => {
  const { user, updateUserProfile } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    bio: '',
    role: '',
    skills: [],
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: ''
  })
  const [skillInput, setSkillInput] = useState('')
  const [saving, setSaving] = useState(false)

  const totalSteps = 4

  const roles = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'UI/UX Designer',
    'Product Manager',
    'DevOps Engineer',
    'Data Scientist',
    'Mobile Developer',
    'Other'
  ]

  const handleAddSkill = () => {
    if (skillInput.trim() && formData.skills.length < 10) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      })
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (index) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index)
    })
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setSaving(true)
    try {
      await updateUser(user.uid, {
        ...formData,
        profileCompleted: true,
        profileCompleteness: calculateCompleteness()
      })
      
      await updateUserProfile({
        ...user,
        ...formData,
        profileCompleted: true
      })

      onComplete?.()
      navigate('/dashboard')
    } catch (error) {
      console.error('Error completing profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const calculateCompleteness = () => {
    let score = 20 // Base score for having an account
    if (formData.bio) score += 20
    if (formData.role) score += 15
    if (formData.skills.length > 0) score += 20
    if (formData.githubUrl || formData.linkedinUrl) score += 15
    if (formData.portfolioUrl) score += 10
    return Math.min(score, 100)
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.bio.length >= 20
      case 2:
        return formData.role !== ''
      case 3:
        return formData.skills.length >= 1
      case 4:
        return true // Social links are optional
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-neon-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="text-neon-blue" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Tell us about yourself</h3>
              <p className="text-gray-400">Help your future teammates get to know you</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="I'm a passionate developer who loves building innovative solutions..."
                className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none resize-none h-32"
                maxLength={300}
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.bio.length}/300 characters (minimum 20)
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-neon-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="text-neon-purple" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">What's your role?</h3>
              <p className="text-gray-400">This helps us match you with relevant projects</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {roles.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData({ ...formData, role })}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.role === role
                      ? 'border-neon-green bg-neon-green/10 text-neon-green'
                      : 'border-gray-800 bg-dark-lighter text-gray-300 hover:border-gray-700'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-neon-green" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Add your skills</h3>
              <p className="text-gray-400">What technologies and tools do you work with?</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Skills</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddSkill()
                    }
                  }}
                  placeholder="e.g., React, Python, Figma"
                  className="flex-1 bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-6 py-3 bg-neon-green text-dark font-semibold rounded-lg hover:shadow-neon-green transition-all"
                >
                  Add
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Press Enter or click Add (max 10 skills)
              </div>
            </div>

            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded-full text-sm flex items-center gap-2"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(index)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-neon-pink/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <LinkIcon className="text-neon-pink" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Connect your profiles</h3>
              <p className="text-gray-400">Optional: Link your professional profiles</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">GitHub Profile</label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/yourusername"
                className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">LinkedIn Profile</label>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/yourusername"
                className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Portfolio Website</label>
              <input
                type="url"
                value={formData.portfolioUrl}
                onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                placeholder="https://yourportfolio.com"
                className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-xl p-8 max-w-2xl w-full border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">Complete Your Profile</h2>
            <p className="text-sm text-gray-500 mt-1">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-white transition-all"
          >
            Skip for now
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-all ${
                  index < currentStep
                    ? 'bg-neon-green'
                    : index === currentStep - 1
                    ? 'bg-neon-green/50'
                    : 'bg-gray-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-dark-lighter border border-gray-800 text-white rounded-lg hover:border-gray-700 transition-all font-semibold flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          )}
          <div className="flex-1"></div>
          <button
            onClick={handleNext}
            disabled={!isStepValid() || saving}
            className="px-6 py-3 bg-neon-green text-dark font-semibold rounded-lg hover:shadow-neon-green transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === totalSteps ? (
              saving ? (
                'Saving...'
              ) : (
                <>
                  <Check size={18} />
                  Complete
                </>
              )
            ) : (
              <>
                Next
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileCompletionWizard
