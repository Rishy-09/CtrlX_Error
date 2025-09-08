import React from 'react'

const DeleteAlert = ({ entityName = 'item', onCancel, onConfirm, loading }) => {
    return (
    <div className="p-2">
        <h3 className="text-lg font-medium mb-2">Delete Confirmation</h3>
        <p className='text-sm text-gray-600 mb-2'>Are you sure you want to delete this {entityName.toLowerCase()}?</p>
        <p className='text-xs text-red-500 mb-4'>This action cannot be undone.</p>
        
        <div className='flex justify-end gap-3 mt-6'>
            <button
                type='button'
                className='flex items-center justify-center gap-1.5 text-xs md:text-sm font-medium text-gray-500 whitespace-nowrap bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-200 cursor-pointer transition-colors'
                onClick={onCancel}
                disabled={loading}
            >
                Cancel
            </button>
            <button
                type='button'
                className='flex items-center justify-center gap-1.5 text-xs md:text-sm font-medium text-white whitespace-nowrap bg-rose-500 border border-rose-600 rounded-lg px-4 py-2 hover:bg-rose-600 cursor-pointer transition-colors'
                onClick={onConfirm}
                disabled={loading}
            >
                {loading ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                    </span>
                ) : 'Delete'}
            </button>
        </div>
    </div>
  )
}

export default DeleteAlert