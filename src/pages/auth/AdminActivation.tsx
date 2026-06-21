import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ShieldCheck, Lock, User, Eye, EyeOff, Sparkles, CheckCircle, Smartphone, AlertOctagon, HelpCircle } from "lucide-react";

interface AdminActivationProps {
  token: string;
  onActivationSuccess: (role: "admin", email: string, userId: string, profile: any, status: string, jwtToken: string) => void;
  onCancel: () => void;
}

export default function AdminActivation({ token, onActivationSuccess, onCancel }: AdminActivationProps) {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorWord, setErrorWord] = useState<string>("");
  
  // Form values
  const [fullName, setFullName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Password checks
  const isLengthValid = password.length >= 8;
  const isMatchValid = password && password === confirmPassword;

  useEffect(() => {
    let active = true;
    async function verifyInviteToken() {
      try {
        setErrorWord("");
        const res = await fetch("/api/admin/activate/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        if (!active) return;
        
        if (res.ok && data.success) {
          setEmail(data.email);
          // Set default human names nicely matching some of the seeds
          if (data.email.includes("jiya")) setFullName("Jiya Chopra");
          else if (data.email.includes("moksha")) setFullName("Moksha Sathish");
          else if (data.email.includes("gaanavi")) setFullName("Gaanavi Harish");
          else if (data.email.includes("surabhi")) setFullName("Surabhi S.R.");
        } else {
          setErrorWord(data.error || "This cryptographic invitation token is invalid, expired, or already claimed.");
        }
      } catch (err) {
        if (active) {
          setErrorWord("Unable to sync verification handshake with the backend authority.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    verifyInviteToken();
    return () => {
      active = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLengthValid) {
      setErrorWord("Security Compliance Error: Administrative passwords must span at least 8 characters.");
      return;
    }
    if (!isMatchValid) {
      setErrorWord("Credential Misalignment: Passwords do not match.");
      return;
    }
    if (!fullName.trim()) {
      setErrorWord("Administrative Profile: Please supply your full profile designation name.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorWord("");

      const designation = email.includes("jiya") ? "Founder & Co-CEO" : "Founder & Partner";

      const res = await fetch("/api/admin/activate/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
          fullName,
          designation,
          twoFactorEnabled
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Feed authentication constants straight to parent container
        onActivationSuccess("admin", data.user.email, data.user.id, data.profile, data.user.status, data.token);
      } else {
        setErrorWord(data.error || "Handshake activation rejected by database schema security rule.");
      }
    } catch {
      setErrorWord("Relational database synchronization error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#110100] text-[#E7DDD7] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-red-wine selection:text-white relative overflow-hidden font-sans">
      {/* Background radial overlays */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-wine/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#52130C]/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        id="admin-activation-card-container"
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-red-wine/15 border border-caramel/25 rounded-2xl mb-3 text-caramel shadow-lg animate-pulse">
            <ShieldCheck size={36} />
          </div>
          <h2 className="text-3xl font-display font-semibold tracking-tight text-white uppercase text-center">
            Founder Activation
          </h2>
          <p className="text-xs text-wool-200/60 font-mono tracking-widest mt-1 uppercase">
            Collivio Secure Cryptographic Portal
          </p>
        </div>

        <Card 
          variant="glass" 
          id="admin-activation-form-card"
          className="p-6 bg-[#210D0B]/80 border border-[#48211D] backdrop-blur-md rounded-2xl shadow-2xl relative"
        >
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-caramel/30 border-t-caramel rounded-full animate-spin" />
              <p className="text-xs font-mono text-caramel/80">Verifying Cryptographic Tokens...</p>
            </div>
          ) : errorWord ? (
            <motion.div 
              id="activation-error-panel"
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="py-6 text-center space-y-4"
            >
              <div className="inline-flex p-2.5 bg-red-950/40 border border-red-500/20 text-red-500 rounded-full">
                <AlertOctagon size={28} />
              </div>
              <h3 className="font-bold text-sm text-white">Verification Decryption Failure</h3>
              <p className="text-xs text-wool-200/70 p-2 leading-relaxed bg-[#170504]/75 rounded border border-red-950">
                {errorWord}
              </p>
              <div className="pt-2 flex flex-col space-y-2">
                <Button variant="outline" size="sm" onClick={onCancel}>
                  Cancel & Exit
                </Button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              <div className="p-3 bg-[#381512]/60 rounded-xl border border-[#52201B] flex items-start gap-2.5 text-xs">
                <CheckCircle size={15} className="text-caramel shrink-0 mt-0.5" />
                <div className="font-normal font-sans">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-caramel/80 block">Authorized Founder Record Verified</span>
                  <span className="font-bold text-white font-mono break-all text-[11x]">{email}</span>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-caramel tracking-wider mb-1.5 font-bold">
                  Founder Complete Name
                </label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-2.5 text-[#8A6A64]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-black/40 border border-[#52201B] rounded-xl text-white placeholder-wool-200/30 focus:outline-none focus:border-caramel focus:ring-1 focus:ring-caramel transition-all font-sans"
                    placeholder="Enter full name"
                  />
                </div>
                <p className="text-[9px] text-[#A28781] mt-1 leading-relaxed">
                  Designee status automatically maps based on your founder coordinates.
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-caramel tracking-wider mb-1.5 font-bold">
                  Administrative Password
                </label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-2.5 text-[#8A6A64]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-xs bg-black/40 border border-[#52201B] rounded-xl text-white placeholder-wool-200/30 focus:outline-none focus:border-caramel focus:ring-1 focus:ring-caramel transition-all font-mono"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-[#8A6A64] hover:text-[#C7A89F]"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                
                {/* Strength Meter lines */}
                <div className="mt-2 flex gap-1.5">
                  <span className={`h-1 flex-1 rounded ${isLengthValid ? "bg-green-600" : "bg-wool-200/10"}`} />
                  <span className={`h-1 flex-1 rounded ${isMatchValid ? "bg-green-600" : "bg-wool-200/10"}`} />
                </div>
                <div className="flex justify-between items-center text-[9px] mt-1.5 text-[#A28781]">
                  <span className={isLengthValid ? "text-green-400 font-semibold" : ""}>✓ Minimum 8 length</span>
                  <span className={isMatchValid ? "text-green-400 font-semibold" : ""}>✓ Matches Confirm</span>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-caramel tracking-wider mb-1.5 font-bold">
                  Confirm Password Verification
                </label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-2.5 text-[#8A6A64]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-black/40 border border-[#52201B] rounded-xl text-white placeholder-wool-200/30 focus:outline-none focus:border-caramel focus:ring-1 focus:ring-caramel transition-all font-mono"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Two-Factor Authentication Switch */}
              <div className="p-3 bg-black/35 rounded-xl border border-[#48211D] flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Smartphone size={13} className="text-caramel" />
                    <span>Two-Factor Authentication (2FA)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                    className="w-4 h-4 accent-caramel cursor-pointer"
                  />
                </div>
                <p className="text-[9px] text-[#A28781] leading-relaxed">
                  Generates an instantly encrypted 6-digit verification code sent on every login handshake for absolute access containment. Recommended.
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 text-xs"
                  onClick={onCancel}
                  disabled={submitting}
                >
                  Discard
                </Button>
                <Button 
                  type="submit" 
                  variant="caramel" 
                  className="flex-1 text-xs font-bold font-sans uppercase hover:scale-102 transition-all"
                  disabled={submitting || !isLengthValid || !isMatchValid}
                >
                  {submitting ? "Signing Registry..." : "Claim Credentials"}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
