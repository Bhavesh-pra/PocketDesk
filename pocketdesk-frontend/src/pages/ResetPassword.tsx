import { useState, useContext } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [message, setMessage] = useState("");
  
  const ctx = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setStatus("error");
      setMessage("Invalid token.");
      return;
    }
    
    setStatus("loading");
    try {
      const res = await API.post(`/auth/reset-password/${token}`, { password });
      setStatus("success");
      setMessage("Password successfully reset! Logging you in...");
      if (ctx) {
        ctx.login(res.data.accessToken, res.data.email, res.data.role);
        // Delay redirect lightly for UX
        setTimeout(() => navigate("/home"), 1500);
      }
    } catch (err) {
      setStatus("error");
      const error = err as { response?: { data?: { error?: string; message?: string; details?: string[] } } };
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Failed to reset password.";
      if (error.response?.data?.details) {
        setMessage(error.response.data.details.join(". "));
      } else {
        setMessage(errorMsg);
      }
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center px-6 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Invalid Reset Link</h2>
        <p className="text-neutral-400 mb-6">This password reset link is invalid or expired.</p>
        <Link to="/forgot-password" className="text-blue-500 hover:underline">Request a new one</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center -mt-16 px-6">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-2">Create New Password</h2>
        <p className="text-neutral-400 mb-6">Enter a strong new password below.</p>

        {status === "success" && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
            {message}
          </div>
        )}
        {status === "error" && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">New Password</label>
            <input 
              required type="password" minLength={6}
              value={password} onChange={e=>setPassword(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <button 
            disabled={status === "loading" || status === "success"}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            {status === "loading" && <Loader2 className="animate-spin" size={18} />}
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
