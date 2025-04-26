import React, {useEffect, useState, useRef} from 'react'
import { API_PATHS } from '../../utils/apiPaths.js'
import axiosInstance from '../../utils/axiosInstance.js'
import { LuUsers, LuSearch } from 'react-icons/lu';
import Modal from '../Modal.jsx'
import AvatarGroup from '../AvatarGroup.jsx'
import ReactDOM from 'react-dom';

const SelectUsers = ({selectedUsers, setSelectedUsers}) => {
    const [allUsers, setAllUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempSelectedUsers, setTempSelectedUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const searchInputRef = useRef(null);
    const buttonRef = useRef(null);

    const getAllUsers = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
            if (response.status === 200) {
                setAllUsers(response.data);
            }
        } 
        catch (error) {
            console.error("Error fetching users:", error);
        }
        finally {
            setIsLoading(false);
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
        setSelectedUsers(tempSelectedUsers);
        setIsModalOpen(false);
    };

    // Filter users based on search term
    const filteredUsers = allUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get avatars for selected users
    const selectedUsersData = allUsers.filter(user => selectedUsers.includes(user._id));
    const selectUserAvatars = selectedUsersData.map(user => user.profileImageUrl);

    useEffect(() => {
        getAllUsers();
    }, []);

    // Initialize tempSelectedUsers when modal opens
    useEffect(() => {
        if (isModalOpen) {
            setTempSelectedUsers(selectedUsers);
            setSearchTerm('');
        }
    }, [isModalOpen, selectedUsers]);

    return (
        <div className='mt-2 relative'>
            <button 
                type="button"
                ref={buttonRef}
                className='flex items-center justify-between w-full text-sm bg-white border border-gray-300 px-3 py-2.5 rounded-md mt-2'
                onClick={() => setIsModalOpen(true)}
            >
                {selectedUsers.length === 0 ? (
                    <span className='text-gray-500'>Select team members</span>
                ) : (
                    <div className='flex items-center gap-2'>
                        <AvatarGroup avatars={selectUserAvatars} maxVisible={3} />
                        <span className='text-sm text-gray-700'>
                            {selectedUsersData.length} member{selectedUsersData.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                )}
                <LuUsers className='text-gray-500' />
            </button>

            {isModalOpen && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-medium">Select Team Members</h3>
                            <button
                                className="text-gray-400 hover:text-gray-500"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-4">
                            <div className='mb-4 relative'>
                                <div className='relative'>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search by name or email"
                                        className='w-full py-2 px-3 pl-9 border border-gray-300 rounded-md'
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <LuSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500' />
                                </div>
                            </div>

                            <div className='max-h-[400px] overflow-y-auto border border-gray-300 rounded-md'>
                                {isLoading ? (
                                    <div className='text-center py-8'>Loading users...</div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className='text-center py-8'>No users found</div>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <div 
                                            key={user._id} 
                                            className={`flex items-center p-3 border-b border-gray-200 cursor-pointer ${
                                                tempSelectedUsers.includes(user._id) ? 'bg-blue-50' : ''
                                            }`}
                                            onClick={() => toggleUserSelection(user._id)}
                                        >
                                            <img 
                                                src={user.profileImageUrl} 
                                                alt={user.name} 
                                                className='w-10 h-10 rounded-full mr-3' 
                                            />
                                            <div className='flex-1'>
                                                <p className='font-medium'>{user.name}</p>
                                                <p className='text-xs text-gray-500'>{user.email}</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={tempSelectedUsers.includes(user._id)}
                                                onChange={() => {}}
                                                className='w-4 h-4'
                                            />
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className='flex justify-end gap-3 pt-4 mt-2'>
                                <button 
                                    className='px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50'
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className='px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700'
                                    onClick={handleAssign}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}

export default SelectUsers; 