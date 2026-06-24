import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Eye, Flame, Github, Linkedin, Twitter } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
}

export default function About() {
  const stats = [
    { value: "50K+", label: "Active Mindspaces" },
    { value: "15M+", label: "Indexed Pages" },
    { value: "99.99%", label: "Uptime SLA" },
    { value: "4.9 ★", label: "User Satisfaction" }
  ];

  const values = [
    {
      icon: <Shield className="text-blue-400" size={24} />,
      title: "Privacy First",
      desc: "Your data is your own. We encrypt document storage and secure your vectors so that your personal brain remains private by design."
    },
    {
      icon: <Eye className="text-cyan-400" size={24} />,
      title: "Extreme Clarity",
      desc: "We build layouts that filter noise. PocketDesk focuses on presenting insights concisely without cluttering your digital workspace."
    },
    {
      icon: <Flame className="text-amber-400" size={24} />,
      title: "Unyielding Innovation",
      desc: "We integrate next-gen AI pipelines, OCR capabilities, and custom RAG engines directly into your daily workspace tools."
    }
  ];

  const team: TeamMember[] = [
    {
      name: "Bhavesh Prajapati",
      role: "Founder & Lead Architect",
      bio: "Software developer passionate about engineering high-performance AI productivity tools and human-centered design.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
      github: "https://github.com/Bhavesh-pra/",
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com"
    },
    {
      name: "Aria Sterling",
      role: "RAG & NLP Engineer",
      bio: "Specialist in indexing pipelines, vector embeddings, and refining context extraction models for precise semantic search.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
      github: "https://github.com",
      linkedin: "https://linkedin.com"
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-6 md:p-12 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-900/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-900/10 blur-[130px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition mb-12">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Our Mission is to Unify <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Human Knowledge</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 leading-relaxed">
            PocketDesk was created with one simple mission: to compile the fragmented tools we use every day to learn, remember, and organize information into a cohesive, intelligent second brain.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-2xl bg-neutral-900/40 backdrop-blur-sm border border-neutral-800 mb-20"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl md:text-4xl font-extrabold text-white mb-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                {stat.value}
              </p>
              <p className="text-xs md:text-sm text-neutral-500 font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Story & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Why PocketDesk?</h2>
            <div className="space-y-4 text-neutral-400 leading-relaxed text-sm md:text-base">
              <p>
                In an era where we consume millions of words in PDFs, capture thousands of screenshots, watch hours of lecture videos, and draft endless quick thoughts, the context gets lost. Search becomes a chore.
              </p>
              <p>
                We believe that Artificial Intelligence shouldn't merely be a side panel in a browser. It should be deeply integrated within your personal files.
              </p>
              <p>
                PocketDesk connects notes, folders, and images into a single vector database, using optimized Retrieval-Augmented Generation (RAG) to instantly recall knowledge.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
            <h3 className="text-xl font-bold text-white mb-4">Our Vision</h3>
            <p className="text-neutral-400 leading-relaxed text-sm md:text-base mb-4">
              We want to empower students, researchers, developers, and writers to build digital systems of record that grow with them throughout their lifetime.
            </p>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
          </motion.div>
        </div>

        {/* Core Values */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Our Core Principles</h2>
            <p className="text-neutral-400 text-sm md:text-base">The beliefs that drive our engineering and product design choices.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((val, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-neutral-900/30 border border-neutral-800 hover:border-neutral-700/60 transition duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6">
                  {val.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{val.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-12">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Meet the Builders</h2>
            <p className="text-neutral-400 text-sm md:text-base">We are a small team committed to crafting beautiful and powerful tools.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="group p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 hover:border-neutral-700 transition duration-300 flex flex-col md:flex-row gap-6"
              >
                {/* Left Side: Avatar illustration/mockup */}
                <div className="w-20 h-20 rounded-full border-2 border-neutral-800 group-hover:border-blue-500 transition-colors duration-300 overflow-hidden bg-neutral-800 shrink-0 self-center md:self-start flex items-center justify-center text-2xl font-bold text-neutral-400">
                  {member.name.split(" ").map(n => n[0]).join("")}
                </div>

                {/* Right Side: Bio details */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs font-semibold text-blue-500 mb-3">{member.role}</p>
                  <p className="text-neutral-400 text-xs md:text-sm leading-relaxed mb-4">
                    {member.bio}
                  </p>

                  {/* Social Handles */}
                  <div className="flex items-center justify-center md:justify-start gap-4 text-neutral-500">
                    {member.github && (
                      <a href={member.github} target="_blank" rel="noreferrer" className="hover:text-white transition">
                        <Github size={16} />
                      </a>
                    )}
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noreferrer" className="hover:text-white transition">
                        <Linkedin size={16} />
                      </a>
                    )}
                    {member.twitter && (
                      <a href={member.twitter} target="_blank" rel="noreferrer" className="hover:text-white transition">
                        <Twitter size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
