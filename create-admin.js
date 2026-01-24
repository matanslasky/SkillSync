/**
 * Script to create the first admin user
 * 
 * Usage:
 * 1. First, register a new user through the app at http://localhost:5173/register
 * 2. Copy the user's email address
 * 3. Run this script: node create-admin.js <user-email>
 * 
 * Example: node create-admin.js admin@skillsync.com
 */

import admin from 'firebase-admin'
import { readFileSync } from 'fs'

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
  readFileSync('./serviceAccountKey.json', 'utf8')
)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

async function makeAdmin(email) {
  try {
    // Find user by email
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get()

    if (usersSnapshot.empty) {
      console.error(`❌ No user found with email: ${email}`)
      console.log('\\nPlease register this user first at http://localhost:5173/register')
      process.exit(1)
    }

    const userDoc = usersSnapshot.docs[0]
    const userId = userDoc.id
    const userData = userDoc.data()

    // Update user role to Admin
    await db.collection('users').doc(userId).update({
      role: 'Admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    console.log('✅ Successfully granted admin role!')
    console.log(`\\nUser Details:`)
    console.log(`  Name: ${userData.name}`)
    console.log(`  Email: ${email}`)
    console.log(`  User ID: ${userId}`)
    console.log(`  Previous Role: ${userData.role}`)
    console.log(`  New Role: Admin`)
    console.log('\\nYou can now log in and access admin features!')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error making user admin:', error.message)
    process.exit(1)
  }
}

// Get email from command line arguments
const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide a user email address')
  console.log('\\nUsage: node create-admin.js <user-email>')
  console.log('Example: node create-admin.js admin@skillsync.com')
  console.log('\\nSteps:')
  console.log('1. Register a new user at http://localhost:5173/register')
  console.log('2. Run this script with that user\'s email')
  process.exit(1)
}

console.log(`\\nMaking ${email} an admin...\\n`)
makeAdmin(email)
