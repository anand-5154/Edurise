import {Route, Routes} from "react-router-dom"
import UserRegister from '../pages/User/UserRegister'
import UserLogin from '../pages/User/UserLogin'
import LandingPage from "../pages/User/UserLandingPage"
import OtpPage from "../components/OtpPage"
import ForgotPassword from "../components/ForgotPassword"
import ForgotOtpPage from "../components/ForgotOtpPage"
import ResetPassword from "../components/ResetPassword"
import AuthCallback from "../pages/AuthCallback"
import Courses from "../pages/User/Courses"
import CourseDetails from "../pages/User/CourseDetails"

const UserRoutes = () => {
  return (
    <Routes>
      <Route path='/users/register' element={<UserRegister/>}/>
      <Route path='/users/login' element={<UserLogin/>}/>
      <Route path='/' element={<LandingPage/>}/>
      <Route path='/users/verify-otp' element={<OtpPage role="users"/>}/>
      <Route path='/users/reset-verify-otp' element={<ForgotOtpPage role="users"/>}/>
      <Route path="/users/forgotpassword" element={<ForgotPassword role="users"/>}/>
      <Route path="/users/resetpassword" element={<ResetPassword role="users"/>}/>
      <Route path="/auth/callback" element={<AuthCallback/>}/>
      <Route path="/courses" element={<Courses/>}/>
      <Route path="/courses/:courseId" element={<CourseDetails/>}/>
    </Routes>
  )
}

export default UserRoutes
