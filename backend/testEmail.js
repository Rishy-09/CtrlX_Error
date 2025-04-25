import dotenv from 'dotenv';
import { sendEmail } from './utils/emailService.js';

// Load environment variables
dotenv.config();

/**
 * Test email sending functionality
 */
async function testEmailSending() {
  console.log('\n======= EMAIL SENDING TEST =======');
  
  // Check configuration
  console.log('Email configuration:');
  console.log(`EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || 'Not configured (using default)'}`);
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM || 'Not configured (using default)'}`);
  
  // Ask for recipient email if not provided as argument
  const testEmail = process.argv[2] || 'test@example.com';
  
  console.log(`\nSending test email to: ${testEmail}`);
  
  // Prepare test email content
  const emailContent = {
    to: testEmail,
    subject: 'Test Email from Task Management System',
    html: `
      <h1>Email Test</h1>
      <p>This is a test email from the Task Management System.</p>
      <p>If you received this email, the email sending functionality is working correctly.</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
    `,
    text: `
      Email Test
      
      This is a test email from the Task Management System.
      If you received this email, the email sending functionality is working correctly.
      
      Timestamp: ${new Date().toISOString()}
    `
  };
  
  try {
    // Send the email
    const result = await sendEmail(emailContent);
    
    if (result.success) {
      console.log('\n✅ Test email sent successfully!');
      console.log('Email details:', result.info);
    } else {
      console.log('\n❌ Failed to send test email');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.error('\n❌ Error during email test:', error);
  }
  
  console.log('\n=================================');
}

// Run the test
testEmailSending(); 