import React, {useState, useEffect, useRef} from 'react'
import { LuChevronDown } from 'react-icons/lu'
import ReactDOM from 'react-dom'

const SelectDropdown = ({options, value, onChange, selected, onSelect, placeholder}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    
    // For backward compatibility
    const actualSelected = selected || value;
    const actualOnSelect = onSelect || onChange;
    
    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (buttonRef.current && !buttonRef.current.contains(event.target) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    const handleSelect = (option) => {
        actualOnSelect(option);
        setIsOpen(false);
    };
    
    // Find the selected option for display
    const selectedOption = options.find((opt) => opt.value === actualSelected);
    
    // Calculate position for the dropdown
    const getDropdownPosition = () => {
        if (!buttonRef.current) return {};
        
        const rect = buttonRef.current.getBoundingClientRect();
        return {
            position: 'fixed',
            top: `${rect.bottom + window.scrollY + 5}px`,
            left: `${rect.left + window.scrollX}px`,
            width: `${rect.width}px`,
            zIndex: 9999
        };
    };
    
    return (
        <div className='relative'>
            {/* Dropdown Button */}
            <button 
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className='w-full text-sm text-gray-800 outline-none bg-white border border-gray-300 hover:border-blue-400 focus:border-blue-500 px-3 py-2.5 rounded-md mt-2 flex justify-between items-center transition-colors duration-200'
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <span className={`${!selectedOption ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className={`ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <LuChevronDown />
                </span>
            </button>

            {/* Dropdown Menu Portal */}
            {isOpen && ReactDOM.createPortal(
                <div 
                    ref={dropdownRef}
                    className='bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-y-auto'
                    style={getDropdownPosition()}
                    role="listbox"
                >
                    {options.map((option) => (
                        <div 
                            key={option.value} 
                            onClick={() => handleSelect(option.value)}
                            className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-100
                                ${actualSelected === option.value 
                                    ? 'bg-blue-50 text-blue-700 font-medium' 
                                    : 'text-gray-700'
                                }`}
                            role="option"
                            aria-selected={actualSelected === option.value}
                        >
                            {option.label}
                        </div>
                    ))} 
                </div>,
                document.body
            )}   
        </div>
    );
};

export default SelectDropdown;