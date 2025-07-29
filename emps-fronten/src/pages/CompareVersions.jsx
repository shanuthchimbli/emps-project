import React, { useEffect, useState } from "react";
import axios from "axios";
import { FileSearch } from "lucide-react";

const CompareVersions = () => {
  const [papers, setPapers] = useState([]);
  const [latestPaper, setLatestPaper] = useState(null);
  const [previousPaper, setPreviousPaper] = useState(null);
  const [diffUrl, setDiffUrl] = useState(null);

  const token = localStorage.getItem("token");

  // Step 1: Fetch all papers belonging to setter
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const res = await axios.get("http://localhost:5500/api/papers/assigned", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPapers(res.data);
      } catch (err) {
        console.error("Failed to fetch papers:", err);
      }
    };

    fetchPapers();
  }, []);

  // Step 2: Group and identify latest and previous version
  useEffect(() => {
    const groupByGroupId = {};
    papers.forEach((paper) => {
      const groupId = paper.groupId;
      if (!groupByGroupId[groupId]) {
        groupByGroupId[groupId] = [];
      }
      groupByGroupId[groupId].push(paper);
    });

    for (let groupId in groupByGroupId) {
      const versions = groupByGroupId[groupId].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      if (versions.length >= 2) {
        setLatestPaper(versions[0]);
        setPreviousPaper(versions[1]);
        break;
      }
    }
  }, [papers]);

  // Step 3: Compare versions using backend
  const handleCompare = async () => {
    if (!latestPaper || !previousPaper) return;

    try {
      const res = await axios.get(
        `http://localhost:5500/api/papers/diff-visual/${latestPaper._id}/${previousPaper._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDiffUrl(url);
    } catch (err) {
      console.error("Error fetching diff:", err);
    }
  };

  // Cleanup blob on unmount
  useEffect(() => {
    return () => {
      if (diffUrl) {
        URL.revokeObjectURL(diffUrl);
      }
    };
  }, [diffUrl]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700">
        <FileSearch className="w-6 h-6" /> Compare With Previous Versions
      </h2>

      <div className="bg-white p-4 rounded shadow-md max-w-2xl">
        <p className="font-semibold text-gray-800 mb-2">Paper Group:</p>
        <p>
          <strong>Latest Version:</strong>{" "}
          {latestPaper?.originalName || "Not Found"}
        </p>
        <p>
          <strong>Previous Version:</strong>{" "}
          {previousPaper?.originalName || "Not Found"}
        </p>

        <button
          onClick={handleCompare}
          className="mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center gap-2"
        >
          <FileSearch className="w-5 h-5" />
          Compare Versions
        </button>
      </div>

      {diffUrl && (
        <div className="mt-8 max-w-6xl">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            Highlighted Differences (Visual Diff)
          </h3>
          <object
            data={diffUrl}
            type="application/pdf"
            width="100%"
            height="600px"
            className="border shadow rounded"
          >
            <p className="text-sm">
              Your browser does not support embedded PDFs.{" "}
              <a href={diffUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                Click here to download.
              </a>
            </p>
          </object>
        </div>
      )}
    </div>
  );
};

export default CompareVersions;
