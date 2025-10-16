"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/app/components/ui/button";
import FileUploadForm, { FileUploadFormRef } from "./FileUploadForm";

interface MultiStepFormData {
  patientName: string;
  patientAge: number;
  fileupload?: any[];
}

const MultiStepForm = () => {
  const fileUploadRef = useRef<FileUploadFormRef>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<MultiStepFormData>({
    patientName: "",
    patientAge: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = async () => {
    if (step === 2) {
      if (!fileUploadRef.current) return;
      const result = await fileUploadRef.current.uploadFiles();
      if (!result.success) return;

      setFormData(prev => ({
        ...prev,
        fileupload: result.data.fileupload,
      }));
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      console.log("Submitting final data:", formData);
      alert("Form submitted successfully!");
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6 border rounded-xl shadow-lg">
      <h2 className="text-xl font-bold">Multi-Step Form</h2>

      <div className="flex space-x-4 mb-4">
        <div className={`px-4 py-1 rounded ${step === 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}>1. Patient Info</div>
        <div className={`px-4 py-1 rounded ${step === 2 ? "bg-blue-500 text-white" : "bg-gray-200"}`}>2. Upload Files</div>
        <div className={`px-4 py-1 rounded ${step === 3 ? "bg-blue-500 text-white" : "bg-gray-200"}`}>3. Submit</div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Patient Name</label>
            <input type="text" name="patientName" value={formData.patientName} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block mb-1">Patient Age</label>
            <input type="number" name="patientAge" value={formData.patientAge} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
        </div>
      )}

      {step === 2 && <FileUploadForm ref={fileUploadRef} />}

      {step === 3 && (
        <div>
          <h3 className="font-semibold mb-2">Review Submission:</h3>
          <p><strong>Patient Name:</strong> {formData.patientName}</p>
          <p><strong>Patient Age:</strong> {formData.patientAge}</p>
          <h4 className="font-semibold mt-4 mb-2">Uploaded Files:</h4>
          {formData.fileupload?.map((f, i) => (
            <div key={i} className="border p-2 rounded mb-2">
              <p><strong>Name:</strong> {f.file_name}</p>
              <p><strong>Type:</strong> {f.file_type}</p>
              <p><strong>Document Type:</strong> {f.document_type}</p>
              <p><strong>Drive ID:</strong> {f.drive_file_id}</p>
              <p><strong>Remarks:</strong> {f.remarks}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between mt-6">
        {step > 1 && <Button variant="outline" onClick={prevStep}>Back</Button>}
        {step < 3 && <Button onClick={nextStep}>Next</Button>}
        {step === 3 && <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</Button>}
      </div>
    </div>
  );
};

export default MultiStepForm;
