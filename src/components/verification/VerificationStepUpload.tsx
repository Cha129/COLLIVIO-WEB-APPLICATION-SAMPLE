import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Upload, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";

interface VerificationStepUploadProps {
  onComplete: (data: { docType: string; fileUrl: string; fileName: string }) => void;
}

export default function VerificationStepUpload({ onComplete }: VerificationStepUploadProps) {
  const [docType, setDocType] = useState("School ID Card");
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  
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
    setUploadError("");
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadError("Invalid format. Please select a PDF, PNG, or JPEG file.");
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadError("File exceeds size limit. Maximum allowed size is 10MB.");
      return;
    }
    
    setFile(selectedFile);
    startSimulatedUpload(selectedFile);
  };

  const startSimulatedUpload = (selectedFile: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Conclude upload and fire callback with mock/simulated URL
            onComplete({
              docType,
              fileName: selectedFile.name,
              fileUrl: "https://firebasestorage.googleapis.com/v0/b/collivio/o/documents%2F" + selectedFile.name
            });
            setIsUploading(false);
          }, 400);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
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
            Upload Credentials Proof
          </h3>
          <p className="text-xs text-gray-500">
            Submit formal identification for automated OCR & AI authenticity verification.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Document Type Selector */}
        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase font-mono font-bold text-[#8D695D]">
            Select Document Category
          </label>
          <select 
            disabled={isUploading}
            className="w-full bg-[#F7F4F2] border border-[#E7DDD7] text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-[#741717] focus:ring-1 focus:ring-[#741717] transition"
            value={docType}
            onChange={e => setDocType(e.target.value)}
          >
            <option>School ID Card</option>
            <option>Student Certificate</option>
            <option>Enrollment Letter</option>
            <option>Transcript Records</option>
          </select>
        </div>

        {/* Drag and Drop Zone Container */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={handleBoxClick}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[180px] ${
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
            disabled={isUploading}
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
                    Analyzing Document... {uploadProgress}%
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Extracting OCR credentials details {file?.name}
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
                <p className="text-[10px] text-gray-450 uppercase font-mono tracking-wider">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready
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
                    Drag & Drop file here, or click to browse
                  </p>
                  <p className="text-[9px] text-gray-400 mt-1">
                    Supports high-resolution PNG, JPG, or PDF up to 10MB
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {uploadError && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 text-xs border border-red-200">
            <AlertCircle size={16} className="shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
