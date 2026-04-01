export type EventSummary = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  createdAt: string;
  participantCount: number;
};

export type Participant = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
};

export type EventParticipant = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subscribedAt: string;
};

export type EventDetail = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  createdAt: string;
  participantCount: number;
  participants: EventParticipant[];
};
