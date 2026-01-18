import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Calendar, Link, Check, Github, Globe, FileText, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../utils/api';
import { DOMAINS } from '../../utils/constants';
import LoadingSpinner from '../UI/LoadingSpinner';

const ProjectForm = ({ project, onClose, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(project?.images?.[0]?.url || '');
    const [selectedFile, setSelectedFile] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        defaultValues: {
            title: project?.title || '',
            description: project?.description || '',
            shortDescription: project?.shortDescription || '',
            startDate: project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
            endDate: project?.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
            status: project?.status || 'planning',
            difficulty: project?.difficulty || 'Intermediate',
            techStack: project?.techStack?.join(', ') || '',
            tags: project?.tags?.join(', ') || '',
            domains: project?.domains || [],
            githubLink: project?.links?.github || '',
            demoLink: project?.links?.demo || '',
            docLink: project?.links?.documentation || '',
            featured: project?.featured || false
        }
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const formData = new FormData();

            // Basic Fields
            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('shortDescription', data.shortDescription);
            formData.append('startDate', data.startDate);
            if (data.endDate) formData.append('endDate', data.endDate);
            formData.append('status', data.status);
            formData.append('difficulty', data.difficulty);

            // Arrays
            formData.append('techStack', data.techStack);
            formData.append('tags', data.tags);

            // Domains
            if (Array.isArray(data.domains)) {
                data.domains.forEach(domain => {
                    if (domain) formData.append('domains', domain);
                });
            }

            // Links (Send individually to be handled by backend or mapped)
            if (data.githubLink) formData.append('githubLink', data.githubLink);
            if (data.demoLink) formData.append('demoLink', data.demoLink);
            if (data.docLink) formData.append('docLink', data.docLink);

            formData.append('featured', data.featured);

            // File
            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            // Do not set Content-Type manually for FormData, let the browser/axios handle it with the boundary
            // const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            let response;

            if (project) {
                response = await api.put(`/projects/${project._id}`, formData);
                toast.success('Project updated successfully!');
            } else {
                response = await api.post('/projects', formData);
                toast.success('Project created successfully!');
            }

            onSuccess(response?.data);
            onClose();
        } catch (error) {
            console.error('Error saving project:', error);
            const msg = error.response?.data?.message || (error.response?.data?.errors ? error.response.data.errors.map(e => e.msg).join(', ') : 'Failed to save project');
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
                        {project ? 'Edit Project' : 'Add New Project'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2 code-font">Project Title *</label>
                            <input {...register('title', { required: 'Title is required' })} className="input-field" placeholder="Enter project title" />
                            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 code-font">Status</label>
                            <select {...register('status')} className="select-field">
                                <option value="planning">Planning</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                                <option value="paused">Paused</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 code-font">Difficulty</label>
                            <select {...register('difficulty')} className="select-field">
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 code-font">
                                <Calendar size={16} className="inline mr-1 text-cyan-400" /> Start Date *
                            </label>
                            <input {...register('startDate', { required: 'Start date is required' })} type="date" className="input-field" />
                            {errors.startDate && <p className="text-red-400 text-sm mt-1">{errors.startDate.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 code-font">
                                <Calendar size={16} className="inline mr-1 text-cyan-400" /> End Date (Optional)
                            </label>
                            <input {...register('endDate')} type="date" className="input-field" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 code-font">Description *</label>
                        <textarea {...register('description', { required: 'Description is required' })} rows={4} className="input-field" placeholder="Full project description" />
                        {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 code-font">Short Description</label>
                        <textarea {...register('shortDescription', { maxLength: 200 })} rows={2} className="input-field" placeholder="Brief summary (max 200 chars)" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 code-font">Tech Stack (comma-separated)</label>
                            <input {...register('techStack')} className="input-field" placeholder="React, Node.js, MongoDB" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 code-font">Tags (comma-separated)</label>
                            <input {...register('tags')} className="input-field" placeholder="AI, Web, Mobile" />
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 code-font"><Github size={16} className="inline mr-1 text-cyan-400" /> GitHub Link</label>
                            <input {...register('githubLink')} className="input-field" placeholder="https://github.com/..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 code-font"><Globe size={16} className="inline mr-1 text-cyan-400" /> Demo Link</label>
                            <input {...register('demoLink')} className="input-field" placeholder="https://..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 code-font"><FileText size={16} className="inline mr-1 text-cyan-400" /> Docs Link</label>
                            <input {...register('docLink')} className="input-field" placeholder="https://..." />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 code-font">Project Image</label>
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 bg-gray-800/30">
                            {imagePreview ? (
                                <div className="relative">
                                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                                    <button type="button" onClick={() => { setImagePreview(''); setSelectedFile(null); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"><X size={16} /></button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-400 mb-2">Upload project image</p>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="proj-img-upload" />
                                    <label htmlFor="proj-img-upload" className="btn-outline cursor-pointer">Choose File</label>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                        <input {...register('featured')} type="checkbox" className="rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-gray-900" />
                        <label className="flex items-center text-sm font-medium text-gray-300 code-font"><Star size={16} className="mr-1 text-yellow-400" /> Featured Project (Show on homepage)</label>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? (<><LoadingSpinner size="sm" className="mr-2" /> {project ? 'Updating...' : 'Creating...'}</>) : (project ? 'Update Project' : 'Create Project')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectForm;
