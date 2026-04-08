import { useState } from "react";
import API from "../services/api";

interface Props {
  onUploadSuccess: () => void;
}

export default function PdfUpload({ onUploadSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    try {
      setLoading(true);
      setMessage(null);
      const formData = new FormData();
      formData.append("pdf", file);
      await API.post("/pdf/upload", formData);
      setMessage({ text: "PDF uploaded & indexed successfully", ok: true });
      setFile(null);
      onUploadSuccess();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || "Upload failed", ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Upload PDF</h3>

      {/* Drop zone */}
      <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-neutral-700 hover:border-blue-500/60 rounded-xl p-8 cursor-pointer transition-colors group bg-neutral-900/40">
        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
          <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        {file ? (
          <div className="text-center">
            <p className="text-sm text-blue-400 font-medium">{file.name}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-neutral-300">Drop a PDF here or <span className="text-blue-400">browse</span></p>
            <p className="text-xs text-neutral-500 mt-0.5">Supports scanned PDFs via OCR</p>
          </div>
        )}
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </label>

      {file && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleUpload}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm px-5 py-2.5 rounded-lg transition font-medium"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
                Uploading...
              </>
            ) : "Upload & Index"}
          </button>
          <button
            onClick={() => setFile(null)}
            className="text-xs text-neutral-500 hover:text-neutral-300 transition"
          >
            Cancel
          </button>
        </div>
      )}

      {message && (
        <p className={`text-sm ${message.ok ? "text-emerald-400" : "text-red-400"}`}>
          {message.ok ? "✓ " : "⚠ "}{message.text}
        </p>
      )}
    </div>
  );
}