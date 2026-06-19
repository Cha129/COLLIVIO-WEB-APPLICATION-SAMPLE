import React, { useState } from "react";
import { State, Problem } from "../../types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { 
  Lightbulb, Search, Filter, Calendar, MapPin, 
  ChevronRight, BrainCircuit, Plus, CheckCircle, 
  BookOpen, HelpCircle, AlertCircle, Building2
} from "lucide-react";

interface ProblemHubProps {
  state: State;
  userRole: string;
  userId: string;
  onUpdateState: (batch: Partial<State>) => void;
  onStartSolutionProject?: (problem: Problem) => void;
}

export const ProblemHub: React.FC<ProblemHubProps> = ({ 
  state, 
  userRole, 
  userId, 
  onUpdateState,
  onStartSolutionProject
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const domains = ["All", "AI", "Healthcare", "Climate", "Business", "Education", "Cybersecurity", "Robotics", "Engineering"];

  const problemsList: Problem[] = state.problems || [];

  // Filter problems
  const filteredProblems = problemsList.filter(prob => {
    const matchesDomain = selectedDomain === "All" || prob.domain.toLowerCase() === selectedDomain.toLowerCase();
    const matchesSearch = !searchQuery || 
      prob.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      prob.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prob.problemStatement.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12 select-none text-left font-sans">
      
      {/* ── LEFT COLUMN: FILTERS & METADATA (3 spans) ── */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        <Card variant="glass" className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-caramel-500/10 pb-3">
            <Lightbulb size={15} className="text-caramel-400" />
            <span className="font-accent text-xs font-bold leading-none tracking-wider uppercase text-caramel-400">Problem Domains</span>
          </div>

          <div className="flex flex-col gap-1.5 text-xs text-wool-200">
            {domains.map(dom => (
              <button 
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                className={`p-2.5 rounded-lg border text-left flex items-center justify-between cursor-pointer transition ${
                  selectedDomain === dom 
                    ? "bg-wine-red/50 border-caramel-500/50 text-wool-100 font-bold" 
                    : "bg-burgundy-950 border-caramel-500/5 text-wool-200/55 hover:border-caramel-500/20"
                }`}
              >
                <span>{dom}</span>
                {dom === "All" ? (
                  <span className="text-[10px] bg-burgundy-900 border border-caramel-500/5 text-wool-200/40 px-1.5 rounded font-mono">
                    {problemsList.length}
                  </span>
                ) : (
                  <span className="text-[10px] bg-burgundy-900 border border-caramel-500/5 text-wool-200/40 px-1.5 rounded font-mono">
                    {problemsList.filter(p => p.domain.toLowerCase() === dom.toLowerCase()).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Dynamic Context Card describing the Ecosystem Flow */}
        <Card variant="glass" className="p-5">
          <h4 className="text-[10px] uppercase font-mono font-bold tracking-widest text-caramel-400 mb-2">Ecosystem Workflow</h4>
          <ol className="text-xs text-wool-200/70 space-y-3.5 list-decimal list-inside font-light leading-relaxed">
            <li>
              <span className="font-semibold text-wool">Organizations Post Problem</span>: Challenges based on real operational friction.
            </li>
            <li>
              <span className="font-semibold text-wool">Students Discover & Solve</span>: High schoolers create a solution-linked Research Project.
            </li>
            <li>
              <span className="font-semibold text-wool">Form Team & Collaborate</span>: Recruit peer scholars to join the milestone.
            </li>
            <li>
              <span className="font-semibold text-wool">Publish to Media Lab</span>: Results are showcaseable globally for feedback.
            </li>
          </ol>
        </Card>
      </div>

      {/* ── RIGHT COLUMN: PROBLEMS CONTENT & DISCOVERY (9 spans) ── */}
      <div className="lg:col-span-9 flex flex-col gap-6">
        
        {/* Search Header panel */}
        <Card variant="glass" className="p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-display font-bold text-lg text-wool-100 uppercase tracking-wide">
                Corporate Challenge & Problem Hub
              </h2>
              <p className="text-xs text-wool-200/65 font-light mt-1">
                Solve open-ended industry challenges. Solve voluntarily with peer researchers for elite portofolio indexation.
              </p>
            </div>

            <div className="relative w-full sm:w-64 shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-wool-200/30" />
              <input 
                type="text" 
                placeholder="Search challenges & outcomes..." 
                className="w-full bg-burgundy-950 border border-caramel-500/10 rounded-lg pl-9 pr-3 py-2 text-xs text-wool-100 placeholder-wool-200/30 focus:outline-none focus:border-caramel-500/30 transition shadow-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Dynamic Problem Listings */}
        <div className="space-y-4">
          {filteredProblems.map(prob => (
            <Card key={prob.id} variant="glass" className="p-6 border border-caramel-500/10 hover:border-caramel-500/20 transition duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-caramel-500/10 pb-3 mb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-caramel-400 bg-caramel-500/10 px-2 py-0.5 rounded">
                      {prob.domain}
                    </span>
                    <span className="text-[10px] font-mono font-semibold tracking-wider text-wool-200/40 bg-burgundy-950/60 px-2 py-0.5 rounded">
                      Difficulty: {prob.difficulty}
                    </span>
                    <span className="text-[10px] font-semibold text-wool-200/60 flex items-center gap-1">
                      <Building2 size={11} className="text-caramel-500/50" /> Posted by: <span className="text-caramel-300 font-bold">{prob.organizationName || "Sponsoring Partner"}</span>
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-wool-100 mt-2 uppercase tracking-wide">
                    {prob.title}
                  </h3>
                </div>

                {prob.deadline && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-caramel-400 font-mono bg-caramel-500/5 px-2.5 py-1 rounded">
                    <Calendar size={11} />
                    <span>Target: {new Date(prob.deadline).toLocaleDateString(undefined, {month: "short", day: "numeric"})}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
                <div>
                  <h4 className="text-[9px] uppercase font-mono tracking-widest text-wool-200/30">Industry Challenge Description</h4>
                  <p className="text-xs text-wool-200/75 font-light mt-1.5 whitespace-pre-wrap">{prob.description}</p>
                </div>
                <div>
                  <h4 className="text-[9px] uppercase font-mono tracking-widest text-wool-200/30">Explicit Problem Statement</h4>
                  <p className="text-xs text-wool-100 font-semibold bg-burgundy-950/50 p-2.5 rounded-lg border border-caramel-500/5 mt-1.5">{prob.problemStatement}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-caramel-500/5 leading-relaxed">
                <div>
                  <h4 className="text-[9px] uppercase font-mono tracking-widest text-wool-200/30">Recommended Skills Set</h4>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {prob.skillsRecommended?.map(skill => (
                      <span key={skill} className="text-[9px] font-mono font-medium tracking-wide bg-wine-red/20 border border-wine-red-light/10 text-caramel-300 px-2 py-0.5 rounded">
                        #{skill}
                      </span>
                    )) || <span className="text-xs text-wool-200/50">None specified</span>}
                  </div>
                </div>
                <div>
                  <h4 className="text-[9px] uppercase font-mono tracking-widest text-wool-200/30">Expected Outcome & Deliverables</h4>
                  <p className="text-xs text-wool-200/80 mt-1 font-light">{prob.expectedOutcome}</p>
                </div>
              </div>

              {prob.resources && (
                <div className="mt-4 p-3 bg-burgundy-950/40 rounded-lg border border-caramel-500/5 text-xs text-wool-200/75 leading-relaxed">
                  <span className="font-mono text-[9px] uppercase font-bold tracking-widest text-caramel-400 block mb-1">Challenge Resources & Sandbox</span>
                  <p className="font-mono text-[10px] font-light text-wool-200">{prob.resources}</p>
                </div>
              )}

              {userRole === "student" && onStartSolutionProject && (
                <div className="flex justify-end mt-4 pt-3 border-t border-caramel-500/5">
                  <Button 
                    variant="caramel"
                    size="sm"
                    className="flex items-center gap-1 text-xs font-bold px-4 py-2 shrink-0 cursor-pointer"
                    onClick={() => onStartSolutionProject(prob)}
                  >
                    <Plus size={13} /> Link New Research Project
                  </Button>
                </div>
              )}
            </Card>
          ))}

          {/* Empty Space State */}
          {filteredProblems.length === 0 && (
            <Card variant="glass" className="py-16 text-center shadow flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-burgundy-950/50 flex items-center justify-center border border-caramel-500/10 text-wool-200/20">
                <Lightbulb size={22} />
              </div>
              <div>
                <p className="text-xs text-wool-200 font-medium font-mono uppercase tracking-widest">Problem Hub Empty</p>
                <p className="text-[11px] text-wool-200/40 font-mono mt-1">
                  No real-world problems have been posted yet.
                  <br />
                  No industry challenges available yet.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

    </div>
  );
};
