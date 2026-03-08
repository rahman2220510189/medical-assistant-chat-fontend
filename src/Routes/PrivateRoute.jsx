import React, { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../Provider/AuthProvider'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext)
  const location = useLocation()

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', height: '100vh'
    }}>
      ⏳ Loading...
    </div>
  )

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  return children
}

export default PrivateRoute