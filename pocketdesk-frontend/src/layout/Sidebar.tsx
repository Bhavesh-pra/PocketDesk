import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

interface Conversation {
  sessionId: string;
  title?: string;
}

export default function Sidebar() {

  const navigate = useNavigate();
  const location = useLocation();

  const [conversations, setConversations] = useState<Conversation[]>([]);

  const navItem = (path: string, label: string) => {
    const active = location.pathname === path;

    return (
      <button
        onClick={() => navigate(path)}
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
    <div className="w-56 bg-neutral-800 border-r border-neutral-700 flex flex-col">

      {/* Logo */}
      <div className="px-6 py-6 text-lg font-semibold border-b border-neutral-700">
        PocketDesk
      </div>

      <div className="flex-1 overflow-y-auto">

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

          <button
            key={chat.sessionId}
            onClick={() => navigate(`/chat/${chat.sessionId}`)}
            className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-800 truncate"
          >
            {chat.title || "New Chat"}
          </button>

        ))}

      </div>

    </div>
  );
}