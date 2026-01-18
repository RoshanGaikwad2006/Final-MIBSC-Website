import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Calendar, Clock, MapPin, Users, Link, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../utils/api';
import { EVENT_TYPES, DOMAINS } from '../../utils/constants';
import LoadingSpinner from '../UI/LoadingSpinner';

const EventForm = ({ event, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(event?.images?.[0]?.url || '');
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      shortDescription: event?.shortDescription || '',
      date: event?.date ? new Date(event.date).toISOString().split('T')[0] : '',
      endDate: event?.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
      time: event?.time || '',
      venue: event?.venue || '',
      type: event?.type || 'workshop',
      status: event?.status || 'upcoming',
      registrationLink: event?.registrationLink || '',
      maxParticipants: event?.maxParticipants || '',
      domains: event?.domains || [],
      organizers: event?.organizers?.join(', ') || '',
      featured: event?.featured || false,
      tags: event?.tags?.join(', ') || ''
    }
  });

  const watchedDomains = watch('domains');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const formData = new FormData();

      // Append basic fields
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('shortDescription', data.shortDescription);
      formData.append('date', data.date);
      if (data.endDate) formData.append('endDate', data.endDate);
      formData.append('time', data.time);
      formData.append('venue', data.venue);
      formData.append('type', data.type);
      formData.append('status', data.status);
      if (data.registrationLink) formData.append('registrationLink', data.registrationLink);
      if (data.maxParticipants) formData.append('maxParticipants', data.maxParticipants);
      formData.append('featured', data.featured);

      // Handle Arrays (send as comma-separated or repeating fields)
      // Sending as comma-separated strings since backend handles splitting
      formData.append('organizers', data.organizers);
      formData.append('tags', data.tags);

      // Domains (checkboxes return array)
      if (Array.isArray(data.domains)) {
        data.domains.forEach(domain => {
          if (domain) formData.append('domains', domain);
        });
      }

      // Append File
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      let response;
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (event) {
        // Update existing event
        response = await api.put(`/events/${event._id}`, formData, config);
        toast.success('Event updated successfully!');
      } else {
        // Create new event
        response = await api.post('/events', formData, config);
        toast.success('Event created successfully!');
      }

      onSuccess(response.data);
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(error.response?.data?.message || 'Failed to save event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {event ? 'Edit Event' : 'Add New Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Title */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <input
                {...register('title', { required: 'Event title is required' })}
                className="input-field"
                placeholder="Enter event title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type *
              </label>
              <select {...register('type')} className="input-field">
                {EVENT_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select {...register('status')} className="input-field">
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Start Date *
              </label>
              <input
                {...register('date', { required: 'Start date is required' })}
                type="date"
                className="input-field"
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                End Date (Optional)
              </label>
              <input
                {...register('endDate')}
                type="date"
                className="input-field"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} className="inline mr-1" />
                Time *
              </label>
              <input
                {...register('time', { required: 'Time is required' })}
                type="time"
                className="input-field"
              />
              {errors.time && (
                <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
              )}
            </div>

            {/* Venue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-1" />
                Venue *
              </label>
              <input
                {...register('venue', { required: 'Venue is required' })}
                className="input-field"
                placeholder="Event venue"
              />
              {errors.venue && (
                <p className="text-red-500 text-sm mt-1">{errors.venue.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className="input-field"
              placeholder="Detailed event description"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Description (Max 200 characters)
            </label>
            <textarea
              {...register('shortDescription', {
                maxLength: { value: 200, message: 'Short description must be less than 200 characters' }
              })}
              rows={2}
              className="input-field"
              placeholder="Brief description for cards and previews"
            />
            {errors.shortDescription && (
              <p className="text-red-500 text-sm mt-1">{errors.shortDescription.message}</p>
            )}
          </div>

          {/* Registration and Capacity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Registration Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Link size={16} className="inline mr-1" />
                Registration Link (Google Form)
              </label>
              <input
                {...register('registrationLink', {
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'Please enter a valid URL'
                  }
                })}
                className="input-field"
                placeholder="https://forms.google.com/..."
              />
              {errors.registrationLink && (
                <p className="text-red-500 text-sm mt-1">{errors.registrationLink.message}</p>
              )}
            </div>

            {/* Max Participants */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users size={16} className="inline mr-1" />
                Max Participants
              </label>
              <input
                {...register('maxParticipants', {
                  min: { value: 1, message: 'Must be at least 1' }
                })}
                type="number"
                className="input-field"
                placeholder="Leave empty for unlimited"
              />
              {errors.maxParticipants && (
                <p className="text-red-500 text-sm mt-1">{errors.maxParticipants.message}</p>
              )}
            </div>
          </div>

          {/* Domains */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Domains
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {DOMAINS.map(domain => (
                <label key={domain.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    {...register('domains')}
                    type="checkbox"
                    value={domain.id}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{domain.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Organizers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organizers (comma-separated)
            </label>
            <input
              {...register('organizers')}
              className="input-field"
              placeholder="John Doe, Jane Smith, Tech Team"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              {...register('tags')}
              className="input-field"
              placeholder="AI, Workshop, Beginner"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setSelectedFile(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Upload event image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="btn-outline cursor-pointer"
                  >
                    Choose File
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Featured Event */}
          <div className="flex items-center space-x-3">
            <input
              {...register('featured')}
              type="checkbox"
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Star size={16} className="mr-1 text-yellow-500" />
              Featured Event (Show on homepage)
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {event ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                event ? 'Update Event' : 'Create Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
