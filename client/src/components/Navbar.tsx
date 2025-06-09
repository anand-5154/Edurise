import { ShoppingCart, Heart, Bell, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { successToast } from "./Toast";

export default function Navbar() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    const navigateLogin = () => {
        navigate("/users/login");
    };

    const navigateRegister = () => {
        navigate("/users/register");
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        successToast('Logged out successfully');
        navigate('/');
    };

    return (
        <nav className="flex justify-between items-center px-8 py-5 bg-transparent-900 shadow-md top-0 w-full z-50 fixed">
            {/* Logo */}
            <h1 className="text-2xl font-extrabold text-blue-400">EduRise</h1>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6 text-gray-300">
                <a href="#courses" className="hover:text-blue-400 transition-colors">Courses</a>
                <a href="#about" className="hover:text-blue-400 transition-colors">About</a>
                <a href="#contact" className="hover:text-blue-400 transition-colors">Contact Us</a>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-4 text-gray-300">
                <button className="hover:text-blue-400 transition-colors">
                    <ShoppingCart size={22} />
                </button>
                <button className="hover:text-violet-400 transition-colors">
                    <Heart size={22} />
                </button>
                <button className="hover:text-blue-400 transition-colors">
                    <Bell size={22} />
                </button>
                <button className="hover:text-violet-400 transition-colors">
                    <User size={22} />
                </button>
                {isAuthenticated ? (
                    <button 
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition cursor-pointer flex items-center gap-2"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                ) : (
                    <>
                        <button 
                            onClick={navigateLogin} 
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition cursor-pointer"
                        >
                            Login
                        </button>
                        <button 
                            onClick={navigateRegister} 
                            className="bg-violet-500 text-white px-4 py-2 rounded-md hover:bg-violet-600 transition cursor-pointer"
                        >
                            Register
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}
