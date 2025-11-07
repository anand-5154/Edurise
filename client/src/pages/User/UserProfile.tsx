import { useState, useContext, useEffect } from "react";
import UserContext from "../../context/UserContext";
import { Mail, User, Phone } from "lucide-react";
import { errorToast } from "../../components/Toast";
import { editProfileS } from "../../services/user.services";
import ReportForm from "../../components/ReportForm";
import PurchaseHistory from "./CoursePurchaseHistory";
import PurchasedCourses from "./PurchasedCourses";
import ChangePassword from "./ChangePassword";
import Navbar from "../../components/Navbar";
import UserCertificates from "./Certificates";
import { useLocation } from "react-router-dom";
import type { AxiosError } from "axios";

const UserProfile = () => {
  const context = useContext(UserContext);
  const { user, setUser } = context || {};
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "Profile");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({ name: user?.name || "", phone: user?.phone || "" });

  const tabs = ["Profile", "Course History", "My Courses", "Certificates", ...(user?.googleId ? [] : ["Change Password"])];

  useEffect(() => {
    if (user) setFormData({ name: user.name, phone: user.phone });
  }, [user]);

  const validateForm = () => {
    if (formData.name.length > 20) {
      errorToast("Name cannot exceed 20 characters");
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      errorToast("Phone number must be exactly 10 digits");
      return false;
    }
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const isFormValid = () => formData.name.trim() !== "";

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      formPayload.append("phone", formData.phone);
      if (selectedFile) formPayload.append("profilePicture", selectedFile);
      const res = await editProfileS(formPayload);
      setUser?.(res.data);
      setIsEditing(false);
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      errorToast(error.response?.data?.message ?? "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!user) return;
    setFormData({ name: user.name, phone: user.phone });
    setIsEditing(false);
  };

  if (!user) return <div className="text-center pt-24">Loading...</div>;

  return (
    <div className="theme-light min-h-screen bg-[var(--bg)] text-[var(--text-800)]">
      <Navbar />
      <div className="container pt-20">
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === tab ? "btn btn-ghost" : "ring-1 ring-[var(--stroke-200)]"}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="card p-6">
          {activeTab === "Profile" && (
            <div>
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-24 h-24">
                  <img src={user.profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover ring-2 ring-[var(--primary-200)]" />
                  {isEditing && (
                    <>
                      <label htmlFor="profile-upload" className="absolute inset-0 rounded-full bg-black/30 grid place-items-center text-white cursor-pointer">+</label>
                      <input type="file" id="profile-upload" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="hidden" />
                    </>
                  )}
                </div>
                <h2 className="mt-3 text-xl font-semibold">{user.name}</h2>
                <p className="text-[color:var(--text-600)]">@{user.username}</p>
                <div className="mt-3 w-full max-w-md">
                  <ReportForm type="complaint" />
                </div>
              </div>

              <div className="text-center mb-6">
                <button onClick={() => setIsEditing(!isEditing)} className="btn btn-primary">{isEditing ? "Cancel" : "Edit Profile"}</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-1"><Mail className="w-4 h-4" /> Email</label>
                  <p className="bg-[var(--bg-soft)] px-3 py-2 radius-md">{user.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-1"><User className="w-4 h-4" /> Username</label>
                  <p className="bg-[var(--bg-soft)] px-3 py-2 radius-md">{user.username}</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1">Full Name</label>
                  {isEditing ? (
                    <input name="name" value={formData.name} onChange={handleInputChange} />
                  ) : (
                    <p className="bg-[var(--bg-soft)] px-3 py-2 radius-md">{user.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-1"><Phone className="w-4 h-4" /> Phone</label>
                  {isEditing ? (
                    <input name="phone" value={formData.phone} onChange={handleInputChange} />
                  ) : (
                    <p className="bg-[var(--bg-soft)] px-3 py-2 radius-md">{user.phone}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-4 mt-6">
                  <button onClick={handleSave} disabled={isLoading || !isFormValid()} className="btn btn-primary flex-1">{isLoading ? "Saving..." : "Save Changes"}</button>
                  <button onClick={handleCancel} className="btn btn-ghost flex-1">Cancel</button>
                </div>
              )}
            </div>
          )}

          {activeTab === "Course History" && <PurchaseHistory />}
          {activeTab === "My Courses" && <PurchasedCourses />}
          {activeTab === "Change Password" && <ChangePassword />}
          {activeTab === "Certificates" && <UserCertificates />}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
