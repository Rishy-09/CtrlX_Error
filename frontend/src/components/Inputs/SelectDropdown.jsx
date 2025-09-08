import React, { useState } from 'react';
import { LuChevronDown } from 'react-icons/lu';

const SelectDropdown = ({ label, options, selectedValue, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Find the selected option label to display
  const selectedOption = options.find(opt => opt.value === selectedValue);
  const displayText = selectedOption ? selectedOption.name : placeholder;
  
  return (
    <div className="relative w-full">
      {label && (
        <label className="text-xs font-medium text-slate-600 block mb-1">
          {label}
        </label>
      )}
      
      {/* Dropdown Button */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-sm text-black outline-none bg-white border border-gray-300 px-3 py-2 rounded-md flex justify-between items-center"
      >
        <span className={`${!selectedValue ? 'text-gray-400' : ''}`}>
          {displayText}
        </span>
        <span className="ml-2">
          {isOpen ? <LuChevronDown className="rotate-180" /> : <LuChevronDown />}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-md max-h-48 overflow-y-auto">
          {options.map((option) => (
            <div 
              key={option.id} 
              onClick={() => handleSelect(option.value)}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                selectedValue === option.value ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              {option.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;