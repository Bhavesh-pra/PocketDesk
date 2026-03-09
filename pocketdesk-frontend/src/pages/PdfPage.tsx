import PdfUpload from "../components/PdfUpload";
import PdfList from "../components/PdfList";
import { useState } from "react";

export default function PdfPage() {
  const [refresh, setRefresh] = useState(false);

  return (
    <div className="space-y-10">

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