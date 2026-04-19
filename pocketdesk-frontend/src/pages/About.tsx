import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-6 md:p-12">
      <Link to="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition mb-12">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">About PocketDesk</h1>
        <div className="prose prose-invert prose-blue max-w-none">
          <p className="text-lg text-neutral-400 leading-relaxed mb-6">
            PocketDesk was created with one simple mission: to unify the fragmented tools we use every day to learn, remember, and organize information.
          </p>
          <p className="text-lg text-neutral-400 leading-relaxed mb-6">
            In an era where we consume PDFs, take isolated notes, watch thousands of educational videos, and save endless images, finding the right piece of information when we need it has become impossible.
          </p>
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 my-8">
            <h3 className="text-xl font-bold text-white mb-4">Our Vision</h3>
            <p className="text-neutral-400">We believe that AI shouldn't just be a chatbox on the side; it should be integrated directly into your workspace. PocketDesk embeds intelligent analysis directly into your documents, acting as a second brain that never forgets.</p>
          </div>
          <p className="text-lg text-neutral-400 leading-relaxed">
            Built with modern web technologies, strict privacy by default, and an unrelenting focus on design, PocketDesk is the last workspace you'll ever need.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
