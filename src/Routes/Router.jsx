import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Main from '../Main/Main'
import Home from '../Home/Home';
import MedicalChatbot from '../ChatBot/MedicalChatbot';
import Login from '../Login/Login';
import SignUp from '../Login/SignUp';

export const router  = createBrowserRouter([
    {
        path: '/',
        element: <Main></Main>,
        children: [
           {
            path: '/',
            element:<Home></Home>
           },
           {
            path: '/chatbot',
            element: <MedicalChatbot></MedicalChatbot>
           },
           {
            path: '/login',
            element: <Login></Login>,
           },
           {
            path: '/signup',
            element: <SignUp></SignUp>  ,
           }
        ],
    }
   ]);

