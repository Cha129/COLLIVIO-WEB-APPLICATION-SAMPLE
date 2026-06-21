import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Upload, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw, Building2, Globe, Mail, MapPin } from "lucide-react";

interface OrgVerificationUploadProps {
  onComplete: (data: {
    docType: string;
    fileUrl: string;
    fileName: string;
    orgName: string;
    officialEmail: string;
    website: string;
    country: string;
    orgType: string;
  }) => void;
}

export default function OrgVerificationUpload({ onComplete }: OrgVerificationUploadProps) {
  // Metadata fields
  const [orgName, setOrgName] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [country, setCountry] = useState("United States");
  const [orgType, setOrgType] = useState("Corporate");
  const [docType, setDocType] = useState("Business License");

  // File states
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    setValidationError("");
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setValidationError("Invalid document format. Please upload a PDF, PNG, or JPEG file.");
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      setValidationError("The uploaded file exceeds our 10MB size limit.");
      return;
    }
    
    setFile(selectedFile);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Form field validaitons
    if (!orgName.trim()) {
      setValidationError("Please enter your organization's legal name.");
      return;
    }
    if (!officialEmail.trim() || !officialEmail.includes("@")) {
      setValidationError("Please enter a valid official/business email address.");
      return;
    }
    if (!file) {
      setValidationError("Please upload a registration or tax clearance document.");
      return;
    }

    // Start simulated uploading & OCR
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Document upload completed
            onComplete({
              docType,
              fileName: file.name,
              fileUrl: "https://firebasestorage.googleapis.com/v0/b/collivio/o/documents%2F" + file.name,
              orgName,
              officialEmail,
              website,
              country,
              orgType
            });
            setIsUploading(false);
          }, 400);
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  const handleBoxClick = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-white border border-[#E7DDD7] p-8 rounded-2xl shadow-sm text-left font-sans max-w-xl mx-auto selection:bg-caramel-500 selection:text-burgundy-950">
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-[#741717]/10 p-3 rounded-lg text-[#741717]">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-chestnut">
            Organization Verification
          </h3>
          <p className="text-xs text-gray-500">
            Provide organization credentials & proof of legal licensing for automated AI verification.
          </p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Organization Name */}
        <div className="space-y-1">
          <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D]">
            Legal Organization Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-450">
              <Building2 size={14} />
            </div>
            <input
              type="text"
              disabled={isUploading}
              required
              placeholder="e.g. Stanford Medical Labs Inc."
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full bg-[#F7F4F2] border border-[#E7DDD7] text-xs py-2 pl-9 pr-3 rounded-xl focus:outline-none focus:border-[#741717] focus:ring-1 focus:ring-[#741717] transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Official Email */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D]">
              Official Business Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-450">
                <Mail size={14} />
              </div>
              <input
                type="email"
                disabled={isUploading}
                required
                placeholder="e.g. verified@stanfordlabs.org"
                value={officialEmail}
                onChange={(e) => setOfficialEmail(e.target.value)}
                className="w-full bg-[#F7F4F2] border border-[#E7DDD7] text-xs py-2 pl-9 pr-3 rounded-xl focus:outline-none focus:border-[#741717] focus:ring-1 focus:ring-[#741717] transition"
              />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D]">
              Website (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-450">
                <Globe size={14} />
              </div>
              <input
                type="url"
                disabled={isUploading}
                placeholder="e.g. https://stanfordlabs.org"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full bg-[#F7F4F2] border border-[#E7DDD7] text-xs py-2 pl-9 pr-3 rounded-xl focus:outline-none focus:border-[#741717] focus:ring-1 focus:ring-[#741717] transition"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Country of Registration */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D]">
              Country of Registration
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-450">
                <MapPin size={14} />
              </div>
              <select
                disabled={isUploading}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#F7F4F2] border border-[#E7DDD7] text-xs py-2 pl-9 pr-3 rounded-xl focus:outline-none focus:border-[#741717] focus:ring-1 focus:ring-[#741717] transition"
              >
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Canada</option>
                <option>Germany</option>
                <option>Singapore</option>
                <option>Australia</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {/* Organization Type */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D]">
              Organization Type
            </label>
            <select
              disabled={isUploading}
              value={orgType}
              onChange={(e) => setOrgType(e.target.value)}
              className="w-full bg-[#F7F4F2] border border-[#E7DDD7] text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-[#741717] focus:ring-1 focus:ring-[#741717] transition"
            >
              <option>Corporate</option>
              <option>NGO / Non-Profit</option>
              <option>Charitable Foundation</option>
              <option>Educational Academy</option>
              <option>Governing Body</option>
            </select>
          </div>
        </div>

        {/* Document Category */}
        <div className="space-y-1">
          <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D]">
            Official Proof Document Category
          </label>
          <select
            disabled={isUploading}
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full bg-[#F7F4F2] border border-[#E7DDD7] text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-[#741717] focus:ring-1 focus:ring-[#741717] transition"
          >
            <option>Business License</option>
            <option>Certificate of Incorporation</option>
            <option>Tax Clearance (W-9 / Certificate)</option>
            <option>Official Trust Settlement Charter</option>
            <option>VAT / Tax Registration Certificate</option>
          </select>
        </div>

        {/* Drag and Drop Zone Container */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={handleBoxClick}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[160px] ${
            dragActive 
              ? "border-[#741717] bg-[#741717]/5" 
              : "border-[#E7DDD7] bg-[#F7F4F2] hover:bg-white hover:border-[#741717]"
          }`}
        >
          <input 
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileInputChange}
            disabled={isUploading || uploadProgress > 0}
          />

          <AnimatePresence mode="wait">
            {isUploading ? (
              <motion.div 
                key="uploading" 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-xs space-y-4"
              >
                <div className="flex justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-[#741717]" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-mono font-bold text-chestnut">
                    Analyzing Org Credentials... {uploadProgress}%
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    AI document validation & OCR registration audit: {file?.name}
                  </p>
                </div>
                <div className="w-full h-1.5 bg-[#E7DDD7] rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#741717]"
                    initial={{ width: "0%" }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            ) : file ? (
              <motion.div 
                key="file-ready" 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-2"
              >
                <div className="bg-emerald-100 text-emerald-800 p-2.5 rounded-full inline-block">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-xs font-bold text-gray-700 truncate max-w-[240px]">
                  {file.name}
                </p>
                <p className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • Selected
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="idle" 
                className="space-y-2 text-center"
              >
                <div className="text-[#8D695D] opacity-70 flex justify-center">
                  <Upload size={32} />
                </div>
                <div>
                  <p className="text-xs font-bold text-chestnut">
                    Drag & Drop official certificate here, or click to browse
                  </p>
                  <p className="text-[9px] text-gray-400 mt-1">
                    Supports authentic PDF, PNG, or JPG up to 10MB
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {validationError && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 text-xs border border-red-200">
            <AlertCircle size={16} className="shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading}
          className="w-full bg-[#741717] hover:bg-[#5E1212] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-sm font-mono tracking-wider uppercase disabled:bg-[#741717]/40 disabled:cursor-not-allowed"
        >
          {isUploading ? "Uploading..." : "Submit for Verification"}
        </button>
      </form>
    </div>
  );
}
