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

const Signup = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminInviteToken, setAdminInviteToken] = useState("");
  const [role, setRole] = useState("tester");
  const [showAdminTokenField, setShowAdminTokenField] = useState(false);

  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Handle role change
  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setShowAdminTokenField(selectedRole === "admin");
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    let profileImageUrl = '';
    if (!fullName){
      setError("Please enter full name");
      return;
    }
    if (!validateEmail(email)){
      setError("Please enter a valid email address");
      return;
    }
    if (!password ){
      setError("Please enter the password");
      return;
    }
    
    // Validate admin token if admin role is selected
    if (role === "admin" && !adminInviteToken.trim()) {
      setError("Admin invite token is required for admin registration");
      return;
    }

    setError("");

    try {
      if (profilePic) {
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || "";
      }

      const signupData = {
        name: fullName,
        email,
        password,
        profileImageURL: profileImageUrl,
        role,
      };

      // Add adminInviteToken if admin role is selected
      if (role === "admin") {
        signupData.adminInviteToken = adminInviteToken;
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, signupData);
      
      // Make sure we're properly handling the response data
      const userData = response.data;
      if (userData && userData.token) {
        // Update user context with the user data
        updateUser(userData);
        
        // Navigate based on role
        if (userData.role === "admin") {
          navigate("/admin/dashboard");
        } else if (userData.role === "tester") {
          navigate("/tester/dashboard");
        } else if (userData.role === "developer") {
          navigate("/developer/dashboard");
        }
      } else {
        setError("Invalid response from server. Missing token.");
      }
    }
    catch (error) {
      console.error("Signup Error:", error);
      
      if (error.response) {
        console.error("Error Response:", error.response.data);
        console.error("Status Code:", error.response.status);
        setError(error.response.data.message || "Server error: " + error.response.status);
      }
      else if (error.request) {
        console.error("No response received:", error.request);
        setError("No response from server. Please check your connection.");
      }
      else {
        console.error("Error Message:", error.message);
        setError("Something went wrong. Please try again");
      }
    }
  };

  return (
    <AuthLayout>
      <div className='lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center'>
        <h3 className='text-xl font-semibold text-black'>Create an Account</h3>
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
            />

            <Input
              value={email}
              onChange={({target}) => setEmail(target.value)}
              label="Email Address"
              placeholder="example@gmail.com"
              type="text"
              autoComplete="username"
            />

            <Input
              value={password}
              onChange={({target}) => setPassword(target.value)}
              label="Password"
              placeholder="Min 8 characters"
              type="password"
              autoComplete="current-password"
            />

            <div className='flex flex-col'>
              <label className="text-[13px] text-slate-600 mb-1">Select Role</label>
              <select
                value={role}
                onChange={({ target }) => handleRoleChange(target.value)}
                className="border border-gray-300 rounded-md p-2 text-sm"
              >
                <option value="tester">Tester</option>
                <option value="developer">Developer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {showAdminTokenField && (
              <Input
                value={adminInviteToken}
                onChange={({target}) => setAdminInviteToken(target.value)}
                label="Admin Invite Token (Only for Admins)"
                placeholder="6 Digit Code"
                type="text"
              />
            )}

          </div>

          {error && <p className='text-red-500 text-xs pb-2.5 mt-2'>{error}</p>}

          <button type="submit" className='btn-primary'>
            SIGNUP
          </button>

          <p className="text-[13px] text-slate-800 mt-3">
            Already have an account?{""}
            <Link className="font-medium text-primary underline" to="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}

export default Signup;
