import { useState } from 'react';
import { useQuery } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar, Clock, MapPin, Users, ExternalLink, Play, Zap, ChevronDown, X } from 'lucide-react';
import { api } from '../utils/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Events = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [filters, setFilters] = useState({
    type: '',
    domain: '',
    search: '',
    location: '',
    speaker: ''
  });
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const { data, isLoading } = useQuery(
    ['events', activeTab, filters],
    () => {
      const params = new URLSearchParams();
      params.append('status', activeTab);
      if (filters.type) params.append('type', filters.type);
      if (filters.domain) params.append('domain', filters.domain);
      return api.get(`/events?${params.toString()}`).then(res => res.data);
    }
  );

  const events = data?.events || [];
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      event.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesLocation = !filters.location || event.location.includes(filters.location);
    const matchesSpeaker = !filters.speaker || event.speaker.toLowerCase().includes(filters.speaker.toLowerCase());

    return matchesSearch && matchesLocation && matchesSpeaker;
  });

  const tabs = [
    { id: 'ongoing', name: 'Ongoing', icon: Play, count: filteredEvents.filter(e => e.status === 'ongoing').length },
    { id: 'upcoming', name: 'Upcoming', icon: Calendar, count: filteredEvents.filter(e => e.status === 'upcoming').length },
    { id: 'completed', name: 'Past Events', icon: Clock, count: filteredEvents.filter(e => e.status === 'completed').length }
  ];

  const getEventTypeColor = (type) => {
    const colors = {
      'workshop': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'seminar': 'bg-green-500/20 text-green-400 border-green-500/30',
      'hackathon': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'networking': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const handleRegisterClick = async (event) => {
    if (event.registrationLink) {
      try {
        // Track the registration click
        await api.post(`/events/${event._id}/register-click`);
        // Open registration link
        window.open(event.registrationLink, '_blank');
      } catch (error) {
        console.error('Failed to track registration click:', error);
        // Still open the link even if tracking fails
        window.open(event.registrationLink, '_blank');
      }
    }
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
              Tech <span className="text-gradient">Events</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Join us for exciting workshops, hackathons, and seminars designed to enhance your technical skills
              and connect with fellow innovators.
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-1 border border-gray-700">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-700/50'
                      }`}
                  >
                    <Icon size={18} />
                    <span>{tab.name}</span>
                    {tab.count > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-600'
                        }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="card-glow mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="input-field pl-10"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <select
                className="select-field"
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="">All Types</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="hackathon">Hackathon</option>
                <option value="networking">Networking</option>
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
              <button
                className="btn-outline flex items-center space-x-2"
                onClick={() => setShowMoreFilters(!showMoreFilters)}
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
            </div>

            {/* More Filters Dropdown */}
            <AnimatePresence>
              {showMoreFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t border-gray-700"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                      <select
                        className="select-field"
                        value={filters.location}
                        onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      >
                        <option value="">All Locations</option>
                        <option value="Tech Lab A">Tech Lab A</option>
                        <option value="Innovation Hub">Innovation Hub</option>
                        <option value="Auditorium B">Auditorium B</option>
                        <option value="Online">Online</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Speaker</label>
                      <input
                        type="text"
                        placeholder="Search by speaker..."
                        className="input-field"
                        value={filters.speaker}
                        onChange={(e) => setFilters(prev => ({ ...prev, speaker: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => setFilters({
                          type: '',
                          domain: '',
                          search: '',
                          location: '',
                          speaker: ''
                        })}
                        className="btn-secondary flex items-center space-x-2 w-full"
                      >
                        <X size={16} />
                        <span>Clear All</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="section-padding">
        <div className="container-max">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.filter(event => event.status === activeTab).map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative h-full"
                >
                  {/* Terminal Window Glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-blue-600/30 to-purple-600/30 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
                  
                  {/* Terminal Window - Fixed Height */}
                  <div className="relative bg-black/90 backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden hover:border-cyan-500/50 transition-all duration-500 will-change-transform group-hover:scale-[1.02] h-full flex flex-col">
                    
                    {/* Terminal Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-900/95 border-b border-gray-700 flex-shrink-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="text-gray-400 text-xs code-font">event_{event._id.slice(-6)}.sh</div>
                      <div className="flex items-center space-x-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getEventTypeColor(event.type)}`}>
                          {event.type}
                        </span>
                      </div>
                    </div>

                    {/* Event Image with Terminal Overlay - Fixed Height */}
                    <div className="relative h-48 bg-gray-800 overflow-hidden flex-shrink-0">
                      {event.images?.[0]?.url ? (
                        <>
                          <img
                            src={event.images[0].url}
                            alt={event.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                          
                          {/* Terminal Command Overlay */}
                          <div className="absolute bottom-3 left-3 right-3">
                            <div className="bg-black/70 backdrop-blur-sm rounded px-3 py-2 border border-gray-600">
                              <div className="text-green-400 code-font text-xs flex items-center">
                                <span className="text-gray-500">$ </span>
                                <motion.span
                                  initial={{ width: 0 }}
                                  whileInView={{ width: 'auto' }}
                                  transition={{ duration: 1, delay: index * 0.2 }}
                                  className="overflow-hidden whitespace-nowrap"
                                >
                                  cat {event.title.toLowerCase().replace(/\s+/g, '_')}.md
                                </motion.span>
                                <motion.span
                                  animate={{ opacity: [1, 0, 1] }}
                                  transition={{ duration: 0.8, repeat: Infinity }}
                                  className="bg-green-400 w-2 h-3 inline-block ml-1"
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                          <div className="text-center">
                            <Calendar size={48} className="text-gray-600 mx-auto mb-2" />
                            <div className="text-gray-500 code-font text-sm">No image available</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Terminal Content - Flexible Height */}
                    <div className="p-6 code-font flex-1 flex flex-col">
                      {/* Event Status & Date */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-cyan-400 text-xs">[{event.status.toUpperCase()}]</span>
                          <span className="text-green-400 text-xs">●</span>
                          <span className="text-green-400 text-xs">ACTIVE</span>
                        </div>
                        <span className="text-gray-400 text-xs">
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Title with Terminal Styling */}
                      <div className="mb-4">
                        <div className="text-gray-500 text-xs mb-1"># Event Title:</div>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors duration-300 line-clamp-2 min-h-[3.5rem]">
                          {event.title}
                        </h3>
                      </div>

                      {/* Description */}
                      <div className="mb-4 flex-1">
                        <div className="text-gray-500 text-xs mb-1"># Description:</div>
                        <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
                          {event.shortDescription || event.description}
                        </p>
                      </div>

                      {/* Event Details in Terminal Style */}
                      <div className="space-y-2 mb-4 bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                        <div className="flex items-center text-xs">
                          <Clock size={12} className="mr-2 text-cyan-400" />
                          <span className="text-gray-400">Time:</span>
                          <span className="text-white ml-2">{event.time}</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <MapPin size={12} className="mr-2 text-cyan-400" />
                          <span className="text-gray-400">Venue:</span>
                          <span className="text-white ml-2 truncate">{event.venue}</span>
                        </div>
                        {event.maxParticipants && (
                          <div className="flex items-center text-xs">
                            <Users size={12} className="mr-2 text-cyan-400" />
                            <span className="text-gray-400">Capacity:</span>
                            <span className="text-white ml-2">
                              {event.currentParticipants || 0}/{event.maxParticipants}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Domain Tags */}
                      {event.domains && event.domains.length > 0 && (
                        <div className="mb-4">
                          <div className="text-gray-500 text-xs mb-2"># Domains:</div>
                          <div className="flex flex-wrap gap-2">
                            {event.domains.slice(0, 2).map(domain => (
                              <span key={domain} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded border border-cyan-500/30">
                                {domain}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Organizers */}
                      {event.organizers && event.organizers.length > 0 && (
                        <div className="mb-4">
                          <div className="text-gray-500 text-xs mb-1"># Organizers:</div>
                          <div className="text-gray-300 text-xs">
                            {event.organizers.join(', ')}
                          </div>
                        </div>
                      )}

                      {/* Registration Progress Bar */}
                      {event.maxParticipants && (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-2">
                            <span className="text-gray-400">Registration Progress</span>
                            <span className="text-cyan-400">
                              {Math.round(((event.currentParticipants || 0) / event.maxParticipants) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-2 border border-gray-700">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: `${((event.currentParticipants || 0) / event.maxParticipants) * 100}%` }}
                              transition={{ duration: 1, delay: index * 0.2 }}
                              className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                            </motion.div>
                          </div>
                        </div>
                      )}

                      {/* Terminal Command Button - Fixed at Bottom */}
                      <div className="mt-auto">
                        {event.status === 'upcoming' ? (
                          event.registrationLink ? (
                            <motion.button
                              onClick={() => handleRegisterClick(event)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500 rounded-lg p-3 text-cyan-400 hover:bg-cyan-500/30 transition-all duration-300 group/btn relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                              <div className="relative flex items-center justify-center space-x-2">
                                <ExternalLink size={14} />
                                <span className="font-medium">./register_now.sh</span>
                                <motion.div
                                  animate={{ x: [0, 3, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                  <Play size={14} />
                                </motion.div>
                              </div>
                            </motion.button>
                          ) : (
                            <button className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-3 text-yellow-400 hover:text-yellow-300 hover:border-yellow-500/50 transition-all duration-300 cursor-not-allowed">
                              <div className="flex items-center justify-center space-x-2">
                                <Clock size={14} />
                                <span>registration_opening_soon</span>
                              </div>
                            </button>
                          )
                        ) : event.status === 'ongoing' ? (
                           event.registrationLink ? (
                            <motion.button
                              onClick={() => handleRegisterClick(event)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500 rounded-lg p-3 text-green-400 hover:bg-green-500/30 transition-all duration-300 group/btn relative overflow-hidden"
                            >
                              <div className="relative flex items-center justify-center space-x-2">
                                <Zap size={14} />
                                <span className="font-medium">./join_now.sh</span>
                              </div>
                            </motion.button>
                           ) : (
                            <button className="w-full bg-gray-800/50 border border-green-600 rounded-lg p-3 text-green-400 hover:text-green-300 hover:border-green-500/50 transition-all duration-300 cursor-not-allowed">
                              <div className="flex items-center justify-center space-x-2">
                                <Zap size={14} />
                                <span>happening_now</span>
                              </div>
                            </button>
                           )
                        ) : event.status === 'completed' ? (
                          <button className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-3 text-gray-400 hover:text-white hover:border-gray-500 transition-all duration-300">
                            <div className="flex items-center justify-center space-x-2">
                              <Play size={14} />
                              <span>cat recording.mp4</span>
                            </div>
                          </button>
                        ) : (
                          <button className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-3 text-gray-500 cursor-not-allowed" disabled>
                            <div className="flex items-center justify-center space-x-2">
                              <Calendar size={14} />
                              <span>registration_closed</span>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
              }
            </div>
          )}

          {filteredEvents.filter(event => event.status === activeTab).length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} className="text-gray-600" />
              </div>
              <p className="text-gray-400 text-lg">No {activeTab} events found.</p>
              <p className="text-gray-500 text-sm mt-2">Check back soon for new events!</p>
            </motion.div>
          )}
        </div>
      </section >

      {/* CTA Section */}
      < section className="section-padding bg-gray-900/50" >
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
                <Zap size={48} className="text-cyan-400 mx-auto mb-6" />
                <h2 className="text-4xl font-bold text-white mb-6">
                  Want to <span className="text-gradient">Host</span> an Event?
                </h2>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  Have an idea for a workshop, seminar, or hackathon? We'd love to help you organize
                  and promote your event to our community of tech enthusiasts.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="/contact" className="btn-primary">
                    Propose an Event
                  </a>
                  <a href="/about" className="btn-outline">
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section >
    </div >
  );
};

export default Events;