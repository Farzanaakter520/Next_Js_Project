"use server";

export async function uploadToDriveAction(formData: FormData) {
  try {
    const response = await fetch(
      "https://sdms-api-o74bb.ondigitalocean.app/api/v1/fileupload/fileuploadapi/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Server returned an error:", response.status, text);
      return { success: false, msg: "Server returned an error" };
    }

    const data = await response.json();

    if (!data?.success) {
      console.error("❌ Upload failed (backend):", data);
      return { success: false, msg: data?.msg || "Upload failed" };
    }

    console.log("✅ Upload success:", data);
    return { success: true, data: data.data };
  } catch (error) {
    console.error("🚨 UploadToDriveAction error:", error);
    return { success: false, msg: "Unexpected client-side error" };
  }
}
