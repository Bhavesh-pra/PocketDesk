import { useState } from "react";
import API from "../services/api";

interface Props {
  onUploadSuccess: () => void;
}

export default function PdfUpload({ onUploadSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setMessage(null);

      const formData = new FormData();
      formData.append("pdf", file);

      const res = await API.post("/pdf/upload", formData);
      console.log("UPLOAD RESPONSE:", res.data);

      setMessage("PDF Uploaded Successfully");
      setFile(null);
      onUploadSuccess(); // refresh list
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Upload PDF</h3>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) =>
          setFile(e.target.files ? e.target.files[0] : null)
        } 
      />

      <br /><br />

      <button onClick={handleUpload} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 border border-blue-600">
        {loading ? "Uploading..." : "Upload"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}