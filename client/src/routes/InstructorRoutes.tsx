import {Route, Routes} from "react-router-dom"
import InstructorRegister from "../pages/Instructor/InstructorRegister"
import InstructorLogin from "../pages/Instructor/InstructorLogin"
import OtpPage from "../components/OtpPage"
import ForgotOtpPage from "../components/ForgotOtpPage"
import ForgotPassword from "../components/ForgotPassword"
import ResetPassword from "../components/ResetPassword"
import InstructorNavbar from "../components/InstructorNavbar"
import InstructorDashboard from "../pages/Instructor/InstructorDashboard"
import CreateCourse from "../pages/Instructor/CreateCourse"
import Courses from "../pages/Instructor/Courses"
import ProtectedRoute from "../components/ProtectedRoute"

const InstructorRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="register" element={<InstructorRegister/>}/>
      <Route path="login" element={<InstructorLogin/>}/>
      <Route path='verify-otp' element={<OtpPage role={"instructors"}/>}/>
      <Route path='reset-verify-otp' element={<ForgotOtpPage role="instructors"/>}/>
      <Route path="forgotpassword" element={<ForgotPassword role="instructors"/>}/>
      <Route path="resetpassword" element={<ResetPassword role="instructors"/>}/>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute role="instructor" />}>
        <Route element={<InstructorNavbar />}>
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/create" element={<CreateCourse />} />
          <Route path="courses/edit/:courseId" element={<CreateCourse />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default InstructorRoutes
