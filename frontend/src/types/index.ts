// ─── Entities ────────────────────────────────────────────────────────────────

export interface Administrator {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  address: string;
  adminId: string;
  publicToken: string;
  _count?: {
    incidents: number;
    documents: number;
    meetings: number;
    residents: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Resident {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  unit: string;
  communityId: string;
  isPresident: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: Priority;
  communityId: string;
  community?: Community;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  category: DocumentCategory;
  communityId: string;
  community?: Community;
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  type: MeetingType;
  status: MeetingStatus;
  agenda: string | null;
  minutes: string | null;
  communityId: string;
  community?: Community;
  createdAt: string;
  updatedAt: string;
}

// ─── Enums ───────────────────────────────────────────────────────────────────

export type IncidentStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type DocumentCategory =
  | "STATUTES"
  | "MINUTES"
  | "REGULATIONS"
  | "BUDGETS"
  | "OTHER";
export type MeetingType = "ORDINARY" | "EXTRAORDINARY";
export type MeetingStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

// ─── API ─────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuthResponse {
  token: string;
  admin: Administrator;
}
