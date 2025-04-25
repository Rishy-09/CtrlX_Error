import React from 'react';
import Navbar from './Navbar';
import SideMenu from './SideMenu';
import Footer from './Footer';

const MainLayout = ({children, activeMenu}) => {
  return (
    <div className='flex flex-col min-h-screen bg-white text-gray-800 transition-colors duration-300'>
      <Navbar activeMenu={activeMenu} />
      <div className="flex flex-1">
        <SideMenu activeMenu={activeMenu} />
        <main className="w-full overflow-hidden">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout; 