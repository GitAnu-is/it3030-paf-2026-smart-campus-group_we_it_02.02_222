export type Role = 'USER' | 'ADMIN' | 'TECHNICIAN';
export type ResourceType = 'LECTURE_HALL' | 'LAB' | 'MEETING_ROOM' | 'EQUIPMENT';
export type ResourceStatus = 'ACTIVE' | 'OUT_OF_SERVICE';
export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type TicketCategory =
'ELECTRICAL' |
'PLUMBING' |
'IT' |
'FURNITURE' |
'OTHER';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketStatus =
'OPEN' |
'IN_PROGRESS' |
'RESOLVED' |
'CLOSED' |
'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  capacity: number;
  location: string;
  description: string;
  availabilityWindows: string;
  status: ResourceStatus;
  imageUrl: string;
}

export interface Booking {
  id: string;
  resourceId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  purpose: string;
  attendees: number;
  status: BookingStatus;
  adminNote?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  resourceId?: string;
  location: string;
  category: TicketCategory;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  reporterId: string;
  assigneeId?: string;
  images: string[];
  comments: Comment[];
  createdAt: string;
  resolvedAt?: string;
  rejectionReason?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'BOOKING' | 'TICKET' | 'SYSTEM';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  linkTo?: string;
}

export interface NotificationPreference {
  userId: string;
  bookingUpdates: boolean;
  ticketUpdates: boolean;
  commentUpdates: boolean;
}