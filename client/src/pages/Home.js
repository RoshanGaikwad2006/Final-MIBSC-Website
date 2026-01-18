import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Code,
  Trophy,
  Calendar,
  Users,
  Terminal,
  GitBranch,
  ChevronDown,
  Play
} from 'lucide-react';
import FeaturedEvents from '../components/Events/FeaturedEvents';
import FeaturedAchievements from '../components/Achievements/FeaturedAchievements';
import FeaturedProjects from '../components/Projects/FeaturedProjects';
import OurTeam from '../components/Team/OurTeam';
import GallerySection from '../components/Home/GallerySection';

// ... (rest of imports)

// ... (inside Home component return)



const Home = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [terminalText, setTerminalText] = useState('');
  const [binaryMatrix, setBinaryMatrix] = useState([]);
  const [currentCommand, setCurrentCommand] = useState(0);

  // Terminal commands animation
  const terminalCommands = [
    'sudo apt install innovation',
    'git clone https://github.com/mibcs/future.git',
    'npm run build-tomorrow',
    'docker run -d --name=revolution mibcs:latest',
    'python3 train_ai_model.py --epochs=∞',
    'blockchain deploy --network=future',
    'iot connect --devices=all --secure=true',
    'cybersec scan --target=vulnerabilities --fix=auto'
  ];

  // Binary matrix effect
  useEffect(() => {
    const generateBinaryMatrix = () => {
      const matrix = [];
      for (let i = 0; i < 25; i++) {
        matrix.push({
          id: i,
          x: Math.random() * 100,
          delay: Math.random() * 5,
          speed: Math.random() * 2 + 2,
          binary: Array.from({ length: 20 }, () => Math.random() > 0.5 ? '1' : '0').join('')
        });
      }
      setBinaryMatrix(matrix);
    };
    generateBinaryMatrix();
  }, []);

  // Terminal typing effect
  useEffect(() => {
    const typeCommand = () => {
      const command = terminalCommands[currentCommand];
      let index = 0;
      setTerminalText('');

      const typing = setInterval(() => {
        if (index < command.length) {
          setTerminalText(command.substring(0, index + 1));
          index++;
        } else {
          clearInterval(typing);
          setTimeout(() => {
            setCurrentCommand((prev) => (prev + 1) % terminalCommands.length);
          }, 2000);
        }
      }, 80);
    };

    const timer = setTimeout(typeCommand, 1000);
    return () => clearTimeout(timer);
  }, [currentCommand, terminalCommands]);

 useEffect(() => {
  let ticking = false;

  const handleMouseMove = (e) => {
    if (!ticking) {
      requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('mousemove', handleMouseMove, { passive: true });

  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
  };
}, []);

  const stats = [
    { number: '500+', label: 'Members', Icon: Users, delay: 0 },
    { number: '50+', label: 'Projects', Icon: GitBranch, delay: 0.1 },
    { number: '25+', label: 'Hackathons', Icon: Trophy, delay: 0.2 },
    { number: '100+', label: 'Events', Icon: Calendar, delay: 0.3 }
  ];

  const codeLines = [
    'class MIBCS {',
    '  constructor() {',
    '    this.mission = "Innovation";',
    '    this.vision = "Future Tech";',
    '    this.members = 500+;',
    '  }',
    '}'
  ];

  return (
    <div className="bg-gray-950 overflow-hidden" style={{ paddingTop: 0 }}>
      {/* Animated cursor follower */}
      <div 
  className="fixed w-6 h-6 bg-cyan-400/30 rounded-full pointer-events-none z-50 mix-blend-screen"
  style={{
    transform: `translate3d(${mousePosition.x - 12}px, ${mousePosition.y - 12}px, 0)`
  }}
/>


      {/* Hero Section - Terminal Theme */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden p-4">
        {/* Terminal Background */}
        <div className="absolute inset-0">
          {/* Base terminal background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-900"></div>

          {/* Binary Matrix Rain */}
          <div className="absolute inset-0 overflow-hidden opacity-15">
            {binaryMatrix.map((column) => (
              <motion.div
                key={column.id}
                className="absolute top-0 text-cyan-400 code-font text-xs leading-tight"
                style={{ left: `${column.x}%` }}
                initial={{ y: -100, opacity: 0 }}
                animate={{
                  y: '100vh',
                  opacity: [0, 1, 1, 0]
                }}
                transition={{
                  duration: column.speed * 3,
                  delay: column.delay,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                {column.binary.split('').map((bit, index) => (
                  <motion.div
                    key={index}
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      color: Math.random() > 0.95 ? '#ffffff' : '#06b6d4'
                    }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      repeat: Infinity
                    }}
                  >
                    {bit}
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </div>

          {/* Terminal Grid Lines */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full">
              <defs>
                <pattern id="terminal-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#06b6d4" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#terminal-grid)" />
            </svg>
          </div>

          {/* Glitch Effects */}
          <motion.div
            className="absolute inset-0 bg-cyan-400/5"
            animate={{
              opacity: [0, 0.1, 0],
              scaleX: [1, 1.01, 1],
            }}
            transition={{
              duration: 0.1,
              repeat: Infinity,
              repeatDelay: Math.random() * 10 + 5
            }}
          />

          {/* Scanning Lines */}
          <motion.div
            className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30"
            animate={{ y: ['0vh', '100vh'] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        {/* Main Terminal Content */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
          {/* Terminal Window - Properly Sized */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="terminal-window w-full max-w-5xl h-[75vh] bg-black/90 backdrop-blur-sm rounded-lg border border-gray-700 terminal-window-shadow overflow-hidden flex flex-col"
          >
            {/* Terminal Header */}
            <div className="terminal-header flex items-center justify-between px-4 py-3 bg-gray-900/95 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-gray-400 text-sm code-font">mibcs@future:~$</div>
              <div className="flex items-center space-x-2">
                <Terminal size={16} className="text-gray-500" />
              </div>
            </div>

            {/* Terminal Content */}
            <div className="terminal-content flex-1 p-4 md:p-6 code-font">
              {/* Welcome Message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="mb-4"
              >
                <div className="text-green-400 text-xs mb-1">
                  ╔══════════════════════════════════════════════════════════════╗
                </div>
                <div className="text-green-400 text-xs mb-1">
                  ║                    MIBCS TERMINAL v2.0.24                    ║
                </div>
                <div className="text-green-400 text-xs mb-1">
                  ║            Machine Intelligence & Blockchain Club            ║
                </div>
                <div className="text-green-400 text-xs mb-3">
                  ╚══════════════════════════════════════════════════════════════╝
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div className="text-cyan-400">
                    System Status: <span className="text-green-400">ONLINE</span>
                  </div>
                  <div className="text-cyan-400">
                    Active Members: <span className="text-yellow-400">500+</span>
                  </div>
                  <div className="text-cyan-400">
                    Innovation Level: <span className="text-red-400">MAXIMUM</span>
                  </div>
                </div>
              </motion.div>

              {/* Animated Command Line */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="mb-4"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-green-400 text-sm">mibcs@innovation:~$</span>
                  <motion.span
                    className="text-white text-sm"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {terminalText}
                  </motion.span>
                  <motion.span
                    className="bg-cyan-400 w-2 h-4 inline-block"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                </div>
              </motion.div>

              {/* ASCII Art MIBCS - Compact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="text-center mb-4"
              >
                <div className="text-cyan-400 text-xs leading-tight">
                  <pre className="inline-block ascii-art">
                    {`███╗   ███╗██╗██████╗  ██████╗███████╗
████╗ ████║██║██╔══██╗██╔════╝██╔════╝
██╔████╔██║██║██████╔╝██║     ███████╗
██║╚██╔╝██║██║██╔══██╗██║     ╚════██║
██║ ╚═╝ ██║██║██████╔╝╚██████╗███████║
╚═╝     ╚═╝╚═╝╚═════╝  ╚═════╝╚══════╝`}
                  </pre>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 2.5, duration: 2 }}
                  className="h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-2 max-w-sm mx-auto"
                />
              </motion.div>

              {/* Tech Domains Display - Compact Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3, duration: 1 }}
                className="domain-grid grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4"
              >
                {[
                  { name: 'ML', fullName: 'Machine Learning', status: 'ACTIVE', color: 'text-green-400', statusClass: 'status-active' },
                  { name: 'IoT', fullName: 'Internet of Things', status: 'RUNNING', color: 'text-blue-400', statusClass: 'status-running' },
                  { name: 'Blockchain', fullName: 'Blockchain', status: 'MINING', color: 'text-yellow-400', statusClass: 'status-mining' },
                  { name: 'CyberSec', fullName: 'Cyber Security', status: 'SECURED', color: 'text-red-400', statusClass: 'status-secured' }
                ].map((domain, index) => (
                  <motion.div
                    key={domain.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 3.2 + index * 0.1, duration: 0.5 }}
                    className="flex flex-col p-2 bg-gray-900/50 rounded border border-gray-800 text-center"
                  >
                    <span className="text-gray-300 text-xs mb-1" title={domain.fullName}>[{domain.name}]</span>
                    <span className={`${domain.color} text-xs flex items-center justify-center`}>
                      {domain.status}
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: index * 0.2 }}
                        className={`status-dot ${domain.statusClass} ml-1`}
                      />
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Action Buttons - Compact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 4, duration: 1 }}
                className="button-group flex flex-col sm:flex-row gap-3 justify-center items-center mb-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/contact"
                    className="terminal-btn group relative inline-flex items-center space-x-2 px-6 py-2 bg-cyan-500/20 border border-cyan-500 rounded text-cyan-400 hover:bg-cyan-500/30 transition-all duration-300"
                  >
                    <Terminal size={16} />
                    <span className="code-font text-sm">./join_mibcs.sh</span>
                    <motion.div
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight size={14} />
                    </motion.div>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/projects"
                    className="terminal-btn group inline-flex items-center space-x-2 px-6 py-2 border border-gray-600 rounded text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-all duration-300"
                  >
                    <Code size={16} />
                    <span className="code-font text-sm">cat projects.md</span>
                  </Link>
                </motion.div>
              </motion.div>

              {/* System Info - Compact */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 4.5, duration: 1 }}
                className="pt-3 border-t border-gray-800 text-xs text-gray-500"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                  <div>Uptime: 24/7</div>
                  <div>Load: Innovation</div>
                  <div>Memory: ∞</div>
                  <div>Network: Global</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Scroll Indicator - Positioned at bottom of viewport */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5, duration: 1 }}
            className="mt-4 flex flex-col items-center space-y-2 text-gray-500"
          >
            <span className="text-xs code-font">scroll --down</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative"
            >
              <ChevronDown size={18} />
              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="absolute top-0 left-0"
              >
                <ChevronDown size={18} className="text-cyan-400" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Floating Terminal Commands - Reduced and positioned better */}
          <div className="absolute inset-0 pointer-events-none">
            {[
              { text: 'git push origin future', x: '5%', y: '10%', delay: 2 },
              { text: 'npm run innovation', x: '85%', y: '15%', delay: 3 }
            ].map((cmd, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.3, 0],
                  scale: [0, 1, 0],
                  y: [0, -15, -30]
                }}
                transition={{
                  duration: 4,
                  delay: cmd.delay,
                  repeat: Infinity,
                  repeatDelay: 12
                }}
                className="absolute code-font text-xs text-cyan-400/30 hidden lg:block"
                style={{ left: cmd.x, top: cmd.y }}
              >
                $ {cmd.text}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map(({ number, label, Icon, delay }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: delay, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Icon size={24} className="text-cyan-400" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="text-3xl font-bold text-white code-font mb-2">{number}</div>
                <div className="text-gray-400 text-sm">{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Code Preview Section */}
      <section className="py-20 bg-gray-900/30">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Code the <span className="text-gradient">Future</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Join a community of innovators, builders, and dreamers. From AI algorithms to blockchain protocols,
                we're shaping tomorrow's technology today.
              </p>
              <Link to="/about" className="btn-outline">
                Learn More
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                <div className="flex items-center space-x-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-400 text-sm ml-4 code-font">mibcs.js</span>
                </div>
                <div className="p-6 code-font text-sm">
                  {codeLines.map((line, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      viewport={{ once: true }}
                      className="flex items-center space-x-4 py-1"
                    >
                      <span className="text-gray-600 w-6 text-right">{index + 1}</span>
                      <span className="text-gray-300">{line}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <FeaturedEvents />

      {/* Featured Projects Section */}
      <FeaturedProjects />

      {/* Featured Achievements Section */}
      <FeaturedAchievements />

      {/* Our Team Section */}
      <OurTeam />

      {/* Gallery Section */}
      <GallerySection />

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-max text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-3xl blur opacity-30"></div>
              <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl p-12 border border-gray-800">
                <Terminal size={48} className="text-cyan-400 mx-auto mb-6" />
                <h2 className="text-4xl font-bold text-white mb-6">
                  Ready to <span className="text-gradient">Build</span> the Future?
                </h2>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  Join MIBCS and be part of a community that's pushing the boundaries of technology.
                  From hackathons to research projects, your journey starts here.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/contact" className="btn-primary">
                    Join MIBCS
                  </Link>
                  <Link to="/events" className="btn-secondary">
                    Upcoming Events
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;