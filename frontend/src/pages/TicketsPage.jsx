import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import {
  MessageSquareIcon,
  PaperclipIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon } from
'lucide-react';
export function TicketsPage() {
  const {
    tickets,
    resources,
    addTicket,
    updateTicketStatus,
    addComment,
    assignTicket
  } = useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('MY');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newComment, setNewComment] = useState('');
  // Form state
  const [formData, setFormData] = useState({
    location: '',
    resourceId: '',
    category: 'OTHER',
    priority: 'LOW',
    description: ''
  });
  const displayTickets = (
  activeTab === 'MY' ?
  tickets.filter(
    (t) => t.reporterId === user?.id || t.assigneeId === user?.id
  ) :
  tickets).
  sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.location || !formData.description) return;
    if (!user) return;
    addTicket({
      location: formData.location,
      resourceId: formData.resourceId || undefined,
      category: formData.category,
      priority: formData.priority,
      description: formData.description,
      reporterId: user.id,
      images: []
    });
    setActiveTab('MY');
    setFormData({
      location: '',
      resourceId: '',
      category: 'OTHER',
      priority: 'LOW',
      description: ''
    });
  };
  const handleAddComment = () => {
    if (!newComment.trim() || !selectedTicket) return;
    addComment(selectedTicket.id, newComment);
    setNewComment('');
    // Update local selected ticket state to show new comment immediately
    setSelectedTicket({
      ...selectedTicket,
      comments: [
      ...selectedTicket.comments,
      {
        id: Math.random().toString(),
        authorId: user?.id,
        content: newComment,
        createdAt: new Date().toISOString()
      }]

    });
  };
  const calculateSLA = (createdAt) => {
    const hours = Math.floor(
      (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60)
    );
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };
  return (
    <div className="space-y-6 pb-8">
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'MY' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('MY')}>
          
          My Tickets
        </button>
        {(user?.role === 'ADMIN' || user?.role === 'TECHNICIAN') &&
        <button
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'ALL' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('ALL')}>
          
            All Tickets
          </button>
        }
        <button
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'NEW' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('NEW')}>
          
          Report Issue
        </button>
      </div>

      {/* List View */}
      {(activeTab === 'MY' || activeTab === 'ALL') &&
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTickets.map((ticket) =>
        <div
          key={ticket.id}
          onClick={() => setSelectedTicket(ticket)}
          className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-all cursor-pointer flex flex-col">
          
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2">
                  <StatusBadge status={ticket.priority} type="priority" />
                  <span className="text-xs font-semibold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-full">
                    {ticket.category}
                  </span>
                </div>
                <StatusBadge status={ticket.status} type="ticket" />
              </div>

              <h3 className="font-medium text-slate-900 mb-2 line-clamp-2 flex-1">
                {ticket.description}
              </h3>

              <div className="space-y-2 mt-4 pt-4 border-t border-slate-50">
                <div className="flex items-center text-xs text-slate-500">
                  <MapPinIcon className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  <span className="truncate">{ticket.location}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <div className="flex items-center">
                    <ClockIcon className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    {calculateSLA(ticket.createdAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquareIcon className="w-3.5 h-3.5 text-slate-400" />
                    {ticket.comments.length}
                  </div>
                </div>
              </div>
            </div>
        )}
          {displayTickets.length === 0 &&
        <div className="col-span-full p-12 text-center bg-white rounded-xl border border-slate-100">
              <p className="text-slate-500">No tickets found.</p>
            </div>
        }
        </div>
      }

      {/* New Ticket Form */}
      {activeTab === 'NEW' &&
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Report a Maintenance Issue
          </h2>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location *
                </label>
                <input
                type="text"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Building A, Room 101"
                value={formData.location}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  location: e.target.value
                })
                }
                required />
              
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Related Resource (Optional)
                </label>
                <select
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.resourceId}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  resourceId: e.target.value
                })
                }>
                
                  <option value="">None</option>
                  {resources.map((r) =>
                <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category *
                </label>
                <select
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.category}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value
                })
                }>
                
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="PLUMBING">Plumbing</option>
                  <option value="IT">IT & Tech</option>
                  <option value="FURNITURE">Furniture</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Priority *
                </label>
                <select
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.priority}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value
                })
                }>
                
                  <option value="LOW">Low (Not urgent)</option>
                  <option value="MEDIUM">Medium (Needs attention soon)</option>
                  <option value="HIGH">High (Impacting work)</option>
                  <option value="CRITICAL">
                    Critical (Safety hazard / Complete failure)
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description *
              </label>
              <textarea
              rows={4}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Please describe the issue in detail..."
              value={formData.description}
              onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value
              })
              }
              required />
            
            </div>

            {/* Mock Image Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Attachments (Optional)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <PaperclipIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 font-medium">
                  Click to upload images
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Max 3 images (JPG, PNG)
                </p>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      }

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={`Ticket Details`}
        size="lg">
        
        {selectedTicket &&
        <div className="flex flex-col md:flex-row gap-6">
            {/* Left Col: Details */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  #{selectedTicket.id}
                </span>
                <StatusBadge status={selectedTicket.status} type="ticket" />
                <StatusBadge status={selectedTicket.priority} type="priority" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Description
                </h3>
                <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedTicket.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">
                    Location
                  </p>
                  <p className="text-sm text-slate-800 flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4 text-slate-400" />{' '}
                    {selectedTicket.location}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">
                    Category
                  </p>
                  <p className="text-sm text-slate-800">
                    {selectedTicket.category}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">
                    Created
                  </p>
                  <p className="text-sm text-slate-800 flex items-center gap-1">
                    <ClockIcon className="w-4 h-4 text-slate-400" />{' '}
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">
                    Assignee
                  </p>
                  <p className="text-sm text-slate-800 flex items-center gap-1">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    {selectedTicket.assigneeId ? 'Assigned' : 'Unassigned'}
                  </p>
                </div>
              </div>

              {/* Actions for Tech/Admin */}
              {(user?.role === 'ADMIN' || user?.role === 'TECHNICIAN') &&
            <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h4 className="text-sm font-semibold text-slate-900">
                    Update Status
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                  onClick={() => {
                    updateTicketStatus(selectedTicket.id, 'OPEN');
                    setSelectedTicket({
                      ...selectedTicket,
                      status: 'OPEN'
                    });
                  }}
                  className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md font-medium hover:bg-blue-100">
                  
                      Open
                    </button>
                    <button
                  onClick={() => {
                    updateTicketStatus(selectedTicket.id, 'IN_PROGRESS');
                    setSelectedTicket({
                      ...selectedTicket,
                      status: 'IN_PROGRESS'
                    });
                  }}
                  className="px-3 py-1.5 text-sm bg-amber-50 text-amber-700 rounded-md font-medium hover:bg-amber-100">
                  
                      In Progress
                    </button>
                    <button
                  onClick={() => {
                    updateTicketStatus(selectedTicket.id, 'RESOLVED');
                    setSelectedTicket({
                      ...selectedTicket,
                      status: 'RESOLVED'
                    });
                  }}
                  className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-md font-medium hover:bg-green-100">
                  
                      Resolved
                    </button>
                    <button
                  onClick={() => {
                    updateTicketStatus(selectedTicket.id, 'CLOSED');
                    setSelectedTicket({
                      ...selectedTicket,
                      status: 'CLOSED'
                    });
                  }}
                  className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-md font-medium hover:bg-slate-200">
                  
                      Closed
                    </button>
                  </div>

                  {!selectedTicket.assigneeId &&
              <button
                onClick={() => {
                  assignTicket(selectedTicket.id, user.id);
                  setSelectedTicket({
                    ...selectedTicket,
                    assigneeId: user.id
                  });
                }}
                className="w-full py-2 border-2 border-dashed border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors font-medium text-sm">
                
                      Assign to me
                    </button>
              }
                </div>
            }
            </div>

            {/* Right Col: Comments */}
            <div className="flex-1 flex flex-col bg-slate-50 rounded-xl border border-slate-100 overflow-hidden h-[500px]">
              <div className="p-4 border-b border-slate-200 bg-white">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <MessageSquareIcon className="w-4 h-4 text-slate-400" />
                  Activity & Comments
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedTicket.comments.length === 0 ?
              <p className="text-center text-slate-500 text-sm mt-10">
                    No comments yet.
                  </p> :

              selectedTicket.comments.map((comment) =>
              <div
                key={comment.id}
                className={`flex flex-col ${comment.authorId === user?.id ? 'items-end' : 'items-start'}`}>
                
                      <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 ${comment.authorId === user?.id ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'}`}>
                  
                        <p className="text-sm">{comment.content}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {new Date(comment.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                      </span>
                    </div>
              )
              }
              </div>

              <div className="p-3 bg-white border-t border-slate-200">
                <div className="flex gap-2">
                  <input
                  type="text"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="Type a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} />
                
                  <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors">
                  
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </Modal>
    </div>);

}