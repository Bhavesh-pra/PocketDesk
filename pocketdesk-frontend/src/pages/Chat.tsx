import { useState } from "react";
import { useRef, useEffect } from "react";
import { useParams } from "react-router-dom";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RefreshCw } from "lucide-react";

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
  const controllerRef = useRef<AbortController | null>(null);

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

const handleRegenerate = async () => {

  if (!lastQuestion) return;

  try {

    setLoading(true);

    const res = await API.post<ChatResponse>("/chat/ask", {
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

    setMessages((prev) => [...prev, userMessage]);
    setImage(null);
    let res: ChatResponse;

    // IMAGE CHAT
    if (image) {

      const formData = new FormData();

      formData.append("image", image);
      formData.append("question", question);
      formData.append("sessionId", sessionId || "");

      res = await API.post("/chat/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setImage(null);
    }

    // NORMAL CHAT
    else {

      controllerRef.current = new AbortController();

const response = await fetch("http://localhost:5000/api/chat/ask", {
method: "POST",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${localStorage.getItem("token")}`
},
body: JSON.stringify({
question,
sessionId
}),
signal: controllerRef.current.signal
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

let aiText = "";

setMessages(prev => [...prev, { role: "AI", content: "" }]);

while (true) {

const { done, value } = await reader!.read();

if (done) break;

const chunk = decoder.decode(value, { stream: true });

aiText += chunk;

setMessages(prev => {

const updated = [...prev];

updated[updated.length - 1] = {
role: "AI",
content: aiText
};

return updated;

});

}

    }

    setLoading(false);
    setQuestion("");

  } catch (error:any) {

if (error.name === "AbortError") {
console.log("Generation stopped");
return;
}

console.log("Chat error");

}finally {

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

            {/* Regenerate button */}
            {msg.role === "AI" && index === messages.length - 1 && (
              <button
                onClick={handleRegenerate}
                className="text-xs text-blue-400 mt-3 hover:underline"
              >
                <RefreshCw size={14} />Regenerate
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

    {/* Input */}

    {image && (

      <div className="mb-3 relative w-fit">

      <img
        src={URL.createObjectURL(image)}
        className="w-32 h-24 object-cover rounded border border-neutral-700"
      />

      <button
      onClick={() => setImage(null)}
      className="absolute top-1 right-1 text-xs bg-black px-2 py-1 rounded"
      >
      ✕
      </button>

      </div>

    )}      
    <div className="mt-6 flex gap-3 border-t border-neutral-700 pt-4">

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

      <label className="cursor-pointer px-3 flex items-center">
📎
<input
type="file"
accept="image/*"
onChange={(e)=>setImage(e.target.files?.[0] || null)}
hidden
/>
</label>

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

  </div>
);
}