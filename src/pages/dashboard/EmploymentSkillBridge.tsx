import React, { useState } from "react";
import { State } from "../../types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { 
  Trophy, Clock, MapPin, Award, BookOpen, Star, Sparkles, 
  Map, Activity, AlignLeft, ShieldCheck, CheckSquare, Briefcase, Calendar 
} from "lucide-react";

interface EmploymentSkillBridgeProps {
  state: State;
  onUpdateState: (batch: Partial<State>) => void;
}

export const EmploymentSkillBridge: React.FC<EmploymentSkillBridgeProps> = ({
  state,
  onUpdateState
}) => {
  const [activeStepCareer, setActiveStepCareer] = useState("Full Stack Developer");

  // Toggle tasks status
  const handleToggleTaskStatus = (id: string) => {
    const updatedTasks = state.skillRoadmap.tasks.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === "idle" ? "inProgress" : t.status === "inProgress" ? "submitted" : "idle";
        return { ...t, status: nextStatus as any };
      }
      return t;
    });

    onUpdateState({
      skillRoadmap: {
        ...state.skillRoadmap,
        tasks: updatedTasks
      }
    });
  };

  const handleStartModule = (modId: string) => {
    const updatedMods = state.skillRoadmap.modules.map(m => {
      if (m.id === modId) {
        return { ...m, progress: Math.min(100, m.progress + 15) };
      }
      return m;
    });
    onUpdateState({
      skillRoadmap: {
        ...state.skillRoadmap,
        modules: updatedMods
      }
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-12 selection:bg-caramel-500 selection:text-burgundy-950 text-left">
      
      {/* ── LEFT/CENTER MASTER WORKSPACE CANVAS (8 spans, Image 6 left) ── */}
      <div className="xl:col-span-8 flex flex-col gap-6">
        
        {/* LEARNING ROADMAP STEPPER COMPONENT */}
        <Card variant="glass">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-caramel-500/10 pb-4 mb-4">
            <div>
              <h3 className="font-accent text-sm font-semibold tracking-wide uppercase text-caramel-400">Learning Roadmap Interactive Pipeline</h3>
              <p className="text-[10px] text-wool-200/40 font-mono mt-0.5">AI-Recommended Path: <span className="text-caramel-400 font-bold">{state.skillRoadmap.careerPath}</span></p>
            </div>
            
            <div className="flex gap-2 text-[10px]">
              <span className="px-2 py-0.5 rounded bg-caramel-500 text-burgundy-950 font-mono font-bold">Caramel</span>
              <span className="px-2 py-0.5 rounded bg-wine-red text-wool-100 font-mono font-bold">Red Wine</span>
            </div>
          </div>

          {/* Stepper nodes timeline list modeled exactly based on Image 6 */}
          <div className="py-6 px-4 flex items-center justify-between relative max-w-2xl mx-auto overflow-x-auto gap-4">
            {/* Connecting baseline line */}
            <div className="absolute top-[37px] left-8 right-8 h-[2.5px] bg-gradient-to-r from-caramel-500 via-wine-red to-burgundy-800 z-0" />
            
            {state.skillRoadmap.nodes.map((node, i) => (
              <div key={node.id} className="flex flex-col items-center gap-2 relative z-10 shrink-0">
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold font-mono text-xs shadow-lg transition-all ${
                    node.completed 
                      ? "bg-caramel-500 text-burgundy-950 ring-4 ring-caramel-500/15" 
                      : i === 3 
                        ? "bg-wine-red text-wool-100 border-2 border-caramel-400 ring-2 ring-wine-red/50 animate-pulse" 
                        : "bg-burgundy-850 text-wool-200/40 border border-caramel-500/5 hover:border-caramel-500/30"
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-[10px] font-semibold text-wool-100 max-w-[70px] text-center leading-tight truncate">{node.label}</span>
              </div>
            ))}
          </div>

          {/* UPCOMING MODULES SUB-GRID */}
          <div className="mt-4 pt-4 border-t border-caramel-500/5">
            <h4 className="text-xs uppercase font-mono font-bold text-wool-200/45 tracking-widest mb-3.5">Upcoming Modules:</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {state.skillRoadmap.modules.map(mod => (
                <div key={mod.id} className="p-3 bg-[#52130C]/80 border border-caramel/5 hover:border-red-wine/20 rounded-xl transition flex flex-col justify-between h-[110px]">
                  <div>
                    <div className="flex justify-between items-center text-[10px] pb-1 border-b border-caramel/5 mb-1.5 shrink-0">
                      <span className="font-bold text-wool truncate flex-1 pr-4">{mod.name}</span>
                      <span className="text-caramel font-mono font-bold leading-none">{mod.progress}%</span>
                    </div>
                    {/* Linear indicators progress slider */}
                    <div className="w-full h-1 bg-chestnut rounded-full mb-1">
                      <div className="h-1 bg-caramel rounded-full transition-all" style={{ width: `${mod.progress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-wool/30 font-mono pt-1.5 border-t border-caramel/5 shrink-0">
                    <span>Path: {mod.pathTheme}</span>
                    <button 
                      onClick={() => handleStartModule(mod.id)}
                      className="px-2 py-0.5 bg-wine-red hover:bg-wine-red-light text-wool-100 font-bold rounded cursor-pointer transition text-[9px]"
                      disabled={mod.progress === 100}
                    >
                      {mod.progress === 100 ? "Done" : mod.progress > 0 ? "Resume" : "Start"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ORGANIZATION LEARNING PROGRAMS & COURSES */}
        <Card variant="glass" className="text-left">
          <div className="flex justify-between items-center border-b border-caramel-500/10 pb-3 mb-4">
            <div>
              <h3 className="font-accent text-sm font-semibold tracking-wide uppercase text-caramel-400">
                Organization Learning Programs & Courses
              </h3>
              <p className="text-[10px] text-wool-200/40 font-mono mt-0.5">
                Vetted workshops, bootcamps and certifications hosted directly by corporate partners
              </p>
            </div>
            <BookOpen size={15} className="text-caramel-400" />
          </div>

          <div className="space-y-4">
            {state.courses && state.courses.filter(c => c.status === "published").length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.courses.filter(c => c.status === "published").map(c => (
                  <div key={c.id} className="p-4 bg-burgundy-950/70 border border-caramel-500/10 rounded-xl flex flex-col justify-between hover:border-caramel-500/30 transition duration-300">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-[8px] font-mono uppercase bg-caramel-500/10 text-caramel-300 font-bold px-2 py-0.5 rounded">
                          {c.difficulty}
                        </span>
                        <span className="text-[10px] font-mono text-wool-200/40">{c.duration || "Self-paced"}</span>
                      </div>
                      
                      <h4 className="font-bold text-wool-100 text-sm tracking-wide line-clamp-1">{c.title}</h4>
                      <p className="text-xs text-wool-200/75 font-light leading-relaxed mt-1 line-clamp-2">
                        {c.description}
                      </p>
                      
                      <p className="text-[10px] text-wool-200/60 mt-1.5 font-light">
                        <span className="font-semibold text-caramel-400">By:</span> {c.organizationName || "Sponsor Institution"}
                      </p>

                      {c.eligibility && (
                        <p className="text-[9px] text-[#8D695D] font-mono leading-relaxed mt-1">
                          <span className="font-bold uppercase">Eligibility:</span> {c.eligibility}
                        </p>
                      )}

                      {c.skillsCovered && c.skillsCovered.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {c.skillsCovered.map(skill => (
                            <span key={skill} className="text-[8px] bg-wine-red/25 border border-wine-red-light/15 text-caramel-300 px-1.5 py-0.2 rounded font-mono">
                              #{skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {c.modules && c.modules.length > 0 && (
                        <div className="mt-3 text-[10px] font-light text-wool-200/50 bg-burgundy-950/40 p-2 rounded border border-caramel-500/5">
                          <span className="font-mono text-[8px] uppercase tracking-wide font-bold text-caramel-400 block mb-1">Weekly Modules Syllabus</span>
                          <p className="font-mono text-[9px] truncate">{c.modules.join(" → ")}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-caramel-500/5 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-wool-200/30">
                        {c.certificate ? "★ Verified Certification Included" : "Audit Only Mode"}
                      </span>
                      <Button 
                        variant="caramel" 
                        size="xs" 
                        className="py-1 px-3 text-[10px] font-bold cursor-pointer"
                        onClick={() => alert(`Enrolling inside ${c.title}... Check your workspace chat feed for core guidelines!`)}
                      >
                        Enroll Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 border border-dashed border-caramel-500/10 rounded-xl text-center flex flex-col items-center justify-center gap-2">
                <BookOpen size={20} className="text-wool-200/20" />
                <p className="text-xs text-wool-200/50 max-w-md mx-auto font-mono">
                  No courses available yet.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* PERFORMANCE ANALYTICS INDICATORS (Image 6 bottom left) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Performance Analytics linear wave plot widget */}
          <Card variant="glass" className="p-5 flex flex-col justify-between h-[280px]">
            <div>
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-xs font-semibold text-wool-100 flex items-center gap-1.5">
                  <Activity size={12} className="text-caramel-400" /> Performance Analytics
                </h4>
                <div className="flex gap-2 text-[8px] font-mono leading-none">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#741717] rounded" /> Red Wine</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#8D695D] rounded" /> Caramel</span>
                </div>
              </div>
              <p className="text-[10px] text-wool-200/40 font-mono">Weekly Progress & Engagement matrix</p>
            </div>

            {/* Custom high contrast SVG wave indicators line chart */}
            <div className="w-full h-32 my-2 relative">
              <svg className="w-full h-full min-h-[128px]" viewBox="0 0 300 100" preserveAspectRatio="none">
                {/* Horizontal mesh helper lines */}
                <line x1="0" y1="25" x2="300" y2="25" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                <line x1="0" y1="75" x2="300" y2="75" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                
                {/* Custom dual wave metrics pathways */}
                <path 
                  d="M 10 90 Q 50 40, 100 80 T 200 20 T 290 50" 
                  fill="none" 
                  stroke="#741717" 
                  strokeWidth="2.5" 
                  className="opacity-70"
                />
                <path 
                  d="M 10 80 Q 50 63, 100 35 T 200 70 T 290 15" 
                  fill="none" 
                  stroke="#8D695D" 
                  strokeWidth="2.5" 
                />

                <circle cx="290" cy="50" r="3" fill="#741717" />
                <circle cx="290" cy="15" r="3.5" fill="#8D695D" />
              </svg>
            </div>

            <div className="flex justify-between text-[8px] font-mono text-wool-200/30 uppercase pt-2">
              <span>Sun</span><span>Mo</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>

            {/* Icons indicators row */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-wool-200/80 border-t border-caramel-500/5 pt-3">
              <div className="flex flex-col">
                <span className="font-bold text-caramel-400 font-mono">12.5 hrs</span>
                <span className="text-[7.5px] text-wool-200/30 font-mono uppercase">Hours Spent</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-caramel-400 font-mono">92/100</span>
                <span className="text-[7.5px] text-wool-200/30 font-mono uppercase">Gulz Score Avg</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-caramel-400 font-mono">82%</span>
                <span className="text-[7.5px] text-wool-200/30 font-mono uppercase">Completion Rate</span>
              </div>
            </div>
          </Card>

          {/* PORTFOLIO CERTIFICATE LOGOS SHOWCASE (Image 6 bottom right) */}
          <Card variant="glass" className="p-5 flex flex-col justify-between h-[280px]">
            <div>
              <h4 className="text-xs font-semibold text-wool-100 flex items-center gap-1.5">
                <Award size={12} className="text-caramel-400" /> Certifications Showcase
              </h4>
              <p className="text-[10px] text-wool-200/40 font-mono mt-0.5">Verified certificates & seals</p>
            </div>

            {/* Badges icons grids */}
            <div className="grid grid-cols-2 gap-3 py-2 flex-1 max-h-[140px] overflow-y-auto">
              {[
                { name: "Advanced Python Path", code: "C001", color: "from-wine-red to-[#4e1117]" },
                { name: "Data Science Specialization", code: "C002", color: "from-[#2e1511] to-[#14070a]" },
                { name: "UX Design Principles Certificate", code: "C003", color: "from-[#42161f] to-[#14070a]" },
                { name: "ML telemetry seal", code: "S004", color: "from-caramel-500/10 to-[#14070a]" }
              ].map(badge => (
                <div key={badge.code} className={`p-2.5 bg-gradient-to-br ${badge.color} border border-caramel-500/10 rounded-lg flex gap-2 items-center`}>
                  <div className="w-8 h-8 rounded bg-burgundy-950 flex items-center justify-center font-bold text-sm shrink-0 border border-caramel-500/10 text-caramel-400">
                    🏅
                  </div>
                  <div className="min-w-0 text-left leading-tight">
                    <p className="font-semibold text-wool-100 text-[10px] truncate">{badge.name}</p>
                    <span className="text-[8px] text-wool-200/30 font-mono tracking-wider font-bold">Verified: {badge.code}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-caramel-500/5 mt-2">
              <span className="text-[8px] text-wool-200/40 font-mono uppercase tracking-widest block text-center leading-none">All badges synchronized on-chain</span>
            </div>
          </Card>

        </div>

      </div>

      {/* ── RIGHT BAR PANEL: TASKS ASSIGNMENTS, RATINGS & OPPORTUNITIES (4 spans, Image 6 right) ── */}
      <div className="xl:col-span-4 flex flex-col gap-6">
        
        {/* TASK ASSIGNMENTS PANEL */}
        <Card variant="glass" className="text-left flex flex-col justify-between p-5 min-h-[250px]">
          <div>
            <h3 className="font-accent text-sm font-semibold tracking-wide uppercase text-caramel-400 border-b border-caramel-500/10 pb-3 mb-3">
              Task Assignments
            </h3>

            <div className="space-y-3.5 max-h-[170px] overflow-y-auto pr-1 text-xs">
              {state.skillRoadmap.tasks.map(task => (
                <div key={task.id} className="p-3 bg-[#52130C]/80 border border-caramel/5 rounded-lg flex items-center justify-between gap-3 select-none">
                  <div className="min-w-0 flex gap-2.5 items-start">
                    <CheckSquare size={13} className={`shrink-0 mt-0.5 ${task.status === "submitted" ? "text-caramel-400" : "text-wool-200/35"}`} />
                    <div className="min-w-0">
                      <p className="font-semibold text-wool-100 truncate">{task.text}</p>
                      <span className="text-[8px] uppercase tracking-wider text-wool-200/40 font-mono mt-0.5">Due: {task.due}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleToggleTaskStatus(task.id)}
                    className={`px-3 py-1 font-bold text-[9px] uppercase tracking-wider rounded transition shrink-0 ${
                      task.status === "submitted" 
                        ? "bg-caramel-500/15 text-caramel-400 border border-caramel-500/10" 
                        : task.status === "inProgress" 
                          ? "bg-wine-red text-wool-100 shadow" 
                          : "bg-burgundy-900 text-wool-200/40 border border-caramel-500/5 hover:border-caramel-500/10"
                    }`}
                  >
                    {task.status === "submitted" ? "Verified" : task.status === "inProgress" ? "Finish" : "Start"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-caramel/5 mt-4">
            <span className="text-[9px] text-wool/30 font-mono font-semibold uppercase block text-center leading-none">Sync with task pipeline</span>
          </div>
        </Card>

      </div>

    </div>
  );
};
