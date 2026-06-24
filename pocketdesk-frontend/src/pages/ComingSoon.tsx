import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Loader2, Sparkles, Cpu, Users, Layers, Milestone } from "lucide-react";
import API from "../services/api";

interface Feature {
  icon: React.ReactNode;
  title: string;
  desc: string;
  progress: number;
  status: "Testing" | "Development" | "Planning";
  badgeColor: string;
}

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error" | "duplicate">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const response = await API.post("/subscribe", { email });
      if (response.data?.alreadySubscribed) {
        setStatus("duplicate");
      } else {
        setStatus("success");
        setEmail("");
      }
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      if (err.response?.data?.error) {
        setErrorMessage(err.response.data.error);
      } else if (err.response?.data?.details?.[0]) {
        setErrorMessage(err.response.data.details[0]);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const upcomingFeatures: Feature[] = [
    {
      icon: <Users className="text-cyan-400" size={24} />,
      title: "Real-time Multi-user Collaboration",
      desc: "Work synchronously with teammates on notes, document annotations, and shared project hubs with live multiplayer cursors.",
      progress: 85,
      status: "Testing",
      badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
    },
    {
      icon: <Cpu className="text-purple-400" size={24} />,
      title: "Voice-Activated AI Workspaces",
      desc: "Speak directly to your documents. Ask questions, dictate summaries, and control tasks hands-free using state-of-the-art voice models.",
      progress: 60,
      status: "Development",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20"
    },
    {
      icon: <Layers className="text-emerald-400" size={24} />,
      title: "Universal Semantic Memory Maps",
      desc: "Visualize connection graphs between your uploaded PDFs, video summaries, OCR images, and todos. AI maps your knowledge organically.",
      progress: 40,
      status: "Development",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    },
    {
      icon: <Sparkles className="text-amber-400" size={24} />,
      title: "PocketDesk Mobile App (iOS & Android)",
      desc: "Capture visual notes on the go. Automatically run OCR scans from your device camera, instantly syncing summaries back to your workspace.",
      progress: 15,
      status: "Planning",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-6 md:p-12 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      {/* Background Decorative Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-900/10 blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition mb-12">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6"
          >
            <Milestone size={14} className="animate-pulse" />
            Roadmap Update
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight"
          >
            Building the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Next Generation</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-neutral-400"
          >
            PocketDesk is expanding. Take an early look at what we're working on, vote on your favorite features, and subscribe to get beta access as soon as they roll out.
          </motion.p>
        </div>

        {/* Features Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {upcomingFeatures.map((feat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-8 rounded-2xl bg-neutral-900/40 backdrop-blur-sm border border-neutral-800 hover:border-neutral-700/80 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-950/10 relative overflow-hidden"
            >
              {/* Card gradient effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                  {feat.icon}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${feat.badgeColor}`}>
                  {feat.status}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                {feat.title}
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                {feat.desc}
              </p>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                  <span>Development Progress</span>
                  <span className="font-semibold text-neutral-300">{feat.progress}%</span>
                </div>
                <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-800/40 p-[1px]">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${feat.progress}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 relative"
                  >
                    <div className="absolute right-0 top-0 h-full w-2 bg-white/30 blur-[1px] animate-pulse" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Subscription Newsletter Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl bg-neutral-900/60 border border-neutral-800 p-8 md:p-12 overflow-hidden text-center max-w-3xl mx-auto shadow-2xl shadow-blue-950/20"
        >
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-blue-500/5 blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto">
            <Mail className="mx-auto text-blue-400 mb-6" size={40} />
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
              Get Notified on Release
            </h2>
            <p className="text-neutral-400 text-sm md:text-base mb-8">
              Join our newsletter. No spam, just technical updates, changelogs, and beta recruitment keys directly in your inbox.
            </p>

            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6 text-sm"
              >
                🎉 Thanks for subscribing! We'll email you as soon as features are ready.
              </motion.div>
            )}

            {status === "duplicate" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6 text-sm"
              >
                ✨ You are already on the early-access list. Thank you for your support!
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6 text-sm"
              >
                ⚠️ {errorMessage}
              </motion.div>
            )}

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                required
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50 text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-900/30 text-sm whitespace-nowrap active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : null}
                {loading ? "Joining..." : "Notify Me"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
