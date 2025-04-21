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
  const [resetComplete, setResetComplete] = useState(false);
  
  const navigate = useNavigate();
  const { token } = useParams();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get("email");

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !email) {
        setTokenValid(false);
        setError("Invalid or missing reset token");
        return;
      }

      try {
        await axiosInstance.get(`${API_PATHS.AUTH.RESET_PASSWORD}/validate?token=${token}&email=${email}`);
        setTokenValid(true);
      } catch (error) {
        console.error("Token validation error:", error);
        setTokenValid(false);
        setError("This password reset link is invalid or has expired");
      }
    };

    validateToken();
  }, [token, email]);

  // Handle password reset form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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

    setError("");

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
      } else {
        setError("Something went wrong. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  // Show different states based on token validity and reset status
  const renderContent = () => {
    if (tokenValid === null) {
      return (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
          <div className="mt-4">
            <Link to="/forgot-password" className="btn-primary inline-block px-4 py-2 text-sm">
              Request a new reset link
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
          <Link to="/login" className="text-blue-600 text-sm hover:underline">
            Go to Login
          </Link>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit}>
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
          Enter your new password below
        </p>

        {renderContent()}
      </div>
    </AuthLayout>
  );
};

export default ResetPassword; 