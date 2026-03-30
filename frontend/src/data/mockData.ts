import { Resource, Booking, Ticket, User, Notification } from '../types';

export const mockUsers: User[] = [
{
  id: 'u1',
  name: 'Alice Student',
  email: 'alice@uni.edu',
  role: 'USER',
  avatarUrl: 'https://i.pravatar.cc/150?u=u1'
},
{
  id: 'u2',
  name: 'Bob Professor',
  email: 'bob@uni.edu',
  role: 'USER',
  avatarUrl: 'https://i.pravatar.cc/150?u=u2'
},
{
  id: 'a1',
  name: 'Admin Sarah',
  email: 'sarah.admin@uni.edu',
  role: 'ADMIN',
  avatarUrl: 'https://i.pravatar.cc/150?u=a1'
},
{
  id: 'a2',
  name: 'Admin Mike',
  email: 'mike.admin@uni.edu',
  role: 'ADMIN',
  avatarUrl: 'https://i.pravatar.cc/150?u=a2'
},
{
  id: 't1',
  name: 'Tech Dave',
  email: 'dave.tech@uni.edu',
  role: 'TECHNICIAN',
  avatarUrl: 'https://i.pravatar.cc/150?u=t1'
},
{
  id: 't2',
  name: 'Tech Elena',
  email: 'elena.tech@uni.edu',
  role: 'TECHNICIAN',
  avatarUrl: 'https://i.pravatar.cc/150?u=t2'
}];


export const mockResources: Resource[] = [
{
  id: 'r1',
  name: 'Main Auditorium',
  type: 'LECTURE_HALL',
  capacity: 500,
  location: 'Building A, Floor 1',
  description: 'Large lecture hall with dual projectors and surround sound.',
  availabilityWindows: 'Mon-Fri 08:00-20:00',
  status: 'ACTIVE',
  imageUrl:
  'https://images.unsplash.com/photo-1592289658514-61014e304b73?auto=format&fit=crop&q=80&w=800'
},
{
  id: 'r2',
  name: 'Engineering Lab A',
  type: 'LAB',
  capacity: 30,
  location: 'Building C, Floor 2',
  description:
  'Fully equipped electronics lab with oscilloscopes and soldering stations.',
  availabilityWindows: 'Mon-Fri 09:00-18:00',
  status: 'ACTIVE',
  imageUrl:
  'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800'
},
{
  id: 'r3',
  name: 'Chemistry Lab 101',
  type: 'LAB',
  capacity: 24,
  location: 'Science Wing, Floor 1',
  description: 'Standard chemistry lab with fume hoods.',
  availabilityWindows: 'Mon-Fri 08:00-17:00',
  status: 'OUT_OF_SERVICE',
  imageUrl:
  'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800'
},
{
  id: 'r4',
  name: 'Meeting Room Alpha',
  type: 'MEETING_ROOM',
  capacity: 10,
  location: 'Library, Floor 3',
  description: 'Quiet meeting room with a whiteboard and smart TV.',
  availabilityWindows: 'Mon-Sun 08:00-22:00',
  status: 'ACTIVE',
  imageUrl:
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'
},
{
  id: 'r5',
  name: 'Meeting Room Beta',
  type: 'MEETING_ROOM',
  capacity: 8,
  location: 'Library, Floor 3',
  description: 'Small collaborative space.',
  availabilityWindows: 'Mon-Sun 08:00-22:00',
  status: 'ACTIVE',
  imageUrl:
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=800'
},
{
  id: 'r6',
  name: 'Projector Unit #3',
  type: 'EQUIPMENT',
  capacity: 1,
  location: 'IT Helpdesk',
  description: 'Portable 4K projector with HDMI/USB-C inputs.',
  availabilityWindows: 'Mon-Fri 08:00-17:00',
  status: 'ACTIVE',
  imageUrl:
  'https://images.unsplash.com/photo-1585776467978-43d995166418?auto=format&fit=crop&q=80&w=800'
},
{
  id: 'r7',
  name: 'DSLR Camera Kit',
  type: 'EQUIPMENT',
  capacity: 1,
  location: 'Media Center',
  description: 'Canon EOS R5 with 24-70mm lens and tripod.',
  availabilityWindows: 'Mon-Fri 09:00-16:00',
  status: 'ACTIVE',
  imageUrl:
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800'
},
{
  id: 'r8',
  name: 'Seminar Room 4',
  type: 'LECTURE_HALL',
  capacity: 60,
  location: 'Building B, Floor 2',
  description: 'Medium sized room for seminars and guest lectures.',
  availabilityWindows: 'Mon-Fri 08:00-20:00',
  status: 'ACTIVE',
  imageUrl:
  'https://images.unsplash.com/photo-1577414371454-8c85859600b3?auto=format&fit=crop&q=80&w=800'
}];


const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

export const mockBookings: Booking[] = [
{
  id: 'b1',
  resourceId: 'r1',
  userId: 'u2',
  date: today,
  startTime: '10:00',
  endTime: '12:00',
  purpose: 'CS101 Midterm Exam',
  attendees: 450,
  status: 'APPROVED',
  createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
},
{
  id: 'b2',
  resourceId: 'r4',
  userId: 'u1',
  date: today,
  startTime: '14:00',
  endTime: '15:30',
  purpose: 'Study Group',
  attendees: 5,
  status: 'APPROVED',
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
},
{
  id: 'b3',
  resourceId: 'r6',
  userId: 'u2',
  date: tomorrow,
  startTime: '09:00',
  endTime: '17:00',
  purpose: 'Guest Lecture Presentation',
  attendees: 1,
  status: 'PENDING',
  createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
},
{
  id: 'b4',
  resourceId: 'r2',
  userId: 'u1',
  date: tomorrow,
  startTime: '13:00',
  endTime: '16:00',
  purpose: 'Robotics Project Assembly',
  attendees: 4,
  status: 'PENDING',
  createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
},
{
  id: 'b5',
  resourceId: 'r5',
  userId: 'u1',
  date: today,
  startTime: '09:00',
  endTime: '10:00',
  purpose: 'Quick sync',
  attendees: 3,
  status: 'CANCELLED',
  createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
},
{
  id: 'b6',
  resourceId: 'r8',
  userId: 'u2',
  date: tomorrow,
  startTime: '10:00',
  endTime: '12:00',
  purpose: 'Department Meeting',
  attendees: 40,
  status: 'REJECTED',
  adminNote: 'Room is reserved for maintenance during this time.',
  createdAt: new Date(Date.now() - 86400000).toISOString()
}];


export const mockTickets: Ticket[] = [
{
  id: 'tkt1',
  resourceId: 'r1',
  location: 'Building A, Floor 1',
  category: 'IT',
  description: 'Left projector is displaying a pink tint.',
  priority: 'HIGH',
  status: 'OPEN',
  reporterId: 'u2',
  images: [],
  comments: [],
  createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
},
{
  id: 'tkt2',
  resourceId: 'r3',
  location: 'Science Wing, Floor 1',
  category: 'PLUMBING',
  description: 'Fume hood sink is leaking onto the floor.',
  priority: 'CRITICAL',
  status: 'IN_PROGRESS',
  reporterId: 'u1',
  assigneeId: 't1',
  images: [],
  comments: [
  {
    id: 'c1',
    ticketId: 'tkt2',
    authorId: 't1',
    content: 'I am on my way with the plumbing kit.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  }],

  createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
},
{
  id: 'tkt3',
  location: "Library 2nd Floor Men's Restroom",
  category: 'PLUMBING',
  description: 'Soap dispenser is broken.',
  priority: 'LOW',
  status: 'RESOLVED',
  reporterId: 'u1',
  assigneeId: 't1',
  images: [],
  comments: [],
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  resolvedAt: new Date(Date.now() - 86400000).toISOString()
},
{
  id: 'tkt4',
  resourceId: 'r4',
  location: 'Library, Floor 3',
  category: 'FURNITURE',
  description: 'Two chairs have broken wheels.',
  priority: 'MEDIUM',
  status: 'OPEN',
  reporterId: 'u2',
  images: [],
  comments: [],
  createdAt: new Date(Date.now() - 86400000).toISOString()
}];


export const mockNotifications: Notification[] = [
{
  id: 'n1',
  userId: 'u1',
  type: 'BOOKING',
  title: 'Booking Approved',
  message: 'Your booking for Meeting Room Alpha has been approved.',
  read: false,
  createdAt: new Date(Date.now() - 3600000).toISOString(),
  linkTo: 'bookings'
},
{
  id: 'n2',
  userId: 'u1',
  type: 'TICKET',
  title: 'Ticket Updated',
  message:
  'Tech Dave commented on your ticket "Fume hood sink is leaking...".',
  read: false,
  createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  linkTo: 'tickets'
},
{
  id: 'n3',
  userId: 'a1',
  type: 'BOOKING',
  title: 'New Booking Request',
  message: 'Alice Student requested Projector Unit #3.',
  read: true,
  createdAt: new Date(Date.now() - 86400000).toISOString(),
  linkTo: 'bookings'
}];