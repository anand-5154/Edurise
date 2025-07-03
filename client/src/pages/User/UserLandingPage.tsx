import image from "../../assets/e-learning-interactions-illustration-concept.png"
import { FaChalkboardTeacher, FaChartLine, FaCertificate } from "react-icons/fa"
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
// import {useParams} from "react-router-dom"

const LandingPage = () => {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  console.log(params)

  const handleExploreCourses = () => {
    navigate('/courses');
  };

  return (
    <div className="font-sans bg-gray-50 text-gray-900 min-h-screen">
      <Navbar />
      {/* Hero Section */}
      <section className="relative flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-16 py-16 md:py-28 gap-10 bg-white">
        {/* Left Text Content */}
        <div className="max-w-xl z-10 animate-fadeInUp">
          <h1 className="text-4xl md:text-5xl font-extrabold text-purple-700 leading-tight tracking-wide drop-shadow-xl">
            Unlock Your Potential with
            <span className="block text-purple-700 font-black italic text-6xl mt-2">EduRise</span>
          </h1>
          <p className="mt-6 text-lg text-gray-700 leading-relaxed">
            Discover top-notch courses, track your progress, and earn certificates.<br />
            <span className="text-purple-600 font-semibold">Flexible, affordable, and powerful learning</span> — all in one platform.
          </p>
          {/* Button Area - Glassmorphism Card */}
          <div className="mt-10 flex justify-start">
            <div className="flex gap-4 items-center bg-gray-100 border border-gray-200 shadow-lg rounded-2xl px-8 py-6">
              <button className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-full shadow hover:bg-blue-700 transition-all text-lg">
                Start Learning
              </button>
              <button
                onClick={handleExploreCourses}
                className="border-2 border-purple-600 text-purple-700 font-semibold px-8 py-3 rounded-full hover:bg-purple-600 hover:text-white transition-all shadow text-lg bg-white"
              >
                Explore Courses
              </button>
            </div>
          </div>
        </div>
        {/* Right Image */}
        <div className="md:w-1/2 flex justify-center z-10 animate-float">
          <img src={image} alt="Online Learning" className="w-[90%] h-[90%] rounded-3xl shadow-2xl border-4 border-gray-200" />
        </div>
        {/* Decorative blurred circle */}
        <div className="absolute right-0 bottom-0 w-72 h-72 bg-purple-100 rounded-full blur-3xl z-0" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 md:px-16 bg-white relative overflow-x-hidden">
        <h3 className="text-4xl font-extrabold text-center text-purple-700 mb-16 drop-shadow-lg tracking-tight">Why Choose EduRise?</h3>
        <div className="grid md:grid-cols-3 gap-12 relative z-10">
          {/* Card 1 */}
          <div className="relative group p-10 rounded-3xl bg-gray-100 border border-gray-200 shadow-lg overflow-hidden transition-transform hover:-translate-y-2 hover:shadow-lg">
            <div className="relative flex justify-center mb-6">
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600 text-white text-4xl shadow">
                <FaChalkboardTeacher />
              </span>
            </div>
            <h4 className="text-xl font-bold text-purple-700 mb-2">Expert-Led Courses</h4>
            <p className="text-gray-600 text-base">
              Learn from top educators and industry leaders with real-world experience.
            </p>
          </div>
          {/* Card 2 */}
          <div className="relative group p-10 rounded-3xl bg-gray-100 border border-gray-200 shadow-lg overflow-hidden transition-transform hover:-translate-y-2 hover:shadow-lg">
            <div className="relative flex justify-center mb-6">
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-4xl shadow">
                <FaChartLine />
              </span>
            </div>
            <h4 className="text-xl font-bold text-blue-700 mb-2">Progress Tracking</h4>
            <p className="text-gray-600 text-base">
              Keep track of your goals and achievements with smart progress tracking tools.
            </p>
          </div>
          {/* Card 3 */}
          <div className="relative group p-10 rounded-3xl bg-gray-100 border border-gray-200 shadow-lg overflow-hidden transition-transform hover:-translate-y-2 hover:shadow-lg">
            <div className="relative flex justify-center mb-6">
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600 text-white text-4xl shadow">
                <FaCertificate />
              </span>
            </div>
            <h4 className="text-xl font-bold text-purple-700 mb-2">Verified Certifications</h4>
            <p className="text-gray-600 text-base">
              Earn professional certificates to boost your resume and credibility.
            </p>
          </div>
        </div>
        {/* Decorative blurred gradient shapes */}
        <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute -right-32 top-1/3 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-30" />
      </section>

      {/* Call to Action Section */}
      <section className="py-24 px-6 md:px-16 flex justify-center items-center bg-white text-center relative overflow-hidden" id="cta">
        <div className="relative max-w-2xl w-full mx-auto bg-gray-100 border border-gray-200 shadow-2xl rounded-3xl px-10 py-14 flex flex-col items-center gap-6 overflow-hidden">
          {/* Decorative glowing border */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-200 via-blue-200 to-purple-100 opacity-30 blur-2xl z-0" />
          {/* Decorative badge/icon */}
          <div className="relative z-10 flex justify-center mb-2">
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 shadow-lg text-white text-3xl animate-pulse">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="text-3xl" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M458.622 255.92l45.985-45.005c13.708-12.977 7.316-36.039-10.664-40.339l-62.65-15.99 17.661-62.015c4.991-17.838-11.829-34.663-29.661-29.671l-61.994 17.667-15.984-62.671C337.085.197 313.765-6.276 300.99 7.228L256 53.57 211.011 7.229c-12.63-13.351-36.047-7.234-40.325 10.668l-15.984 62.671-61.995-17.667C74.87 57.907 58.056 74.738 63.046 92.572l17.661 62.015-62.65 15.99C.069 174.878-6.31 197.944 7.392 210.915l45.985 45.005-45.985 45.004c-13.708 12.977-7.316 36.039 10.664 40.339l62.65 15.99-17.661 62.015c-4.991 17.838 11.829 34.663 29.661 29.671l61.994-17.667 15.984 62.671c4.439 18.575 27.696 24.018 40.325 10.668L256 458.61l44.989 46.001c12.5 13.488 35.987 7.486 40.325-10.668l15.984-62.671 61.994 17.667c17.836 4.994 34.651-11.837 29.661-29.671l-17.661-62.015 62.65-15.99c17.987-4.302 24.366-27.367 10.664-40.339l-45.984-45.004z"></path></svg>
            </span>
          </div>
          <h3 className="relative z-10 text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-blue-200 to-violet-100 drop-shadow-xl">Join Thousands of Learners Today</h3>
          <p className="relative z-10 mb-6 text-lg text-gray-200">Learning has never been this easy, accessible, and impactful.</p>
          <button className="relative z-10 bg-gradient-to-r from-violet-600 to-blue-600 text-white px-12 py-5 rounded-full font-bold text-xl shadow-xl hover:scale-105 hover:from-blue-700 hover:to-violet-700 transition-all flex items-center gap-3 mx-auto animate-bounce border-2 border-violet-400/40">
            Create Your Free Account
          </button>
          {/* Decorative blurred circle */}
          <div className="absolute left-0 bottom-0 w-60 h-60 bg-blue-900/30 rounded-full blur-3xl z-0" />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-white/5 backdrop-blur-xl py-8 px-4 text-center text-sm text-gray-300 flex flex-col md:flex-row items-center justify-between gap-4 border-t-2 border-violet-700/30 mt-12 shadow-2xl overflow-hidden">
        {/* Decorative top gradient bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-blue-500 to-violet-400 opacity-70" />
        <span className="text-gray-300 z-10">© {new Date().getFullYear()} <span className="font-bold text-violet-300">EduRise</span>. All rights reserved.</span>
        <span className="flex gap-4 justify-center mt-2 md:mt-0 z-10">
          <a href="#" className="hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-blue-400/10"><svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.56v14.91c0 2.52-2.05 4.57-4.57 4.57H4.57C2.05 24.04 0 21.99 0 19.47V4.56C0 2.04 2.05 0 4.57 0h14.86C21.95 0 24 2.05 24 4.56zM7.19 20.45h3.09v-7.09H7.19v7.09zm1.54-8.09c.99 0 1.79-.8 1.79-1.79s-.8-1.79-1.79-1.79-1.79.8-1.79 1.79.8 1.79 1.79 1.79zm11.27 8.09h3.09v-4.09c0-2.18-2.62-2.02-2.62 0v4.09zm-1.54-7.09c.99 0 1.79-.8 1.79-1.79s-.8-1.79-1.79-1.79-1.79.8-1.79 1.79.8 1.79 1.79 1.79zm11.27 8.09h3.09v-4.09c0-2.18-2.62-2.02-2.62 0v4.09zm-1.54-7.09c.99 0 1.79-.8 1.79-1.79s-.8-1.79-1.79-1.79-1.79.8-1.79 1.79.8 1.79 1.79 1.79z"/></svg></a>
          <a href="#" className="hover:text-violet-400 transition-colors p-2 rounded-full hover:bg-violet-400/10"><svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.56v14.91c0 2.52-2.05 4.57-4.57 4.57H4.57C2.05 24.04 0 21.99 0 19.47V4.56C0 2.04 2.05 0 4.57 0h14.86C21.95 0 24 2.05 24 4.56zM7.19 20.45h3.09v-7.09H7.19v7.09zm1.54-8.09c.99 0 1.79-.8 1.79-1.79s-.8-1.79-1.79-1.79-1.79.8-1.79 1.79.8 1.79 1.79 1.79zm11.27 8.09h3.09v-4.09c0-2.18-2.62-2.02-2.62 0v4.09zm-1.54-7.09c.99 0 1.79-.8 1.79-1.79s-.8-1.79-1.79-1.79-1.79.8-1.79 1.79.8 1.79 1.79 1.79z"/></svg></a>
          <a href="#" className="hover:text-blue-300 transition-colors p-2 rounded-full hover:bg-blue-300/10"><svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.56v14.91c0 2.52-2.05 4.57-4.57 4.57H4.57C2.05 24.04 0 21.99 0 19.47V4.56C0 2.04 2.05 0 4.57 0h14.86C21.95 0 24 2.05 24 4.56zM7.19 20.45h3.09v-7.09H7.19v7.09zm1.54-8.09c.99 0 1.79-.8 1.79-1.79s-.8-1.79-1.79-1.79-1.79.8-1.79 1.79.8 1.79 1.79 1.79zm11.27 8.09h3.09v-4.09c0-2.18-2.62-2.02-2.62 0v4.09zm-1.54-7.09c.99 0 1.79-.8 1.79-1.79s-.8-1.79-1.79-1.79-1.79.8-1.79 1.79.8 1.79 1.79 1.79z"/></svg></a>
        </span>
      </footer>
    </div>
  );
};

export default LandingPage;
