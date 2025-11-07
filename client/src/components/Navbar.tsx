import { useEffect, useState } from "react";
import { User, Bell, Menu, X } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import logo from "../assets/learnAt-removebg-preview.png";
import { USER_ROUTES } from "../constants/routes.constants";
import { useAuth } from "../hooks/useAuth";
import { socket } from "../services/socket.service";
import { unreadCountS, userLogout } from "../services/user.services";

export default function Navbar() {
  const token = localStorage.getItem("usersToken");
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const { authUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigateLogin = () => navigate(USER_ROUTES.LOGIN);
  const navigateRegister = () => navigate(USER_ROUTES.REGISTER);

  const handleLogout = async () => {
    try {
      await userLogout();
      localStorage.removeItem("usersEmail");
      localStorage.removeItem("usersToken");
      navigate(USER_ROUTES.LOGIN);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const fetchUnread = async () => {
      if (!authUser?._id) return;

      const userModel = authUser.role === "user" ? "User" : "Instructor";

      try {
        const total = await unreadCountS(authUser._id, userModel);
        setUnreadCount(total);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUnread();

    socket.on("newMessageForBadge", fetchUnread);

    return () => {
      socket.off("newMessageForBadge", fetchUnread);
    };
  }, [authUser?._id, authUser?.role]);

  const cta =
    "bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white py-2 px-5 rounded-full text-base font-semibold shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300";

  return (
    <nav className="sticky top-0 z-50 w-full bg-blue-600/30 backdrop-blur-xl border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="Learn At Logo"
            className="h-8 sm:h-10 object-contain cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={() => {
              const token = localStorage.getItem("usersToken");
              navigate(token ? USER_ROUTES.HOME : USER_ROUTES.ROOT);
            }}
          />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-7 text-white text-base font-medium">
          <Link
            to={USER_ROUTES.COURSES}
            className={`transition-colors duration-200 px-2 py-1 rounded ${
              currentPath == USER_ROUTES.COURSES
                ? "text-white font-semibold"
                : "hover:text-white/80"
            }`}
          >
            Courses
          </Link>

          <Link
            to="/users/about"
            className={`transition-colors duration-200 px-2 py-1 rounded ${
              currentPath == "/users/about"
                ? "text-white font-semibold"
                : "hover:text-white/80"
            }`}
          >
            About
          </Link>

          <Link
            to="/users/contact"
            className={`transition-colors duration-200 px-2 py-1 rounded ${
              currentPath == "/users/contact"
                ? "text-white font-semibold"
                : "hover:text-white/80"
            }`}
          >
            Contact Us
          </Link>

          <Link
            to={USER_ROUTES.CHAT_PAGE}
            className={`transition-colors duration-200 px-2 py-1 rounded relative ${
              currentPath == "/users/chat"
                ? "text-white font-semibold"
                : "hover:text-white/80"
            }`}
          >
            Chats
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            )}
          </Link>
        </div>

        {/* Desktop Right Icons */}
        <div className="hidden md:flex items-center gap-3">
          <>
            <Link
              to={USER_ROUTES.NOTIFICATIONS}
              className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
              title="Notifications"
            >
              <Bell size={22} className="text-white" />
            </Link>

            <Link
              to={USER_ROUTES.PROFILE}
              className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
              title="Profile"
            >
              <User size={22} className="text-white" />
            </Link>
          </>

          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white py-2 px-5 rounded-full text-base font-semibold shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300 min-w-[90px]"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white p-2"
          >
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden flex flex-col items-start px-6 py-4 gap-3 bg-blue-600/20 backdrop-blur-xl border-t border-white/10 text-white text-base font-medium">
          <Link
            to={USER_ROUTES.COURSES}
            className="hover:text-white/80"
            onClick={() => setIsMenuOpen(false)}
          >
            Courses
          </Link>

          <Link
            to="/users/about"
            className="hover:text-white/80"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>

          <Link
            to="/users/contact"
            className="hover:text-white/80"
            onClick={() => setIsMenuOpen(false)}
          >
            Contact Us
          </Link>

          <Link
            to={USER_ROUTES.CHAT_PAGE}
            className="hover:text-white/80"
            onClick={() => setIsMenuOpen(false)}
          >
            Chats
          </Link>

          {token && (
            <>
              <Link
                to={USER_ROUTES.NOTIFICATIONS}
                className="hover:text-white/80"
                onClick={() => setIsMenuOpen(false)}
              >
                Notifications
              </Link>

              <Link
                to={USER_ROUTES.PROFILE}
                className="hover:text-white/80"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
            </>
          )}

          {!token ? (
            <>
              <button
                onClick={() => {
                  navigateLogin();
                  setIsMenuOpen(false);
                }}
                className={cta + " w-full"}
              >
                Login
              </button>

              <button
                onClick={() => {
                  navigateRegister();
                  setIsMenuOpen(false);
                }}
                className={cta + " w-full"}
              >
                Register
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white py-2 px-5 rounded-full text-base font-semibold shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300 w-full"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
