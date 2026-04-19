import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Loader2 } from "lucide-react";
import API from "../services/api";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle"|"success"|"error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/contact", formData);
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-6 md:p-12">
      <Link to="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition mb-12">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-12"
      >
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Contact Us</h1>
          <p className="text-lg text-neutral-400 mb-8 max-w-md">
            Have questions, feedback, or need support? We'd love to hear from you. Fill out the form or reach us directly.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                <Mail className="text-blue-400" size={20} />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Email us at</p>
                <p className="text-lg font-medium text-white">pocketdesk3@gmail.com</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                <Phone className="text-blue-400" size={20} />
              </div>
              <div>
                <p className="text-sm text-neutral-500">WhatsApp us</p>
                <p className="text-lg font-medium text-white">7276186976</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-xl">
          <h3 className="text-2xl font-bold text-white mb-6">Send a Message</h3>
          
          {status === "success" && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
              Message sent successfully! We'll get back to you soon.
            </div>
          )}
          {status === "error" && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              Failed to send message. Please try again or use direct email.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Your Name</label>
              <input 
                required
                type="text" 
                value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Your Email</label>
              <input 
                required
                type="email" 
                value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Message</label>
              <textarea 
                required rows={4}
                value={formData.message} onChange={e=>setFormData({...formData, message: e.target.value})}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
