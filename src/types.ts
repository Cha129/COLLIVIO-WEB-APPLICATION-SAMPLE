export interface Profile {
  fullName: string;
  email: string;
  role: "student" | "organization" | "admin";
  major: string;
  university: string;
  profileCompletion: number;
  missingItems: Array<{ id: number; text: string; checked: boolean }>;
  avatarUrl?: string;
  bio?: string;
}

export interface Certification {
  id: string;
  name: string;
  provider: string;
  status: "completed" | "ongoing";
  path?: string;
  progress?: number;
}

export interface Activity {
  id: string;
  text: string;
  time: string;
  type: string;
}

export interface InternshipMatch {
  id: string;
  title: string;
  matchScore: number;
  skills: string[];
  details: string;
  salary: string;
  location: string;
}

export interface Deadline {
  id: string;
  date: string;
  label: string;
}

export interface AdminFeedback {
  id: string;
  text: string;
  author: string;
}

export interface AIRecommendation {
  id: string;
  text: string;
}

export interface SkillGrowth {
  month: string;
  progress: number;
}

export interface Milestone {
  name: string;
  date: string;
  status: "completed" | "active" | "upcoming";
}

export interface KanbanCard {
  id: string;
  title: string;
  due: string;
  progress: number;
  listType: "wool" | "caramel";
  commentsCount: number;
  subtasks?: string;
  attachments?: string[];
  avatarInitials?: string[];
  checked?: boolean;
  isSpecial?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
  fileAttachment?: string;
  fileAttachmentSize?: string;
  fileAttachmentUrl?: string;
  channel?: string; // e.g. "#general", "#projects", "#announcements"
  isAnnouncement?: boolean;
  replies?: ChatMessage[];
}

export interface ResearchProject {
  id: string;
  title: string;
  desc: string;
  progress: number;
  domain: string;
  author: string;
  creator_id?: string;
  tags: string[];
  problem_id?: string | null;
  problemStatement?: string;
  goals?: string;
  requiredSkills?: string;
  expectedDuration?: string;
  teamSize?: number;
  visibility?: "public" | "private";
  members?: string[]; // Array of project member student names
  views?: number;
  likes?: number;
  comments?: Array<{ author: string; text: string; time: string }>;
  organizationName?: string; // If linked to a problem
  created_at?: string;
}

export interface Course {
  id: string;
  organization_id: string;
  organizationName?: string;
  title: string;
  description: string;
  skillsCovered: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  modules: string;
  assignments: string;
  certificates: boolean;
  eligibility: string;
  thumbnail: string;
  status: "Draft" | "Published";
  created_at?: string;
}

export interface Internship {
  id: string;
  organization_id: string;
  organizationName?: string;
  title: string;
  description: string;
  requirements: string;
  skills: string[];
  duration: string;
  stipend: string;
  remoteHybrid: "Remote" | "Hybrid" | "On-site";
  deadline: string;
  applicationLimit: number;
  status: "Active" | "Archived";
  created_at?: string;
  applicationsCount?: number;
}

export interface Problem {
  id: string;
  organization_id: string;
  organizationName?: string;
  title: string;
  industry: string;
  domain: string;
  description: string;
  problemStatement: string;
  expectedOutcome: string;
  skillsRecommended: string[];
  resources: string;
  difficulty: "Easy" | "Medium" | "Hard";
  deadline?: string;
  status: "Active" | "Archived";
  created_at?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  desc: string;
  likes: string;
  comments: string;
  type: "design" | "app" | "product";
}

export interface AdminItem {
  id: string;
  name: string;
  designation: string;
}

export interface RoadmapNode {
  id: string;
  label: string;
  completed: boolean;
  type: string;
}

export interface SkillModule {
  id: string;
  name: string;
  pathTheme: string;
  progress: number;
}

export interface SkillTask {
  id: string;
  text: string;
  due: string;
  status: "idle" | "inProgress" | "submitted";
}

export interface State {
  profile: Profile;
  certifications: Certification[];
  activityFeed: Activity[];
  internshipMatches: InternshipMatch[];
  deadlines: Deadline[];
  adminFeedback?: AdminFeedback[];
  aiRecommendations: AIRecommendation[];
  skillsGrowth: SkillGrowth[];
  milestones: Milestone[];
  kanbanColumns: {
    todo: KanbanCard[];
    inProgress: KanbanCard[];
    done: KanbanCard[];
  };
  teamChat: ChatMessage[];
  researchHub: {
    domains: Array<{ name: string; count: number }>;
    projects: ResearchProject[];
    assistantChatHistory: Array<{ sender: "user" | "assistant"; text: string }>;
    suggestions: Array<{ id: string; name: string; expertise: string; role: string }>;
  };
  mediaLab: {
    categories: string[];
    featured: MediaItem[];
    userUploads: Array<{ id: string; name: string; size: string; url: string; time: string }>;
  };
  adminsList?: AdminItem[];
  skillRoadmap: {
    careerPath: string;
    nodes: RoadmapNode[];
    modules: SkillModule[];
    tasks: SkillTask[];
  };
  courses?: Course[];
  internships?: Internship[];
  problems?: Problem[];
  platformUpdates?: string[];
}
