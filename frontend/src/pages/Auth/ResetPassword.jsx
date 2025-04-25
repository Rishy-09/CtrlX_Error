import React, { useState, useEffect } from "react";
import AuthLayout from "../../components/layouts/AuthLayout.jsx";
import { useNavigate, Link, useParams, useLocation } from "react-router-dom";
import Input from "../../components/Inputs/Input.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import { toast } from "react-hot-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const [tokenValidating, setTokenValidating] = useState(true);
  const [resetComplete, setResetComplete] = useState(false);
  
  const navigate = useNavigate();
  const { token } = useParams();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get("email");

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      setTokenValidating(true);
      
      if (!token || !email) {
        setTokenValid(false);
        setError("Invalid or missing reset token and/or email");
        setTokenValidating(false);
        return;
      }

      try {
        await axiosInstance.get(`${API_PATHS.AUTH.RESET_PASSWORD}/validate?token=${token}&email=${email}`);
        setTokenValid(true);
        setTokenValidating(false);
      } catch (error) {
        console.error("Token validation error:", error);
        setTokenValid(false);
        
        // Provide specific error messages based on the error
        if (error.response && error.response.status === 400) {
          setError(error.response.data.message || "This password reset link is invalid or has expired");
        } else {
          setError("Unable to validate reset token. Please request a new reset link.");
        }
        
        setTokenValidating(false);
      }
    };

    validateToken();
  }, [token, email]);

  // Handle password reset form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.AUTH.RESET_PASSWORD, {
        token,
        email,
        password,
      });
      
      setResetComplete(true);
      toast.success("Password has been reset successfully");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Password reset error:", error);
      
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else if (error.message === 'Network Error') {
        setError("Network error. Please check your internet connection.");
      } else {
        setError("Something went wrong. Please try again or request a new reset link.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Show different states based on token validity and reset status
  const renderContent = () => {
    if (tokenValidating) {
      return (
        <div className="flex flex-col items-center justify-center py-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Validating reset token...</p>
        </div>
      );
    }

    if (tokenValid === false) {
      return (
        <div className="bg-red-50 border border-red-100 rounded-md p-4 mb-4">
          <h4 className="text-red-600 font-medium mb-2">Invalid Reset Link</h4>
          <p className="text-sm text-red-600 mb-3">
            {error || "This password reset link is invalid or has expired."}
          </p>
          
          <div className="mt-4 bg-gray-100 p-3 rounded-md border border-gray-300">
            <p className="text-xs font-medium text-gray-700">Debug Information:</p>
            <p className="text-xs text-gray-600 mb-1">
              Token: <span className="font-mono">{token ? token.substring(0, 12) + '...' : 'Missing'}</span>
            </p>
            <p className="text-xs text-gray-600">
              Email: <span className="font-mono">{email || 'Missing'}</span>
            </p>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Link to="/forgot-password" className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm text-center hover:bg-blue-600 transition-colors">
              Request a new reset link
            </Link>
            <Link to="/login" className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm text-center hover:bg-gray-100 transition-colors">
              Return to login
            </Link>
          </div>
        </div>
      );
    }

    if (resetComplete) {
      return (
        <div className="bg-green-50 border border-green-100 rounded-md p-4 mb-4">
          <h4 className="text-green-600 font-medium mb-2">Password Reset Complete</h4>
          <p className="text-sm text-green-600 mb-3">
            Your password has been successfully reset. You will be redirected to the login page shortly.
          </p>
          <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm inline-block hover:bg-blue-600 transition-colors">
            Go to Login
          </Link>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit}>
        <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-4">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Email:</span> {email}
          </p>
        </div>
        
        <Input
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          label="New Password"
          placeholder="Enter new password"
          type="password"
          autoComplete="new-password"
          required
        />
        <Input
          value={confirmPassword}
          onChange={({ target }) => setConfirmPassword(target.value)}
          label="Confirm Password"
          placeholder="Confirm your new password"
          type="password"
          autoComplete="new-password"
          required
        />

        {error && <p className="text-red-500 text-xs pb-2.5 mt-2">{error}</p>}

        <button 
          type="submit" 
          className={`btn-primary w-full mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'RESETTING...' : 'RESET PASSWORD'}
        </button>
        <p className="text-[13px] text-slate-800 mt-3">
          Remembered your password?{" "}
          <Link className="font-medium text-primary underline" to="/login">
            Login
          </Link>
        </p>
      </form>
    );
  };

  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify">
        <h3 className="text-xl font-semibold text-gray-800">Reset Password</h3>
        <p className="text-sm text-slate-500 mt-[5px] mb-6">
          {tokenValid ? "Enter your new password below" : "Validating your reset token..."}
        </p>

        {renderContent()}
      </div>
    </AuthLayout>
  );
};

export default ResetPassword; 