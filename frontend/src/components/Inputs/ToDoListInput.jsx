import React, {useState} from 'react'
import {HiMiniPlus, HiOutlineTrash} from 'react-icons/hi2'

const ToDoListInput = ({label, placeholder, todoList, values, onChange}) => {
    const [option, setOption] = useState("");
    const list = todoList || values || [];

    // Function to handle adding an option
    const handleAddOption = () => {
        if (option.trim()) {
            onChange([...list, option.trim()]);
            setOption("");
        }
    };

    // Function to handle deleting an option
    const handleDeleteOption = (index) => {
        const updatedArr = (list.filter((_, idx) => idx !== index));
        onChange(updatedArr);
    };

  return (
    <div>
        {label && (
            <label className="text-xs font-medium text-slate-600 block mb-1">
                {label}
            </label>
        )}
        
        {list.map((item, index) => (
            <div
                key={index}
                className="flex justify-between bg-gray-50 border border-gray-100 px-3 py-2 rounded-md mb-3 mt-2 "
            >
                <p className='text-xs text-black'>
                    <span className='text-xs text-gray-400 font-semibold mr-2'>
                        {index < 9 ? `0${index + 1}` : index + 1}
                    </span>
                    {item}
                </p>

                <button
                    className='cursor-pointer'
                    onClick={() => {
                        handleDeleteOption(index);
                    }}
                >
                    <HiOutlineTrash className='text-lg text-red-500'/>
                </button>
            </div>
        ))}

        <div className='flex items-center gap-5 mt-4'>
            <input 
                type="text"
                placeholder={placeholder || 'Enter Bug Checklist'}
                value={option}
                onChange={({target}) => setOption(target.value)}
                className='w-full text-[13px] text-black outline-none bg-white border border-gray-100 px-3 py-2 rounded-md'
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOption();
                    }
                }}
            />
            <button 
                className='card-btn text-nowrap' 
                onClick={handleAddOption}
                type="button"
            >
                <HiMiniPlus className='text-lg'/>Add
            </button>
        </div>
    </div>
  )
}

export default ToDoListInput