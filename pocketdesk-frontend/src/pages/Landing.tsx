import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Bot, Shield, Zap, Image, Video, FileText } from "lucide-react";

export default function Landing() {
  const features = [
    { icon: <Bot size={24} />, title: "AI Assistants", desc: "Interact with intelligent PDF & Image analyzers." },
    { icon: <FileText size={24} />, title: "Smart Documents", desc: "Easily upload, search, and manage your PDFs and notes." },
    { icon: <Video size={24} />, title: "Video Summaries", desc: "Get automatic AI summaries from YouTube videos." },
    { icon: <Image size={24} />, title: "Image Albums", desc: "Organize visual inspiration and OCR extracted text." },
    { icon: <Shield size={24} />, title: "Secure by Design", desc: "Top-tier security and encrypted storage." },
    { icon: <Zap size={24} />, title: "Lightning Fast", desc: "Optimized pipelines built for instantaneous results." }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 h-16 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 z-50 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Bot size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white">Pocket<span className="text-blue-500">Desk</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
          <Link to="/features" className="hover:text-white transition">Features</Link>
          <Link to="/about" className="hover:text-white transition">About</Link>
          <Link to="/contact" className="hover:text-white transition">Contact</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-neutral-400 hover:text-white transition px-2 py-1">Log In</Link>
          <Link to="/signup" className="text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg shadow-blue-900/20 transition">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-6xl mx-auto flex flex-col items-center text-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          v2.0 is now live
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-4xl"
        >
          Your Intelligent <br className="hidden md:block"/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Workspace</span> for Everything.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-neutral-400 max-w-2xl"
        >
          PocketDesk combines your notes, PDFs, videos, and images with advanced AI capabilities, giving you a superhuman memory.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <Link to="/signup" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3.5 rounded-xl shadow-xl shadow-blue-900/20 transition hover:scale-105 active:scale-95 text-lg w-full sm:w-auto justify-center">
            Start for free <ArrowRight size={18} />
          </Link>
          <Link to="/features" className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium px-8 py-3.5 rounded-xl transition text-lg w-full sm:w-auto justify-center border border-neutral-700">
            View Features
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 w-full max-w-5xl aspect-video rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl relative overflow-hidden"
        >
           <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent z-10" />
           <div className="absolute inset-0 flex items-center justify-center">
              <Bot size={64} className="text-neutral-800" />
           </div>
           {/* Mockup header */}
           <div className="absolute top-0 inset-x-0 h-10 border-b border-neutral-800 bg-neutral-900/50 flex items-center px-4 gap-2">
             <div className="w-3 h-3 rounded-full bg-red-500/50" />
             <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
             <div className="w-3 h-3 rounded-full bg-green-500/50" />
           </div>
        </motion.div>
      </main>

      {/* Grid Features */}
      <section className="py-24 bg-neutral-900 border-t border-neutral-800 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need, nothing you don't.</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">A purposefully crafted suite of tools to improve your productivity.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-neutral-800 px-6 md:px-12 text-center text-neutral-500 text-sm">
        <p>&copy; {new Date().getFullYear()} PocketDesk. All rights reserved.</p>
      </footer>
    </div>
  );
}
