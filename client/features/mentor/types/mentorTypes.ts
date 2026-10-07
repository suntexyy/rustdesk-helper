export type MentorSession = {
  mentorId: string;
  ownerKey: string; // the secret that proves this browser owns the group
  groupCode: string;
  groupName: string;
};

export type StaffStudent = {
  socketId: string;
  name: string;
  rustdeskId: string;
  password: string;
  avatar?: string;
  status: "idle" | "waiting" | "ongoing";
};
