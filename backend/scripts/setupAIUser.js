import User from '../models/User.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Create AI user if it doesn't exist
const setupAIUser = async () => {
  try {
    await connectDB();
    
    // Check if AI user already exists
    const existingAIUser = await User.findOne({ 
      $or: [
        { isAI: true },
        { email: 'ai-assistant@example.com' }
      ]
    });
    
    if (existingAIUser) {
      console.log('AI user already exists:', existingAIUser.username || existingAIUser.name);
      
      // Ensure isAI flag is set
      if (!existingAIUser.isAI) {
        existingAIUser.isAI = true;
        await existingAIUser.save();
        console.log('Updated existing user with isAI flag');
      }
    } else {
      // Generate secure random password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(
        'AI-SYSTEM-' + Math.random().toString(36).substring(2, 15), 
        salt
      );
      
      // Create new AI user with valid email
      const aiUser = await User.create({
        name: 'AI Assistant',
        username: 'ai-assistant',
        email: 'ai-assistant@example.com', // Use a valid email format
        password: hashedPassword,
        isAI: true,
        role: 'admin' // Admin role to participate in all chats
      });
      
      console.log('AI user created successfully:', aiUser.username);
    }
    
    console.log('AI user setup complete');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up AI user:', error);
    process.exit(1);
  }
};

// Run the setup
setupAIUser(); 