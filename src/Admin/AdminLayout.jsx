import React from 'react'
import { Outlet } from 'react-router-dom'
import NavBar from '../NavBar/NavBar'
import Footer from '../Footer/Footer'


const AdminLayout = () => {
  return (
    <div>
      
    <NavBar></NavBar>
      
     
      <Outlet></Outlet>
      <Footer></Footer>
    </div>
  )
}

export default AdminLayout