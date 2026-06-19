import React, { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { 
  Globe, Users, Award, Shield, Sparkles, CheckCircle, ArrowRight,
  Book, Code, MessageSquare, Briefcase, Network, Cpu, FileText, Search, Star,
  Compass, Laptop
} from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "motion/react";
import { CollivioLogo } from "../components/CollivioLogo";

interface LandingProps {
  onNavigate: (view: string, subView?: string) => void;
}

export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  // Parallax / Hover coordinates tracking for interactive 3D cards
  const containerRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  // Map mouse positions to 3D tilt coordinates
  const rotateX = useTransform(springY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-15, 15]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Normalize coordinates to -0.5 to 0.5 values
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // State for active 3D journey stage
  const [activeStage, setActiveStage] = useState<number>(0);

  // Student path sequence stage data
  const journeyStages = [
    {
      id: "join",
      title: "Join",
      desc: "Apply to the pre-college ecosystem and verify your academic profile in 60 seconds.",
      details: "School verification & verified status badges automatically configured.",
      icon: Users,
      color: "bg-[#741717]",
      visual: (
        <div className="relative w-full h-32 bg-gradient-to-tr from-[#741717]/5 to-[#8D695D]/10 rounded-xl flex items-center justify-center p-3 border border-[#E7DDD7]">
          {/* Animated Join Card */}
          <motion.div 
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="p-3 bg-white border border-[#E7DDD7] rounded-xl shadow-md max-w-[190px]"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 rounded-full bg-[#741717]/10 flex items-center justify-center text-[10px] text-[#741717] font-bold">✓</div>
              <span className="text-[10px] font-bold text-chestnut">Alex Rivera</span>
            </div>
            <p className="text-[8px] text-[#594440] leading-none mb-1">Pre-College Verified Scholar</p>
            <span className="text-[7px] text-caramel uppercase tracking-wider font-mono font-bold">Trust Score: 99</span>
          </motion.div>
        </div>
      )
    },
    {
      id: "learn",
      title: "Learn & Certify",
      desc: "Explore tailored computer science, finance, or biotechnology paths.",
      details: "Earn premium industry-standard credentials evaluated by platform administrators.",
      icon: Book,
      color: "bg-[#8D695D]",
      visual: (
        <div className="relative w-full h-32 bg-gradient-to-tr from-[#8D695D]/5 to-[#741717]/10 rounded-xl flex items-center justify-center p-3 border border-[#E7DDD7]">
          {/* Floating Academic Books */}
          <motion.div 
            animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="p-3 bg-white border border-[#E7DDD7] rounded-xl shadow-md flex items-center gap-2 max-w-[200px]"
          >
            <div className="p-1.5 rounded-lg bg-[#8D695D]/10 text-caramel">
              <Book size={16} />
            </div>
            <div className="text-left">
              <p className="text-[9px] font-bold text-chestnut">Deep Learning Foundations</p>
              <div className="w-20 h-1 bg-[#E7DDD7] rounded-full mt-1 overflow-hidden">
                <div className="w-4/5 h-full bg-[#741717]" />
              </div>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      id: "build",
      title: "Build Projects",
      desc: "Code apps, run research simulations, and write academic papers.",
      details: "All project codes and datasets are securely backed up in your Media Lab.",
      icon: Code,
      color: "bg-chestnut",
      visual: (
        <div className="relative w-full h-32 bg-gradient-to-tr from-[#2F2421]/5 to-[#8D695D]/10 rounded-xl flex items-center justify-center p-3 border border-[#E7DDD7]">
          {/* Interactive Simulated Code Card */}
          <motion.div 
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="p-2.5 bg-chestnut border border-[#594440] rounded-xl shadow-lg w-full max-w-[220px]"
          >
            <div className="flex gap-1 mb-2">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            </div>
            <p className="font-mono text-[7px] text-[#C4BAB3] text-left leading-tight">
              <span className="text-red-400">const</span> matchScore = <span className="text-yellow-300">getMatchScore</span>(student, job);<br/>
              <span className="text-caramel">return</span> matchScore.percentage;
            </p>
          </motion.div>
        </div>
      )
    },
    {
      id: "collaborate",
      title: "Collaborate",
      desc: "Create milestone tasks and work with peers in shared spaces.",
      details: "Use live team workspaces driven by automated tracking channels.",
      icon: MessageSquare,
      color: "bg-red-wine",
      visual: (
        <div className="relative w-full h-32 bg-gradient-to-tr from-[#741717]/5 to-[#C4BAB3]/10 rounded-xl flex items-center justify-center p-3 border border-[#E7DDD7]">
          {/* Network Connection Graphic */}
          <div className="relative w-full max-w-[200px] h-full flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-caramel/40 fill-none" strokeWidth="2">
              <line x1="20" y1="50" x2="50" y2="20" className="animate-pulse" />
              <line x1="80" y1="50" x2="50" y2="20" />
              <line x1="50" y1="80" x2="50" y2="20" strokeDasharray="3" />
            </svg>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#741717] flex items-center justify-center text-white text-[9px] font-bold">Team</div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-caramel flex items-center justify-center text-white text-[8px]">Me</div>
            <div className="absolute left-2 top-12 w-5 h-5 rounded-full bg-chestnut flex items-center justify-center text-white text-[8px]">AI</div>
            <div className="absolute right-2 top-12 w-5 h-5 rounded-full bg-accent-wool flex items-center justify-center text-white text-[8px]">Job</div>
          </div>
        </div>
      )
    },
    {
      id: "publish",
      title: "Publish",
      desc: "Submit your final deliverables to the global student showcase.",
      details: "Gather structured, authentic text feedback from trusted platform advisors.",
      icon: FileText,
      color: "bg-caramel",
      visual: (
        <div className="relative w-full h-32 bg-gradient-to-tr from-[#8D695D]/5 to-[#2F2421]/10 rounded-xl flex items-center justify-center p-3 border border-[#E7DDD7]">
          {/* Portfolio Publication Card */}
          <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="p-3 bg-white border border-[#E7DDD7] rounded-xl shadow-md max-w-[180px] text-left"
          >
            <span className="text-[7px] uppercase font-bold text-[#741717] bg-[#741717]/10 px-1.5 py-0.5 rounded font-mono">PUBLISHED</span>
            <p className="text-[10px] font-bold text-chestnut mt-1.5">Machine Learning in Biotech Research</p>
            <p className="text-[8px] text-[#594440] mt-1">Stanford Hub · 2 Citations</p>
          </motion.div>
        </div>
      )
    },
    {
      id: "recognized",
      title: "Get Recognized",
      desc: "Leverage elite badges and score logs to unlock micro-internships.",
      details: "Top college advisors and innovative startups hire directly from Media Lab.",
      icon: Award,
      color: "bg-red-wine",
      visual: (
        <div className="relative w-full h-32 bg-gradient-to-tr from-[#741717]/5 to-[#8D695D]/10 rounded-xl flex items-center justify-center p-3 border border-[#E7DDD7]">
          {/* Medal Medallion Dynamic Floating */}
          <motion.div 
            animate={{ rotateY: [0, 180, 360], scale: [1, 1.05, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-caramel via-[#741717] to-caramel flex items-center justify-center shadow-lg border-2 border-white"
          >
            <Award size={24} className="text-white" />
          </motion.div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#F7F4F2] text-[#2F2421] flex flex-col selection:bg-[#8D695D]/30 selection:text-chestnut font-sans relative overflow-x-hidden">
      
      {/* Dynamic Animated background ambient colors */}
      <div className="absolute top-[-250px] right-[-200px] w-[600px] h-[600px] rounded-full bg-[#8D695D]/5 blur-[150px] pointer-events-none select-none" />
      <div className="absolute top-[300px] left-[-350px] w-[700px] h-[700px] rounded-full bg-[#741717]/4 blur-[200px] pointer-events-none select-none" />
      
      {/* ── HEADER NAVBAR ── */}
      <nav className="glass-panel border-b border-[#E7DDD7]/60 fixed top-0 w-full z-50 px-6 md:px-12 py-3.5 flex items-center justify-between select-none">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate("landing")}>
          <CollivioLogo size="sm" showTagline={false} />
          <div className="flex flex-col text-left">
            <span className="font-display font-bold text-lg tracking-wide text-chestnut leading-none">
              Collivio
            </span>
            <span className="text-[7px] tracking-widest font-mono text-caramel font-bold uppercase mt-1 leading-none">Pre-College Hub</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-8 text-xs font-semibold text-chestnut/80">
          <span className="text-[#741717] cursor-pointer transition flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#741717] rounded-full" /> Home
          </span>
          <span onClick={() => onNavigate("auth", "register")} className="hover:text-[#741717] cursor-pointer transition">Opportunities</span>
          <span onClick={() => onNavigate("auth", "login")} className="hover:text-[#741717] cursor-pointer transition">Research Hub</span>
          <span onClick={() => onNavigate("auth", "login")} className="hover:text-[#741717] cursor-pointer transition">Media Lab</span>
          <span onClick={() => onNavigate("auth", "login")} className="hover:text-[#741717] cursor-pointer transition">For Business Partners</span>
        </div>

        {/* Actions Button Sets */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate("auth", "login")}
            className="text-xs font-bold text-chestnut hover:text-[#741717] transition cursor-pointer"
          >
            Sign In
          </button>
          <Button 
            variant="caramel" 
            size="sm"
            className="rounded-lg shadow flex items-center gap-1.5 cursor-pointer text-white hover:bg-chestnut"
            onClick={() => onNavigate("auth", "register")}
          >
            <span>Activate Path</span>
            <ArrowRight size={13} />
          </Button>
        </div>
      </nav>

      {/* ── HERO IMPRESSIVE EXPERIENCE SECTION ── */}
      <main className="flex-grow pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Side: Editorial Typography & Copywriting */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-6 flex flex-col gap-6 text-left"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#741717]/10 border border-[#741717]/25 rounded-full text-[10px] text-[#741717] font-bold uppercase tracking-wider w-fit">
            <Sparkles size={11} className="text-caramel animate-pulse" />
            Empowering pre-college innovation & matching
          </span>
          
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] text-chestnut tracking-tight">
            Gain Elite Real-World <br />
            <span className="text-[#741717] italic font-serif">Experience</span> Before College.
          </h1>
          
          <p className="text-sm md:text-base text-[#594440] leading-relaxed max-w-xl font-light">
            Collivio unlocks curated micro-internships, Ivy-league standard research projects, and elite portfolio showcases designed specifically for high school leaders aged 13–19. Join team workspaces, earn badges, and gain alignment matching.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Button 
              variant="primary" 
              size="lg"
              className="bg-[#741717] hover:bg-chestnut text-white px-8 shadow-md rounded-xl font-bold text-sm cursor-pointer"
              onClick={() => onNavigate("auth", "register")}
            >
              Sign Up as Student
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-[#8D695D]/40 text-[#8D695D] hover:bg-[#8D695D]/5 hover:text-[#8D695D] px-8 rounded-xl font-bold text-sm cursor-pointer"
              onClick={() => onNavigate("auth", "business-login")}
            >
              For Corporate & Lab Sponsors
            </Button>
          </div>

          {/* Quick Checklist Icons */}
          <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 mt-4 border-t border-[#E7DDD7] pt-6 select-none font-sans text-xs">
            <div className="flex items-center gap-2 text-chestnut/80">
              <CheckCircle size={14} className="text-[#741717]" />
              <span>Verified Scholar Logs</span>
            </div>
            <div className="flex items-center gap-2 text-chestnut/80">
              <CheckCircle size={14} className="text-[#8D695D]" />
              <span>Certified Academic Advisors</span>
            </div>
            <div className="flex items-center gap-2 text-chestnut/80">
              <CheckCircle size={14} className="text-[#8D695D]" />
              <span>Startups & Universities Match</span>
            </div>
            <div className="flex items-center gap-2 text-chestnut/80">
              <CheckCircle size={14} className="text-[#741717]" />
              <span>AI Match Alignment Ratings</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side: 3D PARALLAX / FLOATING CARDS UNIVERSE CARD */}
        <div className="lg:col-span-6 flex justify-center items-center relative min-h-[460px]">
          
          {/* Main 3D Container tracking mouse */}
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full max-w-md h-[420px] bg-white border border-[#E7DDD7] rounded-3xl p-6 shadow-xl flex flex-col justify-between overflow-hidden cursor-grab active:cursor-grabbing preserve-3d"
            style={{ perspective: 1000 }}
          >
            {/* Visual Glass Header bar of simulated app */}
            <div className="flex items-center justify-between border-b border-[#E7DDD7] pb-3 mb-2 select-none">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#741717] rounded-full" />
                <span className="w-2.5 h-2.5 bg-caramel rounded-full" />
                <span className="w-2.5 h-2.5 bg-accent-wool rounded-full" />
              </div>
              <span className="text-[9px] text-[#8D695D] font-mono tracking-wider uppercase font-bold">Collivio Intelligent Grid</span>
            </div>

            {/* 3D FLOATING CARDS MATRIX LAYERED WITH FRAMER MOTION PARALLAX */}
            <div className="flex-1 relative flex flex-col justify-center gap-3 py-4 select-none">
              
              {/* Card 1: 3D INTERNSHIP CARD */}
              <motion.div 
                style={{ rotateX, rotateY, z: 50 }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white border border-[#E7DDD7] hover:border-caramel p-3 rounded-xl shadow-md flex items-center justify-between relative z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#741717]/10 flex items-center justify-center font-bold text-xs text-[#741717]">
                    CO
                  </div>
                  <div className="text-left">
                    <h4 className="text-[11px] font-bold text-chestnut">Biomedical Engineering Intern</h4>
                    <p className="text-[9px] text-[#594440] mt-0.5">Vanderbilt Genome Center</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase font-mono font-bold text-[#741717] bg-[#741717]/10 px-2 py-0.5 rounded">99% Score</span>
                </div>
              </motion.div>

              {/* Card 2: 3D RESEARCH GLOBE CARD */}
              <motion.div 
                style={{ rotateX, rotateY, z: 25 }}
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white border border-[#E7DDD7] hover:border-[#741717] p-3 rounded-xl shadow-md flex items-center justify-between relative z-10 scale-95"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-caramel/10 flex items-center justify-center font-bold text-xs text-caramel">
                    AI
                  </div>
                  <div className="text-left">
                    <h4 className="text-[11px] font-bold text-chestnut">Machine Learning Research Group</h4>
                    <p className="text-[9px] text-[#594440] mt-0.5">Project: Quantum Neural Models</p>
                  </div>
                </div>
                <span className="text-[9px] uppercase font-mono font-bold text-caramel bg-caramel/10 px-2 py-0.5 rounded">Active Team</span>
              </motion.div>

              {/* Card 3: PORTFOLIO SHOWCASE */}
              <motion.div 
                style={{ rotateX, rotateY, z: -20 }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="bg-[#FFFFFF]/90 backdrop-blur border border-[#E7DDD7] hover:border-caramel p-3 rounded-xl shadow-lg flex items-center justify-between relative z-0 scale-90 opacity-90"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-chestnut/10 flex items-center justify-center font-mono font-bold text-xs text-chestnut">
                    PR
                  </div>
                  <div className="text-left">
                    <h4 className="text-[11px] font-bold text-[#594440]">Interactive Neural Simulation</h4>
                    <p className="text-[9px] text-gray-400 mt-0.5">Media Lab Showcase</p>
                  </div>
                </div>
                <span className="text-[9px] text-[#741717] font-bold">★ Highlight</span>
              </motion.div>
            </div>

            {/* Card 4: AI Matching Mini Nodes Parallax overlay */}
            <motion.div 
              style={{ rotateX, rotateY, z: 90 }}
              whileHover={{ scale: 1.05 }}
              className="absolute bottom-5 right-5 glass-panel border border-[#8D695D]/30 shadow-xl rounded-2xl p-4 max-w-[190px] text-left select-none relative z-30"
            >
              <div className="flex items-center gap-1.5 mb-1 bg-caramel text-white font-mono font-bold text-[8px] rounded px-1.5 py-0.5 w-fit uppercase">
                <Cpu size={8} /> AI Spark Matcher
              </div>
              <p className="text-[10px] text-[#2F2421] leading-relaxed">
                Platform aligns user projects directly with verified lab vacancies.
              </p>
            </motion.div>
          </div>
        </div>
      </main>

      {/* ── 3D EXPERIENCE TIMELINE VISUAL JOURNEY SECTION ── */}
      <section className="bg-white py-20 px-6 md:px-12 w-full border-t border-b border-[#E7DDD7]/70 select-none relative">
        <div className="max-w-7xl mx-auto w-full">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#741717] bg-[#741717]/10 px-3 py-1 rounded-full uppercase">
              The Interactive Student Path
            </span>
            <h2 className="font-display text-3xl font-bold text-chestnut mt-3">
              Build Value and Prominence, Step by Step
            </h2>
            <p className="text-[#594440] text-xs md:text-sm mt-3 leading-relaxed">
              Our unique pre-college progression tracks help students register, learn foundational micro-tools, build and host actual projects, establish networks, and receive industry recognition.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Interactive Timeline Tabs (Left Side) */}
            <div className="col-span-1 lg:col-span-5 flex flex-col gap-3 justify-center text-left">
              {journeyStages.map((st, index) => {
                const isActive = index === activeStage;
                return (
                  <button
                    key={st.id}
                    onClick={() => setActiveStage(index)}
                    className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive 
                        ? "bg-[#F7F4F2] border-caramel shadow-sm scale-[1.01]" 
                        : "bg-white border-transparent hover:bg-[#F7F4F2]/50 text-gray-500"
                    }`}
                  >
                    <div className={`p-2 rounded-lg text-white font-bold shrink-0 mt-0.5 ${
                      isActive ? st.color : "bg-gray-300"
                    }`}>
                      <st.icon size={16} />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isActive ? "text-chestnut" : "text-gray-500"}`}>
                        {index + 1}. {st.title}
                      </h4>
                      <p className="text-[11px] opacity-90 mt-1 lines-clamp-1 leading-normal text-gray-500">
                        {st.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Immersive visual animation display (Right Side) */}
            <div className="col-span-1 lg:col-span-7 flex flex-col justify-between p-6 bg-[#F7F4F2] border border-[#E7DDD7] rounded-3xl relative overflow-hidden">
              <div className="absolute top-2 right-4 text-[9px] font-mono opacity-25">PRE-COLLEGE ENGINE v2</div>
              
              {/* Dynamic stage title */}
              <div className="text-left mb-4 z-10">
                <span className="text-[8px] uppercase tracking-wider font-mono font-bold text-[#741717]">
                  Stage Objective
                </span>
                <h3 className="font-display text-lg font-bold text-chestnut mt-1">
                  {journeyStages[activeStage].title}
                </h3>
                <p className="text-xs text-[#594440] leading-relaxed mt-1">
                  {journeyStages[activeStage].desc} {journeyStages[activeStage].details}
                </p>
              </div>

              {/* 3D render simulator */}
              <div className="my-6 z-10 flex-1 flex items-center justify-center min-h-[160px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStage}
                    initial={{ opacity: 0, scale: 0.9, rotateX: 15 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 0.9, rotateX: -15 }}
                    transition={{ duration: 0.35 }}
                    className="w-full"
                  >
                    {journeyStages[activeStage].visual}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Action Trigger */}
              <div className="flex justify-between items-center z-10 pt-4 border-t border-[#E7DDD7]/70">
                <p className="text-[10px] text-gray-500 italic">Navigate key stages on student path dashboard</p>
                <Button 
                  onClick={() => onNavigate("auth", "register")}
                  variant="primary" 
                  size="xs" 
                  className="bg-[#741717] hover:bg-chestnut text-white text-[10px] rounded"
                >
                  Join Stage Now →
                </Button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── FOOTER BENTO SIGN-UP ENTRY OVERLAY CARDS ── */}
      <section className="bg-[#F7F4F2] py-20 px-6 md:px-12 w-full text-chestnut select-none relative border-b border-[#E7DDD7]/70">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="font-display text-3xl font-bold mb-12 text-center text-chestnut tracking-tight">
            Ready to Forge Your Academic & Career Profile?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Student card - High luxury glass panel */}
            <Card variant="glass-light" className="p-8 bg-white border border-[#E7DDD7] shadow-lg rounded-2xl flex flex-col justify-between hover-rise hover:border-caramel transition-all">
              <div className="flex flex-col gap-3 text-left">
                <div className="w-11 h-11 bg-[#741717]/10 rounded-xl flex items-center justify-center text-[#741717] mb-2 border border-[#741717]/20">
                  <Cpu size={20} />
                </div>
                <h3 className="font-display text-xl font-bold text-chestnut">Ambitious Scholars (13–19)</h3>
                <p className="text-xs text-[#594440] leading-relaxed font-light">
                  Publish high-standard computer code papers, solve micro-internships for tech startups, request reviews, earn verified pre-college digital credential badges, and match with research advisors.
                </p>
              </div>
              <Button 
                variant="caramel" 
                className="mt-8 w-full bg-[#741717] hover:bg-[#8D695D] text-white py-3 flex gap-2 h-11 text-xs justify-center rounded-xl transition cursor-pointer"
                onClick={() => onNavigate("auth", "register")}
              >
                Join as Student <ArrowRight size={14} />
              </Button>
            </Card>

            {/* Business Sponsor Card */}
            <Card variant="glass-light" className="p-8 bg-white border border-[#E7DDD7] shadow-lg rounded-2xl flex flex-col justify-between hover-rise hover:border-caramel transition-all">
              <div className="flex flex-col gap-3 text-left">
                <div className="w-11 h-11 bg-caramel/10 rounded-xl flex items-center justify-center text-caramel mb-2 border border-caramel/20">
                  <Globe size={20} />
                </div>
                <h3 className="font-display text-xl font-bold text-chestnut">Corporate Sponsors & Labs</h3>
                <p className="text-xs text-[#594440] leading-relaxed font-light">
                  Post high-leverage micro-internship opportunities, find verified pre-college students, look up match scores, inspect code repositories, and schedule 1-on-1 advisor reviews.
                </p>
              </div>
              <Button 
                variant="outline" 
                className="mt-8 w-full py-3 border-[#8D695D]/30 text-[#8D695D] hover:bg-[#8D695D]/5 flex gap-2 h-11 text-xs justify-center rounded-xl transition cursor-pointer"
                onClick={() => onNavigate("auth", "business-login")}
              >
                Post Host Listings <ArrowRight size={14} />
              </Button>
            </Card>

          </div>
        </div>
      </section>

      {/* ── FOOTER BAR ── */}
      <footer className="py-12 bg-white text-center text-[11px] text-[#594440]/60 border-t border-[#E7DDD7] select-none font-sans">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#741717] rounded-full" />
            <span className="font-bold text-chestnut">Collivio Pre-College Ecosystem</span>
          </div>
          <p>© 2026 Collivio Global. Preserving elite matching ratings and authentic credential pathways.</p>
        </div>
      </footer>
    </div>
  );
};
