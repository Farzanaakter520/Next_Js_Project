"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";

// =====================
// TypeScript Interface
// =====================
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

// =====================
// Component
// =====================
export default function RecordsPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [openPdf, setOpenPdf] = useState(false);
  const [openVideo, setOpenVideo] = useState(false);

  const API_URL = "http://localhost:8000/api/v1/fileupload/fileuploadapi/";

  useEffect(() => {
    fetchRecords();
  }, []);

  // =====================
  // Fetch Records
  // =====================
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

  // =====================
  // Download File
  // =====================
  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const res = await axios.post<Blob>(
        `${API_URL}download`,
        { drive_file_id: fileId, file_name: fileName },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  // =====================
  // Preview File
  // =====================
  const handlePreview = async (file: RecordItem) => {
    if (!file.drive_file_id) return alert("File ID missing!");
    try {
      const res = await axios.post(
        `${API_URL}preview`,
        { drive_file_id: file.drive_file_id },
        { responseType: "blob" }
      );

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

  // =====================
  // Loading State
  // =====================
  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

  // =====================
  // Render Table
  // =====================
  return (
    <div className="max-w-full mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Uploaded Records</h1>
      {records.length === 0 ? (
        <p className="text-gray-600">No records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-black-100 text-amber-50">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">File Name</th>
                <th className="px-4 py-2 border">File Type</th>
                <th className="px-4 py-2 border">Document Type</th>
                <th className="px-4 py-2 border">Patient ID</th>
                <th className="px-4 py-2 border">Hospital ID</th>
                <th className="px-4 py-2 border">Admission ID</th>
                <th className="px-4 py-2 border">Doctor ID</th>
                <th className="px-4 py-2 border">Remarks</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.id} className="text-sm">
                  <td className="px-4 py-2 border">{rec.id}</td>
                  <td className="px-4 py-2 border">{rec.file_name}</td>
                  <td className="px-4 py-2 border">{rec.file_type}</td>
                  <td className="px-4 py-2 border">{rec.document_type}</td>
                  <td className="px-4 py-2 border">{rec.patient_id}</td>
                  <td className="px-4 py-2 border">{rec.hospital_id}</td>
                  <td className="px-4 py-2 border">{rec.admission_id}</td>
                  <td className="px-4 py-2 border">{rec.doctor_id || "-"}</td>
                  <td className="px-4 py-2 border">{rec.remarks || "-"}</td>
                  <td className="px-4 py-2 border flex gap-1">
                    <button
                      onClick={() => handlePreview(rec)}
                      className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 transition align-text-bottom"
                    >
                      Preview
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PDF Preview Modal (toolbar hidden) */}
{openPdf && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
    <iframe
      src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
      className="w-4/5 h-4/5 bg-white rounded shadow-lg"
      style={{ border: "none" }}
    />
    <button
      onClick={() => setOpenPdf(false)}
      className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded"
    >
      Close
    </button>
  </div>
)}



      {/* Video Preview Modal */}
      {openVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <video
            src={previewUrl}
            controls
            autoPlay
            className="w-4/5 h-4/5 rounded shadow-lg"
          />
          <button
            onClick={() => setOpenVideo(false)}
            className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}






// "use client";

// import { useEffect, useState } from "react";
// import axios, { AxiosError } from "axios";

// // =====================
// // TypeScript Interface
// // =====================
// interface RecordItem {
//   id: number;
//   patient_id: number;
//   hospital_id: number;
//   admission_id: number;
//   doctor_id?: number;
//   file_name: string;
//   file_type?: string;
//   document_type?: string;
//   drive_file_id?: string;
//   remarks?: string;
//   is_active?: number;
//   insert_by?: string;
//   insert_date?: string;
//   update_by?: string;
//   update_date?: string;
//   dt?: string;
// }

// // =====================
// // Component
// // =====================
// export default function RecordsPage() {
//   const [records, setRecords] = useState<RecordItem[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   const API_URL = "http://localhost:8000/api/v1/fileupload/fileuploadapi/";

//   useEffect(() => {
//     fetchRecords();
//   }, []);

//   // =====================
//   // Fetch Records
//   // =====================
//   const fetchRecords = async () => {
//     try {
//       const res = await axios.post(API_URL, { action_mode: "getlist" });
//       console.log("API Response:", res.data);
//       setRecords(res.data.data || []);
//     } catch (err: unknown) {
//       const error = err as AxiosError;
//       console.error("Error fetching records:", error.response?.data || error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =====================
//   // Download File
//   // =====================
//   const handleDownload = async (fileId: string, fileName: string) => {
//     try {
//       const res = await axios.post<Blob>(
//         `${API_URL}download`,
//         { drive_file_id: fileId, file_name: fileName },
//         { responseType: "blob" }
//       );
//       const url = window.URL.createObjectURL(new Blob([res.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", fileName);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (err) {
//       console.error("Download failed:", err);
//     }
//   };

//   // =====================
//   // Preview File
//   // =====================
//   const handlePreview = (fileId: string) => {
//     const previewLink = `${API_URL}preview?file_id=${fileId}`;
//     window.open(previewLink, "_blank", "width=900,height=600");
//   };

//   // =====================
//   // Loading State
//   // =====================
//   if (loading)
//     return <div className="p-6 text-center text-gray-500">Loading...</div>;

//   // =====================
//   // Render
//   // =====================
//   return (
//     <div className="max-w-6xl mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-4">Uploaded Records</h1>
//       {records.length === 0 ? (
//         <p className="text-gray-600">No records found.</p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {records.map((rec) => (
//             <div
//               key={rec.id}
//               className="bg-white rounded-lg shadow p-4 flex flex-col justify-between"
//             >
//               <div className="space-y-1">
//                 <h2 className="font-semibold text-lg">{rec.file_name}</h2>
//                 <p className="text-sm text-gray-500">Type: {rec.file_type}</p>
//                 <p className="text-sm text-gray-500">Document Type: {rec.document_type}</p>
//                 <p className="text-sm text-gray-500">Patient ID: {rec.patient_id}</p>
//                 <p className="text-sm text-gray-500">Hospital ID: {rec.hospital_id}</p>
//                 <p className="text-sm text-gray-500">Admission ID: {rec.admission_id}</p>
//                 {rec.doctor_id && <p className="text-sm text-gray-500">Doctor ID: {rec.doctor_id}</p>}
//                 {rec.remarks && <p className="text-sm text-gray-500">Remarks: {rec.remarks}</p>}
//                 <p className="text-sm text-gray-500">Inserted By: {rec.insert_by}</p>
//                 <p className="text-sm text-gray-500">Insert Date: {rec.insert_date}</p>
//                 <p className="text-sm text-gray-500">Updated By: {rec.update_by}</p>
//                 <p className="text-sm text-gray-500">Update Date: {rec.update_date}</p>
//               </div>
//               <div className="mt-4 flex gap-2">
//                 <button
//                   onClick={() => handleDownload(rec.drive_file_id!, rec.file_name)}
//                   className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
//                 >
//                   Download
//                 </button>
//                 <button
//                   onClick={() => handlePreview(rec.drive_file_id!)}
//                   className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
//                 >
//                   Preview
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }






