import React, { useEffect, useState } from 'react'
import { Edit2, Trash2, Plus, AlertCircle } from 'lucide-react'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Modal } from '../components/Modal'
import { StatusBadge } from '../components/StatusBadge'
import {
  getResources,
  createResource,
  updateResource,
  deleteResource,
} from '../lib/api'

const RESOURCE_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT']
const RESOURCE_STATUSES = ['ACTIVE', 'OUT_OF_SERVICE']

export function ManageResources() {
  const [resources, setResources] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'LECTURE_HALL',
    capacity: '',
    location: '',
    status: 'ACTIVE',
    description: '',
    availabilityWindows: '',
  })

  // Fetch resources on mount
  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getResources()
      setResources(data || [])
    } catch (err) {
      console.error('Error fetching resources:', err)
      setError('Failed to load resources. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (resource = null) => {
    if (resource) {
      setEditingId(resource.id)
      setFormData({
        name: resource.name || '',
        type: resource.type || 'LECTURE_HALL',
        capacity: resource.capacity || '',
        location: resource.location || '',
        status: resource.status || 'ACTIVE',
        description: resource.description || '',
        availabilityWindows: Array.isArray(resource.availabilityWindows)
          ? resource.availabilityWindows.join(', ')
          : resource.availabilityWindows || '',
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        type: 'LECTURE_HALL',
        capacity: '',
        location: '',
        status: 'ACTIVE',
        description: '',
        availabilityWindows: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const submitData = {
        ...formData,
        capacity: parseInt(formData.capacity, 10),
        availabilityWindows: formData.availabilityWindows
          .split(',')
          .map((w) => w.trim())
          .filter((w) => w.length > 0),
      }

      if (editingId) {
        await updateResource(editingId, submitData)
      } else {
        await createResource(submitData)
      }

      await fetchResources()
      handleCloseModal()
    } catch (err) {
      console.error('Error saving resource:', err)
      setError('Failed to save resource. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    setIsSubmitting(true)
    setError(null)

    try {
      await deleteResource(id)
      await fetchResources()
      setShowDeleteConfirm(null)
    } catch (err) {
      console.error('Error deleting resource:', err)
      setError('Failed to delete resource. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner fullPage />
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Resources</h1>
          <p className="text-slate-500 mt-1">
            Add, edit, and manage campus resources
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-primary-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Resources Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {resources.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No resources found. Create your first resource to get started.
                  </td>
                </tr>
              ) : (
                resources.map((resource) => (
                  <tr
                    key={resource.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900">
                        {resource.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {resource.type
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {resource.capacity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {resource.location}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={resource.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(resource)}
                          className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(resource.id)}
                          className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Resource' : 'Add Resource'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Resource Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Physics Lab A"
            />
          </div>

          {/* Type and Capacity Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {RESOURCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Capacity
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., 50"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Building A, Floor 3"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {RESOURCE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Laboratory equipped with computers and microscopes..."
            />
          </div>

          {/* Availability Windows */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Availability Windows
            </label>
            <textarea
              name="availabilityWindows"
              value={formData.availabilityWindows}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter availability windows separated by commas&#10;e.g., Monday 08:00-12:00, Monday 14:00-18:00, Tuesday 08:00-12:00"
            />
            <p className="text-xs text-slate-500 mt-1.5">
              Separate multiple time windows with commas
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting
                ? 'Saving...'
                : editingId
                  ? 'Update Resource'
                  : 'Create Resource'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm !== null}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete Resource"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to delete this resource? This action cannot be
            undone.
          </p>
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(showDeleteConfirm)}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
