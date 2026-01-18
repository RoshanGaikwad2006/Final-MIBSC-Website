import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Search, Filter, Edit, Trash2, Eye, Star, Calendar, Code, ExternalLink, Github, Globe, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { api } from '../../utils/api';
import { DOMAINS } from '../../utils/constants';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ProjectForm from '../../components/Admin/ProjectForm';

const AdminProjects = () => {
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    domain: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['admin-projects', filters],
    () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.domain) params.append('domain', filters.domain);
      return api.get(`/projects?${params.toString()}&limit=50`).then(res => res.data);
    }
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/projects/${id}`),
    {
      onSuccess: () => {
        toast.success('Project deleted successfully');
        queryClient.invalidateQueries('admin-projects');
        setShowDeleteConfirm(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete project');
      }
    }
  );

  const filteredProjects = data?.projects?.filter(project =>
    project.title.toLowerCase().includes(filters.search.toLowerCase())
  ) || [];

  const handleAdd = () => {
    setSelectedProject(null);
    setShowForm(true);
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    setShowForm(true);
  };

  const handleDelete = (project) => {
    setShowDeleteConfirm(project);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      deleteMutation.mutate(showDeleteConfirm._id);
    }
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries('admin-projects');
  };

  const handleView = (project) => {
    window.open(`/projects`, '_blank'); // For now redirect to main projects page as dynamic detail page is not requested yet
  };

  return (
    <div className="space-y-4 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-white code-font">
            Projects <span className="text-gradient">Management</span>
          </h1>
          <p className="text-gray-400 code-font">Manage club projects and portfolio</p>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center group"
        >
          <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-200" />
          Add Project
        </button>
      </div>

      {/* Filters */}
      <div className="relative z-10">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-purple-600/20 rounded-2xl blur opacity-30"></div>
        <div className="relative card-glow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                className="input-field pl-10"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <select
              className="select-field"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="planning">Planning</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </select>
            <select
              className="select-field"
              value={filters.domain}
              onChange={(e) => setFilters(prev => ({ ...prev, domain: e.target.value }))}
            >
              <option value="">All Domains</option>
              {DOMAINS.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800/30 border border-gray-700/30 rounded-lg">
              <span className="text-sm text-gray-400 code-font">Total Projects:</span>
              <span className="font-bold text-cyan-400 code-font">{filteredProjects ? filteredProjects.length : 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400 code-font">Loading projects...</p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-2xl blur opacity-30"></div>
              <div className="relative card-glow p-12">
                <Code size={64} className="mx-auto text-gray-600 mb-6" />
                <h3 className="text-xl font-bold text-white mb-2 code-font">No projects found</h3>
                <p className="text-gray-400 mb-6 code-font">Create your first project to get started</p>
                <button
                  onClick={handleAdd}
                  className="btn-primary group"
                >
                  <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-200" />
                  Add Project
                </button>
              </div>
            </div>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div key={project._id} className="group relative">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-purple-600/20 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>

              <div className="relative card-glow hover:border-cyan-500/50 transition-all duration-300 overflow-hidden flex flex-col h-full">
                {/* Image */}
                <div className="relative h-48 bg-gray-800 shrink-0">
                  {project.images?.[0]?.url ? (
                    <img
                      src={project.images[0].url}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <Code size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                  {project.featured && (
                    <div className="absolute top-3 right-3 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center">
                      <Star size={12} className="mr-1" />
                      FEATURED
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1">
                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="font-bold text-white text-lg mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors duration-300 code-font">
                      {project.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${project.status === 'ongoing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        project.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          project.status === 'planning' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                        {project.status}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        {project.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-sm text-gray-400">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-2 text-gray-500" />
                      <span className="code-font">{format(new Date(project.startDate), 'MMM yyyy')}</span>
                    </div>
                    {project.domains && project.domains.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.domains.slice(0, 3).map((d, i) => (
                          <span key={i} className="text-xs text-cyan-500/80 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">{d}</span>
                        ))}
                        {project.domains.length > 3 && <span className="text-xs text-gray-500 py-0.5">+{project.domains.length - 3}</span>}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-300 mb-4 line-clamp-2 flex-1">
                    {project.shortDescription || project.description}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700/50 mt-auto">
                    <div className="flex space-x-3">
                      {project.links?.github && (
                        <a href={project.links.github} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors">
                          <Github size={18} />
                        </a>
                      )}
                      {project.links?.demo && (
                        <a href={project.links.demo} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-cyan-400 transition-colors">
                          <Globe size={18} />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(project)}
                        className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors border border-transparent hover:border-cyan-500/30"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-500/30"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(project)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <ProjectForm
          project={selectedProject}
          onClose={() => setShowForm(false)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="relative max-w-md w-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/30 to-pink-500/30 rounded-2xl blur opacity-75"></div>
            <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-xl font-bold text-white mb-4 code-font">Delete Project</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete "<span className="text-cyan-400 font-medium">{showDeleteConfirm.title}</span>"?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="btn-outline"
                  disabled={deleteMutation.isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium code-font"
                  disabled={deleteMutation.isLoading}
                >
                  {deleteMutation.isLoading ? 'Deleting...' : 'Delete Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjects;