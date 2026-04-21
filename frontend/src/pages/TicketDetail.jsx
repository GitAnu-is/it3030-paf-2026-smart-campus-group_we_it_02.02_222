import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { getTicketById, getResourceById, getCommentsForTicket, updateTicketStatus, assignTicket, addComment, getUsers, } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Modal } from '../components/Modal';
import { ArrowLeft, Clock, MapPin, Mail, MessageSquare, Send, CheckCircle, Wrench, Image as ImageIcon, } from 'lucide-react';
export function TicketDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [resource, setResource] = useState(null);
    const [comments, setComments] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
    const [resolutionNotes, setResolutionNotes] = useState('');
    useEffect(() => {
        fetchData();
    }, [id]);
    const fetchData = async () => {
        if (!id)
            return;
        setIsLoading(true);
        try {
            const tData = await getTicketById(id);
            setTicket(tData);
            const [rData, cData, technicianData, userData] = await Promise.all([
                getResourceById(tData.resourceId),
                getCommentsForTicket(id),
                getUsers({ role: 'TECHNICIAN' }),
                getUsers(),
            ]);
            setResource(rData);
            setComments(cData);
            setTechnicians(technicianData);
            setUsers(userData);
        }
        catch (error) {
            console.error('Failed to fetch ticket details', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!user || !id || !newComment.trim())
            return;
        setIsSubmittingComment(true);
        try {
            await addComment(id, user.id, newComment);
            setNewComment('');
            const cData = await getCommentsForTicket(id);
            setComments(cData);
        }
        catch (error) {
            console.error('Failed to add comment', error);
        }
        finally {
            setIsSubmittingComment(false);
        }
    };
    const handleStatusChange = async (status) => {
        if (!ticket)
            return;
        try {
            await updateTicketStatus(ticket.id, status);
            fetchData();
        }
        catch (error) {
            console.error('Failed to update status', error);
        }
    };
    const handleResolve = async () => {
        if (!ticket || !resolutionNotes.trim())
            return;
        try {
            await updateTicketStatus(ticket.id, 'RESOLVED', resolutionNotes);
            setIsResolveModalOpen(false);
            fetchData();
        }
        catch (error) {
            console.error('Failed to resolve ticket', error);
        }
    };
    const handleAssign = async (assigneeId) => {
        if (!ticket)
            return;
        try {
            await assignTicket(ticket.id, assigneeId);
            fetchData();
        }
        catch (error) {
            console.error('Failed to assign ticket', error);
        }
    };
    if (isLoading)
        return <LoadingSpinner fullPage/>;
    if (!ticket || !resource)
        return <div className="p-8 text-center">Ticket not found</div>;
    const getUser = (userId) => users.find((u) => u.id === userId);
    const getUserName = (userId) => {
        const foundUser = getUser(userId);
        return (foundUser?.displayName || foundUser?.name || 'Unknown User');
    };
    const getUserAvatar = (userId) => getUser(userId)?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserName(userId))}&background=6366f1&color=fff`;
    // Calculate SLA
    const created = new Date(ticket.createdAt).getTime();
    const now = new Date().getTime();
    const diffHours = Math.floor((now - created) / (1000 * 60 * 60));
    const workflowSteps = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    const currentStepIndex = workflowSteps.indexOf(ticket.status);
    return (<div className="max-w-5xl mx-auto space-y-6 pb-12">
      <button onClick={() => navigate('/tickets')} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1"/> Back to Tickets
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
                #{ticket.id}
              </span>
              <StatusBadge status={ticket.status}/>
              <PriorityBadge priority={ticket.priority}/>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {ticket.category.replace('_', ' ')} Issue
            </h1>
            <p className="text-slate-500 mt-1 flex items-center">
              <Clock className="w-4 h-4 mr-1.5"/>
              Reported on {new Date(ticket.createdAt).toLocaleString()} (
              {diffHours}h ago)
            </p>
          </div>

          {/* Action Buttons based on role and status */}
          <div className="flex flex-wrap gap-2">
            {user?.role === 'ADMIN' && ticket.status === 'OPEN' && (<button onClick={() => handleStatusChange('IN_PROGRESS')} className="px-4 py-2 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors">
                Mark In Progress
              </button>)}

            {(user?.role === 'TECHNICIAN' || user?.role === 'ADMIN') &&
            (ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (<button onClick={() => setIsResolveModalOpen(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm transition-colors flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2"/> Resolve Ticket
                </button>)}

            {user?.role === 'ADMIN' && ticket.status === 'RESOLVED' && (<button onClick={() => handleStatusChange('CLOSED')} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 shadow-sm transition-colors">
                Close Ticket
              </button>)}
          </div>
        </div>

        {/* Workflow Timeline */}
        {ticket.status !== 'REJECTED' && (<div className="relative mt-8 mb-4">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full"/>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-500 rounded-full transition-all duration-500" style={{
                width: `${(Math.max(0, currentStepIndex) / 3) * 100}%`,
            }}/>
            <div className="relative flex justify-between">
              {workflowSteps.map((step, index) => {
                const isCompleted = currentStepIndex >= index;
                const isCurrent = currentStepIndex === index;
                return (<div key={step} className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 border-2 transition-colors ${isCompleted ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white border-slate-300 text-slate-300'}`}>
                      {isCompleted && <CheckCircle className="w-4 h-4"/>}
                    </div>
                    <span className={`text-xs font-medium mt-2 absolute top-6 ${isCurrent ? 'text-primary-700' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                      {step.replace('_', ' ')}
                    </span>
                  </div>);
            })}
            </div>
          </div>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Description
            </h2>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </p>

            {ticket.images && ticket.images.length > 0 && (<div className="mt-6">
                <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2"/> Attachments
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {ticket.images.map((img, i) => (<img key={i} src={img} alt={`Attachment ${i + 1}`} className="h-32 w-48 object-cover rounded-lg border border-slate-200"/>))}
                </div>
              </div>)}
          </div>

          {ticket.resolutionNotes && (<div className="bg-green-50 rounded-xl border border-green-200 p-6">
              <h2 className="text-lg font-semibold text-green-900 mb-2 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2"/> Resolution Notes
              </h2>
              <p className="text-green-800 whitespace-pre-wrap">
                {ticket.resolutionNotes}
              </p>
            </div>)}

          {/* Comments Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center">
              <MessageSquare className="w-5 h-5 text-slate-500 mr-2"/>
              <h2 className="text-lg font-semibold text-slate-900">
                Activity & Comments
              </h2>
            </div>

            <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
              {comments.length === 0 ? (<p className="text-center text-slate-500 py-4">
                  No comments yet.
                </p>) : (comments.map((comment) => (<div key={comment.id} className="flex gap-4">
                    <img src={getUserAvatar(comment.userId)} alt="" className="w-10 h-10 rounded-full border border-slate-200 shrink-0"/>
                    <div className="flex-1">
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-slate-900">
                            {getUserName(comment.userId)}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-700 text-sm">{comment.text}</p>
                      </div>
                    </div>
                  </div>)))}
            </div>

            <div className="p-4 border-t border-slate-200 bg-white">
              <form onSubmit={handleAddComment} className="flex gap-3">
                <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Type a comment..." className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"/>
                <button type="submit" disabled={!newComment.trim() || isSubmittingComment} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center">
                  {isSubmittingComment ? (<LoadingSpinner size="sm" className="text-white"/>) : (<Send className="w-4 h-4"/>)}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Resource Info */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Resource Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mr-3 shrink-0">
                  <Wrench className="w-5 h-5 text-primary-600"/>
                </div>
                <div>
                  <p className="font-medium text-slate-900">{resource.name}</p>
                  <p className="text-xs text-slate-500">
                    {resource.type.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <MapPin className="w-4 h-4 mr-2 text-slate-400"/>
                {resource.location}
              </div>
              <button onClick={() => navigate(`/facilities/${resource.id}`)} className="w-full py-2 text-sm font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
                View Resource
              </button>
            </div>
          </div>

          {/* Assignment */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Assignment
            </h3>

            {user?.role === 'ADMIN' ? (<div className="space-y-3">
                <label className="block text-sm text-slate-600">
                  Assign to Technician:
                </label>
                <select value={ticket.assignedTo || ''} onChange={(e) => handleAssign(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
                  <option value="">Unassigned</option>
                  {technicians.map((tech) => (<option key={tech.id} value={tech.id}>
                      {tech.name}
                    </option>))}
                </select>
              </div>) : (<div className="flex items-center">
                {ticket.assignedTo ? (<>
                    <img src={getUserAvatar(ticket.assignedTo)} className="w-8 h-8 rounded-full mr-3" alt=""/>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {getUserName(ticket.assignedTo)}
                      </p>
                      <p className="text-xs text-slate-500">Technician</p>
                    </div>
                  </>) : (<span className="text-sm text-slate-500 italic">
                    Unassigned
                  </span>)}
              </div>)}
          </div>

          {/* Reporter Info */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Reporter
            </h3>
            <div className="flex items-center mb-3">
              <img src={getUserAvatar(ticket.userId)} className="w-8 h-8 rounded-full mr-3" alt=""/>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {getUserName(ticket.userId)}
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <Mail className="w-4 h-4 mr-2 text-slate-400"/>
              <a href={`mailto:${ticket.contactDetails}`} className="hover:text-primary-600">
                {ticket.contactDetails}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Resolve Modal */}
      <Modal isOpen={isResolveModalOpen} onClose={() => setIsResolveModalOpen(false)} title="Resolve Ticket">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Please provide details on how this issue was resolved. These notes
            will be visible to the reporter.
          </p>
          <textarea value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} placeholder="e.g., Replaced projector bulb and tested functionality..." rows={4} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"/>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setIsResolveModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
              Cancel
            </button>
            <button onClick={handleResolve} disabled={!resolutionNotes.trim()} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
              Mark as Resolved
            </button>
          </div>
        </div>
      </Modal>
    </div>);
}
