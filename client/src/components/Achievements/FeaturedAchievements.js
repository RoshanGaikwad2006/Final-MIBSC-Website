import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowRight, Star, ChevronLeft, ChevronRight, Award, Calendar } from 'lucide-react';
import { api } from '../../utils/api';
import { format } from 'date-fns';

const AchievementCard = ({ achievement, index }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Auto-cycle images on hover if no manual interaction
    // Actually, user asked for "small arrow would be there so that all the images related to achievemnt would be visible there"
    // So we will implement manual navigation arrows that appear on hover.

    const nextImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (achievement.images && achievement.images.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % achievement.images.length);
        }
    };

    const prevImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (achievement.images && achievement.images.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + achievement.images.length) % achievement.images.length);
        }
    };

    const hasMultipleImages = achievement.images && achievement.images.length > 1;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            className="group relative h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Card Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>

            <div className="relative h-full bg-black/90 backdrop-blur-xl border border-gray-700 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all duration-500 flex flex-col will-change-transform group-hover:scale-[1.02]">
                
                {/* Terminal Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-900/95 border-b border-gray-700 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-gray-400 text-xs code-font">achievement_{achievement._id?.slice(-6)}.md</div>
                    <div className="flex items-center space-x-1">
                        <Trophy size={12} className="text-yellow-400" />
                        <span className="text-xs text-yellow-400 code-font">FEATURED</span>
                    </div>
                </div>
                {/* Image Section */}
                <div className="relative h-64 bg-gray-800 overflow-hidden flex-shrink-0">
                    {achievement.images && achievement.images.length > 0 ? (
                        <motion.img
                            key={currentImageIndex}
                            src={achievement.images[currentImageIndex].url}
                            alt={achievement.title}
                            initial={{ opacity: 0.8, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                            <Trophy size={48} className="text-gray-600" />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80"></div>

                    {/* Position Badge */}
                    {achievement.position && (
                        <div className="absolute top-4 right-4">
                            <span className="flex items-center space-x-1 px-3 py-1 text-xs font-bold text-black bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-lg">
                                <Award size={12} />
                                <span>{achievement.position}</span>
                            </span>
                        </div>
                    )}

                    {/* Navigation Arrows for Multiple Images */}
                    <AnimatePresence>
                        {isHovered && hasMultipleImages && (
                            <>
                                <motion.button
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    onClick={prevImage}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors z-20"
                                >
                                    <ChevronLeft size={20} />
                                </motion.button>
                                <motion.button
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    onClick={nextImage}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors z-20"
                                >
                                    <ChevronRight size={20} />
                                </motion.button>
                                {/* Dots Indicator */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 z-20"
                                >
                                    {achievement.images.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/30'}`}
                                        />
                                    ))}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                    <div className="mb-auto">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                                <Calendar size={12} />
                                <span>{format(new Date(achievement.date), 'MMM yyyy')}</span>
                            </div>

                            {/* Category Badge - Moved Below Image */}
                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                                {achievement.category}
                            </span>
                        </div>

                        {achievement.event?.name && (
                            <div className="text-xs text-gray-500 mb-2 truncate">
                                {achievement.event.name}
                            </div>
                        )}

                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                            {achievement.title}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                            {achievement.description}
                        </p>
                    </div>

                    <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                        <Link
                            to={`/achievements`}
                            className="w-full py-2 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-all duration-300 group/btn relative overflow-hidden text-center"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                            <div className="relative flex items-center justify-center space-x-2">
                                <span className="font-medium">./read_story.sh</span>
                                <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const FeaturedAchievements = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    const { data, isLoading } = useQuery('featured-achievements', () =>
        api.get('/achievements?featured=true&limit=10').then((res) => res.data)
    );

    const achievements = data?.achievements || [];
    const itemsPerPage = 3;

    if (!isLoading && achievements.length === 0) return null;

    const handleNext = () => {
        if (achievements.length > itemsPerPage) {
            setCurrentIndex((prev) => (prev + 1) % achievements.length);
        }
    };

    const handlePrev = () => {
        if (achievements.length > itemsPerPage) {
            setCurrentIndex((prev) => (prev - 1 + achievements.length) % achievements.length);
        }
    };

    const getVisibleAchievements = () => {
        if (achievements.length === 0) return [];
        if (achievements.length <= itemsPerPage) return achievements;

        const visible = [];
        for (let i = 0; i < itemsPerPage; i++) {
            visible.push(achievements[(currentIndex + i) % achievements.length]);
        }
        return visible;
    };

    const visibleAchievements = getVisibleAchievements();

    // Determine grid layout based on number of items
    const getGridLayout = () => {
        const itemCount = Math.min(achievements.length, itemsPerPage);
        if (itemCount === 1) return 'flex justify-center';
        if (itemCount === 2) return 'grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto';
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';
    };

    return (
        <section className="py-24 bg-gray-950 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-cyan-500/5 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />

            <div className="container-max relative z-10">
                {/* Section Header - Centered */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center mb-4">
                        <Trophy size={24} className="text-yellow-500 mr-2" />
                        <h2 className="text-4xl md:text-5xl font-bold text-white">
                            Featured <span className="text-gradient">Achievements</span>
                        </h2>
                    </div>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Celebrating the outstanding accomplishments of our community members
                    </p>
                    
                    {/* Navigation Arrows - Show only if more than 3 items */}
                    {achievements.length > itemsPerPage && (
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

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="h-[400px] bg-gray-900/50 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className={getGridLayout()}>
                        <AnimatePresence mode='wait'>
                            {visibleAchievements.map((achievement, index) => (
                                <motion.div
                                    key={`${achievement._id}-${currentIndex}`}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -30 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className={`${achievements.length === 1 ? 'max-w-md mx-auto' : ''}`}
                                >
                                    <AchievementCard achievement={achievement} index={index} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* View All Achievements CTA - Centered */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="text-center mt-12"
                >
                    <Link
                        to="/achievements"
                        className="inline-flex items-center btn-outline group"
                    >
                        <Trophy size={18} className="mr-2" />
                        <span>View All Achievements</span>
                        <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

export default FeaturedAchievements;
