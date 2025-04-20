import React, { useState, useRef } from 'react';
import { FaCamera, FaUser, FaTrashAlt } from 'react-icons/fa';

// Default profile image to use when user doesn't have a profile picture
const DEFAULT_PROFILE_IMAGE = "https://res.cloudinary.com/dykjpvgga/image/upload/v1674645487/a9ljktjl3o8f2fbwm2kt.jpg";

const ProfilePhotoSelector = ({ currentImage, onChange }) => {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Determine what image to display
  const displayImage = preview || currentImage || DEFAULT_PROFILE_IMAGE;

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
      onChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeImage = () => {
    setPreview(null);
    onChange(DEFAULT_PROFILE_IMAGE);
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
        
        {(preview || (currentImage && currentImage !== DEFAULT_PROFILE_IMAGE)) && (
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