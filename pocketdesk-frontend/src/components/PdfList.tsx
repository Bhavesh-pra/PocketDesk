import { useEffect, useState } from "react";
import axios from "axios";

interface Pdf {
  _id: string;
  fileName: string;
  filePath: string;
}

interface Props {
  refresh: boolean;
}

export default function PdfList({ refresh }: Props) {
  const [pdfs, setPdfs] = useState<Pdf[]>([]);

  useEffect(() => {
    fetchPdfs();
  }, [refresh]);

  const fetchPdfs = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://localhost:5000/api/pdf/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setPdfs(res.data);
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");

    await axios.delete(`http://localhost:5000/api/pdf/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchPdfs();
  };

  const openPdf = (filePath: string) => {
    // filePath example: uploads/pdfs/123-file.pdf
    const cleanPath = filePath.replace(/\\/g, "/"); // windows safety
    window.open(`http://localhost:5000/${cleanPath}`, "_blank");
  };

  return (
    <div className="space-y-3">

      {pdfs.length === 0 && (
        <div className="text-sm text-neutral-400">
          No PDFs uploaded yet.
        </div>
      )}

      {pdfs.map((pdf) => (
        <div
          key={pdf._id}
          className="flex justify-between items-center border border-neutral-700 px-4 py-3 bg-neutral-900"
        >
          {/* Left Section */}
          <div
            onClick={() => openPdf(pdf.filePath)}
            className="cursor-pointer text-sm text-neutral-200 hover:text-blue-400 truncate"
          >
            {pdf.fileName}
          </div>

          {/* Right Section */}
          <button
            onClick={() => handleDelete(pdf._id)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      ))}

    </div>
  );
}