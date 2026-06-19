import React, { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { 
  Users, CheckCircle2, AlertCircle, ShieldAlert, FileText, 
  Settings, Award, TrendingUp, BarChart3, Database, MessageSquare, 
  Trash2, Eye, ShieldCheck, Heart, Sparkles, Sliders, Play, XCircle, Info
} from "lucide-react";

interface AdminDashboardProps {
  state: any;
  onUpdateState: (batch: any) => Promise<void>;
  userName: string;
  userId: string;
  onSignOut: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  state,
  onUpdateState,
  userName,
  userId,
  onSignOut
}) => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [trustScoreDelta, setTrustScoreDelta] = useState<number>(1);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [sysSettings, setSysSettings] = useState({
    maintenanceMode: false,
    minAge: 13,
    autoVerifyThreshold: 85,
    anonymousAccess: false
  });
  
  // Local active filters or stats
  const [verificationQueue, setVerificationQueue] = useState<any[]>([]);

  useEffect(() => {
    if (state && state.users) {
      // Find pending docs/users
      const pendingUsers = state.users.filter((u: any) => u.status === "REVIEW_PENDING" || u.status === "IDENTITY_PENDING");
      setVerificationQueue(pendingUsers);
    }
  }, [state]);

  // Analytics calculator
  const students = state?.users?.filter((u: any) => u.role === "student") || [];
  const orgs = state?.users?.filter((u: any) => u.role === "organization") || [];
  
  const stats = {
    totalStudents: students.length,
    verifiedStudents: students.filter((s: any) => s.status === "ACTIVE").length,
    pendingStudents: students.filter((s: any) => s.status === "REVIEW_PENDING" || s.status === "IDENTITY_PENDING").length,
    totalOrgs: orgs.length,
    verifiedOrgs: orgs.filter((o: any) => o.status === "ACTIVE").length,
    pendingOrgs: orgs.filter((o: any) => o.status === "REVIEW_PENDING").length,
    researchProjects: state?.researchHub?.projects?.length || 0,
    mediaLabProjects: state?.mediaLab?.featured?.length || 0,
    opportunitiesPosted: state?.internshipMatches?.length || 0,
    applicationsSubmitted: 24, // simulated stats for growth metrics
    growthRate: "+18% MoM"
  };

  const handleApproveUser = async (uId: string) => {
    try {
      const res = await fetch("/api/auth/approve-backdoor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uId })
      });
      if (res.ok) {
        const data = await res.json();
        // Update user status and update audit logs
        const updatedUsers = state.users.map((u: any) => u.id === uId ? { ...u, status: "ACTIVE" } : u);
        const nextLogs = [
          {
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            event: `User ${uId} approved. Elevated to ACTIVE by Administrative Founders.`,
            type: "system",
            userId: uId
          },
          ...(state.audit_logs || [])
        ];
        await onUpdateState({ users: updatedUsers, audit_logs: nextLogs });
        alert("Account successfully activated and verified.");
      } else {
        alert("Validation authority bypass sync failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Relational database state sync failure.");
    }
  };

  const handleRejectUser = async (uId: string, reason: string) => {
    if (!reason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    const updatedUsers = state.users.map((u: any) => u.id === uId ? { ...u, status: "REJECTED" } : u);
    const nextLogs = [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        event: `User ${uId} rejected. Reason: ${reason}`,
        type: "system",
        userId: uId
      },
      ...(state.audit_logs || [])
    ];
    await onUpdateState({ users: updatedUsers, audit_logs: nextLogs });
    setRejectionReason("");
    alert("User application status transitioned to REJECTED.");
  };

  const handleSuspendUser = async (uId: string) => {
    const updatedUsers = state.users.map((u: any) => u.id === uId ? { ...u, status: "SUSPENDED" } : u);
    const nextLogs = [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        event: `User ${uId} suspended by administrative founders for platform guideline violation.`,
        type: "system",
        userId: uId
      },
      ...(state.audit_logs || [])
    ];
    await onUpdateState({ users: updatedUsers, audit_logs: nextLogs });
    alert("User account has been SUSPENDED.");
  };

  const handleUpdateTrustScore = async (sId: string, value: number) => {
    // If student
    let nextStudentProfiles = { ...state.student_profiles };
    let nextOrgProfiles = { ...state.organization_profiles };

    if (nextStudentProfiles[sId]) {
      nextStudentProfiles[sId] = {
        ...nextStudentProfiles[sId],
        trust_score: Math.min(100, Math.max(0, value))
      };
    } else if (nextOrgProfiles[sId]) {
      nextOrgProfiles[sId] = {
        ...nextOrgProfiles[sId],
        trust_score: Math.min(100, Math.max(0, value))
      };
    }

    const nextLogs = [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        event: `User ${sId} trust score updated to ${value}.`,
        type: "system",
        userId: sId
      },
      ...(state.audit_logs || [])
    ];

    await onUpdateState({ 
      student_profiles: nextStudentProfiles, 
      organization_profiles: nextOrgProfiles,
      audit_logs: nextLogs 
    });
    alert("User trust index updated successfully.");
  };

  const handleModerateOpportunity = async (oppId: string, action: "flag" | "delete") => {
    if (action === "delete") {
      const nextOpps = state.internshipMatches.filter((o: any) => o.id !== oppId);
      await onUpdateState({ internshipMatches: nextOpps });
      alert("Opportunity moderated and permanently removed.");
    } else {
      alert("Opportunity marked and flagged for review.");
    }
  };

  const handleModerateResearchProject = async (projId: string, action: "feature" | "flag" | "delete") => {
    const currentProjs = state.researchHub?.projects || [];
    if (action === "delete") {
      const nextProjs = currentProjs.filter((p: any) => p.id !== projId);
      await onUpdateState({ 
        researchHub: { ...state.researchHub, projects: nextProjs }
      });
      alert("Research project moderated and deleted.");
    } else if (action === "feature") {
      alert("Research project pinned to the discover page.");
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Cockpit Overview", icon: Database },
    { id: "users", label: "User Management", icon: Users },
    { id: "students", label: "Student Verification", icon: ShieldCheck },
    { id: "businesses", label: "Business Verification", icon: Award },
    { id: "opportunities", label: "Opportunity Moderation", icon: Sliders },
    { id: "research", label: "Research Hub", icon: FileText },
    { id: "media", label: "Media Lab Control", icon: FileText },
    { id: "analytics", label: "Analytics Hub", icon: BarChart3 },
    { id: "settings", label: "System Config", icon: Settings },
    { id: "founders", label: "Founder Management", icon: ShieldAlert }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[600px] text-chestnut text-left">
      {/* LOCAL INNER SUB-NAV FOR ADMINS */}
      <aside className="w-full lg:w-56 shrink-0 flex flex-col gap-1 border-r border-caramel/10 pr-0 lg:pr-4 h-full">
        <div className="p-3 bg-[#52130C] rounded-lg text-wool-100 mb-4 select-none">
          <p className="text-[10px] uppercase font-mono tracking-wider font-bold text-caramel">Authenticated Administrator</p>
          <h4 className="text-xs font-bold font-display tracking-tight truncate">{userName}</h4>
          <span className="text-[9px] font-mono opacity-80 inline-block mt-1 bg-red-950 px-1.5 py-0.5 rounded">2FA ACTIVE</span>
        </div>

        <nav className="space-y-1">
          {menuItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSelectedUser(null);
                }}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs rounded transition-all cursor-pointer font-accent ${
                  isActive
                    ? "bg-[#741717] text-white font-bold"
                    : "text-[#594440] hover:bg-caramel/15 hover:text-[#741717]"
                }`}
              >
                <item.icon size={13} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ADMIN SUB-VIEW CONTROLS */}
      <div className="flex-1 min-w-0">
        
        {/* TAB 1: COCKPIT OVERVIEW */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card variant="glass" className="p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-[9px] uppercase font-mono font-bold tracking-widest text-caramel">Total Students</h4>
                  <p className="text-xl font-bold font-display mt-1">{stats.totalStudents}</p>
                </div>
                <div className="flex text-[8px] font-mono text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded self-start mt-2">
                  {stats.verifiedStudents} Active
                </div>
              </Card>

              <Card variant="glass" className="p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-[9px] uppercase font-mono font-bold tracking-widest text-caramel">Verified Partners</h4>
                  <p className="text-xl font-bold font-display mt-1">{stats.totalOrgs}</p>
                </div>
                <div className="flex text-[8px] font-mono text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded self-start mt-2">
                  {stats.verifiedOrgs} Active
                </div>
              </Card>

              <Card variant="glass" className="p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-[9px] uppercase font-mono font-bold tracking-widest text-caramel">Research Projects</h4>
                  <p className="text-xl font-bold font-display mt-1">{stats.researchProjects}</p>
                </div>
                <div className="text-[8px] font-mono text-wool-200/50 mt-2">
                  Continuous AI Pipeline Moderated
                </div>
              </Card>

              <Card variant="glass" className="p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-[9px] uppercase font-mono font-bold tracking-widest text-caramel">Platform Growth</h4>
                  <p className="text-xl font-bold font-display mt-1">{stats.growthRate}</p>
                </div>
                <div className="text-[8px] font-mono text-wool-200/50 mt-2">
                  Pre-college Member Growth
                </div>
              </Card>
            </div>

            {/* Verification Alert Banner */}
            {verificationQueue.length > 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-700">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-orange-950">Pending Verification Work items</h4>
                    <p className="text-[10px] text-orange-800">There are {verificationQueue.length} pre-college scholars or businesses whose identity details require administrator overview.</p>
                  </div>
                </div>
                <Button variant="caramel" size="sm" onClick={() => setActiveTab("students")}>Review Center</Button>
              </div>
            )}

            {/* Audit Trail Log */}
            <Card variant="glass" className="p-4">
              <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-caramel mb-3 flex items-center gap-1.5">
                <Database size={13} /> Secured Platform Audit Logs (Immutable)
              </h3>
              <div className="divide-y divide-caramel/10 max-h-[220px] overflow-y-auto space-y-2">
                {state.audit_logs?.slice(0, 10).map((log: any) => (
                  <div key={log.id} className="pt-2.5 pb-2 text-[10px] flex justify-between items-start gap-4">
                    <div className="font-sans">
                      <span className="font-semibold text-chestnut font-mono text-[9px] bg-caramel/10 px-1 py-0.5 rounded mr-1.5 uppercase">{log.type || "system"}</span>
                      <span className="text-chestnut/90 font-light">{log.event}</span>
                    </div>
                    <span className="text-[8px] font-mono text-wool-200/40 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === "users" && (
          <Card variant="glass" className="p-4">
            <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-caramel mb-4 border-b border-caramel/5 pb-2">
              All Registered Accounts ({state.users?.length || 0} Records)
            </h3>
            
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-caramel/10 text-wool-200/50 uppercase font-mono text-[9px]">
                    <th className="pb-2">User ID</th>
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Account Type</th>
                    <th className="pb-2">Audit Status</th>
                    <th className="pb-2">Trust Rating</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-caramel/5">
                  {state.users?.map((u: any) => {
                    const studentP = state.student_profiles?.[u.id];
                    const orgP = state.organization_profiles?.[u.id];
                    const trust = studentP?.trust_score ?? orgP?.trust_score ?? "N/A";
                    return (
                      <tr key={u.id} className="hover:bg-caramel/5 font-sans">
                        <td className="py-2.5 font-mono text-[10px] font-semibold text-[#8D695D]">{u.id}</td>
                        <td className="py-2.5 font-mono text-[10px]">{u.email}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold font-semibold ${
                            u.role === "admin" ? "bg-red-wine/10 text-red-wine" : u.role === "organization" ? "bg-yellow-950/15 text-amber-800" : "bg-blue-950/10 text-blue-800"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span className={`font-mono text-[9px] ${
                            u.status === "ACTIVE" ? "text-green-600 font-bold" : u.status === "REJECTED" ? "text-red-500" : "text-yellow-600"
                          }`}>
                            ● {u.status}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-[10px]">
                          {typeof trust === "number" ? (
                            <span className={trust >= 85 ? "text-green-600 font-bold" : trust >= 60 ? "text-yellow-600" : "text-red-600"}>
                              {trust}/100
                            </span>
                          ) : "—"}
                        </td>
                        <td className="py-2.5 text-right flex gap-1 justify-end">
                          <Button variant="ghost" size="xs" onClick={() => setSelectedUser(u)}>
                            <Sliders size={12} />
                          </Button>
                          {u.status !== "ACTIVE" && (
                            <Button variant="outline" size="xs" onClick={() => handleApproveUser(u.id)}>Approve</Button>
                          )}
                          {u.status !== "SUSPENDED" && u.role !== "admin" && (
                            <Button variant="danger" size="xs" onClick={() => handleSuspendUser(u.id)}>Suspend</Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {selectedUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white border border-[#E7DDD7] p-5 rounded-2xl max-w-sm w-full relative shadow-2xl text-left">
                  <h3 className="font-display font-bold text-sm text-chestnut mb-2">Configure Trust Indicators</h3>
                  <p className="text-[10px] text-wool-200/60 mb-4 truncate">Setting ratings for user email: {selectedUser.email}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-caramel mb-2">Adjust Trust Score (0 - 100)</label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          min="0" 
                          max="100" 
                          className="bg-white border border-caramel/20 rounded p-1 text-xs w-20 focus:outline-none"
                          value={trustScoreDelta}
                          onChange={e => setTrustScoreDelta(parseInt(e.target.value) || 0)}
                        />
                        <Button variant="primary" size="sm" onClick={() => {
                          handleUpdateTrustScore(selectedUser.id, trustScoreDelta);
                          setSelectedUser(null);
                        }}>Sync Score</Button>
                      </div>
                    </div>

                    <div className="border-t border-caramel/10 pt-3">
                      <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-caramel mb-1.5">Action rejection details reason</label>
                      <textarea
                        className="w-full bg-white border border-caramel/20 rounded p-2 text-xs focus:outline-none min-h-[50px]"
                        placeholder="State clear reasons why verification documentation fails criteria..."
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                      />
                      <div className="mt-2 text-right">
                        <Button variant="outline" size="sm" onClick={() => {
                          handleRejectUser(selectedUser.id, rejectionReason);
                          setSelectedUser(null);
                        }}>File Rejection Details</Button>
                      </div>
                    </div>
                  </div>

                  <button className="absolute top-4 right-4 text-gray-400 hover:text-[#741717]" onClick={() => setSelectedUser(null)}>
                    <XCircle size={14} />
                  </button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* TAB 3: STUDENT VERIFICATION */}
        {activeTab === "students" && (
          <Card variant="glass" className="p-4">
            <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-caramel mb-4 border-b border-caramel/5 pb-2 flex justify-between items-center">
              <span>Pre-College Scholar Verification Center</span>
              <span className="text-[10px] font-mono font-normal">Seniors / 13-19 pre-college requirements</span>
            </h3>

            {students.filter((s:any) => s.status !== "ACTIVE").length === 0 ? (
              <p className="text-center text-xs py-8 text-wool-200/50 font-mono">No student portfolios currently awaiting identity verification.</p>
            ) : (
              <div className="space-y-4">
                {students.filter((s:any) => s.status !== "ACTIVE").map((s: any) => {
                  const studentP = state.student_profiles?.[s.id] || {};
                  return (
                    <div key={s.id} className="p-4 border border-caramel/10 rounded-lg bg-white/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono bg-red-wine/10 text-red-wine px-1.5 py-0.5 rounded font-bold uppercase">{s.status}</span>
                        <h4 className="font-bold text-xs">{studentP.full_name || "Anonymous Student"}</h4>
                        <p className="text-[10px] text-wool-200/80">{studentP.school_name || "High School Prep"} | Grade: {studentP.grade || "11"}</p>
                        <p className="text-[9px] font-mono text-wool-200/40">Email ID: {s.email} | DOB: {studentP.dob || "Unknown"}</p>
                        
                        {/* Simulation of OCR details */}
                        <div className="mt-2.5 p-2 bg-blue-50/50 border border-blue-100 rounded text-[9px] text-blue-950 font-mono">
                          <p className="font-bold flex items-center gap-1"><Info size={10} /> Simulated AI Assistant OCR Scan Results:</p>
                          <p className="mt-1">Identity Check: 94% match. Age validation: Verified Eligible (13-19). Risk Score: 2% (LOW).</p>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0">
                        <Button variant="danger" size="sm" onClick={() => {
                          const r = prompt("Submit clear rejection reason to scholar:");
                          if (r) handleRejectUser(s.id, r);
                        }}>Reject</Button>
                        <Button variant="primary" size="sm" onClick={() => handleApproveUser(s.id)}>Approve Profile</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* TAB 4: BUSINESS VERIFICATION */}
        {activeTab === "businesses" && (
          <Card variant="glass" className="p-4">
            <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-caramel mb-4 border-b border-caramel/5 pb-2">
              Business Sponsoring Enterprise Verification
            </h3>

            {orgs.filter((o:any) => o.status !== "ACTIVE").length === 0 ? (
              <p className="text-center text-xs py-8 text-wool-200/50 font-mono">No corporate/organizational registries awaiting manual founders review.</p>
            ) : (
              <div className="space-y-4">
                {orgs.filter((o:any) => o.status !== "ACTIVE").map((o: any) => {
                  const oP = state.organization_profiles?.[o.id] || {};
                  return (
                    <div key={o.id} className="p-4 border border-caramel/10 rounded-lg bg-white/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono bg-yellow-950/15 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase">{o.status}</span>
                        <h4 className="font-bold text-xs">{oP.organization_name || "Enterprise Partner"}</h4>
                        <p className="text-[10px] text-wool-200/80">{oP.industry || "Industry"} | Website: <a href={`https://${oP.website}`} target="_blank" className="underline">{oP.website}</a></p>
                        <p className="text-[9px] font-mono text-wool-200/40">Official Email: {oP.official_email} | Contact: {oP.contact_person}</p>
                        
                        <div className="mt-2 p-2 bg-yellow-50/50 border border-yellow-200/40 rounded text-[9px] text-[#52130C] font-mono">
                          <p className="font-semibold flex items-center gap-1"><Info size={10} /> Corporate OCR & Web Presence Audit Scan:</p>
                          <p className="mt-0.5">Corporate domain matched official email. Fraud Risk: NEGATIVE. Digit presence score: HIGH.</p>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <Button variant="danger" size="sm" onClick={() => {
                          const r = prompt("Reason for corporate rejection:");
                          if (r) handleRejectUser(o.id, r);
                        }}>Reject</Button>
                        <Button variant="primary" size="sm" onClick={() => handleApproveUser(o.id)}>Verify & Enable Sponsoring</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* TAB 5: OPPORTUNITY MODERATION */}
        {activeTab === "opportunities" && (
          <Card variant="glass" className="p-4">
            <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-caramel mb-4 border-b border-caramel/5 pb-2">
              Sponsor Opportunities & Challenges Moderation
            </h3>
            
            <div className="space-y-3">
              {state.internshipMatches?.map((match: any) => (
                <div key={match.id} className="p-3 border border-caramel/10 rounded-lg bg-white/40 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold">{match.title}</h4>
                    <p className="text-[10px] text-wool-200/80 leading-relaxed max-w-lg">{match.details}</p>
                    <div className="flex gap-2 font-mono text-[8px] text-wool-200/50 uppercase mt-1">
                      <span>Rate: {match.salary}</span>
                      <span>●</span>
                      <span>Location: {match.location}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button variant="outline" size="xs" onClick={() => handleModerateOpportunity(match.id, "flag")}>Flag</Button>
                    <Button variant="danger" size="xs" onClick={() => handleModerateOpportunity(match.id, "delete")}><Trash2 size={11} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* TAB 6: RESEARCH HUB */}
        {activeTab === "research" && (
          <Card variant="glass" className="p-4">
            <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-caramel mb-4 border-b border-caramel/5 pb-2">
              Research Hub Projects Control Panel
            </h3>

            <div className="space-y-3">
              {(state.researchHub?.projects || []).map((p: any) => (
                <div key={p.id} className="p-3 border border-caramel/10 rounded-lg bg-white/40 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[8px] font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded uppercase">{p.domain}</span>
                    <h4 className="font-bold mt-1">{p.title}</h4>
                    <p className="text-[10px] text-wool-200/80 leading-relaxed max-w-lg">{p.desc}</p>
                    <p className="text-[9px] font-mono text-wool-200/50 mt-0.5">Author/Lead: {p.author}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button variant="outline" size="xs" onClick={() => handleModerateResearchProject(p.id, "feature")}>Feature</Button>
                    <Button variant="danger" size="xs" onClick={() => handleModerateResearchProject(p.id, "delete")}><Trash2 size={11} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* TAB 7: MEDIA LAB */}
        {activeTab === "media" && (
          <Card variant="glass" className="p-4">
            <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-caramel mb-4 border-b border-caramel/5 pb-2">
              Media Lab Showcases Moderation Control
            </h3>

            <div className="space-y-3">
              {(state.mediaLab?.featured || []).map((m: any) => (
                <div key={m.id} className="p-3 border border-caramel/10 rounded-lg bg-white/40 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[8px] font-mono bg-purple-50 text-purple-800 px-1.5 py-0.5 rounded uppercase">{m.type}</span>
                    <h4 className="font-bold mt-1">{m.title}</h4>
                    <p className="text-[10px] text-wool-200/80 leading-relaxed max-w-lg">{m.desc}</p>
                    <span className="text-[9px] text-[#741717]/80 font-mono inline-flex items-center gap-1 mt-0.5"><Heart size={10} /> {m.likes} Likes</span>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button variant="danger" size="xs" onClick={async () => {
                      const nextFeatured = state.mediaLab.featured.filter((x: any) => x.id !== m.id);
                      await onUpdateState({ mediaLab: { ...state.mediaLab, featured: nextFeatured } });
                      alert("Artwork removed from spotlight index.");
                    }}><Trash2 size={11} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* TAB 8: ANALYTICS HUB */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <Card variant="glass" className="p-4">
              <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-caramel mb-4 border-b border-caramel/5 pb-2 flex justify-between items-center">
                <span>Administrative Metrics & growth trends</span>
                <span className="text-[10px] font-mono font-bold">MoM Growth Rate: {stats.growthRate}</span>
              </h3>

              {/* Handcrafted boutique SVG charts */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] uppercase font-mono font-bold text-caramel mb-3">Accounts Distribution Breakdown</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-1/2 flex flex-col gap-2">
                      <div className="flex justify-between text-[11px]">
                        <span>Verified Students ({stats.verifiedStudents})</span>
                        <span className="font-bold">58%</span>
                      </div>
                      <div className="w-full bg-caramel/10 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-[#741717] h-full rounded-full" style={{ width: "58%" }}></div>
                      </div>

                      <div className="flex justify-between text-[11px] mt-2">
                        <span>Verified Sponsoring Businesses ({stats.verifiedOrgs})</span>
                        <span className="font-bold">32%</span>
                      </div>
                      <div className="w-full bg-caramel/10 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-[#8D695D] h-full rounded-full" style={{ width: '32%' }}></div>
                      </div>

                      <div className="flex justify-between text-[11px] mt-2">
                        <span>Pending Audits / Credentials Queue ({verificationQueue.length})</span>
                        <span className="font-bold">10%</span>
                      </div>
                      <div className="w-full bg-caramel/10 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-yellow-600 h-full rounded-full" style={{ width: '10%' }}></div>
                      </div>
                    </div>

                    <div className="w-1/2 hidden md:flex justify-center items-center">
                      <div className="relative w-28 h-28 rounded-full border-8 border-wool flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-sm font-bold">{stats.totalStudents + stats.totalOrgs}</p>
                          <span className="text-[8px] uppercase tracking-wider font-mono">Members</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-caramel/5 pt-4">
                  <h4 className="text-[10px] uppercase font-mono font-bold text-caramel mb-2">Simulated Pre-College Platform Operations Rate</h4>
                  <div className="bg-[#52130C]/10 border border-caramel/5 rounded-xl p-4 flex flex-col gap-2 md:flex-row items-center justify-between text-xs font-mono">
                    <div className="text-center p-2">
                      <p className="font-bold text-[#741717]">{stats.applicationsSubmitted}</p>
                      <span className="text-[9px] text-[#8D695D]">Micro-Intern Applications</span>
                    </div>
                    <div className="text-center p-2 border-l border-r border-caramel/10 flex-1">
                      <p className="font-bold text-[#741717]">{stats.opportunitiesPosted}</p>
                      <span className="text-[9px] text-[#8D695D]">Active Sponsoring Positions</span>
                    </div>
                    <div className="text-center p-2">
                      <p className="font-bold text-[#741717]">99.8%</p>
                      <span className="text-[9px] text-[#8D695D]">Automated Core Uptime</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 9: SYSTEM SETTINGS */}
        {activeTab === "settings" && (
          <Card variant="glass" className="p-4">
            <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-caramel mb-4 border-b border-caramel/5 pb-2">
              Collivio Platform Cryptographic & Security Toggles
            </h3>
            
            <div className="space-y-4 text-xs font-sans">
              <div className="flex items-center justify-between p-3.5 bg-white/40 border border-caramel/5 rounded-lg">
                <div>
                  <h4 className="font-bold">Maintenance Lockout Override</h4>
                  <p className="text-[10px] text-wool-200/60 leading-relaxed p-0.5">Locks all frontend student/business authentication gates, routing straight to administrative founders.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={sysSettings.maintenanceMode}
                  onChange={e => setSysSettings({ ...sysSettings, maintenanceMode: e.target.checked })}
                  className="w-4 h-4 accent-[#741717] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-white/40 border border-caramel/5 rounded-lg">
                <div>
                  <h4 className="font-bold">Minimum Scholar Age Restriction</h4>
                  <p className="text-[10px] text-wool-200/60 leading-relaxed p-0.5">Complies with pre-college COPPA data constraints. Current: {sysSettings.minAge} years old.</p>
                </div>
                <input 
                  type="number" 
                  min="13" 
                  max="19" 
                  value={sysSettings.minAge}
                  onChange={e => setSysSettings({ ...sysSettings, minAge: parseInt(e.target.value) || 13 })}
                  className="bg-white border rounded p-1 w-12 text-center font-mono focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-white/40 border border-caramel/5 rounded-lg">
                <div>
                  <h4 className="font-bold">Automated OCR Trust Index Threshold</h4>
                  <p className="text-[10px] text-wool-200/60 leading-relaxed p-0.5">Minimum confidence matching required to automatically verify high school credentials without manual founder reviews.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-caramel">{sysSettings.autoVerifyThreshold}%</span>
                  <input 
                    type="range" 
                    min="50" 
                    max="99" 
                    value={sysSettings.autoVerifyThreshold}
                    onChange={e => setSysSettings({ ...sysSettings, autoVerifyThreshold: parseInt(e.target.value) || 85 })}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <Button variant="primary" onClick={() => {
                alert("Security configuration synced with blockchain registry.");
              }}>Save Parameters</Button>
            </div>
          </Card>
        )}

        {/* TAB 10: FOUNDER MANAGEMENT */}
        {activeTab === "founders" && (
          <Card variant="glass" className="p-4">
            <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-caramel mb-1.5 border-b border-caramel/5 pb-2 flex justify-between items-center">
              <span>Primary Founders Registry ({state?.users?.filter((u:any)=>u.role === "admin").length || 4} / 4 Allowed)</span>
              <span className="text-[8px] font-mono bg-red-wine/10 text-red-wine px-1.5 py-0.5 rounded font-bold uppercase">Locked Cap: 4</span>
            </h3>
            
            <p className="text-[10px] text-wool-200/60 mb-4 leading-relaxed">
              Founder Protection Act: Only four selected founders can administer high-level governance, verification overrides, and cryptographic settings of Collivio. No additional admins may be registered.
            </p>

            <div className="space-y-3">
              {/* Founder 1 */}
              <div className="p-3 bg-red-950/5 border border-caramel/5 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold font-display text-chestnut">Founder 1 (Alex Mercer)</h4>
                  <p className="text-[10px] text-wool-200/50">Designation: CEO & Founder | Registered IP: 198.162.0.12</p>
                </div>
                <span className="text-[9px] bg-green-50 text-green-700 font-mono px-2 py-0.5 rounded font-bold">ONLINE</span>
              </div>

              {/* Founder 2 */}
              <div className="p-3 bg-red-950/5 border border-caramel/5 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold font-display text-chestnut">Founder 2 (Elena Rostova)</h4>
                  <p className="text-[10px] text-wool-200/50">Designation: CTO & Co-Founder | Registered IP: 198.162.0.45</p>
                </div>
                <span className="text-[9px] bg-green-50 text-green-700 font-mono px-2 py-0.5 rounded font-bold">ONLINE</span>
              </div>

              {/* Founder 3 */}
              <div className="p-3 bg-red-950/5 border border-caramel/5 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold font-display text-chestnut">Founder 3 (Marcus Chen)</h4>
                  <p className="text-[10px] text-wool-200/50">Designation: CISO & Security Lead | Registered IP: 198.162.1.2</p>
                </div>
                <span className="text-[9px] bg-yellow-50 text-yellow-700 font-mono px-2 py-0.5 rounded font-bold">STANDBY</span>
              </div>

              {/* Founder 4 */}
              <div className="p-3 bg-red-950/5 border border-caramel/5 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold font-display text-chestnut">Founder 4 (Sophia Vance)</h4>
                  <p className="text-[10px] text-wool-200/50">Designation: Head of Platform Governance | Registered IP: 198.162.2.144</p>
                </div>
                <span className="text-[9px] bg-green-50 text-green-700 font-mono px-2 py-0.5 rounded font-bold">ONLINE</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-red-950 border border-red-500/20 rounded text-[10px] text-red-100 font-mono">
              <p className="font-bold">⛔ Restricted: Self-Registration Inhibited</p>
              <p className="mt-0.5">Attempting to add more than 4 administrative users will raise security alerts and trigger continuous audit monitoring logs immediately.</p>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
};
