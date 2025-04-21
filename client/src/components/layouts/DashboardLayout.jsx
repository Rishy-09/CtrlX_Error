import React, {useContext} from 'react'
import Navbar from './Navbar'
import SideMenu from './SideMenu'
import {UserContext} from '../../context/userContext.jsx'

const DashboardLayout = ({children, activeMenu}) => {
  const {user} = useContext(UserContext)
  return (
    <div className="bg-white min-h-screen transition-colors duration-300">
      <Navbar activeMenu={activeMenu}/>

      {user && (
        <div className="flex">
          <div className="max-[1080px]:hidden">
            <SideMenu activeMenu={activeMenu}/>
          </div>

          <div className="grow mx-5 text-gray-800">{children}</div>
        </div>
      )}
    </div>
  )
}

export default DashboardLayout