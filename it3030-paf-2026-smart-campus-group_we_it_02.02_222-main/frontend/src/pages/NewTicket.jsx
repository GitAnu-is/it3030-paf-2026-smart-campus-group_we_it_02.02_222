import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { getResources, createTicket } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ArrowLeft, Upload, X, } from 'lucide-react';
export function NewTicket() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedResourceId = searchParams.get('resourceId');
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Form State
    const [resourceId, setResourceId] = useState(preselectedResourceId || '');
    const [category, setCategory] = useState('OTHER');
    const [priority, setPriority] = useState('LOW');
    const [description, setDescription] = useState('');
    const [contactDetails, setContactDetails] = useState(user?.email || '');
    const [images, setImages] = useState([]);
    useEffect(() => {
        const fetchResources = async () => {
            try {
                const data = await getResources();
                setResources(data);
            }
            catch (error) {
                console.error('Failed to fetch resources', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchResources();
    }, []);
    const handleImageUpload = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length === 0)
            return;
        const remainingSlots = 3 - images.length;
        if (remainingSlots <= 0) {
            e.target.value = '';
            return;
        }
        const filesToRead = selectedFiles
            .filter((file) => file.type?.startsWith('image/'))
            .slice(0, remainingSlots);
        if (filesToRead.length === 0) {
            e.target.value = '';
            return;
        }
        Promise.all(filesToRead.map((file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
            reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
            reader.readAsDataURL(file);
        })))
            .then((uploadedImages) => {
            const validImages = uploadedImages.filter(Boolean);
            if (validImages.length > 0) {
                setImages((currentImages) => [...currentImages, ...validImages].slice(0, 3));
            }
        })
            .catch((error) => {
            console.error('Failed to read attachment image', error);
        })
            .finally(() => {
            e.target.value = '';
        });
    };
    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || !resourceId || !description || !contactDetails)
            return;
        setIsSubmitting(true);
        try {
            await createTicket({
                resourceId,
                userId: user.id,
                category,
                priority,
                description,
                contactDetails,
                images,
            });
            navigate('/tickets');
        }
        catch (error) {
            console.error('Failed to create ticket', error);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (isLoading)
        return <LoadingSpinner fullPage/>;
    return (<div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5"/>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Report an Issue
            </h1>
            <p className="text-slate-500 mt-1">
              Create a new maintenance ticket.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          {/* Resource & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Resource / Location <span className="text-red-500">*</span>
              </label>
              <select required value={resourceId} onChange={(e) => setResourceId(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option value="">Select a resource...</option>
                {resources.map((r) => (<option key={r.id} value={r.id}>
                    {r.name} ({r.location})
                  </option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Issue Category <span className="text-red-500">*</span>
              </label>
              <select required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option value="ELECTRICAL">Electrical</option>
                <option value="PLUMBING">Plumbing</option>
                <option value="IT_NETWORK">IT / Network</option>
                <option value="FURNITURE">Furniture / Fixtures</option>
                <option value="HVAC">HVAC (Heating/Cooling)</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Please describe the issue in detail..." rows={4} className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"/>
          </div>

          {/* Priority & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Priority Level
              </label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option value="LOW">
                  Low - Not urgent, minor inconvenience
                </option>
                <option value="MEDIUM">
                  Medium - Affects usability but workarounds exist
                </option>
                <option value="HIGH">High - Resource is unusable</option>
                <option value="CRITICAL">
                  Critical - Safety hazard or major disruption
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input type="email" required value={contactDetails} onChange={(e) => setContactDetails(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"/>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Attachments (Optional, max 3)
            </label>

            <div className="flex flex-wrap gap-4 mt-2">
              {images.map((img, index) => (<div key={index} className="relative w-24 h-24 rounded-lg border border-slate-200 overflow-hidden group">
                  <img src={img} alt={`Attachment ${index + 1}`} className="w-full h-full object-cover"/>
                  <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3"/>
                  </button>
                </div>))}

              {images.length < 3 && (<label className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-primary-400 hover:text-primary-500 cursor-pointer transition-colors">
                  <Upload className="w-6 h-6 mb-1"/>
                  <span className="text-xs font-medium">Upload</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload}/>
                </label>)}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center transition-colors shadow-sm">
            {isSubmitting ? (<LoadingSpinner size="sm" className="text-white mr-2"/>) : null}
            Submit Ticket
          </button>
        </div>
      </form>
    </div>);
}
