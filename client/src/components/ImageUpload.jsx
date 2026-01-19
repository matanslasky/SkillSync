import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

const ImageUpload = ({ currentImage, onImageSelect, onImageRemove, label = "Upload Image" }) => {
  const [preview, setPreview] = useState(currentImage || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')

    // Validate file
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

    if (file.size > maxSize) {
      setError('File size must be less than 5MB')
      return
    }

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Pass file to parent component
    if (onImageSelect) {
      onImageSelect(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (onImageRemove) {
      onImageRemove()
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-400">{label}</label>
      
      <div className="flex items-center gap-4">
        {/* Preview or Placeholder */}
        <div className="relative">
          {preview ? (
            <div className="w-24 h-24 rounded-full overflow-hidden bg-dark-lighter border-2 border-gray-800">
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-dark-lighter border-2 border-gray-800 flex items-center justify-center">
              <ImageIcon size={32} className="text-gray-600" />
            </div>
          )}
          
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-6 h-6 bg-neon-pink rounded-full flex items-center justify-center hover:bg-neon-pink/80 transition-colors"
            >
              <X size={14} className="text-white" />
            </button>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <button
            type="button"
            onClick={handleClick}
            disabled={uploading}
            className="px-4 py-2 bg-neon-green/10 text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/20 transition-all text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Upload size={16} />
            {uploading ? 'Uploading...' : 'Choose Image'}
          </button>
          
          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG, GIF or WebP. Max 5MB.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-neon-pink bg-neon-pink/10 border border-neon-pink/30 rounded-lg p-2">
          {error}
        </div>
      )}
    </div>
  )
}

export default ImageUpload
