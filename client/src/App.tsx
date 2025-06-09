import { ToastContainer } from "react-toastify"
import UserRoutes from "./routes/UserRoutes"
import InstructorRoutes from "./routes/InstructorRoutes"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import AdminRoutes from "./routes/AdminRoutes"
import EditCourse from './pages/Instructor/EditCourse'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/instructors/*" element={<InstructorRoutes />} />
        <Route path="/*" element={<UserRoutes />} />
        <Route path="/instructors/courses/edit/:courseId" element={<EditCourse />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}

export default App
