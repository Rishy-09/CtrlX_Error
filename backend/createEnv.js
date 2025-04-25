import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to generate a random secret
const generateSecret = (length = 32) => {
  return randomBytes(length).toString('hex');
};

// Create .env file content
const createEnvContent = () => {
  return `# Server configuration
PORT=8000
NODE_ENV=development

# JWT configuration (Randomly generated - keep this secure!)
JWT_SECRET=${generateSecret(32)}

# Database configuration
MONGO_URI=mongodb://localhost:27017/taskmanagement

# Client URL
CLIENT_URL=http://localhost:5173

# Email configuration (Configure these to enable email sending)
# For Gmail, you'll need to use an App Password: https://support.google.com/accounts/answer/185833
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=no-reply@taskmanagement.com

# Admin configuration
ADMIN_INVITE_TOKEN=${generateSecret(16)}
`;
};

// Write the .env file
const writeEnvFile = () => {
  const envPath = path.join(__dirname, '.env');
  
  // Check if file already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️ .env file already exists. Creating .env.example instead.');
    const examplePath = path.join(__dirname, '.env.example');
    fs.writeFileSync(examplePath, createEnvContent());
    console.log(`✅ .env.example file created at: ${examplePath}`);
    return;
  }
  
  // Create new .env file
  fs.writeFileSync(envPath, createEnvContent());
  console.log(`✅ .env file created at: ${envPath}`);
  console.log('\nTo configure email sending:');
  console.log('1. Edit the .env file');
  console.log('2. Set EMAIL_USER to your Gmail address');
  console.log('3. Set EMAIL_PASSWORD to your app password (Not your regular password!)');
  console.log('4. Run the application or test email sending with: node testEmail.js your@email.com');
};

// Execute the function
writeEnvFile(); 