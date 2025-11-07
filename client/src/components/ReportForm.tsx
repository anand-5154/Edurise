import { useState } from "react";
import { successToast } from "./Toast";
import { giveComplaintS } from "../services/user.services";

const ReportForm = ({
  type,
  subject = "",
  targetId,
}: {
  type: "report" | "complaint";
  subject?: string;
  targetId?: string;
}) => {
  const [form, setForm] = useState({
    subject,
    message: "",
  });
  const [isOpen, setIsOpen] = useState(false);
  const isFormValid = () => {
    return form.subject !== "" && form.message !== "";
  };

  const handleSubmit = async () => {
    try {
      await giveComplaintS(type, form.subject, form.message, targetId);
      successToast("Report Submitted");
      setIsOpen(false);
      setForm({ subject, message: "" });
    } catch (err) {
      console.log(err);
      alert("Failed to submit report.");
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(true)}
        className={`px-4 py-2 rounded-md text-white ${
          type === "report" ? "bg-orange-500" : "bg-blue-600"
        }`}
      >
        {type === "report" ? "Report Course" : "Report a Bug"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg border border-gray-200">
            <h3 className="text-gray-900 text-lg font-bold mb-4">
              {type === "report" ? "Report Course Issue" : "Bug Report"}
            </h3>

            {!subject && (
              <input
                type="text"
                placeholder="Subject"
                value={form.subject}
                onKeyDown={(e) => {
                  if (e.repeat) e.preventDefault();
                }}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full p-2 mb-3 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            <textarea
              placeholder="Describe the issue..."
              value={form.message}
              onKeyDown={(e) => {
                if (e.repeat) e.preventDefault();
              }}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded resize-none mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                disabled={!isFormValid()}
                onClick={handleSubmit}
                className={` text-white px-4 py-2 rounded ${
                  isFormValid()
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportForm;