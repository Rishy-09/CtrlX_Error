import React, {useState} from 'react'
import {FaRegEye, FaRegEyeSlash} from 'react-icons/fa'

const Input = ({value, onChange, label, placeholder, type, autoComplete}) => {
    const [showPassword, setShowPassword] = useState(false);
    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    }

  return (
    <div className="mb-0">
        <label className='text-sm font-medium text-slate-800 mb-2 block'>{label}</label>
        <div className='input-box border border-gray-200 rounded-lg px-4 py-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-200'>
            <input
                type={
                    type == 'password' ? (showPassword ? 'text' : 'password'): type
                }
                placeholder={placeholder}
                className="w-full bg-transparent outline-none text-base placeholder:text-gray-400"
                value={value}
                onChange={(e) => onChange(e)} 
                autoComplete={autoComplete}               
            />

            {type == 'password' && (
                <>
                    {showPassword ? (
                        <FaRegEye
                            size={20}
                            className="text-gray-400 hover:text-gray-600 cursor-pointer"
                            onClick={()=>toggleShowPassword()}
                        />
                    ) : (
                        <FaRegEyeSlash
                            size={20}
                            className="text-gray-400 hover:text-gray-600 cursor-pointer"
                            onClick={()=>toggleShowPassword()}
                        />
                    )}
                </>
            )}
        </div>
    </div>
  );
};

export default Input;