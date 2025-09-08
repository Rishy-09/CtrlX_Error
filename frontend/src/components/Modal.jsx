import React, { useEffect, useRef } from 'react'

const Modal = ({children, isOpen, closeModal, title}) => {
    const modalRef = useRef(null);
    
    // Close modal when pressing escape key
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
        }
        
        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, closeModal]);
    
    // Prevent scroll on body when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);
    
    // Close on backdrop click but not when clicking on modal content
    const handleBackdropClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            closeModal();
        }
    };
    
    if (!isOpen) return null;

  return (
    <div 
        className='fixed inset-0 z-50 flex justify-center items-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50 transition-opacity' 
        onClick={handleBackdropClick}
    > 
      <div className='relative p-4 w-full max-w-md max-h-full mx-auto'>
        {/* Modal Content */}
        <div 
            ref={modalRef}
            className='relative bg-white rounded-lg shadow-xl animate-fadeIn'
        >
          {/* Modal Header */}
          {title && (
            <div className='flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200'>
              <h3 className='text-lg font-medium text-gray-900'>
                {title}
              </h3>

              <button
                type='button'
                className='text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center cursor-pointer transition-colors'
                onClick={closeModal}
                aria-label="Close modal"
              >
                <svg
                  className='w-3 h-3'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 14 14'
                >
                  <path
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6'
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Modal Body */}
          <div className='p-4 md:p-5'>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;