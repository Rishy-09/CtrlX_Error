import React, {useState} from 'react'
import {HiMiniPlus, HiOutlineTrash} from 'react-icons/hi2'
import {LuPaperclip} from 'react-icons/lu'

const AddAttachmentsInput = ({label, attachments = [], onChange}) => {
  const [option, setOption] = useState('')
  
  // Function to handle adding an option
  const handleAddOption = () => {
    if (option.trim() !== '') {
      onChange([...attachments, option.trim()]);
      setOption("");
    }
  };

  // Function to handle deleting an option
  const handleDeleteOption = (index) => {
    const updatedArr = attachments.filter((_, idx) => idx !== index);
    onChange(updatedArr);
  };

  return (
    <div>
      {label && (
        <label className="text-xs font-medium text-slate-600 block mb-1">
          {label}
        </label>
      )}
      
      {attachments && attachments.map((item, index) => (
        <div
          key={index}
          className="flex justify-between bg-gray-50 border border-gray-100 px-3 py-2 rounded-md mb-3 mt-2"
        >
          <div className='flex-1 flex items-center gap-3'>
            <LuPaperclip className='text-gray-400' />
            <p className='text-xs text-black'>{item}</p>
          </div>

          <button
            className='cursor-pointer'
            onClick={() => {
              handleDeleteOption(index)
            }}
            type="button"
          >
            <HiOutlineTrash className='text-lg text-red-500' />
          </button>
        </div>  
      ))}

      <div className='flex items-center gap-5 mt-4'>
        <div className='flex-1 flex items-center gap-3 border border-gray-100 rounded-md px-3'>
          <LuPaperclip className='text-gray-400' />
          <input
            type="text"
            placeholder="Add File Link"
            value={option}
            onChange={({target}) => setOption(target.value)}
            className='w-full text-[13px] text-black outline-none bg-white py-2'
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddOption();
              }
            }}
          />
        </div>

        <button
          className='card-btn text-nowrap'
          onClick={handleAddOption}
          type="button"
        >
          <HiMiniPlus className='text-lg' /> Add
        </button>
      </div>
    </div>
  )
}

export default AddAttachmentsInput