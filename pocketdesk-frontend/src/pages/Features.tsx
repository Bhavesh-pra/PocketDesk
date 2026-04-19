import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function Features() {
  const deepFeatures = [
    "Chat with any PDF document to extract key insights instantly.",
    "Perform optical character recognition (OCR) on images in your albums.",
    "Track daily habits and cross out todos with our robust task manager.",
    "Get AI-generated summaries from YouTube videos seamlessly.",
    "Built-in RAG pipeline ensuring accurate answers strictly from your context.",
    "Organized album views for intuitive image grouping."
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-6 md:p-12">
      <Link to="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition mb-12">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Features Overview</h1>
        <p className="text-xl text-neutral-400 mb-12">Deep dive into exactly what PocketDesk can do for your workflow.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {deepFeatures.map((f, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.4, delay: i * 0.1 }}
               className="flex items-start gap-4 p-6 bg-neutral-900 border border-neutral-800 rounded-2xl"
             >
               <CheckCircle2 className="text-blue-500 shrink-0 mt-0.5" size={20} />
               <p className="text-neutral-300 leading-relaxed">{f}</p>
             </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
