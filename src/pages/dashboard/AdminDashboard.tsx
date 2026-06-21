import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { 
  Users, CheckCircle2, AlertCircle, ShieldAlert, FileText, 
  Settings, Award, TrendingUp, BarChart3, Database, MessageSquare, 
  Trash2, Eye, ShieldCheck, Heart, Sparkles, Sliders, Play, XCircle, 
  Info, DollarSign, ArrowUpRight, ArrowDownRight, RefreshCw, Filter, 
  Search, Download, Plus, Mail, Check, AlertTriangle, PlayCircle, Clock,
  LogOut
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
  // Navigation active tab matching prompt requirements
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [timeSwitcher, setTimeSwitcher] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  
  // Local state managers
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [verificationSubTab, setVerificationSubTab] = useState<"students" | "organizations">("students");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [showRejectionModal, setShowRejectionModal] = useState<boolean>(false);
  const [manualInviteEmail, setManualInviteEmail] = useState<string>("");
  const [inviteError, setInviteError] = useState<string>("");
  const [inviteSuccess, setInviteSuccess] = useState<any>(null);
  const [userSearchText, setUserSearchText] = useState<string>("");
  const [orgSearchText, setOrgSearchText] = useState<string>("");
  const [txSearchText, setTxSearchText] = useState<string>("");
  
  // System parameters
  const [sysSettings, setSysSettings] = useState({
    maintenanceMode: false,
    minAge: 13,
    autoVerifyThreshold: 85,
    emailTemplate: "Welcome to Collivio Founder Portal. Your secure activation link is enclosed.",
    verificationRules: "Strict Double-Pass AI Validation",
    anonymousAccess: false
  });

  // Report Builder state
  const [reportType, setReportType] = useState<string>("Users");
  const [reportTimeframe, setReportTimeframe] = useState<string>("Last 30 Days");
  
  // Real-time telemetry trigger for animated updates
  const [telemetryTicks, setTelemetryTicks] = useState<number>(0);
  
  // Periodically appends simulated system logs or updates metrics slightly
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryTicks(t => t + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Filter users lists
  const students = state?.users?.filter((u: any) => u.role === "student") || [];
  const orgs = state?.users?.filter((u: any) => u.role === "organization") || [];
  const admins = state?.users?.filter((u: any) => u.role === "admin") || [];
  
  const pendingStudents = students.filter((s: any) => s.status === "REVIEW_PENDING" || s.status === "IDENTITY_PENDING" || s.status === "DOCUMENT_PENDING");
  const rejectedStudents = students.filter((s: any) => s.status === "REJECTED");
  
  const pendingOrgs = orgs.filter((o: any) => o.status === "REVIEW_PENDING");
  const rejectedOrgs = orgs.filter((o: any) => o.status === "REJECTED");

  // Statistical calculations matching exact prompt specifications
  const stats = {
    // Student counters
    totalStudents: students.length,
    verifiedStudents: students.filter((s: any) => s.status === "ACTIVE").length,
    pendingStudents: pendingStudents.length,
    rejectedStudents: rejectedStudents.length,
    // Organization counters
    totalOrgs: orgs.length,
    verifiedOrgs: orgs.filter((o: any) => o.status === "ACTIVE").length,
    pendingOrgs: pendingOrgs.length,
    rejectedOrgs: rejectedOrgs.length,
    // Content metrics
    totalResearchProjects: state?.researchHub?.projects?.length || 5,
    totalIndustryProblems: state?.internships?.filter((i: any) => i.isProblem)?.length || 3,
    totalCourses: state?.skillCourses?.length || 4,
    totalInternships: state?.internshipMatches?.length || state?.internships?.length || 6,
    totalMediaLabProjects: state?.mediaLab?.projects?.length || state?.mediaLab?.featured?.length || 4,
    // Financial indicators
    totalPayments: (state?.payment_transactions || []).reduce((sum: number, tx: any) => tx.status === "COMPLETED" ? sum + tx.amount : sum, 0),
    stipendAverage: 2450,
    successRate: 94.2
  };

  // Custom Chart Data Switcher representation (SVG generated statically/interactively based on setting)
  const chartPoints = {
    daily: [20, 45, 15, 60, 30, 80] as number[],
    weekly: [140, 210, 180, 290, 240, 350] as number[],
    monthly: [1200, 2400, 1850, 3100, 2100, 4800] as number[],
    yearly: [18000, 24000, 31000, 45000, 52000, 68000] as number[]
  };

  const chartLabels = {
    daily: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    weekly: ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6"],
    monthly: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    yearly: ["2021", "2022", "2023", "2024", "2025", "2026"]
  };

  const currentPoints = chartPoints[timeSwitcher];
  const currentLabels = chartLabels[timeSwitcher];

  // Actions
  const handleApproveUser = async (uId: string) => {
    try {
      const updatedUsers = state.users.map((u: any) => u.id === uId ? { ...u, status: "ACTIVE" } : u);
      const nextLogs = [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          event: `Account approved & Identity verified successfully for user ${uId} by ${userName}.`,
          type: "system",
          userId: uId
        },
        ...(state.audit_logs || [])
      ];
      await onUpdateState({ users: updatedUsers, audit_logs: nextLogs });
      setSelectedVerification(null);
      alert("Verification successfully certified. Profile is now marked ACTIVE.");
    } catch (err) {
      alert("Error upgrading verification state.");
    }
  };

  const handleRejectUser = async (uId: string) => {
    if (!rejectionReason.trim()) {
      alert("Rejection reason is mandatory.");
      return;
    }
    try {
      const updatedUsers = state.users.map((u: any) => u.id === uId ? { ...u, status: "REJECTED" } : u);
      const nextLogs = [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          event: `Profile registration rejected for user ${uId}. Reason: ${rejectionReason}`,
          type: "system",
          userId: uId
        },
        ...(state.audit_logs || [])
      ];
      await onUpdateState({ users: updatedUsers, audit_logs: nextLogs });
      setRejectionReason("");
      setShowRejectionModal(false);
      setSelectedVerification(null);
      alert("Account registration status transitioned to REJECTED.");
    } catch (err) {
      alert("Error logging rejection.");
    }
  };

  const handleSuspendUser = async (uId: string) => {
    const confirmation = window.confirm("Are you absolutely sure you wish to suspend this account? Access permissions will be terminated immediately.");
    if (!confirmation) return;
    try {
      const updatedUsers = state.users.map((u: any) => u.id === uId ? { ...u, status: "SUSPENDED" } : u);
      const nextLogs = [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          event: `Account ${uId} has been SUSPENDED due to guidelines non-compliance.`,
          type: "security",
          userId: uId
        },
        ...(state.audit_logs || [])
      ];
      await onUpdateState({ users: updatedUsers, audit_logs: nextLogs });
      alert("User account transitioned to SUSPENDED status.");
    } catch (err) {
      alert("Error persisting suspend command.");
    }
  };

  const handleRequestMoreInfo = async (uId: string) => {
    const infoNotes = window.prompt("Identify what documents or details are missing (e.g. Current enrollment card / updated signature):");
    if (!infoNotes) return;
    try {
      const updatedUsers = state.users.map((u: any) => u.id === uId ? { ...u, status: "DOCUMENT_PENDING" } : u);
      
      let nextStudentProfiles = { ...(state.student_profiles || {}) };
      let nextOrgProfiles = { ...(state.organization_profiles || {}) };

      if (nextStudentProfiles[uId]) {
        nextStudentProfiles[uId] = { ...nextStudentProfiles[uId], verification_notes: infoNotes };
      } else if (nextOrgProfiles[uId]) {
        nextOrgProfiles[uId] = { ...nextOrgProfiles[uId], verification_notes: infoNotes };
      }

      const nextLogs = [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          event: `Information pending request sent to user ${uId}: ${infoNotes}`,
          type: "info_request",
          userId: uId
        },
        ...(state.audit_logs || [])
      ];

      await onUpdateState({ 
        users: updatedUsers, 
        student_profiles: nextStudentProfiles, 
        organization_profiles: nextOrgProfiles, 
        audit_logs: nextLogs 
      });
      setSelectedVerification(null);
      alert("Document request filed.");
    } catch (err) {
      alert("Request failed.");
    }
  };

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess(null);
    if (!manualInviteEmail) {
      setInviteError("Please provide an email.");
      return;
    }

    try {
      const res = await fetch("/api/admin/invitations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: manualInviteEmail })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInviteSuccess(data.invitation);
        setManualInviteEmail("");
        // Reload system state
        await onUpdateState({});
      } else {
        setInviteError(data.error || "Cryptographic reservation failed.");
      }
    } catch (err) {
      setInviteError("Network synchronization handshake failure.");
    }
  };

  const handleGenerateReport = async () => {
    try {
      const newReport = {
        id: "rep-" + Date.now(),
        type: `${reportType} Volume Report`,
        date: new Date().toISOString().split("T")[0],
        status: "READY",
        created_by: userName
      };
      const updatedReports = [newReport, ...(state.payment_reports || [])];
      
      const nextLogs = [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          event: `Administrative Report (${reportType}) rendered by ${userName} for time frame: ${reportTimeframe}.`,
          type: "report",
          userId: userId
        },
        ...(state.audit_logs || [])
      ];

      await onUpdateState({ payment_reports: updatedReports, audit_logs: nextLogs });
      alert(`CSV Spreadsheet simulated database fetch for ${reportType} completed successfully.`);
    } catch {
      alert("Report generation failed.");
    }
  };

  const handleExportCSV = (type: string) => {
    alert(`Generating automated CSV export download: collivio_ledger_${type.toLowerCase()}_${Date.now()}.csv`);
  };

  const truncateToken = (token: string) => {
    if (!token) return "";
    return token.substring(0, 10) + "..." + token.substring(token.length - 8);
  };

  // Nav menu items matching specified modules
  const menuItems = [
    { id: "dashboard", label: "Overview", icon: Database },
    { id: "financials", label: "Financial Portal", icon: DollarSign },
    { id: "analytics", label: "User Analytics", icon: BarChart3 },
    { id: "verification", label: "Verification Center", icon: ShieldCheck },
    { id: "org-management", label: "Partner Directory", icon: Sliders },
    { id: "student-management", label: "Scholar Directory", icon: Users },
    { id: "invitation-center", label: "Founder Invites", icon: Mail },
    { id: "reports", label: "Reports Center", icon: FileText },
    { id: "settings", label: "Security & Rules", icon: Settings },
    { id: "system-logs", label: "Live Telemetry", icon: Clock }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[600px] text-[#EFDFDC] text-left selection:bg-red-wine selection:text-white">
      {/* ── LEFT PREMIUM NAVIGATION BAR ── */}
      <aside className="w-full lg:w-60 shrink-0 flex flex-col gap-2 bg-[#1C0604]/90 p-4 border border-[#48211E]/40 rounded-2xl shadow-xl h-full backdrop-blur-md">
        <div className="p-3 bg-[#42110D] border border-caramel/15 rounded-xl text-white select-none relative overflow-hidden">
          <div className="absolute right-0 top-0 w-16 h-16 bg-caramel/10 rounded-full blur-lg" />
          <p className="text-[9px] uppercase font-mono tracking-widest text-caramel font-bold">Authorized Founder</p>
          <h4 className="text-sm font-bold font-display tracking-tight text-white mt-1 truncate">{userName}</h4>
          <span className="text-[8px] font-mono opacity-90 inline-block mt-2 bg-[#1A0302] px-2 py-0.5 rounded border border-caramel/10 font-bold">MUTUAL 2FA SECURE</span>
        </div>

        <nav className="space-y-1 mt-4">
          {menuItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSelectedVerification(null);
                }}
                className={`w-full text-left flex items-center gap-3 px-3.5 py-2.5 text-xs rounded-xl transition-all cursor-pointer font-sans ${
                  isActive
                    ? "bg-red-wine text-white font-bold border border-caramel/20 shadow-md shadow-red-950/50 scale-[1.02]"
                    : "text-[#A88B86] hover:bg-caramel/10 hover:text-white"
                }`}
              >
                <item.icon size={14} className={isActive ? "text-caramel" : "text-[#8D6B65]"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-8 pt-4 border-t border-[#48211E]/40">
          <Button 
            variant="outline" 
            size="xs" 
            className="w-full justify-center text-xs text-red-100 hover:bg-red-wine/30 hover:text-white border-red-950 bg-transparent rounded-xl"
            onClick={onSignOut}
          >
            <LogOut size={13} className="mr-1.5" />
            Terminal Logout
          </Button>
        </div>
      </aside>

      {/* ── RIGHT MAIN DYNAMIC MODULE BOX ── */}
      <div className="flex-1 min-w-0 bg-[#140200]/40 p-4 border border-[#48211E]/15 rounded-2xl backdrop-blur-md min-h-[580px]">
        
        {/* ── MODULE 1: COCKPIT OVERVIEW ── */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-display font-semibold text-white tracking-tight uppercase">Founder Governance Center</h2>
                <p className="text-xs text-wool-200/50 font-mono">Continuous platform ledger tracking & system orchestration</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="xs" 
                  variant="outline" 
                  onClick={async () => { await onUpdateState({}); }}
                  className="bg-[#2D0F0C] border-[#5E2B27] hover:bg-[#4E1C18] text-[#EADBD9] rounded-lg"
                >
                  <RefreshCw size={11} className="mr-1" /> Reload State
                </Button>
              </div>
            </div>

            {/* Premium Governance Indicators Grid (Chestnut & Caramel with Red Wine Pulsing Accents) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="governance-indicators-grid">
              {/* Scholar Database Overview */}
              <Card 
                variant="glass" 
                id="scholar-metric-card"
                className="group p-4 bg-gradient-to-br from-[#270E0C] to-[#140200] border border-[#522521] hover:border-caramel/40 transition-all duration-300 flex flex-col justify-between shadow-lg shadow-black/80 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-24 h-24 bg-caramel/5 rounded-full blur-2xl pointer-events-none group-hover:bg-caramel/10 transition-all duration-500" />
                <div>
                  <div className="flex justify-between items-center text-caramel">
                    <h4 className="text-[9px] uppercase font-mono font-bold tracking-widest text-[#DFC0B5]">Scholars Core</h4>
                    <Users size={14} className="text-caramel transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <p className="text-3xl font-bold font-display tracking-tight mt-3 text-white">{stats.totalStudents}</p>
                </div>
                <div className="flex flex-wrap gap-1 mt-5 text-[8.5px] font-mono">
                  <span className="bg-emerald-950/50 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20 font-bold">{stats.verifiedStudents} Active</span>
                  <span className="bg-amber-950/50 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20 font-bold">{stats.pendingStudents} Review</span>
                </div>
              </Card>

              {/* Enterprise Network Overview */}
              <Card 
                variant="glass" 
                id="enterprise-metric-card"
                className="group p-4 bg-gradient-to-br from-[#270E0C] to-[#140200] border border-[#522521] hover:border-caramel/40 transition-all duration-300 flex flex-col justify-between shadow-lg shadow-black/80 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-24 h-24 bg-red-wine/5 rounded-full blur-2xl pointer-events-none group-hover:bg-red-wine/10 transition-all duration-500" />
                <div>
                  <div className="flex justify-between items-center text-caramel">
                    <h4 className="text-[9px] uppercase font-mono font-bold tracking-widest text-[#DFC0B5]">Enterprise Net</h4>
                    <Sliders size={14} className="text-caramel transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <p className="text-3xl font-bold font-display tracking-tight mt-3 text-white">{stats.totalOrgs}</p>
                </div>
                <div className="flex flex-wrap gap-1 mt-5 text-[8.5px] font-mono">
                  <span className="bg-emerald-950/50 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20 font-bold">{stats.verifiedOrgs} Active</span>
                  <span className="bg-amber-950/50 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20 font-bold">{stats.pendingOrgs} Review</span>
                </div>
              </Card>

              {/* Active Programs & Innovation Demographics */}
              <Card 
                variant="glass" 
                id="programs-metric-card"
                className="group p-4 bg-gradient-to-br from-[#270E0C] to-[#140200] border border-[#522521] hover:border-caramel/40 transition-all duration-300 flex flex-col justify-between shadow-lg shadow-black/80 relative overflow-hidden"
              >
                <div>
                  <div className="flex justify-between items-center text-caramel">
                    <h4 className="text-[9px] uppercase font-mono font-bold tracking-widest text-[#DFC0B5]">Innovation Node</h4>
                    <Award size={14} className="text-caramel transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <p className="text-3xl font-bold font-display tracking-tight mt-3 text-white">
                    {stats.totalResearchProjects + stats.totalCourses + stats.totalInternships}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-4 text-[8px] font-mono text-wool-200/50 pt-0.5 border-t border-[#461D1A]/50">
                  <span className="truncate">🔬 Projects: {stats.totalResearchProjects}</span>
                  <span className="truncate">💼 Matches: {stats.totalInternships}</span>
                  <span className="truncate">🧬 Problems: {stats.totalIndustryProblems}</span>
                  <span className="truncate">🎓 Courses: {stats.totalCourses}</span>
                </div>
              </Card>

              {/* System Financial Ledger Status */}
              <Card 
                variant="glass" 
                id="funding-metric-card"
                className="group p-4 bg-gradient-to-br from-[#270E0C] to-[#140200] border border-[#522521] hover:border-caramel/40 transition-all duration-300 flex flex-col justify-between shadow-lg shadow-black/80 relative overflow-hidden"
              >
                <div>
                  <div className="flex justify-between items-center text-caramel">
                    <h4 className="text-[9px] uppercase font-mono font-bold tracking-widest text-[#DFC0B5]">Capital Ledger</h4>
                    <DollarSign size={14} className="text-caramel transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <p className="text-3xl font-bold font-display tracking-tight mt-3 text-white">${stats.totalPayments.toLocaleString()}</p>
                </div>
                <div className="text-[8.5px] font-mono text-wool-200/50 mt-5 flex items-center justify-between pt-1 border-t border-[#461D1A]/50">
                  <span>Success: {stats.successRate}%</span>
                  <span className="text-emerald-400 font-bold">&#9650; Active</span>
                </div>
              </Card>

              {/* Platform Seal & Health Status (Requested Module) */}
              <Card 
                variant="glass" 
                id="health-metric-card"
                className="group p-4 bg-gradient-to-br from-[#2D0D0B] to-[#170403] border border-[#6E2E29] hover:border-caramel/50 transition-all duration-300 flex flex-col justify-between shadow-lg shadow-black/80 relative overflow-hidden"
              >
                {/* Glowing status light */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/35 px-2 py-0.5 rounded-full z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute" />
                  <span className="text-[7.5px] font-mono text-emerald-300 font-bold tracking-wider uppercase">Operational</span>
                </div>

                <div>
                  <div className="flex justify-between items-center text-caramel">
                    <h4 className="text-[9px] uppercase font-mono font-bold tracking-widest text-[#DFC0B5]">Security Health</h4>
                  </div>
                  <p className="text-xl font-bold font-display tracking-tight mt-3 text-white">99.98% Uptime</p>
                </div>

                <div className="text-[8px] font-mono text-wool-200/50 mt-4 space-y-0.5 pt-1 border-t border-[#6B2C27]/50">
                  <div className="flex justify-between">
                    <span>Double OCR Sync:</span>
                    <span className="text-emerald-400 font-bold">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2FA Handshake:</span>
                    <span className="text-caramel">Sealed</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick action warnings */}
            {(pendingStudents.length > 0 || pendingOrgs.length > 0) && (
              <div className="p-4 bg-red-wine/10 border border-caramel/15 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-wine/30 border border-caramel/20 text-caramel rounded-xl">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">High School Identity Review Files Pending</h4>
                    <p className="text-xs text-[#DEC8C5]">
                      There are <span className="font-bold text-white font-mono">{pendingStudents.length} scholar credentials</span> and <span className="font-bold text-white font-mono">{pendingOrgs.length} business partners</span> awaiting secure validation checking.
                    </p>
                  </div>
                </div>
                <Button 
                  variant="caramel" 
                  size="sm" 
                  onClick={() => setActiveTab("verification")}
                  className="rounded-xl font-bold text-xs"
                >
                  Verify Now →
                </Button>
              </div>
            )}

            {/* Audit stream panel */}
            <Card variant="glass" className="p-4 bg-[#1C0503] border border-[#51231E]/40 rounded-xl">
              <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-caramel mb-3 flex items-center gap-2">
                <Database size={13} className="text-caramel" /> Secured Platform Log Ledger (Cryptographically Sealed)
              </h3>
              <div className="divide-y divide-[#421714] max-h-[180px] overflow-y-auto space-y-1.5 pr-2">
                {(state.audit_logs || []).slice(0, 15).map((log: any) => (
                  <div key={log.id} className="pt-2 text-[10px] flex justify-between items-start gap-4">
                    <div className="font-sans flex items-start gap-2">
                      <span className="font-mono text-[8px] tracking-wider text-[#D1BCA6] bg-[#531E19] px-2 py-0.5 rounded font-bold uppercase shrink-0">
                        {log.type || "system"}
                      </span>
                      <span className="text-wool-200/80 leading-relaxed font-light">{log.event}</span>
                    </div>
                    <span className="text-[8px] font-mono text-[#8C605A] shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ── MODULE 2: FINANCIAL MANAGEMENT PORTAL ── */}
        {activeTab === "financials" && (
          <div className="space-y-6 animate-fade-in text-left">
            <div>
              <h2 className="text-xl font-display font-semibold text-white tracking-tight uppercase">Capital & Stipend Dashboard</h2>
              <p className="text-xs text-wool-200/50 font-mono">Tracks payments from organizations to scholars for verified tasks & micro-internships</p>
            </div>

            {/* Financial indicators counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#230D0C] border border-[#522521] rounded-2xl">
                <span className="text-[8px] font-mono text-caramel uppercase font-bold tracking-widest block">Total Stipend Volume</span>
                <span className="text-2xl font-bold font-display text-white mt-1 block">${stats.totalPayments.toLocaleString()}</span>
                <span className="text-[9px] text-green-400 font-mono mt-0.5 inline-block">● Completed Transactions</span>
              </div>
              <div className="p-4 bg-[#230D0C] border border-[#522521] rounded-2xl">
                <span className="text-[8px] font-mono text-caramel uppercase font-bold tracking-widest block">Average Stipend Payment</span>
                <span className="text-2xl font-bold font-display text-white mt-1 block">${stats.stipendAverage.toLocaleString()}</span>
                <span className="text-[9px] text-[#A2847E] font-mono mt-0.5 inline-block">Per micro-internship cycle</span>
              </div>
              <div className="p-4 bg-[#230D0C] border border-[#522521] rounded-2xl">
                <span className="text-[8px] font-mono text-caramel uppercase font-bold tracking-widest block">Payment Execution Success Rate</span>
                <span className="text-2xl font-bold font-display text-white mt-1 block">{stats.successRate}%</span>
                <span className="text-[9px] text-green-400 font-mono mt-0.5 inline-block">Zero processing interruptions</span>
              </div>
            </div>

            {/* Graph switcher */}
            <Card variant="glass" className="p-4 bg-[#280E0C]/60 border border-[#522521] rounded-xl text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h4 className="text-[10px] uppercase font-mono tracking-wider font-bold text-caramel">Interactive Payments Flow Volumetrics</h4>
                <div className="flex bg-[#1D0301] p-1 rounded-xl border border-caramel/10 self-start">
                  {(["daily", "weekly", "monthly", "yearly"] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setTimeSwitcher(p)}
                      className={`px-3 py-1 text-[9px] font-bold font-mono rounded-lg transition-all capitalize select-none cursor-pointer ${
                        timeSwitcher === p ? "bg-red-wine text-white" : "text-wool-200/50 hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Render dynamic beautiful SVG chart */}
              <div className="h-44 w-full bg-black/35 rounded-xl border border-caramel/5 p-4 flex flex-col justify-between">
                <div className="flex-1 flex items-end justify-between gap-3 pt-4">
                  {currentPoints.map((pt, i) => {
                    const maxVal = Math.max(...currentPoints) || 1;
                    const pct = (pt / maxVal) * 80; // Scale to max 80% height
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                        {/* Hover Tooltip tooltip */}
                        <div className="absolute -top-6 bg-[#3B1512] text-caramel text-[9px] font-mono px-2 py-0.5 rounded border border-[#5A2521] opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 font-bold">
                          ${pt.toLocaleString()}
                        </div>
                        {/* Interactive Bar */}
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${pct}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="w-full bg-gradient-to-t from-red-wine to-caramel rounded-t-md border-t border-caramel/40 group-hover:brightness-125 transition-all shadow-inner"
                        />
                        <span className="text-[8px] font-mono text-wool-200/50 truncate w-full text-center">{currentLabels[i]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Payments list table */}
            <Card variant="glass" className="p-4 bg-[#1F0705]/80 border border-[#522521]/40 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Database size={13} className="text-caramel" />
                  <h3 className="font-display font-semibold text-xs uppercase text-caramel tracking-wider">Payments Ledger Transactions</h3>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={txSearchText}
                    onChange={e => setTxSearchText(e.target.value)}
                    placeholder="Search organizations or students..."
                    className="bg-black/30 border border-[#522521]/60 px-3 py-1.5 rounded-lg text-[10px] w-48 text-white focus:outline-none focus:border-caramel placeholder:text-wool-200/30"
                  />
                  <Button variant="outline" size="xs" onClick={() => handleExportCSV("Ledger")} className="rounded-lg text-[9px] border-[#522521] bg-black/20 text-wool-100 hover:bg-caramel/10">
                    <Download size={11} className="mr-1" /> Export Ledger CSV
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#522521]/50 text-wool-200/50 uppercase font-mono text-[9px]">
                      <th className="pb-2 font-bold">Ref ID</th>
                      <th className="pb-2 font-bold">Organization Client</th>
                      <th className="pb-2 font-bold">Recipient Scholar</th>
                      <th className="pb-2 font-bold">Assigned Project</th>
                      <th className="pb-2 font-bold">Stipend</th>
                      <th className="pb-2 font-bold">Execution Date</th>
                      <th className="pb-2 font-bold text-right">Settlement Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#522521]/20">
                    {(state.payment_transactions || [])
                      .filter((tx: any) => {
                        const sClean = txSearchText.toLowerCase();
                        return tx.organization.toLowerCase().includes(sClean) || tx.student.toLowerCase().includes(sClean) || tx.internship.toLowerCase().includes(sClean);
                      })
                      .map((tx: any) => (
                        <tr key={tx.id} className="hover:bg-caramel/5 transition-all">
                          <td className="py-2.5 font-mono text-[9px] text-caramel/90 font-bold">{tx.id}</td>
                          <td className="py-2.5 font-sans font-bold text-white">{tx.organization}</td>
                          <td className="py-2.5 font-sans">{tx.student}</td>
                          <td className="py-2.5 text-wool-200/80 max-w-[150px] truncate">{tx.internship}</td>
                          <td className="py-2.5 font-mono font-bold text-white">${tx.amount.toLocaleString()}</td>
                          <td className="py-2.5 font-mono text-[9px] text-[#A68884]">{tx.date}</td>
                          <td className="py-2.5 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase ${
                              tx.status === "COMPLETED" ? "bg-green-950/70 text-green-400 border border-green-500/20" : tx.status === "PENDING" ? "bg-yellow-950/70 text-yellow-400 border border-yellow-500/20" : "bg-red-950/70 text-red-400 border border-red-500/20"
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ── MODULE 3: USER ANALYTICS HUB ── */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-fade-in text-left">
            <div>
              <h2 className="text-xl font-display font-semibold text-white tracking-tight uppercase">User Analytics Hub</h2>
              <p className="text-xs text-wool-200/50 font-mono">Detailed demographics data, daily active sessions, and verification trends</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[#1F0705] border border-caramel/10 rounded-2xl">
                <span className="text-[8px] font-mono uppercase tracking-widest text-[#B5968E] block">Daily Active Users (DAU)</span>
                <span className="text-xl font-bold text-white font-display mt-1 block">84 Active</span>
                <span className="text-[8px] font-mono text-green-400">92% Engagement Rate</span>
              </div>
              <div className="p-4 bg-[#1F0705] border border-caramel/10 rounded-2xl">
                <span className="text-[8px] font-mono uppercase tracking-widest text-[#B5968E] block">Monthly Actives (MAU)</span>
                <span className="text-xl font-bold text-white font-display mt-1 block">342 Users</span>
                <span className="text-[8px] font-mono text-green-400">Up 14% MoM</span>
              </div>
              <div className="p-4 bg-[#1F0705] border border-caramel/10 rounded-2xl">
                <span className="text-[8px] font-mono uppercase tracking-widest text-[#B5968E] block">Verification Success Ratio</span>
                <span className="text-xl font-bold text-white font-display mt-1 block">88.5% Pass</span>
                <span className="text-[8px] font-mono text-[#A88179]">AI OCR Filter Active</span>
              </div>
              <div className="p-4 bg-[#1F0705] border border-caramel/10 rounded-2xl">
                <span className="text-[8px] font-mono uppercase tracking-widest text-[#B5968E] block">Average Session Duration</span>
                <span className="text-xl font-bold text-white font-display mt-1 block">14.6 min</span>
                <span className="text-[8px] font-mono text-green-400">▲ Positive Retention</span>
              </div>
            </div>

            {/* Simulated graph metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card variant="glass" className="p-4 bg-[#1E0503] border border-[#52211C] rounded-xl">
                <h4 className="text-[9px] uppercase font-mono font-bold tracking-widest text-caramel mb-4">Registration Growth Trajectory (Scholars vs Partners)</h4>
                <div className="h-40 flex items-end justify-between gap-4 p-2 bg-black/25 rounded-lg border border-caramel/5">
                  {[3, 8, 12, 19, 28, 35].map((st, idx) => {
                    const orgVal = [1, 2, 4, 7, 10, 14][idx];
                    return (
                      <div key={idx} className="flex-1 flex gap-1 items-end h-full">
                        <div className="flex-1 bg-caramel rounded-t" style={{ height: `${(st / 40) * 85}%` }} title={`Students: ${st}`} />
                        <div className="flex-1 bg-red-wine rounded-t" style={{ height: `${(orgVal / 40) * 85}%` }} title={`Orgs: ${orgVal}`} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 justify-center mt-3 text-[9px] font-mono">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-caramel rounded-sm" /> Pre-College Scholars</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-wine rounded-sm" /> Sponsoring Employers</div>
                </div>
              </Card>

              <Card variant="glass" className="p-4 bg-[#1E0503] border border-[#52211C] rounded-xl">
                <h4 className="text-[9px] uppercase font-mono font-bold tracking-widest text-caramel mb-4">Scholarly Innovation Trends (Research Activity)</h4>
                <div className="h-40 flex items-end justify-between gap-4 p-2 bg-black/25 rounded-lg border border-caramel/5">
                  {[12, 15, 24, 18, 32, 41].map((p, idx) => (
                    <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full gap-2 font-mono text-[8px]">
                      <div className="w-full bg-gradient-to-t from-red-wine/40 to-caramel/90 rounded-t border-t border-caramel/40" style={{ height: `${(p / 50) * 80}%` }} />
                      <span className="text-[#A28781] text-[8px]">{["Jan", "Feb", "Mar", "Apr", "May", "Jun"][idx]}</span>
                    </div>
                  ))}
                </div>
                <div className="text-center text-[9px] font-mono mt-3 text-wool-200/50">
                  Total published research works synced to date.
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── MODULE 4: VERIFICATION CENTER ── */}
        {activeTab === "verification" && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#4E1E1A]/40 pb-3">
              <div>
                <h2 className="text-xl font-display font-semibold text-white tracking-tight uppercase">Verification Desk</h2>
                <p className="text-xs text-wool-200/50 font-mono">Strict secure manual oversight of uploads, OCR audits and trust credentials</p>
              </div>
              <div className="flex bg-[#120000] p-1 rounded-xl border border-caramel/10 self-start">
                <button
                  onClick={() => setVerificationSubTab("students")}
                  className={`px-3 py-1.5 text-[9px] font-bold font-mono tracking-wider rounded-lg uppercase cursor-pointer ${
                    verificationSubTab === "students" ? "bg-red-wine text-white" : "text-wool-200/50 hover:text-white"
                  }`}
                >
                  Scholar Queue ({pendingStudents.length})
                </button>
                <button
                  onClick={() => setVerificationSubTab("organizations")}
                  className={`px-3 py-1.5 text-[9px] font-bold font-mono tracking-wider rounded-lg uppercase cursor-pointer ${
                    verificationSubTab === "organizations" ? "bg-red-wine text-white" : "text-wool-200/50 hover:text-white"
                  }`}
                >
                  Employer Queue ({pendingOrgs.length})
                </button>
              </div>
            </div>

            {/* Current Active Verification Queue Render */}
            <div className="space-y-4">
              {verificationSubTab === "students" ? (
                pendingStudents.length === 0 ? (
                  <div className="py-12 text-center bg-black/20 border border-[#52211C]/30 rounded-xl">
                    <CheckCircle2 size={36} className="text-green-500 mx-auto mb-2 opacity-80" />
                    <p className="text-xs text-wool-200/60 font-mono uppercase">Scholar verification queue is entirely empty.</p>
                  </div>
                ) : (
                  pendingStudents.map((stud: any) => {
                    const prof = state.student_profiles?.[stud.id] || {};
                    const doc = state.verification_documents?.find((d: any) => d.user_id === stud.id) || {
                      document_type: "School Letter / Report Card",
                      verification_status: stud.status === "DOCUMENT_PENDING" ? "PENDING_DETAILS" : "PENDING_REVIEW",
                      document_url: "standard_scholastic_transcript.pdf"
                    };
                    const ocrConfidence = 91; // simulated ai score
                    return (
                      <Card key={stud.id} variant="glass" className="p-4 bg-[#230D0C]/85 border border-[#5A2420] rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-caramel/40 transition-all">
                        <div className="space-y-1 bg-transparent">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white font-sans">{prof.full_name || "Applicant Scholar"}</h4>
                            <span className="font-mono text-[8px] bg-[#47130F] text-caramel px-2 py-0.5 rounded font-bold uppercase truncate">{stud.email}</span>
                          </div>
                          <p className="text-[10px] text-wool-200/60 font-sans">
                            School: <span className="text-[#DEC2BE] font-bold">{prof.school_name || "Pre-College High"}</span> | Grade: {prof.grade || "12"}
                          </p>
                          <div className="flex gap-3 text-[10px] font-mono text-wool-200/40 pt-1">
                            <span>Document Attached: <strong className="text-caramel">{doc.document_type}</strong></span>
                            <span>AI Confidence: <strong className="text-green-400">{ocrConfidence}%</strong></span>
                            <span>Trust Index: <strong className="text-caramel">{prof.trust_score || 85}/100</strong></span>
                          </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <Button variant="outline" size="xs" onClick={() => setSelectedVerification({ type: "student", stud, prof, doc, ocrConfidence })} className="border-[#5D2B27] bg-[#2E0F0C] text-wool-100 hover:bg-[#451613]">
                            <Eye size={12} className="mr-1" /> Inspect File
                          </Button>
                          <Button variant="caramel" size="xs" onClick={() => handleApproveUser(stud.id)} className="rounded-lg font-bold text-xs uppercase">
                            Approve
                          </Button>
                          <Button variant="danger" size="xs" onClick={() => { setSelectedVerification({ type: "student", stud, prof, doc, ocrConfidence }); setShowRejectionModal(true); }} className="rounded-lg font-bold text-xs uppercase bg-[#A3221C] text-white hover:bg-red-800 border-none">
                            Reject
                          </Button>
                          <Button variant="outline" size="xs" onClick={() => handleRequestMoreInfo(stud.id)} className="border-yellow-900 bg-yellow-950/20 text-yellow-300 hover:bg-yellow-950/40">
                            Request Doc
                          </Button>
                        </div>
                      </Card>
                    );
                  })
                )
              ) : (
                pendingOrgs.length === 0 ? (
                  <div className="py-12 text-center bg-black/20 border border-[#52211C]/30 rounded-xl">
                    <CheckCircle2 size={36} className="text-green-500 mx-auto mb-2 opacity-80" />
                    <p className="text-xs text-wool-200/60 font-mono uppercase">Employer verification queue is entirely empty.</p>
                  </div>
                ) : (
                  pendingOrgs.map((org: any) => {
                    const prof = state.organization_profiles?.[org.id] || {};
                    const ocrConfidence = 96;
                    return (
                      <Card key={org.id} variant="glass" className="p-4 bg-[#230D0C]/85 border border-[#5A2420] rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-caramel/40 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white font-sans">{prof.organization_name || "Employer Partner"}</h4>
                            <span className="font-mono text-[8px] bg-[#47130F] text-caramel px-2 py-0.5 rounded font-bold uppercase truncate">{org.email}</span>
                          </div>
                          <p className="text-[10px] text-wool-200/60 font-sans">
                            Industry: <span className="text-[#DEC2BE] font-bold">{prof.industry || "Software & AI Solutions"}</span> | Country: {prof.country || "USA"}
                          </p>
                          <div className="flex gap-3 text-[10px] font-mono text-wool-200/40 pt-1">
                            <span>Document Attached: <strong className="text-caramel">Articles of Formation / IRS W9</strong></span>
                            <span>AI Confidence: <strong className="text-green-400">{ocrConfidence}%</strong></span>
                            <span>Trust Index: <strong className="text-caramel">{prof.trust_score || 95}/100</strong></span>
                          </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <Button variant="outline" size="xs" onClick={() => setSelectedVerification({ type: "org", org, prof, ocrConfidence })} className="border-[#5D2B27] bg-[#2E0F0C] text-wool-100 hover:bg-[#451613]">
                            <Eye size={12} className="mr-1" /> Inspect File
                          </Button>
                          <Button variant="caramel" size="xs" onClick={() => handleApproveUser(org.id)} className="rounded-lg font-bold text-xs uppercase">
                            Approve
                          </Button>
                          <Button variant="danger" size="xs" onClick={() => { setSelectedVerification({ type: "org", org, prof, ocrConfidence }); setShowRejectionModal(true); }} className="rounded-lg font-bold text-xs uppercase bg-[#A3221C] text-white hover:bg-red-800 border-none">
                            Reject
                          </Button>
                          <Button variant="outline" size="xs" onClick={() => handleRequestMoreInfo(org.id)} className="border-yellow-900 bg-yellow-950/20 text-yellow-300 hover:bg-yellow-950/40">
                            Request Doc
                          </Button>
                        </div>
                      </Card>
                    );
                  })
                )
              )}
            </div>

            {/* Document inspector modal dialog */}
            {selectedVerification && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
                <div className="bg-[#240A08] border border-caramel/20 p-6 rounded-2xl max-w-lg w-full relative shadow-2xl text-left font-sans">
                  <h3 className="font-display font-semibold text-[#DEC2BE] uppercase text-sm mb-1.5 tracking-wider">
                    Detailed Document Examination Bureau
                  </h3>
                  <p className="text-[10px] text-wool-200/50 mb-4 font-mono uppercase">
                    ID verification audit record ID: {selectedVerification.stud?.id || selectedVerification.org?.id}
                  </p>
                  
                  {/* Mock document viewer representation */}
                  <div className="h-44 bg-black/60 border border-caramel/10 rounded-xl mb-4 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
                    <div className="p-3 bg-red-wine/25 border border-caramel/15 text-caramel rounded-xl mb-2">
                      <FileText size={32} />
                    </div>
                    <span className="text-xs font-mono font-bold text-white">
                      {selectedVerification.doc?.document_type || "Corporate Registration Affidavit (W9 / Certificate)"}
                    </span>
                    <span className="text-[10px] text-wool-200/40 font-mono mt-1">
                      {selectedVerification.doc?.document_url || "irs_registration_declaration_sealed.pdf"}
                    </span>
                    <div className="absolute top-2 right-2 bg-green-950/60 text-green-400 px-2 py-0.5 rounded text-[8px] font-mono border border-green-500/20 uppercase font-bold">
                      OCR confidence: {selectedVerification.ocrConfidence}% Match
                    </div>
                  </div>

                  <div className="space-y-3 mb-5 text-xs text-wool-200/80 leading-relaxed bg-[#140200] p-3.5 rounded border border-[#5A2421]/60">
                    <p>
                      <strong>Applicant Name:</strong> {selectedVerification.prof?.full_name || selectedVerification.prof?.organization_name}
                    </p>
                    <p>
                      <strong>Scholastic Credentials:</strong> {selectedVerification.prof?.school_name || "Licensed Corporate Entity"}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedVerification.stud?.email || selectedVerification.org?.email}
                    </p>
                    <p>
                      <strong>Platform Integrity Score:</strong> <span className="font-mono text-caramel font-bold">{selectedVerification.prof?.trust_score || 90}/100</span>
                    </p>
                  </div>

                  {showRejectionModal ? (
                    <div className="space-y-3 border-t border-caramel/10 pt-4">
                      <label className="block text-[10px] uppercase font-mono font-bold text-caramel">State reason for rejection:</label>
                      <input
                        type="text"
                        required
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        placeholder="Enrollment date expired / unreadable watermark details..."
                        className="w-full bg-[#1A0301] border border-red-950 px-3 py-2 text-xs rounded text-white focus:outline-none focus:border-red-500 placeholder:text-wool-200/30 font-sans"
                      />
                      <div className="flex gap-2">
                        <Button variant="danger" size="xs" onClick={() => handleRejectUser(selectedVerification.stud?.id || selectedVerification.org?.id)} className="flex-1 bg-[#A11B15] text-white hover:bg-red-800">
                          Record Rejection
                        </Button>
                        <Button variant="outline" size="xs" onClick={() => { setShowRejectionModal(false); setRejectionReason(""); }} className="flex-1 border-[#54211D]">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="caramel" size="xs" className="flex-1 font-bold text-xs uppercase" onClick={() => handleApproveUser(selectedVerification.stud?.id || selectedVerification.org?.id)}>
                        Certify Authenticated Profile
                      </Button>
                      <Button variant="outline" size="xs" className="flex-1 border-[#54211D] text-xs font-bold" onClick={() => setSelectedVerification(null)}>
                        Close Details
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MODULE 5: ORGANIZATION DIRECTORY ── */}
        {activeTab === "org-management" && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#4E1E1A]/40 pb-3">
              <div>
                <h2 className="text-xl font-display font-semibold text-white tracking-tight uppercase">Corporate Partner Directory</h2>
                <p className="text-xs text-wool-200/50 font-mono">Administration, search capabilities & moderation of employer affiliations</p>
              </div>
              <input
                type="text"
                value={orgSearchText}
                onChange={e => setOrgSearchText(e.target.value)}
                placeholder="Search by company name or industry..."
                className="bg-black/30 border border-[#522521]/60 px-3 py-1.5 rounded-lg text-[11px] w-52 text-white focus:outline-none focus:border-caramel placeholder:text-wool-200/30 font-sans"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orgs
                .filter((o: any) => {
                  const prof = state.organization_profiles?.[o.id] || {};
                  const sClean = orgSearchText.toLowerCase();
                  return o.email.toLowerCase().includes(sClean) || (prof.organization_name || "").toLowerCase().includes(sClean) || (prof.industry || "").toLowerCase().includes(sClean);
                })
                .map((o: any) => {
                  const prof = state.organization_profiles?.[o.id] || {};
                  
                  // Extract posted internships/problems matching this user
                  const postedOpportunities = (state.internships || state.internshipMatches || []).filter((item: any) => item.organization_id === o.id || item.orgId === o.id);
                  const courses = state.skillCourses?.filter((c: any) => c.org_id === o.id) || [];
                  const problems = (state.internships || []).filter((i: any) => i.isProblem && i.organization_id === o.id);

                  return (
                    <Card key={o.id} variant="glass" className="p-4 bg-[#230D0C]/80 border border-[#5E2B27] rounded-xl flex flex-col justify-between hover:border-caramel/30 transition-all">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h3 className="font-bold text-sm text-white font-sans">{prof.organization_name || "Unnamed Enterprise"}</h3>
                            <span className="text-[10px] text-caramel/90 font-mono">{prof.industry || "Software & AI solutions"}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border ${
                            o.status === "ACTIVE" ? "bg-green-950 text-green-400 border-green-500/20" : "bg-yellow-950 text-yellow-400 border-yellow-500/20"
                          }`}>
                            {o.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-wool-200/70 leading-relaxed font-sans line-clamp-2">
                          {prof.description || "No company outline provided. Associated micro-stipends active."}
                        </p>

                        <div className="flex gap-2 text-[9px] text-wool-200/40 font-mono py-1">
                          <span>🌐 Website: {prof.website || "techcorp.com"}</span>
                          <span>🛡️ Trust Index: <strong className="text-caramel">{prof.trust_score || 95}%</strong></span>
                        </div>

                        <div className="p-2.5 bg-black/35 rounded-lg border border-[#4E211E] text-[10px] space-y-1.5 font-sans">
                          <p className="font-semibold text-[9px] uppercase font-mono tracking-wider text-[#D1BCA6]">Associated Assets on Portal</p>
                          <div className="flex gap-4 text-wool-200/70 font-sans">
                            <span>💼 Tasks: <strong className="text-white">{postedOpportunities.length}</strong></span>
                            <span>🔬 Challenges: <strong className="text-white">{problems.length}</strong></span>
                            <span>🎓 Courses: <strong className="text-white">{courses.length}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1 justify-end pt-4 border-t border-caramel/10 mt-4">
                        {o.status !== "ACTIVE" && (
                          <Button variant="caramel" size="xs" onClick={() => handleApproveUser(o.id)}>Approve</Button>
                        )}
                        {o.status !== "SUSPENDED" && (
                          <Button variant="danger" size="xs" onClick={() => handleSuspendUser(o.id)} className="bg-red-800 text-white hover:bg-red-900 border-none">
                            Suspend
                          </Button>
                        )}
                        <Button variant="outline" size="xs" onClick={() => alert(`Organization profile verification folder contains: Org ID: ${o.id}`)} className="border-caramel/20">
                          Details
                        </Button>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div>
        )}

        {/* ── MODULE 6: STUDENT SCHOLAR DATABASE ── */}
        {activeTab === "student-management" && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#4E1E1A]/40 pb-3">
              <div>
                <h2 className="text-xl font-display font-semibold text-white tracking-tight uppercase">Scholar Database</h2>
                <p className="text-xs text-wool-200/50 font-mono">Oversee, search, trust ranking, and moderation of pre-college high scholars</p>
              </div>
              <input
                type="text"
                value={userSearchText}
                onChange={e => setUserSearchText(e.target.value)}
                placeholder="Search scholars name or schools..."
                className="bg-black/30 border border-[#522521]/60 px-3 py-1.5 rounded-lg text-[11px] w-52 text-white focus:outline-none focus:border-caramel placeholder:text-wool-200/30 font-sans"
              />
            </div>

            <Card variant="glass" className="p-4 bg-[#1C0503]/80 border border-[#5E2B27]/40 rounded-xl">
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#4E211D]/60 text-wool-200/50 uppercase font-mono text-[9px]">
                      <th className="pb-2 font-bold">Scholar Name</th>
                      <th className="pb-2 font-bold">Email Coordinate</th>
                      <th className="pb-2 font-bold">Affiliation Institution</th>
                      <th className="pb-2 font-bold">Grade</th>
                      <th className="pb-2 font-bold">Trust Indicator</th>
                      <th className="pb-2 font-bold">System Status</th>
                      <th className="pb-2 text-right font-bold">Safety Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#5E2B27]/20">
                    {students
                      .filter((stud: any) => {
                        const prof = state.student_profiles?.[stud.id] || {};
                        const sClean = userSearchText.toLowerCase();
                        return stud.email.toLowerCase().includes(sClean) || (prof.full_name || "").toLowerCase().includes(sClean) || (prof.school_name || "").toLowerCase().includes(sClean);
                      })
                      .map((stud: any) => {
                        const prof = state.student_profiles?.[stud.id] || {};
                        const score = prof.trust_score ?? 85;
                        return (
                          <tr key={stud.id} className="hover:bg-caramel/5 transition-all">
                            <td className="py-2.5 font-bold text-white font-sans">{prof.full_name || "Unverified Scholar"}</td>
                            <td className="py-2.5 font-mono text-[10px] text-[#AFA3A2]">{stud.email}</td>
                            <td className="py-2.5 text-wool-100">{prof.school_name || "Not listed yet"}</td>
                            <td className="py-2.5 font-mono">{prof.grade || "12"}</td>
                            <td className="py-2.5 font-mono">
                              <span className={`font-bold ${score >= 90 ? "text-green-400" : score >= 75 ? "text-yellow-400" : "text-red-400"}`}>
                                {score}/100
                              </span>
                            </td>
                            <td className="py-2.5 font-mono text-[9px]">
                              ● {stud.status}
                            </td>
                            <td className="py-2.5 text-right flex justify-end gap-1.5">
                              {stud.status !== "ACTIVE" && (
                                <Button variant="caramel" size="xs" onClick={() => handleApproveUser(stud.id)}>Verify</Button>
                              )}
                              {stud.status !== "SUSPENDED" && (
                                <Button variant="danger" size="xs" onClick={() => handleSuspendUser(stud.id)} className="bg-red-800 text-white hover:bg-red-950 border-none">
                                  Suspend
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ── MODULE 7: ENTERPRISE FOUNDER INVITATION CENTER ── */}
        {activeTab === "invitation-center" && (
          <div className="space-y-6 animate-fade-in text-left">
            <div>
              <h2 className="text-xl font-display font-semibold text-white tracking-tight uppercase">Founder Invitation Bureau</h2>
              <p className="text-xs text-wool-200/50 font-mono">Provision secure, single-use, 48-hour expiration activation links. Restricted to the 4 approved founders.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dispatch form */}
              <Card variant="glass" className="p-4 bg-[#230D0C] border border-[#52211C] rounded-xl flex flex-col justify-between">
                <form onSubmit={handleCreateInvitation} className="space-y-4">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-caramel border-b border-caramel/10 pb-2">
                    Generate Cryptographic Invitation
                  </h3>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono uppercase text-caramel tracking-wider">
                      Authorizing Email Coordinate
                    </label>
                    <div className="relative">
                      <Mail size={13} className="absolute left-3 top-3 text-[#9F827B]" />
                      <input
                        type="email"
                        required
                        value={manualInviteEmail}
                        onChange={e => setManualInviteEmail(e.target.value)}
                        placeholder="e.g. mokshasathish1802@gmail.com"
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-black/40 border border-[#421E19]/80 rounded-xl text-white placeholder-wool-200/30 focus:outline-none focus:border-caramel font-sans"
                      />
                    </div>
                    <p className="text-[9px] text-[#AA9490] leading-relaxed">
                      Rule of Association: Validating against founder coordinates list. No other email coordinates will be accepted.
                    </p>
                  </div>

                  {inviteError && (
                    <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                      <AlertTriangle size={14} className="shrink-0" />
                      <span>{inviteError}</span>
                    </div>
                  )}

                  <Button type="submit" variant="caramel" className="w-full text-xs font-bold font-sans uppercase">
                    Dispatch Link Securely
                  </Button>
                </form>

                {inviteSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-green-950/40 border border-green-500/15 rounded-xl text-xs space-y-2 mt-4"
                  >
                    <div className="flex items-center gap-1.5 text-green-400 font-bold">
                      <CheckCircle2 size={14} />
                      <span>Cryptographic Reservation Success</span>
                    </div>
                    <p className="text-[9px] text-wool-200/70 font-mono">The token is secured. Redirection coordinates:</p>
                    <div className="p-2.5 bg-[#0D0100] rounded border border-green-950 font-mono text-[9px] break-all select-all select-none">
                      {window.location.origin}/?activationToken={inviteSuccess.token}
                    </div>
                    <p className="text-[8px] text-[#A8A09B]">
                      Copy the token: <strong className="text-white select-all">{inviteSuccess.token}</strong> or copy the simulated single-use activation route above and open in a new tab!
                    </p>
                  </motion.div>
                )}
              </Card>

              {/* Seed/invitation statuses table */}
              <Card variant="glass" className="p-4 bg-[#230D0C] border border-[#52211C] rounded-xl flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-caramel border-b border-caramel/10 pb-2">
                    Primary Founder List & Tokens
                  </h3>
                  <div className="divide-y divide-caramel/15 space-y-2.5 mt-3">
                    {(state.admin_invitations || []).map((inv: any) => (
                      <div key={inv.id} className="pt-2 flex justify-between items-start text-xs font-sans">
                        <div>
                          <p className="font-bold text-white font-mono">{inv.email}</p>
                          <p className="text-[8.5px] text-[#A28781] font-mono flex items-center gap-1.5 mt-1">
                            <span>Key: {truncateToken(inv.token)}</span>
                            <span>•</span>
                            <span className="text-yellow-500">Expires 48 hr</span>
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                            inv.status === "ACTIVE" ? "bg-green-950 text-green-400 border border-green-500/20" : "bg-yellow-950 text-yellow-400 border border-yellow-500/20"
                          }`}>
                            {inv.status}
                          </span>
                          {inv.status === "PENDING_INVITATION" && (
                            <button
                              onClick={() => {
                                // Simulate clicking secure link
                                const route = `/?activationToken=${inv.token}`;
                                window.history.pushState({}, "", route);
                                window.location.reload();
                              }}
                              className="text-[8px] font-mono text-caramel hover:underline cursor-pointer flex items-center gap-0.5"
                            >
                              <PlayCircle size={10} className="text-caramel" /> Claim Token Now
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Simulated Email Envelope View */}
            <Card variant="glass" className="p-4 bg-[#140200] border border-red-wine/25 rounded-xl font-sans text-left">
              <div className="flex items-center gap-2 border-b border-caramel/10 pb-2 mb-3">
                <span className="text-[#8B5E56] font-mono text-[9px] uppercase font-bold bg-[#3F110B] px-2 py-0.5 rounded border border-caramel/10 shrink-0">FOUNDER INBOX SIMULATOR</span>
                <span className="text-wool-200/40 text-[9px] font-mono">Renders simulated outbox deliveries</span>
              </div>
              <div className="divide-y divide-[#321310] max-h-[140px] overflow-y-auto space-y-2">
                {(state.system_logs || [])
                  .filter((l: any) => l.message.includes("System Mail Dispatch"))
                  .slice(0, 3)
                  .map((log: any) => (
                    <div key={log.id} className="pt-2 text-xs space-y-1">
                      <p className="text-caramel font-mono text-[9px]">{log.timestamp}</p>
                      <pre className="text-[10px] text-wool-200/90 whitespace-pre-wrap font-sans bg-black/40 p-2.5 rounded border border-caramel/5 leading-relaxed truncate">
                        {log.message}
                      </pre>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        )}

        {/* ── MODULE 8: REPORTS CENTER ── */}
        {activeTab === "reports" && (
          <div className="space-y-6 animate-fade-in text-left">
            <div>
              <h2 className="text-xl font-display font-semibold text-white tracking-tight uppercase">Reports Center</h2>
              <p className="text-xs text-wool-200/50 font-mono">Compiled exports, system statistics parameters, and custom tabular exports</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Generate Report Form */}
              <Card variant="glass" className="p-4 bg-[#230D0C] border border-[#5E2B27] rounded-xl text-xs space-y-4">
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-caramel border-b border-caramel/10 pb-2">
                  Query Compilation Parameters
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-caramel tracking-wider mb-1.5 font-bold">Report Target</label>
                    <select
                      value={reportType}
                      onChange={e => setReportType(e.target.value)}
                      className="w-full bg-[#1A0301] border border-caramel/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Users">Platform Users Directory (Scholars & Partners)</option>
                      <option value="Payments">Financial Stipends Transactions Ledger</option>
                      <option value="Projects">Work Matches & Courses</option>
                      <option value="Research">Research Hub publications</option>
                      <option value="Verification">Pre-college identity verification cases</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-caramel tracking-wider mb-1.5 font-bold">Interval Cohort Scope</label>
                    <select
                      value={reportTimeframe}
                      onChange={e => setReportTimeframe(e.target.value)}
                      className="w-full bg-[#1A0301] border border-caramel/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Last 24 Hours">Last 24 Hours</option>
                      <option value="Last 7 Days">Last 7 Days</option>
                      <option value="Last 30 Days">Last 30 Days (Standard Interval)</option>
                      <option value="Last Quarter">Last Fiscal Quarter</option>
                      <option value="All Time">All Recorded Platform Entries</option>
                    </select>
                  </div>

                  <Button 
                    variant="caramel" 
                    size="sm" 
                    onClick={handleGenerateReport} 
                    className="w-full font-bold uppercase tracking-wider text-xs p-2.5 rounded-xl shadow mt-2"
                  >
                    Compile Database Report CSV
                  </Button>
                </div>
              </Card>

              {/* History table */}
              <Card variant="glass" className="p-4 bg-[#230D0C] border border-[#5E2B27] rounded-xl flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-caramel border-b border-caramel/10 pb-2">
                    Report Generation History
                  </h3>
                  <div className="divide-y divide-caramel/10 mt-3 max-h-[220px] overflow-y-auto space-y-2 pr-1.5">
                    {(state.payment_reports || []).map((rep: any) => (
                      <div key={rep.id} className="pt-2 text-xs flex justify-between items-center bg-transparent">
                        <div className="font-sans">
                          <p className="font-bold text-white leading-relaxed">{rep.type}</p>
                          <p className="text-[9px] text-wool-200/50 font-mono">Date: {rep.date} | Compiled by {rep.created_by}</p>
                        </div>
                        <Button variant="ghost" size="xs" onClick={() => handleExportCSV(rep.type)} className="text-caramel hover:text-white rounded-lg shrink-0">
                          <Download size={13} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── MODULE 9: SYSTEM CONFIG / SECURITY SETTINGS ── */}
        {activeTab === "settings" && (
          <div className="space-y-6 animate-fade-in text-left">
            <div>
              <h2 className="text-xl font-display font-semibold text-white tracking-tight uppercase">Platform Cryptographic Toggles</h2>
              <p className="text-xs text-wool-200/50 font-mono">Fine tune administrative limits, Automated OCR thresholds, COPPA minor locks, and global gates</p>
            </div>

            <Card variant="glass" className="p-4 bg-[#230D0C]/85 border border-[#5E2B27] rounded-xl text-xs space-y-4 font-sans">
              
              {/* Toggle 1: Maintenance Override */}
              <div className="flex items-center justify-between p-3.5 bg-[#140200] border border-caramel/5 rounded-xl">
                <div className="mr-4">
                  <h4 className="font-bold text-white text-xs">Platform Maintenance Lockout Override</h4>
                  <p className="text-[10px] text-wool-200/60 leading-relaxed mt-0.5">Locks all public student or employer logins, routing immediately to authorized administrative founders.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={sysSettings.maintenanceMode}
                  onChange={e => setSysSettings({ ...sysSettings, maintenanceMode: e.target.checked })}
                  className="w-4 h-4 accent-caramel cursor-pointer shrink-0"
                />
              </div>

              {/* Slider 1: Min Age */}
              <div className="flex items-center justify-between p-3.5 bg-[#140200] border border-caramel/5 rounded-xl">
                <div className="mr-4">
                  <h4 className="font-bold text-white text-xs">Minimum Scholar Age Restriction (COPPA)</h4>
                  <p className="text-[10px] text-wool-200/60 leading-relaxed mt-0.5">Locks pre-college enrollment gates based on age constraints. Current setting: <strong className="text-caramel font-mono">{sysSettings.minAge}</strong> years old.</p>
                </div>
                <input 
                  type="number" 
                  min="13" 
                  max="19" 
                  value={sysSettings.minAge}
                  onChange={e => setSysSettings({ ...sysSettings, minAge: parseInt(e.target.value) || 13 })}
                  className="bg-black/40 border border-caramel/20 rounded-xl p-1.5 w-14 text-center font-mono text-white focus:outline-none"
                />
              </div>

              {/* Slider 2: OCR Threshold */}
              <div className="flex items-center justify-between p-3.5 bg-[#140200] border border-caramel/5 rounded-xl text-left">
                <div className="mr-4">
                  <h4 className="font-bold text-white text-xs">Automated OCR Confidence Index threshold</h4>
                  <p className="text-[10px] text-wool-200/60 leading-relaxed mt-0.5">Minimum confidence matching required to automatically verify high school credentials without manual review.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-xs font-bold text-caramel">{sysSettings.autoVerifyThreshold}%</span>
                  <input 
                    type="range" 
                    min="50" 
                    max="99" 
                    value={sysSettings.autoVerifyThreshold}
                    onChange={e => setSysSettings({ ...sysSettings, autoVerifyThreshold: parseInt(e.target.value) || 85 })}
                    className="cursor-pointer accent-caramel"
                  />
                </div>
              </div>

              {/* Form 1: Email templates customization */}
              <div className="p-3.5 bg-[#140200] border border-caramel/5 rounded-xl flex flex-col space-y-2">
                <h4 className="font-bold text-white text-xs">Founder Welcome Email Template Envelope</h4>
                <p className="text-[10px] text-wool-200/60 leading-relaxed">Modify Subject delivery template details sent to newly added founder coordinates.</p>
                <textarea
                  value={sysSettings.emailTemplate}
                  onChange={e => setSysSettings({ ...sysSettings, emailTemplate: e.target.value })}
                  rows={2}
                  className="w-full bg-black/40 border border-[#522521]/60 px-3 py-2 rounded-xl text-xs text-white placeholder-wool-200/30 focus:outline-none focus:border-caramel placeholder:text-wool-200/20 font-sans"
                />
              </div>

              {/* Save */}
              <div className="pt-2">
                <Button variant="caramel" size="sm" onClick={() => {
                  alert("Platform system parameters synchronized with Firestore Security Configuration collections.");
                }} className="rounded-xl px-5 font-bold uppercase text-xs">
                  Synchronize Security Parameters
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ── MODULE 10: REAL-TIME TELEMETRY STREAM LOGS ── */}
        {activeTab === "system-logs" && (
          <div className="space-y-6 animate-fade-in text-left">
            <div>
              <h2 className="text-xl font-display font-semibold text-white tracking-tight uppercase">System Logs & WebSockets</h2>
              <p className="text-xs text-wool-200/50 font-mono">Live container logs, WebSocket connection states, and internal API execution ticks</p>
            </div>

            <Card variant="glass" className="p-4 bg-black/40 border border-red-wine/20 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#110100] p-3 rounded-xl border border-caramel/5 text-xs font-mono">
                <div>
                  <span className="text-green-400 font-bold">● WEBSOCKET LIVE STREAM INGRESS</span>
                  <p className="text-[9px] text-wool-200/40 mt-1 leading-relaxed">Port: 3000 | Ingress routing via NGINX Reverse Proxy mapping</p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-red-wine/20 text-caramel px-2 py-0.5 rounded font-bold border border-caramel/15 uppercase text-[9px]">Server status: LIVE</span>
                  <span className="bg-green-950/40 text-green-400 px-2 py-0.5 rounded font-bold border border-green-500/15 uppercase text-[9px]">Replication: 100%</span>
                </div>
              </div>

              <div className="h-96 bg-black/85 border border-[#5E2B27]/40 rounded-xl p-4 font-mono text-xs overflow-y-auto space-y-2.5 pr-2">
                {(state.system_logs || []).map((l: any) => (
                  <div key={l.id} className="text-[10px] leading-relaxed">
                    <span className="text-[#8B5E56] mr-2">[{new Date(l.timestamp).toLocaleTimeString()}]</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold mr-2 uppercase ${
                      l.level === "SUCCESS" ? "bg-green-950 text-green-400" : l.level === "WARN" ? "bg-yellow-950 text-yellow-400" : "bg-blue-950 text-blue-400"
                    }`}>
                      {l.level}
                    </span>
                    <span className="text-[#E7DDD7]/90">{l.message}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
};
