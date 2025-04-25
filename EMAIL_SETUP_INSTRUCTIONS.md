# Email Configuration Instructions

## Issue Identified
The "Forgot Password" feature is not sending emails because the sender email configuration in the `.env` file is incomplete.

## How It's Supposed to Work
1. User enters their email address in the Forgot Password form
2. System generates a reset token and reset link
3. System sends an email to the user's email address using the configured **sender** email account
4. User receives the email and clicks the reset link

## Solution

Edit your `backend/.env` file to add the following **sender** email configuration variables:

```
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_gmail_address@gmail.com  # This is the SENDER email account
EMAIL_PASSWORD=your_app_password         # App password for the SENDER account
EMAIL_FROM=your_gmail_address@gmail.com  # Display name for the sender
```

The system takes the recipient's email (user's input) from the form field at runtime. The configuration above only sets up the email account that will be used to **send** the password reset emails.

## How to Get a Gmail App Password

1. Go to your Google Account settings at [myaccount.google.com](https://myaccount.google.com/)
2. Select "Security" from the left menu
3. Under "Signing in to Google", select "2-Step Verification" (if not already enabled, you'll need to enable it)
4. At the bottom of the page, select "App passwords"
5. Generate a new app password for "Mail" and your app name (e.g., "TaskManagementSystem")
6. Copy the generated 16-character password
7. Paste this password as the `EMAIL_PASSWORD` value in your `.env` file

## Additional Notes

- Do NOT use your regular Gmail password. Use only app passwords for security reasons.
- Make sure the sender email account you configure allows "Less secure app access" or uses app passwords.
- The `bugtracker.updates@gmail.com` address in your current `.env` file will only work if you have access to that account and set up an app password for it.
- You can use your own Gmail address as the sender by changing the `EMAIL_USER` and `EMAIL_FROM` values.

## Technical Details of How It Works

1. When a user enters their email in the forgot password form, the frontend sends it to the backend API
2. The backend finds the user with that email and generates a reset token
3. The backend uses the configured sender email (from .env) to send a message TO the user's email
4. The message contains a link with the token that allows the user to reset their password

## Testing the Email Configuration

After setting up the email configuration, restart your backend server and test the "Forgot Password" functionality again.

If you want to test email sending without going through the app, run:

```
cd backend
node testEmail.js your_test_email@example.com
```

This will send a test email TO the specified address FROM your configured sender email. 