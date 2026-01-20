import { calculateOnTimeRate, calculateCompletionRate } from './taskService'
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'

/**
 * Calculate commitment score for a user
 * Formula: (OnTimeRate * 0.5) + (CompletionRate * 0.3) + (PeerReview * 0.2)
 * @param {string} userId - The user ID
 * @returns {Promise<number>} Commitment score (0-100)
 */
export const calculateCommitmentScore = async (userId) => {
  try {
    // Get task completion metrics
    const onTimeRate = await calculateOnTimeRate(userId)
    const completionRate = await calculateCompletionRate(userId)
    
    // Get peer review score
    const peerReviewScore = await getAveragePeerReview(userId)
    
    // Calculate weighted score
    const score = Math.round(
      (onTimeRate * 0.5) + 
      (completionRate * 0.3) + 
      (peerReviewScore * 0.2)
    )

    // Save score to history
    await saveScoreToHistory(userId, score, {
      onTimeRate,
      completionRate,
      peerReviewScore
    })

    // Update user's current score
    await updateUserScore(userId, score)

    return score
  } catch (error) {
    console.error('Error calculating commitment score:', error)
    return 50 // Default score
  }
}

/**
 * Get average peer review score
 * @param {string} userId - The user ID
 * @returns {Promise<number>} Average peer review score (0-100)
 */
export const getAveragePeerReview = async (userId) => {
  try {
    const q = query(
      collection(db, 'peerReviews'),
      where('reviewedUserId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(10) // Last 10 reviews
    )
    
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) return 75 // Default if no reviews

    const reviews = snapshot.docs.map(doc => doc.data())
    const average = reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length
    
    return Math.round(average)
  } catch (error) {
    console.error('Error fetching peer reviews:', error)
    return 75
  }
}

/**
 * Save commitment score to history
 * @param {string} userId - The user ID
 * @param {number} score - The score
 * @param {Object} breakdown - Score breakdown
 * @returns {Promise<void>}
 */
export const saveScoreToHistory = async (userId, score, breakdown) => {
  try {
    const historyRef = doc(collection(db, 'scoreHistory'))
    await setDoc(historyRef, {
      userId,
      score,
      breakdown,
      timestamp: Timestamp.now()
    })
  } catch (error) {
    console.error('Error saving score history:', error)
  }
}

/**
 * Update user's current commitment score
 * @param {string} userId - The user ID
 * @param {number} score - The new score
 * @returns {Promise<void>}
 */
export const updateUserScore = async (userId, score) => {
  try {
    const userRef = doc(db, 'users', userId)
    await setDoc(userRef, { commitmentScore: score }, { merge: true })
  } catch (error) {
    console.error('Error updating user score:', error)
  }
}

/**
 * Get score history for a user
 * @param {string} userId - The user ID
 * @param {number} limitCount - Number of history entries
 * @returns {Promise<Array>} Array of score history
 */
export const getScoreHistory = async (userId, limitCount = 30) => {
  try {
    const q = query(
      collection(db, 'scoreHistory'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).reverse() // Reverse for chronological order in chart
  } catch (error) {
    console.error('Error fetching score history:', error)
    return []
  }
}

/**
 * Submit a peer review
 * @param {Object} reviewData - Review data
 * @returns {Promise<string>} Review ID
 */
export const submitPeerReview = async (reviewData) => {
  const { reviewerId, reviewedUserId, projectId, score, comment } = reviewData
  
  try {
    // Check if review already exists
    const existingReview = await checkExistingReview(reviewerId, reviewedUserId, projectId)
    
    if (existingReview) {
      throw new Error('You have already reviewed this user for this project')
    }

    const reviewRef = doc(collection(db, 'peerReviews'))
    await setDoc(reviewRef, {
      reviewerId,
      reviewedUserId,
      projectId,
      score: Math.max(0, Math.min(100, score)), // Ensure 0-100
      comment: comment || '',
      createdAt: Timestamp.now()
    })

    // Recalculate reviewed user's commitment score
    await calculateCommitmentScore(reviewedUserId)

    return reviewRef.id
  } catch (error) {
    console.error('Error submitting peer review:', error)
    throw error
  }
}

/**
 * Check if a review already exists
 * @param {string} reviewerId - Reviewer user ID
 * @param {string} reviewedUserId - Reviewed user ID
 * @param {string} projectId - Project ID
 * @returns {Promise<boolean>} True if review exists
 */
export const checkExistingReview = async (reviewerId, reviewedUserId, projectId) => {
  try {
    const q = query(
      collection(db, 'peerReviews'),
      where('reviewerId', '==', reviewerId),
      where('reviewedUserId', '==', reviewedUserId),
      where('projectId', '==', projectId)
    )
    
    const snapshot = await getDocs(q)
    return !snapshot.empty
  } catch (error) {
    console.error('Error checking existing review:', error)
    return false
  }
}

/**
 * Get peer reviews for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of peer reviews
 */
export const getUserReviews = async (userId) => {
  try {
    const q = query(
      collection(db, 'peerReviews'),
      where('reviewedUserId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching user reviews:', error)
    return []
  }
}

/**
 * Get commitment score trend (up, down, stable)
 * @param {string} userId - The user ID
 * @returns {Promise<string>} Trend direction
 */
export const getScoreTrend = async (userId) => {
  try {
    const history = await getScoreHistory(userId, 7) // Last 7 entries
    
    if (history.length < 2) return 'stable'

    const recent = history.slice(-3)
    const older = history.slice(0, Math.min(3, history.length - 3))

    const recentAvg = recent.reduce((sum, h) => sum + h.score, 0) / recent.length
    const olderAvg = older.reduce((sum, h) => sum + h.score, 0) / older.length

    const diff = recentAvg - olderAvg

    if (diff > 5) return 'up'
    if (diff < -5) return 'down'
    return 'stable'
  } catch (error) {
    console.error('Error calculating score trend:', error)
    return 'stable'
  }
}
