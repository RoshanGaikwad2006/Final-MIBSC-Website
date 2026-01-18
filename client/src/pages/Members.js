import { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Search, Github, Linkedin, Globe, Users, Code } from 'lucide-react';
import { api } from '../utils/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Members = () => {
  const [filters, setFilters] = useState({
    team: '',
    domain: '',
    search: ''
  });

  const { data, isLoading } = useQuery(
    ['members', filters],
    () => {
      const params = new URLSearchParams();
      if (filters.team) params.append('team', filters.team);
      if (filters.domain) params.append('domain', filters.domain);
      return api.get(`/members?${params.toString()}`).then(res => res.data);
    }
  );

  // Mock members for demo
  const mockMembers = [
    {
      _id: '1',
      name: 'Sarah Johnson',
      role: 'President',
      team: 'leadership',
      bio: 'Passionate about AI and machine learning. Leading MIBCS towards innovation and excellence.',
      domains: ['Machine Learning', 'Leadership'],
      image: { url: '/api/placeholder/150/150' },
      social: {
        github: 'https://github.com/sarah-johnson',
        linkedin: 'https://linkedin.com/in/sarah-johnson',
        portfolio: 'https://sarah-johnson.dev'
      }
    },
    {
      _id: '2',
      name: 'Mike Chen',
      role: 'Technical Lead',
      team: 'core',
      bio: 'Full-stack developer with expertise in blockchain and cybersecurity.',
      domains: ['Blockchain', 'Cyber Security'],
      image: { url: '/api/placeholder/150/150' },
      social: {
        github: 'https://github.com/mike-chen',
        linkedin: 'https://linkedin.com/in/mike-chen'
      }
    },
    {
      _id: '3',
      name: 'Emma Wilson',
      role: 'IoT Specialist',
      team: 'core',
      bio: 'Hardware enthusiast working on innovative IoT solutions and embedded systems.',
      domains: ['Internet of Things', 'Hardware'],
      image: { url: '/api/placeholder/150/150' },
      social: {
        github: 'https://github.com/emma-wilson',
        portfolio: 'https://emma-wilson.tech'
      }
    }
  ];

  const teamTypes = [
    { id: 'leadership', name: 'Leadership Team', description: 'Guiding the vision and strategy of MIBCS' },
    { id: 'core', name: 'Core Team', description: 'Experienced members driving key initiatives' },
    { id: 'members', name: 'Active Members', description: 'Passionate students contributing to our mission' }
  ];

  const members = data?.members || mockMembers;

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(filters.search.toLowerCase()) ||
    member.role.toLowerCase().includes(filters.search.toLowerCase())
  );

  const groupedMembers = teamTypes.reduce((acc, teamType) => {
    acc[teamType.id] = filteredMembers.filter(member => member.team === teamType.id);
    return acc;
  }, {});

  return (
    <div className="page-container bg-gray-950">
      {/* Hero Section */}
      <section className="relative section-padding overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
          <div className="matrix-bg opacity-10"></div>
        </div>

        <div className="container-max relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Our <span className="text-gradient">Team</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Meet the passionate individuals who drive innovation and excellence at MIBCS. 
              Together, we're shaping the future of technology.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="card-glow mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search members..."
                  className="input-field pl-10"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <select
                className="select-field"
                value={filters.team}
                onChange={(e) => setFilters(prev => ({ ...prev, team: e.target.value }))}
              >
                <option value="">All Teams</option>
                <option value="leadership">Leadership Team</option>
                <option value="core">Core Team</option>
                <option value="members">Active Members</option>
              </select>
              <select
                className="select-field"
                value={filters.domain}
                onChange={(e) => setFilters(prev => ({ ...prev, domain: e.target.value }))}
              >
                <option value="">All Domains</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="Internet of Things">Internet of Things</option>
                <option value="Blockchain">Blockchain</option>
                <option value="Cyber Security">Cyber Security</option>
              </select>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Members Grid */}
      <section className="section-padding">
        <div className="container-max">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="space-y-16">
              {teamTypes.map((teamType) => {
                const teamMembers = groupedMembers[teamType.id];
                if (!teamMembers || teamMembers.length === 0) return null;

                return (
                  <motion.div
                    key={teamType.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <div className="text-center mb-12">
                      <h2 className="text-4xl font-bold text-white mb-4">{teamType.name}</h2>
                      <p className="text-gray-400 text-lg">{teamType.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {teamMembers.map((member, index) => (
                        <motion.div
                          key={member._id}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          viewport={{ once: true }}
                          className="card-glow text-center group team-member-card"
                        >
                          <div className="relative w-32 h-32 mx-auto mb-6 flex-shrink-0">
                            <div className="w-full h-full rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700 group-hover:border-cyan-500 transition-colors duration-300">
                              {member.image?.url ? (
                                <img
                                  src={member.image.url}
                                  alt={member.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                                  {member.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                              <Code size={16} className="text-white" />
                            </div>
                          </div>

                          <div className="flex-grow-content">
                            <div className="member-name-container">
                              <h3 className="text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors duration-300">
                                {member.name}
                              </h3>
                            </div>
                            <p className="text-cyan-400 font-medium mb-4 flex-shrink-0">{member.role}</p>
                            
                            {member.bio && (
                              <div className="bio-container mb-4">
                                <p className="text-gray-400 text-sm leading-relaxed line-clamp-4">
                                  {member.bio}
                                </p>
                              </div>
                            )}

                            <div className="domain-tags-container mb-6">
                              {member.domains && member.domains.length > 0 && (
                                <>
                                  {member.domains.slice(0, 3).map((domain) => (
                                    <span
                                      key={domain}
                                      className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full border border-gray-700 whitespace-nowrap"
                                    >
                                      {domain}
                                    </span>
                                  ))}
                                  {member.domains.length > 3 && (
                                    <span className="px-3 py-1 domain-overflow-indicator text-gray-400 text-xs rounded-full border border-gray-600">
                                      +{member.domains.length - 3}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>

                            {member.social && (
                              <div className="flex justify-center space-x-2 pt-4 border-t border-gray-800 mt-auto flex-shrink-0">
                                {member.social.github && (
                                  <a
                                    href={member.social.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 social-link-hover"
                                  >
                                    <Github size={20} />
                                  </a>
                                )}
                                {member.social.linkedin && (
                                  <a
                                    href={member.social.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 social-link-hover"
                                  >
                                    <Linkedin size={20} />
                                  </a>
                                )}
                                {member.social.portfolio && (
                                  <a
                                    href={member.social.portfolio}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 social-link-hover"
                                  >
                                    <Globe size={20} />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {filteredMembers.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-gray-600" />
              </div>
              <p className="text-gray-400 text-lg">No members found.</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search criteria.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gray-900/50">
        <div className="container-max text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-3xl blur opacity-30"></div>
              <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl p-12 border border-gray-800">
                <Users size={48} className="text-cyan-400 mx-auto mb-6" />
                <h2 className="text-4xl font-bold text-white mb-6">
                  Want to <span className="text-gradient">Join</span> Our Team?
                </h2>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  We're always looking for passionate individuals who want to make a difference 
                  in the world of technology. Join us and be part of something amazing.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="/contact" className="btn-primary">
                    Apply Now
                  </a>
                  <a href="/about" className="btn-outline">
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Members;