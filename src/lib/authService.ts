import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  signInWithPopup,
  User as FirebaseUser
} from "firebase/auth";
import { auth, googleAuthProvider } from "./firebase";

export const AuthService = {
  /**
   * Registers a student user first in Firebase Auth, then sends details to the backend API to create db records.
   */
  async signUpStudent(payload: {
    email: string;
    password: string;
    fullName: string;
    dob: string;
    schoolName: string;
    grade: string;
    skills?: string;
    interests?: string;
    researchInterests?: string;
    portfolioUrl?: string;
    github?: string;
    linkedin?: string;
  }) {
    let fbUserCredential;
    try {
      // 1. Create client-side user account inside Firebase Auth
      fbUserCredential = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
      
      // 2. Dispatch profile synchronization write to backend database
      const res = await fetch("/api/auth/signup/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: fbUserCredential.user.uid,
          ...payload
        })
      });

      const data = await res.json();
      if (!res.ok) {
        // Rollback Firebase user upon database write failure to prevent orphaned records
        try { await fbUserCredential.user.delete(); } catch (delErr) { console.error("Firebase Auth roll back failed:", delErr); }
        throw new Error(data.message || data.error || "Student database sync failure.");
      }

      return data;
    } catch (err: any) {
      if (fbUserCredential) {
        try { await fbUserCredential.user.delete(); } catch {}
      }
      throw err;
    }
  },

  /**
   * Registers a business/organization first in Firebase Auth, then sends details to the backend.
   */
  async signUpOrganization(payload: {
    email: string;
    password: string;
    organizationName: string;
    industry: string;
    website: string;
    description: string;
    contactPerson: string;
    country: string;
  }) {
    let fbUserCredential;
    try {
      // 1. Create client-side user account inside Firebase Auth
      fbUserCredential = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
      
      // 2. Dispatch profile synchronization write to backend database
      const res = await fetch("/api/auth/signup/organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: fbUserCredential.user.uid,
          ...payload
        })
      });

      const data = await res.json();
      if (!res.ok) {
        // Rollback Firebase user upon database write failure
        try { await fbUserCredential.user.delete(); } catch {}
        throw new Error(data.message || data.error || "Organization database sync failure.");
      }

      return data;
    } catch (err: any) {
      if (fbUserCredential) {
        try { await fbUserCredential.user.delete(); } catch {}
      }
      throw err;
    }
  },

  /**
   * Logs in a user. Uses Firebase Auth first, retrieves ID Token, then exchanges it for server-side JWT session.
   */
  async login(email: string, password: string, role?: string) {
    try {
      // 1. Authenticate with client Firebase Auth provider
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      
      // 2. Forward ID Token to backend to retrieve role validation and database-level profile
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, idToken, role })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Session handshake verification refused.");
      }

      return data;
    } catch (err: any) {
      // Catch specific Firebase Auth codes to display beautiful user-friendly indicators
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        throw new Error("No account found with this email / incorrect password.");
      } else if (err.code === "auth/wrong-password") {
        throw new Error("Incorrect password.");
      } else if (err.code === "auth/network-request-failed") {
        throw new Error("A network error occurred. Please check your connection and try again.");
      }
      throw err;
    }
  },

  /**
   * Signs in user using Google Sign-In, then registers on the fly if profile is absent.
   */
  async signInWithGoogle(currentRoleChoice: "student" | "organization" = "student") {
    try {
      const userCredential = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await userCredential.user.getIdToken();

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: userCredential.user.email,
          idToken,
          googleAuth: true,
          role: currentRoleChoice
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Google authentication handshake failed.");
      }

      return data;
    } catch (err: any) {
      throw err;
    }
  },

  /**
   * Dispatches password recovery via Firebase Auth email.
   */
  async requestPasswordReset(email: string) {
    try {
      // Send standard Firebase password reset email
      await sendPasswordResetEmail(auth, email);
      
      // Keep server audit trails informed
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        throw new Error("No account found with this email.");
      }
      throw err;
    }
  },

  /**
   * Signs out current user in Firebase Auth and clean server sessions.
   */
  async logout(sessionId?: string) {
    try {
      await firebaseSignOut(auth);
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
    } catch (err) {
      console.error("Logout procedure error:", err);
    }
  }
};
