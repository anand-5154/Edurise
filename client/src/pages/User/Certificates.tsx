import { useEffect, useState } from "react";
import { errorToast } from "../../components/Toast";
import { useAuth } from "../../hooks/useAuth";
import { getCertificatesS } from "../../services/user.services";
import type { AxiosError } from "axios";
import { X } from "lucide-react";
import Navbar from "../../components/Navbar";

interface Certificate {
  _id: string;
  user: string;
  course: string;
  courseTitle: string;
  certificateUrl: string;
  issuedDate: string;
}

const UserCertificates = () => {
  const { authUser } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authUser) return;
    const fetchCertificates = async () => {
      setLoading(true);
      try {
        const res = await getCertificatesS(authUser._id!);
        setCertificates(res.data);
      } catch (err: unknown) {
        const error = err as AxiosError<{ message: string }>;
        errorToast(error.response?.data?.message ?? "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, [authUser]);

  const empty = !loading && certificates.length === 0;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-800)]">
      <Navbar />

      <section className="pt-24 pb-10">
        <div className="container">
          <h2 className="h2">Your Certificates</h2>
          <p className="mt-2 text-[color:var(--text-600)]">Access, preview, and download your earned certificates.</p>

          {loading && (
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-40" />
              ))}
            </div>
          )}

          {empty && (
            <div className="mt-8 card p-8 text-center soft-in">
              <h3 className="h4">No certificates yet</h3>
              <p className="mt-1 text-[color:var(--text-600)]">Complete courses to earn shareable certificates.</p>
              <button className="btn btn-primary mt-4">Browse Courses</button>
            </div>
          )}

          {!loading && certificates.length > 0 && (
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <div key={cert._id} className="card p-6 soft-in">
                  <div className="text-sm text-[color:var(--text-600)]">
                    Issued {new Date(cert.issuedDate).toLocaleDateString()}
                  </div>
                  <h3 className="mt-1 font-semibold text-[color:var(--text-900)]">{cert.courseTitle}</h3>
                  <div className="mt-4 flex gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSelectedPdf(cert.certificateUrl);
                        setIsModalOpen(true);
                      }}
                    >
                      View
                    </button>
                    <a className="btn btn-outline" href={cert.certificateUrl} target="_blank" rel="noreferrer">
                      Open
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isModalOpen && selectedPdf && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
              <div className="bg-white radius-lg shadow-3 w-full max-w-5xl h-[75vh] relative">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedPdf(null);
                  }}
                  className="btn btn-ghost absolute top-3 right-3"
                >
                  <X size={18} />
                </button>
                <iframe src={`${selectedPdf}#navpanes=0`} title="Certificate PDF" className="w-full h-full border-none" />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default UserCertificates;
