import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, Instagram, Mail, Phone, MapPin, Terminal, Code, Cpu, Shield, Wifi, Database } from 'lucide-react';
import { CLUB_INFO, DOMAINS } from '../../utils/constants';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Projects', href: '/projects' },
    { name: 'Events', href: '/events' },
    { name: 'Achievements', href: '/achievements' },
    { name: 'Join Us', href: '/contact' }
  ];

  const socialLinks = [
    { name: 'GitHub', href: CLUB_INFO.social.github, icon: Github },
    { name: 'LinkedIn', href: CLUB_INFO.social.linkedin, icon: Linkedin },
    { name: 'Twitter', href: CLUB_INFO.social.twitter, icon: Twitter },
    { name: 'Instagram', href: CLUB_INFO.social.instagram, icon: Instagram }
  ];

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Club Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <img 
                  src="\logo192.png"  
                  alt="MIBCS Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gradient">{CLUB_INFO.name}</h3>
                <p className="text-cyan-400 text-sm code-font">// {CLUB_INFO.fullName}</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
              {CLUB_INFO.description}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 group">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors duration-200">
                  <Mail size={16} className="text-cyan-400" />
                </div>
                <span className="text-gray-300 code-font text-sm">{CLUB_INFO.email}</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors duration-200">
                  <Phone size={16} className="text-cyan-400" />
                </div>
                <span className="text-gray-300 code-font text-sm">{CLUB_INFO.phone}</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors duration-200">
                  <MapPin size={16} className="text-cyan-400" />
                </div>
                <span className="text-gray-300 text-sm">{CLUB_INFO.address}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white flex items-center">
              <Code size={18} className="mr-2 text-cyan-400" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 text-sm flex items-center group"
                  >
                    <span className="w-1 h-1 bg-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Domains */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white flex items-center">
              <Cpu size={18} className="mr-2 text-cyan-400" />
              Our Domains
            </h4>
            <ul className="space-y-3">
              {DOMAINS.map((domain) => {
                const IconComponent = {
                  'Machine Learning': Cpu,
                  'Internet of Things': Wifi,
                  'Blockchain': Database,
                  'Cyber Security': Shield
                }[domain.name] || Code;

                return (
                  <li key={domain.id}>
                    <Link
                      to="/domains"
                      className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 text-sm flex items-center group"
                    >
                      <IconComponent size={14} className="mr-3 text-cyan-400/70 group-hover:text-cyan-400" />
                      {domain.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0 code-font">
              © {currentYear} {CLUB_INFO.name}. All rights reserved. | Built with ❤️ by MIBCS
            </p>
            
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/20 transition-all duration-200 group"
                    aria-label={social.name}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;