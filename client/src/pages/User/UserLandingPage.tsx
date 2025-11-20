import { useEffect } from "react";
import heroImage from "../../assets/publicImage.jpg";
import { FaPlayCircle, FaUsers, FaLightbulb } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const PublicLandingPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("usersToken");

  useEffect(() => {
    if (token) navigate("/home", { replace: true });
  }, [token, navigate]);

  const features = [
    { icon: <FaPlayCircle />, title: "EduRise Your Pace", description: "Access your lessons anytime, anywhere." },
    { icon: <FaUsers />, title: "Global Community", description: "Collaborate with learners and mentors worldwide." },
    { icon: <FaLightbulb />, title: "Hands-on Experience", description: "Build real-world projects and job-ready skills." },
  ];

  return (
    <div className="theme-light min-h-screen bg-[var(--bg)] text-[var(--text-800)]">
      <section className="container pt-24 lg:pt-28 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="h1 soft-in">Unlock Knowledge. Build Your Future.</h1>
          <p className="mt-3 text-[color:var(--text-600)] max-w-xl">Step into a world of limitless learning. From coding to design, get the tools, community, and confidence to achieve your goals.</p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => navigate("/users/register")} className="btn btn-primary">Get Started Free</button>
            <button onClick={() => navigate("/users/login")} className="btn btn-ghost">Sign In</button>
          </div>
        </div>

        <div className="soft-in">
          <div className="glass radius-lg overflow-hidden shadow-2">
            <img src={heroImage} alt="Learning Illustration" className="w-full h-[24rem] object-cover" />
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="card p-8 text-center hover:shadow-2 soft-in" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="text-2xl mb-3 w-12 h-12 rounded-xl bg-[var(--primary-100)] text-[var(--primary-600)] grid place-items-center">{f.icon}</div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-[color:var(--text-600)]">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-6 text-center text-sm text-[color:var(--text-600)] border-t" style={{ borderColor: "var(--stroke-200)" }}>
        © {new Date().getFullYear()} EduRise. All rights reserved.
      </footer>
    </div>
  );
};

export default PublicLandingPage;
