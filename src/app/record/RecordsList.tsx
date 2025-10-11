"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";

interface RecordItem {
  id: number;
  patient_id: number;
  hospital_id: number;
  admission_id: number;
  doctor_id?: number;
  file_name: string;
  file_type?: string;
  document_type?: string;
  drive_file_id?: string;
  remarks?: string;
  is_active?: number;
  dt?: string;
}

export default function RecordsPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState("");
  const [openPdf, setOpenPdf] = useState(false);
  const [openVideo, setOpenVideo] = useState(false);

  const API_URL = "http://localhost:8000/api/v1/fileupload/fileuploadapi/";

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await axios.post(API_URL, { action_mode: "getlist" });
      setRecords(res.data.data || []);
    } catch (err: unknown) {
      const error = err as AxiosError;
      console.error("Error fetching records:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (file: RecordItem) => {
    if (!file.drive_file_id) return alert("File ID missing!");
    try {
      const res = await axios.post(`${API_URL}preview`, { drive_file_id: file.drive_file_id }, { responseType: "blob" });
      const mimeType = getMimeType(file.file_type);
      const blob = new Blob([res.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      if (mimeType.startsWith("video/")) setOpenVideo(true);
      else if (mimeType === "application/pdf") setOpenPdf(true);
      else if (mimeType.startsWith("image/")) window.open(url, "_blank", "width=900,height=600");
      else alert("Only PDF, video and images are supported for preview!");
    } catch (err) {
      console.error("Preview failed:", err);
      alert("Preview failed");
    }
  };

  const getMimeType = (type?: string) => {
    if (!type) return "application/octet-stream";
    if (type.includes("/")) return type;
    if (type === "pdf") return "application/pdf";
    if (["mp4", "mov", "avi", "mkv"].includes(type)) return `video/${type}`;
    if (["png", "jpg", "jpeg", "gif"].includes(type)) return `image/${type}`;
    return "application/octet-stream";
  };

  if (loading) return <div className="p-6 text-center text-gray-200">Loading...</div>;

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-start p-6 bg-gray-900">
      {/* Background Image + Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center filter brightness-95"
        style={{ backgroundImage: "url('https://wallpapers.com/images/featured/doctor-motivation-b5wjlwe5wjikoj7t.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/50"></div>

      <h1 className="relative z-10 text-3xl font-bold text-white mb-6">Uploaded Records</h1>

      <div className="relative z-10 w-full max-w-8x8 overflow-x-auto rounded-2xl shadow-2xl backdrop-blur-md bg-white/80 border border-black/30 p-4">
        {records.length === 0 ? (
          <p className="text-white text-center py-6">No records found.</p>
        ) : (
          <table className="min-w-full border border-black/50 text-black size-full">
            <thead className="bg-gray-800 border-black/20 text-white">
              <tr>
                <th className="px-4 py-2 border border-white/20">#</th>
                <th className="px-4 py-2 border border-white/20">File Name</th>
                <th className="px-4 py-2 border border-white/20">File Type</th>
                <th className="px-4 py-2 border border-white/20">Document Type</th>
                <th className="px-4 py-2 border border-white/20">Patient ID</th>
                <th className="px-4 py-2 border border-white/20">Hospital ID</th>
                <th className="px-4 py-2 border border-white/20">Admission ID</th>
                <th className="px-4 py-2 border border-white/20">Doctor ID</th>
                <th className="px-4 py-2 border border-white/20">Remarks</th>
                <th className="px-4 py-2 border border-white/20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, index) => (
                <tr key={rec.id} className="hover:bg-white/20 transition rounded-md">
                  <td className="px-4 py-2 border border-black/20">{index + 1}</td>
                  <td className="px-4 py-2 border border-black/20">{rec.file_name}</td>
                  <td className="px-4 py-2 border border-black/20">{rec.file_type}</td>
                  <td className="px-4 py-2 border border-black/20">{rec.document_type}</td>
                  <td className="px-4 py-2 border border-black/20">{rec.patient_id}</td>
                  <td className="px-4 py-2 border border-black/20">{rec.hospital_id}</td>
                  <td className="px-4 py-2 border border-black/20">{rec.admission_id}</td>
                  <td className="px-4 py-2 border border-black/20">{rec.doctor_id || "-"}</td>
                  <td className="px-4 py-2 border border-black/20">{rec.remarks || "-"}</td>
                  <td className="px-4 py-2 border border-black/20">
                    <button
                      onClick={() => handlePreview(rec)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                    >
                      Preview
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PDF Preview Modal */}
      {openPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
          <iframe
            src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-4/5 h-4/5 bg-white rounded-xl shadow-2xl"
            style={{ border: "none" }}
          />
          <button
            onClick={() => setOpenPdf(false)}
            className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded"
          >
            Close
          </button>
        </div>
      )}

      {/* Video Preview Modal */}
      {openVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
          <video src={previewUrl} controls autoPlay className="w-4/5 h-4/5 rounded-xl shadow-2xl" />
          <button
            onClick={() => setOpenVideo(false)}
            className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
