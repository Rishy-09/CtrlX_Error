import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Function to display current email configuration
const displayEmailConfig = () => {
  try {
    console.log('\n===== EMAIL CONFIGURATION STATUS =====');
    
    // Check .env file
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      console.log('✅ .env file exists');
      
      // Read the file content
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Check for each email configuration variable
      const hasEmailService = envContent.includes('EMAIL_SERVICE=');
      const hasEmailUser = envContent.includes('EMAIL_USER=');
      const hasEmailPassword = envContent.includes('EMAIL_PASSWORD=');
      const hasEmailFrom = envContent.includes('EMAIL_FROM=');
      
      console.log(`EMAIL_SERVICE: ${hasEmailService ? '✅ Defined in .env' : '❌ Missing in .env'}`);
      console.log(`EMAIL_USER: ${hasEmailUser ? '✅ Defined in .env' : '❌ Missing in .env'}`);
      console.log(`EMAIL_PASSWORD: ${hasEmailPassword ? '✅ Defined in .env' : '❌ Missing in .env'}`);
      console.log(`EMAIL_FROM: ${hasEmailFrom ? '✅ Defined in .env' : '❌ Missing in .env'}`);
      
      // Check for quotes in EMAIL_PASSWORD which can cause problems
      if (hasEmailPassword && envContent.includes('EMAIL_PASSWORD="')) {
        console.log('⚠️ WARNING: EMAIL_PASSWORD contains quotes which may cause authentication issues');
        console.log('   Fix: Remove the quotes around the password value in .env file');
      }
    } else {
      console.log('❌ .env file not found');
    }
    
    // Check environment variables actually loaded
    console.log('\nEnvironment variables loaded:');
    console.log(`EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || '❌ Not loaded'}`);
    console.log(`EMAIL_USER: ${process.env.EMAIL_USER || '❌ Not loaded'}`);
    console.log(`EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '✅ Loaded (value hidden)' : '❌ Not loaded'}`);
    console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM || '❌ Not loaded'}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'Not set (defaults to production)'}`);
    
    // Print instructions for Gmail app passwords
    console.log('\n===== GMAIL APP PASSWORD INSTRUCTIONS =====');
    console.log('Gmail requires an App Password when 2-Step Verification is enabled:');
    console.log('1. Go to your Google Account settings: https://myaccount.google.com');
    console.log('2. Go to Security > 2-Step Verification');
    console.log('3. Scroll down to "App passwords" and create a new one');
    console.log('4. Select "Mail" and "Other" as the device, name it "TaskManagementSystem"');
    console.log('5. Copy the generated 16-character password (without spaces)');
    console.log('6. Update your .env file with this password (no quotes):');
    console.log('   EMAIL_PASSWORD=your16charapppassword');
    console.log('\nNote: If emails still don\'t send after fixing the configuration,');
    console.log('check that the Gmail account allows "less secure apps" access');
    console.log('or that you\'re using a properly generated app password.');
    console.log('=======================================');
    
  } catch (error) {
    console.error('Error checking email configuration:', error);
  }
};

// Display email configuration
displayEmailConfig(); 