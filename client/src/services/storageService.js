import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../config/firebase'

// Upload profile picture
export const uploadProfilePicture = async (userId, file) => {
  try {
    // Create a reference to the file location
    const fileExtension = file.name.split('.').pop()
    const fileName = `profile_${userId}_${Date.now()}.${fileExtension}`
    const storageRef = ref(storage, `profile-pictures/${fileName}`)
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file)
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return { success: true, url: downloadURL, path: snapshot.ref.fullPath }
  } catch (error) {
    console.error('Error uploading profile picture:', error)
    throw error
  }
}

// Upload project image
export const uploadProjectImage = async (projectId, file) => {
  try {
    const fileExtension = file.name.split('.').pop()
    const fileName = `project_${projectId}_${Date.now()}.${fileExtension}`
    const storageRef = ref(storage, `project-images/${fileName}`)
    
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return { success: true, url: downloadURL, path: snapshot.ref.fullPath }
  } catch (error) {
    console.error('Error uploading project image:', error)
    throw error
  }
}

// Upload message attachment
export const uploadMessageAttachment = async (conversationId, file) => {
  try {
    const fileExtension = file.name.split('.').pop()
    const fileName = `${file.name}_${Date.now()}.${fileExtension}`
    const storageRef = ref(storage, `message-attachments/${conversationId}/${fileName}`)
    
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return { 
      success: true, 
      url: downloadURL, 
      path: snapshot.ref.fullPath,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    }
  } catch (error) {
    console.error('Error uploading attachment:', error)
    throw error
  }
}

// Upload deliverable file (for milestones)
export const uploadDeliverable = async (projectId, milestoneId, file) => {
  try {
    const fileExtension = file.name.split('.').pop()
    const fileName = `${file.name}_${Date.now()}.${fileExtension}`
    const storageRef = ref(storage, `deliverables/${projectId}/${milestoneId}/${fileName}`)
    
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return { 
      success: true, 
      url: downloadURL, 
      path: snapshot.ref.fullPath,
      fileName: file.name,
      fileType: file.type
    }
  } catch (error) {
    console.error('Error uploading deliverable:', error)
    throw error
  }
}

// Delete a file from storage
export const deleteFile = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath)
    await deleteObject(fileRef)
    return { success: true }
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}

// Validate file before upload
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  } = options
  
  const errors = []
  
  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${maxSize / 1024 / 1024}MB`)
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
