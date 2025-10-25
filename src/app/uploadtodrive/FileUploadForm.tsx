"use client";

import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { X, Plus } from "lucide-react";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadToDriveAction } from "../lib/uploadToDriveAction";

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

interface FileUploadFormProps {
  hidden?: boolean;
}

// ------------------- FileUploadForm Component -------------------
const FileUploadForm = forwardRef<FileUploadFormRef, FileUploadFormProps>(({ hidden }, ref) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ------------------- Fixed Upload Logic -------------------
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

        // ---------------- Drive Upload ----------------
        const response = await uploadToDriveAction(formData);

        if (!response.success) {
          alert(response.msg || "Upload failed");
          return { success: false };
        }

        const formattedResponse = {
          fileupload: files.map((f, i) => ({
            file_name: f.name,
            file_type: f.type.split("/")[1] || f.type,
            document_type: f.document_type || "Other",
            drive_file_id: response.data?.[i]?.fileId || "",
            remarks: "Uploaded from patient registration step",
          })),
        };

        console.log("📦 Formatted Upload Response:", formattedResponse);

        return { success: true, data: formattedResponse };
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

  // ------------------- Handle File Input -------------------
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

  if (hidden) return null; // Step 3 UI hide

  return (
    <div className="space-y-6">
      {/* File Upload UI */}
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

      {/* Files Preview */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {files.map(f => (
            <div key={f.id} className="border p-3 rounded-lg relative space-y-2">
              <p className="truncate text-sm font-medium">{f.name}</p>

              {/* ---------- File Preview ---------- */}
              {f.type.startsWith("image/") ? (
                <img src={f.preview} alt={f.name} className="max-h-40 w-full object-contain rounded" />
              ) : f.type === "application/pdf" ? (
                <iframe
                  src={f.preview}
                  className="w-full h-40"
                  title={f.name}
                />
              ) : f.type.startsWith("video/") ? (
                <video controls className="w-full h-40 rounded">
                  <source src={f.preview} type={f.type} />
                </video>
              ) : (
                <p className="text-xs text-gray-500">Preview not available</p>
              )}

              {/* ---------- Document Type Dropdown ---------- */}
              <Select
                value={f.document_type || ""}
                onValueChange={v =>
                  setFiles(prev =>
                    prev.map(x => (x.id === f.id ? { ...x, document_type: v } : x))
                  )
                }
              >
                <SelectTrigger className="h-8 mt-2 bg-black border rounded">
                  <SelectValue placeholder="Document Type" />
                </SelectTrigger>
                <SelectContent className=" bg-white border rounded text-black">
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

      {/* Uploading Overlay */}
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
