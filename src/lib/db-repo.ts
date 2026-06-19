import { adminDb } from "./firebase-admin.ts";

export interface UserEntity {
  id: string;
  email: string;
  password_hash: string;
  role: "STUDENT" | "ORGANIZATION" | "ADMIN";
  status: "EMAIL_PENDING" | "IDENTITY_PENDING" | "REVIEW_PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";
  is_email_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentProfileEntity {
  id: string;
  user_id: string;
  full_name: string;
  date_of_birth: string;
  country: string;
  school_name: string;
  grade: string;
  bio?: string;
  skills: string[];
  interests: string[];
  research_interests?: string;
  profile_picture?: string;
  trust_score: number;
  profile_completion: number;
  created_at: string;
  updated_at: string;
}

export interface OrganizationProfileEntity {
  id: string;
  user_id: string;
  organization_name: string;
  industry: string;
  website: string;
  official_email: string;
  contact_person: string;
  country: string;
  description?: string;
  logo_url?: string;
  verification_badge: "none" | "bronze" | "silver" | "gold" | "platinum";
  trust_score: number;
  status: "EMAIL_PENDING" | "REVIEW_PENDING" | "ACTIVE" | "REJECTED" | "SUSPENDED";
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminProfileEntity {
  id: string;
  user_id: string;
  full_name: string;
  designation: string;
  profile_picture?: string;
  permissions: string[];
  created_at: string;
}

export interface VerificationDocumentEntity {
  id: string;
  user_id: string;
  role: "student" | "organization" | "admin";
  document_type: string;
  file_url: string;
  file_name?: string;
  status: "pending" | "approved" | "rejected";
  reviewer_notes?: string;
  uploaded_at: string;
  reviewed_at?: string;
}

export interface UserSessionEntity {
  id: string;
  user_id: string;
  ip_address: string;
  device: string;
  browser: string;
  created_at: string;
  expires_at: string;
}

export interface AuditLogEntity {
  id: string;
  actor_id: string;
  action: "user_approved" | "user_rejected" | "user_suspended" | "documents_requested" | "status_changed" | "profile_updated";
  target_user_id: string;
  target_role?: string;
  details: string;
  timestamp: string;
}

export interface VerificationResultEntity {
  id: string;
  user_id: string;
  document_type: string;
  file_url: string;
  ocr_data?: any;
  authenticity_score?: number;
  identity_match_score?: number;
  institution_confidence?: number;
  risk_score?: number;
  age_valid?: boolean;
  calculated_age?: number;
  ai_decision: "AUTO_APPROVED" | "MANUAL_REVIEW" | "REJECTED";
  ai_explanation?: string;
  flags?: string[];
  student_preferences?: any;
  status: "processing" | "completed" | "failed";
}

export interface OrgVerificationResultEntity {
  id: string;
  user_id: string;
  organization_name: string;
  document_type: string;
  file_url: string;
  official_email: string;
  website?: string;
  country?: string;
  org_type?: string;
  ocr_data?: any;
  name_match_score?: number;
  document_authenticity_score?: number;
  email_trust_score?: number;
  website_trust_score?: number;
  digital_presence_score?: number;
  fraud_risk_score?: number;
  trust_score: number;
  verified_badge: "none" | "bronze" | "silver" | "gold" | "platinum";
  ai_decision: "AUTO_APPROVED" | "MANUAL_REVIEW" | "REJECTED";
  ai_explanation?: string;
  flags?: string[];
  org_preferences?: any;
  status: "processing" | "completed" | "failed";
}

// ── ROBUST REPOSITORY CRUD FUNCTIONS WITH SECURITY SANITIZATION ──

export const DbRepo = {
  // USERS
  async findUserByEmail(email: string): Promise<UserEntity | null> {
    try {
      const snap = await adminDb.collection("users").where("email", "==", email.toLowerCase().trim()).get();
      if (snap.empty) return null;
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as UserEntity;
    } catch (err) {
      console.error("findUserByEmail database error:", err);
      // Fallback local search or bubble safely
      throw new Error("Durable database lookup failure", { cause: err });
    }
  },

  async findUserById(id: string): Promise<UserEntity | null> {
    try {
      const doc = await adminDb.collection("users").doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() } as UserEntity;
    } catch (err) {
      console.error("findUserById database error:", err);
      throw new Error("Durable database lookup failure", { cause: err });
    }
  },

  async createUser(user: UserEntity): Promise<void> {
    try {
      await adminDb.collection("users").doc(user.id).set(user);
    } catch (err) {
      console.error("createUser database error:", err);
      throw new Error("Failed to insert user details safely", { cause: err });
    }
  },

  async updateUserStatus(id: string, status: UserEntity["status"], isVerified?: boolean): Promise<void> {
    try {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (isVerified !== undefined) {
        updates.is_email_verified = isVerified;
      }
      await adminDb.collection("users").doc(id).update(updates);
    } catch (err) {
      console.error("updateUserStatus database error:", err);
      throw new Error("Failed updating authenticating user profile", { cause: err });
    }
  },

  // STUDENT PROFILES
  async createStudentProfile(profile: StudentProfileEntity): Promise<void> {
    try {
      await adminDb.collection("student_profiles").doc(profile.user_id).set(profile);
    } catch (err) {
      console.error("createStudentProfile error:", err);
      throw new Error("Could not construct student profile tracking indices", { cause: err });
    }
  },

  async getStudentProfile(userId: string): Promise<StudentProfileEntity | null> {
    try {
      const doc = await adminDb.collection("student_profiles").doc(userId).get();
      if (!doc.exists) return null;
      return doc.data() as StudentProfileEntity;
    } catch (err) {
      console.error("getStudentProfile error:", err);
      return null;
    }
  },

  async updateStudentProfile(userId: string, updates: Partial<StudentProfileEntity>): Promise<void> {
    try {
      const data = { ...updates, updated_at: new Date().toISOString() };
      await adminDb.collection("student_profiles").doc(userId).update(data);
    } catch (err) {
      console.error("updateStudentProfile error:", err);
    }
  },

  // ORGANIZATION PROFILES
  async createOrganizationProfile(profile: OrganizationProfileEntity): Promise<void> {
    try {
      await adminDb.collection("organization_profiles").doc(profile.user_id).set(profile);
    } catch (err) {
      console.error("createOrganizationProfile error:", err);
      throw new Error("Failed registering organizational attributes", { cause: err });
    }
  },

  async getOrganizationProfile(userId: string): Promise<OrganizationProfileEntity | null> {
    try {
      const doc = await adminDb.collection("organization_profiles").doc(userId).get();
      if (!doc.exists) return null;
      return doc.data() as OrganizationProfileEntity;
    } catch (err) {
      console.error("getOrganizationProfile error:", err);
      return null;
    }
  },

  async updateOrganizationProfile(userId: string, updates: Partial<OrganizationProfileEntity>): Promise<void> {
    try {
      const data = { ...updates, updated_at: new Date().toISOString() };
      await adminDb.collection("organization_profiles").doc(userId).update(data);
    } catch (err) {
      console.error("updateOrganizationProfile error:", err);
    }
  },

  // ADMIN PROFILES
  async createAdminProfile(profile: AdminProfileEntity): Promise<void> {
    try {
      await adminDb.collection("admin_profiles").doc(profile.user_id).set(profile);
    } catch (err) {
      console.error("createAdminProfile error:", err);
      throw new Error("Admin profile insertion failed", { cause: err });
    }
  },

  async getAdminProfile(userId: string): Promise<AdminProfileEntity | null> {
    try {
      const doc = await adminDb.collection("admin_profiles").doc(userId).get();
      if (!doc.exists) return null;
      return doc.data() as AdminProfileEntity;
    } catch (err) {
      return null;
    }
  },

  async updateAdminProfile(userId: string, updates: Partial<AdminProfileEntity>): Promise<void> {
    try {
      await adminDb.collection("admin_profiles").doc(userId).update(updates);
    } catch (err) {
      console.error("updateAdminProfile error:", err);
    }
  },

  // SESSIONS
  async createSession(session: UserSessionEntity): Promise<void> {
    try {
      await adminDb.collection("user_sessions").doc(session.id).set(session);
    } catch (err) {
      console.error("createSession database error:", err);
    }
  },

  async findSession(id: string): Promise<UserSessionEntity | null> {
    try {
      const doc = await adminDb.collection("user_sessions").doc(id).get();
      if (!doc.exists) return null;
      return doc.data() as UserSessionEntity;
    } catch (err) {
      return null;
    }
  },

  async deleteSession(id: string): Promise<void> {
    try {
      await adminDb.collection("user_sessions").doc(id).delete();
    } catch (err) {
      console.error("deleteSession error:", err);
    }
  },

  async deleteAllUserSessions(userId: string): Promise<void> {
    try {
      const snap = await adminDb.collection("user_sessions").where("user_id", "==", userId).get();
      const batch = adminDb.batch();
      snap.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (err) {
      console.error("deleteAllUserSessions database error:", err);
    }
  },

  // TOKENS (EMAIL VERIFICATION & RESET PASSWORDS)
  async createVerificationToken(userId: string, token: string, expiresAt: string): Promise<void> {
    try {
      const tokenId = `evt-${userId}-${Date.now()}`;
      await adminDb.collection("email_verification_tokens").doc(tokenId).set({
        id: tokenId,
        user_id: userId,
        token,
        expires_at: expiresAt,
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.error("createVerificationToken error:", err);
    }
  },

  async findVerificationToken(token: string): Promise<any | null> {
    try {
      const snap = await adminDb.collection("email_verification_tokens").where("token", "==", token).get();
      if (snap.empty) return null;
      return snap.docs[0].data();
    } catch (err) {
      return null;
    }
  },

  async deleteVerificationToken(id: string): Promise<void> {
    try {
      await adminDb.collection("email_verification_tokens").doc(id).delete();
    } catch (err) {
      console.error("deleteVerificationToken error:", err);
    }
  },

  async createPasswordResetToken(userId: string, token: string, expiresAt: string): Promise<void> {
    try {
      const id = `prt-${userId}-${Date.now()}`;
      await adminDb.collection("password_reset_tokens").doc(id).set({
        id,
        user_id: userId,
        token,
        expires_at: expiresAt,
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.error("createPasswordResetToken error:", err);
    }
  },

  async findPasswordResetToken(token: string): Promise<any | null> {
    try {
      const snap = await adminDb.collection("password_reset_tokens").where("token", "==", token).get();
      if (snap.empty) return null;
      return snap.docs[0].data();
    } catch (err) {
      return null;
    }
  },

  async deletePasswordResetToken(id: string): Promise<void> {
    try {
      await adminDb.collection("password_reset_tokens").doc(id).delete();
    } catch (err) {
      console.error("deletePasswordResetToken error:", err);
    }
  },

  // AUDIT LOGS
  async logEvent(logEntry: Partial<AuditLogEntity>): Promise<void> {
    try {
      const id = `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const payload = {
        id,
        actor_id: logEntry.actor_id || "SYSTEM",
        action: logEntry.action || "status_changed",
        target_user_id: logEntry.target_user_id || "SYSTEM",
        target_role: logEntry.target_role || "SYSTEM",
        details: logEntry.details || "",
        timestamp: new Date().toISOString()
      };
      await adminDb.collection("audit_logs").doc(id).set(payload);
    } catch (err) {
      console.error("logEvent database error:", err);
    }
  },

  async listAuditLogs(): Promise<AuditLogEntity[]> {
    try {
      const snap = await adminDb.collection("audit_logs").orderBy("timestamp", "desc").limit(50).get();
      return snap.docs.map(doc => doc.data() as AuditLogEntity);
    } catch (err) {
      console.error("listAuditLogs database error:", err);
      return [];
    }
  },

  // DOCUMENTS
  async createVerificationDoc(docEntity: VerificationDocumentEntity): Promise<void> {
    try {
      await adminDb.collection("verification_documents").doc(docEntity.id).set(docEntity);
    } catch (err) {
      console.error("createVerificationDoc database error:", err);
    }
  },

  async listVerificationDocs(userId: string): Promise<VerificationDocumentEntity[]> {
    try {
      const snap = await adminDb.collection("verification_documents").where("user_id", "==", userId).get();
      return snap.docs.map(doc => doc.data() as VerificationDocumentEntity);
    } catch (err) {
      return [];
    }
  },

  // ROLLBACK DELETION UTILITIES
  async deleteUser(id: string): Promise<void> {
    try {
      await adminDb.collection("users").doc(id).delete();
    } catch (err) {
      console.error("deleteUser database error:", err);
    }
  },

  async deleteStudentProfile(userId: string): Promise<void> {
    try {
      await adminDb.collection("student_profiles").doc(userId).delete();
    } catch (err) {
      console.error("deleteStudentProfile database error:", err);
    }
  },

  async deleteOrganizationProfile(userId: string): Promise<void> {
    try {
      await adminDb.collection("organization_profiles").doc(userId).delete();
    } catch (err) {
      console.error("deleteOrganizationProfile database error:", err);
    }
  },

  async deleteAdminProfile(userId: string): Promise<void> {
    try {
      await adminDb.collection("admin_profiles").doc(userId).delete();
    } catch (err) {
      console.error("deleteAdminProfile database error:", err);
    }
  }
};
