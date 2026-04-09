import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PdfUpload from "../components/PdfUpload";
import PdfList from "../components/PdfList";
import { useState } from "react";

export default function PdfPage() {
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button 
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-4 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">PDF Library</h1>
        </div>
        <p className="text-sm text-neutral-500 ml-12">Upload documents — they'll be indexed and searchable via AI chat</p>
      </div>

      {/* Upload card */}
      <div className="bg-neutral-900/60 border border-neutral-700/80 rounded-xl p-6">
        <PdfUpload onUploadSuccess={() => setRefresh(!refresh)} />
      </div>

      {/* File list card */}
      <div className="bg-neutral-900/60 border border-neutral-700/80 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-4">Your Documents</h3>
        <PdfList refresh={refresh} />
      </div>
    </div>
  );
}