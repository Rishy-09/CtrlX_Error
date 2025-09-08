import React from 'react'

const AvatarGroup = ({avatars, maxVisible}) => {
  const visibleAvatars = avatars.filter(avatar => avatar !== null && avatar !== '');
    
  return (
    <div className='flex items-center'>
        {visibleAvatars.slice(0, maxVisible).map((avatar, index) => (
          <div key={index} className="w-9 h-9 rounded-full border-2 border-white -ml-3 first:ml-0 bg-gray-200 flex items-center justify-center overflow-hidden">
            <img
              src={avatar}
              alt={`Avatar ${index}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.classList.add('bg-gray-200');
              }}
            />
          </div>
        ))}
        {visibleAvatars.length > maxVisible && (
            <div className='w-9 h-9 flex items-center justify-center bg-blue-50 text-sm font-medium rounded-full border-2 border-white -ml-3'>
                +{visibleAvatars.length - maxVisible}
            </div>
        )}      
    </div>
  )
}

export default AvatarGroup;