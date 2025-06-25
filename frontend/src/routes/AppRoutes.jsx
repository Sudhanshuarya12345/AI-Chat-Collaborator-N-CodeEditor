import React from 'react'
import { Route, BrowserRouter, Routes } from 'react-router-dom'
import Home from '../screens/Home.jsx'
import Login from '../screens/Login.jsx'
import Register from '../screens/Register.jsx'
import Project from '../screens/Project.jsx'
import UserAuth from '../auth/UserAuth.jsx'

const AppRouter = () => {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={ <UserAuth><Home/></UserAuth> } />
            <Route path="/login" element={ <Login/> } />
            <Route path="/register" element={ <Register/> } />
            <Route path="/project" element={ <UserAuth><Project/></UserAuth> } />
            
        </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
