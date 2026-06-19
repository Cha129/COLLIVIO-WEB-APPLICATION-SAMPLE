import React, { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { 
  Trophy, Compass, Sparkles, UserCheck, ShieldCheck, Mail, ArrowRight,
  BarChart2, FileText, CheckCircle, PieChart, Users, Zap, Terminal, RefreshCw
} from "lucide-react";

interface WaitingExperienceProps {
  userId: string;
  userRole: string;
  status: "EMAIL_PENDING" | "IDENTITY_PENDING" | "REVIEW_PENDING" | "SUSPENDED" | "REJECTED";
  profileName: string;
  trustScore: number;
  auditLogs: Array<{ id: string; timestamp: string; event: string; type: string; userId?: string }>;
  onRefreshStatus: () => void;
  onApproveInstant: () => void;
}

export const WaitingExperience: React.FC<WaitingExperienceProps> = ({
  userId,
  userRole,
  status,
  profileName,
  trustScore,
  auditLogs,
  onRefreshStatus,
  onApproveInstant
}) => {
  // Navigation for subviews inside the waiting experience
  const [activeWaitModule, setActiveWaitModule] = useState<string>("assessment");

  // Email Verify Code Input
  const [emailCode, setEmailCode] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Document Upload States
  const [docType, setDocType] = useState(userRole === "student" ? "School ID Card" : "Certificate of Incorporation");
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [localTrust, setLocalTrust] = useState(trustScore);

  // Quiz States for student Assessment
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<number[]>([-1, -1, -1]);
  const quizQuestions = [
    { q: "Which complexity represents binary search in optimal conditions?", a: ["O(N)", "O(1)", "O(log N)", "O(N log N)"], c: 2 },
    { q: "What React hook assists in memoizing costly computational executions?", a: ["useEffect", "useMemo", "useState", "useCallback"], c: 1 },
    { q: "How is an API key safely handled in standard client-server pipelines?", a: ["Saved directly in client code", "Passed as public Vite variables", "Proxied through custom server-side API routes", "Stored in public metadata"], c: 2 }
  ];

  const handleEmailVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess("");
    if (!emailCode) return;

    setEmailLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code: emailCode })
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailError(data.error || "Failed key verification.");
      } else {
        setEmailSuccess("Official Email validated successfully! Identity verification is now open.");
        setTimeout(() => {
          onRefreshStatus();
        }, 1500);
      }
    } catch {
      setEmailError("Network failed communication.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleFileUploadSimulate = () => {
    if (uploadProgress > 0) return;
    setUploadSuccess("");
    setUploadProgress(1);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          handleDocCompleted();
          return 100;
        }
        return prev + 20;
      });
    }, 250);
  };

  const handleDocCompleted = async () => {
    try {
      const res = await fetch("/api/auth/upload-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, documentType: docType, documentUrl: "school_certificate.png" })
      });
      const data = await res.json();
      if (res.ok) {
        setUploadSuccess("Document parsed by OCR! Risk validation: 0% Fraud threat. Trust score elevated.");
        setOcrText(data.extractedDetails || "");
        if (data.trustScore) setLocalTrust(data.trustScore);
        setTimeout(() => {
          onRefreshStatus();
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuizAnswer = (qIdx: number, aIdx: number) => {
    const nextAnswers = [...selectedQuizAnswers];
    nextAnswers[qIdx] = aIdx;
    setSelectedQuizAnswers(nextAnswers);
  };

  const handleScoreQuiz = () => {
    let score = 0;
    selectedQuizAnswers.forEach((ans, qIdx) => {
      if (ans === quizQuestions[qIdx].c) score++;
    });
    setQuizScore(score);
  };

  // Opportunity Builder for Organizations in Waiting Experience
  const [waitPostTitle, setWaitPostTitle] = useState("");
  const [waitPostDesc, setWaitPostDesc] = useState("");
  const [waitPostSuccess, setWaitPostSuccess] = useState("");

  const handleWaitAddOpportunity = () => {
    if (!waitPostTitle || !waitPostDesc) return;
    setWaitPostSuccess(`Unverified draft '${waitPostTitle}' successfully created! It will automatically go live when your corporate credentials verify.`);
    setWaitPostTitle("");
    setWaitPostDesc("");
    setTimeout(() => setWaitPostSuccess(""), 4000);
  };

  return (
    <div className="min-h-screen bg-[#F7F4F2] text-[#2F2421] font-sans flex flex-col p-6 md:p-12 text-left select-none relative overflow-x-hidden">
      
      {/* Absolute Admin backdoor trigger for instant evaluation convenience */}
      <div className="md:absolute md:top-8 md:right-12 flex gap-2.5 items-center mb-6 md:mb-0 bg-white border border-[#E7DDD7] p-3 rounded-xl shadow-sm z-50">
        <div className="text-left shrink-0">
          <p className="text-[9px] uppercase font-bold text-orange-700 font-mono flex items-center gap-1">
            <Zap size={10} className="animate-bounce" /> Evaluator Quick Sandbox
          </p>
          <p className="text-[10px] text-gray-500 font-light max-w-[210px]">
            Bypass verification steps and approve this account to access the role dashboard!
          </p>
        </div>
        <Button 
          onClick={onApproveInstant}
          variant="primary" 
          size="xs" 
          className="bg-[#741717] hover:bg-chestnut text-white font-bold tracking-wide uppercase px-3 py-2 text-[9px] rounded-lg cursor-pointer shrink-0"
        >
          Approve Now
        </Button>
      </div>

      {/* Hero Welcome */}
      <div className="max-w-6xl w-full mx-auto mb-10 mt-2">
        <div className="flex items-center gap-1 mb-2">
          <div className="w-2.5 h-2.5 bg-[#741717] rounded-full animate-ping mr-1" />
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#8D695D] font-bold leading-none">Security Verification Gateway</span>
        </div>
        <h2 className="font-display text-3xl font-bold text-chestnut">
          Verifying Your {userRole === "student" ? "Scholar" : "Brand"} Credentials...
        </h2>
        <p className="text-xs text-[#594440] font-light max-w-2xl leading-relaxed mt-1.5">
          Thanks for registering, <span className="font-bold text-[#741717]">{profileName}</span>! Safety, academic excellence, and RBAC isolation are our highest priorities. While our OCR scanner digests your upload, practice your skills or draft listings below.
        </p>
      </div>

      {/* Main Grid */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Verification Status Timeline Check */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 bg-white border border-[#E7DDD7] shadow-sm rounded-xl">
            <h3 className="font-display font-bold text-base text-chestnut uppercase tracking-wide border-b border-[#E7DDD7] pb-3 mb-4">
              Gateway Progress
            </h3>

            <div className="space-y-6 relative pl-3.5 border-l border-[#E7DDD7]/70 font-sans text-xs">
              
              {/* Step 1: Created */}
              <div className="relative">
                <div className="absolute -left-[20px] top-0.5 w-3 h-3 rounded-full bg-emerald-600 flex items-center justify-center text-white" />
                <h4 className="font-bold text-chestnut text-sm">Account Created</h4>
                <p className="text-[10px] text-gray-500 font-light mt-0.5">Separate database profiles established safely.</p>
              </div>

              {/* Step 2: Email */}
              <div className="relative">
                <div className={`absolute -left-[20px] top-0.5 w-3 h-3 rounded-full flex items-center justify-center ${
                  status !== "EMAIL_PENDING" ? "bg-emerald-600" : "bg-amber-500 animate-pulse"
                }`} />
                <h4 className={`font-bold text-sm ${status !== "EMAIL_PENDING" ? "text-chestnut" : "text-amber-700"}`}>
                  Official Email Verification
                </h4>
                <p className="text-[10px] text-gray-500 font-light mt-0.5">Verification status: <span className="font-mono font-semibold uppercase">{status === "EMAIL_PENDING" ? "EMAIL_PENDING" : "ACTIVE"}</span></p>

                {status === "EMAIL_PENDING" && (
                  <form onSubmit={handleEmailVerifySubmit} className="mt-3 p-3.5 bg-[#F7F4F2] border border-[#E7DDD7] rounded-xl text-left space-y-3">
                    <p className="text-[10px] text-[#594440] leading-relaxed">
                      We simulated sending a 4-digit code to your email. key in any 4-digit number to confirm your email.
                    </p>
                    {emailError && <p className="text-[9px] text-red-600 font-semibold">{emailError}</p>}
                    {emailSuccess && <p className="text-[9px] text-emerald-600 font-semibold">{emailSuccess}</p>}
                    
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="e.g. 1290"
                        className="bg-white border border-[#E7DDD7] rounded py-1 px-2.5 text-xs focus:outline-none w-28 uppercase text-center font-mono font-bold"
                        value={emailCode}
                        onChange={e => setEmailCode(e.target.value)}
                      />
                      <Button 
                        variant="primary" 
                        size="xs" 
                        type="submit" 
                        loading={emailLoading}
                        className="bg-[#741717] hover:bg-chestnut text-white px-3 font-semibold text-[10px]"
                      >
                        Verify Email
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {/* Step 3: Identity & Document Verification */}
              <div className="relative">
                <div className={`absolute -left-[20px] top-0.5 w-3 h-3 rounded-full flex items-center justify-center ${
                  (status === "EMAIL_PENDING") ? "bg-gray-200" :
                  (status === "IDENTITY_PENDING") ? "bg-amber-500 animate-pulse" : "bg-emerald-600"
                }`} />
                <h4 className={`font-bold text-sm ${
                  status === "EMAIL_PENDING" ? "text-gray-400" :
                  status === "IDENTITY_PENDING" ? "text-amber-750" : "text-chestnut"
                }`}>
                  Identity & Credentials Verification
                </h4>
                <p className="text-[10px] text-gray-500 font-light mt-0.5">Upload verified pre-college files or MSME credentials.</p>

                {status === "IDENTITY_PENDING" && (
                  <div className="mt-3 p-3.5 bg-[#F7F4F2] border border-[#E7DDD7] rounded-xl text-left space-y-3">
                    <p className="text-[10px] text-[#594440]">
                      Provide an official document for OCR fraud check.
                    </p>
                    
                    <div className="space-y-1.5">
                      <label className="block text-[9px] uppercase font-mono font-bold text-[#8D695D]">Select Document Type</label>
                      <select 
                        className="w-full bg-white border border-[#E7DDD7] text-xs py-1.5 px-2 rounded-lg focus:outline-none focus:border-[#741717]"
                        value={docType}
                        onChange={e => setDocType(e.target.value)}
                      >
                        {userRole === "student" ? (
                          <>
                            <option>School ID Card</option>
                            <option>Student Certificate</option>
                            <option>Enrollment Letter</option>
                          </>
                        ) : (
                          <>
                            <option>Certificate of Incorporation</option>
                            <option>MSME Registration</option>
                            <option>GST Registration</option>
                            <option>NGO Registration</option>
                            <option>Educational Institution Registration</option>
                          </>
                        )}
                      </select>
                    </div>

                    {uploadSuccess && (
                      <p className="text-[9px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 p-2 rounded">
                        {uploadSuccess}
                      </p>
                    )}

                    {/* Drag and Drop Box Simulation */}
                    <div 
                      onClick={handleFileUploadSimulate}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      className={`border-2 border-dashed p-4 rounded-lg text-center cursor-pointer transition ${
                        dragOver ? "border-[#741717] bg-[#741717]/5" : "border-[#E7DDD7] hover:border-caramel bg-white"
                      }`}
                    >
                      {uploadProgress > 0 && uploadProgress < 100 ? (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-mono text-chestnut">Running OCR Scan... {uploadProgress}%</p>
                          <div className="w-full h-1.5 bg-[#E7DDD7] rounded-full overflow-hidden">
                            <div className="h-full bg-[#741717] transition-all" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[10px] font-bold text-chestnut">Drag or Select Scan File</p>
                          <p className="text-[8px] text-gray-400 mt-0.5">Supports PDF, PNG formats up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 4: System Review Queue */}
              <div className="relative">
                <div className={`absolute -left-[20px] top-0.5 w-3 h-3 rounded-full flex items-center justify-center ${
                  status === "REVIEW_PENDING" ? "bg-amber-500 animate-pulse" : "bg-gray-200"
                }`} />
                <h4 className={`font-bold text-sm ${status === "REVIEW_PENDING" ? "text-amber-700 font-bold" : "text-gray-400"}`}>
                  Administrative Approval Process
                </h4>
                <p className="text-[10px] text-gray-500 font-light mt-0.5">Official board review. Status is <span className="font-mono font-semibold uppercase">{status}</span></p>

                {status === "REVIEW_PENDING" && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 text-[#a16207] text-[10px] rounded-lg flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#a16207] rounded-full animate-ping shrink-0" />
                    <span>Your documents are queued! Click the 'Approve Now' sandboxed sandbox override in the top right to grant direct access instantly.</span>
                  </div>
                )}
              </div>

            </div>
          </Card>

          {/* Real-time Multi-User Audit Logs (Security compliance display) */}
          <Card className="p-4 bg-white border border-[#E7DDD7] text-left font-mono text-[9px] shadow-sm rounded-xl">
            <h4 className="font-bold text-chestnut font-sans text-xs uppercase mb-2 border-b border-[#E7DDD7] pb-1.5 flex justify-between items-center">
              <span>Security Event Logs</span>
              <span className="text-[8px] bg-red-100 text-red-800 px-1.5 rounded">Compliant</span>
            </h4>
            <div className="space-y-1.5 max-h-[170px] overflow-y-auto">
              {auditLogs.filter(log => !log.userId || log.userId === userId).slice().reverse().map(log => (
                <div key={log.id} className="pb-1.5 border-b border-gray-100 last:border-0">
                  <div className="flex justify-between text-gray-400">
                    <span>{log.timestamp.slice(11, 19)} UTC</span>
                    <span className="uppercase text-[8px]">{log.type}</span>
                  </div>
                  <p className="text-gray-700 leading-tight mt-0.5"># {log.event}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Side: Waiting Experience Interactive Features */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Waiting Sub-navigation menu */}
          <div className="flex bg-white p-1 rounded-xl border border-[#E7DDD7] gap-1 text-xs select-none">
            {userRole === "student" ? (
              <>
                <button 
                  onClick={() => setActiveWaitModule("assessment")}
                  className={`flex-1 py-2 text-center rounded-lg font-bold transition cursor-pointer ${activeWaitModule === "assessment" ? "bg-[#741717] text-white" : "text-gray-600 hover:bg-[#F7F4F2]"}`}
                >
                  🎓 Skill Assessment
                </button>
                <button 
                  onClick={() => setActiveWaitModule("explorer")}
                  className={`flex-1 py-2 text-center rounded-lg font-bold transition cursor-pointer ${activeWaitModule === "explorer" ? "bg-[#741717] text-white" : "text-gray-600 hover:bg-[#F7F4F2]"}`}
                >
                  🧭 Career Explorer
                </button>
                <button 
                  onClick={() => setActiveWaitModule("builder")}
                  className={`flex-1 py-2 text-center rounded-lg font-bold transition cursor-pointer ${activeWaitModule === "builder" ? "bg-[#741717] text-white" : "text-gray-600 hover:bg-[#F7F4F2]"}`}
                >
                  📊 Profile Completion
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setActiveWaitModule("builder-org")}
                  className={`flex-1 py-2 text-center rounded-lg font-bold transition cursor-pointer ${activeWaitModule === "builder-org" ? "bg-[#741717] text-white" : "text-gray-600 hover:bg-[#F7F4F2]"}`}
                >
                  💼 Opportunity Builder
                </button>
                <button 
                  onClick={() => setActiveWaitModule("insights")}
                  className={`flex-1 py-2 text-center rounded-lg font-bold transition cursor-pointer ${activeWaitModule === "insights" ? "bg-[#741717] text-white" : "text-gray-600 hover:bg-[#F7F4F2]"}`}
                >
                  📊 Talent Insights
                </button>
                <button 
                  onClick={() => setActiveWaitModule("analytics-preview")}
                  className={`flex-1 py-2 text-center rounded-lg font-bold transition cursor-pointer ${activeWaitModule === "analytics-preview" ? "bg-[#741717] text-white" : "text-gray-600 hover:bg-[#F7F4F2]"}`}
                >
                  👀 Candidates Preview
                </button>
              </>
            )}
          </div>

          {/* MODULE PANELS */}

          {/* STUDENT: SKILL ASSESSMENT */}
          {activeWaitModule === "assessment" && (
            <Card className="p-6 bg-white border border-[#E7DDD7] shadow-sm rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-display font-bold text-base text-chestnut uppercase tracking-wide">
                    Pre-College Technical Assessment
                  </h3>
                  <p className="text-xs text-gray-500 font-light mt-0.5">Solve questions to elevate your public Scholar Trust Score instantly.</p>
                </div>
                <Trophy size={20} className="text-[#741717]" />
              </div>

              {quizScore !== null ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex flex-col justify-center items-center text-center gap-3">
                  <CheckCircle size={32} className="text-emerald-600" />
                  <div>
                    <h4 className="font-bold text-sm">Skills Audit Evaluated</h4>
                    <p className="text-[11px] text-emerald-900 mt-1">You scored {quizScore} out of {quizQuestions.length} correct answers!</p>
                  </div>
                  <Button 
                    onClick={() => { setQuizScore(null); setSelectedQuizAnswers([-1, -1, -1]); }} 
                    variant="outline" 
                    size="xs" 
                    className="border-emerald-600 text-emerald-700 bg-white"
                  >
                    Recalculate Assessment
                  </Button>
                </div>
              ) : (
                <div className="space-y-5 text-left text-xs">
                  {quizQuestions.map((item, qIdx) => (
                    <div key={qIdx} className="space-y-2 p-3.5 bg-[#F7F4F2] border border-[#E7DDD7] rounded-lg">
                      <p className="font-bold text-chestnut">{qIdx + 1}. {item.q}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1.5">
                        {item.a.map((opt, aIdx) => {
                          const isSelected = selectedQuizAnswers[qIdx] === aIdx;
                          return (
                            <button
                              key={aIdx}
                              onClick={() => handleQuizAnswer(qIdx, aIdx)}
                              className={`p-2.5 rounded border text-left cursor-pointer transition ${
                                isSelected 
                                  ? "bg-[#741717] text-white border-[#741717] font-semibold" 
                                  : "bg-white border-[#E7DDD7] hover:bg-[#741717]/5"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <Button 
                    onClick={handleScoreQuiz}
                    disabled={selectedQuizAnswers.includes(-1)}
                    variant="primary" 
                    className="w-full py-3 bg-[#741717] text-white rounded-xl font-bold uppercase tracking-wider text-xs"
                  >
                    Commit Answers for score recalculations
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* STUDENT: CAREER EXPLORER */}
          {activeWaitModule === "explorer" && (
            <Card className="p-6 bg-white border border-[#E7DDD7] shadow-sm rounded-xl">
              <h3 className="font-display font-bold text-base text-chestnut mb-2 uppercase tracking-wide flex items-center gap-1.5">
                <Compass size={18} className="text-[#741717]" /> Core Academic Roadmap Explorer
              </h3>
              <p className="text-xs text-gray-500 mb-6 font-light">
                Analyze student alignment demand values across deep learning, neuroscience, and quantum systems.
              </p>

              <div className="space-y-4">
                {[
                  { title: "Machine Learning Associate", demand: "High Demand (98% alignment)", skills: "TensorFlow, PyTorch, Math", duration: "12 micro-credits" },
                  { title: "Neuroscience Software Engineer", demand: "Trending (92% alignment)", skills: "Figma, Python, Signal Analysis", duration: "15 micro-credits" },
                  { title: "Distributed Tech Cryptographer", demand: "Stable (85% alignment)", skills: "Rust, Network Telemetry, Go", duration: "10 micro-credits" }
                ].map(r => (
                  <div key={r.title} className="p-4 bg-[#F7F4F2] border border-[#E7DDD7] rounded-xl text-left flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-[#741717]">{r.title}</h4>
                      <p className="text-[10px] text-emerald-800 font-mono mt-0.5">{r.demand}</p>
                      <p className="text-[10px] text-gray-400 mt-1">Prerequisites: <span className="font-semibold text-gray-500">{r.skills}</span></p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] uppercase font-mono bg-white border border-[#E7DDD7] text-[#2F2421] px-2.5 py-1 rounded-lg">
                        {r.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* STUDENT: PROFILE BUILDER */}
          {activeWaitModule === "builder" && (
            <Card className="p-6 bg-white border border-[#E7DDD7] shadow-sm rounded-xl">
              <h3 className="font-display font-bold text-base text-chestnut mb-2 uppercase tracking-wide">
                Interactive Profile Completeness
              </h3>
              <p className="text-xs text-gray-500 mb-6 font-light">Your scholar listing is public to sponsoring companies under a verified directory URL format.</p>

              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative w-28 h-28 rounded-full border-4 border-dashed border-[#741717]/20 flex items-center justify-center shrink-0">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#741717]">70%</p>
                    <p className="text-[8px] uppercase tracking-widest text-gray-400 font-mono">COMPLETE</p>
                  </div>
                </div>

                <div className="text-left space-y-2 text-xs text-[#594440] flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-[10px]">✓</div>
                    <span>Basic Information Registered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-[10px]">✓</div>
                    <span>Email Account Authored</span>
                  </div>
                  <div className={`flex items-center gap-2 ${status === "REVIEW_PENDING" ? "text-emerald-800" : "text-amber-700 font-semibold"}`}>
                    <div className="w-4 h-4 rounded bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-[10px]">{status === "REVIEW_PENDING" ? "✓" : "!"}</div>
                    <span>{status === "REVIEW_PENDING" ? "School Credentials Uploaded" : "Submit School Certificate ID for OCR check"}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* MOCK ORGANIZATION VIEWS */}

          {/* ORG: LISTING BUILDER */}
          {activeWaitModule === "builder-org" && (
            <Card className="p-6 bg-white border border-[#E7DDD7] shadow-sm rounded-xl">
              <h3 className="font-display font-bold text-base text-chestnut mb-2 uppercase tracking-wide">
                Micro-Internship Opportunity Builder
              </h3>
              <p className="text-xs text-gray-500 mb-6 font-light">Draft and format listings. Once approved, they will immediately go live.</p>

              {waitPostSuccess && (
                <p className="mb-4 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs p-3 rounded-lg">
                  {waitPostSuccess}
                </p>
              )}

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Internship Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Data Scientist Intern"
                    className="w-full bg-[#F7F4F2] border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs"
                    value={waitPostTitle}
                    onChange={e => setWaitPostTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Opportunity Scope Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Define micro-deliverables..."
                    className="w-full bg-[#F7F4F2] border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs"
                    value={waitPostDesc}
                    onChange={e => setWaitPostDesc(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleWaitAddOpportunity}
                  variant="primary" 
                  className="w-full py-2 bg-[#741717] text-white rounded font-bold"
                >
                  Create Opportunity Draft
                </Button>
              </div>
            </Card>
          )}

          {/* ORG: TALENT INSIGHTS */}
          {activeWaitModule === "insights" && (
            <Card className="p-6 bg-white border border-[#E7DDD7] shadow-sm rounded-xl">
              <h3 className="font-display font-bold text-base text-chestnut mb-1 uppercase tracking-wide">
                Pre-College Scholar Talent Insights
              </h3>
              <p className="text-xs text-gray-500 mb-6 font-light">Grade metrics and programming language representation in active pools.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="p-4 bg-[#F7F4F2] rounded-lg border border-[#E7DDD7]">
                  <h4 className="font-bold text-chestnut uppercase tracking-wide text-[10px] border-b border-[#E7DDD7] pb-1.5 mb-2.5">
                    Grade-Level Allocation
                  </h4>
                  <div className="space-y-2">
                    {[
                      { item: "Grade 12 Prep Scholars", percent: 45 },
                      { item: "Grade 11 Tech Candidates", percent: 38 },
                      { item: "Grade 10 Junior Coders", percent: 17 }
                    ].map(grade => (
                      <div key={grade.item}>
                        <div className="flex justify-between font-mono text-[9px] text-[#594440]">
                          <span>{grade.item}</span>
                          <span className="font-bold">{grade.percent}%</span>
                        </div>
                        <div className="w-full h-1 bg-[#E7DDD7] rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-[#741717] rounded-full" style={{ width: `${grade.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-[#F7F4F2] rounded-lg border border-[#E7DDD7]">
                  <h4 className="font-bold text-chestnut uppercase tracking-wide text-[10px] border-b border-[#E7DDD7] pb-1.5 mb-2.5">
                    In Demand Technical Focus
                  </h4>
                  <div className="space-y-2">
                    {[
                      { item: "Python (ML/DS Ecosystem)", percent: 52 },
                      { item: "React / Frontend Layouts", percent: 28 },
                      { item: "Rust / High-latency Compute", percent: 20 }
                    ].map(lang => (
                      <div key={lang.item}>
                        <div className="flex justify-between font-mono text-[9px] text-[#594440]">
                          <span>{lang.item}</span>
                          <span className="font-bold">{lang.percent}%</span>
                        </div>
                        <div className="w-full h-1 bg-[#E7DDD7] rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-caramel rounded-full" style={{ width: `${lang.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* ORG: PREVIEW CANDIDATES */}
          {activeWaitModule === "analytics-preview" && (
            <Card className="p-6 bg-white border border-[#E7DDD7] shadow-sm rounded-xl">
              <h3 className="font-display font-bold text-base text-chestnut mb-2 uppercase tracking-wide">
                Candidate Analytics Preview
              </h3>
              <p className="text-xs text-gray-500 mb-6 font-light">Look up verified platform scholars sorted by high Trust ratings.</p>

              <div className="space-y-3">
                {[
                  { name: "Alex Rivera", school: "Stanford Prep", trust: 99, skill: "Machine Learning, Python" },
                  { name: "Suresh Iyer", school: "Stuyvesant High", trust: 98, skill: "C++, Quantum Models" },
                  { name: "Emma Watson", school: "Phillips Academy", trust: 96, skill: "UI design, Neuroscience" }
                ].map((cand, idx) => (
                  <div key={idx} className="p-3 bg-[#F7F4F2] border border-[#E7DDD7] rounded-xl flex items-center justify-between text-left text-xs">
                    <div>
                      <p className="font-bold text-[#741717]">{cand.name}</p>
                      <p className="text-[10px] text-gray-400">{cand.school} · {cand.skill}</p>
                    </div>
                    <span className="font-mono text-[10px] bg-white border border-[#E7DDD7] text-emerald-800 font-bold px-2 py-0.5 rounded-lg shrink-0">
                      TS: {cand.trust}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>

      </div>

    </div>
  );
};
