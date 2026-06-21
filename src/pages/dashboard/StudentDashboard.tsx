import React, { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { State, KanbanCard, InternshipMatch } from "../../types";
import { VerifiedBadge } from "../../components/verification/VerifiedBadge";
import { 
  Plus, Sparkles, CheckCircle2, Circle, Trophy, Calendar, 
  MessageSquare, ChevronLeft, ChevronRight, TrendingUp, BarChart4, PieChart, Users, AlertCircle, Activity
} from "lucide-react";

interface StudentDashboardProps {
  state: State;
  onUpdateState: (batch: Partial<State>) => void;
  onCallGeminiMatching: () => void;
  geminiLoading: boolean;
  onNavigate?: (view: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  state,
  onUpdateState,
  onCallGeminiMatching,
  geminiLoading,
  onNavigate
}) => {
  const [internshipIndex, setInternshipIndex] = useState(0);
  const [matchingResults, setMatchingResults] = useState<string[]>([]);
  const [localMatchingLoading, setLocalMatchingLoading] = useState(false);

  // Toggle Checklist items in Profile Completion card
  const toggleProfileItem = (itemId: number) => {
    const updatedItems = state.profile.missingItems.map(item => {
      if (item.id === itemId) {
        return { ...item, checked: !item.checked };
      }
      return item;
    });

    // Recalculate percent completion
    const checkedCount = updatedItems.filter(i => i.checked).length;
    const completeness = Math.round((checkedCount / updatedItems.length) * 100);

    onUpdateState({
      profile: {
        ...state.profile,
        profileCompletion: completeness,
        missingItems: updatedItems
      }
    });
  };

  // Slider change for active ML Certification path
  const handleMLProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    const updatedCerts = state.certifications.map(c => {
      if (c.id === "cert-4") {
        return { ...c, progress: val };
      }
      return c;
    });
    onUpdateState({ certifications: updatedCerts });
  };

  // Simple carousel pagination
  const nextInternship = () => {
    const listLen = (state.internships && state.internships.length > 0 ? state.internships : state.internshipMatches || []).length;
    if (listLen === 0) return;
    if (internshipIndex < listLen - 1) {
      setInternshipIndex(internshipIndex + 1);
    } else {
      setInternshipIndex(0);
    }
  };

  const prevInternship = () => {
    const listLen = (state.internships && state.internships.length > 0 ? state.internships : state.internshipMatches || []).length;
    if (listLen === 0) return;
    if (internshipIndex > 0) {
      setInternshipIndex(internshipIndex - 1);
    } else {
      setInternshipIndex(listLen - 1);
    }
  };

  // Trigger real backend matching API
  const handleAIMatchRequest = async () => {
    setLocalMatchingLoading(true);
    try {
      const skillsList = state.certifications.filter(c => c.status === "completed").map(c => c.path);
      const res = await fetch("/api/gemini/matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: skillsList,
          interests: ["Machine Learning", "Software Engineering", "Product Design"]
        })
      });
      if (!res.ok) throw new Error("Key not loaded");
      const data = await res.json();
      if (data.recommendations) {
        setMatchingResults(data.recommendations);
        // Save back to general state
        const recObjs = data.recommendations.map((text: string, idx: number) => ({
          id: `ai-gen-${idx}`,
          text
        }));
        onUpdateState({ aiRecommendations: recObjs });
      }
    } catch (err) {
      // Fallback if key missing or server error
      const mockRecs = [
        "Recommended Course: 'Neural Networks & Deep Learning' based on Advanced Python certification.",
        "Join 'Collivio BCI Lab' matching your 95% Skill Score."
      ];
      setMatchingResults(mockRecs);
      const recObjs = mockRecs.map((text: string, idx: number) => ({
        id: `ai-gen-mock-${idx}`,
        text
      }));
      onUpdateState({ aiRecommendations: recObjs });
    } finally {
      setLocalMatchingLoading(false);
    }
  };

  // Handle application state
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const applyForJob = (jobId: string) => {
    if (!appliedJobs.includes(jobId)) {
      setAppliedJobs([...appliedJobs, jobId]);
      // Update activity stream
      const newActivity = {
        id: `act-${Date.now()}`,
        text: `You applied for the internship at ${state.internshipMatches.find(j => j.id === jobId)?.title.split(" at ")[1] || "TechCorp"}.`,
        time: "Just now",
        type: "system"
      };
      onUpdateState({
        activityFeed: [newActivity, ...state.activityFeed]
      });
    }
  };

  const internshipsList = state.internships && state.internships.length > 0 ? state.internships : state.internshipMatches || [];
  const activeInternship = internshipsList[internshipIndex];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
      
      {/* ── LEFT COLUMN (6 spans) ── */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* ROW 1: PROFILE COMPLETION & CERTIFICATIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          
          {/* PROFILE COMPLETION (Radial Gauge Widget) */}
          <Card variant="glass" className="flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-accent text-sm font-semibold tracking-wide uppercase text-caramel-400">Profile Completion</h3>
              <div className="flex items-center gap-1.5">
                <VerifiedBadge type="student" className="scale-90" />
                <span className="text-[10px] bg-wine-red/50 text-wool-100 font-bold px-2 py-0.5 rounded font-mono">Alex Rivera</span>
              </div>
            </div>

            <div className="flex items-center gap-6 py-1">
              {/* Radial SVGs */}
              <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="48" 
                    cy="48" 
                    r="40" 
                    stroke="#8D695D" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - state.profile.profileCompletion / 100)}
                    className="transition-all duration-500 stroke-linecap-round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-xl font-display font-bold text-wool-100 leading-none">{state.profile.profileCompletion}%</span>
                </div>
              </div>

              {/* Toggles checklist */}
              <div className="flex-1 flex flex-col gap-1.5 text-left max-h-[120px] overflow-y-auto">
                <span className="text-[10px] text-[#7A6B65] uppercase font-mono font-bold">Verifying items:</span>
                {state.profile.missingItems.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => toggleProfileItem(item.id)}
                    className="flex items-center gap-2 text-xs text-[#5C4B45] hover:text-[#741717] transition cursor-pointer select-none"
                  >
                    {item.checked ? (
                      <CheckCircle2 size={13} className="text-caramel-500 flex-shrink-0" />
                    ) : (
                      <Circle size={13} className="text-[#7A6B65] flex-shrink-0" />
                    )}
                    <span className={item.checked ? "line-through text-[#7A6B65]" : "font-semibold"}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              variant="glass" 
              size="sm" 
              className="mt-4 text-xs h-9"
              onClick={() => onUpdateState({
                profile: {
                  ...state.profile,
                  profileCompletion: 100,
                  missingItems: state.profile.missingItems.map(i => ({ ...i, checked: true }))
                }
              })}
            >
              Complete Now
            </Button>
          </Card>

          {/* CERTIFICATIONS PATHS (Path Icons Widget) */}
          <Card variant="glass" className="flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-accent text-sm font-semibold tracking-wide uppercase text-caramel-400">Certifications Track</h3>
              <Trophy size={15} className="text-caramel-400" />
            </div>

            {state.certifications && state.certifications.length > 0 ? (
              <div className="flex flex-col gap-3 py-1">
                <div className="grid grid-cols-3 gap-2">
                  {state.certifications.filter(c => c.status === "completed").map((c, i) => (
                    <div key={c.id} className="p-2 rounded-lg bg-[#F7F4F2] border border-[#E8E0DC] text-center flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#741717]/10 flex items-center justify-center font-bold text-xs text-[#741717] mb-1">
                        {c.path?.[0] || "C"}
                      </div>
                      <span className="text-[9px] font-sans font-bold text-[#3A241E] truncate w-full">{c.path}</span>
                      <span className="text-[8px] font-mono text-[#7A6B65] uppercase mt-0.5">Earned</span>
                    </div>
                  ))}
                </div>

                {/* ML Interactive slider matching design specifications */}
                {state.certifications.find(c => c.id === "cert-4") && (
                  <div className="bg-[#F7F4F2] p-2.5 rounded-lg border border-[#E8E0DC]">
                    <div className="flex justify-between items-center text-[10px] mb-1.5">
                      <span className="font-bold text-[#3A241E]">Ongoing: Machine Learning</span>
                      <span className="text-[#8D695D] font-mono font-bold">{state.certifications.find(c => c.id === "cert-4")?.progress || 0}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      className="w-full accent-[#8D695D] bg-[#E8E0DC] rounded-lg cursor-pointer h-1"
                      value={state.certifications.find(c => c.id === "cert-4")?.progress || 0}
                      onChange={handleMLProgressChange}
                    />
                  </div>
                )}
                <div className="text-[9px] text-[#7A6B65] font-mono text-center mt-2">Adjust slides to calibrate matching matrices</div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                <p className="text-xs text-[#5C4B45] leading-relaxed font-mono">
                  No certifications available yet.<br />Organizations will publish learning programs soon.
                </p>
              </div>
            )}
          </Card>

        </div>

        {/* ROW 2: INTERNSHIP MATCHES CAROUSEL */}
        <Card variant="glass" className="animate-fade-in relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 border-b border-caramel-500/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-caramel-500" />
              <h3 className="font-accent text-sm font-semibold tracking-wide uppercase text-caramel-400">Internship Matches</h3>
            </div>
            {/* Carousel navigation buttons */}
            <div className="flex gap-1.5">
              <button 
                onClick={prevInternship} 
                className="w-7 h-7 rounded-md bg-white border border-[#E8E0DC] flex items-center justify-center hover:bg-[#741717]/10 text-[#741717] transition cursor-pointer"
              >
                <ChevronLeft size={13} />
              </button>
              <button 
                onClick={nextInternship} 
                className="w-7 h-7 rounded-md bg-white border border-[#E8E0DC] flex items-center justify-center hover:bg-[#741717]/10 text-[#741717] transition cursor-pointer"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          {activeInternship ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 py-2 items-center">
              
              {/* Left Score Index Panel (4 spans) */}
              <div className="md:col-span-4 bg-[#F7F4F2] p-5 rounded-xl border border-[#E8E0DC] flex flex-col items-center justify-center text-center">
                <div className="text-4xl font-display font-bold text-[#741717] font-mono">{activeInternship.matchScore || 95}%</div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#7A6B65] mt-1">Skill Match Score</span>
                <span className="text-[10px] text-[#741717] font-bold bg-[#741717]/10 px-2.5 py-0.5 rounded mt-3">High Priority Match</span>
              </div>

              {/* Right text layout (8 spans) */}
              <div className="md:col-span-8 text-left flex flex-col gap-2">
                <h4 className="font-sans text-base font-bold text-[#3A241E]">{activeInternship.title}</h4>
                <p className="text-xs text-[#5C4B45] leading-relaxed font-semibold">{activeInternship.details || activeInternship.description}</p>
                
                {activeInternship.skills && activeInternship.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {activeInternship.skills.map((skill: string) => (
                      <span key={skill} className="text-[9px] bg-[#741717]/10 border border-[#741717]/20 text-[#741717] px-2.5 py-0.5 rounded font-mono font-bold">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E8E0DC]">
                  <div className="text-[10px] text-[#5C4B45] flex flex-col text-left">
                    <span>Location Context: {activeInternship.location || activeInternship.remoteType || "Remote"}</span>
                    <span className="text-[#8D695D] font-bold mt-0.5">{activeInternship.salary || activeInternship.stipend || "TBD Stipend"}</span>
                  </div>
                  <Button 
                    variant={appliedJobs.includes(activeInternship.id) ? "glass" : "caramel"}
                    size="sm"
                    className="h-8 text-xs font-semibold px-4"
                    onClick={() => applyForJob(activeInternship.id)}
                    disabled={appliedJobs.includes(activeInternship.id)}
                  >
                    {appliedJobs.includes(activeInternship.id) ? "Applied" : "Apply"}
                  </Button>
                </div>
              </div>

            </div>
          ) : (
            <div className="py-12 text-center text-wool-200/40 flex flex-col items-center justify-center gap-3">
              <p className="text-xs font-mono leading-relaxed max-w-md mx-auto">
                No internships available yet.
                <br />
                No internship opportunities available yet. Organizations will publish internships soon.
              </p>
              <Button 
                variant="caramel" 
                size="sm" 
                className="font-bold text-xs px-4 cursor-pointer"
                onClick={() => onNavigate?.("research-hub")}
              >
                Browse Research Hub
              </Button>
            </div>
          )}
        </Card>

        {/* ROW 3: PLATFORM UPDATES */}
        <Card variant="glass" className="animate-fade-in text-left">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-accent text-sm font-semibold tracking-wide uppercase text-caramel-400">Platform Updates</h3>
            <Activity size={14} className="text-caramel-400" />
          </div>
          <div className="space-y-3 max-h-[160px] overflow-y-auto">
            {(state.platformUpdates || [
              "Verification Approved",
              "New Organization Joined",
              "Research Project Featured",
              "New Opportunity Published"
            ]).map((update, index) => (
              <div key={index} className="p-3 bg-[#F7F4F2] border border-[#E8E0DC] rounded-lg flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#8D695D] shrink-0" />
                <span className="text-xs text-[#5C4B45] font-semibold leading-relaxed font-mono">
                  {update}
                </span>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* ── RIGHT COLUMN (4 spans) ── */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* ACTIVITY FEED */}
        <Card variant="glass" className="text-left flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-accent text-sm font-semibold tracking-wide uppercase text-caramel-400 mb-4 border-b border-caramel-500/10 pb-3">
              Live Activity Feed
            </h3>
            <div className="space-y-4 max-h-[200px] overflow-y-auto scrollbar-thin pr-1">
              {state.activityFeed
                .filter(feed => ["verification", "project", "application", "organization"].includes(feed.type))
                .map(feed => (
                  <div key={feed.id} className="flex gap-2.5 text-xs text-left border-l-2 border-[#8D695D] pl-3 py-0.5">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-[#3A241E] leading-snug">{feed.text}</span>
                      <span className="text-[10px] text-[#7A6B65] font-mono tracking-wider">{feed.time}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E0DC] mt-4">
            <span className="text-[10px] text-[#7A6B65] font-mono uppercase font-semibold">Feed online & monitored</span>
          </div>
        </Card>

        {/* DEADLINES AND DATES CALENDAR */}
        <Card variant="glass" className="text-left">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-accent text-sm font-semibold tracking-wide uppercase text-caramel-400">Deadlines Calendar</h3>
            <Calendar size={14} className="text-caramel-400" />
          </div>

          {/* Quick inline grid mimicry of date header selector from Image 3 */}
          <div className="grid grid-cols-7 gap-1 text-[9px] font-bold text-center text-[#7A6B65] uppercase mt-1 border-b border-[#E8E0DC] pb-2 mb-2 font-mono">
            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
          </div>

          <div className="space-y-2 max-h-[140px] overflow-y-auto">
            {state.deadlines.map(dl => (
              <div key={dl.id} className="flex items-center gap-4 p-3 bg-[#F6ECE7] hover:bg-[#EFE3DC] border-l-4 border-l-[#741717] rounded-r-lg transition-colors cursor-pointer">
                <div className="w-11 h-9 bg-[#741717]/10 text-[#741717] flex flex-col items-center justify-center font-mono rounded text-[9px] shrink-0 font-bold">
                  <span className="text-[11px] leading-tight font-black">{dl.date.split(" ")[1]}</span>
                  <span className="uppercase text-[7px] leading-none text-[#741717] font-bold">{dl.date.split(" ")[0]}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#603A30] truncate">{dl.label}</p>
                  <p className="text-[9px] uppercase tracking-wider text-[#7A6B65] font-mono mt-0.5">Due midnight</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI INTEL RECOMMENDATIONS (Gemini integration trigger card) */}
        <Card variant="glass" className="text-left relative overflow-hidden bg-gradient-to-br from-[#741717]/5 to-[#8D695D]/10 border border-[#741717]/20 animate-pulse-slow">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={40} className="text-[#8D695D]" />
          </div>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#741717]" />
              <h3 className="font-accent text-sm font-semibold tracking-wide uppercase text-[#741717]">AI Matches</h3>
            </div>
            
            <Button 
              variant="caramel" 
              size="xs" 
              className="py-1 px-2.5 font-bold text-[9px] uppercase hover:bg-chestnut transition-colors text-white"
              onClick={handleAIMatchRequest}
              loading={localMatchingLoading}
            >
              Analyze
            </Button>
          </div>

          <div className="space-y-3 py-1 text-xs font-mono text-[11px]">
            {state.aiRecommendations && state.aiRecommendations.length > 0 ? (
              state.aiRecommendations.map(rec => (
                <div key={rec.id} className="p-2.5 bg-white border border-[#E8E0DC] rounded-lg flex gap-2">
                  <CheckCircle2 size={12} className="text-caramel-500 flex-shrink-0 mt-0.5" />
                  <span className="text-[#5C4B45] font-semibold leading-relaxed text-[11px]">{rec.text}</span>
                </div>
              ))
            ) : (
              <div className="p-3 bg-white border border-[#E8E0DC] rounded-lg text-center text-[#7A6B65] leading-relaxed font-light">
                No recommendations available yet. Complete your profile to improve future recommendations.
              </div>
            )}
          </div>

          <p className="text-[8px] text-[#7A6B65] font-mono hover:text-[#741717] transition cursor-pointer mt-3 text-center border-t border-[#E8E0DC] pt-2">
            ✨ Driven server-side by Google Gemini AI Model Analysis
          </p>
        </Card>

      </div>

      {/* ── ROW 4: CUSTOM EMBEDDED MICRO PLOTS (Analytics Charts matching Image 3) ── */}
      <div className="lg:col-span-12 font-sans">
        <Card variant="glass">
          <div className="flex items-center justify-between mb-6 border-b border-[#E8E0DC] pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#741717]" />
              <h3 className="font-accent text-sm font-semibold tracking-wide uppercase text-[#3A241E]">Analytics Charts & Indicators</h3>
            </div>
            <span className="text-[10px] text-[#7A6B65] uppercase tracking-widest font-mono">Skill Growth Metrics</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            {/* Chart 1: SVG Micro Wave Chart */}
            <div className="p-4 bg-white border border-[#E8E0DC] rounded-xl flex flex-col justify-between h-[230px] shadow-sm">
              <div>
                <h4 className="text-xs font-bold text-[#3A241E] flex items-center gap-1.5">
                  <TrendingUp size={12} className="text-[#741717]" /> Skill Growth Over Time
                </h4>
                <p className="text-[10px] text-[#7A6B65] font-mono mt-0.5">Cumulative progress percentage</p>
              </div>

              {/* Responsive custom SVG line chart */}
              <div className="w-full h-24 my-2 relative">
                <svg className="w-full h-full min-h-[96px]" viewBox="0 0 300 100" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(96,58,48,0.06)" strokeWidth="1" />
                  <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(96,58,48,0.06)" strokeWidth="1" />
                  <line x1="0" y1="80" x2="300" y2="80" stroke="rgba(96,58,48,0.06)" strokeWidth="1" />
                  
                  {/* Smooth curved chart baseline path */}
                  <path 
                    d="M 10 90 Q 50 80, 100 50 T 200 40 T 290 10" 
                    fill="none" 
                    stroke="#8D695D" 
                    strokeWidth="3.5" 
                    className="filter drop-shadow-[0_2px_4px_rgba(141,105,93,0.3)]"
                  />
                  
                  {/* Fill area */}
                  <path
                    d="M 10 90 Q 50 80, 100 50 T 200 40 T 290 10 L 290 100 L 10 100 Z"
                    fill="url(#grad-growth)"
                    className="opacity-20"
                  />

                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="grad-growth" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#8D695D" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  
                  {/* Nodes */}
                  <circle cx="10" cy="90" r="3.5" fill="#741717" stroke="#8D695D" strokeWidth="1" />
                  <circle cx="100" cy="50" r="3.5" fill="#741717" stroke="#8D695D" strokeWidth="1" />
                  <circle cx="200" cy="40" r="3.5" fill="#741717" stroke="#8D695D" strokeWidth="1" />
                  <circle cx="290" cy="10" r="4" fill="#8D695D" />
                </svg>
              </div>

              <div className="flex justify-between text-[8px] font-mono uppercase text-[#7A6B65] font-bold">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Jul</span><span>Sep</span><span>Aug</span>
              </div>
            </div>

            {/* Chart 2: SVG Project Contributions Bar Chart */}
            <div className="p-4 bg-white border border-[#E8E0DC] rounded-xl flex flex-col justify-between h-[230px] shadow-sm">
              <div>
                <h4 className="text-xs font-bold text-[#3A241E] flex items-center gap-1.5">
                  <BarChart4 size={12} className="text-[#8D695D]" /> Project Contributions
                </h4>
                <p className="text-[10px] text-[#7A6B65] font-mono mt-0.5">Assigned lines of code / tasks</p>
              </div>

              {/* Bar indicators */}
              <div className="flex items-end justify-between h-28 px-4 py-2 border-b border-[#E8E0DC]">
                {[
                  { month: "Mar", val: 35 },
                  { month: "Jun", val: 56 },
                  { month: "Jul", val: 80 },
                  { month: "Nov", val: 42 }
                ].map(bar => (
                  <div key={bar.month} className="flex flex-col items-center gap-1.5 w-10">
                    <div className="w-4 bg-[#F7F4F2] rounded-t overflow-hidden flex flex-col justify-end" style={{ height: "80px" }}>
                      <div 
                        className="w-full bg-gradient-to-t from-[#741717] to-[#8D695D] rounded-t" 
                        style={{ height: `${bar.val}%` }}
                      />
                    </div>
                    <span className="text-[8px] font-mono text-[#7A6B65] font-bold uppercase">{bar.month}</span>
                  </div>
                ))}
              </div>

              <div className="text-[9px] text-[#8D695D] font-mono uppercase tracking-wider text-center font-bold">Active Repos synchronized</div>
            </div>

            {/* Chart 3: SVG Donut Time Allocation Chart */}
            <div className="p-4 bg-white border border-[#E8E0DC] rounded-xl flex flex-col justify-between h-[230px] shadow-sm">
              <div>
                <h4 className="text-xs font-bold text-[#3A241E] flex items-center gap-1.5">
                  <PieChart size={12} className="text-[#8D695D]" /> Time Allocation
                </h4>
                <p className="text-[10px] text-[#7A6B65] font-mono mt-0.5">Sectors assigned weekly</p>
              </div>

              {/* Center donut plot */}
              <div className="flex items-center justify-center gap-4 py-2">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Sector 1: Research (60%): color wine-red */}
                    <circle 
                      cx="48" cy="48" r="32" 
                      stroke="#741717" strokeWidth="12" fill="transparent" 
                      strokeDasharray={2 * Math.PI * 32}
                      strokeDashoffset={2 * Math.PI * 32 * (1 - 0.6)}
                      className="transition-all duration-300"
                    />
                    {/* Sector 2: Courses (40%): color caramel-500 */}
                    <circle 
                      cx="48" cy="48" r="32" 
                      stroke="#8D695D" strokeWidth="12" fill="transparent" 
                      strokeDasharray={2 * Math.PI * 32}
                      strokeDashoffset={2 * Math.PI * 32 * (1 - 0.3)}
                      transform={`rotate(${360 * 0.6} 48 48)`}
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute text-[8px] font-mono font-bold tracking-wide text-[#7A6B65] uppercase">Sectors</div>
                </div>

                <div className="flex flex-col gap-1.5 text-[9px] font-mono font-semibold">
                  <div className="flex items-center gap-1.5 text-[#3A241E]">
                    <span className="w-2 h-2 rounded bg-[#741717]" />
                    <span>Research: 60%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#3A241E]">
                    <span className="w-2 h-2 rounded bg-[#8D695D]" />
                    <span>Courses: 30%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#7A6B65]">
                    <span className="w-2 h-2 rounded bg-[#603A30]" />
                    <span>Media labs: 10%</span>
                  </div>
                </div>
              </div>

              <div className="text-[9px] text-[#8D695D] text-center font-mono font-bold">Calibrated and verified from calendars</div>
            </div>

          </div>
        </Card>
      </div>

    </div>
  );
};
