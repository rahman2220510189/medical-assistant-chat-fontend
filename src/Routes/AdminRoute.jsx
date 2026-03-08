import React, { useContext, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../Provider/AuthProvider'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext)
  const [isAdmin, setIsAdmin] = useState(null)

  useEffect(() => {
    if (user?.email) {
      const token = localStorage.getItem('access-token')
      axios.get(`${API}/api/admin/check/${user.email}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setIsAdmin(res.data.isAdmin))
      .catch(() => setIsAdmin(false))
    }
  }, [user])

  if (loading || isAdmin === null) return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', height: '100vh',
      fontFamily: 'DM Sans, sans-serif', color: '#64748b'
    }}>
      ⏳ Checking access...
    </div>
  )

  if (!user || !isAdmin) return <Navigate to="/login" replace />

  return children
}

export default AdminRoute