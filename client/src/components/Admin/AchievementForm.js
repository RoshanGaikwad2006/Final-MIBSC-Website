import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Calendar, Link, Check, Award, MapPin, User, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../utils/api';
import { DOMAINS } from '../../utils/constants';
import LoadingSpinner from '../UI/LoadingSpinner';

const ACHIEVEMENT_CATEGORIES = [
    { id: 'hackathon', name: 'Hackathon' },
    { id: 'competition', name: 'Competition' },
    { id: 'research', name: 'Research' },
    { id: 'recognition', name: 'Recognition' },
    { id: 'certification', name: 'Certification' },
    { id: 'other', name: 'Other' }
];

const AchievementForm = ({ achievement, onClose, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(achievement?.images?.[0]?.url || '');
    const [selectedFile, setSelectedFile] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        defaultValues: {
            title: achievement?.title || '',
            description: achievement?.description || '',
            category: achievement?.category || 'hackathon',
            date: achievement?.date ? new Date(achievement.date).toISOString().split('T')[0] : '',
            year: achievement?.year || new Date().getFullYear(),
            position: achievement?.position || '',
            eventName: achievement?.event?.name || '',
            eventOrganizer: achievement?.event?.organizer || '',
            eventLocation: achievement?.event?.location || '',
            teamMembers: achievement?.teamMembers?.join(', ') || '',
            tags: achievement?.tags?.join(', ') || '',
            domains: achievement?.domains || [],
            featured: achievement?.featured || false
        }
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const formData = new FormData();

            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('category', data.category);
            formData.append('date', data.date);
            formData.append('year', data.year);
            formData.append('position', data.position);

            // Event Details
            formData.append('eventName', data.eventName);
            formData.append('eventOrganizer', data.eventOrganizer);
            formData.append('eventLocation', data.eventLocation);

            // Arrays
            formData.append('teamMembers', data.teamMembers);
            formData.append('tags', data.tags);

            if (Array.isArray(data.domains)) {
                data.domains.forEach(domain => {
                    if (domain) formData.append('domains', domain);
                });
            }

            formData.append('featured', data.featured);

            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            // Do not set Content-Type manually for FormData
            // const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            let response;

            if (achievement) {
                response = await api.put(`/achievements/${achievement._id}`, formData);
                toast.success('Achievement updated successfully!');
            } else {
                response = await api.post('/achievements', formData);
                toast.success('Achievement created successfully!');
            }

            onSuccess(response?.data);
            onClose();
        } catch (error) {
            console.error('Error saving achievement:', error);
            const msg = error.response?.data?.message || (error.response?.data?.errors ? error.response.data.errors.map(e => e.msg).join(', ') : 'Failed to save achievement');
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-white code-font">
                        {achievement ? 'Edit Achievement' : 'Add New Achievement'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2 code-font">Title *</label>
                            <input {...register('title', { required: 'Title is required' })} className="input-field" placeholder="e.g. 1st Place at Smart India Hackathon" />
                            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 code-font">Category *</label>
                            <select {...register('category')} className="select-field">
                                {ACHIEVEMENT_CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 code-font">Position / Rank</label>
                            <select {...register('position')} className="select-field">
                                <option value="">Select Position</option>
                                <option value="1st">1st Place / Winner</option>
                                <option value="2nd">2nd Place / Runner-up</option>
                                <option value="3rd">3rd Place</option>
                                <option value="Finalist">Finalist</option>
                                <option value="Participant">Participant</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 code-font">
                                <Calendar size={16} className="inline mr-1 text-cyan-400" /> Date *
                            </label>
                            <input {...register('date', { required: 'Date is required' })} type="date" className="input-field" />
                            {errors.date && <p className="text-red-400 text-sm mt-1">{errors.date.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 code-font">Year *</label>
                            <input {...register('year', { required: 'Year is required' })} type="number" className="input-field" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-cyan-400 mb-3 uppercase tracking-wider code-font">Event Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1 code-font">Event Name</label>
                                <input {...register('eventName')} className="input-field text-sm" placeholder="e.g. SIH 2024" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1 code-font">Organizer</label>
                                <input {...register('eventOrganizer')} className="input-field text-sm" placeholder="e.g. Govt of India" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1 code-font">Location</label>
                                <input {...register('eventLocation')} className="input-field text-sm" placeholder="e.g. New Delhi" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 code-font">Description *</label>
                        <textarea {...register('description', { required: 'Description is required' })} rows={4} className="input-field" placeholder="Describe the achievement" />
                        {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 code-font">Team Members (comma-separated)</label>
                            <input {...register('teamMembers')} className="input-field" placeholder="Name 1, Name 2..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 code-font">Tags (comma-separated)</label>
                            <input {...register('tags')} className="input-field" placeholder="AI, Competition, Winner" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 code-font">Domains</label>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {DOMAINS.map(domain => (
                                <label key={domain.id} className="flex items-center space-x-2 cursor-pointer group">
                                    <input {...register('domains')} type="checkbox" value={domain.id} className="rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-gray-900" />
                                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{domain.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 code-font">Achievement Image</label>
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 bg-gray-800/30">
                            {imagePreview ? (
                                <div className="relative">
                                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                                    <button type="button" onClick={() => { setImagePreview(''); setSelectedFile(null); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"><X size={16} /></button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-400 mb-2">Upload achievement image</p>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="ach-img-upload" />
                                    <label htmlFor="ach-img-upload" className="btn-outline cursor-pointer">Choose File</label>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                        <input {...register('featured')} type="checkbox" className="rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-gray-900" />
                        <label className="flex items-center text-sm font-medium text-gray-300 code-font"><Star size={16} className="mr-1 text-yellow-400" /> Featured Achievement (Show on homepage)</label>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? (<><LoadingSpinner size="sm" className="mr-2" /> {achievement ? 'Updating...' : 'Creating...'}</>) : (achievement ? 'Update Achievement' : 'Create Achievement')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AchievementForm;
