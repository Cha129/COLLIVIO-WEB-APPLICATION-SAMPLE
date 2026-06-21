import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import Logo from "@/components/collivio/Logo";
import OrgVerificationUpload from "@/components/org-verification/OrgVerificationUpload";

// Shim useNavigate to maintain compatibility with SPA state navigation system
const useNavigate = () => {
  return (path: string, options?: any) => {
    console.log("SPA State Navigation trigger:", path, options);
    const event = new CustomEvent("app-navigate", { detail: { path, state: options?.state } });
    window.dispatchEvent(event);
  };
};

export default function OrgIdentityVerification() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const handleUploadComplete = async ({
    docType,
    fileUrl,
    fileName,
    orgName,
    officialEmail,
    website,
    country,
    orgType,
  }: {
    docType: string;
    fileUrl: string;
    fileName: string;
    orgName: string;
    officialEmail: string;
    website: string;
    country: string;
    orgType: string;
  }) => {
    const u = user || (await base44.auth.me());

    // Save verification document
    await base44.entities.VerificationDocument.create({
      user_id: u.id,
      role: "organization",
      document_type: docType,
      file_url: fileUrl,
      file_name: fileName,
      status: "pending",
    });

    // Run AI pipeline in background
    runOrgAIVerification({
      user: u,
      docType,
      fileUrl,
      fileName,
      orgName,
      officialEmail,
      website,
      country,
      orgType,
    });

    // Navigate to the waiting experience
    navigate("/org-verification-waiting", {
      state: { docType, fileUrl, fileName, orgName, officialEmail, website, country, orgType },
    });
  };

  const runOrgAIVerification = async ({
    user,
    docType,
    fileUrl,
    fileName,
    orgName,
    officialEmail,
    website,
    country,
    orgType,
  }: {
    user: any;
    docType: string;
    fileUrl: string;
    fileName: string;
    orgName: string;
    officialEmail: string;
    website: string;
    country: string;
    orgType: string;
  }) => {
    const aiResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert organization document verification AI. Analyze this business/organization registration document.

Document type: ${docType}
File name: ${fileName}
File URL: ${fileUrl}
Submitted organization name: "${orgName}"
Official email: ${officialEmail}
Website: ${website || "not provided"}
Country: ${country}
Organization type: ${orgType}

Perform comprehensive verification:
1. OCR extraction - extract org name, registration number, issue date, registration authority, country, address
2. Compare submitted org name vs extracted (0-100 score)
3. Document authenticity matching (0-100 score)
4. Domain trust for official email (0-100 score)
5. Website match and existence confidence (0-100 score)
6. Footprint digital presence check (0-100 score)
7. Fake or duplicated registration probability risk score (0-100)
8. Combined comprehensive organization confidence trust score (0-100)
9. Badge of verification status level: "none", "bronze", "silver", "gold", "platinum"
10. Automatic decision flow mapping: AUTO_APPROVED, REJECTED, or MANUAL_REVIEW

Generate validated telemetry output.`,
      file_urls: [fileUrl],
      model: "claude_sonnet_4_6",
      response_json_schema: {
        type: "object",
        properties: {
          ocr_data: {
            type: "object",
            properties: {
              extracted_org_name: { type: "string" },
              registration_number: { type: "string" },
              issue_date: { type: "string" },
              registration_authority: { type: "string" },
              country: { type: "string" },
              address: { type: "string" },
            },
          },
          name_match_score: { type: "number" },
          document_authenticity_score: { type: "number" },
          email_trust_score: { type: "number" },
          website_trust_score: { type: "number" },
          digital_presence_score: { type: "number" },
          fraud_risk_score: { type: "number" },
          trust_score: { type: "number" },
          verified_badge: { type: "string" },
          ai_decision: { type: "string" },
          ai_explanation: { type: "string" },
          flags: { type: "array", items: { type: "string" } },
        },
      },
    });

    const trustScore = aiResult?.trust_score ?? 60;
    let aiDecision = aiResult?.ai_decision || "MANUAL_REVIEW";
    if (!["AUTO_APPROVED", "MANUAL_REVIEW", "REJECTED"].includes(aiDecision)) {
      aiDecision = trustScore > 90 ? "AUTO_APPROVED" : trustScore < 30 ? "REJECTED" : "MANUAL_REVIEW";
    }

    let badge = aiResult?.verified_badge || "none";
    if (!["none", "bronze", "silver", "gold", "platinum"].includes(badge)) {
      badge =
        trustScore >= 95
          ? "platinum"
          : trustScore >= 85
          ? "gold"
          : trustScore >= 75
          ? "silver"
          : trustScore >= 60
          ? "bronze"
          : "none";
    }

    await base44.entities.OrgVerificationResult.create({
      user_id: user.id,
      organization_name: orgName,
      document_type: docType,
      file_url: fileUrl,
      official_email: officialEmail,
      website: website || "",
      country,
      org_type: orgType,
      ocr_data: aiResult?.ocr_data || {},
      name_match_score: aiResult?.name_match_score ?? 70,
      document_authenticity_score: aiResult?.document_authenticity_score ?? 60,
      email_trust_score: aiResult?.email_trust_score ?? 60,
      website_trust_score: aiResult?.website_trust_score ?? 50,
      digital_presence_score: aiResult?.digital_presence_score ?? 50,
      fraud_risk_score: aiResult?.fraud_risk_score ?? 30,
      trust_score: trustScore,
      verified_badge: badge,
      ai_decision: aiDecision,
      ai_explanation: aiResult?.ai_explanation || "AI organization verification audit completed.",
      flags: aiResult?.flags || [],
      status: "completed",
    });

    const newStatus = aiDecision === "AUTO_APPROVED" ? "ACTIVE" : "REVIEW_PENDING";
    const profiles = await base44.entities.OrganizationProfile.filter({ user_id: user.id });
    if (profiles.length > 0) {
      await base44.entities.OrganizationProfile.update(profiles[0].id, { status: newStatus });
    }

    // Dispatch status verification completion event to force-refresh state
    window.dispatchEvent(new CustomEvent("verification-completed"));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7F4F2" }}>
        <Loader2 className="h-8 w-8 animate-spin text-[#741717]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F7F4F2" }}>
      <div className="border-b border-[#E7DDD7] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <Logo size="sm" />
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <OrgVerificationUpload onComplete={handleUploadComplete} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
