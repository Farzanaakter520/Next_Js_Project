"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";

interface RecordItem {
  drive_file_id: string;
  file_name: string;
  file_type: string;
  webViewLink?: string;
  dbInsert?: {
    [key: string]: unknown;
  };
}

export default function RecordsPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchRecords();
  }, []);


  const API_URL = "http://localhost:8000/api/v1/fileupload/fileuploadapi/";

const fetchRecords = async () => {
  try {
    const res = await axios.post(API_URL, { action_mode: "getlist" });
    console.log("API Response:", res.data);
    setRecords(res.data.data || []);
  } catch (err: unknown) {
    const error = err as AxiosError;
    console.error("Error fetching records:", error.response?.data || error.message);
  } finally {
    setLoading(false);
  }
};


  const handleDownload = async (fileId: string, fileName: string) => {
  try {
    const res = await axios.post<Blob>(
      "http://localhost:8000/fileupload/fileuploadapi/download",
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


  const handlePreview = (fileId: string) => {
    window.open(
      "http://localhost:8000/fileupload/fileuploadapi/preview",
      "_blank",
      "width=900,height=600"
    );
  };

  if (loading)
    return <div className="p-6 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Uploaded Records</h1>
      {records.length === 0 ? (
        <p className="text-gray-600">No records found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((rec) => (
            <div
              key={rec.drive_file_id}
              className="bg-white rounded-lg shadow p-4 flex flex-col justify-between"
            >
              <div>
                <h2 className="font-semibold text-lg">{rec.file_name}</h2>
                <p className="text-sm text-gray-500">Type: {rec.file_type}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() =>
                    handleDownload(rec.drive_file_id, rec.file_name)
                  }
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                >
                  Download
                </button>
                <button
                  onClick={() => handlePreview(rec.drive_file_id)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                >
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
