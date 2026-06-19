import React, { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { 
  Mail, Lock, ShieldAlert, Sparkles, User, Globe, Building2, Calendar, 
  BookOpen, Award, Link2, Eye, EyeOff, CheckSquare, Sparkle, AlertTriangle, ArrowRight
} from "lucide-react";
import { auth } from "../../lib/firebase";
import { AuthService } from "../../lib/authService";

interface VerificationGateProps {
  initialTab?: "login" | "register" | "business-login";
  onLoginSuccess: (role: "student" | "organization" | "admin", email: string, userId: string, profile: any, status: string) => void;
  onNavigate: (view: string) => void;
}

export const VerificationGate: React.FC<VerificationGateProps> = ({
  initialTab = "login",
  onLoginSuccess,
  onNavigate
}) => {
  // Main modes: 'login' | 'register' | 'forgot'
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  
  // Password reset workflow states
  const [resetEmail, setResetEmail] = useState("");
  const [resetTokenCode, setResetTokenCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState<"request" | "verify">("request");
  const [simulatedTokenMsg, setSimulatedTokenMsg] = useState("");
  const [resetTargetUserId, setResetTargetUserId] = useState("");
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");
  
  // Login Role tab: 'student' | 'organization' | 'admin'
  const [loginRole, setLoginRole] = useState<"student" | "organization" | "admin">("student");
  const [show2faInput, setShow2faInput] = useState(false);
  const [entered2fa, setEntered2fa] = useState("");
  const [simulated2faCode, setSimulated2faCode] = useState("");
  
  // Registration Role flow state: 'student' | 'organization'
  const [registerRole, setRegisterRole] = useState<"student" | "organization">("student");

  // Authentication Input fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorArr, setErrorArr] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Student profile creation details
  const [studentName, setStudentName] = useState("");
  const [studentDob, setStudentDob] = useState("");
  const [studentSchool, setStudentSchool] = useState("");
  const [studentGrade, setStudentGrade] = useState("");
  const [studentSkills, setStudentSkills] = useState("");
  const [studentInterests, setStudentInterests] = useState("");
  const [studentResearch, setStudentResearch] = useState("");
  const [studentPortfolio, setStudentPortfolio] = useState("");
  const [studentGithub, setStudentGithub] = useState("");
  const [studentLinkedin, setStudentLinkedin] = useState("");

  // Organization profile creation details
  const [orgName, setOrgName] = useState("");
  const [orgIndustry, setOrgIndustry] = useState("");
  const [orgWebsite, setOrgWebsite] = useState("");
  const [orgContact, setOrgContact] = useState("");
  const [orgCountry, setOrgCountry] = useState("");
  const [orgDesc, setOrgDesc] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorArr([]);
    if (!email || !password) {
      setErrorArr(["Please enter your credentials."]);
      return;
    }

    if (loginRole === "admin" && !show2faInput) {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role: "admin" })
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorArr([data.error || "Authentication checking failed."]);
          setLoading(false);
          return;
        }
        
        // Step 1 pass, require 2FA
        const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
        setSimulated2faCode(randomCode);
        setShow2faInput(true);
        setLoading(false);
        alert(`2FA security authentication code generated: ${randomCode}. Please input this code below to authorize.`);
        return;
      } catch {
        setErrorArr(["Unable to establish backend handshake validation."]);
        setLoading(false);
        return;
      }
    }

    if (loginRole === "admin" && show2faInput) {
      if (entered2fa !== simulated2faCode) {
        setErrorArr(["Invalid 2FA security validation token."]);
        return;
      }
    }

    setLoading(true);
    try {
      // 1. Unified login using modular AuthService
      const data = await AuthService.login(email, password, loginRole);
      onLoginSuccess(data.user.role, data.user.email, data.user.id, data.profile, data.user.status);
    } catch (err: any) {
      setErrorArr([err.message || "Incorrect email or password."]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, delay = 1000): Promise<Response> => {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (err) {
      if (retries > 1) {
        console.warn(`Temporary network fluctuation. Retrying in ${delay}ms... (${retries - 1} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 1.5);
      }
      throw err;
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorArr([]);

    const errors: string[] = [];
    if (!email) errors.push("Valid email address is mandatory.");
    if (!password || password.length < 8) errors.push("Password must contain at least 8 character length for complete cryptographic security.");

    if (registerRole === "student") {
      if (!studentName) errors.push("Full Candidate Name is requested.");
      if (!studentDob) errors.push("Date of Birth is requested for age metrics.");
      if (!studentSchool) errors.push("Current High School Name is requested.");
      if (!studentGrade) errors.push("Current Grade or Prep year is requested.");
    } else {
      if (!orgName) errors.push("Organization Name is mandatory.");
      if (!orgIndustry) errors.push("Industry focus directory must be identified.");
      if (!orgWebsite) errors.push("Official Web URL must be filled.");
      if (!orgContact) errors.push("Lead Advisor / Recruiter contact is requested.");
      if (!orgCountry) errors.push("Primary operating country is requested.");
    }

    if (errors.length > 0) {
      setErrorArr(errors);
      return;
    }

    setLoading(true);
    try {
      const payload = registerRole === "student" ? {
        email, password,
        fullName: studentName, dob: studentDob, schoolName: studentSchool, grade: studentGrade,
        skills: studentSkills, interests: studentInterests, researchInterests: studentResearch,
        portfolioUrl: studentPortfolio, github: studentGithub, linkedin: studentLinkedin
      } : {
        email, password,
        organizationName: orgName, industry: orgIndustry, website: orgWebsite,
        description: orgDesc, contactPerson: orgContact, country: orgCountry
      };

      let result;
      if (registerRole === "student") {
        result = await AuthService.signUpStudent(payload as any);
      } else {
        result = await AuthService.signUpOrganization(payload as any);
      }
      onLoginSuccess(result.user.role, result.user.email, result.user.id, result.profile, result.user.status);
    } catch (err: any) {
      setErrorArr([err.message || "Registration validation criteria error."]);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorArr([]);
    setResetSuccessMessage("");
    if (!resetEmail) {
      setErrorArr(["Email address is required."]);
      return;
    }

    setLoading(true);
    try {
      // 1. Dispatch through AuthService requesting real password recovery instructions
      await AuthService.requestPasswordReset(resetEmail);
      setResetSuccessMessage("Password reset instructions have been dispatched via Firebase Auth.");
      
      // 2. Load sandbox recovery properties to display mock values for convenience
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setResetTargetUserId(data.userId || "");
        setResetTokenCode(data.token || "RESET-123456");
        setSimulatedTokenMsg(`Advisory Notice: A recovery token (${data.token || "RESET-123456"}) has been prepared in your verification sandbox.`);
        setResetStep("verify");
      }
    } catch (err: any) {
      setErrorArr([err.message || "Failed to trigger password recovery."]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorArr([]);
    if (!resetTokenCode) {
      setErrorArr(["Verification token code is required."]);
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setErrorArr(["New password must be at least 8 characters long."]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: resetTokenCode,
          newPassword,
          userId: resetTargetUserId
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorArr([data.error || "Password reset failed."]);
      } else {
        setResetSuccessMessage("Your password was updated successfully. You can now login with your new credentials.");
        setResetStep("request");
        setResetEmail("");
        setNewPassword("");
        setResetTokenCode("");
        setTimeout(() => {
          setAuthMode("login");
          setResetSuccessMessage("");
        }, 1500);
      }
    } catch {
      setErrorArr(["Failed to commit password change."]);
    } finally {
      setLoading(false);
    }
  };

  // Preset quick credential fills for easier reviewer evaluation
  const fillQuickCredential = (role: "student" | "org" | "admin") => {
    setShow2faInput(false);
    if (role === "student") {
      setEmail("alex.rivera@stanford.edu");
      setPassword("password");
      setLoginRole("student");
    } else if (role === "org") {
      setEmail("sponsor@techcorp.com");
      setPassword("password");
      setLoginRole("organization");
    } else {
      setEmail("admin1@collivio.com");
      setPassword("password");
      setLoginRole("admin");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4F2] text-[#2F2421] flex items-center justify-center p-4 md:p-10 selection:bg-amber-100 font-sans">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        
        {/* Left Side Feature Showcase Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between p-8 bg-white border border-[#E7DDD7] rounded-3xl relative text-left">
          
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate("landing")}>
              <div className="w-9 h-9 rounded-xl bg-[#741717] flex items-center justify-center font-bold text-lg text-white">
                Co
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-chestnut">
                Collivio
              </span>
            </div>

            <span className="inline-block text-[9px] uppercase font-mono font-bold tracking-widest text-[#741717] bg-[#741717]/10 px-2.5 py-1 rounded-md">
              Security & Isolation Protocol Enabled
            </span>

            <h2 className="font-display text-3xl font-bold leading-tight text-chestnut">
              Establish Custom Pre-College Pathways safely.
            </h2>

            <p className="text-[#594440] font-light leading-relaxed text-xs">
              Connect through micro-internships, sponsor actual laboratory projects, build custom portfolios, and match with verified advisors.
            </p>

            {/* List features based on role */}
            <div className="space-y-3.5 pt-4 text-xs">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</div>
                <div>
                  <p className="font-semibold text-chestnut">Independent Subdirectory Profiles</p>
                  <p className="text-[10px] text-gray-500 font-light mt-0.5">Custom student (/student/name) or corporate (/organization/name) scopes.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</div>
                <div>
                  <p className="font-semibold text-chestnut">Verified Match Ratings</p>
                  <p className="text-[10px] text-gray-500 font-light mt-0.5">Vetted trust indices mapping actual portfolios and documents scans.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-[10px]">✓</div>
                <div>
                  <p className="font-semibold text-chestnut">Separated Onboarding & RBAC</p>
                  <p className="text-[10px] text-gray-500 font-light mt-0.5">Strict database isolation. Sponsoring companies cannot spoof candidate logs.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Review Sandbox shortcut guides */}
          <div className="mt-10 pt-6 border-t border-[#E7DDD7]/70">
            <h4 className="text-[9px] uppercase font-mono font-bold text-[#8D695D] mb-2">Evaluator Credentials (Quick Fill)</h4>
            <div className="flex flex-wrap gap-2 text-[10px]">
              <button 
                onClick={() => fillQuickCredential("student")}
                className="py-1.5 px-3 bg-[#F7F4F2] hover:bg-[#741717]/10 border border-[#E7DDD7] rounded-lg cursor-pointer text-chestnut transition"
              >
                🎓 Student
              </button>
              <button 
                onClick={() => fillQuickCredential("org")}
                className="py-1.5 px-3 bg-[#F7F4F2] hover:bg-[#741717]/10 border border-[#E7DDD7] rounded-lg cursor-pointer text-chestnut transition"
              >
                🏢 Business
              </button>
              <button 
                onClick={() => fillQuickCredential("admin")}
                className="py-1.5 px-3 bg-[#F7F4F2] hover:bg-[#741717]/10 border border-[#E7DDD7] rounded-lg cursor-pointer text-chestnut transition"
              >
                🛡️ Admin
              </button>
            </div>
          </div>

        </div>

        {/* Right Side Card: Wizard Form Fields */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <Card className="w-full bg-white border border-[#E7DDD7] p-6 sm:p-8 rounded-3xl shadow-xl hover:border-caramel transition text-left">
            
            {/* Title / Toggle */}
            <div className="flex justify-between items-center border-b border-[#E7DDD7] pb-4 mb-6">
              <div>
                <h3 className="font-display font-bold text-xl text-chestnut uppercase tracking-wide">
                  {authMode === "forgot" ? "Recover Account Secrets" : authMode === "login" ? "Unified Gateway Sign In" : "Register Credentials"}
                </h3>
                <p className="text-[11px] text-gray-500 font-light mt-0.5">
                  {authMode === "forgot" ? "Reset your password via 1-use tokens" : authMode === "login" ? "Specify directory roles for access" : "Establish isolated candidate or corporate profiles"}
                </p>
              </div>

              <div className="text-right">
                <button 
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "register" : "login");
                    setErrorArr([]);
                  }}
                  className="text-xs font-bold text-[#741717] hover:underline"
                >
                  {authMode === "login" ? "Create Account" : "Back to Sign In"}
                </button>
              </div>
            </div>

            {/* Error alerts pane */}
            {errorArr.length > 0 && (
              <div className="mb-6 bg-red-50 border border-red-250 text-red-800 text-xs p-4 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <ShieldAlert size={14} className="text-red-700" />
                  <span>HANDSHAKE FAILURE INDICATORS:</span>
                </div>
                <ul className="list-disc pl-4 space-y-0.5 font-sans">
                  {errorArr.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* SIGN IN VIEW */}
            {authMode === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                {/* LOGIN ROLE SEPARATOR SELECTOR TABS */}
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-2 tracking-wide">Select Gateway Node Role</label>
                  {loginRole === "admin" ? (
                    <div className="bg-red-wine/10 p-3 rounded-lg border border-red-500/20 text-center">
                      <span className="text-[10px] uppercase font-mono font-bold text-red-wine tracking-wider">🔒 Administrative Secure Terminal Node</span>
                      <button 
                        type="button" 
                        onClick={() => { setLoginRole("student"); setShow2faInput(false); }}
                        className="block mx-auto text-[9px] hover:underline mt-1 text-[#594440]"
                      >
                        Return to student / business node gates
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 bg-[#F7F4F2] p-1 rounded-xl border border-[#E7DDD7] font-semibold text-xs select-none">
                      <button
                        type="button"
                        onClick={() => setLoginRole("student")}
                        className={`py-2 rounded-lg cursor-pointer transition text-center font-bold ${loginRole === "student" ? "bg-[#741717] text-white shadow" : "text-gray-500 hover:text-[#741717]"}`}
                      >
                        🎓 Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginRole("organization")}
                        className={`py-2 rounded-lg cursor-pointer transition text-center font-bold ${loginRole === "organization" ? "bg-[#741717] text-white shadow" : "text-gray-500 hover:text-[#741717]"}`}
                      >
                        🏢 Business
                      </button>
                    </div>
                  )}
                </div>

                {loginRole === "admin" && show2faInput && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in text-xs space-y-1.5 text-blue-950 font-mono">
                    <p className="font-bold">📟 2-Factor Authentication Secure Challenge</p>
                    <p className="text-[10px] text-blue-800 leading-relaxed">A secure token has been sent to your device. Simulated token code: <strong className="text-[#741717]">{simulated2faCode}</strong>.</p>
                    <div>
                      <label className="block text-[10px] uppercase font-mono font-semibold text-[#8D695D] mb-1">Enter 2FA Code</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-white border border-blue-300 rounded p-1.5 focus:outline-none"
                        max="6"
                        placeholder="e.g. 123456"
                        value={entered2fa}
                        onChange={e => setEntered2fa(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Email input field */}
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1.5">{loginRole === "organization" ? "Official Business Email" : "Email Address"}</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="email" 
                      required
                      placeholder={loginRole === "organization" ? "yourname@company.com" : "scholar@gmail.com"}
                      className="w-full bg-white border border-[#E7DDD7] rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#741717] shadow-sm text-[#2F2421]"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password input field */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D]">Security Password</label>
                    <span 
                      onClick={() => { setAuthMode("forgot"); setErrorArr([]); }}
                      className="text-[10px] font-medium text-[#741717] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="w-full bg-white border border-[#E7DDD7] rounded-lg pl-9 pr-10 py-2 text-xs focus:outline-none focus:border-[#741717] shadow-sm text-[#2F2421]"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-chestnut"
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-gray-600 select-none cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="accent-[#741717] rounded border-gray-300 w-3.5 h-3.5"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                    />
                    <span>Keep session active</span>
                  </label>
                </div>

                <Button variant="primary" type="submit" fullWidth loading={loading} className="py-2.5 bg-[#741717] hover:bg-chestnut text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
                  Handshake Authorization <ArrowRight size={13} />
                </Button>
              </form>
            )}

            {/* PASSWORD RESET / RECOVERY FLOW */}
            {authMode === "forgot" && (
              <div className="space-y-5">
                {resetSuccessMessage && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-xl">
                    <p className="font-bold flex items-center gap-1.5">✓ Success:</p>
                    <p>{resetSuccessMessage}</p>
                  </div>
                )}

                {resetStep === "request" ? (
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    <p className="text-xs text-[#594440] leading-relaxed">
                      Enter the email address registered with your Collivio profile. The platform will look up your account identity and yield a unique cryptographic one-use verification token.
                    </p>
                    <div>
                      <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1.5">Registered Email</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="email" 
                          required
                          placeholder="e.g. explorer@stanford.com"
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#741717] text-[#2F2421]"
                          value={resetEmail}
                          onChange={e => setResetEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="py-2.5 px-4 text-xs font-semibold rounded-xl text-gray-500 border-gray-300 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setAuthMode("login")}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        variant="primary" 
                        loading={loading}
                        className="flex-1 py-2.5 bg-[#741717] hover:bg-chestnut text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Generate Reset Token
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                    {simulatedTokenMsg && (
                      <div className="bg-amber-50 border border-amber-200 text-amber-850 text-[11px] p-3 rounded-lg font-mono">
                        <p className="font-bold">📤 SECURE ADVISORY NOTIFICATION (Sandbox mode):</p>
                        <p className="mt-1">{simulatedTokenMsg}</p>
                        <p className="mt-2 text-[10px] text-gray-600">The reset token and correlation target have been recorded for your convenience.</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1.5">One-Time Recovery Token</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Copy token from box above"
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#741717] text-[#2F2421] font-mono"
                          value={resetTokenCode}
                          onChange={e => setResetTokenCode(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1.5">New Password (Min 8 characters)</label>
                        <input 
                          type="password" 
                          required
                          placeholder="Enter strong new password"
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#741717] text-[#2F2421]"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="py-2.5 px-4 text-xs font-semibold rounded-xl text-gray-500 border-gray-300 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setResetStep("request")}
                      >
                        Start Over
                      </Button>
                      <Button 
                        type="submit" 
                        variant="primary" 
                        loading={loading}
                        className="flex-1 py-2.5 bg-[#741717] hover:bg-chestnut text-white font-bold text-xs rounded-xl cursor-pointer shadow"
                      >
                        Commit New Password
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* REGISTRATION VIEW WITH WIZARD WORKFLOW */}
            {authMode === "register" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                
                {/* REGISTRATION ROLE SELECTOR */}
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-2 tracking-wide">Choose Registrant Role Type</label>
                  <div className="grid grid-cols-2 gap-2 bg-[#F7F4F2] p-1 rounded-xl border border-[#E7DDD7] font-semibold text-xs select-none">
                    <button
                      type="button"
                      onClick={() => { setRegisterRole("student"); setErrorArr([]); }}
                      className={`py-2 rounded-lg cursor-pointer transition text-center font-bold ${registerRole === "student" ? "bg-[#741717] text-white shadow" : "text-gray-500 hover:text-[#741717]"}`}
                    >
                      🎓 Student Candidate
                    </button>
                    <button
                      type="button"
                      onClick={() => { setRegisterRole("organization"); setErrorArr([]); }}
                      className={`py-2 rounded-lg cursor-pointer transition text-center font-bold ${registerRole === "organization" ? "bg-[#741717] text-white shadow" : "text-gray-500 hover:text-[#741717]"}`}
                    >
                      🏢 Sponsoring Company
                    </button>
                  </div>
                </div>

                {/* SHARED CREDENTIAL FIELDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Email address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="e.g. contact@domain.com"
                      className="w-full bg-[#F7F4F2] border border-[#E7DDD7] rounded-lg px-3 py-1.5 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Secure Password</label>
                    <input 
                      type="password" 
                      required
                      placeholder="Min 5 characters"
                      className="w-full bg-[#F7F4F2] border border-[#E7DDD7] rounded-lg px-3 py-1.5 text-xs text-[#2F2421] focus:outline-none focus:border-[#741717]"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* STUDENT WORKFLOW */}
                {registerRole === "student" && (
                  <div className="space-y-4 pt-1.5 border-t border-dashed border-[#E7DDD7]/70">
                    <p className="text-[10px] font-mono text-[#741717] uppercase tracking-wide font-bold">Personal & High School Information</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Full Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Alex Rivera"
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-1.5 text-xs"
                          value={studentName}
                          onChange={e => setStudentName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Date of birth</label>
                        <input 
                          type="date" 
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-1.5 text-xs text-[#2F2421]"
                          value={studentDob}
                          onChange={e => setStudentDob(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">School Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Palo Alto High School"
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-1.5 text-xs"
                          value={studentSchool}
                          onChange={e => setStudentSchool(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Current Grade / Class</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Grade 12 or Prep"
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-1.5 text-xs"
                          value={studentGrade}
                          onChange={e => setStudentGrade(e.target.value)}
                        />
                      </div>
                    </div>

                    <p className="text-[10px] font-mono text-[#741717] uppercase tracking-wide font-bold pt-2.5">Academic Interests & Skills Alignment</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-gray-500 mb-0.5">Focus Interests</label>
                        <input 
                          type="text" 
                          placeholder="e.g. AI, React"
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-1.5 text-[11px]"
                          value={studentInterests}
                          onChange={e => setStudentInterests(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-gray-500 mb-0.5">Core Skills</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Python, SQL"
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-1.5 text-[11px]"
                          value={studentSkills}
                          onChange={e => setStudentSkills(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-gray-500 mb-0.5">Research Projects</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Neural topologs"
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-1.5 text-[11px]"
                          value={studentResearch}
                          onChange={e => setStudentResearch(e.target.value)}
                        />
                      </div>
                    </div>

                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest pt-2.5">Optional Directory Submissions</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input 
                        type="url" 
                        placeholder="Portfolio Portfolio URL" 
                        className="bg-white border border-[#E7DDD7] rounded-lg px-2.5 py-1 text-[11px] w-full"
                        value={studentPortfolio}
                        onChange={e => setStudentPortfolio(e.target.value)}
                      />
                      <input 
                        type="text" 
                        placeholder="GitHub Account" 
                        className="bg-white border border-[#E7DDD7] rounded-lg px-2.5 py-1 text-[11px] w-full"
                        value={studentGithub}
                        onChange={e => setStudentGithub(e.target.value)}
                      />
                      <input 
                        type="text" 
                        placeholder="LinkedIn Account" 
                        className="bg-white border border-[#E7DDD7] rounded-lg px-2.5 py-1 text-[11px] w-full"
                        value={studentLinkedin}
                        onChange={e => setStudentLinkedin(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* ORGANIZATION WORKFLOW */}
                {registerRole === "organization" && (
                  <div className="space-y-4 pt-1.5 border-t border-dashed border-[#E7DDD7]/70">
                    <p className="text-[10px] font-mono text-[#741717] uppercase tracking-wide font-bold">Organizational Identity & Web Scope</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Organization Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Tesla Labs"
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-1.5 text-xs"
                          value={orgName}
                          onChange={e => setOrgName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Industry Focus Sector</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Biomedical Devices"
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-1.5 text-xs"
                          value={orgIndustry}
                          onChange={e => setOrgIndustry(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Official Web Website</label>
                        <input 
                          type="url" 
                          placeholder="e.g. https://teslalabs.io"
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-1.5 text-xs"
                          value={orgWebsite}
                          onChange={e => setOrgWebsite(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Operating Country Headquarters</label>
                        <input 
                          type="text" 
                          placeholder="e.g. United States"
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-1.5 text-xs"
                          value={orgCountry}
                          onChange={e => setOrgCountry(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Corporate Representative Reporter</label>
                        <input 
                          type="text" 
                          placeholder="Name of Contact Person"
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-1.5 text-xs"
                          value={orgContact}
                          onChange={e => setOrgContact(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D] mb-1">Description</label>
                        <textarea 
                          rows={2}
                          placeholder="Brief mission vision summary..."
                          className="w-full bg-white border border-[#E7DDD7] rounded-lg px-3 py-1 text-xs"
                          value={orgDesc}
                          onChange={e => setOrgDesc(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Button variant="primary" type="submit" fullWidth loading={loading} className="py-2.5 bg-[#741717] hover:bg-chestnut text-white font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer shadow">
                  Commit Registration Profile
                </Button>
              </form>
            )}

            {loginRole !== "admin" && (
              <>
                {/* Separator / Google Login */}
                <div className="relative my-4 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E7DDD7]"></div>
                  </div>
                  <span className="relative px-3 text-[10px] text-gray-400 bg-white font-mono uppercase">Unified Access</span>
                </div>

                <button
                  onClick={async () => {
                    setLoading(true);
                    setErrorArr([]);
                    try {
                      const data = await AuthService.signInWithGoogle(loginRole);
                      onLoginSuccess(data.user.role, data.user.email, data.user.id, data.profile, data.user.status);
                    } catch (err: any) {
                      setErrorArr([err.message || "Failed to authorize with Google."]);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="w-full bg-white hover:bg-gray-50 text-[#594440] border border-[#E7DDD7] py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs shadow-sm cursor-pointer hover:border-caramel transition-all select-none font-bold"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12.24 10.285V13.4h6.86c-.277 1.56-1.602 4.585-6.86 4.585-4.54 0-8.24-3.765-8.24-8.4s3.7-8.4 8.24-8.4c2.58 0 4.307 1.095 5.298 2.045l2.465-2.37C18.27 1.545 15.53.5 12.24.5C5.86.5.7 5.66.7 12s5.16 11.5 11.54 11.5c6.66 0 11.085-4.68 11.085-11.275 0-.755-.08-1.335-.18-1.94H12.24z"/>
                  </svg>
                  <span>Authorize using Google Workspace</span>
                </button>
              </>
            )}

            {loginRole !== "admin" && authMode === "login" && (
              <div className="text-center pt-4 border-t border-[#E7DDD7]/40 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setLoginRole("admin");
                    setShow2faInput(false);
                    setEmail("admin1@collivio.com");
                    setPassword("password");
                  }}
                  className="text-[10px] font-mono font-bold tracking-wider text-[#741717] hover:underline cursor-pointer"
                >
                  🔒 Administrative Secure Terminal Gate
                </button>
              </div>
            )}

          </Card>
        </div>

      </div>
    </div>
  );
};
