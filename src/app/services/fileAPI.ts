// import axios from "axios";

// const API_URL = "http://localhost:8000/api/v1/fileupload/fileuploadapi/";

// // ===== Submit record with file =====
// const submitRecordWithFile = async (formData: FormData) => {
//   try {
//     const response = await axios.post(API_URL, formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//       withCredentials: true,
//     });
//     return response.data;
//   } catch (err: unknown) {
//     const error = err as axios.AxiosError;
//     console.error("API Error:", error.response?.data || error.message);
//     throw error;
//   }
// };

// // ===== List all records =====
// const listRecords = async () => {
//   try {
//     const response = await axios.post(API_URL, { action_mode: "getlist" });
//     return response.data;
//   } catch (err: unknown) {
//     const error = err as axios.AxiosError;
//     console.error("List Error:", error.response?.data || error.message);
//     throw error;
//   }
// };

// // ===== Download file by ID =====
// const downloadFileById = async (
//   file_id: string,
//   patient_id: string,
//   admission_id: string
// ) => {
//   try {
//     const response = await axios.post(
//       API_URL,
//       { action_mode: "download-single", file_id, patient_id, admission_id },
//       { responseType: "blob" }
//     );
//     return response.data;
//   } catch (err: unknown) {
//     const error = err as axios.AxiosError;
//     console.error("Download Error:", error.response?.data || error.message);
//     throw error;
//   }
// };

// // ===== Preview file by ID =====
// const previewFileById = (drive_file_id: string) => {
//   try {
//     const previewLink = `${API_URL}preview?file_id=${drive_file_id}`;
//     window.open(previewLink, "_blank");
//   } catch (err: unknown) {
//     const error = err as axios.AxiosError;
//     console.error("Preview Error:", error.response?.data || error.message);
//     throw error;
//   }
// };

// // ===== Export fileAPI =====
// const fileAPI = {
//   submitRecordWithFile,
//   listRecords,
//   downloadFileById,
//   previewFileById,
// };

// export default fileAPI;
