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

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  // ---------------- Submit Function ----------------
  const handleSubmit = async () => {
    if (!fileUploadRef.current) {
      alert("FileUploadForm not ready");
      return;
    }

    setSubmitting(true);
    try {
      // ✅ Step 3–এ ফাইল আপলোড হবে
      const result = await fileUploadRef.current.uploadFiles();
      if (!result.success) return;

      const finalData = {
        ...formData,
        fileupload: result.data.fileupload,
      };

      console.log("Final submitted data:", finalData);
      alert("Form submitted and files uploaded successfully!");

      // Reset form
      setFormData({ patientName: "", patientAge: 0 });
      fileUploadRef.current.clearFiles();
      setStep(1);
    } catch (err) {
      console.error("Submission error:", err);
      alert("Submission failed. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6 border rounded-xl shadow-lg">
      <h2 className="text-xl font-bold">Multi-Step Form</h2>

      {/* Step Indicator */}
      <div className="flex space-x-4 mb-4">
        <div className={`px-4 py-1 rounded ${step === 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}>1. Patient Info</div>
        <div className={`px-4 py-1 rounded ${step === 2 ? "bg-blue-500 text-white" : "bg-gray-200"}`}>2. Upload Files</div>
        <div className={`px-4 py-1 rounded ${step === 3 ? "bg-blue-500 text-white" : "bg-gray-200"}`}>3. Submit</div>
      </div>

      {/* Step 1: Patient Info */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Patient Name</label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1">Patient Age</label>
            <input
              type="number"
              name="patientAge"
              value={formData.patientAge}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
        </div>
      )}

      {/* Step 2: FileUploadForm */}
      {step >= 2 && <FileUploadForm ref={fileUploadRef} />}

      {/* Step 2 Instructions */}
      {step === 2 && (
        <div className="mt-2 text-gray-600">
          Select files and choose their document types before submitting.
        </div>
      )}

      {/* Step 3: Review & Submit */}
      {step === 3 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Review Submission:</h3>
          <p><strong>Patient Name:</strong> {formData.patientName}</p>
          <p><strong>Patient Age:</strong> {formData.patientAge}</p>

          <h4 className="font-semibold mt-4 mb-2">Uploaded Files Preview:</h4>
          {fileUploadRef.current?.getFiles().map((f, i) => (
            <div key={i} className="border p-2 rounded mb-2">
              <p><strong>Name:</strong> {f.name}</p>
              <p><strong>Type:</strong> {f.type}</p>
              <p><strong>Document Type:</strong> {f.document_type}</p>
            </div>
          ))}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        {step > 1 && <Button variant="outline" onClick={prevStep}>Back</Button>}
        {step < 3 && <Button onClick={nextStep}>Next</Button>}
        {step === 3 && (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default MultiStepForm;
