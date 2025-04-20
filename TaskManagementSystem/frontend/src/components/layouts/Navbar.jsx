import React, {useState} from 'react'
import {HiOutlineMenu, HiOutlineX} from 'react-icons/hi'
import SideMenu from './SideMenu'
import NotificationBell from '../Reminders/NotificationBell'

const Navbar = ({activeMenu}) => {
  const [openSideMenu, setOpenSideMenu] = useState(false)
  return (
    <div className='flex items-center justify-between bg-white border border-b border-gray-200/50 backdrop-blur-[2px] py-4 px-7 sticky top-0 z-30'>
      <div className="flex items-center gap-5">
        <button
         className='block lg:hidden text-black'
         onClick={() => {
          setOpenSideMenu(!openSideMenu);
         }}
        >
        {openSideMenu ? (
          <HiOutlineX className="text-2xl" />
        ): (
          <HiOutlineMenu className="text-2xl" />
        )}
        </button>

        <h2 className=''>Task Management System</h2>
      </div>

      <div className="flex items-center">
        <NotificationBell />
      </div>

      {openSideMenu && (
        <div className='fixed top-[61px] -ml-4 bg-white '>
          <SideMenu activeMenu={activeMenu} />
        </div>
      )}
    </div>
  )
}

export default Navbar