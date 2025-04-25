import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { validateEmail } from '../../utils/helper.js'
import AuthLayout from '../../components/layouts/AuthLayout.jsx'
import Input from '../../components/Inputs/Input.jsx'
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector.jsx"
import { API_PATHS } from '../../utils/apiPaths.js'
import { UserContext } from "../../context/userContext.jsx";
import uploadImage from '../../utils/uploadImage.js'
import axiosInstance from '../../utils/axiosInstance.js'
import { toast } from 'react-hot-toast'

const Signup = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("tester");
  const [adminInviteToken, setAdminInviteToken] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const { updateUser } = useContext(UserContext); // Get updateUser function from context
  const navigate = useNavigate();
  // Handle Signup Form Submit 
  const handleSignUp = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
        // Validation checks
        if (!fullName){
          setError("Please enter full name");
          setLoading(false);
          return;
        }

        if (!validateEmail(email)){
          setError("Please enter a valid email address");
          setLoading(false);
          return;
        }

        if (!password){
          setError("Please enter the password");
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }

        // Check for admin role with no invite token
        if (role === "admin" && !adminInviteToken) {
          setError("Admin invite token is required for admin role");
          setLoading(false);
          return;
        }

        setError("");

        // Upload image if present
        let profileImageURL = '';
        if (profilePic) {
          try {
            const imgUploadRes = await uploadImage(profilePic);
            profileImageURL = imgUploadRes.imageURL || "";
          } catch (uploadError) {
            console.error("Error uploading profile image:", uploadError);
            // Continue registration without profile image if upload fails
            toast.error("Failed to upload profile image, continuing without it");
          }
        }

        // Registration API Call
        const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
          name: fullName,
          email,
          password,
          profileImageURL,
          role,
          adminInviteToken: role === "admin" ? adminInviteToken : undefined,
        });

        const { token, role: userRole } = response.data;
        if (token) {
          localStorage.setItem("token", token); // Store token in local storage
          updateUser(response.data); // Update user context
          
          // Show success message
          toast.success('Account created successfully!');
          
          // Redirect based on role
          if (userRole === "admin") {
            navigate("/admin/dashboard");
          }
          else if (userRole === "developer" || userRole === "tester") {
            navigate("/user/dashboard");
          }
        }
      }
      catch (error) {
        console.error("Registration error:", error);
        if (error.response && error.response.data && error.response.data.message) {
          setError(error.response.data.message);
        }
        else {
          setError("Something went wrong. Please try again");
        }
      }
      finally {
        setLoading(false);
      }
  };
  

  return (
    <AuthLayout>
      <div className='lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center'>
        <h3 className='text-xl font-semibold text-gray-800'>Create an Account</h3>
        <p className='text-xs text-slate-700 mt-[5px] mb-6'>
          Join us today by entering your details below.
        </p>

        <form onSubmit={handleSignUp}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>

            <Input
              value={fullName}
              onChange={({target}) => setFullName(target.value)}
              label="Full Name"
              placeholder="John"
              type="text"
              autoComplete="name"
              required
            />

            <Input
              value={email}
              onChange={({target}) => setEmail(target.value)}
              label="Email Address"
              placeholder="example@gmail.com"
              type="email"
              autoComplete="username"
              required
            />

            <Input
              value={password}
              onChange={({target}) => setPassword(target.value)}
              label="Password"
              placeholder="Min 6 characters"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
            />

            <div className="flex flex-col">
              <label className="text-sm text-slate-700 mb-1">Role</label>
              <select
                value={role}
                onChange={({target}) => setRole(target.value)}
                className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="tester">Tester</option>
                <option value="developer">Developer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {role === "admin" && (
              <div className="md:col-span-2">
                <Input
                  value={adminInviteToken}
                  onChange={({target}) => setAdminInviteToken(target.value)}
                  label="Admin Invite Token (Required for Admin)"
                  placeholder="Enter 6-digit invite code"
                  type="text"
                  required={role === "admin"}
                />
              </div>
            )}
          </div>
          {error && <p className='text-red-500 text-xs pb-2.5 mt-2'>{error}</p>}

          <button 
            type="submit" 
            className={`btn-primary w-full mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
          </button>
          <p className="text-[13px] text-slate-800 mt-3">
            Already have an account?{" "}
            <Link className="font-medium text-primary underline" to="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}

export default Signup