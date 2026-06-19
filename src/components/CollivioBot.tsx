import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, Send, X, Mic, MicOff, Maximize2, Minimize2, 
  RefreshCw, Sun, Moon, Sparkles, ChevronRight, AlertCircle, 
  CheckCircle, Plus, Info, Award, Users, GraduationCap, Code2, 
  HelpCircle, UserPlus, FileUp, Sparkle, Settings2, UserCheck, Compass
} from "lucide-react";
import { State } from "../types";

// Types and Interfaces
interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  time: string;
  isQuickAction?: boolean;
}

interface CollivioBotProps {
  state: State | null;
  onNavigate: (view: string) => void;
}

export function CollivioBot({ state, onNavigate }: CollivioBotProps) {
  // Widget Open/Close State
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Design Theme Toggle (Local to the widget)
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Input and Chat History States
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Default initial message list
  const welcomeMessage: Message = {
    id: "welcome-msg",
    sender: "assistant",
    text: `👋 Welcome to Collivio!

I'm Collivio AI, your personal guide to internships, research, skills, and real-world experience.

I can help you:
🚀 Find opportunities
🔬 Explore research projects
🎯 Build skills
🏆 Improve your portfolio
🤝 Connect with teams

How can I help you today?`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Recognition States
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Scroll to bottom whenever messages list modifications happen
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Handle Voice Input via Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setErrorStatus(null);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage(prev => prev ? prev + " " + transcript : transcript);
        }
      };

      rec.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
        setIsListening(false);
        setErrorStatus("Unable to capture voice input in current browser environment.");
        setTimeout(() => setErrorStatus(null), 4000);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setErrorStatus("Voice recognition is not supported in this browser.");
      setTimeout(() => setErrorStatus(null), 4000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Quick Action Config matching exact user roles
  const getRoleBasedQuickActions = () => {
    const role = state?.profile?.role || "student";
    
    if (role === "organization") {
      return [
        { label: "Post Opportunity", text: "How do I list a new micro-internship for student pre-college candidates?", icon: Plus },
        { label: "Find Talent", text: "How can I search and matching top-tier high school talent in AI or Biotechnology?", icon: Sparkles },
        { label: "Review Applicants", text: "Where do I review student certifications, portfolios, and applications?", icon: UserCheck }
      ];
    } else if (role === "admin") {
      return [
        { label: "System Status", text: "What is the status of the Relational Database, API endpoints, and CORS config?", icon: Users },
        { label: "Approve Users", text: "Where can I approve pending Student or Business signup requests?", icon: Settings2 },
        { label: "Governance Audit", text: "How can I view security audit logs and connection handshake telemetry?", icon: GraduationCap }
      ];
    } else {
      // DEFAULT: Student actions
      const actions = [
        { label: "Find Opportunities", text: "What micro-internships or career opportunities match my profile tracks in the Employment Skill Bridge?", icon: Compass },
        { label: "Join Research Project", text: "I want to join a collaborative pre-college research project, what are the hot topics?", icon: Code2 },
        { label: "Build Portfolio", text: "How do I upload custom design, code, or biotechnology items to the Media Lab?", icon: FileUp },
        { label: "Earn Certifications", text: "Which certifications can I earn to increase my match score for top listings?", icon: Award }
      ];

      // Smart Recommendation: Suggest profile completion if <100
      const completion = state?.profile?.profileCompletion || 0;
      if (completion < 100) {
        actions.unshift({
          label: `Complete Profile (${completion}%)`,
          text: "How do I finish my profile checks to boost my alignment rating and lock in my verified pre-college badge?",
          icon: UserPlus
        });
      }
      return actions;
    }
  };

  // Example Questions / Suggested Follow-up List
  const exampleQuestions = [
    "What is Collivio?",
    "How does verification work?",
    "How do organizations find me?",
    "What should I do next?"
  ];

  // Send message to server-side CollivioBot endpoint
  const handleSendMessage = async (textToSend: string, isQuick: boolean = false) => {
    if (!textToSend.trim()) return;

    setErrorStatus(null);
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isQuickAction: isQuick
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Build history tracking
      const historyPayload = messages.slice(-10).map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const response = await fetch("/api/gemini/colliviobot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          contextState: state
        })
      });

      if (!response.ok) {
        throw new Error("Chatbot server is temporarily offline.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const botMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: "assistant",
        text: data.text || "I was unable to tailor a complete response right now. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error("CollivioBot client error:", err);
      setErrorStatus(err.message || "Unable to retrieve response from CollivioBot.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([welcomeMessage]);
    setErrorStatus(null);
  };

  // Parser helper to structure structured responses visually
  const parseResponseSections = (text: string) => {
    // Try to find if response matches standard template
    const directAnswerRegex = /(?:Direct Answer:?\s*|\*\*Direct Answer\*\*:?\s*)([\s\S]+?)(?=\*\*Explanation|\*\*Recommended|\*\*Next Step|Explanation:|$)/i;
    const explanationRegex = /(?:Explanation(?:\s*\/|\s*and)?\s*Context:?\s*|\*\*Explanation(?:\s*\/|\s*and)?\s*Context\*\*:?\s*|\*\*Explanation\*\*:?\s*)([\s\S]+?)(?=\*\*Recommended|\*\*Next Step|Recommended Next Step:|$)/i;
    const nextStepRegex = /(?:Recommended Next Step:?\s*|Next Step:?\s*|\*\*Recommended Next Step\*\*:?\s*|\*\*Next Step\*\*:?\s*)([\s\S]+)$/i;

    const directMatch = text.match(directAnswerRegex);
    const explanationMatch = text.match(explanationRegex);
    const nextStepMatch = text.match(nextStepRegex);

    if (directMatch || explanationMatch || nextStepMatch) {
      return {
        isStructured: true,
        directAnswer: directMatch ? directMatch[1].trim() : text.split(/\*\*Explanation|\*\*Recommended/i)[0].trim(),
        explanation: explanationMatch ? explanationMatch[1].trim() : null,
        nextStep: nextStepMatch ? nextStepMatch[1].trim() : null
      };
    }

    return {
      isStructured: false,
      text: text
    };
  };

  // Resolve visual page navigation based on recommended next action keywords
  const handleNextStepNavigation = (nextStepText: string) => {
    const textLower = nextStepText.toLowerCase();
    
    if (textLower.includes("research-hub") || textLower.includes("research hub") || textLower.includes("project")) {
      onNavigate("research-hub");
    } else if (textLower.includes("skill-bridge") || textLower.includes("skill bridge") || textLower.includes("internship") || textLower.includes("certification") || textLower.includes("match")) {
      onNavigate("skill-bridge");
    } else if (textLower.includes("media-lab") || textLower.includes("media lab") || textLower.includes("potfolio") || textLower.includes("upload")) {
      onNavigate("media-lab");
    } else if (textLower.includes("team-workspace") || textLower.includes("team workspace") || textLower.includes("workspace") || textLower.includes("collaboration") || textLower.includes("kanban")) {
      onNavigate("team-workspace");
    } else {
      onNavigate("dashboard");
    }
    
    // Auto minimize/close widget so user sees page change neatly
    setIsMinimized(true);
  };

  return (
    <>
      {/* ── CHATBOT TRIGGER FLOATING BUBBLE (Bottom Right) ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 select-none">
        
        {/* Unread banner above orb */}
        {!isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1, duration: 0.4 }}
            className="bg-[#741717] border border-[#8D695D]/30 text-[#C4BAB3] text-[10px] px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 font-accent cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <Sparkle size={10} className="text-caramel animate-spin-slow" />
            <span>Chat with <strong>CollivioBot</strong></span>
          </motion.div>
        )}

        <motion.button
          onClick={() => {
            setIsOpen(!isOpen);
            if (isMinimized) setIsMinimized(false);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center cursor-pointer shadow-[0_8px_32px_rgba(82,19,12,0.4)] overflow-hidden transition-all duration-300 ${
            isOpen ? "bg-chestnut" : "bg-gradient-to-tr from-dark-fire via-red-wine to-caramel-500"
          }`}
          title="Toggle CollivioBot Virtual AI Assistant Helper"
          id="colliviobot-trigger"
        >
          {isOpen ? (
            <X size={20} className="text-wool" />
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Animated AI orb pulse glow layers */}
              <span className="absolute inset-0 bg-caramel/30 rounded-full animate-ping opacity-60" />
              <span className="absolute -inset-1.5 bg-red-wine/25 rounded-full animate-pulse opacity-55" />
              <div className="relative z-10 w-8 h-8 rounded-full bg-gradient-to-br from-wool via-caramel to-red-wine flex items-center justify-center shadow-inner">
                <MessageSquare size={14} className="text-dark-fire" />
              </div>
            </div>
          )}
        </motion.button>
      </div>

      {/* ── FLOATING CHAT WIDGET INTERFACE ── */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className={`fixed bottom-24 right-6 z-50 w-[380px] sm:w-[420px] h-[580px] max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col border transition-colors duration-300 ${
              isDarkMode 
                ? "bg-dark-fire/95 backdrop-blur-xl border-[#8D695D]/20 text-[#C4BAB3]" 
                : "bg-white/95 backdrop-blur-xl border-[#8D695D]/30 text-chestnut"
            }`}
            id="colliviobot-widget"
          >
            {/* Header section with Glassmorphic accent */}
            <div className={`p-4 flex items-center justify-between border-b shrink-0 transition-colors ${
              isDarkMode ? "bg-chestnut/70 border-[#8D695D]/15" : "bg-[#8D695D]/10 border-[#8D695D]/20"
            }`}>
              <div className="flex items-center gap-2.5">
                {/* Glowing Mini AI Orb */}
                <div className="relative">
                  <span className="absolute inset-0 bg-caramel/40 rounded-full animate-pulse" />
                  <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#8D695D] to-[#741717] flex items-center justify-center text-xs font-bold text-white shadow">
                    Cb
                  </div>
                </div>
                <div className="text-left leading-none">
                  <h4 className={`font-display font-bold text-sm tracking-wide ${isDarkMode ? "text-wool" : "text-chestnut"}`}>
                    CollivioBot
                  </h4>
                  <span className={`text-[8px] tracking-wide font-mono opacity-60 mt-0.5 block ${isDarkMode ? "text-wool/70" : "text-chestnut/70"}`}>
                    Your Personal Guide to Experience, Research & Growth
                  </span>
                </div>
              </div>

              {/* Utility Tools row */}
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)} 
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isDarkMode ? "hover:bg-red-wine/40 text-caramel" : "hover:bg-[#8D695D]/10 text-chestnut/70"
                  }`}
                  title={isDarkMode ? "Switch to Light Mode Accent" : "Switch to Dark Mode Accent"}
                >
                  {isDarkMode ? <Sun size={12} /> : <Moon size={12} />}
                </button>
                <button 
                  onClick={handleClearHistory} 
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isDarkMode ? "hover:bg-red-wine/40 text-caramel" : "hover:bg-[#8D695D]/10 text-chestnut/70"
                  }`}
                  title="Reset Conversation Chat History"
                >
                  <RefreshCw size={11} />
                </button>
                <button 
                  onClick={() => setIsMinimized(true)} 
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isDarkMode ? "hover:bg-red-wine/40 text-caramel" : "hover:bg-[#8D695D]/10 text-chestnut/70"
                  }`}
                  title="Minimize Chat Panel"
                >
                  <Minimize2 size={11} />
                </button>
              </div>
            </div>

            {/* Error notifications status */}
            {errorStatus && (
              <div className="bg-red-900/95 border-b border-red-500/20 px-4 py-2 flex items-center gap-2 text-[10px] text-red-100 select-none antialiased">
                <AlertCircle size={12} className="shrink-0 text-red-300" />
                <span className="truncate flex-1 text-left">{errorStatus}</span>
                <button onClick={() => setErrorStatus(null)} className="text-red-300 hover:text-red-100">
                  <X size={10} />
                </button>
              </div>
            )}

            {/* Smart Recommendations banner when profile is incomplete (Student only) */}
            {state && state.profile?.role === "student" && state.profile.profileCompletion < 100 && (
              <div className={`px-4 py-2 border-b flex items-center justify-between text-[10px] ${
                isDarkMode ? "bg-[#52130C]/50 border-[#8D695D]/10" : "bg-[#8D695D]/5 border-[#8D695D]/15"
              }`}>
                <div className="flex items-center gap-1.5 text-left">
                  <Info size={11} className="text-caramel shrink-0" />
                  <span>Your Collivio profile is <strong>{state.profile.profileCompletion}% complete</strong>. Unlock verified alignment.</span>
                </div>
                <button 
                  onClick={() => onNavigate("dashboard")}
                  className="text-caramel hover:underline font-bold shrink-0 ml-2"
                >
                  Solve →
                </button>
              </div>
            )}

            {/* Chat Messages flow container */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 font-sans ${
              isDarkMode ? "bg-dark-fire/65" : "bg-[#C4BAB3]/10"
            }`}>
              
              {messages.map((msg) => {
                const parsed = parseResponseSections(msg.text);
                const isSystem = msg.id === "welcome-msg";

                return (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col max-w-[85%] ${
                      msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                    }`}
                  >
                    {/* Time indicator */}
                    <span className="text-[8px] opacity-40 font-mono mb-1 px-1">{msg.time}</span>

                    {/* Speech Bubble body */}
                    <div className={`p-3.5 rounded-2xl text-[11px] leading-relaxed relative ${
                      msg.sender === "user"
                        ? "bg-caramel text-white rounded-tr-none shadow"
                        : isDarkMode
                          ? "bg-chestnut/50 border border-caramel/10 text-wool rounded-tl-none"
                          : "bg-white border border-[#8D695D]/15 text-chestnut rounded-tl-none shadow-sm"
                    }`}>
                      
                      {/* Structured rendering format if matching the standard template */}
                      {msg.sender === "assistant" && parsed.isStructured ? (
                        <div className="space-y-3 font-sans text-left">
                          {/* Section 1: Direct Answer */}
                          <div>
                            <p className="font-medium whitespace-pre-line leading-relaxed">
                              {parsed.directAnswer}
                            </p>
                          </div>

                          {/* Section 2: Explanation / Context */}
                          {parsed.explanation && (
                            <div className={`p-2.5 rounded-lg border text-[10px] space-y-1 ${
                              isDarkMode 
                                ? "bg-dark-fire/60 border-caramel/10" 
                                : "bg-[#C4BAB3]/10 border-caramel/10"
                            }`}>
                              <h5 className="font-accent text-[9px] font-bold text-caramel uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <Sparkles size={10} /> Context Summary
                              </h5>
                              <p className="whitespace-pre-line leading-relaxed opacity-95">
                                {parsed.explanation}
                              </p>
                            </div>
                          )}

                          {/* Section 3: Recommended Next Step CTA */}
                          {parsed.nextStep && (
                            <div className="pt-1.5">
                              <button
                                onClick={() => handleNextStepNavigation(parsed.nextStep!)}
                                className="w-full flex items-center justify-between p-2 rounded-lg bg-[#741717] border border-[#8D695D]/30 text-wool hover:bg-[#603A30] transition text-left cursor-pointer group"
                              >
                                <span className="font-mono text-[9px] font-bold truncate pr-3 select-none flex items-center gap-1">
                                  🚀 {parsed.nextStep.replace(/^(Recommended Next Step:?\s*|Next Step:?\s*)/i, "")}
                                </span>
                                <ChevronRight size={12} className="text-caramel shrink-0 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Fallback straight text block
                        <p className="whitespace-pre-line text-left leading-relaxed">
                          {msg.text}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing simulation loading indicator */}
              {isTyping && (
                <div className="mr-auto items-start flex flex-col max-w-[80%] animate-pulse-slow">
                  <span className="text-[8px] opacity-40 font-mono mb-1 px-1">Thinking...</span>
                  <div className={`flex items-center gap-2 p-3 rounded-2xl rounded-tl-none border ${
                    isDarkMode ? "bg-chestnut/30 border-caramel/10" : "bg-white border-[#8D695D]/15 shadow-sm"
                  }`}>
                    {/* Animated orb dots */}
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-caramel rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-caramel rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-caramel rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-[9px] text-caramel font-mono font-bold leading-none uppercase tracking-wide px-1">CollivioBot is tailoring...</span>
                  </div>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions Matrix area above input toolbar */}
            <div className={`p-2 border-t shrink-0 flex flex-col gap-1.5 leading-none bg-opacity-70 ${
              isDarkMode ? "bg-chestnut border-[#8D695D]/15" : "bg-white border-[#8D695D]/20 shadow-inner"
            }`}>
              
              {/* Heading */}
              <div className="px-2 pb-1 flex justify-between items-center text-[8px] uppercase tracking-wider opacity-50 font-mono select-none">
                <span>Tailored Quick Workflows</span>
                <span>Role: {state?.profile?.role || "student"}</span>
              </div>

              {/* Action grid maps */}
              <div className="grid grid-cols-2 gap-1.5 max-h-[80px] overflow-y-auto p-0.5">
                {getRoleBasedQuickActions().map((act) => (
                  <button
                    key={act.label}
                    onClick={() => handleSendMessage(act.text, true)}
                    className={`flex items-center gap-1.5 p-2 rounded-lg border text-left text-[9px] font-semibold transition active:scale-[0.98] cursor-pointer ${
                      isDarkMode 
                        ? "bg-dark-fire/60 hover:bg-[#741717]/40 border-[#8D695D]/15 text-[#C4BAB3]" 
                        : "bg-[#C4BAB3]/10 hover:bg-[#8D695D]/10 border-[#8D695D]/15 text-chestnut"
                    }`}
                  >
                    <act.icon size={11} className="text-caramel shrink-0" />
                    <span className="truncate flex-1">{act.label}</span>
                  </button>
                ))}
              </div>

              {/* Suggested Questions slider */}
              <div className="flex gap-1.5 items-center overflow-x-auto py-1 px-0.5 scrollbar-thin select-none">
                {exampleQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSendMessage(q, false)}
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[8.5px] border whitespace-nowrap transition cursor-pointer ${
                      isDarkMode 
                        ? "bg-chestnut/40 hover:bg-caramel/20 border-caramel/10 text-wool/70 hover:text-wool" 
                        : "bg-white hover:bg-caramel/10 border-caramel/15 text-chestnut/80"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls Input field footer */}
            <div className={`p-3 border-t shrink-0 flex gap-2 items-center ${
              isDarkMode ? "bg-chestnut border-[#8D695D]/15" : "bg-white border-[#8D695D]/25"
            }`}>
              {/* Mic action button */}
              <button
                onClick={toggleListening}
                className={`p-2 rounded-xl border flex items-center justify-center transition cursor-pointer relative shrink-0 ${
                  isListening
                    ? "bg-red-wine animate-pulse border-red-500 text-white"
                    : isDarkMode
                      ? "bg-dark-fire/60 hover:bg-chestnut/40 border-caramel/25 text-caramel"
                      : "bg-[#C4BAB3]/10 hover:bg-[#8D695D]/10 border-[#8D695D]/30 text-chestnut/70"
                }`}
                title={isListening ? "Listening... click to stop capturing speech" : "Hold voice input for speech to text translation"}
              >
                {isListening ? <MicOff size={13} className="animate-bounce" /> : <Mic size={13} />}
                {isListening && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-ping" />}
              </button>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputMessage);
                }}
                className="flex-grow flex gap-2 min-w-0"
              >
                <input
                  type="text"
                  placeholder={isListening ? "Listening... speak now" : "Query CollivioBot..."}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isListening}
                  className={`flex-grow px-3 py-2 rounded-xl text-[11px] focus:outline-none transition min-w-0 ${
                    isDarkMode
                      ? "bg-dark-fire border border-[#8D695D]/20 text-wool focus:border-caramel placeholder-wool/25"
                      : "bg-[#C4BAB3]/15 border border-[#8D695D]/35 text-chestnut focus:border-[#8D695D]/60 placeholder-chestnut/45"
                  }`}
                />
                
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className={`p-2 rounded-xl flex items-center justify-center shrink-0 transition cursor-pointer ${
                    inputMessage.trim()
                      ? "bg-caramel hover:bg-chestnut text-white shadow font-bold"
                      : isDarkMode
                        ? "bg-dark-fire/40 text-wool/20 border border-[#8D695D]/10 cursor-not-allowed"
                        : "bg-[#C4BAB3]/20 text-chestnut/30 border border-[#8D695D]/20 cursor-not-allowed"
                  }`}
                  title="Send input query to chatbot"
                >
                  <Send size={13} />
                </button>
              </form>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MINIMIZED OVERLAY BANNER (Bottom Right) ── */}
      <AnimatePresence>
        {isOpen && isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            onClick={() => setIsMinimized(false)}
            className="fixed bottom-24 right-6 z-50 p-3 rounded-2xl cursor-pointer shadow-lg flex items-center gap-3 border bg-[#52130C]/90 backdrop-blur-xl border-[#8D695D]/30 max-w-sm"
          >
            <div className="relative">
              <span className="absolute inset-0 bg-caramel/40 rounded-full animate-ping" />
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-caramel to-red-wine flex items-center justify-center text-[10px] font-bold text-white">
                Cb
              </div>
            </div>
            <div className="leading-none text-left flex-grow">
              <h5 className="font-bold text-wool text-xs">CollivioBot is minimized</h5>
              <span className="text-[8px] text-wool/50 mt-0.5 block">Click to resume your guidance session</span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="text-wool/40 hover:text-wool p-1"
               title="Close Chatbot Widget"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
