"use client";

import React, { useState, useRef } from "react";
import { X, ImageIcon, FileVideo, FileText, File, Plus, Copy, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import axios from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const API_URL = "http://localhost:8000/api/v1/fileupload/fileuploadapi/upload";

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  url?: string; // drive URL after upload
  name: string;
  type: "image" | "video" | "pdf" | "doc" | "other";
  category?: string;
}

interface DriveUploadResponse {
  fileId: string;
  name: string;
  webViewLink: string;
  dbInsert: Record<string, unknown>;
}

const FILE_CATEGORIES = [
  "X-Ray",
  "MRI Scan",
  "CT Scan",
  "Ultrasound",
  "Diagnostic Report",
  "Lab Results",
  "Prescription",
  "Medical History",
  "Insurance Document",
  "Other",
] as const;

export default function FileUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [jsonData, setJsonData] = useState<string>("");
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): UploadedFile["type"] => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type === "application/pdf") return "pdf";
    if (
      file.type === "application/msword" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      return "doc";
    return "other";
  };

  const addFiles = (fileList: File[]) => {
    const newFiles: UploadedFile[] = fileList.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      type: getFileType(file),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    const f = files.find((f) => f.id === id);
    if (f?.preview) URL.revokeObjectURL(f.preview);
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (selectedFile?.id === id) setSelectedFile(null);
  };

  const updateFileCategory = (id: string, category: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, category } : f))
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleUploadAll = async () => {
    if (files.length === 0) return alert("Please select at least one file!");
    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f.file));
      // Optional: if backend needs patient_id, admission_id
      formData.append("patient_id", "P001");
      formData.append("admission_id", "A001");

      const response = await axios.post<{ success: boolean; data: DriveUploadResponse[] }>(
        API_URL,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Update each file with drive URL
      const updatedFiles = files.map((f, idx) => ({
        ...f,
        url: response.data.data[idx]?.webViewLink || f.preview,
      }));
      setFiles(updatedFiles);

      setJsonData(JSON.stringify(response.data, null, 2));
      setShowJsonModal(true);
      setUploadSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Upload failed:", err.message);
        alert("Upload failed! Check console.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(jsonData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileIcon = (type: UploadedFile["type"]) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-8 h-8 text-muted-foreground" />;
      case "video":
        return <FileVideo className="w-8 h-8 text-muted-foreground" />;
      case "pdf":
      case "doc":
        return <FileText className="w-8 h-8 text-muted-foreground" />;
      default:
        return <File className="w-8 h-8 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition ${isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300"}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(Array.from(e.dataTransfer.files)); }}
        onClick={() => fileInputRef.current?.click()}
      >
        <Plus className="w-10 h-10 mb-4 text-gray-400" />
        <p className="text-gray-500">Drag & drop or click to upload</p>
        <input type="file" multiple className="hidden" ref={fileInputRef} onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))} />
      </div>

      {/* File Grid */}
      {files.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((f) => (
            <div key={f.id} className="group relative rounded-lg overflow-hidden bg-muted border border-border hover:border-primary/50 transition-all duration-200 flex flex-col">
              <div className="relative aspect-[4/3]">
                {f.type === "image" ? (
                  <img src={f.url || f.preview} alt={f.name} className="w-full h-full object-cover cursor-pointer transition-transform duration-200 group-hover:scale-105" onClick={() => setSelectedFile(f)} />
                ) : f.type === "video" ? (
                  <video src={f.url || f.preview} controls className="w-full h-full object-cover cursor-pointer" onClick={() => setSelectedFile(f)} />
                ) : f.type === "pdf" ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4 cursor-pointer bg-card" onClick={() => setSelectedFile(f)}>
                    <FileText className="w-8 h-8 text-primary" />
                    <p className="text-xs text-muted-foreground text-center font-medium">PDF</p>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4 cursor-pointer" onClick={() => setSelectedFile(f)}>
                    {getFileIcon(f.type)}
                    <p className="text-xs text-muted-foreground text-center font-medium uppercase">{f.type}</p>
                  </div>
                )}

                {/* Remove Button */}
                <button onClick={(e) => { e.stopPropagation(); removeFile(f.id); }} className="absolute top-2 right-2 p-1.5 bg-destructive/90 hover:bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" aria-label="Remove file">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Category Select */}
              <div className="p-3 bg-card border-t border-border">
                <Select value={f.category} onValueChange={(value) => updateFileCategory(f.id, value)}>
                  <SelectTrigger className="w-full h-9 text-xs">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {FILE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {files.length > 0 && (
        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={handleUploadAll} disabled={isUploading}>{isUploading ? "Uploading..." : "Upload All"}</Button>
          <Button variant="outline" onClick={() => { files.forEach((f) => URL.revokeObjectURL(f.preview)); setFiles([]); setSelectedFile(null); }}>Clear All</Button>
        </div>
      )}

      {/* JSON Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowJsonModal(false)}>
          <div className="bg-white p-6 rounded-xl w-[90%] md:w-[600px] relative" onClick={(e) => e.stopPropagation()}>
            <Button className="absolute top-3 right-3" size="sm" variant="outline" onClick={() => setShowJsonModal(false)}><X className="w-4 h-4" /></Button>
            <h3 className="text-lg font-semibold mb-4">API Response</h3>
            <pre className="bg-gray-100 p-3 rounded-lg text-sm max-h-[400px] overflow-auto">{jsonData}</pre>
            <Button onClick={copyToClipboard} variant="secondary" className="mt-4 flex gap-2 items-center">{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied!" : "Copy JSON"}</Button>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {uploadSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-lg shadow-lg animate-in fade-in duration-200">Files uploaded successfully!</div>
      )}
    </div>
  );
}




// "use client"

// import type React from "react"

// import { useState, useRef } from "react"
// import { X, ImageIcon, FileVideo, FileText, File, Plus, Copy, Check } from "lucide-react"
// import { SelectValue } from "@radix-ui/react-select"
// import { Button } from "../ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select"

// interface UploadedFile {
//   id: string
//   file: File
//   preview: string | null
//   name: string
//   type: "image" | "video" | "pdf" | "doc" | "other"
//   category?: string
// }

// const FILE_CATEGORIES = [
//   "X-Ray",
//   "MRI Scan",
//   "CT Scan",
//   "Ultrasound",
//   "Diagnostic Report",
//   "Lab Results",
//   "Prescription",
//   "Medical History",
//   "Insurance Document",
//   "Other",
// ] as const

// export default function ImageUploader() {
//   const [files, setFiles] = useState<UploadedFile[]>([])
//   const [isDragging, setIsDragging] = useState(false)
//   const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const [isUploading, setIsUploading] = useState(false)
//   const [uploadSuccess, setUploadSuccess] = useState(false)
//   const [showJsonModal, setShowJsonModal] = useState(false)
//   const [jsonData, setJsonData] = useState<string>("")
//   const [copied, setCopied] = useState(false)

//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const selectedFiles = Array.from(e.target.files)
//       addFiles(selectedFiles)
//     }
//   }

//   const getFileType = (file: File): UploadedFile["type"] => {
//     if (file.type.startsWith("image/")) return "image"
//     if (file.type.startsWith("video/")) return "video"
//     if (file.type === "application/pdf") return "pdf"
//     if (
//       file.type === "application/msword" ||
//       file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//     ) {
//       return "doc"
//     }
//     return "other"
//   }

//   const addFiles = (fileList: File[]) => {
//     const newFiles: UploadedFile[] = fileList.map((file) => {
//       const fileType = getFileType(file)
//       let preview: string | null = null

//       if (fileType === "image" || fileType === "video" || fileType === "pdf") {
//         preview = URL.createObjectURL(file)
//       }

//       return {
//         id: Math.random().toString(36).substr(2, 9),
//         file,
//         preview,
//         name: file.name,
//         type: fileType,
//         category: undefined,
//       }
//     })

//     setFiles((prev) => [...prev, ...newFiles])
//   }

//   const updateFileCategory = (id: string, category: string) => {
//     setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, category } : f)))
//   }

//   const removeFile = (id: string) => {
//     setFiles((prev) => {
//       const fileToRemove = prev.find((f) => f.id === id)
//       if (fileToRemove?.preview) {
//         URL.revokeObjectURL(fileToRemove.preview)
//       }
//       return prev.filter((f) => f.id !== id)
//     })
//     if (selectedFile?.id === id) {
//       setSelectedFile(null)
//     }
//   }

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault()
//     setIsDragging(true)
//   }

//   const handleDragLeave = (e: React.DragEvent) => {
//     e.preventDefault()
//     setIsDragging(false)
//   }

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault()
//     setIsDragging(false)
//     const droppedFiles = Array.from(e.dataTransfer.files)
//     addFiles(droppedFiles)
//   }

//   const handleUploadAll = async () => {
//     setIsUploading(true)
//     setUploadSuccess(false)

//     // Simulate upload process
//     await new Promise((resolve) => setTimeout(resolve, 2000))

//     const uploadData = {
//       timestamp: new Date().toISOString(),
//       totalFiles: files.length,
//       files: files.map((f) => ({
//         id: f.id,
//         name: f.name,
//         type: f.type,
//         category: f.category || "Uncategorized",
//         size: f.file.size,
//         sizeFormatted: formatFileSize(f.file.size),
//         mimeType: f.file.type,
//         lastModified: new Date(f.file.lastModified).toISOString(),
//       })),
//     }

//     const jsonString = JSON.stringify(uploadData, null, 2)
//     setJsonData(jsonString)

//     console.log("[v0] Upload data:", uploadData)

//     setIsUploading(false)
//     setUploadSuccess(true)
//     setShowJsonModal(true)
//   }

//   const copyToClipboard = async () => {
//     try {
//       await navigator.clipboard.writeText(jsonData)
//       setCopied(true)
//       setTimeout(() => setCopied(false), 2000)
//     } catch (err) {
//       console.error("[v0] Failed to copy:", err)
//     }
//   }

//   const getFileIcon = (type: UploadedFile["type"]) => {
//     switch (type) {
//       case "image":
//         return <ImageIcon className="w-8 h-8 text-muted-foreground" />
//       case "video":
//         return <FileVideo className="w-8 h-8 text-muted-foreground" />
//       case "pdf":
//         return <FileText className="w-8 h-8 text-muted-foreground" />
//       case "doc":
//         return <FileText className="w-8 h-8 text-muted-foreground" />
//       default:
//         return <File className="w-8 h-8 text-muted-foreground" />
//     }
//   }

//   const formatFileSize = (bytes: number) => {
//     if (bytes === 0) return "0 Bytes"
//     const k = 1024
//     const sizes = ["Bytes", "KB", "MB", "GB"]
//     const i = Math.floor(Math.log(bytes) / Math.log(k))
//     return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
//   }

//   return (
//     <div className="min-h-screen bg-background p-6 md:p-12">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-3 text-balance">File Uploader</h1>
//           <p className="text-muted-foreground text-lg">Upload and preview images, videos, PDFs, and documents</p>
//         </div>

//         {/* Upload Zone */}
//         <div
//           onDragOver={handleDragOver}
//           onDragLeave={handleDragLeave}
//           onDrop={handleDrop}
//           className={`
//             relative border-2 border-dashed rounded-lg p-12 md:p-16 
//             text-center transition-all duration-200
//             ${isDragging ? "border-primary bg-primary/5 scale-[0.99]" : "border-border bg-card"}
//           `}
//         >
//           <div className="flex flex-col items-center gap-4">
//             <Button
//               onClick={() => fileInputRef.current?.click()}
//               size="lg"
//               className="h-20 w-20 rounded-full p-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
//             >
//               <Plus className="w-10 h-10" />
//             </Button>
//             <div>
//               <p className="text-lg font-medium text-foreground mb-1">Click to add files or drag and drop</p>
//               <p className="text-sm text-muted-foreground">Supports images, videos, PDFs, and documents</p>
//             </div>
//           </div>
//           <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
//         </div>

//         {/* File Grid */}
//         {files.length > 0 && (
//           <div className="mt-12">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-2xl font-semibold text-foreground">Uploaded Files ({files.length})</h2>
//               <div className="flex gap-3">
//                 <Button
//                   onClick={handleUploadAll}
//                   disabled={isUploading || files.length === 0}
//                   size="lg"
//                   className="text-base font-semibold px-8"
//                 >
//                   {isUploading ? "Uploading..." : "Upload All"}
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     files.forEach((f) => {
//                       if (f.preview) URL.revokeObjectURL(f.preview)
//                     })
//                     setFiles([])
//                     setSelectedFile(null)
//                   }}
//                   variant="outline"
//                   size="lg"
//                 >
//                   Clear All
//                 </Button>
//               </div>
//             </div>

//             {uploadSuccess && (
//               <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg text-center">
//                 <p className="text-primary font-medium">Files uploaded successfully!</p>
//               </div>
//             )}

//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//               {files.map((uploadedFile) => (
//                 <div
//                   key={uploadedFile.id}
//                   className="group relative rounded-lg overflow-hidden bg-muted border border-border hover:border-primary/50 transition-all duration-200 flex flex-col"
//                 >
//                   <div className="relative aspect-[4/3]">
//                     {uploadedFile.type === "image" && uploadedFile.preview ? (
//                       <img
//                         src={uploadedFile.preview || "/placeholder.svg"}
//                         alt={uploadedFile.name}
//                         className="w-full h-full object-cover cursor-pointer transition-transform duration-200 group-hover:scale-105"
//                         onClick={() => setSelectedFile(uploadedFile)}
//                       />
//                     ) : uploadedFile.type === "video" && uploadedFile.preview ? (
//                       <video
//                         src={uploadedFile.preview}
//                         className="w-full h-full object-cover cursor-pointer"
//                         onClick={() => setSelectedFile(uploadedFile)}
//                       />
//                     ) : uploadedFile.type === "pdf" && uploadedFile.preview ? (
//                       <div
//                         className="w-full h-full flex flex-col items-center justify-center gap-3 p-4 cursor-pointer bg-card"
//                         onClick={() => setSelectedFile(uploadedFile)}
//                       >
//                         <FileText className="w-8 h-8 text-primary" />
//                         <p className="text-xs text-muted-foreground text-center font-medium">PDF</p>
//                       </div>
//                     ) : (
//                       <div
//                         className="w-full h-full flex flex-col items-center justify-center gap-3 p-4 cursor-pointer"
//                         onClick={() => setSelectedFile(uploadedFile)}
//                       >
//                         {getFileIcon(uploadedFile.type)}
//                         <p className="text-xs text-muted-foreground text-center font-medium uppercase">
//                           {uploadedFile.type}
//                         </p>
//                       </div>
//                     )}

//                     {/* Overlay on hover */}
//                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
//                       <Button
//                         onClick={(e) => {
//                           e.stopPropagation()
//                           setSelectedFile(uploadedFile)
//                         }}
//                         variant="secondary"
//                         size="sm"
//                         className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
//                       >
//                         View
//                       </Button>
//                     </div>

//                     {/* Remove button */}
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation()
//                         removeFile(uploadedFile.id)
//                       }}
//                       className="absolute top-2 right-2 p-1.5 bg-destructive/90 hover:bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
//                       aria-label="Remove file"
//                     >
//                       <X className="w-4 h-4" />
//                     </button>

//                     {uploadedFile.category && (
//                       <div className="absolute top-2 left-2 px-2 py-1 bg-primary/90 text-primary-foreground text-xs font-medium rounded">
//                         {uploadedFile.category}
//                       </div>
//                     )}

//                     {/* File info */}
//                     <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
//                       <p className="text-white text-sm font-medium truncate">{uploadedFile.name}</p>
//                       <p className="text-white/80 text-xs">{formatFileSize(uploadedFile.file.size)}</p>
//                     </div>
//                   </div>

//                   <div className="p-3 bg-card border-t border-border">
//                     <Select
//                       value={uploadedFile.category}
//                       onValueChange={(value) => updateFileCategory(uploadedFile.id, value)}
//                     >
//                       <SelectTrigger className="w-full h-9 text-xs">
//                         <SelectValue placeholder="Select category" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {FILE_CATEGORIES.map((category) => (
//                           <SelectItem key={category} value={category} className="text-xs">
//                             {category}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {selectedFile && (
//           <div
//             className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
//             onClick={() => setSelectedFile(null)}
//           >
//             <div
//               className="relative max-w-7xl max-h-[90vh] w-full animate-in zoom-in-95 duration-200"
//               onClick={(e) => e.stopPropagation()}
//             >
//               {/* Close button */}
//               <button
//                 onClick={() => setSelectedFile(null)}
//                 className="absolute -top-12 right-0 p-2 text-white hover:text-white/80 transition-colors"
//                 aria-label="Close preview"
//               >
//                 <X className="w-6 h-6" />
//               </button>

//               {selectedFile.type === "image" && selectedFile.preview ? (
//                 <img
//                   src={selectedFile.preview || "/placeholder.svg"}
//                   alt={selectedFile.name}
//                   className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl mx-auto"
//                 />
//               ) : selectedFile.type === "video" && selectedFile.preview ? (
//                 <video
//                   src={selectedFile.preview}
//                   controls
//                   className="max-w-full max-h-[90vh] rounded-lg shadow-2xl mx-auto"
//                 />
//               ) : selectedFile.type === "pdf" && selectedFile.preview ? (
//                 <iframe
//                   src={selectedFile.preview}
//                   className="w-full h-[90vh] rounded-lg shadow-2xl bg-white"
//                   title={selectedFile.name}
//                 />
//               ) : (
//                 <div className="bg-card p-12 rounded-lg shadow-2xl flex flex-col items-center gap-6 min-w-[400px] mx-auto">
//                   {getFileIcon(selectedFile.type)}
//                   <div className="text-center">
//                     <p className="text-foreground font-medium mb-2">{selectedFile.name}</p>
//                     <p className="text-muted-foreground text-sm">
//                       {selectedFile.type.toUpperCase()} • {formatFileSize(selectedFile.file.size)}
//                     </p>
//                     {selectedFile.category && (
//                       <p className="text-primary text-sm font-medium mt-2">Category: {selectedFile.category}</p>
//                     )}
//                   </div>
//                   <p className="text-muted-foreground text-sm">Preview not available for this file type</p>
//                 </div>
//               )}

//               {/* File info */}
//               <div className="absolute -bottom-12 left-0 right-0 text-center">
//                 <p className="text-white text-sm font-medium">{selectedFile.name}</p>
//                 {selectedFile.category && <p className="text-white/80 text-xs mt-1">{selectedFile.category}</p>}
//               </div>
//             </div>
//           </div>
//         )}
//         {showJsonModal && (
//           <div
//             className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
//             onClick={() => {
//               setShowJsonModal(false)
//               setUploadSuccess(false)
//             }}
//           >
//             <div
//               className="relative max-w-4xl w-full max-h-[90vh] bg-card rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
//               onClick={(e) => e.stopPropagation()}
//             >
//               {/* Header */}
//               <div className="flex items-center justify-between p-6 border-b border-border bg-muted/50">
//                 <div>
//                   <h2 className="text-2xl font-semibold text-foreground">Upload Data (JSON)</h2>
//                   <p className="text-sm text-muted-foreground mt-1">Files ready to be uploaded</p>
//                 </div>
//                 <div className="flex gap-2">
//                   <Button onClick={copyToClipboard} variant="outline" size="sm" className="gap-2 bg-transparent">
//                     {copied ? (
//                       <>
//                         <Check className="w-4 h-4" />
//                         Copied!
//                       </>
//                     ) : (
//                       <>
//                         <Copy className="w-4 h-4" />
//                         Copy
//                       </>
//                     )}
//                   </Button>
//                   <button
//                     onClick={() => {
//                       setShowJsonModal(false)
//                       setUploadSuccess(false)
//                     }}
//                     className="p-2 hover:bg-muted rounded-lg transition-colors"
//                     aria-label="Close"
//                   >
//                     <X className="w-5 h-5" />
//                   </button>
//                 </div>
//               </div>

//               {/* JSON Content */}
//               <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
//                 <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-border">
//                   <code className="text-foreground">{jsonData}</code>
//                 </pre>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }










