// app/postop-form/page.tsx
"use client";

import { useState, ChangeEvent, FormEvent } from "react";

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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    if (files) {
      console.log("Selected Files:", Array.from(files).map((f) => f.name));
    }
    setMessage("Form submitted successfully!");
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-blue-100 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center text-black">Post-Op Form</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="number"
          name="patient_id"
          value={formData.patient_id}
          onChange={handleChange}
          placeholder="Patient ID"
          required
          className="w-full p-2 border text-black border-gray-900 rounded placeholder-gray-500"
        />
        <input
          type="number"
          name="admission_id"
          value={formData.admission_id}
          onChange={handleChange}
          placeholder="Admission ID"
          required
          className="w-full p-2 border text-black border-gray-900 rounded placeholder-gray-500"
        />
        <input
          type="number"
          name="hospital_id"
          value={formData.hospital_id}
          onChange={handleChange}
          placeholder="Hospital ID"
          required
          className="w-full p-2 border text-black border-gray-900 rounded placeholder-gray-500"
        />
        <input
          type="number"
          name="doctor_id"
          value={formData.doctor_id}
          onChange={handleChange}
          placeholder="Doctor ID"
          required
          className="w-full p-2 border text-black border-gray-900 rounded placeholder-gray-500"
        />
        <select
          name="document_type"
          value={formData.document_type}
          onChange={handleChange}
          required
          className="w-full p-2 border text-black border-gray-900 rounded placeholder-gray-500"
        >
          <option value="" disabled className="text-black">
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

        <textarea
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          placeholder="Remarks"
          className="w-full p-2 border text-black border-gray-900 rounded placeholder-gray-500"
        />

        {/* Custom File Upload */}
        <div className="w-full">
          <label className="flex items-center justify-center w-full h-12 px-4 bg-white border border-gray-900 rounded cursor-pointer hover:bg-gray-100 transition">
            <span className="text-gray-700">Choose Files</span>
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

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </form>

      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
    </div>
  );
}
