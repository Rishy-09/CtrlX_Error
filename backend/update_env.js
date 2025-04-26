import fs from 'fs';
import path from 'path';

const updateEnvFile = () => {
  try {
    // Path to the .env file
    const envPath = path.resolve(process.cwd(), '.env');
    
    // Read the current .env content
    let envContent = fs.readFileSync(envPath, 'utf8');
    let updated = false;
    
    // Check if EMAIL_USER is missing
    if (!envContent.includes('EMAIL_USER=')) {
      console.log('EMAIL_USER is missing in .env file. Adding it now...');
      
      // Add EMAIL_USER after EMAIL_SERVICE
      envContent = envContent.replace(
        'EMAIL_SERVICE=gmail',
        'EMAIL_SERVICE=gmail\nEMAIL_USER=bugtracker.updates@gmail.com'
      );
      updated = true;
    }
    
    // Fix the EMAIL_PASSWORD format (remove quotes)
    if (envContent.includes('EMAIL_PASSWORD="')) {
      console.log('Fixing EMAIL_PASSWORD format (removing quotes)...');
      
      // Remove quotes from EMAIL_PASSWORD
      envContent = envContent.replace(
        /EMAIL_PASSWORD="(.+?)"/,
        'EMAIL_PASSWORD=$1'
      );
      updated = true;
    }
    
    // Save the updated content if changes were made
    if (updated) {
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Successfully updated .env file');
    } else {
      console.log('No changes needed in .env file');
    }
    
    // Show current configuration
    console.log('\nCurrent Email configuration in .env file:');
    const emailServiceMatch = envContent.match(/EMAIL_SERVICE=(.+)/);
    const emailUserMatch = envContent.match(/EMAIL_USER=(.+)/);
    const emailPasswordMatch = envContent.match(/EMAIL_PASSWORD=(.+)/);
    const emailFromMatch = envContent.match(/EMAIL_FROM=(.+)/);
    
    console.log(`EMAIL_SERVICE: ${emailServiceMatch ? emailServiceMatch[1] : 'Not configured'}`);
    console.log(`EMAIL_USER: ${emailUserMatch ? emailUserMatch[1] : 'Not configured'}`);
    console.log(`EMAIL_PASSWORD: ${emailPasswordMatch ? '✅ Configured (value hidden)' : 'Not configured'}`);
    console.log(`EMAIL_FROM: ${emailFromMatch ? emailFromMatch[1] : 'Not configured'}`);
    
    // Instructions for creating app-specific password
    console.log('\n===== IMPORTANT =====');
    console.log('Gmail requires an App Password for sending emails when 2FA is enabled.');
    console.log('To create an App Password:');
    console.log('1. Go to your Google Account settings: https://myaccount.google.com');
    console.log('2. Go to Security > 2-Step Verification');
    console.log('3. Scroll down to "App passwords" and create a new one');
    console.log('4. Select "Mail" and "Other" as the device, name it "TaskManagementSystem"');
    console.log('5. Copy the generated 16-character password');
    console.log('6. Replace the current EMAIL_PASSWORD value in your .env file with this app password (no quotes)');
    console.log('====================');
    
  } catch (error) {
    console.error('Error updating .env file:', error);
  }
};

// Run the update
updateEnvFile(); 