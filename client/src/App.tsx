import { ToastContainer } from "react-toastify";
import UserRoutes from "./routes/UserRoutes";
import InstructorRoutes from "./routes/InstructorRoutes";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import AdminRoutes from "./routes/AdminRoutes";

// Redirect component to map legacy singular '/instructor/*' paths to '/instructors/*'
const RedirectInstructor = () => {
  const loc = useLocation();
  const newPath = loc.pathname.replace(/^\/instructor/, "/instructors") + loc.search + loc.hash;
  return <Navigate to={newPath} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Legacy singular-to-plural redirect */}
        <Route path="/instructor/*" element={<RedirectInstructor />} />
        {AdminRoutes()}
        {UserRoutes()}
        {InstructorRoutes()}
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
