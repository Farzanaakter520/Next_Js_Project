"use client";

import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { X, Plus } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../components/ui/select";
import { z } from "zod";
import { uploadToDriveAction } from "./uploadToDriveAction";

// ------------------- ZOD Schema -------------------
export const fileUploadSchema = z.object({
  fileupload: z.array(
    z.object({
      file_name: z.string().min(1, "File name is required"),
      file_type: z.string().min(1, "File type is required"),
      document_type: z.string().min(1, "Document type is required"),
      drive_file_id: z.string().optional(), 
      remarks: z.string().optional().nullable(),
    })
  ).optional().default([]),
});

export type FileUploadFormData = z.infer<typeof fileUploadSchema>;

// ------------------- TypeScript Interfaces -------------------
export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  type: string;
  document_type?: string;
  drive_file_id?: string;
  url?: string;
}

export interface FileUploadFormRef {
  uploadFiles: () => Promise<{ success: boolean; data?: any }>;
  getFiles: () => UploadedFile[];
  clearFiles: () => void;
}

// ------------------- Document Types -------------------
const DOCUMENT_TYPES = [
  "X-Ray", "MRI Scan", "CT Scan", "Ultrasound", "Diagnostic Report",
  "Lab Results", "Prescription", "Medical History", "Insurance Document", "Other",
];

// ------------------- FileUploadForm Component -------------------
const FileUploadForm = forwardRef<FileUploadFormRef>((_, ref) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    uploadFiles: async () => {
      if (files.length === 0) return { success: false, msg: "No files to upload" };

      for (const f of files) {
        if (!f.document_type) {
          alert(`Please select a document type for file: ${f.name}`);
          return { success: false };
        }
      }

      setIsUploading(true);

      try {
        const formData = new FormData();
        files.forEach(f => formData.append("files", f.file));
        files.forEach(f => formData.append("document_types", f.document_type || "Other"));

        // Call server action
        const response = await uploadToDriveAction(formData);

        if (!response.success) {
          alert(response.msg || "Upload failed");
          return { success: false };
        }

        const updatedFiles = files.map((f, i) => {
          const driveId = response.data?.fileupload?.[i]?.drive_file_id;
          return {
            ...f,
            drive_file_id: driveId,
            url: driveId ? `https://drive.google.com/file/d/${driveId}` : undefined,
          };
        });

        setFiles(updatedFiles);
        return { success: true, data: response.data };
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Upload failed due to client error");
        return { success: false };
      } finally {
        setIsUploading(false);
      }
    },

    getFiles: () => files,

    clearFiles: () => {
      files.forEach(f => URL.revokeObjectURL(f.preview));
      setFiles([]);
    },
  }));

  const handleFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      document_type: undefined,
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p>Click or Drag & Drop to upload</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={e => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {files.map(f => (
            <div key={f.id} className="border p-3 rounded-lg relative">
              <p className="truncate text-sm">{f.name}</p>

              <Select
                value={f.document_type || ""}
                onValueChange={v =>
                  setFiles(prev =>
                    prev.map(x => (x.id === f.id ? { ...x, document_type: v } : x))
                  )
                }
              >
                <SelectTrigger className="h-8 mt-2">
                  <SelectValue placeholder="Document Type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <button
                onClick={() => removeFile(f.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {isUploading && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center text-white">
          Uploading files...
        </div>
      )}
    </div>
  );
});

FileUploadForm.displayName = "FileUploadForm";
export default FileUploadForm;
