import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const features = [
  {
    path: "/pdfs",
    label: "PDFs",
    desc: "Upload & search documents with AI",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    gradient: "from-blue-600/20 to-blue-500/5",
    border: "hover:border-blue-500/60",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
  },
  {
    path: "/images",
    label: "Images",
    desc: "Albums with OCR text extraction",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    gradient: "from-purple-600/20 to-purple-500/5",
    border: "hover:border-purple-500/60",
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
  },
  {
    path: "/videos",
    label: "Videos",
    desc: "YouTube notes & video transcripts",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    gradient: "from-red-600/20 to-red-500/5",
    border: "hover:border-red-500/60",
    iconColor: "text-red-400",
    iconBg: "bg-red-500/10",
  },
  {
    path: "/todo",
    label: "To-Do",
    desc: "Tasks with smart reminders",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: "from-emerald-600/20 to-emerald-500/5",
    border: "hover:border-emerald-500/60",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const context = useContext(AuthContext);
  const email = context?.email ?? "";
  const greeting = getGreeting();
  const name = email ? email.split("@")[0] : "there";

  return (
    <div className="space-y-10">
      {/* Hero greeting */}
      <div className="space-y-1.5">
        <p className="text-sm text-neutral-500 font-medium tracking-wide uppercase">
          {greeting}
        </p>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, <span className="text-blue-400">{name}</span>
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Your AI-powered personal workspace. Ask anything, search everything.
        </p>
      </div>

      {/* Quick action — new chat */}
      <div
        onClick={() => navigate(`/chat/${crypto.randomUUID()}`)}
        className="group flex items-center gap-4 bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-transparent border border-blue-500/30 hover:border-blue-400/60 rounded-xl px-6 py-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-blue-900/20"
      >
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-lg shadow-blue-900/40">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Start a new AI chat</p>
          <p className="text-xs text-neutral-400 mt-0.5">Ask questions about your documents, images, or anything</p>
        </div>
        <svg className="w-4 h-4 text-neutral-500 group-hover:text-blue-400 ml-auto transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>

      {/* Feature grid */}
      <div>
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-4 font-medium">Workspace</p>
        <div className="grid grid-cols-2 gap-4">
          {features.map((f) => (
            <div
              key={f.path}
              onClick={() => navigate(f.path)}
              className={`group bg-gradient-to-br ${f.gradient} border border-neutral-700/80 ${f.border} rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}
            >
              <div className={`w-10 h-10 rounded-lg ${f.iconBg} ${f.iconColor} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                {f.icon}
              </div>
              <p className="text-sm font-semibold text-neutral-100">{f.label}</p>
              <p className="text-xs text-neutral-500 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}