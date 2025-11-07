import { FaChalkboardTeacher, FaChartLine, FaCertificate } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import image from "../../assets/e learning.jpg";

const UserHomePage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: <FaChalkboardTeacher />, title: "Expert-Led Courses", description: "Learn from top educators and industry leaders with real-world experience." },
    { icon: <FaChartLine />, title: "Progress & Reports", description: "Track goals and achievements with smart progress tools." },
    { icon: <FaCertificate />, title: "Verified Certifications", description: "Earn professional certificates to boost your resume." },
  ];

  const stats = [
    { number: "10K+", label: "Registered Learners" },
    { number: "500+", label: "Expert Instructors" },
    { number: "50K+", label: "Courses Completed" },
    { number: "4.9/5", label: "User Satisfaction" },
  ];

  return (
    <div className="theme-light min-h-screen bg-[var(--bg)] text-[var(--text-800)]">
      <Navbar />

      <section className="pt-28 pb-16">
        <div className="container grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="h1 soft-in">Empower Your Future With <span style={{ color: "var(--primary-600)" }}>Learn At</span></h1>
            <p className="mt-3 text-[color:var(--text-600)] max-w-xl">Discover top-notch courses, track your progress, and earn certificates. Flexible, affordable, and powerful learning — all in one platform.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => navigate("/users/courses")} className="btn btn-primary">Explore Courses</button>
            </div>
          </div>
          <div className="soft-in">
            <div className="glass radius-lg overflow-hidden shadow-2">
              <img src={image} alt="Online Learning" className="w-full h-[22rem] object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container">
          <h2 className="h2 text-center">What We Offer</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card p-7 hover:shadow-2 soft-in" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-[var(--primary-100)] text-[var(--primary-600)] grid place-items-center text-xl">{f.icon}</div>
                <h3 className="mt-3 font-semibold text-[color:var(--text-900)]">{f.title}</h3>
                <p className="mt-1 text-[color:var(--text-600)]">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container">
          <h2 className="h2 text-center">Trusted by Thousands</h2>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="card p-6 text-center soft-in" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="text-3xl font-extrabold" style={{ color: "var(--primary-600)" }}>{s.number}</div>
                <div className="mt-1 text-[color:var(--text-600)]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container text-center">
          <p className="text-[color:var(--text-600)]">Learning has never been this easy, accessible, and impactful.</p>
          <button onClick={() => navigate("/users/courses")} className="btn btn-primary mt-4">Explore Courses</button>
        </div>
      </section>

      <footer className="py-6 text-center text-sm text-[color:var(--text-600)] border-t" style={{ borderColor: "var(--stroke-200)" }}>
        © {new Date().getFullYear()} Learn At. All rights reserved.
      </footer>
    </div>
  );
};

export default UserHomePage;
