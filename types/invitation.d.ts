// types/invitation.d.ts
export type InvitationStatus = "invited" | "joined" | "requested" | "rejected" | "expired" | "deleted";

export interface HistoryEntry {
  timestamp: Date;
  action: string;
  performedBy: string;
}

export interface Invitation {
  id: string;
  email: string;
  status: InvitationStatus;
  roles: string[];
  environments: { [key: string]: string };
  invitedAt: Date;
  expiry?: Date;
  invitedBy?: string;
  decidedAt?: Date;
  decisionBy?: string;
  requestMessage?: string;
  updatedAt?: Date;
  history: HistoryEntry[];
}
