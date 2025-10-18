"use server"; // Next.js server action

export async function uploadToDriveAction(formData: FormData) {
  try {
    // ✅ Validate file types before sending
    const allowedTypes = [
      "application/pdf",
      "video/mp4",
      "video/mov",
      "video/avi",
      "video/mkv",
      "image/jpeg",
      "image/jpg",
      "image/pjpeg",  // extra JPEG type
      "image/png",
      "image/x-png",  // extra PNG type
      "image/gif",
    ];

    const files = formData.getAll("files") as File[];

    for (const file of files) {
      // ✅ allow all image MIME types starting with "image/"
      const isValid =
        allowedTypes.includes(file.type) || file.type.startsWith("image/");

      if (!isValid) {
        console.error("❌ Invalid file type:", file.name, file.type);
        return {
          success: false,
          msg: "Only video, PDF, and image files are allowed",
        };
      }
    }

    // ✅ Upload to remote server
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
