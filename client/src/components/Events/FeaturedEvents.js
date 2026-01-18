import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, ExternalLink, Star, ArrowRight, Terminal, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { api } from '../../utils/api';
import { EVENT_TYPES } from '../../utils/constants';
import LoadingSpinner from '../UI/LoadingSpinner';

const FeaturedEvents = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data, isLoading } = useQuery(
    'featured-events',
    () => api.get('/events?featured=true&status=upcoming&limit=10').then(res => res.data),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const featuredEvents = data?.events || [];
  const itemsPerPage = 3;

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

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-900/30">
        <div className="container-max">
          <div className="flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </section>
    );
  }

  if (featuredEvents.length === 0) {
    return null;
  }

  const handleNext = () => {
    if (featuredEvents.length > itemsPerPage) {
      setCurrentIndex((prev) => (prev + 1) % featuredEvents.length);
    }
  };

  const handlePrev = () => {
    if (featuredEvents.length > itemsPerPage) {
      setCurrentIndex((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length);
    }
  };

  // Calculate visible items for carousel effect
  const getVisibleEvents = () => {
    if (featuredEvents.length === 0) return [];
    if (featuredEvents.length <= itemsPerPage) return featuredEvents;

    const visible = [];
    for (let i = 0; i < itemsPerPage; i++) {
      visible.push(featuredEvents[(currentIndex + i) % featuredEvents.length]);
    }
    return visible;
  };

  const visibleEvents = getVisibleEvents();

  // Determine grid layout based on number of items
  const getGridLayout = () => {
    const itemCount = Math.min(featuredEvents.length, itemsPerPage);
    if (itemCount === 1) return 'flex justify-center';
    if (itemCount === 2) return 'grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto';
    return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';
  };

  return (
    <section className="py-20 bg-gray-900/30 relative overflow-hidden">
      {/* Terminal Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
        <div className="terminal-grid-pattern w-full h-full opacity-5"></div>
        
        {/* Floating Code Snippets */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { text: 'npm run event', x: '10%', y: '20%', delay: 0 },
            { text: 'git commit -m "join event"', x: '85%', y: '30%', delay: 2 },
            { text: './register.sh --event=featured', x: '15%', y: '70%', delay: 4 },
          ].map((cmd, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 0.3, 0],
                scale: [0, 1, 0],
                y: [0, -20, -40]
              }}
              transition={{
                duration: 8,
                delay: cmd.delay,
                repeat: Infinity,
                repeatDelay: 15
              }}
              className="absolute code-font text-xs text-cyan-400/20 hidden lg:block"
              style={{ left: cmd.x, top: cmd.y }}
            >
              $ {cmd.text}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="container-max relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-4">
            <Star size={24} className="text-yellow-500 mr-2" />
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Featured <span className="text-gradient">Events</span>
            </h2>
          </div>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Don't miss these exciting upcoming events designed to enhance your technical skills 
            and connect you with fellow innovators.
          </p>
          
          {/* Navigation Arrows - Show only if more than 3 items */}
          {featuredEvents.length > itemsPerPage && (
            <div className="flex justify-center space-x-4 mt-8">
              <button
                onClick={handlePrev}
                className="p-3 rounded-full bg-gray-800/50 border border-gray-700 text-white hover:bg-cyan-500 hover:border-cyan-500 transition-all duration-300 group"
              >
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleNext}
                className="p-3 rounded-full bg-gray-800/50 border border-gray-700 text-white hover:bg-cyan-500 hover:border-cyan-500 transition-all duration-300 group"
              >
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Terminal-Style Events Grid with Dynamic Layout */}
        <div className={`mb-12 ${getGridLayout()}`}>
          <AnimatePresence mode='wait'>
            {visibleEvents.map((event, index) => {
              const eventType = EVENT_TYPES.find(type => type.id === event.type);
              const eventDate = new Date(event.date);
              const isUpcoming = eventDate > new Date();

              return (
              <motion.div
                key={`${event._id}-${currentIndex}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`group relative h-full ${featuredEvents.length === 1 ? 'max-w-md mx-auto' : ''}`}
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
                      <Star size={12} className="text-yellow-400" />
                      <span className="text-xs text-yellow-400 code-font">FEATURED</span>
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
                          <Terminal size={48} className="text-gray-600 mx-auto mb-2" />
                          <div className="text-gray-500 code-font text-sm">No image available</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Terminal Content - Flexible Height */}
                  <div className="p-6 code-font flex-1 flex flex-col">
                    {/* Event Type & Status */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-cyan-400 text-xs">[{eventType?.name || event.type}]</span>
                        <span className="text-green-400 text-xs">●</span>
                        <span className="text-green-400 text-xs">ACTIVE</span>
                      </div>
                      <span className="text-gray-400 text-xs">
                        {format(eventDate, 'MMM dd')}
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
                      {event.registrationLink && isUpcoming ? (
                        <motion.button
                          onClick={() => handleRegisterClick(event)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500 rounded-lg p-3 text-cyan-400 hover:bg-cyan-500/30 transition-all duration-300 group/btn relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                          <div className="relative flex items-center justify-center space-x-2">
                            <Play size={14} />
                            <span className="font-medium">./register_now.sh</span>
                            <motion.div
                              animate={{ x: [0, 3, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <ArrowRight size={14} />
                            </motion.div>
                          </div>
                        </motion.button>
                      ) : (
                        <Link
                          to={`/events`}
                          className="w-full block bg-gray-800/50 border border-gray-600 rounded-lg p-3 text-gray-400 hover:text-white hover:border-gray-500 transition-all duration-300 text-center"
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <Terminal size={14} />
                            <span>cat event_details.md</span>
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </div>

        {/* View All Events CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/events"
            className="inline-flex items-center btn-outline group"
          >
            <Calendar size={18} className="mr-2" />
            <span>View All Events</span>
            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedEvents;