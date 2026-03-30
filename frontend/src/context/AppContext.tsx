import React, { useState, createContext, useContext, ReactNode } from 'react';
import {
  Resource,
  Booking,
  Ticket,
  Notification,
  BookingStatus,
  TicketStatus,
  Comment } from
'../types';
import {
  mockResources,
  mockBookings,
  mockTickets,
  mockNotifications } from
'../data/mockData';
import { useAuth } from './AuthContext';
interface AppContextType {
  resources: Resource[];
  bookings: Booking[];
  tickets: Ticket[];
  notifications: Notification[];
  // Resource actions
  addResource: (resource: Omit<Resource, 'id'>) => void;
  updateResource: (id: string, updates: Partial<Resource>) => void;
  // Booking actions
  addBooking: (booking: Omit<Booking, 'id' | 'status' | 'createdAt'>) => {
    success: boolean;
    error?: string;
  };
  updateBookingStatus: (
  id: string,
  status: BookingStatus,
  adminNote?: string)
  => void;
  // Ticket actions
  addTicket: (
  ticket: Omit<Ticket, 'id' | 'status' | 'createdAt' | 'comments'>)
  => void;
  updateTicketStatus: (
  id: string,
  status: TicketStatus,
  reason?: string)
  => void;
  assignTicket: (id: string, assigneeId: string) => void;
  addComment: (ticketId: string, content: string) => void;
  // Notification actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}
const AppContext = createContext<AppContextType | undefined>(undefined);
export function AppProvider({ children }: {children: ReactNode;}) {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>(mockResources);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [notifications, setNotifications] =
  useState<Notification[]>(mockNotifications);
  const generateId = () => Math.random().toString(36).substr(2, 9);
  const createNotification = (
  userId: string,
  type: 'BOOKING' | 'TICKET' | 'SYSTEM',
  title: string,
  message: string,
  linkTo?: string) =>
  {
    const newNotif: Notification = {
      id: generateId(),
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      linkTo
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };
  const addResource = (resource: Omit<Resource, 'id'>) => {
    setResources((prev) => [
    ...prev,
    {
      ...resource,
      id: generateId()
    }]
    );
  };
  const updateResource = (id: string, updates: Partial<Resource>) => {
    setResources((prev) =>
    prev.map((r) =>
    r.id === id ?
    {
      ...r,
      ...updates
    } :
    r
    )
    );
  };
  const addBooking = (
  bookingData: Omit<Booking, 'id' | 'status' | 'createdAt'>) =>
  {
    // Conflict detection
    const hasConflict = bookings.some(
      (b) =>
      b.resourceId === bookingData.resourceId &&
      b.date === bookingData.date &&
      b.status !== 'REJECTED' &&
      b.status !== 'CANCELLED' && (
      bookingData.startTime >= b.startTime &&
      bookingData.startTime < b.endTime ||
      bookingData.endTime > b.startTime &&
      bookingData.endTime <= b.endTime ||
      bookingData.startTime <= b.startTime &&
      bookingData.endTime >= b.endTime)
    );
    if (hasConflict) {
      return {
        success: false,
        error: 'This resource is already booked during the selected time.'
      };
    }
    const newBooking: Booking = {
      ...bookingData,
      id: generateId(),
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    setBookings((prev) => [newBooking, ...prev]);
    // Notify admins
    createNotification(
      'admin',
      'BOOKING',
      'New Booking Request',
      `A new booking request was submitted for ${bookingData.date}.`,
      'bookings'
    );
    return {
      success: true
    };
  };
  const updateBookingStatus = (
  id: string,
  status: BookingStatus,
  adminNote?: string) =>
  {
    setBookings((prev) =>
    prev.map((b) => {
      if (b.id === id) {
        createNotification(
          b.userId,
          'BOOKING',
          `Booking ${status}`,
          `Your booking on ${b.date} was ${status.toLowerCase()}.`,
          'bookings'
        );
        return {
          ...b,
          status,
          adminNote
        };
      }
      return b;
    })
    );
  };
  const addTicket = (
  ticketData: Omit<Ticket, 'id' | 'status' | 'createdAt' | 'comments'>) =>
  {
    const newTicket: Ticket = {
      ...ticketData,
      id: generateId(),
      status: 'OPEN',
      comments: [],
      createdAt: new Date().toISOString()
    };
    setTickets((prev) => [newTicket, ...prev]);
    createNotification(
      'admin',
      'TICKET',
      'New Ticket Created',
      `A new ${ticketData.priority} priority ticket was created.`,
      'tickets'
    );
  };
  const updateTicketStatus = (
  id: string,
  status: TicketStatus,
  reason?: string) =>
  {
    setTickets((prev) =>
    prev.map((t) => {
      if (t.id === id) {
        const updates: Partial<Ticket> = {
          status
        };
        if (status === 'RESOLVED' || status === 'CLOSED')
        updates.resolvedAt = new Date().toISOString();
        if (reason) updates.rejectionReason = reason;
        createNotification(
          t.reporterId,
          'TICKET',
          `Ticket Status Updated`,
          `Your ticket is now ${status.replace('_', ' ')}.`,
          'tickets'
        );
        return {
          ...t,
          ...updates
        };
      }
      return t;
    })
    );
  };
  const assignTicket = (id: string, assigneeId: string) => {
    setTickets((prev) =>
    prev.map((t) => {
      if (t.id === id) {
        createNotification(
          assigneeId,
          'TICKET',
          'Ticket Assigned',
          `You have been assigned a new ticket.`,
          'tickets'
        );
        return {
          ...t,
          assigneeId
        };
      }
      return t;
    })
    );
  };
  const addComment = (ticketId: string, content: string) => {
    if (!user) return;
    const newComment: Comment = {
      id: generateId(),
      ticketId,
      authorId: user.id,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTickets((prev) =>
    prev.map((t) => {
      if (t.id === ticketId) {
        // Notify the other party
        const notifyUserId =
        user.id === t.reporterId ? t.assigneeId : t.reporterId;
        if (notifyUserId) {
          createNotification(
            notifyUserId,
            'TICKET',
            'New Comment',
            `New comment on your ticket.`,
            'tickets'
          );
        }
        return {
          ...t,
          comments: [...t.comments, newComment]
        };
      }
      return t;
    })
    );
  };
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
    prev.map((n) =>
    n.id === id ?
    {
      ...n,
      read: true
    } :
    n
    )
    );
  };
  const markAllNotificationsRead = () => {
    if (!user) return;
    setNotifications((prev) =>
    prev.map((n) =>
    n.userId === user.id || n.userId === 'admin' ?
    {
      ...n,
      read: true
    } :
    n
    )
    );
  };
  return (
    <AppContext.Provider
      value={{
        resources,
        bookings,
        tickets,
        notifications,
        addResource,
        updateResource,
        addBooking,
        updateBookingStatus,
        addTicket,
        updateTicketStatus,
        assignTicket,
        addComment,
        markNotificationRead,
        markAllNotificationsRead
      }}>
      
      {children}
    </AppContext.Provider>);

}
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}