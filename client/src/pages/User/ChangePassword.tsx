import { useState, type ChangeEvent, type FormEvent } from "react";
import { errorToast, successToast } from "../../components/Toast";
import { changePasswordS } from "../../services/user.services";
import type { AxiosError } from "axios";
import Navbar from "../../components/Navbar";

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = formData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      errorToast("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      errorToast("Passwords don't match");
      return;
    }

    try {
      setSubmitting(true);
      await changePasswordS(formData);
      successToast("Password changed successfully");
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      errorToast(error.response?.data?.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-800)]">
      <Navbar />
      <section className="pt-24 pb-12">
        <div className="container">
          <div className="max-w-xl mx-auto card p-8 soft-in">
            <h2 className="h3 text-center">Change Password</h2>
            <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
              <div>
                <label className="block text-sm font-medium text-[color:var(--text-600)] mb-1">
                  Old Password
                </label>
                <input
                  type="password"
                  name="oldPassword"
                  placeholder="Enter old password"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[color:var(--text-600)] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Create new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[color:var(--text-600)] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                {submitting ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
