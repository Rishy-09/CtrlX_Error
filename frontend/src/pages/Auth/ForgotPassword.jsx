import React, { useState, useEffect } from "react";
import AuthLayout from "../../components/layouts/AuthLayout.jsx";
import { Link } from "react-router-dom";
import Input from "../../components/Inputs/Input.jsx";
import { validateEmail } from "../../utils/helper.js";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import { toast } from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [activeTokens, setActiveTokens] = useState([]);
  const [showDevTools, setShowDevTools] = useState(false);
  
  // Check for active tokens in development mode
  const checkActiveTokens = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/dev/reset-tokens');
      if (response.data.activeTokens) {
        setActiveTokens(response.data.activeTokens);
      }
    } catch (error) {
      console.log('Dev endpoint not available or error:', error);
    }
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDebugInfo(null);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.FORGOT_PASSWORD, { email });
      setEmailSent(true);
      
      // Check if we have debug info (for development environments)
      if (response.data.resetUrl || response.data.resetToken) {
        setDebugInfo(response.data);
        console.log("Debug info:", response.data);
        
        // Refresh active tokens list if in dev mode
        setTimeout(() => {
          checkActiveTokens();
        }, 1000);
      }
      
      toast.success("Password reset instructions sent to your email");
    } catch (error) {
      console.error("Forgot password error:", error);
      
      // Handle different error scenarios
      if (!error.response) {
        // Network error
        setError("Unable to connect to the server. Please check your internet connection.");
      } else if (error.response.status === 500) {
        // Server error
        setError("Our server is experiencing issues. Please try again later.");
      } else if (error.response.data && error.response.data.message) {
        // API error with message
        setError(error.response.data.message);
      } else {
        // Generic error
        setError("An error occurred while processing your request. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle dev tools visibility
  const toggleDevTools = () => {
    setShowDevTools(!showDevTools);
    if (!showDevTools) {
      checkActiveTokens();
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">Forgot Password</h3>
          <button 
            onClick={toggleDevTools}
            className="text-xs text-gray-500 hover:text-gray-700"
            title="Toggle developer tools"
          >
            {showDevTools ? "Hide Dev Tools" : "Dev Tools"}
          </button>
        </div>
        <p className="text-sm text-slate-500 mt-[5px] mb-6">
          Enter your email address and we'll send you instructions to reset your password
        </p>

        {showDevTools && (
          <div className="mb-6 p-3 bg-gray-100 border border-gray-300 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700">Developer Tools</h4>
              <button 
                onClick={checkActiveTokens}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
              >
                Refresh Tokens
              </button>
            </div>
            
            {activeTokens.length > 0 ? (
              <div>
                <p className="text-xs text-gray-600 mb-2">Active reset tokens ({activeTokens.length}):</p>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {activeTokens.map((token, index) => (
                    <div key={index} className="p-2 bg-white rounded border border-gray-200 text-xs">
                      <p className="font-medium">{token.email}</p>
                      <p className="text-gray-500">Expires: {token.expiresIn}</p>
                      <a 
                        href={token.resetUrl}
                        className="text-blue-500 hover:underline block mt-1 break-all"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Use this token →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-600">No active reset tokens found.</p>
            )}
          </div>
        )}

        {emailSent ? (
          <div className="bg-green-50 border border-green-100 rounded-md p-4 mb-4">
            <h4 className="text-green-600 font-medium mb-2">Email Sent</h4>
            <p className="text-sm mb-3">
              Please check your email for password reset instructions. The link will expire in 1 hour.
            </p>
            <Link to="/login" className="text-blue-600 text-sm hover:underline">
              Return to Login
            </Link>
            
            {/* Display debug info in development environments */}
            {debugInfo && (
              <div className="mt-4 p-3 bg-gray-100 rounded border border-gray-300">
                <p className="text-xs font-medium text-gray-800 mb-1">Debug Information:</p>
                {debugInfo.note && (
                  <p className="text-xs text-gray-600 mb-1">{debugInfo.note}</p>
                )}
                
                {debugInfo.resetUrl && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-700 mt-2">Development Mode - Quick Reset:</p>
                    <p className="text-xs text-gray-600 mb-1">
                      Since email is not configured, you can use this direct link to reset the password:
                    </p>
                    <a 
                      href={debugInfo.resetUrl} 
                      className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md inline-block mt-1"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Reset Password Directly
                    </a>
                  </div>
                )}
                
                {debugInfo.resetToken && (
                  <p className="text-xs text-gray-600">
                    Token: <span className="font-mono">{debugInfo.resetToken.substring(0, 16)}...</span>
                  </p>
                )}

                {/* Developer guidance */}
                {!debugInfo.success && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-red-600">For Developers:</p>
                    <p className="text-xs text-gray-600">
                      Email sending failed. To fix this, configure email settings in your backend environment:
                    </p>
                    <ol className="text-xs text-gray-600 pl-5 mt-1 list-decimal">
                      <li>Create a <span className="font-mono">.env</span> file in your backend directory</li>
                      <li>Add the following variables:
                        <pre className="text-xs bg-gray-700 text-white p-2 mt-1 rounded overflow-x-auto">
{`EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=no-reply@taskmanagement.com`}
                        </pre>
                      </li>
                      <li>For Gmail, generate an App Password: 
                        <a 
                          href="https://support.google.com/accounts/answer/185833" 
                          className="text-blue-600 ml-1"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Learn how
                        </a>
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Email Address"
              placeholder="example@gmail.com"
              type="email"
              autoComplete="email"
              required
            />

            {error && <p className="text-red-500 text-xs pb-2.5 mt-2">{error}</p>}

            <button 
              type="submit" 
              className={`btn-primary w-full mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'SENDING...' : 'SEND RESET LINK'}
            </button>
            <p className="text-[13px] text-slate-800 mt-3">
              Remembered your password?{" "}
              <Link className="font-medium text-primary underline" to="/login">
                Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword; 