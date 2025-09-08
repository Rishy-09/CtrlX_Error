import React from 'react'
import UI_IMG from '../../assets/images/auth-bg.jpeg'
import { LuBug } from 'react-icons/lu'

const AuthLayout = ({children}) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left side - Form content */}
      <div className="w-full md:w-[60%] px-6 md:px-12 pt-8 pb-12 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <LuBug className="text-primary text-2xl" />
          <h2 className="text-lg font-medium text-black">CtrlX_Error</h2>
        </div>
        <div className="flex-1 flex items-center">
          <div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-sm p-8 md:p-10 transition-all duration-300 hover:shadow-md">
            {children}
          </div>
        </div>
      </div>

      {/* Right side - Background image */}
      <div className="hidden md:block w-[40%] relative overflow-hidden">
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/40 z-10" />
        
        {/* Background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url(${UI_IMG})` }}
        />
        
        {/* Content overlay */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center p-8">
          <div className="max-w-md text-center text-white">
            <div className="mb-6">
              <LuBug className="text-5xl text-white mx-auto mb-4" />
              <h3 className="text-4xl font-bold mb-4">Welcome to CtrlX_Error</h3>
              <p className="text-lg opacity-90 leading-relaxed">
                The modern bug tracking solution for development teams. Track, prioritize, and fix bugs efficiently.
              </p>
            </div>
            <div className="mt-8 space-y-4">
              <p className="text-sm opacity-80">Join thousands of developers worldwide</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;