# Forgot Password Functionality Instructions

## Current Status
The forgot password functionality has been fixed and is now ready to use. The system is correctly:

1. Taking the user's email from the input form
2. Generating a reset token and reset URL
3. In development mode: showing the reset link in the debug section instead of sending an email
4. In production mode: sending an email to the user's email address with the reset link

## How to Test in Development Mode (Current Configuration)

1. The system is currently configured in development mode for easy testing
2. With this configuration, when you use the forgot password form:
   - The system will process the request normally
   - Instead of sending an actual email, it will show the reset link directly in the UI
   - You can click the link to reset your password
   - This works for any email you enter in the form

## How to Set Up Production Mode (For Real Email Sending)

When you're ready to use actual email sending:

1. Generate a Gmail App Password:
   - Go to your Google Account: https://myaccount.google.com
   - Enable 2-Step Verification if not already enabled
   - Go to Security → App passwords
   - Create a new app password for "Mail" with custom name "TaskManagement"
   - Copy the 16-character password (without spaces)

2. Edit the `.env` file in the backend directory:
   - Uncomment the EMAIL_PASSWORD line
   - Replace the password with your app password (without quotes)
   ```
   EMAIL_PASSWORD=your16characterapppassword
   ```
   - Change NODE_ENV to production:
   ```
   NODE_ENV=production
   ```

3. If you want to use your own Gmail account:
   - Update both EMAIL_USER and EMAIL_FROM values:
   ```
   EMAIL_USER=your_actual_gmail@gmail.com
   EMAIL_FROM=your_actual_gmail@gmail.com
   ```

4. Restart your backend server after making these changes

## Important Notes for Production

- The app password is specific to your Google account and should be kept secure
- Never commit the .env file with real credentials to version control
- Gmail has daily sending limits (normally around 500 emails per day)
- For high-volume production use, consider switching to a dedicated email service like SendGrid or Mailgun

## Troubleshooting

If you encounter issues:

1. Check the backend console logs for detailed error messages
2. Verify your app password is correctly formatted (no spaces, no quotes)
3. Make sure 2-Step Verification is enabled on your Google account
4. Try switching back to development mode to verify the reset token generation works
5. Check that your Gmail doesn't have additional security restrictions preventing app access 