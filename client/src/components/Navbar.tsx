import { ShoppingCart, Heart, Bell, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { successToast } from "./Toast";
import { Link } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setIsAuthenticated(!!token);
    }, []);

    const navigateLogin = () => {
        navigate("/users/login");
    };

    const navigateRegister = () => {
        navigate("/users/register");
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
        successToast('Logged out successfully');
        navigate('/');
    };

    return (
        <nav className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200 shadow-md top-0 w-full z-50 fixed">
            {/* Logo */}
            <h1 className="text-2xl font-extrabold text-purple-700 tracking-tight cursor-pointer" onClick={() => navigate('/')}>EduRise</h1>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
                <a href="/courses" className="hover:text-purple-600 transition-colors px-2 py-1 rounded-md hover:bg-purple-50">Courses</a>
                <a href="#about" className="hover:text-purple-600 transition-colors px-2 py-1 rounded-md hover:bg-purple-50">About</a>
                <a href="#contact" className="hover:text-purple-600 transition-colors px-2 py-1 rounded-md hover:bg-purple-50">Contact Us</a>
                <Link to="/learning-area" className="text-blue-600 font-semibold hover:underline">
                    Learning Area
                </Link>
                {isAuthenticated && (
                  <Link to="/my-courses" className="text-purple-600 font-semibold hover:underline">
                    My Courses
                  </Link>
                )}
            </div>

            {/* Icons and Auth Buttons */}
            <div className="flex items-center gap-4 text-gray-500">
                <button className="hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50">
                    <ShoppingCart size={22} />
                </button>
                <button className="hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-purple-50">
                    <Heart size={22} />
                </button>
                <button className="hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50">
                    <Bell size={22} />
                </button>
                {isAuthenticated && (
                    <button className="hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-purple-50" onClick={() => navigate('/profile')}>
                        <User size={22} />
                    </button>
                )}
                {isAuthenticated ? (
                    <button 
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition cursor-pointer flex items-center gap-2 shadow-md border border-red-500"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                ) : (
                    <>
                        <button 
                            onClick={navigateLogin} 
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition cursor-pointer font-semibold shadow-md border border-blue-600"
                        >
                            Login
                        </button>
                        <button 
                            onClick={navigateRegister} 
                            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition cursor-pointer font-semibold shadow-md border border-purple-600"
                        >
                            Register
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}
