import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  FileText,
  User,
  LogOut,
} from "lucide-react";

const CheckerDashboard = () => {
  const [view, setView] = useState("dashboard");
  const [papers, setPapers] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [message, setMessage] = useState("");
  const [profileImage, setProfileImage] = useState(localStorage.getItem("profileImage") || "");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const res = await axios.get("http://localhost:5500/api/papers/assigned", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sorted = res.data.sort(
        (a, b) => b.version - a.version || new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setPapers(sorted);
    } catch (err) {
      console.error("Error fetching papers:", err);
    }
  };

  const handleFeedbackChange = (id, value) => {
    setFeedbackMap((prev) => ({ ...prev, [id]: value }));
  };

  const handleStatusChange = (id, value) => {
    setStatusMap((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (id) => {
    const feedback = feedbackMap[id];
    const status = statusMap[id];
    if (!feedback || !status) {
      alert("Please enter feedback and select status.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5500/api/papers/status/${id}`,
        { feedback, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Feedback submitted");
      fetchPapers();
    } catch (err) {
      console.error("Update failed", err);
      setMessage("❌ Failed to update paper");
    }
  };

  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
      localStorage.setItem("profileImage", reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-3 px-6 py-4 border-b">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-blue-500 shadow"
                />
              ) : (
                <User className="w-6 h-6 text-blue-600" />
              )}
              <span className="text-blue-800 font-semibold">Hey! {user?.name}</span>
            </div>

            <nav className="flex flex-col p-4 gap-2 text-gray-700 text-sm font-medium">
              <button onClick={() => setView("dashboard")} className={`flex items-center gap-2 p-2 rounded hover:bg-blue-100 ${view === "dashboard" && "bg-blue-50 font-semibold"}`}>
                <LayoutDashboard className="w-5 h-5" /> Dashboard
              </button>
              <button onClick={() => setView("mypapers")} className={`flex items-center gap-2 p-2 rounded hover:bg-blue-100 ${view === "mypapers" && "bg-blue-50 font-semibold"}`}>
                <FileText className="w-5 h-5" /> My Papers
              </button>
              <button onClick={() => setView("profile")} className={`flex items-center gap-2 p-2 rounded hover:bg-blue-100 ${view === "profile" && "bg-blue-50 font-semibold"}`}>
                <User className="w-5 h-5" /> Profile
              </button>
            </nav>
          </div>

          <div className="p-4 border-t">
            <button onClick={logout} className="flex items-center gap-2 text-red-600 hover:text-red-800">
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100">
        {message && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4">{message}</div>
        )}

        {view === "dashboard" && (
          <>
            <h2 className="text-xl font-semibold mb-4">Assigned Papers</h2>
            {papers
              .filter((p) => p.status === "submitted_to_checker")
              .map((paper) => (
                <div key={paper._id} className="bg-white p-4 rounded shadow mb-6">
                  <h3 className="font-semibold">{paper.originalName}</h3>
                  <p className="text-sm mb-2">Setter Feedback: {paper.feedback || "None"}</p>

                  {/* 🔥 Keywords Section */}
                  {paper.keywords && paper.keywords.length > 0 && (
                    <div className="bg-yellow-100 text-yellow-800 p-2 rounded mb-3 text-sm shadow-sm border border-yellow-300">
                      <strong>Keywords:</strong> {paper.keywords.join(", ")}
                    </div>
                  )}

                  <iframe
                    src={`http://localhost:5500/uploads/${paper.filename}`}
                    className="w-full h-96 border my-4"
                  />
                  <textarea
                    placeholder="Write your feedback"
                    className="w-full p-2 border rounded mb-2"
                    value={feedbackMap[paper._id] || ""}
                    onChange={(e) => handleFeedbackChange(paper._id, e.target.value)}
                  />
                  <select
                    className="border p-2 rounded mb-2"
                    value={statusMap[paper._id] || ""}
                    onChange={(e) => handleStatusChange(paper._id, e.target.value)}
                  >
                    <option value="">Select action</option>
                    <option value="submitted_to_examiner">✔️ Approve → Send to Examiner</option>
                    <option value="rejected_by_checker">❌ Reject → Back to Setter</option>
                  </select>
                  <button
                    onClick={() => handleSubmit(paper._id)}
                    className="ml-4 bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Submit
                  </button>
                </div>
              ))}
          </>
        )}

        {view === "mypapers" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">My Papers (History)</h2>
            {papers
              .filter((p) =>
                ["submitted_to_examiner", "approved_final", "rejected_by_examiner"].includes(p.status)
              )
              .map((paper) => (
                <details key={paper._id} className="bg-white p-4 rounded shadow mb-4">
                  <summary className="cursor-pointer font-medium">
                    {paper.originalName} — <span className="text-blue-700">{paper.status}</span>
                  </summary>
                  <p className="text-sm text-gray-600 mt-2 mb-2">Feedback: {paper.feedback}</p>
                  <iframe
                    src={`http://localhost:5500/uploads/${paper.filename}`}
                    className="w-full h-80 border mt-2"
                  />
                </details>
              ))}
          </div>
        )}

        {view === "profile" && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
            <div className="flex flex-col items-center mb-4">
              <img
                src={profileImage || "/default-avatar.png"}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-2 border-gray-300"
              />
              <label className="text-blue-600 font-medium cursor-pointer mt-2 text-sm hover:underline">
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <h2 className="text-xl font-bold text-center mb-2">My Profile</h2>
            <p className="text-gray-700"><strong>Name:</strong> {user?.name}</p>
            <p className="text-gray-700"><strong>Email:</strong> {user?.email}</p>
            <p className="text-gray-700"><strong>Role:</strong> {user?.role}</p>
            <p className="text-gray-700"><strong>Department:</strong> {user?.department}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CheckerDashboard;
