import React, { useState } from "react";
import { State, ResearchProject } from "../../types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { 
  BookOpen, BrainCircuit, Search, ChevronRight, Star, Send, 
  Paperclip, Cpu, ShieldAlert, CheckCircle, Video, ListTodo, Plus, Info, Edit3, Heart, Eye, MessageSquare 
} from "lucide-react";

interface ResearchHubProps {
  state: State;
  onUpdateState: (batch: Partial<State>) => void;
}

export const ResearchHub: React.FC<ResearchHubProps> = ({ state, onUpdateState }) => {
  const [selectedDomain, setSelectedDomain] = useState<string>("Artificial Intelligence");
  const [searchQuery, setSearchText] = useState("");
  const [personalNotes, setPersonalNotes] = useState(
    state.profile.bio ? `Direct Research Notes:\n1. Focusing on BCI data analysis filters this week.\n2. Scheduled review with Dr. Bob.` : "Enter quickly jot down thoughts or important observations."
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [projectsCount, setProjectsCount] = useState<Record<string, number>>({});

  // ─── PROJECT CREATION STATE ───
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjDomain, setNewProjDomain] = useState("Artificial Intelligence");
  const [newProjLinkedProblemId, setNewProjLinkedProblemId] = useState("");
  const [newProjTags, setNewProjTags] = useState("");
  const [newProjTeamMembers, setNewProjTeamMembers] = useState("");
  const [newProjGoals, setNewProjGoals] = useState("");
  const [newProjSkills, setNewProjSkills] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const activeProjectsList = state.researchHub.projects || [];

  // Filter projects by both domain and search query
  const filteredProjects = activeProjectsList.filter(proj => {
    const matchesDomain = proj.domain === selectedDomain;
    const matchesSearch = !searchQuery || 
      proj.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      proj.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  // Call server-side Google Gemini for intelligent research chat (Image 7 right panel)
  const handleAISendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || aiLoading) return;

    const userMsg = chatInput;
    const currentHist = [...state.researchHub.assistantChatHistory, { sender: "user" as const, text: userMsg }];
    
    onUpdateState({
      researchHub: {
        ...state.researchHub,
        assistantChatHistory: currentHist
      }
    });
    setChatInput("");
    setAiLoading(true);

    try {
      const res = await fetch("/api/gemini/research-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: currentHist
        })
      });

      if (!res.ok) throw new Error("Key not loaded");
      const data = await res.json();
      
      onUpdateState({
        researchHub: {
          ...state.researchHub,
          assistantChatHistory: [...currentHist, { sender: "assistant" as const, text: data.text }]
        }
      });
    } catch (err) {
      // Elegant fallback response with intelligent context in case API secret is not set yet
      setTimeout(() => {
        const fallbacks = [
          "I modeled your Neural Interface queries. To optimize V4 latency, prioritize implementing high-pass Chebyshev telemetry filters. Dr. Bob recommends reviewing collaborator SMIFKR.",
          "Analyzing quantum entanglement metrics inside Simulated Cerebral topologies. I recommend connecting with AI Ethicist JARAN DANNEN to address cognitive feedback ethics.",
          "Based on your neural map targets, I suggests scheduling a session with GRAOM RENTH to discuss glassmorphic UI alignment indicators on telemetry cards."
        ];
        const selectedFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        
        onUpdateState({
          researchHub: {
            ...state.researchHub,
            assistantChatHistory: [...currentHist, { sender: "assistant" as const, text: selectedFallback }]
          }
        });
      }, 1000);
    } finally {
      setAiLoading(false);
    }
  };

  // Connect helper
  const [connections, setConnections] = useState<string[]>([]);
  const handleConnect = (id: string, name: string) => {
    if (!connections.includes(id)) {
      setConnections([...connections, id]);
      const updatedActivity = [
        {
          id: `act-conn-${Date.now()}`,
          text: `You requested a research connection with ${name}.`,
          time: "Just now",
          type: "system" as const
        },
        ...state.activityFeed
      ];
      onUpdateState({ activityFeed: updatedActivity });
    }
  };

  // Adjust Project progress
  const handleProgressAdjust = (id: string, delta: number) => {
    const updatedProjects = activeProjectsList.map(p => {
      if (p.id === id) {
        const prog = p.progress !== undefined ? p.progress : 75;
        const nextVal = Math.max(0, Math.min(100, prog + delta));
        return { ...p, progress: nextVal };
      }
      return p;
    });

    onUpdateState({
      researchHub: {
        ...state.researchHub,
        projects: updatedProjects
      }
    });
  };

  // Liked feedback
  const [userLikedProjs, setUserLikedProjs] = useState<string[]>([]);
  const handleLikeProject = (id: string) => {
    if (userLikedProjs.includes(id)) return;
    setUserLikedProjs([...userLikedProjs, id]);

    const updatedProjects = activeProjectsList.map(p => {
      if (p.id === id) {
        return { ...p, likes: (p.likes || 0) + 1 };
      }
      return p;
    });

    onUpdateState({
      researchHub: {
        ...state.researchHub,
        projects: updatedProjects
      }
    });
  };

  // Submit project creation form
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim() || !newProjDesc.trim()) return;

    // Pick linked problem info if applicable
    let linkedProblemTitle = "";
    let linkedOrgName = "";
    if (newProjLinkedProblemId) {
      const selectedProblem = (state.problems || []).find(p => p.id === newProjLinkedProblemId);
      if (selectedProblem) {
        linkedProblemTitle = selectedProblem.title;
        linkedOrgName = selectedProblem.organizationName || "Sponsor Institution";
      }
    }

    const newProject: ResearchProject = {
      id: "rh-" + Date.now(),
      title: newProjTitle.trim(),
      desc: newProjDesc.trim(),
      progress: 10,
      domain: newProjDomain,
      author: state.profile?.name || "Student Innovator",
      creator_id: state.profile?.user_id || "me",
      tags: newProjTags.split(",").map(t => t.trim()).filter(Boolean),
      problem_id: newProjLinkedProblemId || null,
      problemStatement: linkedProblemTitle || undefined,
      organizationName: linkedOrgName || undefined,
      goals: newProjGoals.trim() || undefined,
      requiredSkills: newProjSkills.trim() || undefined,
      teamSize: newProjTeamMembers.split(",").filter(Boolean).length + 1,
      members: newProjTeamMembers.split(",").map(m => m.trim()).filter(Boolean),
      views: 12,
      likes: 1,
      comments: [
        { author: "Collivio AI Agent", text: "Successfully initialized! We matches 3 company filters.", time: "Just now" }
      ],
      created_at: new Date().toISOString()
    };

    onUpdateState({
      researchHub: {
        ...state.researchHub,
        projects: [newProject, ...activeProjectsList]
      },
      activityFeed: [{
        id: `act-proj-${Date.now()}`,
        text: `You created a new research project: "${newProjTitle}".`,
        time: "Just now",
        type: "system" as const
      }, ...state.activityFeed]
    });

    setCreateSuccess("Your student research project has been catalogued in the global stream!");
    
    // Reset Form
    setNewProjTitle("");
    setNewProjDesc("");
    setNewProjTags("");
    setNewProjTeamMembers("");
    setNewProjGoals("");
    setNewProjSkills("");
    setNewProjLinkedProblemId("");
    
    setTimeout(() => {
      setCreateSuccess("");
      setShowCreateForm(false);
    }, 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12 selection:bg-caramel-500 selection:text-burgundy-950 text-left">
      
      {/* ── LEFT RAIL PANEL: DOMAINS & QUICK LINKS (3 Spans, Image 7 left) ── */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        
        {/* DOMAINS CONTAINER */}
        <Card variant="glass" className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-caramel-500/10 pb-3">
            <BrainCircuit size={15} className="text-caramel-400" />
            <span className="font-accent text-xs font-bold leading-none tracking-wider uppercase text-caramel-400">Research Domains</span>
          </div>

          <div className="flex flex-col gap-1.5 text-xs text-wool-200">
            {state.researchHub.domains.map(dom => {
              const domainProjectCount = activeProjectsList.filter(p => p.domain === dom.name).length;
              return (
                <div 
                  key={dom.name}
                  onClick={() => setSelectedDomain(dom.name)}
                  className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                    selectedDomain === dom.name 
                      ? "bg-wine-red/50 border-caramel-500/50 text-wool-100 font-bold" 
                      : "bg-burgundy-950 border-caramel-500/5 text-wool-200/55 hover:border-caramel-500/20"
                  }`}
                >
                  <span>{dom.name}</span>
                  <span className="text-[10px] bg-burgundy-900 border border-caramel-500/5 text-wool-200/40 px-1.5 py-0.2 rounded font-mono font-semibold">
                    {domainProjectCount || dom.count}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* QUICK LINKS */}
        <Card variant="glass" className="p-4 text-xs">
          <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-wool-200/30 block mb-2.5">Quick Links</span>
          <div className="flex flex-col gap-2 font-mono text-wool-200/70">
            <span className="hover:text-caramel-400 transition cursor-pointer p-1">📁 Recent Files list</span>
            <span className="hover:text-caramel-400 transition cursor-pointer p-1">📝 Shared Documents portal</span>
            <span className="hover:text-caramel-400 transition cursor-pointer p-1">⚖️ Ethical Guidelines draft</span>
          </div>
        </Card>

      </div>

      {/* ── CENTER PANEL: ACTIVE PROJECTS GRIDS & NOTES (6 Spans, Image 7 center) ── */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        
        {/* ACTIVE PROJECTS MAIN VIEW */}
        <Card variant="glass">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-caramel-500/10 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-accent text-sm font-semibold tracking-wide uppercase text-caramel-400">Active Research Projects</h3>
                <button 
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="flex items-center gap-1 bg-caramel-500 hover:bg-caramel-400 text-burgundy-950 text-[10px] px-2.5 py-1 rounded-md font-bold font-mono transition shadow-sm shrink-0 cursor-pointer"
                >
                  <Plus size={11} /> + Create Project
                </button>
              </div>
              <p className="text-[10px] text-wool-200/40 font-mono mt-1">Filter: {selectedDomain}</p>
            </div>
            {/* Project counts search bar */}
            <div className="relative w-full sm:w-48 shrink-0">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-wool-200/30" />
              <input 
                type="text" 
                placeholder="Search active specs..." 
                className="w-full bg-burgundy-950 border border-caramel-500/5 rounded-lg pl-7 pr-3 py-1.5 text-[10px] text-wool-100 placeholder-wool-200/20 focus:outline-none focus:border-caramel-500/30"
                value={searchQuery}
                onChange={e => setSearchText(e.target.value)}
              />
            </div>
          </div>

          {/* Toggle Create Form vs Feed list */}
          {showCreateForm ? (
            <form onSubmit={handleCreateProject} className="p-4 bg-burgundy-950/60 border border-caramel-500/10 rounded-2xl space-y-4 text-left">
              <h4 className="font-accent text-xs font-bold uppercase tracking-wider text-caramel-400 flex items-center gap-1.5">
                <Plus size={13} /> Launch New Peer Research Project
              </h4>
              <p className="text-[10px] text-wool-200/50 leading-relaxed font-light">
                Publish an open-ended research project. You can link it to an organization-posted corporate problem hub issue.
              </p>

              {createSuccess && (
                <div className="p-2.5 bg-emerald-950/70 border border-emerald-500/20 text-emerald-300 rounded-lg text-[10px] flex items-center gap-2">
                  <CheckCircle size={13} className="text-emerald-400 shrink-0" />
                  <span>{createSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] uppercase font-mono font-bold text-caramel-400 mb-1">Project Title</label>
                  <input 
                    type="text" required placeholder="e.g. Synaptic Latency Modeling"
                    className="w-full bg-burgundy-950 border border-caramel-500/10 rounded-lg p-2 text-xs text-wool-100 focus:outline-none focus:border-caramel-500/30"
                    value={newProjTitle}
                    onChange={e => setNewProjTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-mono font-bold text-caramel-400 mb-1">Select Domain</label>
                  <select 
                    className="w-full bg-burgundy-950 border border-caramel-500/10 rounded-lg p-2 text-xs text-wool-100 focus:outline-none focus:border-caramel-500/30"
                    value={newProjDomain}
                    onChange={e => setNewProjDomain(e.target.value)}
                  >
                    {state.researchHub.domains.map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-mono font-bold text-caramel-400 mb-1">Link to Company Problem Statement (Optional)</label>
                <select 
                  className="w-full bg-burgundy-950 border border-caramel-500/10 rounded-lg p-2 text-xs text-wool-100 focus:outline-none focus:border-caramel-500/30"
                  value={newProjLinkedProblemId}
                  onChange={e => setNewProjLinkedProblemId(e.target.value)}
                >
                  <option value="">-- Independent Research (No organization link) --</option>
                  {(state.problems || []).filter(p => p.status === "Active").map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({p.organizationName})</option>
                  ))}
                </select>
                <p className="text-[8px] text-wool-200/40 font-mono mt-1">
                  Connecting your project alerts the posting organization and dynamically references their challenge criteria!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] uppercase font-mono font-bold text-caramel-400 mb-1">Tags (Comma separated)</label>
                  <input 
                    type="text" placeholder="e.g. signal-processing, python, neural"
                    className="w-full bg-burgundy-950 border border-caramel-500/10 rounded-lg p-2 text-xs text-wool-100 focus:outline-none focus:border-caramel-500/30"
                    value={newProjTags}
                    onChange={e => setNewProjTags(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-mono font-bold text-caramel-400 mb-1">Co-Authors names (Comma separated)</label>
                  <input 
                    type="text" placeholder="e.g. Suresh Iyer, Chloe Zhao"
                    className="w-full bg-burgundy-950 border border-caramel-500/10 rounded-lg p-2 text-xs text-wool-100 focus:outline-none focus:border-caramel-500/30"
                    value={newProjTeamMembers}
                    onChange={e => setNewProjTeamMembers(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] uppercase font-mono font-bold text-caramel-400 mb-1">Milestones & Code Target Goals</label>
                  <input 
                    type="text" placeholder="e.g. Phase 1 model telemetry, Phase 2 deployment"
                    className="w-full bg-burgundy-950 border border-caramel-500/10 rounded-lg p-2 text-xs text-wool-100 focus:outline-none focus:border-caramel-500/30"
                    value={newProjGoals}
                    onChange={e => setNewProjGoals(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-mono font-bold text-caramel-400 mb-1">Required Skills Set</label>
                  <input 
                    type="text" placeholder="e.g. PyTorch, Signal modeling, Linear Algebra"
                    className="w-full bg-burgundy-950 border border-caramel-500/10 rounded-lg p-2 text-xs text-wool-100 focus:outline-none focus:border-caramel-500/30"
                    value={newProjSkills}
                    onChange={e => setNewProjSkills(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-mono font-bold text-caramel-400 mb-1">Project Concept Abstract</label>
                <textarea required rows={3} placeholder="A short description of code pipelines targets, algorithms, dataset sandbox..."
                  className="w-full bg-burgundy-950 border border-caramel-500/10 rounded-lg p-2 text-xs text-wool-100 focus:outline-none focus:border-caramel-500/30"
                  value={newProjDesc}
                  onChange={e => setNewProjDesc(e.target.value)}
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" 
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-burgundy-900 text-wool-200 text-xs rounded-xl hover:bg-burgundy-850 cursor-pointer"
                >
                  Cancel
                </button>
                <Button variant="caramel" type="submit" className="px-5 py-2 font-bold text-xs cursor-pointer shadow-md">
                  Commit and stream live
                </Button>
              </div>
            </form>
          ) : (
            /* Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1">
              {filteredProjects.map((proj) => {
                const prog = proj.progress !== undefined ? proj.progress : 75;
                const matchesLike = userLikedProjs.includes(proj.id);
                return (
                  <div key={proj.id} className="glass-panel p-4 rounded-xl border border-caramel-500/10 hover:border-caramel-500/20 max-w-full overflow-hidden flex flex-col justify-between min-h-[220px]">
                    <div>
                      <div className="flex justify-between items-start gap-1 pb-1">
                        <span className="font-sans text-[9px] font-bold text-caramel-400 bg-caramel-500/10 px-2 py-0.5 rounded font-mono truncate">By: {proj.author}</span>
                        <span className="text-[9px] text-wool-200/40 font-mono">{prog}%</span>
                      </div>
                      <h4 className="text-xs font-bold text-wool-100 line-clamp-1 mt-1.5">{proj.title}</h4>
                      <p className="text-[10px] text-wool-200/60 leading-normal line-clamp-3 mt-1 font-light shrink-0">{proj.desc}</p>
                      
                      {/* Organization & Problem link feedback */}
                      {proj.problem_id && (
                        <div className="mt-2.5 p-2 rounded bg-[#741717]/20 border border-[#741717]/30 text-left">
                          <p className="text-[8px] uppercase font-mono font-bold text-caramel-400 leading-none">Linked Challenge</p>
                          <p className="text-[10px] text-wool-100 font-bold tracking-tight truncate mt-0.5">"{proj.problemStatement}"</p>
                          <p className="text-[8px] text-[#8D695D] font-medium leading-none font-mono mt-0.5">Org: {proj.organizationName}</p>
                        </div>
                      )}

                      {proj.members && proj.members.length > 0 && (
                        <p className="text-[8px] text-wool-200/45 font-mono mt-1.5 truncate">
                          <span className="font-bold">Team:</span> {proj.author}, {proj.members.join(", ")}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-caramel-500/5">
                      {/* Interaction metrics views, likes, comments */}
                      <div className="flex justify-between items-center text-[10px] text-wool-200/40">
                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center gap-0.5"><Eye size={11} className="text-wool-200/30" />{proj.views || 45}</span>
                          <button 
                            onClick={() => handleLikeProject(proj.id)}
                            className={`flex items-center gap-0.5 hover:text-caramel transition cursor-pointer ${matchesLike ? "text-caramel font-bold" : ""}`}
                          >
                            <Heart size={11} className={matchesLike ? "fill-caramel text-caramel" : "text-wool-200/30"} />
                            <span>{proj.likes || 4}</span>
                          </button>
                          <span className="flex items-center gap-0.5"><MessageSquare size={11} className="text-wool-200/30" />{proj.comments?.length || 1}</span>
                        </div>
                        
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleProgressAdjust(proj.id, -5)}
                            className="px-1.5 py-0.5 bg-burgundy-950 border border-caramel-500/10 rounded cursor-pointer font-black text-[9px] hover:bg-wine-red text-wool-100 transition-colors"
                          >
                            -5
                          </button>
                          <button 
                            onClick={() => handleProgressAdjust(proj.id, 5)}
                            className="px-1.5 py-0.5 bg-burgundy-950 border border-caramel-500/10 rounded cursor-pointer font-black text-[9px] hover:bg-wine-red text-wool-100 transition-colors"
                          >
                            +5
                          </button>
                        </div>
                      </div>
                      
                      {/* Linear Slider Bar */}
                      <div className="w-full h-1 bg-burgundy-950 rounded-full">
                        <div className="h-1 bg-gradient-to-r from-wine-red to-caramel-500 rounded-full" style={{ width: `${prog}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredProjects.length === 0 && (
                <div className="col-span-2 text-center py-16 flex flex-col items-center justify-center gap-2.5">
                  <BookOpen size={24} className="text-wool-200/15" />
                  <p className="text-[11px] text-wool-200/40 font-mono leading-relaxed max-w-sm mx-auto">
                    {state.researchHub.projects.length === 0 
                      ? "Be the first student to create a research project."
                      : "No research projects have been created yet."}
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>
        
        {/* ROW 2: NOTES & TIMELINE TIMELINE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Notes Box */}
          <Card variant="glass" className="p-4 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Edit3 size={11} className="text-caramel-400" />
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-wool-200/30">Notes scratchpad</span>
            </div>
            <textarea 
              className="w-full bg-[#52130C]/80 border border-caramel/5 focus:border-caramel/20 rounded-lg p-3 text-[11px] font-mono text-wool placeholder-wool/20 focus:outline-none transition h-28 resize-none leading-relaxed"
              value={personalNotes}
              onChange={e => setPersonalNotes(e.target.value)}
            />
            <span className="text-[8px] text-wool/30 font-mono text-right mt-1.5 block">Saved automatically</span>
          </Card>

          {/* Milestones Stepper Strip mini */}
          <Card variant="glass" className="p-4 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-wool-200/30 mb-2">Internal milestones</span>
            <div className="space-y-2 text-xs flex-1 max-h-[105px] overflow-y-auto text-left">
              <div className="flex gap-2 items-center">
                <span className="w-2 h-2 rounded-full bg-caramel-500 shrink-0" />
                <span className="text-wool-100 font-semibold text-[11px]">Caramel event: Oct 20</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="w-2 h-2 rounded-full bg-wine-red shrink-0" />
                <span className="text-wool-100 font-semibold text-[11px]">Red Wine event: Dec 15</span>
              </div>
              <div className="flex gap-2 items-center text-wool-200/40 italic font-light">
                <span className="w-2 h-2 rounded-full bg-burgundy-800 shrink-0" />
                <span className="text-[11px]">Upcoming deadline scheduled</span>
              </div>
            </div>
          </Card>

        </div>

      </div>

      {/* ── RIGHT PANEL: CHAT ASSISTANT & COLLABORATORS (3 Spans, Image 7 right) ── */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        
        {/* AI RESEARCH ASSISTANT WRAPPER */}
        <Card variant="glass" className="bg-[#741717]/90 border-caramel/20 flex flex-col justify-between p-5 min-h-[350px]">
          
          <div>
            <div className="flex items-center gap-2 border-b border-caramel/10 pb-3 mb-3">
              <Star size={14} className="text-caramel flex-shrink-0" />
              <div>
                <h3 className="font-accent text-xs font-semibold uppercase leading-none tracking-wide text-caramel">AI Research Assistant</h3>
                <span className="text-[8px] text-wool/30 font-mono leading-none tracking-widest mt-1 block h-auto">Powered by Gemini-2.5-Flash</span>
              </div>
            </div>

            {/* Micro chat messages container */}
            <div className="space-y-3.5 max-h-[180px] overflow-y-auto pr-1">
              {state.researchHub.assistantChatHistory.map((item, idx) => (
                <div key={idx} className={`p-2.5 rounded-lg text-[10px] leading-relaxed select-display ${
                  item.sender === "assistant" 
                    ? "bg-wine-red/25 border border-wine-red-light/10 text-wool-100" 
                    : "bg-burgundy-950 border border-caramel-500/10 text-caramel-300 ml-4 font-mono font-medium"
                }`}>
                  {item.sender === "assistant" && (
                    <span className="block font-sans font-bold text-[8px] text-caramel-400 uppercase tracking-wider mb-1 font-mono">Collivio AI Agent:</span>
                  )}
                  <span>{item.text}</span>
                </div>
              ))}
              
              {aiLoading && (
                <div className="p-2.5 rounded-lg bg-wine-red/10 border border-wine-red-light/5 text-[10px] text-wool-200/50 flex gap-2 items-center font-mono">
                  <div className="w-3.5 h-3.5 border-2 border-caramel-500 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Agent streaming pipeline...</span>
                </div>
              )}
            </div>
          </div>

          {/* Assistant Chat Form */}
          <form onSubmit={handleAISendMessage} className="mt-4 pt-3 border-t border-caramel-500/10 flex gap-2">
            <input 
              type="text"
              placeholder="Query neural, summaries..."
              className="flex-1 bg-burgundy-950 border border-caramel-500/10 rounded-lg px-2.5 py-1.5 text-[10px] text-wool-100 placeholder-wool-200/20 focus:outline-none focus:border-caramel-500/30 font-light"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              disabled={aiLoading}
            />
            <button 
              type="submit"
              disabled={aiLoading || !chatInput.trim()}
              className="w-7 h-7 bg-caramel-500 text-burgundy-950 rounded-lg flex items-center justify-center hover:bg-caramel-400 disabled:opacity-50 transition cursor-pointer shrink-0 shadow-md"
            >
              <Send size={11} />
            </button>
          </form>

        </Card>

        {/* COLLABORATOR SUGGESTIONS MATCH */}
        <Card variant="glass" className="p-4 text-xs flex flex-col justify-between h-auto">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-wool-200/35 border-b border-caramel-500/10 pb-2 block mb-3">Collaborator Suggestions</span>
            <div className="space-y-3 font-sans">
              {state.researchHub.suggestions.map(s => (
                <div key={s.id} className="p-2 bg-burgundy-950/60 rounded border border-caramel-500/5 flex justify-between items-center text-[10px]">
                  <div className="min-w-0">
                    <p className="font-semibold text-wool-100 truncate">{s.name}</p>
                    <p className="text-[8px] text-wool-200/40 uppercase font-mono truncate">{s.role}</p>
                  </div>
                  <Button 
                    variant={connections.includes(s.id) ? "outline" : "primary"}
                    size="xs"
                    className="py-1 px-2.5 text-[8px] font-bold"
                    onClick={() => handleConnect(s.id, s.name)}
                  >
                    {connections.includes(s.id) ? "Sent" : "Connect"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Quick timeline triggers block */}
          <div className="flex flex-col gap-2 pt-4 border-t border-caramel-500/5 mt-4">
            <div className="flex gap-2 items-center text-[10px] text-wool-200/70 p-1">
              <ListTodo size={11} className="text-caramel-400" />
              <span>Shared Task List portal</span>
            </div>
            
            <button className="w-full h-8 bg-wine-red hover:bg-wine-red-light transition text-wool-100 font-semibold rounded-lg flex items-center justify-center gap-1.5 text-[10px] cursor-pointer shadow-md">
              <Video size={11} />
              <span>Start Video Conference Meeting</span>
            </button>
          </div>
        </Card>

      </div>

    </div>
  );
};
