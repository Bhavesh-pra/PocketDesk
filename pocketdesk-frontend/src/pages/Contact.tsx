import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Loader2, Plus, Minus, Github, Disc, Twitter, Linkedin } from "lucide-react";
import API from "../services/api";

interface FAQItem {
  question: string;
  answer: string;
}

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  
  // Accordion active FAQ index
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
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

  const faqs: FAQItem[] = [
    {
      question: "Is PocketDesk free to use?",
      answer: "Yes! The core capabilities of PocketDesk—including basic PDF indexing, image OCR albums, and note-taking—are free. We also offer a Premium tier with unlimited AI questions, larger document upload limits, and dedicated GPU speeds."
    },
    {
      question: "How is my personal data secured?",
      answer: "Privacy is a fundamental principle of PocketDesk. All files are encrypted during upload and stored in isolated sandbox storage. Furthermore, we never use your private workspace data, notes, or uploaded PDFs to train public foundation models."
    },
    {
      question: "What document types do you support?",
      answer: "We support PDF documents, general image uploads (PNG, JPG, WebP) for text extraction, and YouTube video URLs for AI summaries. We plan to support Markdown, Word documents (.docx), and Google Drive integrations in future updates."
    },
    {
      question: "Can I collaborate with other users?",
      answer: "We are actively developing real-time collaboration tools. You will soon be able to share folders, comment on annotated documents, and chat with files together. You can track this on our Coming Soon page."
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-6 md:p-12 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      {/* Decorative Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-900/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-900/10 blur-[130px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition mb-12">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Header & Two Columns */}
        <div className="flex flex-col lg:flex-row gap-16 mb-24">
          
          {/* Left Column: Info & Socials */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              Get in Touch
            </h1>
            <p className="text-lg text-neutral-400 mb-8 max-w-md leading-relaxed">
              Have questions, feedback, or need help? Send us a message or reach out via email or social channels. We typically reply within 24 hours.
            </p>

            <div className="space-y-6 mb-12">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center group-hover:border-blue-500 transition-colors">
                  <Mail className="text-blue-400" size={20} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Email us at</p>
                  <p className="text-base md:text-lg font-medium text-white select-all">pocketdesk3@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center group-hover:border-blue-500 transition-colors">
                  <Phone className="text-blue-400" size={20} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">WhatsApp / Call</p>
                  <p className="text-base md:text-lg font-medium text-white select-all">7276186976</p>
                </div>
              </div>
            </div>

            {/* Social handles list */}
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold mb-4">Join our community</p>
              <div className="flex items-center gap-3">
                <a 
                  href="https://github.com" target="_blank" rel="noreferrer"
                  className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-700 transition"
                >
                  <Github size={18} />
                </a>
                <a 
                  href="https://discord.com" target="_blank" rel="noreferrer"
                  className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-700 transition"
                >
                  <Disc size={18} />
                </a>
                <a 
                  href="https://twitter.com" target="_blank" rel="noreferrer"
                  className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-700 transition"
                >
                  <Twitter size={18} />
                </a>
                <a 
                  href="https://linkedin.com" target="_blank" rel="noreferrer"
                  className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-700 transition"
                >
                  <Linkedin size={18} />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }}
            className="flex-1 bg-neutral-900/40 backdrop-blur-sm border border-neutral-800 p-8 rounded-2xl shadow-xl relative overflow-hidden"
          >
            {/* Ambient card top glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 pointer-events-none" />

            <h3 className="text-2xl font-bold text-white mb-6 relative z-10">Send a Message</h3>
            
            {status === "success" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm relative z-10"
              >
                🎉 Message sent successfully! We'll get back to you soon.
              </motion.div>
            )}
            {status === "error" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm relative z-10"
              >
                ⚠️ Failed to send message. Please check your inputs or email us directly.
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Your Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})}
                  disabled={loading}
                  className="w-full bg-neutral-950/60 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50 text-sm"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Your Email</label>
                <input 
                  required
                  type="email" 
                  value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})}
                  disabled={loading}
                  className="w-full bg-neutral-950/60 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50 text-sm"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Message</label>
                <textarea 
                  required rows={4}
                  value={formData.message} onChange={e=>setFormData({...formData, message: e.target.value})}
                  disabled={loading}
                  className="w-full bg-neutral-950/60 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none disabled:opacity-50 text-sm"
                  placeholder="How can we help you..."
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-900/20 active:scale-98 text-sm"
              >
                {loading && <Loader2 className="animate-spin" size={16} />}
                {loading ? "Sending Message..." : "Send Message"}
              </button>
            </form>
          </motion.div>
        </div>

        {/* FAQs Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Frequently Asked Questions</h2>
            <p className="text-neutral-400 text-sm md:text-base">Find answers to common questions about PocketDesk billing, privacy, and functionality.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div 
                  key={i} 
                  className="border border-neutral-800 bg-neutral-900/30 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full flex items-center justify-between p-5 text-left font-medium text-white hover:bg-neutral-900/50 transition-colors"
                  >
                    <span className="text-sm md:text-base">{faq.question}</span>
                    <span className="text-neutral-400 shrink-0 ml-4">
                      {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                    </span>
                  </button>
                  
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-neutral-800/60 bg-neutral-900/10 p-5 text-sm leading-relaxed text-neutral-400"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
