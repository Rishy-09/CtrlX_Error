import React, { useState } from "react";
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

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    setError("");

    try {
      await axiosInstance.post(API_PATHS.AUTH.FORGOT_PASSWORD, { email });
      setEmailSent(true);
      toast.success("Password reset instructions sent to your email");
    } catch (error) {
      console.error("Forgot password error:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify">
        <h3 className="text-xl font-semibold text-gray-800">Forgot Password</h3>
        <p className="text-sm text-slate-500 mt-[5px] mb-6">
          Enter your email address and we'll send you instructions to reset your password
        </p>

        {emailSent ? (
          <div className="bg-green-50 border border-green-100 rounded-md p-4 mb-4">
            <h4 className="text-green-600 font-medium mb-2">Email Sent</h4>
            <p className="text-sm mb-3">
              Please check your email for password reset instructions. The link will expire in 1 hour.
            </p>
            <Link to="/login" className="text-blue-600 text-sm hover:underline">
              Return to Login
            </Link>
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