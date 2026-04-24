export type Role = 'USER' | 'ADMIN' | 'TECHNICIAN'

export interface User {
  id: string
  username?: string
  displayName?: string
  name: string
  email: string
  role: Role
  avatar?: string
}

export type ResourceType = 'LECTURE_HALL' | 'LAB' | 'MEETING_ROOM' | 'EQUIPMENT'
export type ResourceStatus = 'ACTIVE' | 'OUT_OF_SERVICE'

export interface Resource {
  id: string
  name: string
  type: ResourceType
  capacity: number
  location: string
  availabilityWindows: string // e.g., "Mon-Fri 08:00-20:00"
  status: ResourceStatus
  imageUrl?: string
  description?: string
}

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export interface Booking {
  id: string
  resourceId: string
  userId: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  purpose: string
  attendees: number
  status: BookingStatus
  reviewedBy?: string
  reason?: string
  createdAt: string
}

export type TicketCategory =
  | 'ELECTRICAL'
  | 'PLUMBING'
  | 'IT_NETWORK'
  | 'FURNITURE'
  | 'HVAC'
  | 'OTHER'
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED'

export interface Ticket {
  id: string
  resourceId: string
  userId: string
  category: TicketCategory
  description: string
  priority: TicketPriority
  status: TicketStatus
  assignedTo?: string
  images: string[]
  resolutionNotes?: string
  contactDetails: string
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  ticketId: string
  userId: string
  text: string
  createdAt: string
  editedAt?: string
}

export type NotificationType = 'BOOKING' | 'TICKET' | 'COMMENT' | 'SYSTEM'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  message: string
  read: boolean
  createdAt: string
  relatedId?: string
}
