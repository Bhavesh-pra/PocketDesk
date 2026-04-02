import PdfUpload from "../components/PdfUpload";
import PdfList from "../components/PdfList";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PdfPage() {
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-10">
      <button
  onClick={() => navigate("/home")}
  className="text-sm text-blue-400 hover:underline"
>
← Back to Home
</button>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          Your PDFs
        </h1>
      </div>

      <div className="border border-neutral-700 bg-neutral-900 p-6">
        <PdfUpload onUploadSuccess={() => setRefresh(!refresh)} />
      </div>

      <div className="border border-neutral-700 bg-neutral-900 p-6">
        <PdfList refresh={refresh} />
      </div>

    </div>
  );
}