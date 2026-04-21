import type {
  Booking,
  Ticket,
  Comment,
  User,
  ResourceType,
  BookingStatus,
  TicketStatus,
} from './types'
import {
  mockResources,
  mockBookings,
  mockComments,
  mockNotifications,
} from './mockData.ts'

// Simulate network delay
const delay = (ms: number = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms))

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'
const TOKEN_KEY = 'uniops_token'

const authHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const apiRequest = async <T>(path: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const data = await response.json()
      message = data?.message || data?.error || message
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

// In-memory state for the mock API
let resources = [...mockResources]
let bookings = [...mockBookings]
let comments = [...mockComments]
let notifications = [...mockNotifications]

// --- Resources ---
export const getResources = async (filters?: {
  type?: ResourceType
  status?: string
  search?: string
}) => {
  await delay()
  let result = [...resources]

  if (filters) {
    if (filters.type) result = result.filter((r) => r.type === filters.type)
    if (filters.status)
      result = result.filter((r) => r.status === filters.status)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q),
      )
    }
  }
  return result
}

export const getResourceById = async (id: string) => {
  await delay()
  const resource = resources.find((r) => r.id === id)
  if (!resource) throw new Error('Resource not found')
  return resource
}

// --- Bookings ---
export const getBookings = async (filters?: {
  userId?: string
  status?: BookingStatus
  resourceId?: string
}) => {
  await delay()
  let result = [...bookings]

  if (filters) {
    if (filters.userId)
      result = result.filter((b) => b.userId === filters.userId)
    if (filters.status)
      result = result.filter((b) => b.status === filters.status)
    if (filters.resourceId)
      result = result.filter((b) => b.resourceId === filters.resourceId)
  }

  // Sort by date descending
  return result.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}

export const checkBookingConflict = async (
  resourceId: string,
  date: string,
  startTime: string,
  endTime: string,
) => {
  await delay(200)
  const resourceBookings = bookings.filter(
    (b) =>
      b.resourceId === resourceId &&
      b.date === date &&
      (b.status === 'APPROVED' || b.status === 'PENDING'),
  )

  const newStart = new Date(`1970-01-01T${startTime}`).getTime()
  const newEnd = new Date(`1970-01-01T${endTime}`).getTime()

  for (const b of resourceBookings) {
    const existingStart = new Date(`1970-01-01T${b.startTime}`).getTime()
    const existingEnd = new Date(`1970-01-01T${b.endTime}`).getTime()

    if (
      (newStart >= existingStart && newStart < existingEnd) ||
      (newEnd > existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    ) {
      return true // Conflict found
    }
  }
  return false
}

export const createBooking = async (
  bookingData: Omit<Booking, 'id' | 'status' | 'createdAt'>,
) => {
  await delay()

  const hasConflict = await checkBookingConflict(
    bookingData.resourceId,
    bookingData.date,
    bookingData.startTime,
    bookingData.endTime,
  )

  if (hasConflict) {
    throw new Error(
      'Scheduling conflict: The resource is already booked for this time slot.',
    )
  }

  const newBooking: Booking = {
    ...bookingData,
    id: `b${Date.now()}`,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  }

  bookings.push(newBooking)
  return newBooking
}

export const updateBookingStatus = async (
  id: string,
  status: BookingStatus,
  reviewedBy?: string,
  reason?: string,
) => {
  await delay()
  const index = bookings.findIndex((b) => b.id === id)
  if (index === -1) throw new Error('Booking not found')

  bookings[index] = { ...bookings[index], status, reviewedBy, reason }
  return bookings[index]
}

// --- Tickets ---
export const getTickets = async (filters?: {
  userId?: string
  status?: TicketStatus
  assignedTo?: string
}) => {
  await delay()
  const params = new URLSearchParams()
  if (filters?.userId) params.set('userId', filters.userId)
  if (filters?.status) params.set('status', filters.status)
  if (filters?.assignedTo) params.set('assignedTo', filters.assignedTo)

  const path = params.toString() ? `/api/tickets?${params.toString()}` : '/api/tickets'
  return apiRequest<Ticket[]>(path)
}

export const getTicketById = async (id: string) => {
  await delay()
  return apiRequest<Ticket>(`/api/tickets/${id}`)
}

export const createTicket = async (
  ticketData: Omit<Ticket, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
) => {
  await delay()
  return apiRequest<Ticket>('/api/tickets', {
    method: 'POST',
    body: JSON.stringify(ticketData),
  })
}

export const updateTicketStatus = async (
  id: string,
  status: TicketStatus,
  resolutionNotes?: string,
) => {
  await delay()
  return apiRequest<Ticket>(`/api/tickets/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      status,
      resolutionNotes: resolutionNotes || '',
    }),
  })
}

export const assignTicket = async (id: string, assignedTo: string) => {
  await delay()
  return apiRequest<Ticket>(`/api/tickets/${id}/assign`, {
    method: 'PUT',
    body: JSON.stringify({
      assignedTo,
      status: 'IN_PROGRESS',
    }),
  })
}

export const getUsers = async (filters?: { role?: string }) => {
  await delay()
  const params = new URLSearchParams()
  if (filters?.role) params.set('role', filters.role)

  const path = params.toString() ? `/api/users?${params.toString()}` : '/api/users'
  const users = await apiRequest<any[]>(path)
  return users.map((user) => ({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    name: user.displayName || user.username || user.email || 'Unknown User',
    email: user.email,
    role: user.role,
    avatar: user.avatarUrl || undefined,
  })) as User[]
}

// --- Comments ---
export const getCommentsForTicket = async (ticketId: string) => {
  await delay(200)
  return comments
    .filter((c) => c.ticketId === ticketId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
}

export const addComment = async (
  ticketId: string,
  userId: string,
  text: string,
) => {
  await delay()
  const newComment: Comment = {
    id: `c${Date.now()}`,
    ticketId,
    userId,
    text,
    createdAt: new Date().toISOString(),
  }
  comments.push(newComment)
  return newComment
}

// --- Notifications ---
export const getNotifications = async (userId: string) => {
  await delay()
  return notifications
    .filter((n) => n.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
}

export const markNotificationAsRead = async (id: string) => {
  await delay(200)
  const index = notifications.findIndex((n) => n.id === id)
  if (index !== -1) {
    notifications[index] = { ...notifications[index], read: true }
  }
}

export const markAllNotificationsAsRead = async (userId: string) => {
  await delay(200)
  notifications = notifications.map((n) =>
    n.userId === userId ? { ...n, read: true } : n,
  )
}
