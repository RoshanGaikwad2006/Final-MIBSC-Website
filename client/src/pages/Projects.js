import { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Search, Filter, Github, ExternalLink, Code, Cpu, Shield, Wifi, Database, Calendar, Users, ChevronDown } from 'lucide-react';
import { api } from '../utils/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Projects = () => {
  const [filters, setFilters] = useState({
    status: '',
    domain: '',
    search: ''
  });
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const { data, isLoading } = useQuery(
    ['projects', filters],
    () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.domain) params.append('domain', filters.domain);
      return api.get(`/projects?${params.toString()}`).then(res => res.data);
    }
  );

  const projects = data?.projects || [];

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
    project.description.toLowerCase().includes(filters.search.toLowerCase())
  );

  const getDomainIcon = (domain) => {
    const icons = {
      'Machine Learning': Cpu,
      'Internet of Things': Wifi,
      'Blockchain': Database,
      'Cyber Security': Shield
    };
    return icons[domain] || Code;
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-500/20 text-green-400 border-green-500/30',
      'ongoing': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'planning': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'paused': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

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
              Our <span className="text-gradient">Projects</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Discover the innovative projects our members are building across Machine Learning,
              IoT, Blockchain, and Cybersecurity domains.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="card-glow mb-12"
          >
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
                <option value="completed">Completed</option>
                <option value="ongoing">Ongoing</option>
                <option value="planning">Planning</option>
                <option value="paused">Paused</option>
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
              <div className="relative">
                <button
                  onClick={() => setShowMoreFilters(!showMoreFilters)}
                  className="btn-outline flex items-center space-x-2"
                >
                  <Filter size={18} />
                  <span>More Filters</span>
                  <motion.div
                    animate={{ rotate: showMoreFilters ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} />
                  </motion.div>
                </button>

                {showMoreFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 p-4"
                  >
                    <h3 className="text-white font-medium mb-3">Advanced Filters</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Team Size</label>
                        <select className="select-field text-sm">
                          <option value="">Any Size</option>
                          <option value="small">1-3 members</option>
                          <option value="medium">4-6 members</option>
                          <option value="large">7+ members</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Year</label>
                        <select className="select-field text-sm">
                          <option value="">Any Year</option>
                          <option value="2024">2024</option>
                          <option value="2023">2023</option>
                          <option value="2022">2022</option>
                        </select>
                      </div>
                      <button
                        onClick={() => setShowMoreFilters(false)}
                        className="w-full btn-primary text-sm py-2"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="section-padding">
        <div className="container-max">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card-glow group hover:scale-105 transition-all duration-300"
                >
                  <div className="space-y-6">
                    {/* Image */}
                    {project.images && project.images.length > 0 && (
                      <div className="relative h-48 rounded-lg overflow-hidden">
                        <img
                          src={project.images[0].url}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                      </div>
                    )}

                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors duration-300">
                        {project.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 leading-relaxed">
                      {project.shortDescription || project.description}
                    </p>

                    {/* Domains */}
                    {project.domains && project.domains.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.domains.map((domain) => {
                          const Icon = getDomainIcon(domain);
                          return (
                            <span
                              key={domain}
                              className="flex items-center space-x-1 px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30"
                            >
                              <Icon size={12} />
                              <span>{domain}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Tech Stack */}
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.slice(0, 4).map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.techStack.length > 4 && (
                          <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700">
                            +{project.techStack.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Project Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        {project.teamSize && (
                          <div className="flex items-center space-x-1">
                            <Users size={14} />
                            <span>{project.teamSize} members</span>
                          </div>
                        )}
                        {project.startDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>{new Date(project.startDate).getFullYear()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3 pt-4 border-t border-gray-800">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                        >
                          <Github size={16} />
                          <span className="text-sm">Code</span>
                        </a>
                      )}
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                        >
                          <ExternalLink size={16} />
                          <span className="text-sm">Demo</span>
                        </a>
                      )}
                      <button className="flex items-center space-x-2 text-gray-400 hover:text-cyan-400 transition-colors duration-200 ml-auto">
                        <span className="text-sm">Learn More</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {filteredProjects.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-gray-600" />
              </div>
              <p className="text-gray-400 text-lg">No projects found matching your criteria.</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters.</p>
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
                <Code size={48} className="text-cyan-400 mx-auto mb-6" />
                <h2 className="text-4xl font-bold text-white mb-6">
                  Have a <span className="text-gradient">Project Idea</span>?
                </h2>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  Join MIBCS and turn your innovative ideas into reality. Collaborate with like-minded
                  developers and build the next generation of tech solutions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="/contact" className="btn-primary">
                    Join Our Team
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

export default Projects;