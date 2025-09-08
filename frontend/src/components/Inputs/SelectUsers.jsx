import React, { useEffect, useState } from 'react';
import { API_PATHS } from '../../utils/apiPaths.js';
import axiosInstance from '../../utils/axiosInstance.js';
import { LuUsers } from 'react-icons/lu';
import Modal from '../Modal.jsx';
import AvatarGroup from '../AvatarGroup.jsx';

const SelectUsers = ({ label, selectedUsers = [], onChange, role = 'developer' }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSelectedUsers, setTempSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Get all users, filtering by role if specified
  const getAllUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.USERS.GET_DEVELOPERS);
      if (response.status === 200) {
        const developersList = response.data || [];
        setAllUsers(developersList);
        setFilteredUsers(developersList);
      }
      setLoading(false);
    } 
    catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setTempSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAssign = () => {
    onChange(tempSelectedUsers);
    setIsModalOpen(false);
  };

  // Find avatars for selected users
  const selectUserAvatars = allUsers
    .filter((user) => selectedUsers?.includes(user._id))
    .map((user) => user.profileImageUrl || null);

  // Initialize tempSelectedUsers when the modal opens
  const openModal = () => {
    setTempSelectedUsers([...selectedUsers]);
    setIsModalOpen(true);
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  useEffect(() => {
    // Only initialize if selectedUsers has values and tempSelectedUsers is empty
    if (selectedUsers?.length > 0 && tempSelectedUsers.length === 0) {
      setTempSelectedUsers([...selectedUsers]);
    }
  }, [selectedUsers]);

  return (
    <div className="relative w-full">
      {label && (
        <label className="text-xs font-medium text-slate-600 block mb-1">
          {label}
        </label>
      )}

      <div className='space-y-4 mt-1'>
        {selectUserAvatars.length === 0 ? (
          <button 
            type="button"
            className='card-btn'
            onClick={openModal}
          >
            <LuUsers className='text-sm' /> Assign Developers
          </button>
        ) : (
          <div 
            className='cursor-pointer flex items-center gap-2' 
            onClick={openModal}
          >
            <AvatarGroup avatars={selectUserAvatars} maxVisible={3} />
            <span className="text-sm text-blue-600 hover:underline">
              {selectUserAvatars.length} {selectUserAvatars.length === 1 ? 'developer' : 'developers'} assigned
            </span>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
          title="Assign Developers"
        >
          {loading ? (
            <div className='text-center py-10'>
              <p>Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className='text-center py-10'>
              <p>No {role}s available to assign</p>
            </div>
          ) : (
            <div className='space-y-4 h-[60vh] overflow-y-auto'>
              {filteredUsers.map((user) => (
                <div 
                  key={user._id} 
                  className='flex items-center gap-4 p-3 border-b border-gray-200'
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {user.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt={user.name} 
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.classList.add('bg-gray-200');
                        }}
                      />
                    ) : (
                      <span className="text-gray-500 text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className='flex-1'>
                    <p className='font-medium text-gray-800'>
                      {user.name}
                    </p>
                    <p className='text-[13px] text-gray-500'>{user.email}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={tempSelectedUsers.includes(user._id)}
                    onChange={() => toggleUserSelection(user._id)}
                    className='w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none cursor-pointer'
                  />
                </div>
              ))}
            </div>
          )}

          <div className='flex justify-end gap-4 pt-4 mt-4 border-t border-gray-200'>
            <button 
              className='px-4 py-2 text-gray-600 hover:text-gray-800 rounded' 
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              className='px-4 py-2 bg-primary text-white rounded hover:bg-blue-700' 
              onClick={handleAssign}
            >
              Assign Selected Developers
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default SelectUsers; 