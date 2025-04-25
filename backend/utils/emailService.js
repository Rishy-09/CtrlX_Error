import nodemailer from 'nodemailer';

// Default development transporter (outputs to console instead of sending)
let devTransport = {
  name: 'dev',
  version: '1.0.0',
  send: (mail, callback) => {
    const info = {
      messageId: 'MessageID@dev',
      envelope: mail.data.envelope || {
        from: mail.data.from,
        to: mail.data.to
      }
    };
    
    // Extract recipient information for better logging
    const recipient = typeof mail.data.to === 'string' 
      ? mail.data.to 
      : Array.isArray(mail.data.to) 
        ? mail.data.to.join(', ') 
        : 'Unknown recipient';
    
    console.log('\n====== DEV MODE EMAIL ======');
    console.log(`📧 Email would be sent in production mode`);
    console.log('----------------------------------------------------------');
    console.log(`From: ${mail.data.from}`);
    console.log(`To: ${recipient} ✅`);
    console.log(`Subject: ${mail.data.subject}`);
    console.log('Body (excerpt):');
    if (mail.data.html) {
      // Strip HTML tags and show first 150 chars
      const plainText = mail.data.html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
      console.log(plainText.substring(0, 150) + '...');
    } else if (mail.data.text) {
      console.log(mail.data.text.substring(0, 150) + '...');
    }
    console.log('----------------------------------------------------------');
    console.log('⚠️ To send real emails, configure EMAIL_USER and EMAIL_PASSWORD in .env file');
    console.log('===============================\n');
    
    callback(null, info);
  }
};

/**
 * Creates and configures a nodemailer transporter
 * Falls back to console output if email credentials are not configured
 */
const createTransporter = () => {
  // Check if email configuration exists
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    // Real email transport
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else {
    // Development transport that just logs to console
    console.log('Email configuration missing - emails will be logged to console only');
    return nodemailer.createTransport(devTransport);
  }
};

/**
 * Send an email with proper error handling and fallbacks
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} [options.text] - Plain text alternative
 * @param {string} [options.from] - Sender email (uses default if not provided)
 * @returns {Promise<Object>} - Sending result 
 */
export const sendEmail = async (options) => {
  try {
    // Validate recipient email
    if (!options.to) {
      console.error('Email sending error: No recipient (to) specified');
      return { success: false, error: 'No recipient specified' };
    }
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: options.from || process.env.EMAIL_FROM || 'no-reply@taskmanagement.com',
      to: options.to, // Ensure this comes from the options parameter
      subject: options.subject || 'No Subject',
      html: options.html || '',
      text: options.text || ''
    };
    
    // Log recipient in development mode
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Attempting to send email to: ${mailOptions.to}`);
    }
    
    const info = await transporter.sendMail(mailOptions);
    return { success: true, info };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
};

export default {
  sendEmail
}; 