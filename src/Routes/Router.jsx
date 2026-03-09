import React from 'react'
import { createBrowserRouter } from 'react-router-dom'


import Main from '../Main/Main'


import Home from '../Home/Home'
import MedicalChatbot from '../ChatBot/MedicalChatbot'
import Doctors from '../Admin/Doctors'
import Appointments from '../Admin/Appointments'
import Login from '../Login/Login'
import SignUp from '../Login/SignUp'

// Admin Pages
import Dashboard from '../Admin/Dashboard'
import AdminDoctors from '../Admin/AdminDoctors'
import AdminAppointments from '../Admin/AdminAppointments'

import AdminSettings from '../Admin/AdminSettings'
import AdminLayout from '../Admin/AdminLayout'
import AdminRoute from './AdminRoute'
import PrivateRoute from './PrivateRoute'
import AdminPatients from '../Admin/AdminPatients'
import BookAppointment from '../Admin/BookAppointment'

export const router = createBrowserRouter([
    // ── PUBLIC ROUTES ──
    {
        path: '/',
        element: <Main></Main>,
        children: [
            {
                path: '/',
                element: <Home></Home>
            },
            {
                path: '/chatbot',
                element: <MedicalChatbot></MedicalChatbot>
            },
            {
                path: '/doctors',
                element: <Doctors></Doctors>
            },
            {
                path: '/appointments',
                element: <PrivateRoute><Appointments></Appointments></PrivateRoute>
            },
            {
                path: '/login',
                element: <Login></Login>
            },
            {
                path: '/register',
                element: <SignUp></SignUp>
            },
            {
                path:'appointments/book/:doctorId',
                element: <PrivateRoute><BookAppointment></BookAppointment></PrivateRoute>
            }
        ],
    },

    // ── ADMIN ROUTES ──
    {
        path: '/admin',
        element: <AdminRoute><AdminLayout></AdminLayout></AdminRoute>,
        children: [
            {
                index: true,
                element: <Dashboard></Dashboard>
            },
            {
                path: 'doctors',
                element: <AdminDoctors></AdminDoctors>
            },
            {
                path: 'appointments',
                element: <AdminAppointments></AdminAppointments>
            },
            {
                path: 'patients',
                element: <AdminPatients></AdminPatients>
            },
            {
                path: 'settings',
                element: <AdminSettings></AdminSettings>
            },
        ],
    },
])