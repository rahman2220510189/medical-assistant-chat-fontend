import React from 'react'
import NavBar from '../NavBar/NavBar'
import { Outlet, useLocation } from 'react-router-dom'
import Footer from '../Footer/Footer'

const Main = () => {
  const location = useLocation();
  const hideLayoutForPaths = ['chatbot', 'login', 'register'];
  const shouldHideLayout = hideLayoutForPaths.includes(location.pathname.slice(1));
  if (shouldHideLayout) {
    return <Outlet></Outlet>;
  }
  return (
    <div>
      <NavBar>

      </NavBar>
      <Outlet></Outlet>
      <Footer></Footer>
    </div>
  )
}

export default Main
