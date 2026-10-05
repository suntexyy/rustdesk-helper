import { User } from "../auth/types/authTypes";

export interface MeResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}
export type LiveStudent = {
  socketId: string;
  name: string;
  status: "idle" | "waiting" | "ongoing";
  groupCode: string;
  joinedAt: string;
};

export type LiveGroup = {
  code: string;
  students: number;
  waiting: number;
  ongoing: number;
};

export type LiveSnapshot = {
  online: number;
  waiting: number;
  ongoing: number;
  activeGroups: number;
  groups: LiveGroup[];
  students: LiveStudent[];
  updatedAt: number;
};
export type HelpRequestItem = {
  _id: string;
  studentName: string;
  groupCode: string;
  status: "waiting" | "ongoing" | "completed" | "cancelled";
  requestedAt: string;
  startedAt?: string;
  completedAt?: string;
};

export type DashboardStats = {
  totalStudents: number;
  totalGroups: number;
  requestsToday: number;
  perDay: { date: string; count: number }[];
  recent: HelpRequestItem[];
};
