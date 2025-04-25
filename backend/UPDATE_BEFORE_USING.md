# IMPORTANT: Update Your Email Configuration

To make the "Forgot Password" feature work properly, you need to replace the placeholder app password in the `.env` file with a real one:

## Steps to Set Up Gmail App Password:

1. Go to your Google Account: https://myaccount.google.com
2. Select "Security" from the left menu
3. Enable "2-Step Verification" if not already enabled
4. Once enabled, go back to the Security page and find "App passwords" 
   (usually under "Signing in to Google")
5. Create a new app password:
   - Select app: "Mail"
   - Select device: "Other (Custom name)" -> enter "TaskManagementSystem"
   - Click "Generate"
6. Copy the 16-character password that is displayed

## Update Your .env File:

1. Open the `.env` file in the backend directory
2. Find the line: `EMAIL_PASSWORD=your_app_password_here`
3. Replace `your_app_password_here` with the app password you generated
4. Save the file

## Test the Configuration:

After updating the app password in the `.env` file, restart your backend server and test the "Forgot Password" functionality. You should now receive reset password emails at the address you enter in the form.

You can also test the email sending functionality directly by running:

```
node testEmail.js your_test_email@example.com
```

## Using Your Own Email As Sender:

If you want to use your own Gmail account instead of `bugtracker.updates@gmail.com`:

1. In the `.env` file, change:
   - `EMAIL_USER=your_gmail_address@gmail.com`
   - `EMAIL_FROM=your_gmail_address@gmail.com`
2. Generate an app password for YOUR Gmail account
3. Update the `EMAIL_PASSWORD` value with your app password

## Important Security Notes:

- NEVER commit your app password to version control
- This configuration is only for development purposes
- For production, consider using a dedicated email service provider 