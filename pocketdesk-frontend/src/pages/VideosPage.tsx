import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import API from "../services/api";

interface Video {
  _id: string;
  fileName: string;
  createdAt: string;
}

type Tab = "youtube" | "uploaded";

// Extract YouTube video ID from any URL format
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function VideosPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("youtube");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button 
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-4 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        <h1 className="text-xl font-bold text-white">Videos</h1>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-neutral-700">
        <button
          onClick={() => setTab("youtube")}
          className={`px-5 py-2 text-sm transition ${
            tab === "youtube"
              ? "border-b-2 border-blue-500 text-blue-400"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          YouTube + Notes
        </button>
        <button
          onClick={() => setTab("uploaded")}
          className={`px-5 py-2 text-sm transition ${
            tab === "uploaded"
              ? "border-b-2 border-blue-500 text-blue-400"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Uploaded Videos
        </button>
      </div>

      {tab === "youtube" && <YouTubeTab />}
      {tab === "uploaded" && <UploadedTab />}
    </div>
  );
}

// ============================================================
// YOUTUBE TAB — player left, notepad right
// ============================================================
function YouTubeTab() {
  const [urlInput, setUrlInput] = useState("");
  const [activeUrl, setActiveUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"" | "saved" | "error">("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load note whenever activeUrl changes
  useEffect(() => {
    if (!activeUrl) return;

    const loadNote = async () => {
      try {
        const res = await API.get("/video/note", {
          params: { videoUrl: activeUrl }
        });
        setNoteContent(res.data.content || "");
      } catch {
        setSaveStatus("error");
        setNoteContent("");
      }
    };

    loadNote();
  }, [activeUrl]);

  const handleLoad = () => {
    const id = extractYouTubeId(urlInput.trim());
    if (!id) {
      setSaveStatus("error"); // Or another state-based warning
      console.error("Invalid YouTube URL");
      return;
    }
    setVideoId(id);
    setActiveUrl(urlInput.trim());
    setSaveStatus("");
  };

  // Debounced auto-save — saves 1.5s after user stops typing
  const handleNoteChange = useCallback(
    (value: string) => {
      setNoteContent(value);
      setSaveStatus("");

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      saveTimerRef.current = setTimeout(async () => {
        if (!activeUrl) return;
        setSaving(true);
        try {
          await API.post("/video/note", {
            videoUrl: activeUrl,
            content: value,
            videoTitle: ""
          });
          setSaveStatus("saved");
        } catch {
          setSaveStatus("error");
        } finally {
          setSaving(false);
        }
      }, 1500);
    },
    [activeUrl]
  );

  return (
    <div className="space-y-4">
      {/* URL Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Paste YouTube URL — e.g. https://youtube.com/watch?v=..."
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLoad();
          }}
          className="flex-1 bg-neutral-800 border border-neutral-700 px-4 py-2 text-sm text-neutral-200 focus:outline-none focus:border-blue-500 rounded"
        />
        <button
          onClick={handleLoad}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 transition rounded"
        >
          Load
        </button>
      </div>

      {/* Player + Notepad */}
      {videoId ? (
        <div className="flex gap-4 h-[520px]">
          {/* Left: YouTube Player */}
          <div className="flex-[6] bg-black rounded overflow-hidden">
            <iframe
              key={videoId}
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Right: Notepad */}
          <div className="flex-[4] flex flex-col border border-neutral-700 bg-neutral-900 rounded overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-700">
              <span className="text-xs text-neutral-400 font-medium uppercase tracking-wide">
                Video Notes
              </span>
              <span className="text-xs text-neutral-500">
                {saving
                  ? "Saving..."
                  : saveStatus === "saved"
                  ? "✓ Saved"
                  : saveStatus === "error"
                  ? "⚠ Save failed"
                  : "Auto-saves as you type"}
              </span>
            </div>

            <textarea
              value={noteContent}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="Take notes while watching... notes auto-save and will be here next time you open this video."
              className="flex-1 bg-transparent px-4 py-3 text-sm text-neutral-200 resize-none focus:outline-none placeholder-neutral-600"
            />
          </div>
        </div>
      ) : (
        <div className="h-64 border border-dashed border-neutral-700 rounded flex items-center justify-center text-neutral-500 text-sm">
          Paste a YouTube URL above and press Load
        </div>
      )}
    </div>
  );
}

// ============================================================
// UPLOADED VIDEOS TAB
// ============================================================
function UploadedTab() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const loadVideos = async () => {
    try {
      const res = await API.get("/video/list");
      setVideos(res.data);
    } catch {
      console.error("Failed to load videos");
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("video", file);

    try {
      setUploading(true);
      setProgress("Uploading...");

      await API.post("/video/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setProgress(`Uploading ${pct}%...`);
          }
        }
      });

      setProgress("Processing transcript... this may take a moment.");
      setFile(null);
      await loadVideos();
      setProgress("Done! Transcript extracted and added to your knowledge base.");
      setTimeout(() => setProgress(""), 4000);
    } catch (err) {
      setProgress((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, _name: string) => {

    try {
      await API.delete(`/video/${id}`);
      setVideos((prev) => prev.filter((v) => v._id !== id));
    } catch {
      setProgress("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div className="border border-neutral-700 bg-neutral-900 p-6 space-y-3 rounded">
        <p className="text-sm text-neutral-400">
          Upload a video — audio will be extracted and transcribed using Whisper,
          then added to your AI knowledge base.
        </p>

        <div className="flex gap-3 flex-wrap items-center">
          <input
            type="file"
            accept="video/*"
            disabled={uploading}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm text-neutral-300 file:mr-3 file:bg-blue-600 file:text-white file:px-3 file:py-1 file:border-0 file:text-sm file:cursor-pointer file:rounded"
          />

          {file && !uploading && (
            <button
              onClick={handleUpload}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 transition rounded"
            >
              Upload & Transcribe
            </button>
          )}

          {file && !uploading && (
            <button
              onClick={() => setFile(null)}
              className="text-neutral-500 text-sm hover:text-neutral-300"
            >
              Cancel
            </button>
          )}
        </div>

        {progress && (
          <p
            className={`text-sm ${
              progress.startsWith("Done")
                ? "text-green-400"
                : progress.includes("failed")
                ? "text-red-400"
                : "text-yellow-400"
            }`}
          >
            {progress}
          </p>
        )}
      </div>

      {/* Video List */}
      {videos.length === 0 ? (
        <p className="text-sm text-neutral-500">No videos uploaded yet.</p>
      ) : (
        <div className="space-y-2">
          {videos.map((v) => (
            <div
              key={v._id}
              className="flex items-center justify-between border border-neutral-700 bg-neutral-900 px-4 py-3 rounded"
            >
              <div>
                <p className="text-sm text-neutral-200">{v.fileName}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {new Date(v.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {confirmingDelete === v._id ? (
                  <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-1 duration-200">
                    <button
                      onClick={() => {
                        handleDelete(v._id, v.fileName);
                        setConfirmingDelete(null);
                      }}
                      className="px-2 py-1 text-[10px] bg-red-600 hover:bg-red-700 text-white rounded transition-colors font-semibold"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmingDelete(null)}
                      className="p-1 hover:bg-neutral-800 text-neutral-400 rounded transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmingDelete(v._id)}
                    className="text-red-400 text-xs hover:text-red-600 transition p-2 rounded-lg hover:bg-neutral-800"
                    title="Delete Video"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}