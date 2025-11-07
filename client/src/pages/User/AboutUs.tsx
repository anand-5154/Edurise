import {
  FaRocket,
  FaUsers,
  FaGraduationCap,
  FaHeart,
  FaLightbulb,
  FaAward,
  FaGlobe,
  FaHandshake,
} from "react-icons/fa";
import Navbar from "../../components/Navbar";

const AboutPage = () => {
  const values = [
    {
      icon: <FaLightbulb />,
      title: "Innovation",
      description:
        "Cutting-edge technology meets educational excellence to create transformative learning experiences.",
    },
    {
      icon: <FaUsers />,
      title: "Community",
      description:
        "A thriving ecosystem where learners and educators connect, collaborate, and grow together.",
    },
    {
      icon: <FaAward />,
      title: "Excellence",
      description:
        "Uncompromising quality in every course, every interaction, and every learning outcome.",
    },
    {
      icon: <FaHeart />,
      title: "Accessibility",
      description:
        "Breaking down barriers to make world-class education available to everyone, everywhere.",
    },
    {
      icon: <FaGlobe />,
      title: "Global Impact",
      description:
        "Empowering learners worldwide to transform their careers and lives.",
    },
    {
      icon: <FaHandshake />,
      title: "Trust",
      description:
        "Building lasting relationships through transparency and integrity.",
    },
  ];

  const stats = [
    { number: "10K+", label: "Registered Learners" },
    { number: "500+", label: "Expert Instructors" },
    { number: "50K+", label: "Courses Completed" },
    { number: "4.9/5", label: "User Satisfaction" },
  ];

  const milestones = [
    {
      year: "2020",
      title: "The Beginning",
      description: "Learn At was founded with a vision to democratize education.",
    },
    {
      year: "2022",
      title: "Rapid Growth",
      description: "Reached 5,000+ active learners and 200+ courses.",
    },
    {
      year: "2024",
      title: "Global Expansion",
      description: "Expanded to serve learners in over 50 countries.",
    },
    {
      year: "2025",
      title: "Innovation Leader",
      description: "Launched AI-powered personalized learning paths.",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-800)]">
      <Navbar />

      <section className="pt-24 pb-12">
        <div className="container text-center">
          <h1 className="h1 soft-in">
            About <span style={{ color: "var(--primary-600)" }}>Learn At</span>
          </h1>
          <p className="mt-3 text-[color:var(--text-600)] max-w-2xl mx-auto">
            Empowering minds and transforming futures through accessible, world-class education.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="card p-8 soft-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-[var(--primary-100)] flex items-center justify-center text-[var(--primary-600)] text-2xl">
                <FaRocket />
              </div>
              <h2 className="h3 m-0">Our Story</h2>
            </div>
            <div className="grid gap-4">
              <p>
                Learn At was born from a simple yet powerful vision: education should be a right, not a privilege. Traditional barriers—cost, location, accessibility—often block talent from reaching full potential.
              </p>
              <p>
                What started as a passion project is now a thriving platform serving thousands worldwide. We partner with industry experts to create courses that don’t just teach — they transform.
              </p>
              <p>
                Today, Learn At stands as a beacon for anyone seeking to learn, grow, and succeed. Whether you’re starting a career, advancing, or exploring a passion, we’re here every step.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container grid md:grid-cols-2 gap-6">
          <div className="card p-7 hover:shadow-2">
            <div className="w-12 h-12 rounded-xl bg-[var(--primary-100)] text-[var(--primary-600)] flex items-center justify-center text-xl mb-3">
              <FaGraduationCap />
            </div>
            <h3 className="h4">Our Mission</h3>
            <p className="mt-2 text-[color:var(--text-600)]">
              Democratize education with accessible, high-quality learning that empowers individuals to achieve goals and transform their lives.
            </p>
          </div>
          <div className="card p-7 hover:shadow-2">
            <div className="w-12 h-12 rounded-xl bg-[var(--primary-100)] text-[var(--primary-600)] flex items-center justify-center text-xl mb-3">
              <FaRocket />
            </div>
            <h3 className="h4">Our Vision</h3>
            <p className="mt-2 text-[color:var(--text-600)]">
              Become the most trusted learning platform where curiosity meets opportunity and every learner unlocks full potential.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <h2 className="h2 text-center">Our Core Values</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div key={i} className="card p-7 hover:shadow-2 soft-in" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-[var(--primary-100)] text-[var(--primary-600)] flex items-center justify-center text-xl mb-3">
                  {v.icon}
                </div>
                <h3 className="font-semibold text-[color:var(--text-900)]">{v.title}</h3>
                <p className="mt-1 text-[color:var(--text-600)]">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <h2 className="h2 text-center">Our Impact</h2>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="card p-6 text-center soft-in" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="text-3xl font-extrabold" style={{ color: "var(--primary-600)" }}>
                  {s.number}
                </div>
                <div className="mt-1 text-[color:var(--text-600)]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <h2 className="h2 text-center">Our Journey</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((m, i) => (
              <div key={i} className="card p-6 soft-in" style={{ animationDelay: `${i * 70}ms` }}>
                <div className="text-xl font-bold" style={{ color: "var(--primary-600)" }}>
                  {m.year}
                </div>
                <h3 className="mt-1 font-semibold">{m.title}</h3>
                <p className="mt-1 text-[color:var(--text-600)] text-sm">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container">
          <div className="text-center card p-8">
            <h3 className="h3">Join Our Learning Community</h3>
            <p className="mt-2 text-[color:var(--text-600)]">Be part of a global movement that’s transforming education and empowering futures.</p>
            <button className="btn btn-primary mt-6">Start Learning Today</button>
          </div>
        </div>
      </section>

      <footer className="py-6 text-center text-sm text-[color:var(--text-600)] border-t" style={{ borderColor: "var(--stroke-200)" }}>
        © {new Date().getFullYear()} Learn At. All rights reserved.
      </footer>
    </div>
  );
};

export default AboutPage;
