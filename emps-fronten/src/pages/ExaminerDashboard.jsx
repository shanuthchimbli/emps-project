import React, { useEffect, useState } from "react";
import axios from "axios";
import { LayoutDashboard, FileText, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ExaminerDashboard = () => {
  const [papers, setPapers] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [message, setMessage] = useState("");
  const [view, setView] = useState("dashboard");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const profilePic = localStorage.getItem("profilePic");

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const res = await axios.get("http://localhost:5500/api/papers/assigned", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const filtered = res.data
        .filter((p) => p.status === "submitted_to_examiner")
        .sort((a, b) => b.version - a.version || new Date(b.updatedAt) - new Date(a.updatedAt));

      setPapers(filtered);
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
      setMessage("Review submitted.");
      fetchPapers();
    } catch (err) {
      console.error("Submission failed", err);
      setMessage("Failed to submit review.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 px-6 py-4 border-b">
            {profilePic ? (
              <img
                src={profilePic}
                alt="Examiner"
                className="w-8 h-8 rounded-full border-2 border-green-500 shadow"
              />
            ) : (
              <User className="w-6 h-6 text-green-600" />
            )}
            <span className="text-green-800 font-semibold">Hey! {user?.name || 'Examiner'}</span>
          </div>
          <nav className="flex flex-col p-4 gap-2 text-gray-700 text-sm font-medium">
            <button
              className={`flex items-center gap-2 p-2 rounded hover:bg-green-100 transition ${view === 'dashboard' && 'bg-green-50 font-semibold'}`}
              onClick={() => setView("dashboard")}
            >
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </button>
            <button
              className={`flex items-center gap-2 p-2 rounded hover:bg-green-100 transition ${view === 'mypapers' && 'bg-green-50 font-semibold'}`}
              onClick={() => setView("mypapers")}
            >
              <FileText className="w-5 h-5" /> My Papers
            </button>
            <button
              className={`flex items-center gap-2 p-2 rounded hover:bg-green-100 transition ${view === 'profile' && 'bg-green-50 font-semibold'}`}
              onClick={() => setView("profile")}
            >
              <User className="w-5 h-5" /> My Profile
            </button>
          </nav>
        </div>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {view === "dashboard" && (
          <>
            <h1 className="text-2xl font-bold mb-4">Examiner Dashboard</h1>
            {message && <p className="text-green-600 mb-4">{message}</p>}
            {papers.map((paper) => (
              <div key={paper._id} className="bg-white shadow rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold mb-2">{paper.originalName}</h2>
                <p className="mb-1 text-sm text-gray-700">
                  <strong>Setter Feedback:</strong> {paper.feedback || "No feedback"}
                </p>
                <iframe
                  src={`http://localhost:5500/uploads/${paper.filename}`}
                  className="w-full h-64 mb-4"
                  style={{ height: "600px", border: "1px solid #ccc" }}
                ></iframe>
                <textarea
                  placeholder="Write your feedback..."
                  value={feedbackMap[paper._id] || ""}
                  onChange={(e) => handleFeedbackChange(paper._id, e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 mb-2"
                ></textarea>
                <select
                  value={statusMap[paper._id] || ""}
                  onChange={(e) => handleStatusChange(paper._id, e.target.value)}
                  className="border border-gray-400 rounded-md px-4 py-2"
                >
                  <option value="">Select action</option>
                  <option value="approved_final">Approve → Submit to Exam Office</option>
                  <option value="rejected_by_examiner">Reject → Back to Setter</option>
                </select>
                <button
                  onClick={() => handleSubmit(paper._id)}
                  className="ml-4 mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  Submit Review
                </button>
              </div>
            ))}
          </>
        )}

        {view === "mypapers" && (
          <div className="text-center mt-16 text-gray-600 text-lg">
            {papers
              .filter((p) =>
                ["approved_final", "rejected_by_examiner"].includes(p.status)
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
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8 flex items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <img
                src={profilePic || "https://api.dicebear.com/7.x/thumbs/svg?seed=Examiner"}
                alt="Profile"
                className="w-28 h-28 rounded-full border-4 border-green-200 shadow-md object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-700 mb-2 flex items-center gap-2">
                Profile
              </h2>
              <p className="text-gray-700 text-sm mb-1"><strong>Name:</strong> {user?.name}</p>
              <p className="text-gray-700 text-sm mb-1"><strong>Email:</strong> {user?.email}</p>
              <p className="text-gray-700 text-sm mb-1"><strong>Role:</strong> {user?.role}</p>
              <p className="text-gray-700 text-sm mb-1"><strong>Department:</strong> {user?.department}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExaminerDashboard;
