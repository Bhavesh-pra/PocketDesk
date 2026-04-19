import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import API from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await API.post("/auth/forgot-password", { email });
      setStatus("success");
      setMessage(res.data.message || "Password reset email sent.");
    } catch (err) {
      setStatus("error");
      const error = err as { response?: { data?: { error?: string; message?: string } } };
      setMessage(error.response?.data?.error || error.response?.data?.message || "Failed to send reset link.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center -mt-16 px-6">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
        <p className="text-neutral-400 mb-6">Enter your email and we'll send you a link to reset your password.</p>

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
            <label className="block text-sm font-medium text-neutral-400 mb-2">Email Address</label>
            <input 
              required type="email" 
              value={email} onChange={e=>setEmail(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <button 
            disabled={status === "loading"}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            {status === "loading" && <Loader2 className="animate-spin" size={18} />}
            Send Reset Link
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
