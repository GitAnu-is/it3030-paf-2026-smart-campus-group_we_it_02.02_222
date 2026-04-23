import axios, { AxiosInstance } from 'axios'
import type {
  Booking,
  Ticket,
  Notification,
  ResourceType,
  BookingStatus,
  TicketStatus,
} from './types'
import { mockNotifications } from './mockData'

const TOKEN_KEY = 'uniops_token'
const NOTIFICATION_STORAGE_PREFIX = 'uniops_notifications:'
const NOTIFICATION_PREFERENCES_PREFIX = 'uniops_notification_preferences:'

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  bookings: true,
  tickets: true,
  comments: true,
  system: true,
}

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8081'

// Create Axios instance with base URL
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

const getNotificationStorageKey = (userId: string) =>
  `${NOTIFICATION_STORAGE_PREFIX}${userId}`

const getNotificationPreferencesKey = (userId: string) =>
  `${NOTIFICATION_PREFERENCES_PREFIX}${userId}`

const readStoredJson = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

const writeStoredJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage failures
  }
}

const dispatchNotificationChange = () => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event('uniops-notifications-changed'))
}

const formatTicketStatusLabel = (status: TicketStatus | string) =>
  status
    .toString()
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const appendLocalNotification = (
  userId: string | undefined,
  notification: Omit<Notification, 'id' | 'userId' | 'read' | 'createdAt'>,
) => {
  if (!userId) return

  const nextNotification: Notification = {
    id:
      (globalThis as any).crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    userId,
    read: false,
    createdAt: new Date().toISOString(),
    ...notification,
  }

  const existing = getLocalNotifications(userId)
  writeStoredJson(getNotificationStorageKey(userId), [
    nextNotification,
    ...existing,
  ])
  dispatchNotificationChange()
}

const createTicketStatusNotification = (
  ticket: Partial<Ticket> | null | undefined,
  previousStatus?: string,
) => {
  if (!ticket?.id || !ticket.userId || !ticket.status) return
  if (previousStatus === ticket.status) return

  const statusLabel = formatTicketStatusLabel(ticket.status)
  appendLocalNotification(ticket.userId, {
    type: 'TICKET',
    relatedId: ticket.id,
    message: `Your ticket is now in ${statusLabel} stage.`,
  })
}

const seedNotificationsForUser = (userId: string) => {
  const userNotifications = mockNotifications.filter((notification) => notification.userId === userId)
  const hasSystemNotification = userNotifications.some((notification) => notification.type === 'SYSTEM')

  const seededNotifications = hasSystemNotification
    ? userNotifications
    : [
        {
          id: `${userId}-system-1`,
          userId,
          type: 'SYSTEM',
          message: 'System updates, maintenance notices, and platform announcements appear here.',
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...userNotifications,
      ]

  writeStoredJson(getNotificationStorageKey(userId), seededNotifications)
  return seededNotifications as Notification[]
}

const getLocalNotifications = (userId: string): Notification[] => {
  const stored = readStoredJson<Notification[]>(getNotificationStorageKey(userId))
  if (stored) {
    return stored
  }

  return seedNotificationsForUser(userId)
}

const filterNotificationsByPreferences = (
  notifications: Notification[],
  preferences: Record<string, boolean>,
) => {
  return notifications.filter((notification) => {
    switch (notification.type) {
      case 'BOOKING':
        return preferences.bookings !== false
      case 'TICKET':
        return preferences.tickets !== false
      case 'COMMENT':
        return preferences.comments !== false
      case 'SYSTEM':
      default:
        return preferences.system !== false
    }
  })
}

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or unauthorized
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// --- Resources ---
export const getResources = async (filters?: {
  type?: ResourceType
  status?: string
  minCapacity?: number
  location?: string
  search?: string
}) => {
  try {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.minCapacity) params.append('minCapacity', String(filters.minCapacity))
    if (filters?.location) params.append('location', filters.location)

    const response = await apiClient.get('/api/v1/resources', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching resources:', error)
    throw error
  }
}

export const getResourceById = async (id: string) => {
  try {
    const response = await apiClient.get(`/api/v1/resources/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching resource:', error)
    throw error
  }
}

export const createResource = async (resourceData: any) => {
  try {
    const response = await apiClient.post('/api/v1/resources', resourceData)
    return response.data
  } catch (error) {
    console.error('Error creating resource:', error)
    throw error
  }
}

export const updateResource = async (id: string, resourceData: any) => {
  try {
    const response = await apiClient.put(`/api/v1/resources/${id}`, resourceData)
    return response.data
  } catch (error) {
    console.error('Error updating resource:', error)
    throw error
  }
}

export const deleteResource = async (id: string) => {
  try {
    const response = await apiClient.delete(`/api/v1/resources/${id}`)
    return response.data
  } catch (error) {
    console.error('Error deleting resource:', error)
    throw error
  }
}

// --- Bookings ---
export const getBookings = async (filters?: {
  userId?: string
  status?: BookingStatus
  resourceId?: string
}) => {
  try {
    const params = new URLSearchParams()
    if (filters?.userId) params.append('userId', filters.userId)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.resourceId) params.append('resourceId', filters.resourceId)

    const response = await apiClient.get('/bookings', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching bookings:', error)
    throw error
  }
}

export const checkBookingConflict = async (
  resourceId: string,
  date: string,
  startTime: string,
  endTime: string,
) => {
  try {
    const response = await apiClient.post('/bookings/check-conflict', {
      resourceId,
      date,
      startTime,
      endTime,
    })
    return response.data.hasConflict || false
  } catch (error) {
    console.error('Error checking booking conflict:', error)
    throw error
  }
}

export const createBooking = async (
  bookingData: Omit<Booking, 'id' | 'status' | 'createdAt'>,
) => {
  try {
    const response = await apiClient.post('/bookings', bookingData)
    return response.data
  } catch (error) {
    console.error('Error creating booking:', error)
    throw error
  }
}

export const updateBookingStatus = async (
  id: string,
  status: BookingStatus,
  reviewedBy?: string,
  reason?: string,
) => {
  try {
    const response = await apiClient.put(`/bookings/${id}/status`, {
      status,
      reviewedBy,
      reason,
    })
    return response.data
  } catch (error) {
    console.error('Error updating booking status:', error)
    throw error
  }
}

// --- Tickets ---
export const getTickets = async (filters?: {
  userId?: string
  status?: TicketStatus
  assignedTo?: string
}) => {
  try {
    const params = new URLSearchParams()
    if (filters?.userId) params.append('userId', filters.userId)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo)

    const response = await apiClient.get('/api/tickets', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching tickets:', error)
    throw error
  }
}

export const getTicketById = async (id: string) => {
  try {
    const response = await apiClient.get(`/api/tickets/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching ticket:', error)
    throw error
  }
}

export const createTicket = async (
  ticketData: Omit<Ticket, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
) => {
  try {
    const response = await apiClient.post('/api/tickets', ticketData)
    return response.data
  } catch (error) {
    console.error('Error creating ticket:', error)
    throw error
  }
}

export const updateTicketStatus = async (
  id: string,
  status: TicketStatus,
  resolutionNotes?: string,
) => {
  try {
    const currentTicket = await getTicketById(id)
    const response = await apiClient.put(`/api/tickets/${id}`, {
      status,
      resolutionNotes,
    })
    createTicketStatusNotification(response.data, currentTicket?.status)
    return response.data
  } catch (error) {
    console.error('Error updating ticket status:', error)
    throw error
  }
}

export const assignTicket = async (id: string, assignedTo: string) => {
  try {
    const currentTicket = await getTicketById(id)
    const response = await apiClient.put(`/api/tickets/${id}/assign`, {
      assignedTo,
    })
    createTicketStatusNotification(response.data, currentTicket?.status)
    return response.data
  } catch (error) {
    console.error('Error assigning ticket:', error)
    throw error
  }
}

// --- Users ---
export const getUsers = async (filters?: { role?: string }) => {
  try {
    const params = new URLSearchParams()
    if (filters?.role) params.append('role', filters.role)

    const response = await apiClient.get('/api/users', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

// --- Comments ---
export const getCommentsForTicket = async (ticketId: string) => {
  try {
    const response = await apiClient.get(`/api/tickets/${ticketId}/comments`)
    return response.data
  } catch (error) {
    const status = (error as any)?.response?.status
    if (status === 404) {
      try {
        const raw = localStorage.getItem(`uniops_comments:${ticketId}`)
        return raw ? JSON.parse(raw) : []
      } catch {
        return []
      }
    }

    console.error('Error fetching comments:', error)
    throw error
  }
}

export const addComment = async (
  ticketId: string,
  userId: string,
  text: string,
) => {
  try {
    const response = await apiClient.post(`/api/tickets/${ticketId}/comments`, {
      userId,
      text,
    })
    return response.data
  } catch (error) {
    const status = (error as any)?.response?.status
    if (status === 404) {
      const newComment = {
        id:
          (globalThis as any).crypto?.randomUUID?.() ||
          `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        ticketId,
        userId,
        text,
        createdAt: new Date().toISOString(),
      }

      try {
        const key = `uniops_comments:${ticketId}`
        const raw = localStorage.getItem(key)
        const existing = raw ? JSON.parse(raw) : []
        const next = Array.isArray(existing) ? [...existing, newComment] : [newComment]
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        // ignore
      }

      return newComment
    }

    console.error('Error adding comment:', error)
    throw error
  }
}

export const updateComment = async (
  ticketId: string,
  commentId: string,
  text: string,
) => {
  try {
    const response = await apiClient.put(
      `/api/tickets/${ticketId}/comments/${commentId}`,
      { text },
    )
    return response.data
  } catch (error) {
    const status = (error as any)?.response?.status
    if (status === 404) {
      const key = `uniops_comments:${ticketId}`
      try {
        const raw = localStorage.getItem(key)
        const existing = raw ? JSON.parse(raw) : []
        const next = Array.isArray(existing)
          ? existing.map((c: any) =>
              c?.id === commentId
                ? { ...c, text, editedAt: new Date().toISOString() }
                : c,
            )
          : []
        localStorage.setItem(key, JSON.stringify(next))
        return next.find((c: any) => c?.id === commentId)
      } catch {
        return null
      }
    }

    console.error('Error updating comment:', error)
    throw error
  }
}

export const deleteComment = async (ticketId: string, commentId: string) => {
  try {
    const response = await apiClient.delete(
      `/api/tickets/${ticketId}/comments/${commentId}`,
    )
    return response.data
  } catch (error) {
    const status = (error as any)?.response?.status
    if (status === 404) {
      const key = `uniops_comments:${ticketId}`
      try {
        const raw = localStorage.getItem(key)
        const existing = raw ? JSON.parse(raw) : []
        const next = Array.isArray(existing)
          ? existing.filter((c: any) => c?.id !== commentId)
          : []
        localStorage.setItem(key, JSON.stringify(next))
        return { success: true }
      } catch {
        return { success: false }
      }
    }

    console.error('Error deleting comment:', error)
    throw error
  }
}

// --- Notifications ---
export const getNotificationPreferences = async (userId: string) => {
  const stored = readStoredJson<Record<string, boolean>>(
    getNotificationPreferencesKey(userId),
  )
  return {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...(stored || {}),
  }
}

export const updateNotificationPreferences = async (
  userId: string,
  preferences: Record<string, boolean>,
) => {
  const nextPreferences = {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...preferences,
  }

  writeStoredJson(getNotificationPreferencesKey(userId), nextPreferences)
  dispatchNotificationChange()
  return nextPreferences
}

export const getNotifications = async (userId: string) => {
  try {
    const response = await apiClient.get(`/users/${userId}/notifications`)
    return response.data
  } catch (error) {
    const preferences = await getNotificationPreferences(userId)
    return filterNotificationsByPreferences(
      getLocalNotifications(userId),
      preferences,
    )
  }
}

export const markNotificationAsRead = async (id: string) => {
  try {
    const response = await apiClient.put(`/notifications/${id}/read`)
    return response.data
  } catch (error) {
    const notificationKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith(NOTIFICATION_STORAGE_PREFIX),
    )

    for (const key of notificationKeys) {
      const stored = readStoredJson<Notification[]>(key)
      if (!stored) continue

      const next = stored.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      )

      if (next.some((notification, index) => notification !== stored[index])) {
        writeStoredJson(key, next)
        dispatchNotificationChange()
        return next.find((notification) => notification.id === id) || null
      }
    }

    return null
  }
}

export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const response = await apiClient.put(
      `/users/${userId}/notifications/read-all`,
    )
    return response.data
  } catch (error) {
    const stored = getLocalNotifications(userId)
    const next = stored.map((notification) => ({
      ...notification,
      read: true,
    }))

    writeStoredJson(getNotificationStorageKey(userId), next)
    dispatchNotificationChange()
    return next
  }
}
