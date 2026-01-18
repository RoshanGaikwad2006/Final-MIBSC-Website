import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Mail, Terminal, Code, Cpu, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { CLUB_INFO } from '../../utils/constants';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        toast.success('Access granted! Welcome to the matrix 🚀');
        navigate('/admin');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Authentication failed. Access denied.');
    } finally {
      setIsLoading(false);
    }
  };

  const techIcons = [
    { Icon: Terminal, delay: 0 },
    { Icon: Code, delay: 0.2 },
    { Icon: Cpu, delay: 0.4 },
    { Icon: Shield, delay: 0.6 }
  ];

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden" style={{ paddingTop: 0 }}>
      {/* Animated background */}
      <div className="absolute inset-0 matrix-bg opacity-30"></div>
      
      {/* Floating tech icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {techIcons.map(({ Icon, delay }, index) => (
          <div
            key={index}
            className={`absolute animate-float text-cyan-500/20`}
            style={{
              left: `${20 + index * 20}%`,
              top: `${10 + index * 15}%`,
              animationDelay: `${delay}s`
            }}
          >
            <Icon size={40} />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center space-x-3 mb-8 group">
              <div className="relative">
                <img 
                 src="\logo192.png" 
                  alt="MIBCS Logo" 
                  className="w-16 h-16 object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-gradient">{CLUB_INFO.name}</h1>
                <p className="text-sm text-cyan-400 code-font">// Admin Portal</p>
              </div>
            </Link>
            
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-white">
                Access <span className="text-gradient">Terminal</span>
              </h2>
              <p className="text-gray-400 max-w-sm mx-auto">
                Authenticate to enter the admin control center
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-2xl blur opacity-25"></div>
            
            <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-8">
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 code-font">
                    <Mail size={16} className="inline mr-2" />
                    Email Address
                  </label>
                  <div className="relative group">
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      className="input-field group-hover:border-cyan-500/50 transition-all duration-300"
                      placeholder="Enter your admin email"
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm code-font">{errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 code-font">
                    <Lock size={16} className="inline mr-2" />
                    Password
                  </label>
                  <div className="relative group">
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                      type={showPassword ? 'text' : 'password'}
                      className="input-field pr-12 group-hover:border-cyan-500/50 transition-all duration-300"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-sm code-font">{errors.password.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        <span className="code-font">Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <Terminal size={18} className="mr-2" />
                        <span className="code-font">Initialize Session</span>
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Security Notice */}
              <div className="mt-8 p-4 bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-lg border border-red-700/30">
                <h3 className="text-sm font-medium text-red-400 mb-2 code-font flex items-center">
                  <Shield size={14} className="mr-2" />
                  Security Notice
                </h3>
                <p className="text-xs text-gray-300 code-font">
                  This is a secure admin portal. Only authorized personnel with valid credentials can access the system.
                </p>
              </div>
            </div>
          </div>

          {/* Back to Site */}
          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-400 hover:text-cyan-400 font-medium transition-colors duration-200 code-font group"
            >
              <span className="mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform duration-200">←</span>
              Back to main site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;