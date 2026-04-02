import { useState } from "react";
import { useRef, useEffect } from "react";
import { useParams } from "react-router-dom";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RefreshCw } from "lucide-react";
import { getAccessToken } from "../services/api";

import API from "../services/api";

import type { ChatResponse } from "../types/api";

interface Message {
role: "User" | "AI";
content: string;
image?: string;
sources?: { text: string }[];
}

export default function Chat() {

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [lastQuestion, setLastQuestion] = useState("");
  const { sessionId } = useParams();
  const [image, setImage] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const [uploadedPdf, setUploadedPdf] = useState<string | null>(null);
  const [showAttachMenu,setShowAttachMenu] = useState(false);
  const [noteFile, setNoteFile] = useState<File | null>(null);

  useEffect(() => {

const loadHistory = async () => {

try{

const res = await API.get(
`/chat/history/${sessionId}`
);

setMessages(res.data);

}catch(err){
console.log("History load failed");
}

};

if(sessionId){
loadHistory();
}

}, [sessionId]);

useEffect(() => {
  return () => {
    if (image) {
      URL.revokeObjectURL(URL.createObjectURL(image));
    }
  };
}, [image]);

const handleRegenerate = async () => {

  if (!lastQuestion) return;

  try {

    setLoading(true);

    const res = await API.post<ChatResponse>("/chat/ask?stream=false", {
      question: lastQuestion,
      sessionId: sessionId,
    });

    setMessages(prev => {
      const updated = [...prev];

      // remove last AI message
      if (updated[updated.length - 1].role === "AI") {
        updated.pop();
      }

      // add regenerated answer
      updated.push({
        role: "AI",
        content: res.data.answer
      });

      return updated;
    });

  } catch (error) {
    console.log("Regenerate error");
  } finally {
    setLoading(false);
  }

};

const handleStop = () => {

if (controllerRef.current) {

controllerRef.current.abort();
controllerRef.current = null;

}

setLoading(false);

};

const handleNoteUpload = async (file: File) => {

try {

const formData = new FormData();

formData.append("note", file);
formData.append("sessionId", sessionId || "");

await API.post("/notes/upload", formData, {
headers: {
"Content-Type": "multipart/form-data"
}
});

} catch (err) {

console.log("Note upload failed");

}

};

const handlePdfUpload = async (file:File)=>{

if(!file) return;

const formData = new FormData();
formData.append("pdf", file);
formData.append("sessionId", sessionId || ""); // 🔥 ADD THIS

await API.post("/chat/pdf",formData,{
headers:{
"Content-Type":"multipart/form-data"
}
});

setUploadedPdf(file.name);

};

const handleAsk = async () => {

  if (!question.trim()) return;

  try {

    setLoading(true);
    setLastQuestion(question);

    const userMessage: Message = {
      role: "User",
      content: question,
      image: image ? URL.createObjectURL(image) : undefined
    };

    setMessages(prev => [...prev, userMessage]);

    // IMAGE CHAT
    if (image) {

      const formData = new FormData();
      formData.append("image", image);
      formData.append("question", question);
      formData.append("sessionId", sessionId || "");

      const res = await API.post("/chat/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setMessages(prev => [
        ...prev,
        { role: "AI", content: res.data.answer }
      ]);

      setImage(null);
      setPdfFile(null);
      setNoteFile(null);
      setQuestion("");
      return;
    }

    // NORMAL STREAMING CHAT

    controllerRef.current = new AbortController();

    
const token = getAccessToken();

const BASE_URL = import.meta.env.VITE_API_URL;

const response = await fetch(`${BASE_URL}/api/chat/ask`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}` // 🔥 FIX
  },
  credentials: "include",
  body: JSON.stringify({
    question,
    sessionId
  }),
  signal: controllerRef.current.signal
});

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let aiText = "";
    let buffer = "";

    setMessages(prev => [...prev, { role: "AI", content: "" }]);

    const updateUI = () => {

      if (!buffer) return;

      aiText += buffer;
      buffer = "";

      setMessages(prev => {

        const updated = [...prev];

        updated[updated.length - 1] = {
          role: "AI",
          content: aiText
        };

        return updated;

      });

    };

    const interval = setInterval(updateUI, 50);

    while (true) {

      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      buffer += chunk;

    }

    clearInterval(interval);
    updateUI();

    setQuestion("");

  } catch (error: any) {

    if (error.name === "AbortError") {
      console.log("Generation stopped");
      return;
    }

    console.log("Chat error:", error);

  } finally {

    setLoading(false);

  }
};

  useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

return (
  <div className="flex flex-col h-[calc(90vh-4rem)]">

    {/* Messages */}
    <div className="flex-1 overflow-y-auto space-y-8 pr-4">

      {messages.map((msg, index) => (
        <div
          key={index}
          className={`flex ${
            msg.role === "User" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`px-5 py-3 text-sm max-w-2xl border ${
              msg.role === "User"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-neutral-900 border-neutral-700"
            }`}
          >
            <div className="prose prose-invert prose-sm max-w-none">

              {msg.image && (
                <img
                  src={msg.image}
                  className="max-w-xs rounded mb-3 border border-neutral-700"
                />
              )}

              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>

            </div>

            {msg.role === "AI" && index === messages.length - 1 && (
              <button
                onClick={handleRegenerate}
                className="text-xs text-blue-400 mt-3 hover:underline flex items-center gap-1"
              >
                <RefreshCw size={14} /> Regenerate
              </button>
            )}
          </div>
        </div>
      ))}

      <div ref={bottomRef} />

      {loading && (
        <div className="text-sm text-neutral-400">
          AI is thinking...
        </div>
      )}

    </div>

    {/* Input Bar */}

    {/* Attachment Preview */}
<div className="flex gap-3 mb-3 flex-wrap">

  {/* IMAGE PREVIEW */}
  {image && (
    <div className="flex items-center gap-2 bg-neutral-800 px-3 py-2 rounded">

      <img
        src={URL.createObjectURL(image)}
        className="w-14 h-14 object-cover rounded border border-neutral-700"
      />

      <button
        onClick={() => setImage(null)}
        className="text-red-400 text-xs"
      >
        ✕
      </button>
    </div>
  )}

  {/* PDF PREVIEW */}
  {pdfFile && (
    <div className="flex items-center gap-2 bg-neutral-800 px-3 py-2 rounded">

      <span>📄 {pdfFile.name}</span>

      <button
        onClick={() => setPdfFile(null)}
        className="text-red-400 text-xs"
      >
        ✕
      </button>
    </div>
  )}

  {/* NOTE PREVIEW */}
  {noteFile && (
    <div className="flex items-center gap-2 bg-neutral-800 px-3 py-2 rounded">

      <span>📝 {noteFile.name}</span>

      <button
        onClick={() => setNoteFile(null)}
        className="text-red-400 text-xs"
      >
        ✕
      </button>
    </div>
  )}

</div>



    <div className="mt-6 flex items-center gap-3 border-t border-neutral-700 pt-4">

      {/* Attachment Menu */}
      <div className="relative">

        <button
          onClick={()=>setShowAttachMenu(!showAttachMenu)}
          className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-lg"
        >
          +
        </button>

        {showAttachMenu && (

          <div className="absolute bottom-12 left-0 bg-neutral-900 border border-neutral-700 w-44 rounded shadow-lg">

            <button
              onClick={()=>{
                document.getElementById("imageInput")?.click()
                setShowAttachMenu(false)
              }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-neutral-800"
            >
              🖼 Upload Image
            </button>

            <button
              onClick={()=>{
                document.getElementById("pdfInput")?.click()
                setShowAttachMenu(false)
              }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-neutral-800"
            >
              📄 Upload PDF
            </button>

            <button
              onClick={()=>{
                document.getElementById("noteInput")?.click()
                setShowAttachMenu(false)
              }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-neutral-800"
            >
              📝 Add Note
            </button>

          </div>

        )}

      </div>

      {/* Question Input */}
      <input
        value={question}
        onChange={(e)=>setQuestion(e.target.value)}
        placeholder="Ask something..."
        disabled={loading}
        onKeyDown={(e)=>{
          if(e.key === "Enter"){
            handleAsk();
          }
        }}
        className="flex-1 bg-neutral-900 border border-neutral-700 px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
      />

      {/* Ask / Stop Button */}
      {loading ? (

        <button
          onClick={handleStop}
          className="bg-red-600 text-white px-6 text-sm"
        >
          Stop
        </button>

      ) : (

        <button
          onClick={handleAsk}
          className="bg-blue-600 text-white px-6 text-sm"
        >
          Ask
        </button>

      )}

    </div>

    {/* Hidden Inputs */}

    <input
      id="imageInput"
      type="file"
      accept="image/*"
      hidden
      onChange={(e)=>setImage(e.target.files?.[0] || null)}
    />

    <input
      id="pdfInput"
      type="file"
      accept=".pdf"
      hidden
      onChange={(e)=>{
      const file = e.target.files?.[0];
        if(file){
        setPdfFile(file);      // ✅ preview
        handlePdfUpload(file); // backend upload
      } 
    }}
    />

    <input
      id="noteInput"
      type="file"
      accept=".txt,.md"
      hidden
      onChange={(e)=>{
        const file = e.target.files?.[0];
        if(file){
          setNoteFile(file);
          handleNoteUpload(file);
        }
      }}
    />

  </div>
);
}

