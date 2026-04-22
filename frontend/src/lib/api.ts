import axios, { AxiosInstance } from 'axios'
import type {
  Booking,
  Ticket,
  Comment,
  ResourceType,
  BookingStatus,
  TicketStatus,
} from './types'

// Create Axios instance with base URL
const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8081/api/v1',
  timeout: 10000,
})

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
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
      localStorage.removeItem('token')
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

    const response = await apiClient.get('/resources', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching resources:', error)
    throw error
  }
}

export const getResourceById = async (id: string) => {
  try {
    const response = await apiClient.get(`/resources/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching resource:', error)
    throw error
  }
}

export const createResource = async (resourceData: any) => {
  try {
    const response = await apiClient.post('/resources', resourceData)
    return response.data
  } catch (error) {
    console.error('Error creating resource:', error)
    throw error
  }
}

export const updateResource = async (id: string, resourceData: any) => {
  try {
    const response = await apiClient.put(`/resources/${id}`, resourceData)
    return response.data
  } catch (error) {
    console.error('Error updating resource:', error)
    throw error
  }
}

export const deleteResource = async (id: string) => {
  try {
    const response = await apiClient.delete(`/resources/${id}`)
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

    const response = await apiClient.get('/tickets', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching tickets:', error)
    throw error
  }
}

export const getTicketById = async (id: string) => {
  try {
    const response = await apiClient.get(`/tickets/${id}`)
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
    const response = await apiClient.post('/tickets', ticketData)
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
    const response = await apiClient.put(`/tickets/${id}/status`, {
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
    const response = await apiClient.put(`/tickets/${id}/assign`, {
      assignedTo,
    })
    return response.data
  } catch (error) {
    console.error('Error assigning ticket:', error)
    throw error
  }
}

// --- Comments ---
export const getCommentsForTicket = async (ticketId: string) => {
  try {
    const response = await apiClient.get(`/tickets/${ticketId}/comments`)
    return response.data
  } catch (error) {
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
    const response = await apiClient.post(`/tickets/${ticketId}/comments`, {
      userId,
      text,
    })
    return response.data
  } catch (error) {
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
