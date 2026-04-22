import axios, { AxiosInstance } from 'axios'
import type {
  Booking,
  Ticket,
  Comment,
  User,
  ResourceType,
  BookingStatus,
  TicketStatus,
} from './types'

const TOKEN_KEY = 'uniops_token'

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8081'

// Create Axios instance with base URL
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

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
    const response = await apiClient.put(`/api/tickets/${id}`, {
      status,
      resolutionNotes,
    })
    return response.data
  } catch (error) {
    console.error('Error updating ticket status:', error)
    throw error
  }
}

export const assignTicket = async (id: string, assignedTo: string) => {
  try {
    const response = await apiClient.put(`/api/tickets/${id}/assign`, {
      assignedTo,
    })
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

// --- Notifications ---
export const getNotifications = async (userId: string) => {
  try {
    const response = await apiClient.get(`/users/${userId}/notifications`)
    return response.data
  } catch (error) {
    console.error('Error fetching notifications:', error)
    throw error
  }
}

export const markNotificationAsRead = async (id: string) => {
  try {
    const response = await apiClient.put(`/notifications/${id}/read`)
    return response.data
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const response = await apiClient.put(
      `/users/${userId}/notifications/read-all`,
    )
    return response.data
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    throw error
  }
}
