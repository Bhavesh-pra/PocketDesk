import { useState, useRef, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RefreshCw } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

interface Message {
  role: "User" | "AI";
  content: string;
  image?: string;
}

interface ChatResponse {
  answer: string;
}

export default function Chat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");
  const { sessionId } = useParams();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [noteFile, setNoteFile] = useState<File | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const context = useContext(AuthContext);
  const email = context?.email ?? "";
  const avatarLetter = email ? email[0].toUpperCase() : "U";

  // Load history
  useEffect(() => {
    const loadHistory = async () => {
      if (!sessionId) return;
      try {
        const res = await API.get(`/chat/history/${sessionId}`);
        setMessages(res.data);
      } catch {
        console.log("History load failed");
      }
    };
    loadHistory();
  }, [sessionId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup image object URLs
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const setImageFile = (file: File | null) => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImage(file);
    setImagePreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleRegenerate = async () => {
    if (!lastQuestion) return;
    try {
      setLoading(true);
      const res = await API.post<ChatResponse>("/chat/ask?stream=false", {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        question: lastQuestion,
        sessionId,
      });
      setMessages((prev) => {
        const updated = [...prev];
        if (updated[updated.length - 1].role === "AI") updated.pop();
        updated.push({ role: "AI", content: res.data.answer });
        return updated;
      });
    } catch {
      console.log("Regenerate error");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setLoading(false);
  };

  const handleNoteUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("note", file);
      formData.append("sessionId", sessionId || "");
      await API.post("/notes/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
    } catch {
      console.log("Note upload failed");
    }
  };

  const handlePdfUpload = async (file: File) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("sessionId", sessionId || "");
      await API.post("/chat/pdf", formData, { headers: { "Content-Type": "multipart/form-data" } });
    } catch {
      console.log("PDF upload failed");
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    try {
      setLoading(true);
      setError(null);
      setLastQuestion(question);

      const userMsg: Message = {
        role: "User",
        content: question,
        image: imagePreviewUrl ?? undefined,
      };
      setMessages((prev) => [...prev, userMsg]);
      setQuestion("");

      // IMAGE CHAT
      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        formData.append("question", question);
        formData.append("sessionId", sessionId || "");
        const res = await API.post("/chat/image", formData, { headers: { "Content-Type": "multipart/form-data" } });
        setMessages((prev) => [...prev, { role: "AI", content: res.data.answer }]);
        setImageFile(null);
        setPdfFile(null);
        setNoteFile(null);
        return;
      }

      // STREAMING CHAT — uses native fetch() because Axios cannot stream in browser
      controllerRef.current = new AbortController();

      const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api";
      const token = (await import("../services/api")).getAccessToken();

      const response = await fetch(`${baseURL}/chat/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question, sessionId }),
        signal: controllerRef.current.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw { response: { data: errData } };
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let aiText = "";
      let buffer = "";

      setMessages((prev) => [...prev, { role: "AI", content: "" }]);

      const updateUI = () => {
        if (!buffer) return;
        aiText += buffer;
        buffer = "";
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "AI", content: aiText };
          return updated;
        });
      };

      const interval = setInterval(updateUI, 50);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
      }
      clearInterval(interval);
      updateUI();

    } catch (error) {
      console.error("Chat failure:", error);
      const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
      setError(err.response?.data?.error || err.response?.data?.message || err.message || "Message failed. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const hasAttachment = image || pdfFile || noteFile;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-4rem)]">

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-1 py-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center mb-4 shadow-lg shadow-blue-900/30">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">How can I help you today?</h2>
            <p className="text-sm text-neutral-500 max-w-sm">Ask about your documents, images, or anything in your knowledge base.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === "User" ? "justify-end" : "justify-start"}`}>
            {/* AI avatar */}
            {msg.role === "AI" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5 shadow shadow-blue-900/30">
                AI
              </div>
            )}

            <div className={`max-w-2xl ${msg.role === "User" ? "items-end" : "items-start"} flex flex-col gap-1`}>
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "User"
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-neutral-800/80 border border-neutral-700/60 text-neutral-100 rounded-tl-sm"
                  }`}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="attachment"
                    className="max-w-xs rounded-xl mb-3 border border-white/10"
                  />
                )}
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              </div>

              {/* Regenerate */}
              {msg.role === "AI" && idx === messages.length - 1 && !loading && (
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-blue-400 transition-colors mt-1 ml-1"
                >
                  <RefreshCw size={12} />
                  Regenerate
                </button>
              )}
            </div>

            {/* User avatar */}
            {msg.role === "User" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5 shadow shadow-blue-900/30">
                {avatarLetter}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
              AI
            </div>
            <div className="bg-neutral-800/80 border border-neutral-700/60 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

          {error && (
            <div className="mx-1 my-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          <div ref={bottomRef} />
      </div>

      {/* Attachment previews */}
      {hasAttachment && (
        <div className="flex gap-2 mb-2 flex-wrap px-1">
          {image && imagePreviewUrl && (
            <div className="relative group">
              <img src={imagePreviewUrl} className="w-14 h-14 object-cover rounded-xl border border-neutral-700" />
              <button
                onClick={() => setImageFile(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-neutral-900 border border-neutral-600 rounded-full flex items-center justify-center text-neutral-400 hover:text-red-400 text-xs"
              >✕</button>
            </div>
          )}
          {pdfFile && (
            <div className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2">
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="text-xs text-neutral-300 max-w-[120px] truncate">{pdfFile.name}</span>
              <button onClick={() => setPdfFile(null)} className="text-neutral-500 hover:text-red-400 text-xs">✕</button>
            </div>
          )}
          {noteFile && (
            <div className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2">
              <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25" />
              </svg>
              <span className="text-xs text-neutral-300 max-w-[120px] truncate">{noteFile.name}</span>
              <button onClick={() => setNoteFile(null)} className="text-neutral-500 hover:text-red-400 text-xs">✕</button>
            </div>
          )}
        </div>
      )}

      {/* Input bar */}
      <div className="border border-neutral-700/80 bg-neutral-900/80 rounded-2xl p-3 flex items-end gap-3 backdrop-blur-sm">

        {/* Attach button */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="w-9 h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-neutral-200 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>

          {showAttachMenu && (
            <div className="absolute bottom-12 left-0 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl w-44 overflow-hidden z-10">
              {[
                { id: "imageInput", emoji: "🖼", label: "Upload Image" },
                { id: "pdfInput", emoji: "📄", label: "Upload PDF" },
                { id: "noteInput", emoji: "📝", label: "Add Note" },
              ].map(({ id, emoji, label }) => (
                <button
                  key={id}
                  onClick={() => {
                    document.getElementById(id)?.click();
                    setShowAttachMenu(false);
                  }}
                  className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-700 transition"
                >
                  <span>{emoji}</span> {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Textarea */}
        <textarea
          ref={inputRef}
          rows={1}
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAsk();
            }
          }}
          placeholder="Ask anything… (Shift+Enter for new line)"
          disabled={loading}
          className="flex-1 bg-transparent text-sm text-neutral-200 placeholder-neutral-600 resize-none focus:outline-none min-h-[36px] max-h-[120px] py-1.5 leading-relaxed"
        />

        {/* Send / Stop */}
        {loading ? (
          <button
            onClick={handleStop}
            className="shrink-0 w-9 h-9 rounded-xl bg-red-600 hover:bg-red-700 flex items-center justify-center transition"
          >
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleAsk}
            disabled={!question.trim()}
            className="shrink-0 w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 flex items-center justify-center transition"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        )}
      </div>

      {/* Hidden file inputs */}
      <input id="imageInput" type="file" accept="image/*" hidden
        onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
      <input id="pdfInput" type="file" accept=".pdf" hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) { setPdfFile(f); handlePdfUpload(f); }
        }} />
      <input id="noteInput" type="file" accept=".txt,.md" hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) { setNoteFile(f); handleNoteUpload(f); }
        }} />

      {/* Close attach menu on outside click */}
      {showAttachMenu && (
        <div className="fixed inset-0 z-0" onClick={() => setShowAttachMenu(false)} />
      )}
    </div>
  );
}
