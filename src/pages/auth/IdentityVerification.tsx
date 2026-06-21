import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import Logo from '@/components/collivio/Logo';
import VerificationStepUpload from '@/components/verification/VerificationStepUpload';

// Shim useNavigate to maintain compatibility with SPA state navigation system
const useNavigate = () => {
  return (path: string, options?: any) => {
    console.log("SPA State Navigation trigger:", path, options);
    const event = new CustomEvent("app-navigate", { detail: { path, state: options?.state } });
    window.dispatchEvent(event);
  };
};

export default function IdentityVerification() {
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me();
      const r = user?.collivio_role || 'student';
      setRole(r);
    })();
  }, []);

  const handleUploadComplete = async ({ docType, fileUrl, fileName }: { docType: string, fileUrl: string, fileName: string }) => {
    const user = await base44.auth.me();

    // Save verification document
    await base44.entities.VerificationDocument.create({
      user_id: user.id,
      role,
      document_type: docType,
      file_url: fileUrl,
      file_name: fileName,
      status: 'pending',
    });

    // Run AI verification pipeline in the background
    runAIVerification({ user, docType, fileUrl, fileName, role });

    // Navigate to the engaging waiting experience
    navigate('/verification-waiting', { state: { docType, fileUrl, fileName } });
  };

  const runAIVerification = async ({ user, docType, fileUrl, fileName, role }: { user: any, docType: string, fileUrl: string, fileName: string, role: string | null }) => {
    // Run AI analysis and store result
    const aiResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert student document verification AI. Analyze this student verification document.
      
Document type: ${docType}
File name: ${fileName}
File URL: ${fileUrl}

Perform a comprehensive verification:
1. OCR extraction - extract student name, institution name, roll/ID number, academic year, dates
2. Authenticity check - assess document quality, signs of tampering, editing artifacts, completeness
3. Institution validation - verify the institution appears legitimate
4. Risk analysis - assess risk of fraud, duplicate, or fake document

Return structured verification data.`,
      file_urls: [fileUrl],
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: 'object',
        properties: {
          ocr_data: {
            type: 'object',
            properties: {
              student_name: { type: 'string' },
              institution_name: { type: 'string' },
              roll_number: { type: 'string' },
              academic_year: { type: 'string' },
              expiry_date: { type: 'string' },
              issue_date: { type: 'string' },
              date_of_birth: { type: 'string' }
            }
          },
          authenticity_score: { type: 'number' },
          institution_confidence: { type: 'number' },
          risk_score: { type: 'number' },
          flags: { type: 'array', items: { type: 'string' } },
          ai_explanation: { type: 'string' },
          document_readable: { type: 'boolean' }
        }
      }
    });

    // Calculate identity match score against registration name
    const registeredName = user.full_name || '';
    const extractedName = aiResult?.ocr_data?.student_name || '';
    let identityMatchScore = 50;
    if (registeredName && extractedName) {
      const reg = registeredName.toLowerCase().trim();
      const ext = extractedName.toLowerCase().trim();
      if (reg === ext) identityMatchScore = 100;
      else if (reg.includes(ext) || ext.includes(reg)) identityMatchScore = 85;
      else {
        const regWords = reg.split(' ');
        const extWords = ext.split(' ');
        const matchedWords = regWords.filter((w: string) => extWords.includes(w));
        identityMatchScore = Math.round((matchedWords.length / Math.max(regWords.length, extWords.length)) * 100);
      }
    }

    const authenticity = aiResult?.authenticity_score ?? 70;
    const risk = aiResult?.risk_score ?? 30;
    const instConf = aiResult?.institution_confidence ?? 70;

    let aiDecision = 'MANUAL_REVIEW';
    if (authenticity > 75 && identityMatchScore > 80 && risk < 30 && instConf > 65) {
      aiDecision = 'AUTO_APPROVED';
    } else if (authenticity < 40 || risk > 70) {
      aiDecision = 'REJECTED';
    }

    await base44.entities.VerificationResult.create({
      user_id: user.id,
      document_type: docType,
      file_url: fileUrl,
      ocr_data: aiResult?.ocr_data || {},
      authenticity_score: authenticity,
      identity_match_score: identityMatchScore,
      institution_confidence: instConf,
      risk_score: risk,
      age_valid: true,
      ai_decision: aiDecision,
      ai_explanation: aiResult?.ai_explanation || 'AI verification completed.',
      flags: aiResult?.flags || [],
      status: 'completed',
    });

    // Update profile status
    const newStatus = aiDecision === 'AUTO_APPROVED' ? 'ACTIVE' : 'REVIEW_PENDING';
    if (role === 'student') {
      const profiles = await base44.entities.StudentProfile.filter({ user_id: user.id });
      if (profiles.length > 0) await base44.entities.StudentProfile.update(profiles[0].id, { status: newStatus });
    } else if (role === 'organization') {
      const profiles = await base44.entities.OrganizationProfile.filter({ user_id: user.id });
      if (profiles.length > 0) await base44.entities.OrganizationProfile.update(profiles[0].id, { status: newStatus });
    }
    
    // Dispatch status verification completion event to force-refresh state
    window.dispatchEvent(new CustomEvent("verification-completed"));
  };

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F4F2' }}>
        <Loader2 className="h-8 w-8 animate-spin text-[#741717]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#F7F4F2' }}>
      <div className="border-b border-[#E7DDD7] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <Logo size="sm" />
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <AnimatePresence mode="wait">
          <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <VerificationStepUpload onComplete={handleUploadComplete} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
