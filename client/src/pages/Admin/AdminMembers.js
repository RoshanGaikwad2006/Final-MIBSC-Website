import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Save,
  X,
  Crown,
  Code,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Mail,
  Award,
  Eye,
  EyeOff,
  Terminal,
  Shield
} from 'lucide-react';
import { api } from '../../utils/api';

const AdminMembers = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [imagePreview, setImagePreview] = useState('');
  
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    team: '',
    domains: [],
    bio: '',
    image: null,
    social: {
      linkedin: '',
      github: '',
      twitter: '',
      portfolio: ''
    },
    skills: [],
    graduationYear: new Date().getFullYear(),
    isActive: true,
    position: 0
  });

  // Team and role configurations
  const teamConfig = {
    'Super Senior': { 
      icon: Crown, 
      color: 'text-yellow-400', 
      bgColor: 'bg-yellow-500/10', 
      borderColor: 'border-yellow-500/30',
      roles: ['President', 'Vice President']
    },
    'Senior Committee': { 
      icon: Code, 
      color: 'text-cyan-400', 
      bgColor: 'bg-cyan-500/10', 
      borderColor: 'border-cyan-500/30',
      roles: [] // Custom role input
    },
    'Core Committee': { 
      icon: Users, 
      color: 'text-purple-400', 
      bgColor: 'bg-purple-500/10', 
      borderColor: 'border-purple-500/30',
      roles: ['Core Member'] // No role needed, default to Core Member
    }
  };

  const domainOptions = ['ML', 'IoT', 'Blockchain', 'Cybersecurity', 'General'];

  // Fetch members
  const { data: membersData, isLoading, error } = useQuery(
    ['admin-members', searchTerm, filterTeam, filterActive],
    async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterTeam) params.append('team', filterTeam);
      if (filterActive !== 'all') params.append('active', filterActive);
      
      const response = await api.get(`/members?${params.toString()}`);
      return response.data;
    },
    {
      staleTime: 30000,
    }
  );

  // Create member mutation
  const createMemberMutation = useMutation(
    async (memberData) => {
      const formData = new FormData();
      
      // Append all fields to FormData
      Object.keys(memberData).forEach(key => {
        if (key === 'social') {
          formData.append('social', JSON.stringify(memberData.social));
        } else if (key === 'domains' || key === 'skills') {
          formData.append(key, JSON.stringify(memberData[key]));
        } else if (key === 'image' && memberData.image) {
          formData.append('image', memberData.image);
        } else if (key !== 'image') {
          formData.append(key, memberData[key]);
        }
      });

      const response = await api.post('/members', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-members']);
        resetForm();
        setShowForm(false);
      },
    }
  );

  // Update member mutation
  const updateMemberMutation = useMutation(
    async ({ id, memberData }) => {
      const formData = new FormData();
      
      Object.keys(memberData).forEach(key => {
        if (key === 'social') {
          formData.append('social', JSON.stringify(memberData.social));
        } else if (key === 'domains' || key === 'skills') {
          formData.append(key, JSON.stringify(memberData[key]));
        } else if (key === 'image' && memberData.image) {
          formData.append('image', memberData.image);
        } else if (key !== 'image') {
          formData.append(key, memberData[key]);
        }
      });

      const response = await api.put(`/members/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-members']);
        resetForm();
        setShowForm(false);
        setEditingMember(null);
      },
    }
  );

  // Delete member mutation
  const deleteMemberMutation = useMutation(
    async (id) => {
      await api.delete(`/members/${id}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-members']);
      },
    }
  );

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
      team: '',
      domains: [],
      bio: '',
      image: null,
      social: {
        linkedin: '',
        github: '',
        twitter: '',
        portfolio: ''
      },
      skills: [],
      graduationYear: new Date().getFullYear(),
      isActive: true,
      position: 0
    });
    setImagePreview('');
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      email: member.email || '',
      role: member.role || '',
      team: member.team || '',
      domains: member.domains || [],
      bio: member.bio || '',
      image: null,
      social: {
        linkedin: member.social?.linkedin || '',
        github: member.social?.github || '',
        twitter: member.social?.twitter || '',
        portfolio: member.social?.portfolio || ''
      },
      skills: member.skills || [],
      graduationYear: member.graduationYear || new Date().getFullYear(),
      isActive: member.isActive !== undefined ? member.isActive : true,
      position: member.position || 0
    });
    setImagePreview(member.image?.url || '');
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingMember) {
      updateMemberMutation.mutate({ id: editingMember._id, memberData: formData });
    } else {
      createMemberMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      deleteMemberMutation.mutate(id);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDomainToggle = (domain) => {
    setFormData(prev => ({
      ...prev,
      domains: prev.domains.includes(domain)
        ? prev.domains.filter(d => d !== domain)
        : [...prev.domains, domain]
    }));
  };

  const members = membersData?.members || [];

  if (error) {
    return (
      <div className="glass-effect border border-red-500/30 rounded-xl p-8 text-center">
        <div className="text-red-400 mb-2 flex items-center justify-center">
          <X className="mr-2" size={20} />
          Error loading members
        </div>
        <div className="text-red-300 text-sm">{error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 opacity-50"></div>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-500/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="glass-effect border border-gray-700/50 rounded-xl p-6 relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-purple-600/20 rounded-2xl blur opacity-30"></div>
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3 code-font">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
                  <Users className="text-cyan-400" size={20} />
                </div>
                Team Members Management
              </h1>
              <p className="text-gray-400 mt-2 code-font flex items-center">
                <Terminal size={14} className="mr-2" />
                Manage club members, roles, and team assignments
              </p>
            </div>
            
            <button
              onClick={() => {
                resetForm();
                setEditingMember(null);
                setShowForm(true);
              }}
              className="group relative bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 text-cyan-400 px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 border border-cyan-500/30 hover:border-cyan-500/50 code-font"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative flex items-center gap-2">
                <Plus size={20} />
                Add Member
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-effect border border-gray-700/50 rounded-xl p-6 relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-gray-800/20 via-gray-700/20 to-gray-800/20 rounded-2xl blur opacity-30"></div>
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-400 code-font transition-all duration-300"
              />
            </div>

            {/* Team Filter */}
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="w-full px-3 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white code-font transition-all duration-300"
            >
              <option value="">All Teams</option>
              {Object.keys(teamConfig).map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
              {/* Legacy team options for existing members */}
              <option value="Core">Core (Legacy)</option>
              <option value="Technical">Technical (Legacy)</option>
              <option value="Management">Management (Legacy)</option>
              <option value="Design">Design (Legacy)</option>
              <option value="Alumni">Alumni (Legacy)</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="w-full px-3 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white code-font transition-all duration-300"
            >
              <option value="all">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            {/* Stats */}
            <div className="flex items-center justify-center px-4 py-3 bg-gray-800/30 border border-gray-600/30 rounded-lg">
              <div className="text-sm text-gray-400 code-font flex items-center">
                <Shield size={16} className="mr-2 text-cyan-400" />
                Total: <span className="text-cyan-400 ml-1">{members.length}</span> members
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        <AnimatePresence>
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="glass-effect border border-gray-700/50 rounded-xl p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-700/50 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700/50 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700/50 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-700/50 rounded"></div>
                  <div className="h-3 bg-gray-700/50 rounded w-3/4"></div>
                </div>
              </div>
            ))
          ) : (
            members.map((member) => {
              // Handle both new and legacy team configurations
              const isLegacyTeam = !teamConfig[member.team];
              const TeamIcon = teamConfig[member.team]?.icon || Users;
              const teamColor = teamConfig[member.team]?.color || 'text-gray-400';
              const teamBg = teamConfig[member.team]?.bgColor || 'bg-gray-500/10';
              const teamBorder = teamConfig[member.team]?.borderColor || 'border-gray-500/30';

              return (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`group relative glass-effect border-2 ${teamBorder} rounded-xl p-6 hover:border-opacity-70 transition-all duration-300`}
                >
                  {/* Card Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-purple-600/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  
                  <div className="relative">
                    {/* Member Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {member.image?.url ? (
                          <img
                            src={member.image.url}
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-600/50"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-full ${teamBg} border-2 ${teamBorder} flex items-center justify-center`}>
                            <TeamIcon className={teamColor} size={24} />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-white code-font">{member.name}</h3>
                          <p className="text-sm text-gray-400 code-font">{member.role}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {member.isActive ? (
                          <div className="flex items-center gap-1">
                            <Eye className="text-green-400" size={16} />
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <EyeOff className="text-gray-500" size={16} />
                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Team Badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${teamBg} ${teamBorder} border mb-3`}>
                      <TeamIcon className={teamColor} size={16} />
                      <span className={`text-sm font-medium ${teamColor} code-font`}>
                        {member.team}
                        {isLegacyTeam && <span className="text-xs text-gray-500 ml-1">(Legacy)</span>}
                      </span>
                    </div>

                    {/* Bio */}
                    {member.bio && (
                      <p className="text-sm text-gray-300 mb-3 line-clamp-2 code-font">{member.bio}</p>
                    )}

                    {/* Domains */}
                    {member.domains && member.domains.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {member.domains.slice(0, 3).map(domain => (
                          <span key={domain} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30 code-font">
                            {domain}
                          </span>
                        ))}
                        {member.domains.length > 3 && (
                          <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-full border border-gray-600/50 code-font">
                            +{member.domains.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Social Links */}
                    <div className="flex items-center gap-2 mb-4">
                      {member.social?.github && (
                        <a href={member.social.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white hover:bg-gray-700/50 p-2 rounded-full transition-all duration-200">
                          <Github size={16} />
                        </a>
                      )}
                      {member.social?.linkedin && (
                        <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 p-2 rounded-full transition-all duration-200">
                          <Linkedin size={16} />
                        </a>
                      )}
                      {member.social?.twitter && (
                        <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-400 hover:bg-sky-500/10 p-2 rounded-full transition-all duration-200">
                          <Twitter size={16} />
                        </a>
                      )}
                      {member.social?.portfolio && (
                        <a href={member.social.portfolio} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 p-2 rounded-full transition-all duration-200">
                          <Globe size={16} />
                        </a>
                      )}
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="text-gray-400 hover:text-green-400 hover:bg-green-500/10 p-2 rounded-full transition-all duration-200">
                          <Mail size={16} />
                        </a>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-700/50">
                      <button
                        onClick={() => handleEdit(member)}
                        className="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 border border-cyan-500/30 hover:border-cyan-500/50 code-font"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(member._id)}
                        className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 border border-red-500/30 hover:border-red-500/50 code-font"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {!isLoading && members.length === 0 && (
        <div className="glass-effect border border-gray-700/50 rounded-xl p-12 text-center relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-gray-800/20 via-gray-700/20 to-gray-800/20 rounded-2xl blur opacity-30"></div>
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
              <Users className="text-cyan-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 code-font">No members found</h3>
            <p className="text-gray-400 mb-4 code-font">
              {searchTerm || filterTeam || filterActive !== 'all' 
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by adding your first team member.'
              }
            </p>
            <button
              onClick={() => {
                resetForm();
                setEditingMember(null);
                setShowForm(true);
              }}
              className="group relative bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 text-cyan-400 px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-all duration-300 border border-cyan-500/30 hover:border-cyan-500/50 code-font"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative flex items-center gap-2">
                <Plus size={20} />
                Add First Member
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-effect border border-gray-700/50 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-purple-600/20 rounded-2xl blur opacity-50"></div>
              
              <div className="relative">
                <div className="p-6 border-b border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white code-font flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
                        <Terminal className="text-cyan-400" size={16} />
                      </div>
                      {editingMember ? 'Edit Member' : 'Add New Member'}
                    </h2>
                    <button
                      onClick={() => setShowForm(false)}
                      className="text-gray-400 hover:text-white hover:bg-gray-700/50 p-2 rounded-lg transition-all duration-200"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white code-font flex items-center gap-2">
                        <Shield size={18} className="text-cyan-400" />
                        Basic Information
                      </h3>
                      
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 code-font">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-400 code-font transition-all duration-300"
                          placeholder="Enter full name"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 code-font">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-400 code-font transition-all duration-300"
                          placeholder="Enter email address"
                        />
                      </div>

                      {/* Team */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 code-font">
                          Team *
                        </label>
                        <select
                          required
                          value={formData.team}
                          onChange={(e) => {
                            const selectedTeam = e.target.value;
                            setFormData(prev => ({ 
                              ...prev, 
                              team: selectedTeam, 
                              role: selectedTeam === 'Core Committee' ? 'Core Member' : '' 
                            }));
                          }}
                          className="w-full px-3 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white code-font transition-all duration-300"
                        >
                          <option value="">Select Team</option>
                          {Object.keys(teamConfig).map(team => (
                            <option key={team} value={team}>{team}</option>
                          ))}
                        </select>
                      </div>

                      {/* Role */}
                      {formData.team && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2 code-font">
                            {formData.team === 'Senior Committee' ? 'Role (Custom) *' : 'Role *'}
                          </label>
                          {formData.team === 'Senior Committee' ? (
                            // Custom role input for Senior Committee
                            <input
                              type="text"
                              required
                              value={formData.role}
                              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                              className="w-full px-3 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-400 code-font transition-all duration-300"
                              placeholder="Enter custom role (e.g., Technical Lead - AI, Project Manager, etc.)"
                            />
                          ) : formData.team === 'Core Committee' ? (
                            // Auto-set role for Core Committee
                            <div className="w-full px-3 py-3 bg-gray-700/30 border border-gray-600/30 rounded-lg text-gray-400 code-font">
                              Core Member (Auto-assigned)
                            </div>
                          ) : (
                            // Dropdown for Super Senior
                            <select
                              required
                              value={formData.role}
                              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                              className="w-full px-3 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white code-font transition-all duration-300"
                            >
                              <option value="">Select Role</option>
                              {teamConfig[formData.team]?.roles.map(role => (
                                <option key={role} value={role}>{role}</option>
                              ))}
                            </select>
                          )}
                          {formData.team === 'Senior Committee' && (
                            <p className="text-xs text-gray-400 mt-2 code-font">
                              Examples: Technical Lead - AI, Project Manager, UI/UX Designer, etc.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Graduation Year */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 code-font">
                          Graduation Year
                        </label>
                        <input
                          type="number"
                          min="2020"
                          max="2030"
                          value={formData.graduationYear}
                          onChange={(e) => setFormData(prev => ({ ...prev, graduationYear: parseInt(e.target.value) }))}
                          className="w-full px-3 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-400 code-font transition-all duration-300"
                        />
                      </div>

                      {/* Position */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 code-font">
                          Display Position
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.position}
                          onChange={(e) => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) }))}
                          className="w-full px-3 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-400 code-font transition-all duration-300"
                          placeholder="0 for highest priority"
                        />
                      </div>

                      {/* Status */}
                      <div>
                        <label className="flex items-center gap-3 p-3 bg-gray-800/30 border border-gray-600/30 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-all duration-200">
                          <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            className="rounded border-gray-600 text-cyan-500 focus:ring-cyan-500/50 bg-gray-800"
                          />
                          <span className="text-sm font-medium text-gray-300 code-font">Active Member</span>
                          <div className={`w-2 h-2 rounded-full ml-auto ${formData.isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
                        </label>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white code-font flex items-center gap-2">
                        <Award size={18} className="text-purple-400" />
                        Additional Information
                      </h3>
                      
                      {/* Profile Image */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 code-font">
                          Profile Image
                        </label>
                        <div className="flex items-center gap-4">
                          {imagePreview && (
                            <div className="relative">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-600/50"
                              />
                              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 rounded-full blur opacity-50"></div>
                            </div>
                          )}
                          <div className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="w-full px-3 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30 transition-all duration-300"
                            />
                            <p className="text-xs text-gray-400 mt-2 code-font">
                              Recommended: Square image, max 2MB
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 code-font">
                          Bio
                        </label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                          rows={3}
                          maxLength={500}
                          className="w-full px-3 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-400 code-font transition-all duration-300 resize-none"
                          placeholder="Brief description about the member..."
                        />
                        <p className="text-xs text-gray-400 mt-2 code-font">
                          {formData.bio.length}/500 characters
                        </p>
                      </div>

                      {/* Domains */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 code-font">
                          Domains of Interest
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {domainOptions.map(domain => (
                            <button
                              key={domain}
                              type="button"
                              onClick={() => handleDomainToggle(domain)}
                              className={`px-3 py-2 rounded-full text-sm transition-all duration-300 code-font ${
                                formData.domains.includes(domain)
                                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                  : 'bg-gray-800/50 text-gray-400 border border-gray-600/50 hover:bg-gray-700/50 hover:text-gray-300'
                              }`}
                            >
                              {domain}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Social Links */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 code-font">
                          Social Links
                        </label>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-800/50 border border-gray-600/50 rounded-lg flex items-center justify-center">
                              <Github size={20} className="text-gray-400" />
                            </div>
                            <input
                              type="url"
                              value={formData.social.github}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                social: { ...prev.social, github: e.target.value }
                              }))}
                              className="flex-1 px-3 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-400 code-font transition-all duration-300"
                              placeholder="GitHub profile URL"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-800/50 border border-gray-600/50 rounded-lg flex items-center justify-center">
                              <Linkedin size={20} className="text-gray-400" />
                            </div>
                            <input
                              type="url"
                              value={formData.social.linkedin}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                social: { ...prev.social, linkedin: e.target.value }
                              }))}
                              className="flex-1 px-3 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-400 code-font transition-all duration-300"
                              placeholder="LinkedIn profile URL"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-800/50 border border-gray-600/50 rounded-lg flex items-center justify-center">
                              <Twitter size={20} className="text-gray-400" />
                            </div>
                            <input
                              type="url"
                              value={formData.social.twitter}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                social: { ...prev.social, twitter: e.target.value }
                              }))}
                              className="flex-1 px-3 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-400 code-font transition-all duration-300"
                              placeholder="Twitter profile URL"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-800/50 border border-gray-600/50 rounded-lg flex items-center justify-center">
                              <Globe size={20} className="text-gray-400" />
                            </div>
                            <input
                              type="url"
                              value={formData.social.portfolio}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                social: { ...prev.social, portfolio: e.target.value }
                              }))}
                              className="flex-1 px-3 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-400 code-font transition-all duration-300"
                              placeholder="Portfolio/Website URL"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-700/50">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-6 py-3 text-gray-400 bg-gray-800/50 hover:bg-gray-700/50 hover:text-gray-300 rounded-lg transition-all duration-200 border border-gray-600/50 hover:border-gray-500/50 code-font"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createMemberMutation.isLoading || updateMemberMutation.isLoading}
                      className="group relative px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 text-cyan-400 rounded-lg flex items-center gap-2 transition-all duration-300 border border-cyan-500/30 hover:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed code-font"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-300"></div>
                      <div className="relative flex items-center gap-2">
                        <Save size={20} />
                        {createMemberMutation.isLoading || updateMemberMutation.isLoading
                          ? 'Saving...'
                          : editingMember
                          ? 'Update Member'
                          : 'Add Member'
                        }
                      </div>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminMembers;