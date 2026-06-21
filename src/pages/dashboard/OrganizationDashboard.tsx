import React, { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { State, Course, Internship, Problem } from "../../types";
import { VerifiedBadge } from "../../components/verification/VerifiedBadge";
import { 
  Building2, Users, Trophy, Send, CheckCircle, XCircle, Search, 
  MapPin, DollarSign, Globe, Plus, LineChart, Award, FileText, Check, 
  AlertTriangle, BookOpen, Trash2, Edit2, Archive, HelpCircle, Briefcase, Calendar
} from "lucide-react";

interface OrganizationDashboardProps {
  state: State;
  userEmail: string;
  onUpdateState: (batch: Partial<State>) => void;
  orgProfile: {
    organization_name: string;
    industry: string;
    website: string;
    description: string;
    contact_person: string;
    country: string;
    trust_score: number;
    user_id: string;
  };
  onUpdateOrgProfile: (updated: any) => void;
}

export const OrganizationDashboard: React.FC<OrganizationDashboardProps> = ({
  state,
  userEmail,
  onUpdateState,
  orgProfile,
  onUpdateOrgProfile
}) => {
  // Navigation internal tabs
  const [activeTab, setActiveTab] = useState<"internships" | "courses" | "problems" | "applications" | "students" | "profile">("internships");
  
  const [searchQuery, setSearchQuery] = useState("");

  // ─── 1. INTERNSHIP MANAGEMENT STATES ───
  const [internshipTitle, setInternshipTitle] = useState("");
  const [internshipDescription, setInternshipDescription] = useState("");
  const [internshipRequirements, setInternshipRequirements] = useState("");
  const [internshipSkills, setInternshipSkills] = useState("");
  const [internshipDuration, setInternshipDuration] = useState("");
  const [internshipStipend, setInternshipStipend] = useState("");
  const [internshipRemote, setInternshipRemote] = useState<"Remote" | "Hybrid" | "On-site">("Remote");
  const [internshipDeadline, setInternshipDeadline] = useState("");
  const [internshipLimit, setInternshipLimit] = useState(25);
  const [internshipStatus, setInternshipStatus] = useState<"Active" | "Archived">("Active");
  const [editingInternshipId, setEditingInternshipId] = useState<string | null>(null);
  const [internshipSuccess, setInternshipSuccess] = useState("");

  // ─── 2. COURSE MANAGEMENT STATES ───
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseSkills, setCourseSkills] = useState("");
  const [courseDifficulty, setCourseDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [courseDuration, setCourseDuration] = useState("");
  const [courseModules, setCourseModules] = useState("");
  const [courseAssignments, setCourseAssignments] = useState("");
  const [courseCertificate, setCourseCertificate] = useState(true);
  const [courseEligibility, setCourseEligibility] = useState("");
  const [courseThumbnail, setCourseThumbnail] = useState("");
  const [courseStatus, setCourseStatus] = useState<"Draft" | "Published">("Published");
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseSuccess, setCourseSuccess] = useState("");

  // ─── 3. PROBLEM HUB MANAGEMENT STATES ───
  const [problemTitle, setProblemTitle] = useState("");
  const [problemIndustry, setProblemIndustry] = useState("");
  const [problemDomain, setProblemDomain] = useState("AI");
  const [problemDescription, setProblemDescription] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [problemOutcome, setProblemOutcome] = useState("");
  const [problemSkills, setProblemSkills] = useState("");
  const [problemResources, setProblemResources] = useState("");
  const [problemDifficulty, setProblemDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [problemDeadline, setProblemDeadline] = useState("");
  const [problemStatus, setProblemStatus] = useState<"Active" | "Archived">("Active");
  const [editingProblemId, setEditingProblemId] = useState<string | null>(null);
  const [problemSuccess, setProblemSuccess] = useState("");

  // ─── MOCK STUDENT APPLICANT DATA ───
  const [applicants, setApplicants] = useState([
    { id: "app-1", studentName: "Jane Doe", school: "Exeter Academy", grade: "Grade 11", trustScore: 98, matchRate: 98, roleApplied: "Deep Learning Research Intern", status: "PENDING", details: "Highly skilled in Python and PyTorch model fine-tuning" },
    { id: "app-2", studentName: "Michael Chang", school: "Andover College Prep", grade: "Grade 12", trustScore: 95, matchRate: 92, roleApplied: "Biomedical Telemetry Systems Workshop", status: "PENDING", details: "Built 3 React projects featured on Media Lab" },
    { id: "app-3", studentName: "Sophia Martinez", school: "Harvard-Westlake", grade: "Grade 11", trustScore: 92, matchRate: 85, roleApplied: "Climate Data Analytics Track", status: "APPROVED", details: "Completed Advanced Python & Data Science Certifications" }
  ]);

  const handleUpdateApplicant = (appId: string, newStatus: "APPROVED" | "REJECTED") => {
    setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
  };

  // ─── PROFILE STATES ───
  const [editName, setEditName] = useState(orgProfile.organization_name);
  const [editIndustry, setEditIndustry] = useState(orgProfile.industry);
  const [editWebsite, setEditWebsite] = useState(orgProfile.website);
  const [editDesc, setEditDesc] = useState(orgProfile.description);
  const [editContact, setEditContact] = useState(orgProfile.contact_person);
  const [profileSuccess, setProfileSuccess] = useState("");

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateOrgProfile({
      ...orgProfile,
      organization_name: editName,
      industry: editIndustry,
      website: editWebsite,
      description: editDesc,
      contact_person: editContact
    });
    setProfileSuccess("Corporate identity successfully updated in public indexing lists!");
    setTimeout(() => setProfileSuccess(""), 4000);
  };

  // ─── INTERNSHIP MANAGEMENT ACTIONS ───
  const handleSaveInternship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internshipTitle || !internshipDescription) return;

    const list = state.internships || [];
    if (editingInternshipId) {
      // Edit
      const updatedList = list.map(item => {
        if (item.id === editingInternshipId) {
          return {
            ...item,
            title: internshipTitle,
            description: internshipDescription,
            requirements: internshipRequirements,
            skills: internshipSkills.split(",").map(s => s.trim()).filter(Boolean),
            duration: internshipDuration,
            stipend: internshipStipend,
            remoteHybrid: internshipRemote,
            deadline: internshipDeadline,
            applicationLimit: Number(internshipLimit),
            status: internshipStatus
          };
        }
        return item;
      });
      onUpdateState({ internships: updatedList });
      setInternshipSuccess("Internship opportunity successfully modified!");
    } else {
      // Create
      const newItem: Internship = {
        id: "intern-" + Date.now(),
        organization_id: orgProfile.user_id,
        organizationName: orgProfile.organization_name,
        title: internshipTitle,
        description: internshipDescription,
        requirements: internshipRequirements,
        skills: internshipSkills.split(",").map(s => s.trim()).filter(Boolean),
        duration: internshipDuration,
        stipend: internshipStipend,
        remoteHybrid: internshipRemote,
        deadline: internshipDeadline,
        applicationLimit: Number(internshipLimit),
        status: internshipStatus
      };
      onUpdateState({ internships: [newItem, ...list] });
      setInternshipSuccess("New internship opportunity has been initialized into the student stream!");
    }

    // Reset Form
    setInternshipTitle("");
    setInternshipDescription("");
    setInternshipRequirements("");
    setInternshipSkills("");
    setInternshipDuration("");
    setInternshipStipend("");
    setInternshipRemote("Remote");
    setInternshipDeadline("");
    setInternshipLimit(25);
    setInternshipStatus("Active");
    setEditingInternshipId(null);
    setTimeout(() => setInternshipSuccess(""), 4000);
  };

  const handleEditInternship = (item: Internship) => {
    setEditingInternshipId(item.id);
    setInternshipTitle(item.title);
    setInternshipDescription(item.description);
    setInternshipRequirements(item.requirements || "");
    setInternshipSkills(item.skills.join(", "));
    setInternshipDuration(item.duration || "");
    setInternshipStipend(item.stipend || "");
    setInternshipRemote(item.remoteHybrid || "Remote");
    setInternshipDeadline(item.deadline || "");
    setInternshipLimit(item.applicationLimit || 25);
    setInternshipStatus(item.status);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDeleteInternship = (id: string) => {
    if (confirm("Are you sure you want to delete this internship? This cannot be undone.")) {
      const list = state.internships || [];
      onUpdateState({ internships: list.filter(i => i.id !== id) });
    }
  };

  // ─── COURSE MANAGEMENT ACTIONS ───
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle || !courseDescription) return;

    const list = state.courses || [];
    if (editingCourseId) {
      // Edit
      const updatedList = list.map(item => {
        if (item.id === editingCourseId) {
          return {
            ...item,
            title: courseTitle,
            description: courseDescription,
            skillsCovered: courseSkills.split(",").map(s => s.trim()).filter(Boolean),
            difficulty: courseDifficulty,
            duration: courseDuration,
            modules: courseModules,
            assignments: courseAssignments,
            certificates: courseCertificate,
            eligibility: courseEligibility,
            thumbnail: courseThumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500",
            status: courseStatus
          };
        }
        return item;
      });
      onUpdateState({ courses: updatedList });
      setCourseSuccess("Learning program adjusted successfully!");
    } else {
      // Create
      const newItem: Course = {
        id: "course-" + Date.now(),
        organization_id: orgProfile.user_id,
        organizationName: orgProfile.organization_name,
        title: courseTitle,
        description: courseDescription,
        skillsCovered: courseSkills.split(",").map(s => s.trim()).filter(Boolean),
        difficulty: courseDifficulty,
        duration: courseDuration,
        modules: courseModules,
        assignments: courseAssignments,
        certificates: courseCertificate,
        eligibility: courseEligibility,
        thumbnail: courseThumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500",
        status: courseStatus
      };
      onUpdateState({ courses: [newItem, ...list] });
      setCourseSuccess("Brand new course module is published!");
    }

    // Reset Form
    setCourseTitle("");
    setCourseDescription("");
    setCourseSkills("");
    setCourseDifficulty("Beginner");
    setCourseDuration("");
    setCourseModules("");
    setCourseAssignments("");
    setCourseCertificate(true);
    setCourseEligibility("");
    setCourseThumbnail("");
    setCourseStatus("Published");
    setEditingCourseId(null);
    setTimeout(() => setCourseSuccess(""), 4000);
  };

  const handleEditCourse = (item: Course) => {
    setEditingCourseId(item.id);
    setCourseTitle(item.title);
    setCourseDescription(item.description);
    setCourseSkills(item.skillsCovered.join(", "));
    setCourseDifficulty(item.difficulty);
    setCourseDuration(item.duration || "");
    setCourseModules(item.modules || "");
    setCourseAssignments(item.assignments || "");
    setCourseCertificate(item.certificates);
    setCourseEligibility(item.eligibility || "");
    setCourseThumbnail(item.thumbnail || "");
    setCourseStatus(item.status);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDeleteCourse = (id: string) => {
    if (confirm("Are you sure you want to delete this course module? This cannot be undone.")) {
      const list = state.courses || [];
      onUpdateState({ courses: list.filter(i => i.id !== id) });
    }
  };

  // ─── PROBLEM HUB MANAGEMENT ACTIONS ───
  const handleSaveProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemTitle || !problemDescription || !problemStatement) return;

    const list = state.problems || [];
    if (editingProblemId) {
      // Edit
      const updatedList = list.map(item => {
        if (item.id === editingProblemId) {
          return {
            ...item,
            title: problemTitle,
            industry: problemIndustry || "Technology",
            domain: problemDomain,
            description: problemDescription,
            problemStatement: problemStatement,
            expectedOutcome: problemOutcome,
            skillsRecommended: problemSkills.split(",").map(s => s.trim()).filter(Boolean),
            resources: problemResources,
            difficulty: problemDifficulty,
            deadline: problemDeadline,
            status: problemStatus
          };
        }
        return item;
      });
      onUpdateState({ problems: updatedList });
      setProblemSuccess("Corporate research challenge revised!");
    } else {
      // Create
      const newItem: Problem = {
        id: "prob-" + Date.now(),
        organization_id: orgProfile.user_id,
        organizationName: orgProfile.organization_name,
        title: problemTitle,
        industry: problemIndustry || "Technology",
        domain: problemDomain,
        description: problemDescription,
        problemStatement: problemStatement,
        expectedOutcome: problemOutcome,
        skillsRecommended: problemSkills.split(",").map(s => s.trim()).filter(Boolean),
        resources: problemResources,
        difficulty: problemDifficulty,
        deadline: problemDeadline,
        status: problemStatus
      };
      onUpdateState({ problems: [newItem, ...list] });
      setProblemSuccess("Dynamic design challenge injected into the Student Problem Hub!");
    }

    // Reset Form
    setProblemTitle("");
    setProblemIndustry("");
    setProblemDomain("AI");
    setProblemDescription("");
    setProblemStatement("");
    setProblemOutcome("");
    setProblemSkills("");
    setProblemResources("");
    setProblemDifficulty("Medium");
    setProblemDeadline("");
    setProblemStatus("Active");
    setEditingProblemId(null);
    setTimeout(() => setProblemSuccess(""), 4000);
  };

  const handleEditProblem = (item: Problem) => {
    setEditingProblemId(item.id);
    setProblemTitle(item.title);
    setProblemIndustry(item.industry || "");
    setProblemDomain(item.domain || "AI");
    setProblemDescription(item.description);
    setProblemStatement(item.problemStatement);
    setProblemOutcome(item.expectedOutcome);
    setProblemSkills(item.skillsRecommended?.join(", ") || "");
    setProblemResources(item.resources || "");
    setProblemDifficulty(item.difficulty);
    setProblemDeadline(item.deadline || "");
    setProblemStatus(item.status);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDeleteProblem = (id: string) => {
    if (confirm("Are you sure you want to delete this research problem statement? This cannot be undone.")) {
      const list = state.problems || [];
      onUpdateState({ problems: list.filter(p => p.id !== id) });
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12 text-left font-sans select-none">
      
      {/* ─── LEFT COLUMN: CORE QUICK ANALYTICS STATS (3 Spans, Image 6 left) ─── */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        
        {/* Brand Profile Overview */}
        <Card variant="glass" className="p-5 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3">
            <span className="flex items-center gap-1 text-[9px] font-mono font-bold bg-[#741717]/10 text-[#741717] px-2 py-0.5 rounded border border-[#741717]/20 uppercase">
              VETTED
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#741717]/5 border border-[#741717]/10 flex items-center justify-center text-chef-red text-xl font-display font-bold text-[#741717] mb-3 shadow-inner">
            {orgProfile.organization_name.charAt(0)}
          </div>
          <h3 className="font-display font-medium text-sm text-chestnut tracking-wide leading-tight px-1 uppercase">{orgProfile.organization_name}</h3>
          <div className="mt-1.5 mb-0.5">
            <VerifiedBadge type="organization" />
          </div>
          <p className="text-[10px] text-gray-500 font-mono mt-1 font-semibold">{orgProfile.industry}</p>
          <p className="text-xs text-[#594440] font-light leading-relaxed mt-3.5 select-text">
            "{orgProfile.description}"
          </p>
          <div className="w-full border-t border-[#E7DDD7]/60 pt-3 mt-4 flex justify-between items-center text-[10px]">
            <span className="text-gray-400 font-mono">Index Trust:</span>
            <span className="font-bold text-emerald-700 font-mono">{orgProfile.trust_score}% Rating</span>
          </div>
        </Card>

        {/* Global Pipeline Indexes Card */}
        <Card variant="glass" className="p-5">
          <h4 className="text-[10px] uppercase font-mono font-bold tracking-widest text-caramel-400 mb-3 block">Network Yields</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-medium text-wool-200">Interactive Courses</span>
                <span className="font-mono text-[10px] font-bold text-caramel-300">{(state.courses || []).filter(c => c.organization_id === orgProfile.user_id).length} Active</span>
              </div>
              <div className="w-full h-1.5 bg-burgundy-950 rounded-full overflow-hidden">
                <div className="h-full bg-caramel-500" style={{ width: "65%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-medium text-wool-200">Sponsored Internships</span>
                <span className="font-mono text-[10px] font-bold text-caramel-300">{(state.internships || []).filter(i => i.organization_id === orgProfile.user_id).length} Active</span>
              </div>
              <div className="w-full h-1.5 bg-burgundy-950 rounded-full overflow-hidden">
                <div className="h-full bg-caramel-500" style={{ width: "45%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-medium text-wool-200">Problem Challenges</span>
                <span className="font-mono text-[10px] font-bold text-caramel-300">{(state.problems || []).filter(p => p.organization_id === orgProfile.user_id).length} Streamed</span>
              </div>
              <div className="w-full h-1.5 bg-burgundy-950 rounded-full overflow-hidden">
                <div className="h-full bg-caramel-500" style={{ width: "80%" }} />
              </div>
            </div>
          </div>
        </Card>

      </div>

      {/* ─── RIGHT COLUMN: WORKSPACE TABS & INPUT MANAGERS (9 Spans, Image 6 center & right) ─── */}
      <div className="lg:col-span-9 flex flex-col gap-6">
        
        {/* Internal Navigation Menu Bar */}
        <div className="flex border-b border-[#E7DDD7] gap-2 md:gap-4 overflow-x-auto pb-px">
          {[
            { id: "internships", label: "Internships Manager", icon: Briefcase },
            { id: "courses", label: "Course Management", icon: BookOpen },
            { id: "problems", label: "Problem Hub Manager", icon: HelpCircle },
            { id: "applications", label: "Applicants Evaluator", icon: FileText },
            { id: "students", label: "Scholar Directory", icon: Users },
            { id: "profile", label: "Public Profile", icon: Building2 },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-semibold text-xs tracking-wide transition cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? "border-[#741717] text-[#741717] font-bold" 
                    : "border-transparent text-[#594440] hover:text-[#741717]"
                }`}
              >
                <tab.icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <div className="transition-all duration-300">
          
          {/* ────── TABS: 1. INTERNSHIPS MANAGER ────── */}
          {activeTab === "internships" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Form (7 spans) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <Card className="p-6 bg-white border border-[#E7DDD7] shadow-sm rounded-xl text-left">
                  <h3 className="font-display font-bold text-lg text-chestnut mb-1 uppercase tracking-wide">
                    {editingInternshipId ? "Modify Internship Pipeline" : "Sponsor New Internship opportunity"}
                  </h3>
                  <p className="text-xs text-[#594440] mb-6 font-light">
                    Initialize a premium high-school/undergraduate project opportunity with custom telemetry fields and target dates.
                  </p>

                  {internshipSuccess && (
                    <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs flex items-center gap-2">
                      <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                      <span>{internshipSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveInternship} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Position Title</label>
                        <input 
                          type="text" required
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                          placeholder="e.g. Deep Learning Assistant Scholar"
                          value={internshipTitle}
                          onChange={e => setInternshipTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Stipend / Salary Range</label>
                        <input 
                          type="text" placeholder="e.g. $35/hr or $2,500 Stipend"
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                          value={internshipStipend}
                          onChange={e => setInternshipStipend(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Work Context</label>
                        <select 
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                          value={internshipRemote}
                          onChange={e => setInternshipRemote(e.target.value as any)}
                        >
                          <option value="Remote">Remote</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="On-site">On-site</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Typical Duration</label>
                        <input 
                          type="text" placeholder="e.g. 8 Weeks, 12 Weeks"
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                          value={internshipDuration}
                          onChange={e => setInternshipDuration(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Apply Tag Deadline</label>
                        <input 
                          type="date"
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                          value={internshipDeadline}
                          onChange={e => setInternshipDeadline(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Max Scholar Limit</label>
                        <input 
                          type="number"
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                          value={internshipLimit}
                          onChange={e => setInternshipLimit(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Required Skills Set (comma separated)</label>
                      <input 
                        type="text" placeholder="e.g. PyTorch, Pandas, Data Cleaning"
                        className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                        value={internshipSkills}
                        onChange={e => setInternshipSkills(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Prerequisite Requirements</label>
                      <input 
                        type="text" placeholder="e.g. Complete Stanford Data Science ongoing module or equiv"
                        className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                        value={internshipRequirements}
                        onChange={e => setInternshipRequirements(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Problem & Deliverables Statement</label>
                      <textarea required rows={4}
                        className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                        placeholder="Detail candidate objectives, code pipelines support, and exact micro assignments targets..."
                        value={internshipDescription}
                        onChange={e => setInternshipDescription(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Status</label>
                        <select 
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                          value={internshipStatus}
                          onChange={e => setInternshipStatus(e.target.value as any)}
                        >
                          <option value="Active">Active</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="primary" type="submit" className="flex-1 py-2.5 text-xs bg-[#741717] hover:bg-chestnut text-white font-bold rounded-xl cursor-pointer">
                        {editingInternshipId ? "Save Modifications" : "Publish to Student Channel"}
                      </Button>
                      {editingInternshipId && (
                        <button type="button" 
                          onClick={() => {
                            setEditingInternshipId(null);
                            setInternshipTitle("");
                            setInternshipDescription("");
                            setInternshipRequirements("");
                            setInternshipSkills("");
                            setInternshipDuration("");
                            setInternshipStipend("");
                            setInternshipDeadline("");
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-xl text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </Card>
              </div>

              {/* Right Panel (5 spans) */}
              <div className="lg:col-span-5">
                <Card className="p-6 bg-white border border-[#E7DDD7] shadow-sm rounded-xl h-full flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Opportunities List</h4>
                    <h3 className="font-display font-bold text-lg text-chestnut mb-4 uppercase">Submittals Audit feed</h3>

                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1 text-left">
                      {(state.internships || []).filter(i => i.organization_id === orgProfile.user_id).map(m => (
                        <div key={m.id} className="p-4 bg-[#F7F4F2] border border-[#E7DDD7] rounded-xl flex flex-col gap-2 hover:border-[#741717] transition relative">
                          <div className="absolute top-3 right-3 flex gap-1.5">
                            <button onClick={() => handleEditInternship(m)} className="p-1 hover:text-blue-700 text-gray-400 transition cursor-pointer">
                              <Edit2 size={12} />
                            </button>
                            <button onClick={() => handleDeleteInternship(m.id)} className="p-1 hover:text-red-700 text-gray-400 transition cursor-pointer">
                              <Trash2 size={12} />
                            </button>
                          </div>

                          <div className="pr-10">
                            <h4 className="text-xs font-bold text-[#741717]">{m.title}</h4>
                            <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">"{m.description}"</p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] text-gray-500">
                            <span className="flex items-center gap-0.5"><MapPin size={10} /> {m.remoteHybrid}</span>
                            <span className="flex items-center gap-0.5 font-bold text-gray-700"><DollarSign size={10} /> {m.stipend || "Unpaid"}</span>
                            {m.status === "Archived" && (
                              <span className="text-[8px] bg-red-150 text-red-800 border border-red-200 uppercase font-mono px-1.5 py-0.2 rounded font-bold">Archived</span>
                            )}
                          </div>
                        </div>
                      ))}

                      {(state.internships || []).filter(i => i.organization_id === orgProfile.user_id).length === 0 && (
                        <div className="text-center py-12 text-gray-400 flex flex-col items-center justify-center gap-2">
                          <Briefcase size={22} className="opacity-30" />
                          <p className="text-xs font-mono">No active internships configured yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ────── TABS: 2. COURSE MANAGEMENT ────── */}
          {activeTab === "courses" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form (7 spans) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <Card className="p-6 bg-white border border-[#E7DDD7] shadow-sm rounded-xl text-left">
                  <h3 className="font-display font-bold text-lg text-chestnut mb-1 uppercase tracking-wide">
                    {editingCourseId ? "Revise Scholar Training Program" : "Create New Custom Academy Module"}
                  </h3>
                  <p className="text-xs text-[#594440] mb-6 font-light">
                    Organizations can offer Bootcamp tracks, digital workshops, hands-on master classes, and certification paths directly to vetted scholars.
                  </p>

                  {courseSuccess && (
                    <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs flex items-center gap-2">
                      <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                      <span>{courseSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveCourse} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Course Title</label>
                        <input 
                          type="text" required
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                          placeholder="e.g. Advanced Quantum Neural Abstractions"
                          value={courseTitle}
                          onChange={e => setCourseTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Course Difficulty Level</label>
                        <select 
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                          value={courseDifficulty}
                          onChange={e => setCourseDifficulty(e.target.value as any)}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Eligibility Criteria</label>
                        <input 
                          type="text" placeholder="e.g. Open to High school students ages 15+"
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                          value={courseEligibility}
                          onChange={e => setCourseEligibility(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Estimated Duration</label>
                        <input 
                          type="text" placeholder="e.g. 6 Weeks, 40 total hours"
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                          value={courseDuration}
                          onChange={e => setCourseDuration(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Thumbnail Cover URL (Optional)</label>
                        <input 
                          type="text" placeholder="e.g. https://images.unsplash.com/photo-..."
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                          value={courseThumbnail}
                          onChange={e => setCourseThumbnail(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-3 h-full pt-4">
                        <input 
                          type="checkbox" id="certCheckbox"
                          className="w-4 h-4 text-[#741717]"
                          checked={courseCertificate}
                          onChange={e => setCourseCertificate(e.target.checked)}
                        />
                        <label htmlFor="certCheckbox" className="text-xs font-semibold text-chestnut select-none cursor-pointer">
                          Include Collivio Verified Badge & Certificate
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Skills Governed (comma separated)</label>
                      <input 
                        type="text" placeholder="e.g. Linear Algebra, Python, Scientific Writing"
                        className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                        value={courseSkills}
                        onChange={e => setCourseSkills(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Structure Modules List (comma separated)</label>
                      <input 
                        type="text" placeholder="e.g. Module 1: Telemetry Logic, Module 2: Wave Analysis"
                        className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                        value={courseModules}
                        onChange={e => setCourseModules(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Assignments Specs (comma separated)</label>
                      <input 
                        type="text" placeholder="e.g. Milestones 1 Project, Terminal Presentation"
                        className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                        value={courseAssignments}
                        onChange={e => setCourseAssignments(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Module Syllabus & Description</label>
                      <textarea required rows={4}
                        className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                        placeholder="Define learning goals, homework parameters, typical weekly tasks..."
                        value={courseDescription}
                        onChange={e => setCourseDescription(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Publish Status</label>
                        <select 
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                          value={courseStatus}
                          onChange={e => setCourseStatus(e.target.value as any)}
                        >
                          <option value="Draft">Draft (Private)</option>
                          <option value="Published">Published (Public)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="primary" type="submit" className="flex-1 py-2.5 text-xs bg-[#741717] hover:bg-chestnut text-white font-bold rounded-xl cursor-pointer shadow">
                        {editingCourseId ? "Update Training Module" : "Create Master Academy Module"}
                      </Button>
                      {editingCourseId && (
                        <button type="button" 
                          onClick={() => {
                            setEditingCourseId(null);
                            setCourseTitle("");
                            setCourseDescription("");
                            setCourseSkills("");
                            setCourseEligibility("");
                            setCourseDuration("");
                            setCourseModules("");
                            setCourseAssignments("");
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-xl text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </Card>
              </div>

              {/* Courses list preview pane (5 spans) */}
              <div className="lg:col-span-5">
                <Card className="p-6 bg-white border border-[#E7DDD7] shadow-sm rounded-xl h-full flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Syllabus Directory</h4>
                    <h3 className="font-display font-bold text-lg text-chestnut mb-4 uppercase">My Learning Tracks</h3>

                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1 text-left">
                      {(state.courses || []).filter(c => c.organization_id === orgProfile.user_id).map(m => (
                        <div key={m.id} className="p-4 bg-[#F7F4F2] border border-[#E7DDD7] rounded-xl flex flex-col gap-2 hover:border-[#741717] transition relative">
                          <div className="absolute top-3 right-3 flex gap-1.5">
                            <button onClick={() => handleEditCourse(m)} className="p-1 hover:text-blue-700 text-gray-400 transition cursor-pointer">
                              <Edit2 size={12} />
                            </button>
                            <button onClick={() => handleDeleteCourse(m.id)} className="p-1 hover:text-red-700 text-gray-400 transition cursor-pointer">
                              <Trash2 size={12} />
                            </button>
                          </div>

                          <div className="pr-10">
                            <span className="text-[8px] uppercase tracking-wider font-bold bg-[#741717]/10 text-[#741717] px-1.5 py-0.5 rounded">
                              {m.difficulty}
                            </span>
                            <h4 className="text-xs font-bold text-[#741717] mt-1.5">{m.title}</h4>
                            <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">"{m.description}"</p>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-1">
                            {m.skillsCovered.map(s => (
                              <span key={s} className="text-[8px] bg-white border border-[#E7DDD7] text-[#2F2421] px-1.5 py-0.5 rounded font-mono">#{s}</span>
                            ))}
                          </div>

                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#E7DDD7]/60 text-[10px] text-gray-400 font-medium">
                            <span>Duration: {m.duration}</span>
                            <span className="capitalize text-amber-800">{m.status}</span>
                          </div>
                        </div>
                      ))}

                      {(state.courses || []).filter(c => c.organization_id === orgProfile.user_id).length === 0 && (
                        <div className="text-center py-12 text-gray-400 flex flex-col items-center justify-center gap-2">
                          <BookOpen size={22} className="opacity-30" />
                          <p className="text-xs font-mono">No courses or programs configured yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ────── TABS: 3. PROBLEM HUB MANAGER ────── */}
          {activeTab === "problems" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form (7 spans) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <Card className="p-6 bg-white border border-[#E7DDD7] shadow-sm rounded-xl text-left">
                  <h3 className="font-display font-bold text-lg text-chestnut mb-1 uppercase tracking-wide">
                    {editingProblemId ? "Revise Problem statement" : "Post Industry Challenge in Problem Hub"}
                  </h3>
                  <p className="text-xs text-[#594440] mb-6 font-light">
                    Highlight a concrete, open-ended business friction or academic problem. Students voluntarily solve these in peer research projects.
                  </p>

                  {problemSuccess && (
                    <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs flex items-center gap-2">
                      <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                      <span>{problemSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveProblem} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Challenge Title</label>
                        <input 
                          type="text" required
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                          placeholder="e.g. Brain-Computer Sensory Noise Filter Optimization"
                          value={problemTitle}
                          onChange={e => setProblemTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Ecosystem Domain</label>
                        <select 
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                          value={problemDomain}
                          onChange={e => setProblemDomain(e.target.value)}
                        >
                          <option value="AI">AI / Machine Learning</option>
                          <option value="Healthcare">Healthcare / Biotech</option>
                          <option value="Climate">Climate / Sustainable Energy</option>
                          <option value="Business">Business / Fintech</option>
                          <option value="Education flex shadow">Education tech</option>
                          <option value="Cybersecurity">Cybersecurity</option>
                          <option value="Robotics">Robotics & BCI</option>
                          <option value="Engineering">Engineering & Space</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Industry Sector</label>
                        <input 
                          type="text" required placeholder="e.g. Biomedicine, Energy"
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                          value={problemIndustry}
                          onChange={e => setProblemIndustry(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Difficulty Tier</label>
                        <select 
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                          value={problemDifficulty}
                          onChange={e => setProblemDifficulty(e.target.value as any)}
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard / Advanced</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Optional Target Deadline</label>
                        <input 
                          type="date"
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                          value={problemDeadline}
                          onChange={e => setProblemDeadline(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Precise Problem Statement</label>
                      <input 
                        type="text" required placeholder="e.g. Current Bluetooth models introduce 45ms latency under loaded data streams, we need a 10ms alternative."
                        className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                        value={problemStatement}
                        onChange={e => setProblemStatement(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Recommended Skills (Comma separated)</label>
                      <input 
                        type="text" placeholder="e.g. Signal Processing, Python, Bluetooth Core"
                        className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                        value={problemSkills}
                        onChange={e => setProblemSkills(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Detailed Description of Sandbox & Context</label>
                      <textarea required rows={4}
                        className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                        placeholder="Define background context, research domain parameters..."
                        value={problemDescription}
                        onChange={e => setProblemDescription(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Expected Outcome & Deliverables</label>
                      <input 
                        type="text" required placeholder="e.g. A packaged Python library or published whitepaper"
                        className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                        value={problemOutcome}
                        onChange={e => setProblemOutcome(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Link to resources or Sandbox API (Optional)</label>
                      <input 
                        type="text" placeholder="e.g. GitHub link, dataset URL or api parameters description"
                        className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                        value={problemResources}
                        onChange={e => setProblemResources(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Active Status</label>
                        <select 
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                          value={problemStatus}
                          onChange={e => setProblemStatus(e.target.value as any)}
                        >
                          <option value="Active">Active (Open to Solutions)</option>
                          <option value="Archived">Archived (Closed)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="primary" type="submit" className="flex-1 py-2.5 text-xs bg-[#741717] hover:bg-chestnut text-white font-bold rounded-xl cursor-pointer">
                        {editingProblemId ? "Save Revised Problem" : "Stream into Problem Hub"}
                      </Button>
                      {editingProblemId && (
                        <button type="button" 
                          onClick={() => {
                            setEditingProblemId(null);
                            setProblemTitle("");
                            setProblemIndustry("");
                            setProblemDomain("AI");
                            setProblemDescription("");
                            setProblemStatement("");
                            setProblemOutcome("");
                            setProblemSkills("");
                            setProblemResources("");
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-xl text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </Card>
              </div>

              {/* Problems list (5 spans) */}
              <div className="lg:col-span-5">
                <Card className="p-6 bg-white border border-[#E7DDD7] shadow-sm rounded-xl h-full flex flex-col justify-between text-left">
                  <div>
                    <h4 className="text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Open Challenges</h4>
                    <h3 className="font-display font-bold text-lg text-chestnut mb-4 uppercase">My Posted Problems</h3>

                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                      {(state.problems || []).filter(p => p.organization_id === orgProfile.user_id).map(m => (
                        <div key={m.id} className="p-4 bg-[#F7F4F2] border border-[#E7DDD7] rounded-xl flex flex-col gap-2 hover:border-[#741717] transition relative">
                          <div className="absolute top-3 right-3 flex gap-1.5">
                            <button onClick={() => handleEditProblem(m)} className="p-1 hover:text-blue-700 text-gray-400 transition cursor-pointer">
                              <Edit2 size={12} />
                            </button>
                            <button onClick={() => handleDeleteProblem(m.id)} className="p-1 hover:text-red-700 text-gray-400 transition cursor-pointer">
                              <Trash2 size={12} />
                            </button>
                          </div>

                          <div className="pr-10">
                            <div className="flex gap-1">
                              <span className="text-[8px] uppercase tracking-wider font-bold bg-[#741717]/10 text-[#741717] px-1.5 py-0.5 rounded font-mono">
                                {m.domain}
                              </span>
                              <span className="text-[8px] uppercase tracking-wider font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                                {m.difficulty}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-[#741717] mt-2">{m.title}</h4>
                            <p className="text-[10px] text-gray-400 mt-1 italic font-light shrink-0">Statement: "{m.problemStatement}"</p>
                          </div>

                          {m.deadline && (
                            <div className="text-[9px] text-gray-400 font-mono mt-1 flex items-center gap-1">
                              <Calendar size={11} />
                              <span>Target: {new Date(m.deadline).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      ))}

                      {(state.problems || []).filter(p => p.organization_id === orgProfile.user_id).length === 0 && (
                        <div className="text-center py-12 text-gray-400 flex flex-col items-center justify-center gap-2">
                          <HelpCircle size={22} className="opacity-30" />
                          <p className="text-xs font-mono">No problems streamed yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ────── TABS: 4. EVALUATE SCHOLAR APPLICANTS ────── */}
          {activeTab === "applications" && (
            <Card className="p-6 bg-white border border-[#E7DDD7] shadow-sm rounded-xl">
              <h3 className="font-display font-bold text-lg text-chestnut mb-2 uppercase tracking-wide">
                Evaluate Scholar Applicants
              </h3>
              <p className="text-xs text-[#594440] mb-6">
                Review and act on submitted pre-college credentials, project repos, and custom application cover notes.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E7DDD7] text-[#8D695D] font-mono text-[10px] uppercase font-bold">
                      <th className="py-3 px-4">Scholar Candidate</th>
                      <th className="py-3 px-4">Scope Applied</th>
                      <th className="py-3 px-4 text-center">Trust Rating</th>
                      <th className="py-3 px-4 text-center">AI Fit Score</th>
                      <th className="py-3 px-4">Evaluation Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7DDD7]/60">
                    {applicants.map(app => (
                      <tr key={app.id} className="hover:bg-[#F7F4F2]/30 transition">
                        <td className="py-4 px-4 font-semibold text-chestnut">
                          <div>
                            <p className="font-bold text-sm text-[#741717]">{app.studentName}</p>
                            <p className="text-[10px] text-[#594440] mt-0.5 font-light">{app.school} · {app.grade}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-[#2F2421]">
                          <div>
                            <p className="font-medium text-xs text-chestnut">{app.roleApplied}</p>
                            <p className="text-[10px] text-gray-500 italic mt-0.5 truncate max-w-xs">"{app.details}"</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-block bg-emerald-50 text-emerald-800 text-[10px] font-bold font-mono px-2 py-0.5 rounded border border-emerald-100">
                            TS: {app.trustScore}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center font-bold font-mono text-[#741717] text-sm font-bold">
                          {app.matchRate}%
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block text-[9px] uppercase font-bold font-mono px-2 py-0.5 rounded ${
                            app.status === "PENDING" ? "bg-orange-100 text-orange-800 border border-orange-200" :
                            app.status === "APPROVED" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                            "bg-red-100 text-red-800 border border-red-200"
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {app.status === "PENDING" ? (
                            <div className="flex gap-2 justify-end">
                              <button 
                                onClick={() => handleUpdateApplicant(app.id, "APPROVED")}
                                className="p-1 px-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold tracking-wide text-[10px] uppercase flex items-center gap-1 cursor-pointer shadow-sm"
                              >
                                <Check size={11} /> Approve
                              </button>
                              <button 
                                onClick={() => handleUpdateApplicant(app.id, "REJECTED")}
                                className="p-1 px-2.5 rounded border border-red-200 bg-white text-red-700 hover:bg-red-50 font-bold tracking-wide text-[10px] uppercase flex items-center gap-1 cursor-pointer"
                              >
                                <XCircle size={11} /> Decline
                              </button>
                            </div>
                          ) : (
                            <button 
                              disabled 
                              className="text-[10px] font-mono text-gray-400 capitalize"
                            >
                              Decision committed
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ────── TABS: 5. SCHOLAR DIRECTORY ────── */}
          {activeTab === "students" && (
            <Card className="p-6 bg-white border border-[#E7DDD7] shadow-sm rounded-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h3 className="font-display font-bold text-lg text-chestnut uppercase tracking-wide">
                    Browse Pre-College Scholars
                  </h3>
                  <p className="text-xs text-[#594440] font-light mt-1">
                    Connect with vetted leaders aged 13-19 demonstrating verified research output and code logs.
                  </p>
                </div>

                <div className="relative w-full md:w-64 shrink-0">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Filter by skill, school..."
                    className="w-full bg-[#F7F4F2] border border-[#E7DDD7] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717] shadow-sm"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: "Alex Rivera", school: "Stanford Undergrad / Prep", skills: ["Python", "Machine Learning", "React"], trust: 99, bio: "Active software engineering and data pipelines builder interested in biomedical machine learning." },
                  { name: "Suresh Iyer", school: "Stuyvesant High School", skills: ["C++", "Quantum Physics", "Algorithms"], trust: 98, bio: "High performance compute enthusiast researching core simulation frameworks on non-standard hardware." },
                  { name: "Emma Watson", school: "Phillips Academy Andover", skills: ["Figma", "Research", "Neuroscience"], trust: 96, bio: "User experience designer building high fidelity wireframes for brain telemetry modeling tools." },
                  { name: "Devon Carter", school: "Thomas Jefferson High School", skills: ["Python", "TensorFlow", "PyTorch"], trust: 94, bio: "Junior researcher focused on building neural model abstractions and generative text transformers." },
                  { name: "Chloe Zhao", school: "Bronx High School of Science", skills: ["Rust", "Solidity", "Cryptographic Methods"], trust: 95, bio: "Deep tech builder optimizing network latencies on distributed ledger systems." }
                ].filter(s => 
                  s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  s.skills.some(sk => sk.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  s.school.toLowerCase().includes(searchQuery.toLowerCase())
                ).map(st => (
                  <div key={st.name} className="p-4 bg-[#F7F4F2] border border-[#E7DDD7] rounded-xl hover:border-caramel hover:shadow-md transition text-left flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className="font-bold text-[#741717] text-sm truncate max-w-[110px]">{st.name}</h4>
                          <VerifiedBadge type="student" className="scale-90 origin-left" />
                        </div>
                        <span className="bg-emerald-50 text-emerald-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-100">
                          TRUST SCORE: {st.trust}
                        </span>
                      </div>
                      <p className="text-[10px] text-chestnut font-semibold truncate mb-1.5">{st.school}</p>
                      <p className="text-[11px] text-[#594440] leading-relaxed line-clamp-3 font-light">"{st.bio}"</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E7DDD7]/60">
                      <div className="flex gap-1 flex-wrap mb-3.5">
                        {st.skills.map(sk => (
                          <span key={sk} className="text-[8px] bg-white border border-[#E7DDD7] text-[#2F2421] px-1.5 py-0.5 rounded font-mono">#{sk}</span>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        size="xs" 
                        className="w-full text-[10px] py-1 border-[#741717] text-[#741717] hover:bg-[#741717]/10 rounded flex items-center justify-center gap-1 cursor-pointer font-bold"
                        onClick={() => alert(`Connecting with ${st.name}! Application details sent to their dashboard.`)}
                      >
                        <Plus size={11} /> Request Portfolio Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ────── TABS: 6. CORPORATE PROFILE ────── */}
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7">
                <Card className="p-6 bg-white border border-[#E7DDD7] shadow-sm rounded-xl text-left">
                  <h3 className="font-display font-bold text-lg text-chestnut mb-2 uppercase tracking-wide">
                    Configure Corporate Listing Card
                  </h3>
                  <p className="text-xs text-[#594440] mb-6">
                    Set public-facing description and brand criteria shown on public URL profile directories.
                  </p>

                  {profileSuccess && (
                    <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs flex items-center gap-2">
                      <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                      <span>{profileSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Company / Institution Name</label>
                        <input 
                          type="text" required
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717] shadow-sm animate-none"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Industry Sector</label>
                        <input 
                          type="text" required
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717] shadow-sm animate-none"
                          value={editIndustry}
                          onChange={e => setEditIndustry(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Official Website</label>
                        <input 
                          type="text" required
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717] shadow-sm animate-none"
                          value={editWebsite}
                          onChange={e => setEditWebsite(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Primary Representative Spokesperson</label>
                        <input 
                          type="text" required
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717] shadow-sm animate-none"
                          value={editContact}
                          onChange={e => setEditContact(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Organization Description & Core Fields</label>
                      <textarea required rows={4}
                        className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717] shadow-sm animate-none"
                        value={editDesc}
                        onChange={e => setEditDesc(e.target.value)}
                      />
                    </div>

                    <Button variant="primary" type="submit" className="w-full py-3 bg-[#741717] hover:bg-chestnut text-white text-xs font-bold rounded-xl cursor-pointer shadow">
                      Sync Corporate Identity
                    </Button>
                  </form>
                </Card>
              </div>

              <div className="lg:col-span-5">
                <Card className="p-6 bg-white border border-[#E7DDD7] shadow-sm rounded-xl h-full flex flex-col justify-between text-left">
                  <div>
                    <h4 className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#741717] mb-2">Live Directory Preview</h4>
                    <h3 className="font-display font-bold text-lg text-chestnut mb-4 uppercase">/organization/{orgProfile.organization_name.toLowerCase().replace(/\s+/g, "-")}</h3>
                    
                    <div className="p-5 border border-[#E7DDD7] rounded-2xl bg-[#F7F4F2]">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-mono text-[8px] uppercase tracking-wider font-bold bg-[#741717] text-white px-2 py-0.5 rounded">
                          {editIndustry}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">TS: {orgProfile.trust_score}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-display font-bold text-xl text-[#741717]">{editName}</h3>
                        <VerifiedBadge type="organization" />
                      </div>
                      <p className="text-xs text-[#594440] leading-relaxed select-text font-light mb-4">"{editDesc}"</p>
                      
                      <div className="border-t border-[#E7DDD7]/60 pt-3 flex items-center justify-between text-[10px] text-gray-500 font-medium">
                        <span className="flex items-center gap-1"><Globe size={11} className="text-[#8D695D]" /> {editWebsite}</span>
                        <span>Rep: {editContact}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-[#E7DDD7] border-t pt-4 mt-6">
                    <div className="flex gap-2 items-center text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3.5">
                      <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                      <span>Your company directory profile is synced on public indexing subdirectories. Ensure URLs comply with network guidelines.</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
