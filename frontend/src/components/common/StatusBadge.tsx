import React from 'react';
interface StatusBadgeProps {
  status: string;
  type?: 'booking' | 'ticket' | 'resource' | 'priority';
}
export function StatusBadge({ status, type }: StatusBadgeProps) {
  let bg = 'bg-gray-100';
  let text = 'text-gray-800';
  const normalizedStatus = status.toUpperCase();
  switch (normalizedStatus) {
    // Greens
    case 'ACTIVE':
    case 'APPROVED':
    case 'RESOLVED':
    case 'LOW':
      // Priority
      bg = 'bg-green-100';
      text = 'text-green-800';
      break;
    // Ambers/Yellows
    case 'PENDING':
    case 'IN_PROGRESS':
    case 'MEDIUM':
      // Priority
      bg = 'bg-amber-100';
      text = 'text-amber-800';
      break;
    // Oranges
    case 'HIGH':
      // Priority
      bg = 'bg-orange-100';
      text = 'text-orange-800';
      break;
    // Reds
    case 'REJECTED':
    case 'CANCELLED':
    case 'OUT_OF_SERVICE':
    case 'CRITICAL':
      // Priority
      bg = 'bg-red-100';
      text = 'text-red-800';
      break;
    // Blues
    case 'OPEN':
      bg = 'bg-blue-100';
      text = 'text-blue-800';
      break;
    // Grays
    case 'CLOSED':
    default:
      bg = 'bg-gray-100';
      text = 'text-gray-800';
      break;
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      
      {status.replace('_', ' ')}
    </span>);

}