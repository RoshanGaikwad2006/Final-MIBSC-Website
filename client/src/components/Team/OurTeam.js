import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Star, Github, Linkedin, Twitter, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../utils/api';
import LoadingSpinner from '../UI/LoadingSpinner';

const ImageFocusedMemberCard = ({ member, index, isLeadership = false, isSenior = false }) => {
  // Determine card height based on role hierarchy
  let cardHeight = 'h-80'; // Default for core committee
  if (isLeadership) {
    cardHeight = 'h-[28rem]'; // Largest for President/VP (448px)
  } else if (isSenior) {
    cardHeight = 'h-96'; // Medium for Senior Committee (384px)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`group relative ${cardHeight} overflow-hidden rounded-2xl`}
    >
      {/* Card Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
      
      {/* Main Image Container */}
      <div className="relative w-full h-full bg-gray-800 overflow-hidden rounded-2xl border border-gray-700 group-hover:border-cyan-500/50 transition-all duration-500">
        
        {/* Member Image - Full Background */}
        {member.image?.url ? (
          <img
            src={member.image.url}
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-center">
              <Users size={isLeadership ? 80 : 64} className="text-gray-600 mx-auto mb-4" />
              <div className="text-gray-500 code-font text-lg">No image available</div>
            </div>
          </div>
        )}

        {/* Always Visible Overlay - Name and Role */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center justify-between mb-2">
              {/* Role Icon */}
              <div className="flex items-center space-x-2">
                {member.role === 'President' && <Crown size={20} className="text-yellow-400" />}
                {member.role === 'Vice President' && <Star size={20} className="text-blue-400" />}
                {!['President', 'Vice President'].includes(member.role) && (
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                )}
              </div>
              
              {/* Team Badge */}
              <span className="px-3 py-1 text-xs font-bold text-black bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-lg">
                {member.role}
              </span>
            </div>
            
            {/* Name */}
            <h3 className="text-xl md:text-2xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors duration-300">
              {member.name}
            </h3>
            
            {/* Team */}
            <div className="text-cyan-400 text-sm font-medium">
              {member.team} Team
            </div>
          </div>
        </div>

        {/* Hover Overlay - Additional Details */}
        <div className="image-focused-hover-overlay absolute inset-0 bg-black/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 p-6">
          
          {/* Terminal Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-gray-400 text-xs code-font">member_{member._id?.slice(-6)}.profile</div>
          </div>

          {/* Member Details */}
          <div className="image-focused-hover-content code-font space-y-3">
            
            {/* Name and Role */}
            <div className="flex-shrink-0">
              <div className="text-gray-500 text-xs mb-1"># Identity:</div>
              <div className="text-white text-lg font-bold line-clamp-1">{member.name}</div>
              <div className="text-cyan-400 text-sm">{member.role} - {member.team} Team</div>
            </div>

            {/* Bio */}
            {member.bio && (
              <div>
                <div className="text-gray-500 text-xs mb-1"># Bio:</div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            )}

            {/* Domains */}
            {member.domains && member.domains.length > 0 && (
              <div className="flex-shrink-0">
                <div className="text-gray-500 text-xs mb-1"># Expertise:</div>
                <div className="flex flex-wrap gap-1">
                  {member.domains.slice(0, 4).map(domain => (
                    <span key={domain} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded border border-cyan-500/30 whitespace-nowrap">
                      {domain}
                    </span>
                  ))}
                  {member.domains.length > 4 && (
                    <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded border border-gray-600/50">
                      +{member.domains.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Join Date */}
            {member.joinDate && (
              <div className="flex-shrink-0">
                <div className="text-gray-500 text-xs mb-1"># Member Since:</div>
                <div className="text-gray-300 text-sm">
                  {new Date(member.joinDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="mt-4 pt-3 border-t border-gray-700 flex-shrink-0">
            <div className="text-gray-500 text-xs mb-2"># Connect:</div>
            <div className="flex justify-center space-x-3">
              {member.social?.github && (
                <a
                  href={member.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="team-social-link p-2 bg-gray-800/50 rounded-full text-gray-400 hover:text-white hover:bg-cyan-500/20 transition-colors"
                >
                  <Github size={16} />
                </a>
              )}
              {member.social?.linkedin && (
                <a
                  href={member.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="team-social-link p-2 bg-gray-800/50 rounded-full text-gray-400 hover:text-white hover:bg-blue-500/20 transition-colors"
                >
                  <Linkedin size={16} />
                </a>
              )}
              {member.social?.twitter && (
                <a
                  href={member.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="team-social-link p-2 bg-gray-800/50 rounded-full text-gray-400 hover:text-white hover:bg-sky-500/20 transition-colors"
                >
                  <Twitter size={16} />
                </a>
              )}
              {member.social?.portfolio && (
                <a
                  href={member.social.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="team-social-link p-2 bg-gray-800/50 rounded-full text-gray-400 hover:text-white hover:bg-purple-500/20 transition-colors"
                >
                  <Globe size={16} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Hover Instruction */}
        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="bg-black/80 text-cyan-400 px-3 py-1 rounded-full text-xs code-font">
            HOVER FOR DETAILS
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ImageFocusedCarousel = ({ members, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const itemsPerPage = 3; // Show 3 image-focused cards

  // Continuous animation that cycles through ALL members
  useEffect(() => {
    if (members.length <= itemsPerPage || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        return (prev + 1) % members.length;
      });
    }, 5000); // Increased from 4000ms to 5000ms for smoother viewing

    return () => clearInterval(interval);
  }, [members.length, itemsPerPage, isPaused]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % members.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + members.length) % members.length);
  };

  const getVisibleMembers = () => {
    if (members.length <= itemsPerPage) return members;

    const visible = [];
    for (let i = 0; i < itemsPerPage; i++) {
      visible.push(members[(currentIndex + i) % members.length]);
    }
    return visible;
  };

  const visibleMembers = getVisibleMembers();

  return (
    <div className="mb-16 senior-committee-section">
      {/* Section Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {title}
        </h3>
        <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full"></div>
        <p className="text-gray-400 text-sm mt-2">Hover over cards for detailed information</p>
      </motion.div>

      {/* Carousel Container */}
      <div 
        className="relative carousel-container-optimized team-section-optimized"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Pause Indicator */}
        {isPaused && members.length > itemsPerPage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-4 right-4 z-20 bg-black/90 text-cyan-400 px-3 py-1 rounded-full text-xs code-font border border-cyan-500/30"
          >
            ⏸ PAUSED
          </motion.div>
        )}

        {/* Navigation Arrows */}
        {members.length > itemsPerPage && (
          <>
            <motion.button
              onClick={handlePrev}
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-3 rounded-full bg-gray-800/90 border border-gray-700 text-white hover:bg-cyan-500 hover:border-cyan-500 transition-all duration-300 group backdrop-blur-sm"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
            </motion.button>
            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-3 rounded-full bg-gray-800/90 border border-gray-700 text-white hover:bg-cyan-500 hover:border-cyan-500 transition-all duration-300 group backdrop-blur-sm"
            >
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
          </>
        )}

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-presence-container">
          <AnimatePresence mode="popLayout">
            {visibleMembers.map((member, index) => (
              <motion.div
                key={`${member._id}-${currentIndex}`}
                layout
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.08,
                  ease: "easeInOut",
                  layout: { duration: 0.3 }
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="team-card-performance layout-stable"
              >
                <ImageFocusedMemberCard member={member} index={index} isSenior={true} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Navigation Dots */}
        {members.length > itemsPerPage && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mt-8 space-x-2"
          >
            {members.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentIndex(index)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  index === currentIndex ? 'bg-cyan-500 w-6' : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

const ImageOverlayMemberCard = ({ member, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative h-80 overflow-hidden rounded-2xl card-glow-optimized force-gpu"
      style={{ 
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)' // Force hardware acceleration
      }}
    >
      {/* Card Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
      
      {/* Main Image Container */}
      <div className="relative w-full h-full bg-gray-800 overflow-hidden rounded-2xl border border-gray-700 group-hover:border-cyan-500/50 transition-all duration-500">
        
        {/* Member Image - Full Background */}
        {member.image?.url ? (
          <img
            src={member.image.url}
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-center">
              <Users size={64} className="text-gray-600 mx-auto mb-4" />
              <div className="text-gray-500 code-font text-lg">No image available</div>
            </div>
          </div>
        )}

        {/* Always Visible Overlay - Name Only */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Name */}
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors duration-300 text-center">
              {member.name}
            </h3>
            
            {/* Role */}
            <div className="text-cyan-400 text-sm font-medium text-center">
              {member.role}
            </div>
          </div>
        </div>

        {/* Hover Overlay - Social Links Only */}
        <div className="absolute inset-0 core-committee-social-overlay opacity-0 group-hover:opacity-100 transition-all duration-500">
          
          {/* Member Name (Centered) */}
          <div className="text-center">
            <h3 className="core-committee-member-name">{member.name}</h3>
            <div className="core-committee-member-role">{member.role}</div>
          </div>

          {/* Social Links */}
          {member.social && (
            <div className="core-committee-social-links">
              {member.social?.github && (
                <a
                  href={member.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="core-committee-social-link github"
                >
                  <Github size={24} />
                </a>
              )}
              {member.social?.linkedin && (
                <a
                  href={member.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="core-committee-social-link linkedin"
                >
                  <Linkedin size={24} />
                </a>
              )}
              {member.social?.twitter && (
                <a
                  href={member.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="core-committee-social-link twitter"
                >
                  <Twitter size={24} />
                </a>
              )}
              {member.social?.portfolio && (
                <a
                  href={member.social.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="core-committee-social-link portfolio"
                >
                  <Globe size={24} />
                </a>
              )}
            </div>
          )}

          {/* Connect Label */}
          <div className="core-committee-connect-label">
            Connect with {member.name.split(' ')[0]}
          </div>
        </div>

        {/* Hover Instruction */}
        <div className="core-committee-hover-instruction">
          HOVER TO CONNECT
        </div>
      </div>
    </motion.div>
  );
};

const ContinuousCarousel = ({ members, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const itemsPerPage = 4;

  // Continuous animation that cycles through ALL members
  useEffect(() => {
    if (members.length <= itemsPerPage || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        // Move one position at a time to ensure every member is visible
        return (prev + 1) % members.length;
      });
    }, 3500); // Increased from 2500ms to 3500ms for smoother viewing

    return () => clearInterval(interval);
  }, [members.length, itemsPerPage, isPaused]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % members.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + members.length) % members.length);
  };

  const getVisibleMembers = () => {
    if (members.length <= itemsPerPage) return members;

    const visible = [];
    for (let i = 0; i < itemsPerPage; i++) {
      visible.push(members[(currentIndex + i) % members.length]);
    }
    return visible;
  };

  const visibleMembers = getVisibleMembers();

  // Calculate progress for the progress bar
  const progress = members.length > itemsPerPage ? ((currentIndex + 1) / members.length) * 100 : 100;

  return (
    <div className="mb-16 core-committee-section">
      {/* Section Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {title}
        </h3>
        <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full"></div>
        
        {/* Enhanced Progress indicator */}
        {members.length > itemsPerPage && (
          <div className="mt-4 max-w-lg mx-auto">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>Showing member {currentIndex + 1} of {members.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <motion.div 
                className="core-committee-progress h-2 rounded-full progress-bar-optimized"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-2 code-font text-center">
              Auto-cycling every 3.5s • Hover to pause
            </div>
          </div>
        )}
      </motion.div>

      {/* Carousel Container */}
      <div 
        className="relative core-committee-carousel carousel-container-optimized team-section-optimized"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Enhanced pause indicator */}
        <AnimatePresence>
          {isPaused && members.length > itemsPerPage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute top-4 right-4 z-20 bg-black/90 text-cyan-400 px-4 py-2 rounded-full text-sm code-font border border-cyan-500/30 backdrop-blur-sm"
            >
              ⏸ PAUSED
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auto-play indicator */}
        <AnimatePresence>
          {!isPaused && members.length > itemsPerPage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.7, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="absolute top-4 left-4 z-20 bg-black/80 text-green-400 px-3 py-1 rounded-full text-xs code-font"
            >
              ▶ AUTO
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Arrows */}
        {members.length > itemsPerPage && (
          <>
            <motion.button
              onClick={handlePrev}
              whileHover={{ scale: 1.1, x: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-3 rounded-full bg-gray-800/90 border border-gray-700 text-white hover:bg-cyan-500 hover:border-cyan-500 transition-all duration-300 group backdrop-blur-sm"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
            </motion.button>
            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.1, x: 3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-3 rounded-full bg-gray-800/90 border border-gray-700 text-white hover:bg-cyan-500 hover:border-cyan-500 transition-all duration-300 group backdrop-blur-sm"
            >
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
          </>
        )}

        {/* Members Grid */}
        <div className="carousel-grid animate-presence-container">
          <AnimatePresence mode="popLayout">
            {visibleMembers.map((member, index) => (
              <motion.div
                key={`${member._id}-${currentIndex}`}
                layout
                initial={{ opacity: 0, x: 30, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.98 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.06,
                  ease: "easeOut",
                  layout: { duration: 0.2 }
                }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
                className="team-card-performance layout-stable"
              >
                <ImageOverlayMemberCard member={member} index={index} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Enhanced Member Counter and Navigation */}
        {members.length > itemsPerPage && (
          <div className="flex flex-col items-center mt-8 space-y-4">
            {/* Enhanced Navigation Dots */}
            <div className="enhanced-nav-dots">
              {members.length <= 20 ? (
                // Show all dots for smaller teams
                members.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex ? 'bg-cyan-500 w-6 h-2' : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                ))
              ) : (
                // Show representative dots for larger teams
                Array.from({ length: Math.min(15, members.length) }).map((_, index) => {
                  const actualIndex = Math.floor((index / 14) * (members.length - 1));
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(actualIndex)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        Math.abs(actualIndex - currentIndex) <= 2 ? 'bg-cyan-500 w-6 h-2' : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                    />
                  );
                })
              )}
            </div>
            
            
          </div>
        )}
      </div>
    </div>
  );
};

const OurTeam = () => {
  const { data, isLoading } = useQuery(
    'team-members',
    () => api.get('/members?active=true').then(res => res.data),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const members = data?.members || [];

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-950">
        <div className="container-max">
          <div className="flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </section>
    );
  }

  if (members.length === 0) {
    return (
      <section className="py-20 bg-gray-950">
        <div className="container-max">
          <div className="text-center">
            <Users size={64} className="text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Team Members Yet</h2>
            <p className="text-gray-400">Team members will appear here once they are added by the admin.</p>
          </div>
        </div>
      </section>
    );
  }

  // Organize members by hierarchy (supporting both old and new team structures)
  const leadership = members.filter(member => 
    (member.team === 'Super Senior' && (member.role === 'President' || member.role === 'Vice President')) ||
    (member.team === 'Core' && (member.role === 'President' || member.role === 'Vice President'))
  ).sort((a, b) => {
    if (a.role === 'President') return -1;
    if (b.role === 'President') return 1;
    return 0;
  });

  const seniorCommittee = members.filter(member => 
    member.team === 'Senior Committee' ||
    (member.team === 'Technical' && member.role !== 'President' && member.role !== 'Vice President')
  );

  const coreCommittee = members.filter(member => 
    member.team === 'Core Committee' ||
    (member.team === 'Management' || member.team === 'Design') ||
    (member.team === 'Core' && 
     !leadership.some(leader => leader._id === member._id) && 
     !seniorCommittee.some(senior => senior._id === member._id))
  );

  return (
    <section className="py-24 bg-gray-950 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
        <div className="terminal-grid-pattern w-full h-full opacity-5"></div>
        
        {/* Floating Code Snippets */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { text: 'git clone team.git', x: '10%', y: '20%', delay: 0 },
            { text: 'npm run build-team', x: '85%', y: '30%', delay: 2 },
            { text: './deploy-innovation.sh', x: '15%', y: '70%', delay: 4 },
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
            <Users size={32} className="text-cyan-500 mr-3" />
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Our <span className="text-gradient">Team</span>
            </h2>
          </div>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Meet the passionate individuals driving innovation and excellence at MIBCS
          </p>
        </motion.div>

        {/* Leadership Section */}
        {leadership.length > 0 && (
          <div className="mb-20 leadership-section">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                <span className="text-gradient">Leadership</span>
              </h3>
              <div className="w-32 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 mx-auto rounded-full"></div>
            </motion.div>

            <div className={`grid gap-8 ${leadership.length === 1 ? 'max-w-lg mx-auto' : 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto'}`}>
              {leadership.map((member, index) => (
                <ImageFocusedMemberCard key={member._id} member={member} index={index} isLeadership={true} />
              ))}
            </div>
          </div>
        )}

        {/* Senior Committee */}
        {seniorCommittee.length > 0 && (
          <ImageFocusedCarousel 
            members={seniorCommittee} 
            title="Senior Committee"
          />
        )}

        {/* Core Committee */}
        {coreCommittee.length > 0 && (
          <ContinuousCarousel 
            members={coreCommittee} 
            title="Core Committee"
          />
        )}
      </div>
    </section>
  );
};

export default OurTeam;