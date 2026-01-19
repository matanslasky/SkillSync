import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`)
    console.log(`⚠️  The app will run but database features won't work.`)
    console.log(`   Install MongoDB or use MongoDB Atlas (free): https://www.mongodb.com/cloud/atlas`)
    // Don't exit - allow app to run without DB for development
  }
}

export default connectDB
