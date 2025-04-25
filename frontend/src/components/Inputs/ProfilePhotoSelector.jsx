import React, { useState, useRef, useContext } from 'react';
import { FaCamera, FaUser, FaTrashAlt } from 'react-icons/fa';
import { UserContext } from '../../context/userContext';

// Helper function to generate avatar URL
const getAvatarUrl = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`;
};

const ProfilePhotoSelector = ({ currentImage, onChange, image, setImage }) => {
  const { user } = useContext(UserContext);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Generate default avatar based on user name
  const defaultAvatar = getAvatarUrl(user?.name);

  // Determine what image to display
  // If image prop is provided (for Signup), use that, otherwise use currentImage (for Profile)
  const displayImage = preview || image || currentImage || defaultAvatar;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      // Use either onChange or setImage based on what was provided
      if (onChange) onChange(file);
      if (setImage) setImage(file);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeImage = () => {
    setPreview(null);
    // Use either onChange or setImage based on what was provided
    if (onChange) onChange(null);
    if (setImage) setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center space-x-6">
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt="Profile" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultAvatar;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaUser className="text-gray-400 text-4xl" />
          </div>
        )}
        
        <button
          type="button"
          onClick={triggerFileInput}
          className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition-colors"
        >
          <FaCamera size={14} />
        </button>
      </div>
      
      <div className="flex flex-col">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
        
        <button
          type="button"
          onClick={triggerFileInput}
          className="text-sm text-primary hover:text-primary-dark mb-2"
        >
          Change Photo
        </button>
        
        {(preview || (currentImage && currentImage !== defaultAvatar)) && (
          <button
            type="button"
            onClick={removeImage}
            className="text-sm text-red-500 hover:text-red-700 flex items-center"
          >
            <FaTrashAlt size={12} className="mr-1" /> Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePhotoSelector;