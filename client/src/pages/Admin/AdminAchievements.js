import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Search, Filter, Edit, Trash2, Eye, Star, Calendar, Award, MapPin, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { api } from '../../utils/api';
import { DOMAINS } from '../../utils/constants';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import AchievementForm from '../../components/Admin/AchievementForm';

const AdminAchievements = () => {
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    year: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['admin-achievements', filters],
    () => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.year) params.append('year', filters.year);
      return api.get(`/achievements?${params.toString()}&limit=50`).then(res => res.data);
    }
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/achievements/${id}`),
    {
      onSuccess: () => {
        toast.success('Achievement deleted successfully');
        queryClient.invalidateQueries('admin-achievements');
        setShowDeleteConfirm(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete achievement');
      }
    }
  );

  const filteredAchievements = data?.achievements?.filter(achievement =>
    achievement.title.toLowerCase().includes(filters.search.toLowerCase())
  ) || [];

  const handleAdd = () => {
    setSelectedAchievement(null);
    setShowForm(true);
  };

  const handleEdit = (achievement) => {
    setSelectedAchievement(achievement);
    setShowForm(true);
  };

  const handleDelete = (achievement) => {
    setShowDeleteConfirm(achievement);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      deleteMutation.mutate(showDeleteConfirm._id);
    }
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries('admin-achievements');
  };

  const handleView = () => {
    window.open(`/achievements`, '_blank');
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
            Achievements <span className="text-gradient">Management</span>
          </h1>
          <p className="text-gray-400 code-font">Manage club awards and recognitions</p>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center group"
        >
          <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-200" />
          Add Achievement
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
                placeholder="Search achievements..."
                className="input-field pl-10"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <select
              className="select-field"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">All Categories</option>
              <option value="hackathon">Hackathon</option>
              <option value="competition">Competition</option>
              <option value="research">Research</option>
              <option value="recognition">Recognition</option>
            </select>
            <select
              className="select-field"
              value={filters.year}
              onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
            >
              <option value="">All Years</option>
              {data?.years?.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800/30 border border-gray-700/30 rounded-lg">
              <span className="text-sm text-gray-400 code-font">Total Achievements:</span>
              <span className="font-bold text-cyan-400 code-font">{filteredAchievements.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400 code-font">Loading achievements...</p>
            </div>
          </div>
        ) : filteredAchievements.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-2xl blur opacity-30"></div>
              <div className="relative card-glow p-12">
                <Trophy size={64} className="mx-auto text-gray-600 mb-6" />
                <h3 className="text-xl font-bold text-white mb-2 code-font">No achievements found</h3>
                <p className="text-gray-400 mb-6 code-font">Add your first achievement to showcase excellence</p>
                <button
                  onClick={handleAdd}
                  className="btn-primary group"
                >
                  <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-200" />
                  Add Achievement
                </button>
              </div>
            </div>
          </div>
        ) : (
          filteredAchievements.map((achievement) => (
            <div key={achievement._id} className="group relative">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-purple-600/20 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>

              <div className="relative card-glow hover:border-cyan-500/50 transition-all duration-300 overflow-hidden flex flex-col h-full">
                {/* Image */}
                <div className="relative h-48 bg-gray-800 shrink-0">
                  {achievement.images?.[0]?.url ? (
                    <img
                      src={achievement.images[0].url}
                      alt={achievement.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <Award size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                  {achievement.featured && (
                    <div className="absolute top-3 right-3 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center">
                      <Star size={12} className="mr-1" />
                      FEATURED
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-3 py-1 rounded-full text-xs font-medium capitalize">
                    {achievement.category}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="font-bold text-white text-lg mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors duration-300 code-font">
                      {achievement.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-400">
                      <span>{achievement.position}</span>
                      {achievement.year && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span>{achievement.year}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-sm text-gray-400">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-2 text-gray-500" />
                      <span className="code-font">{format(new Date(achievement.date), 'MMM dd, yyyy')}</span>
                    </div>
                    {achievement.event?.name && (
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-2 text-gray-500" />
                        <span className="truncate code-font">{achievement.event.name}</span>
                      </div>
                    )}
                    {achievement.domains && achievement.domains.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {achievement.domains.slice(0, 3).map((d, i) => (
                          <span key={i} className="text-xs text-blue-400/80 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{d}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-300 mb-4 line-clamp-2 flex-1">
                    {achievement.description}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700/50 mt-auto">
                    <div className="flex space-x-2">
                      {/* Placeholder for future links */}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(achievement)}
                        className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors border border-transparent hover:border-cyan-500/30"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(achievement)}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-500/30"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(achievement)}
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
        <AchievementForm
          achievement={selectedAchievement}
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
              <h3 className="text-xl font-bold text-white mb-4 code-font">Delete Achievement</h3>
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
                  {deleteMutation.isLoading ? 'Deleting...' : 'Delete Achievement'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAchievements;