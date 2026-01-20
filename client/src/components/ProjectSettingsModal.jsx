import { useState } from 'react'
import { Settings, Trash2, Save, X } from 'lucide-react'
import { updateProject, deleteProject } from '../services/firestoreService'

const ProjectSettingsModal = ({ project, onClose, onUpdate, onDelete }) => {
  const [formData, setFormData] = useState({
    name: project.name || '',
    description: project.description || '',
    category: project.category || 'Other',
    deadline: project.deadline || '',
    status: project.status || 'Active'
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const categories = ['Social Impact', 'EdTech', 'E-commerce', 'FinTech', 'HealthTech', 'AI/ML', 'Other']
  const statuses = ['Active', 'On Hold', 'Completed', 'Archived']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const updatedProject = await updateProject(project.id, formData)
      onUpdate(updatedProject)
      onClose()
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Failed to update project. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)

    try {
      await deleteProject(project.id)
      onDelete()
      onClose()
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-xl p-6 border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neon-blue/10 rounded-lg">
              <Settings className="text-neon-blue" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Project Settings</h3>
              <p className="text-sm text-gray-500">Manage your project details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {showDeleteConfirm ? (
          <div className="space-y-6">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <h4 className="text-lg font-bold text-red-400 mb-2">⚠️ Delete Project?</h4>
              <p className="text-gray-400 text-sm mb-4">
                This action cannot be undone. All project data, tasks, and milestones will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 bg-dark-lighter border border-gray-800 text-white rounded-lg hover:border-gray-700 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete Project'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Project Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none resize-none h-32"
                required
              />
            </div>

            {/* Category and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium mb-2">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full bg-dark-lighter border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none"
                required
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-all font-semibold flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Project
              </button>
              <div className="flex-1"></div>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-dark-lighter border border-gray-800 text-white rounded-lg hover:border-gray-700 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-neon-green text-dark rounded-lg hover:shadow-neon-green transition-all font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ProjectSettingsModal
