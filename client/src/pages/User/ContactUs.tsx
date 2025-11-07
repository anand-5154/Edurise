import React, { useState } from "react";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaPaperPlane,
} from "react-icons/fa";
import Navbar from "../../components/Navbar";

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const contactInfo = [
    { icon: <FaEnvelope />, title: "Email Us", detail: "support@EduRise.com", link: "mailto:support@EduRise.com" },
    { icon: <FaPhone />, title: "Call Us", detail: "+1 (555) 123-4567", link: "tel:+15551234567" },
    { icon: <FaMapMarkerAlt />, title: "Visit Us", detail: "123 Learning Street, Education City, EC 12345", link: "#" },
  ];

  const socialMedia = [
    { icon: <FaFacebook />, name: "Facebook", link: "#" },
    { icon: <FaTwitter />, name: "Twitter", link: "#" },
    { icon: <FaLinkedin />, name: "LinkedIn", link: "#" },
    { icon: <FaInstagram />, name: "Instagram", link: "#" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitted(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-800)]">
      <Navbar />

      <section className="pt-24 pb-12">
        <div className="container text-center">
          <h1 className="h1 soft-in">Get In Touch</h1>
          <p className="mt-3 text-[color:var(--text-600)] max-w-2xl mx-auto">
            Have questions? We’d love to hear from you. Send a message and we’ll respond as soon as possible.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="container grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactInfo.map((info, i) => (
            <a key={i} href={info.link} className="card p-7 hover:shadow-2 soft-in text-center" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="w-14 h-14 rounded-xl bg-[var(--primary-100)] text-[var(--primary-600)] flex items-center justify-center text-2xl mb-3 mx-auto">
                {info.icon}
              </div>
              <h3 className="font-semibold">{info.title}</h3>
              <p className="mt-1 text-[color:var(--text-600)]">{info.detail}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="container grid lg:grid-cols-2 gap-8">
          <div className="card p-8">
            <h2 className="h3">Send Us a Message</h2>

            {submitted && <div className="alert alert-success mt-4">✓ Thank you! Your message has been sent.</div>}

            <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
              <div>
                <label className="block text-sm font-medium text-[color:var(--text-600)] mb-1">Full Name</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--text-600)] mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--text-600)] mb-1">Subject</label>
                <input name="subject" value={formData.subject} onChange={handleChange} placeholder="How can we help?" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--text-600)] mb-1">Message</label>
                <textarea rows={5} name="message" value={formData.message} onChange={handleChange} placeholder="Tell us more..." required />
                <p className="field-help mt-1">We usually reply within 24 hours (Mon–Fri).</p>
              </div>
              <button type="submit" className="btn btn-primary w-full">
                <FaPaperPlane />
                Send Message
              </button>
            </form>
          </div>

          <div className="grid gap-8">
            <div className="card p-8">
              <h3 className="h4">Why Contact Us?</h3>
              <ul className="mt-3 grid gap-2">
                {[
                  "Help with enrollment & navigation",
                  "Technical support for issues",
                  "Partnership & collaboration",
                  "Feedback to improve the platform",
                  "Questions on courses & certificates",
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span style={{ color: "var(--primary-600)" }}>✓</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-8">
              <h3 className="h4">Follow Us</h3>
              <div className="mt-3 flex gap-3">
                {socialMedia.map((s, i) => (
                  <a key={i} href={s.link} aria-label={s.name} className="btn btn-ghost radius-lg">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-6 text-center text-sm text-[color:var(--text-600)] border-t" style={{ borderColor: "var(--stroke-200)" }}>
        © {new Date().getFullYear()} Learn At. All rights reserved.
      </footer>
    </div>
  );
};

export default ContactPage;
