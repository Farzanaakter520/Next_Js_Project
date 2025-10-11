// app/postop-form/page.tsx
"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import fileAPI from "../services/fileAPI";

interface FormDataType {
  patient_id: string;
  admission_id: string;
  hospital_id: string;
  doctor_id: string;
  document_type: string;
  remarks: string;
}

export default function PostOpForm() {
  const [formData, setFormData] = useState<FormDataType>({
    patient_id: "",
    admission_id: "",
    hospital_id: "",
    doctor_id: "",
    document_type: "",
    remarks: "",
  });

  const [files, setFiles] = useState<FileList | null>(null);
  const [message, setMessage] = useState<string>("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!files || files.length === 0) {
      alert("Please select at least one file!");
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      formDataToSend.append("action_mode", "upload");
      Array.from(files).forEach((file) => formDataToSend.append("files", file));

      const res = await fileAPI.submitRecordWithFile(formDataToSend);
      console.log("Server responded:", res);
      setMessage("Form submitted and uploaded successfully!");

      setFormData({
        patient_id: "",
        admission_id: "",
        hospital_id: "",
        doctor_id: "",
        document_type: "",
        remarks: "",
      });
      setFiles(null);
    } catch (err) {
      console.error("Submission error:", err);
      alert("Upload failed. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-black bg-gray-100 relative">
      {/* Background Image & Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-xs filter brightness-75"
        style={{
          backgroundImage:
            "url('https://zingersticksoftware.com/wp-content/uploads/2025/09/hims-in-qatar-scaled.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white/80"></div>

      {/* Form Card */}
      <div className="relative z-50 max-w-lg w-full  p-8 bg-white/70 backdrop-blur-md rounded-4xl size-full shadow-2xl border border-gray-200">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">
          Post-Op Form
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Inputs */}
          {["patient_id", "admission_id", "hospital_id", "doctor_id"].map(
            (field) => (
              <input
                key={field}
                type="number"
                name={field}
                value={formData[field as keyof FormDataType]}
                onChange={handleChange}
                placeholder={field.replace("_", " ").toUpperCase()}
                required
                className="w-full p-3 border  border-gray-800 rounded-lg placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              />
            )
          )}

          {/* Document Type */}
          <select
            name="document_type"
            value={formData.document_type}
            onChange={handleChange}
            required
            className="w-full p-3 border text-black border-gray-800 rounded-lg placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
          >
            <option value="" disabled>
              --Select Document Type--
            </option>
            <option value="x-ray">X-Ray</option>
            <option value="diagnostic_report">Diagnostic Report</option>
            <option value="prescription">Prescription</option>
            <option value="consent_form">Consent Form</option>
            <option value="surgical_note">Surgical Note</option>
            <option value="pathological">Pathological</option>
            <option value="imaging">Imaging</option>
            <option value="other">Other</option>
          </select>

          {/* Remarks */}
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Remarks"
            className="w-full p-3 border border-gray-800 rounded-lg placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
          />

          {/* File Upload */}
          <div className="w-full">
            <label className="flex items-center justify-center w-full h-12 px-4 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <span className="text-gray-800 font-medium">Choose Files</span>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {files && files.length > 0 && (
              <ul className="mt-2 text-sm text-gray-800">
                {Array.from(files).map((file, index) => (
                  <li key={index}>📄 {file.name}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold shadow-md"
          >
            Submit
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-green-600 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}
