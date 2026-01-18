import { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Search, Filter, Trophy, Star, Calendar, Users } from 'lucide-react';
import { api } from '../utils/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Achievements = () => {
  const [filters, setFilters] = useState({
    category: '',
    year: '',
    domain: '',
    search: ''
  });

  const { data, isLoading } = useQuery(
    ['achievements', filters],
    () => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.year) params.append('year', filters.year);
      if (filters.domain) params.append('domain', filters.domain);
      return api.get(`/achievements?${params.toString()}`).then(res => res.data);
    }
  );

  const achievements = data?.achievements || [];

  const filteredAchievements = achievements.filter(achievement =>
    achievement.title.toLowerCase().includes(filters.search.toLowerCase()) ||
    achievement.description.toLowerCase().includes(filters.search.toLowerCase())
  );

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
              Our <span className="text-gradient">Achievements</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Celebrating our members' outstanding accomplishments in competitions, hackathons,
              research initiatives, and innovation challenges.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="card-glow mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <option value="hackathon">Hackathons</option>
                <option value="competition">Competitions</option>
                <option value="research">Research</option>
                <option value="certification">Certifications</option>
              </select>
              <select
                className="select-field"
                value={filters.year}
                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
              >
                <option value="">All Years</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
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
              <button className="btn-outline flex items-center justify-center space-x-2">
                <Filter size={18} />
                <span>More Filters</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Achievements Grid */}
      <section className="section-padding">
        <div className="container-max">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card-glow group hover:scale-105 transition-all duration-300"
                >
                  {achievement.images && achievement.images.length > 0 && (
                    <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                      <img
                        src={achievement.images[0].url}
                        alt={achievement.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Category Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${achievement.category === 'hackathon' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                        achievement.category === 'competition' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          achievement.category === 'research' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }`}>
                        {achievement.category}
                      </span>
                      <span className="text-xs text-gray-500 code-font">
                        {new Date(achievement.date).getFullYear()}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors duration-300 mb-2">
                        {achievement.title}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {achievement.description}
                      </p>
                    </div>

                    {/* Domain Badge */}
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                        {achievement.domain}
                      </span>
                    </div>

                    {/* Team Members */}
                    {achievement.team && achievement.team.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Users size={14} />
                          <span>Team Members:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {achievement.team.map((member, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
                              {member}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prize/Recognition */}
                    {achievement.prize && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Trophy size={14} className="text-yellow-400" />
                        <span className="text-yellow-400 font-medium">{achievement.prize}</span>
                      </div>
                    )}

                    {/* Date */}
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      <span>{new Date(achievement.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {filteredAchievements.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy size={32} className="text-gray-600" />
              </div>
              <p className="text-gray-400 text-lg">No achievements found.</p>
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
                <Star size={48} className="text-cyan-400 mx-auto mb-6" />
                <h2 className="text-4xl font-bold text-white mb-6">
                  Ready to Make Your <span className="text-gradient">Mark</span>?
                </h2>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  Join MIBCS and be part of our next achievement story. Whether it's competitions,
                  research, or innovation challenges, we'll support your journey to excellence.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="/contact" className="btn-primary">
                    Join Our Team
                  </a>
                  <a href="/events" className="btn-outline">
                    View Upcoming Events
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

export default Achievements;