import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { State } from "./types";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

// Page Views
import { Landing } from "./pages/Landing";
import { VerificationGate } from "./pages/auth/VerificationGate";
import { StudentDashboard } from "./pages/dashboard/StudentDashboard";
import { OrganizationDashboard } from "./pages/dashboard/OrganizationDashboard";
import { AdminDashboard } from "./pages/dashboard/AdminDashboard";
import { WaitingExperience } from "./pages/auth/WaitingExperience";
import { TeamWorkspace } from "./pages/dashboard/TeamWorkspace";
import { ResearchHub } from "./pages/dashboard/ResearchHub";
import { MediaLab } from "./pages/dashboard/MediaLab";
import { EmploymentSkillBridge } from "./pages/dashboard/EmploymentSkillBridge";
import { CollivioBot } from "./components/CollivioBot";
import { CollivioLogo } from "./components/CollivioLogo";

// Icons and UI Components
import { 
  Trophy, BookOpen, Users, Award, TrendingUp, Bell, Search, 
  BrainCircuit, ChevronDown, LogOut, Settings, User, Sparkles, AlertCircle 
} from "lucide-react";

export default function App() {
  const [currentView, setCurrentView] = useState<string>("landing");
  const [authTabMode, setAuthTabMode] = useState<"login" | "register" | "business-login">("login");
  const [userRole, setUserRole] = useState<string>("student");
  const [userName, setUserName] = useState<string>("Alex Rivera");
  const [userId, setUserId] = useState<string>("user-student-1");
  const [userStatus, setUserStatus] = useState<string>("ACTIVE");
  
  // Notification items
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [searchGlobalQuery, setSearchGlobalQuery] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Master Full-Stack State
  const [state, setState] = useState<State | null>(null);
  const [errorLoading, setErrorLoading] = useState("");

  const fetchState = async () => {
    try {
      const res = await fetch("/api/state");
      if (!res.ok) throw new Error("Backend offline");
      const data = await res.json();
      setState(data);
    } catch {
      setErrorLoading("Cannot connect to server. Running in static offline mode.");
      console.warn("Backend offline, launching with static client state.");
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const res = await fetch("/api/state");
          if (res.ok) {
            const data = await res.json();
            setState(data);

            // Look up the user matching email or uid
            let userObj = data.users.find((u: any) => u.id === firebaseUser.uid || u.email.toLowerCase() === firebaseUser.email?.toLowerCase());

            if (userObj) {
              if (userObj.id !== firebaseUser.uid) {
                console.log(`Migrating matched legacy user ID index: ${userObj.id} to Firebase UID ${firebaseUser.uid}`);
                try {
                  await fetch("/api/auth/migrate-uid", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ oldId: userObj.id, newId: firebaseUser.uid })
                  });
                  userObj.id = firebaseUser.uid;
                } catch (migrateErr) {
                  console.error("Migration failed during state load:", migrateErr);
                }
              }

              let profile = userObj.role?.toLowerCase() === "student"
                ? data.student_profiles[userObj.id]
                : data.organization_profiles[userObj.id];

              handleLoginSuccess(userObj.role?.toLowerCase() || "student", userObj.email, userObj.id, profile, userObj.status);
            } else {
              // Automatically register federated or newly registered Firebase user who does not have records yet
              const mockProfile = {
                full_name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Explorer",
                user_id: firebaseUser.uid,
                date_of_birth: "2008-01-01",
                school_name: "Palo Alto High School",
                grade: "Grade 12",
                skills: [],
                interests: []
              };

              try {
                await fetch("/api/auth/register", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userId: firebaseUser.uid,
                    email: firebaseUser.email,
                    password: "external-oauth-or-firebase-auth-pwd",
                    role: "student",
                    fullName: mockProfile.full_name,
                    dob: mockProfile.date_of_birth,
                    schoolName: mockProfile.school_name,
                    grade: mockProfile.grade
                  })
                });
              } catch (regErr) {
                console.error("Failed to sync automatically registered user details to repository:", regErr);
              }

              handleLoginSuccess("student", firebaseUser.email || "", firebaseUser.uid, mockProfile, "ACTIVE");
            }
          }
        } catch (stateErr) {
          console.error("onAuthStateChanged state load error:", stateErr);
        }
      } else {
        setUserId("");
        setUserRole("student");
        setUserStatus("ACTIVE");
        setUserName("");
        setCurrentView("landing");
      }
    });

    return () => unsubscribe();
  }, []);

  // Update State and Sync back to full-stack backend
  const updateState = async (batch: Partial<State>) => {
    if (!state) return;
    const nextState = { ...state, ...batch };
    setState(nextState);

    try {
      await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batch)
      });
    } catch (err) {
      console.error("Failed to sync updated state with backend:", err);
    }
  };

  // Login handler with secure fields
  const handleLoginSuccess = (
    role: "student" | "organization" | "admin", 
    email: string, 
    userIdArg: string, 
    profile: any, 
    status: string
  ) => {
    setUserRole(role);
    setUserId(userIdArg);
    setUserStatus(status);
    
    let calculatedName = "Collaborator";
    if (profile) {
      calculatedName = profile.full_name || profile.organization_name || email;
    } else {
      calculatedName = email || "Collaborator";
    }
    setUserName(calculatedName);
    
    if (status === "ACTIVE") {
      setCurrentView("dashboard");
    } else {
      setCurrentView("waiting");
    }
    
    // Refresh fully loaded state after authenticating
    fetchState();
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Firebase Auth sign-out failed:", err);
    }
    setCurrentView("landing");
    setUserRole("student");
    setUserStatus("ACTIVE");
    setUserId("");
    setAuthTabMode("login");
  };

  // Nav categories mapping Image 3 sidebar
  const sidebarNavItems = userRole === "admin" ? [
    { id: "dashboard", label: "Admin Cockpit", icon: TrendingUp }
  ] : [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "skill-bridge", label: "Employment Skill Bridge", icon: Trophy },
    { id: "research-hub", label: "Research Hub", icon: BookOpen },
    { id: "media-lab", label: "Media Lab", icon: Award },
    { id: "team-workspace", label: "Team Workspace", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#F7F4F2] text-[#2F2421] font-sans antialiased overflow-x-hidden">
      
      {/* ── LANDING VIEW ── */}
      {currentView === "landing" && (
        <Landing 
          onNavigate={(view, subView) => {
            setCurrentView(view);
            if (subView) setAuthTabMode(subView as any);
          }} 
        />
      )}

      {/* ── AUTHENTICATION AND SELECT GATES ── */}
      {currentView === "auth" && (
        <VerificationGate 
          initialTab={authTabMode}
          onLoginSuccess={handleLoginSuccess}
          onNavigate={(view) => setCurrentView(view)}
        />
      )}

      {/* ── WAITING EXPERIENCE GATE ── */}
      {currentView === "waiting" && (
        <WaitingExperience 
          userId={userId}
          userRole={userRole}
          status={userStatus as any}
          profileName={userName}
          trustScore={userRole === "student" ? (state?.student_profiles?.[userId]?.trust_score || 70) : (state?.organization_profiles?.[userId]?.trust_score || 75)}
          auditLogs={state?.audit_logs || []}
          onRefreshStatus={async () => {
            try {
              const res = await fetch("/api/state");
              const data = await res.json();
              setState(data);
              const userObj = data.users.find((u: any) => u.id === userId);
              if (userObj) {
                setUserStatus(userObj.status);
                if (userObj.status === "ACTIVE") {
                  setCurrentView("dashboard");
                }
              }
            } catch (err) {
              console.error("Status update sync error:", err);
            }
          }}
          onApproveInstant={async () => {
            try {
              const res = await fetch("/api/auth/approve-backdoor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
              });
              if (res.ok) {
                setUserStatus("ACTIVE");
                setCurrentView("dashboard");
                fetchState();
              }
            } catch (err) {
              console.error("Backdoor approval failed:", err);
            }
          }}
        />
      )}

      {/* ── MASTER COCKPIT LAYOUT WITH INNER ROUTING ── */}
      {state && currentView !== "landing" && currentView !== "auth" && currentView !== "waiting" && (
        <div className="flex min-h-screen relative text-[#2F2421]">
          
          {/* Glass Sidebar (Image 3 Left Layout) */}
          <aside className="w-64 bg-white border-r border-[#E7DDD7] flex flex-col p-6 fixed h-full z-30 hidden lg:flex text-left justify-between select-none shadow-sm">
            <div>
              {/* Brand Logo with Cursive + Coordinate Globe SVG */}
              <div 
                className="mb-8 flex flex-col items-start gap-1 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setCurrentView("landing")}
              >
                <CollivioLogo size="sm" showTagline={false} />
              </div>

              {/* Navigation list */}
              <nav className="space-y-1.5 font-accent text-xs">
                <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-[#8D695D] mb-3 block">Navigation menu</span>
                {sidebarNavItems.map(item => {
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        setShowBellDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-[#741717] text-white font-bold shadow-sm"
                          : "text-[#603A30] hover:text-[#741717] hover:bg-[#F1E7E2]"
                      }`}
                    >
                      <item.icon size={14} className={isActive ? "text-white" : "text-[#8D695D]"} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* User credentials on footer */}
            <div className="border-t border-[#E7DDD7] pt-4 flex flex-col gap-2">
              <div 
                className="flex items-center gap-2.5 p-1 rounded hover:bg-[#E7DDD7]/40 transition cursor-pointer relative"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <div className="w-8 h-8 rounded-full bg-[#8D695D] text-white flex items-center justify-center font-bold text-xs">
                  {userName[0]}
                </div>
                <div className="min-w-0 text-left">
                  <p className="font-semibold text-xs leading-none text-chestnut truncate">{userName}</p>
                  <span className="text-[8px] uppercase tracking-wider text-caramel font-mono mt-1 font-bold inline-block leading-none">
                    {userRole === "student" ? "Ambitious Scholar" : userRole}
                  </span>
                </div>
                <ChevronDown size={11} className="ml-auto text-gray-400" />
                
                {/* Profile mini dropdown */}
                {showProfileDropdown && (
                  <div className="absolute bottom-10 left-0 w-48 bg-white border border-[#E7DDD7] rounded-xl shadow-xl p-2 z-50 text-xs text-chestnut flex flex-col gap-1">
                    <button className="flex gap-2 items-center p-2 hover:bg-[#F7F4F2] rounded text-left cursor-pointer text-chestnut" onClick={() => setCurrentView("dashboard")}>
                      <User size={12} className="text-[#8D695D]" /> My Profile Track
                    </button>
                    <button className="flex gap-2 items-center p-2 hover:bg-[#F7F4F2] rounded text-left cursor-pointer text-chestnut" onClick={() => setCurrentView("skill-bridge")}>
                      <Settings size={12} className="text-[#8D695D]" /> Calibration Options
                    </button>
                    <div className="border-t border-[#E7DDD7] my-1"></div>
                    <button 
                      className="flex gap-2 items-center p-2 text-red-600 hover:bg-red-50 rounded text-left cursor-pointer font-bold"
                      onClick={handleSignOut}
                    >
                      <LogOut size={12} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* MAIN PAGE VIEWPORT (padded 64px from left sidebar desktop view) */}
          <main className="flex-1 lg:ml-64 p-6 md:p-8 flex flex-col min-h-screen text-[#2F2421] bg-[#F7F4F2]">
            
            {/* Header / Top Bar (Image 3 elements inside layout) */}
            <header className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
              <div className="text-left">
                <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-[#8D695D] leading-none">Collivio Workspace Dashboard</span>
                <h1 className="font-display text-2xl font-bold text-chestnut mt-1 uppercase flex items-center gap-2">
                  {currentView === "dashboard" && "Dashboard Tracker"}
                  {currentView === "skill-bridge" && "Employment Skill Bridge"}
                  {currentView === "research-hub" && "Research Hub"}
                  {currentView === "media-lab" && "Media Lab Showcase"}
                  {currentView === "team-workspace" && "Team Collaboration Kanban"}
                </h1>
              </div>

              {/* Toolbar Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-3 select-none">
                
                {/* Search Inputs */}
                <div className="relative hidden sm:block">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search opportunities..." 
                    className="bg-white border border-[#E7DDD7] rounded-lg pl-7 pr-3 py-1.5 text-xs text-[#2F2421] placeholder-gray-400 focus:outline-none focus:border-[#741717] w-44 transition-all shadow-sm"
                    value={searchGlobalQuery}
                    onChange={e => setSearchGlobalQuery(e.target.value)}
                  />
                </div>

                {/* Sparkling AI Assistant Sparkle Badge (Image 3 Header top right) */}
                <button 
                  onClick={() => setCurrentView("research-hub")}
                  className="relative w-8 h-8 rounded-lg bg-white border border-[#E7DDD7] flex items-center justify-center hover:bg-[#741717]/10 transition-all cursor-pointer font-bold inline-flex text-xs group"
                  title="Query AI Assistant chatbot in Research Hub"
                >
                  <Sparkles size={13} className="text-[#741717] animate-pulse" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#741717] rounded-full" />
                </button>

                {/* Notifications trigger bell (Image 3 Header top right) */}
                <div className="relative">
                  <button 
                    onClick={() => setShowBellDropdown(!showBellDropdown)}
                    className="relative w-8 h-8 rounded-lg bg-white border border-[#E7DDD7] flex items-center justify-center hover:bg-[#F7F4F2] transition-all cursor-pointer font-bold inline-flex text-xs"
                  >
                    <Bell size={13} className="text-[#8D695D]" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#741717] rounded-full" />
                  </button>

                  <AnimatePresence>
                    {showBellDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-10 w-72 bg-white border border-[#E7DDD7] rounded-xl shadow-2xl z-50 p-4 font-sans text-xs text-[#2F2421] text-left"
                      >
                        <div className="flex justify-between items-center border-b border-[#E7DDD7] pb-2 mb-2 font-accent">
                          <span className="font-bold text-[#741717] uppercase tracking-wide">Live Notifications</span>
                          <span className="text-[10px] text-gray-400">New list</span>
                        </div>
                        <div className="space-y-3 max-h-[180px] overflow-y-auto">
                          {state.activityFeed.slice(0, 3).map(feed => (
                            <div key={feed.id} className="pb-2 border-b border-[#E7DDD7] last:border-0 pl-1.5">
                              <p className="font-semibold text-chestnut leading-snug">{feed.text}</p>
                              <span className="text-[9px] text-[#8D695D] font-mono">{feed.time}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile Burger selector (small screens only) */}
                <div className="lg:hidden relative">
                  <button 
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="w-8 h-8 bg-[#741717] text-white rounded-lg flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer"
                  >
                    M
                  </button>
                  {showProfileDropdown && (
                    <div className="absolute right-0 top-10 w-48 bg-white border border-[#E7DDD7] rounded-xl shadow-2xl p-2 z-50 text-xs text-chestnut flex flex-col gap-1">
                      {sidebarNavItems.map(item => (
                        <button 
                          key={item.id}
                          className="flex gap-2 items-center p-2.5 hover:bg-[#F7F4F2] rounded text-left" 
                          onClick={() => {
                            setCurrentView(item.id);
                            setShowProfileDropdown(false);
                          }}
                        >
                          <span>{item.label}</span>
                        </button>
                      ))}
                      <div className="border-t border-[#E7DDD7] my-1"></div>
                      <button 
                        className="flex gap-2 items-center p-2 text-red-600 hover:bg-red-50 rounded text-left font-bold"
                        onClick={handleSignOut}
                      >
                        <LogOut size={12} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </header>

            {/* ── CLIENT VIEW SELECTOR ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.18 }}
                className="flex-1"
               >
                {currentView === "dashboard" && (
                  userRole === "admin" ? (
                    <AdminDashboard 
                      state={state}
                      onUpdateState={updateState}
                      userName={userName}
                      userId={userId}
                      onSignOut={handleSignOut}
                    />
                  ) : userRole === "organization" ? (
                    <OrganizationDashboard 
                      state={state}
                      userEmail={userName || "sponsor@techcorp.com"}
                      onUpdateState={updateState}
                      orgProfile={state.organization_profiles?.[userId] || {
                        organization_name: "TechCorp Labs",
                        industry: "AI Development",
                        website: "https://techcorplabs.io",
                        description: "Collaborative research and development lab optimizing open weights deep learning models.",
                        contact_person: "Sarah Connor",
                        country: "United States",
                        trust_score: 98,
                        user_id: userId
                      }}
                      onUpdateOrgProfile={async (updated) => {
                        try {
                           const res = await fetch("/api/auth/sync-profile", {
                             method: "POST",
                             headers: { "Content-Type": "application/json" },
                             body: JSON.stringify({ userId, role: "organization", profileData: updated })
                           });
                           if (res.ok) {
                             const data = await res.json();
                             const nextProfiles = { ...state.organization_profiles, [userId]: data.profile };
                             updateState({ organization_profiles: nextProfiles } as any);
                           }
                        } catch (err) {
                           console.error("Failed syncing profile update:", err);
                        }
                      }}
                    />
                  ) : (
                    <StudentDashboard 
                      state={state}
                      onUpdateState={updateState}
                      onCallGeminiMatching={() => {}}
                      geminiLoading={false}
                      onNavigate={setCurrentView}
                    />
                  )
                )}

                {currentView === "team-workspace" && (
                  <TeamWorkspace 
                    state={state}
                    onUpdateState={updateState}
                  />
                )}

                {currentView === "research-hub" && (
                  <ResearchHub 
                    state={state}
                    onUpdateState={updateState}
                  />
                )}

                {currentView === "media-lab" && (
                  <MediaLab 
                    state={state}
                    onUpdateState={updateState}
                  />
                )}

                {currentView === "skill-bridge" && (
                  <EmploymentSkillBridge 
                    state={state}
                    onUpdateState={updateState}
                  />
                )}
              </motion.div>
            </AnimatePresence>

          </main>
          <CollivioBot state={state} onNavigate={setCurrentView} />
        </div>
      )}
      
      {state === null && currentView !== "landing" && currentView !== "auth" && (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 border-4 border-caramel-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-wool-200/50 font-mono">Synchronizing Collivio indices...</p>
        </div>
      )}

    </div>
  );
}
