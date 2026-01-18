import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, Github, ExternalLink, Star, ArrowRight, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import LoadingSpinner from '../UI/LoadingSpinner';

const FeaturedProjects = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const { data, isLoading } = useQuery(
        'featured-projects',
        () => api.get('/projects?featured=true&limit=10').then(res => res.data),
        {
            staleTime: 5 * 60 * 1000,
        }
    );

    const featuredProjects = data?.projects || [];
    const itemsPerPage = 3;

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

    if (featuredProjects.length === 0) {
        return null;
    }

    const handleNext = () => {
        if (featuredProjects.length > itemsPerPage) {
            setCurrentIndex((prev) => (prev + 1) % featuredProjects.length);
        }
    };

    const handlePrev = () => {
        if (featuredProjects.length > itemsPerPage) {
            setCurrentIndex((prev) => (prev - 1 + featuredProjects.length) % featuredProjects.length);
        }
    };

    const getVisibleProjects = () => {
        if (featuredProjects.length === 0) return [];
        if (featuredProjects.length <= itemsPerPage) return featuredProjects;

        const visible = [];
        for (let i = 0; i < itemsPerPage; i++) {
            visible.push(featuredProjects[(currentIndex + i) % featuredProjects.length]);
        }
        return visible;
    };

    const visibleProjects = getVisibleProjects();

    // Determine grid layout based on number of items
    const getGridLayout = () => {
        const itemCount = Math.min(featuredProjects.length, itemsPerPage);
        if (itemCount === 1) return 'flex justify-center';
        if (itemCount === 2) return 'grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto';
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';
    };

    return (
        <section className="py-24 bg-gray-950 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-900/10 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-purple-900/10 to-transparent"></div>

            <div className="container-max relative z-10 px-6">
                {/* Section Header - Centered */}
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
                            Featured <span className="text-gradient">Projects</span>
                        </h2>
                    </div>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Explore the innovative solutions built by our talented community members
                    </p>
                    
                    {/* Navigation Arrows - Centered Below */}
                    {featuredProjects.length > itemsPerPage && (
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

                {/* Projects Grid / Carousel */}
                <div className={`mb-12 ${getGridLayout()}`}>
                    <AnimatePresence mode='wait'>
                        {visibleProjects.map((project, index) => {
                            return (
                                <motion.div
                                    key={`${project._id}-${currentIndex}`} // Force re-render for animation on slide
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -30 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    className={`group relative h-full flex ${featuredProjects.length === 1 ? 'max-w-md mx-auto' : ''}`}
                                >
                                    {/* Glow Effect - Copied from FeaturedEvents */}
                                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>

                                    <div className="relative w-full h-[500px] bg-black/90 backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden hover:border-cyan-500/50 transition-all duration-500 group/card will-change-transform hover:scale-[1.02]">

                                        {/* Terminal Header */}
                                        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-gray-900/95 border-b border-gray-700">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            </div>
                                            <div className="text-gray-400 text-xs code-font">project_{project._id?.slice(-6)}.js</div>
                                            <div className="flex items-center space-x-1">
                                                <Star size={12} className="text-yellow-400" />
                                                <span className="text-xs text-yellow-400 code-font">FEATURED</span>
                                            </div>
                                        </div>

                                        {/* Project Image - Full Coverage */}
                                        <div className="absolute inset-0 w-full h-full pt-12">
                                            {project.images?.[0]?.url ? (
                                                <img
                                                    src={project.images[0].url}
                                                    alt={project.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                                                    <FolderOpen size={48} />
                                                </div>
                                            )}
                                            {/* Initial Subtle Overlay */}
                                            <div className="absolute inset-0 bg-black/20 group-hover/card:bg-black/60 transition-colors duration-500"></div>
                                        </div>

                                        {/* Featured Badge - Removed since it's now in terminal header */}

                                        {/* Info Overlay - Reveal on Hover */}
                                        <div className="absolute inset-0 flex flex-col justify-end p-6 z-10 translate-y-6 opacity-0 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-500 bg-gradient-to-t from-gray-950 via-gray-900/80 to-transparent">

                                            <div className="transform transition-transform duration-500">
                                                <div className="flex items-center justify-between mb-2">
                                                    {/* Status Badge */}
                                                    <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wider ${project.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                        project.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700/50 text-gray-400'
                                                        }`}>
                                                        {project.status?.replace('-', ' ')}
                                                    </span>

                                                    {/* Links */}
                                                    <div className="flex space-x-2">
                                                        <a href={project.links?.github || '#'} target={project.links?.github ? "_blank" : "_self"} className="p-2 bg-gray-800/80 rounded-full text-white hover:bg-cyan-500 hover:text-white transition-colors">
                                                            <Github size={16} />
                                                        </a>
                                                        <a href={project.links?.demo || '#'} target={project.links?.demo ? "_blank" : "_self"} className="p-2 bg-gray-800/80 rounded-full text-white hover:bg-cyan-500 hover:text-white transition-colors">
                                                            <ExternalLink size={16} />
                                                        </a>
                                                    </div>
                                                </div>

                                                <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                                                    {project.title}
                                                </h3>

                                                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                                                    {project.shortDescription || project.description}
                                                </p>

                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {project.techStack?.slice(0, 3).map((tech, i) => (
                                                        <span key={i} className="text-xs text-cyan-300 bg-cyan-900/30 px-2 py-1 rounded flex items-center border border-cyan-500/20">
                                                            <Layers size={10} className="mr-1" />
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>

                                                <Link
                                                    to={`/projects`}
                                                    className="w-full py-3 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-all duration-300 group/btn relative overflow-hidden"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                                                    <div className="relative flex items-center justify-center space-x-2">
                                                        <span className="font-medium">./view_project.sh</span>
                                                        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                                    </div>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* View All Projects CTA - Centered */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <Link
                        to="/projects"
                        className="inline-flex items-center btn-outline group"
                    >
                        <FolderOpen size={18} className="mr-2" />
                        <span>Explore All Projects</span>
                        <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

export default FeaturedProjects;
