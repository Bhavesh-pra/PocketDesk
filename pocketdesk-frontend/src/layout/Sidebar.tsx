import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import { Trash2 } from "lucide-react";

interface Conversation {
  sessionId: string;
  title?: string;
}

export function Sidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {

  const navigate = useNavigate();
  const location = useLocation();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const deleteChat = async (sessionId:string)=>{

try{

await API.delete(`/chat/${sessionId}`);

setConversations(prev =>
prev.filter(chat => chat.sessionId !== sessionId)
);

}catch(err){
console.log("Delete failed");
}

};        

  const navItem = (path: string, label: string) => {
    const active = location.pathname === path;

    return (
      <button
        onClick={() => {
          navigate(path);
          if(onCloseMobile) onCloseMobile();
        }}
        className={`w-full text-left px-4 py-3 text-sm border-l-2 ${
          active
            ? "border-blue-500 bg-neutral-800"
            : "border-transparent hover:bg-neutral-800"
        }`}
      >
        {label}
      </button>
    );
  };

  // Create new chat
  const createNewChat = () => {
    const newSessionId = crypto.randomUUID();
    navigate(`/chat/${newSessionId}`);
  };

  // Load chat list
useEffect(() => {

  const loadChats = async () => {

    try {

      const res = await API.get("/chat/list");
      setConversations(res.data);

    } catch (err) {
      console.log("Chat list load failed");
    }

  };

  loadChats();

}, [location.pathname]);

  return (
    <div className="w-56 bg-neutral-800 border-r border-neutral-700 flex flex-col h-full shadow-2xl md:shadow-none">
      {/* Mobile close button header - only visible on small screens */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-neutral-700">
        <span className="font-semibold text-neutral-200">Menu</span>
        <button 
          onClick={onCloseMobile}
          className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-700 transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pt-2">

        {navItem("/home", "Home")}

        {/* New Chat */}
        <button
          onClick={createNewChat}
          className="w-full text-left px-4 py-3 text-sm border-l-2 border-transparent hover:bg-neutral-800"
        >
          + New Chat
        </button>

        {/* Chat History */}
        <div className="mt-4 px-4 text-xs text-neutral-400">
          Chats
        </div>

        {conversations.map((chat) => (

        <div
        key={chat.sessionId}
className="flex items-center justify-between px-4 py-2 text-sm hover:bg-neutral-800"
        >

        <button
        onClick={() => navigate(`/chat/${chat.sessionId}`)}
        className="truncate text-left flex-1"
        >
        {chat.title || "New Chat"}
        </button>       

        {confirmingDelete === chat.sessionId ? (
          <div className="flex items-center gap-1.5 ml-2 animate-in fade-in slide-in-from-right-1 duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteChat(chat.sessionId);
                setConfirmingDelete(null);
              }}
              className="px-2 py-1 text-[10px] bg-red-600 hover:bg-red-700 text-white rounded transition-colors font-semibold"
            >
              Confirm
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmingDelete(null);
              }}
              className="p-1 hover:bg-neutral-700 text-neutral-400 rounded transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button       
            onClick={(e) => {
              e.stopPropagation();
              setConfirmingDelete(chat.sessionId);
            }}
            className="text-neutral-500 hover:text-red-500 p-2 rounded-lg hover:bg-neutral-700/50 transition-colors flex items-center justify-center group/del"
            title="Delete Chat"
          >
            <Trash2 size={14} className="group-hover/del:scale-110 transition-transform" />
          </button>
        )}

        </div>

      ))}

      </div>

    </div>
  );
}