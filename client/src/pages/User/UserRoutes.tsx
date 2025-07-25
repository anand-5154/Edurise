import { Route, Routes } from "react-router-dom";
import UserRegister from '../pages/User/UserRegister';
import UserLogin from '../pages/User/UserLogin';
import LandingPage from "../pages/User/UserLandingPage";
import OtpPage from "../components/OtpPage";
import ForgotPassword from "../components/ForgotPassword";
import ForgotOtpPage from "../components/ForgotOtpPage";
import ResetPassword from "../components/ResetPassword";
import AuthCallback from "../pages/AuthCallback";
import Courses from "../pages/User/Courses";
import CourseDetails from "../pages/User/CourseDetails";
import UserProfile from "../pages/User/UserProfile";
import PaymentPage from '../pages/User/PaymentPage';
import LearningArea from './LearningArea';
import LearningPath from './LearningPath';
import MyCourses from '../pages/User/MyCourses';

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
      <Route path="/courses/:courseId/payment" element={<PaymentPage/>}/>
      <Route path="/profile" element={<UserProfile/>}/>
      <Route path="/learning-area" element={<LearningArea />} />
      <Route path="/learning-area/path" element={<LearningPath />} />
      <Route path="/my-courses" element={<MyCourses/>}/>
    </Routes>
  );
};

export default UserRoutes; 