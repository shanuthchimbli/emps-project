import React, { useEffect, useState } from "react";
import axios from "axios";
import { User } from "lucide-react";
import CompareVersions from "./CompareVersions";


const SetterDashboard = () => {
  const [view, setView] = useState("dashboard");
  const [papers, setPapers] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [reuploadFeedback, setReuploadFeedback] = useState({});
  const [reuploadStatus, setReuploadStatus] = useState({});
  const [module, setModule] = useState("");
  const [checkers, setCheckers] = useState([]);
  const [selectedChecker, setSelectedChecker] = useState('');
  const [summaryMap, setSummaryMap] = useState({});
  const [loadingSummaryId, setLoadingSummaryId] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [profileImage, setProfileImage] = useState(
  localStorage.getItem("profileImage") || ""
);
const user = JSON.parse(localStorage.getItem("user"));


  const token = localStorage.getItem("token");


   const handleProfileImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      localStorage.setItem("profileImage", base64);
      setProfileImage(base64);
    };
    reader.readAsDataURL(file);
  }
};


  const handleViewSummary = async (paperId) => {
    setLoadingSummaryId(paperId);
    try {
      const response = await axios.post(
        `http://localhost:5500/api/nlp/summarize/${paperId}`
      );
      setSummaryMap(prev => ({ ...prev, [paperId]: response.data.summary }));
    } catch (err) {
      console.error("Error fetching summary:", err.message);
      setSummaryMap(prev => ({ ...prev, [paperId]: "Failed to load summary." }));
    } finally {
      setLoadingSummaryId(null);
    }
  };

  useEffect(() => {
    const fetchCheckers = async () => {
      try {
        const res = await axios.get('http://localhost:5500/api/papers/approved-checkers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCheckers(res.data.checkers);
      } catch (err) {
        console.error('Error fetching checkers:', err);
      }
    };

    fetchCheckers();
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const res = await axios.get("http://localhost:5500/api/papers/assigned", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPapers(res.data);
    } catch (err) {
      console.error("Error fetching papers:", err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !feedback) return;

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("feedback", feedback);
    formData.append("module", module);
    formData.append("checkerId", selectedChecker);

    try {
      await axios.post("http://localhost:5500/api/papers/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage("Uploaded successfully!");
      setFile(null);
      setFeedback("");
      fetchPapers();
    } catch {
      setMessage("Upload failed");
    }
  };

  const handleStatusChange = (paperId, status) => {
    setSelectedStatus((prev) => ({ ...prev, [paperId]: status }));
  };

  const handleReuploadStatusChange = (paperId, value) => {
    setReuploadStatus((prev) => ({ ...prev, [paperId]: value }));
  };

  const handleReuploadFeedbackChange = (paperId, value) => {
    setReuploadFeedback((prev) => ({ ...prev, [paperId]: value }));
  };

  const handleSubmit = async (paperId) => {
    const status = selectedStatus[paperId];
    if (!status) return;

    try {
      await axios.put(
        `http://localhost:5500/api/papers/status/${paperId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Status updated");
      fetchPapers();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDelete = async (paperId) => {
    if (!window.confirm("Are you sure you want to delete this paper?")) return;

    try {
      await axios.delete(`http://localhost:5500/api/papers/delete/${paperId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Paper deleted successfully");
      fetchPapers();
    } catch (err) {
      console.error("Delete failed", err);
      setMessage("Failed to delete paper");
    }
  };
  



  const renderDashboard = () => (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Upload New Paper</h2>
      <div className="mb-4">
  <div className="mb-4 relative group w-full max-w-md">
  
  
  
</div>

</div>
      <form onSubmit={handleUpload} className="bg-white shadow rounded p-4 mb-6">
        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} className="mb-2" />
        <textarea placeholder="Enter feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full border p-2 rounded mb-2" required />
        <input type="text" placeholder="Module name" value={module} onChange={(e) => setModule(e.target.value)} className="w-full border p-2 rounded mb-2" required />
        <select value={selectedChecker} onChange={(e) => setSelectedChecker(e.target.value)} className="w-full border p-2 mb-4">
          <option value="">Select a Checker</option>
          {checkers.map((checker) => (
            <option key={checker._id} value={checker._id}>{checker.name} ({checker.email})</option>
          ))}
        </select>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Upload</button>
      </form>

      {message && <p className="text-green-600 mb-4">{message}</p>}
     

      {(papers.filter(p =>
        ["draft", "rejected_by_checker", "rejected_by_examiner", "submitted_to_checker", "submitted_to_examiner"].includes(p.status)
      ).map((paper) => (


        <div key={paper._id} className="bg-gray-50 p-4 rounded shadow mb-4">
          <h3 className="font-semibold">{paper.originalName}</h3>
          <p>Status: {paper.status}</p>
          <p>Feedback: {paper.feedback}</p>
          <button className="bg-red-600 text-white px-2 py-1 rounded mt-2" onClick={() => handleDelete(paper._id)}>Delete</button>
          <object data={`http://localhost:5500/uploads/${paper.filename}`} type="application/pdf" width="100%" height="400px" className="my-2" />

          <button onClick={() => handleViewSummary(paper._id)} className="bg-purple-600 text-white px-3 py-1 rounded">
            {loadingSummaryId === paper._id ? "Loading..." : "View Summary"}
          </button>

          {summaryMap[paper._id] && (
            <div className="bg-white border-l-4 border-purple-600 p-3 mt-2">
              <strong>Summary:</strong> {summaryMap[paper._id]}
            </div>
          )}
         
          {paper.status === "draft" && (
            <>
              <select value={selectedStatus[paper._id] || ""} onChange={(e) => handleStatusChange(paper._id, e.target.value)} className="border p-2 mr-2">
                <option value="">Submit to</option>
                <option value="submitted_to_checker">Checker</option>
                <option value="submitted_to_examiner">Examiner</option>
              </select>
              <button onClick={() => handleSubmit(paper._id)} className="bg-green-600 text-white px-3 py-1 rounded">Submit</button>
            </>
          )}

          {(paper.status === "rejected_by_checker" || paper.status === "rejected_by_examiner") && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData();
              formData.append("pdf", file);
              formData.append("status", reuploadStatus[paper._id]);
              formData.append("feedback", reuploadFeedback[paper._id]);
              try {
                await axios.put(`http://localhost:5500/api/papers/reupload/${paper._id}`, formData, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                  },
                });
                setMessage("Reuploaded successfully");
                fetchPapers();
              } catch (err) {
                setMessage("Reupload failed");
              }
            }} className="mt-2">
              <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} className="mb-2" />
              <textarea placeholder="New feedback" value={reuploadFeedback[paper._id] || ""} onChange={(e) => handleReuploadFeedbackChange(paper._id, e.target.value)} className="w-full border p-2 rounded mb-2" required />
              <select value={reuploadStatus[paper._id] || ""} onChange={(e) => handleReuploadStatusChange(paper._id, e.target.value)} className="w-full border p-2 mb-2">
                <option value="">Submit to</option>
                <option value="submitted_to_checker">Checker</option>
                <option value="submitted_to_examiner">Examiner</option>
              </select>
              <button type="submit" className="bg-purple-600 text-white px-3 py-1 rounded">Reupload</button>
            </form>
          )}

        </div>
      ))
      
      )}
      

    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h1 className="text-xl font-bold mb-4">HEY!!!{user?.name || 'Setter'}</h1>
        <nav>
          <button onClick={() => setView("profile")} className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded">My Profile</button>
          <button onClick={() => setView("dashboard")} className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded">Dashboard</button>
          <button onClick={() => setView("history")} className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded">My Papers</button>
          <button onClick={() => setView("compare")} className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded">Compare</button>

          <button onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }} className="block w-full text-left px-4 py-2 mt-8 bg-red-600 hover:bg-red-700 rounded">Logout</button>
        </nav>
      </aside>
      <main className="flex-1 bg-gray-100 p-6">
        {view === "dashboard" && renderDashboard()}
        {view === "history" && (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">My Papers (History)</h2>
    
    {papers.filter(p => p.status === "submitted_to_office").map((paper, index) => (
      <div key={paper._id} className="mb-2">
        <button
          onClick={() =>
            setExpandedIndex((prev) => (prev === index ? null : index))
          }
          className="w-full text-left bg-white p-3 rounded shadow hover:bg-gray-100 transition"
        >
          <span className="font-semibold">Paper {index + 1}:</span> {paper.originalName}
        </button>

        {expandedIndex === index && (
          <div className="bg-gray-50 p-4 border-l-4 border-blue-500 rounded shadow-inner mt-1">
            <p><strong>Status:</strong> {paper.status}</p>
            <p><strong>Feedback:</strong> {paper.feedback}</p>
            <object
              data={`http://localhost:5500/uploads/${paper.filename}`}
              type="application/pdf"
              width="100%"
              height="300px"
              className="my-2"
            />
          </div>
        )}
      </div>
    ))}

    {papers.filter(p => p.status === "submitted_to_office").length === 0 && (
      <p className="text-gray-600">No historical papers submitted to office.</p>
    )}
  </div>
)}

                {view === "profile" && (
  <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8 flex items-center gap-6">
  <div className="flex flex-col items-center gap-2">
    <img
      src={
        profileImage ||
        "https://api.dicebear.com/7.x/thumbs/svg?seed=Setter"
      }
      alt="Profile"
      className="w-28 h-28 rounded-full border-4 border-blue-200 shadow-md object-cover"
    />
    <label className="text-blue-600 font-medium cursor-pointer text-sm hover:underline">
      Upload Photo
      <input
        type="file"
        accept="image/*"
        onChange={handleProfileImageChange}
        className="hidden"
      />
    </label>
  </div>

  <div>
    <h2 className="text-2xl font-bold text-blue-700 mb-2 flex items-center gap-2">
      My Profile
    </h2>
    <p className="text-gray-700 text-sm mb-1">
      <span className="font-semibold">Name:</span> {user?.name || "Setter User"}
    </p>
    <p className="text-gray-700 text-sm mb-1">
      <span className="font-semibold">Email:</span> {user?.email}
    </p>
    <p className="text-gray-700 text-sm mb-1">
      <span className="font-semibold">Role:</span> {user?.role}
    </p>
    <p className="text-gray-700 text-sm mb-1">
      <span className="font-semibold">Department:</span> {user?.department}
    </p>
  </div>
</div>
)}
{view === "compare" && <CompareVersions />}

      </main>
    </div>
  );
};

export default SetterDashboard;
