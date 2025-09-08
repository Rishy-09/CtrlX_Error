import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuBug, LuShield, LuUsers, LuTrendingUp, LuLightbulb, LuArrowRight, LuCheck, LuGithub, LuTwitter, LuLinkedin, LuFacebook } from 'react-icons/lu';
import { MdBarChart } from "react-icons/md";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Close mobile menu if open
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Header/Navigation */}
      <header className="bg-white border-b border-gray-200/50 backdrop-blur-[2px] sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <LuBug className="text-primary text-2xl mr-2" />
              <span className="text-xl font-bold text-gray-800">CtrlX_Error</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="text-gray-600 hover:text-primary">Features</a>
              <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="text-gray-600 hover:text-primary">Pricing</a>
              <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="text-gray-600 hover:text-primary">About Us</a>
            </nav>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={toggleMenu} className="text-gray-500 focus:outline-none">
                {isMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button onClick={() => navigate('/login')} className="text-gray-600 hover:text-primary">
                Login
              </button>
              <button 
                onClick={() => navigate('/signup')} 
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Get Started
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 animate-fadeIn">
              <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="block py-2 text-gray-600 hover:text-primary">Features</a>
              <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="block py-2 text-gray-600 hover:text-primary">Pricing</a>
              <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="block py-2 text-gray-600 hover:text-primary">About Us</a>
              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col space-y-2">
                <button onClick={() => navigate('/login')} className="text-gray-600 hover:text-primary py-2">
                  Login
                </button>
                <button 
                  onClick={() => navigate('/signup')} 
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
                Track & Fix Bugs <span className="text-primary">Efficiently</span>
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                CtrlX_Error helps development teams track, prioritize, and fix software bugs faster than ever before. Simplify your debugging workflow and improve your software quality.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={() => navigate('/signup')} 
                  className="bg-primary text-white px-6 py-3 rounded-md hover:bg-blue-600 transition font-medium"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
            <div className="flex justify-center">
              <img 
                src="../src/assets/images/bug_tracking.jpg"
                alt="Bug Tracking Dashboard" 
                className="max-w-full h-auto rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Powerful Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              CtrlX_Error provides all the tools you need to effectively manage bugs and improve your software quality.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card hover:shadow-lg transition p-6">
              <div className="text-primary text-3xl mb-4">
                <LuBug />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Bug Tracking</h3>
              <p className="text-gray-600">
                Easily create, assign, and track bugs with a customizable workflow that fits your team's process.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="card hover:shadow-lg transition p-6">
              <div className="text-primary text-3xl mb-4">
                <LuShield />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Security Reports</h3>
              <p className="text-gray-600">
                Prioritize and track security vulnerabilities with specialized fields and dashboards.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="card hover:shadow-lg transition p-6">
              <div className="text-primary text-3xl mb-4">
                <LuUsers />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Team Collaboration</h3>
              <p className="text-gray-600">
                Collaborate effectively with comments, mentions, and real-time updates to fix bugs faster.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="card hover:shadow-lg transition p-6">
              <div className="text-primary text-3xl mb-4">
                <LuTrendingUp />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Performance Metrics</h3>
              <p className="text-gray-600">
                Track key metrics like resolution time, bug density, and team performance with visual dashboards.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="card hover:shadow-lg transition p-6">
              <div className="text-primary text-3xl mb-4">
                <LuLightbulb />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Smart Suggestions</h3>
              <p className="text-gray-600">
                Get AI-powered suggestions for bug priority, severity, and assignment based on historical data.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="card hover:shadow-lg transition p-6">
              <div className="text-primary text-3xl mb-4">
              <MdBarChart />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Customizable Reports</h3>
              <p className="text-gray-600">
                Create and share custom reports with stakeholders to keep everyone informed of progress.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the plan that's right for your team. All plans include a 14-day free trial.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="card border hover:shadow-lg transition">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Starter</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-800">$29</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600 mb-6">Perfect for small teams getting started with bug tracking.</p>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <LuCheck className="text-primary mr-2" />
                    <span className="text-gray-600">Up to 5 team members</span>
                  </li>
                  <li className="flex items-center">
                    <LuCheck className="text-primary mr-2" />
                    <span className="text-gray-600">Basic bug tracking</span>
                  </li>
                  <li className="flex items-center">
                    <LuCheck className="text-primary mr-2" />
                    <span className="text-gray-600">Email notifications</span>
                  </li>
                  <li className="flex items-center">
                    <LuCheck className="text-primary mr-2" />
                    <span className="text-gray-600">5GB storage</span>
                  </li>
                </ul>
                
                <button className="btn-outline w-full py-2">Get Started</button>
              </div>
            </div>
            
            {/* Professional Plan */}
            <div className="card border-2 border-primary shadow-lg scale-105 relative">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs py-1 px-3 rounded-bl-lg rounded-tr-lg font-medium">
                Most Popular
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Professional</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-800">$79</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600 mb-6">Ideal for growing development teams with more complex needs.</p>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <LuCheck className="text-primary mr-2" />
                    <span className="text-gray-600">Up to 20 team members</span>
                  </li>
                  <li className="flex items-center">
                    <LuCheck className="text-primary mr-2" />
                    <span className="text-gray-600">Advanced bug tracking</span>
                  </li>
                  <li className="flex items-center">
                    <LuCheck className="text-primary mr-2" />
                    <span className="text-gray-600">Custom workflows</span>
                  </li>
                  <li className="flex items-center">
                    <LuCheck className="text-primary mr-2" />
                    <span className="text-gray-600">API access</span>
                  </li>
                  <li className="flex items-center">
                    <LuCheck className="text-primary mr-2" />
                    <span className="text-gray-600">20GB storage</span>
                  </li>
                  <li className="flex items-center">
                    <LuCheck className="text-primary mr-2" />
                    <span className="text-gray-600">Priority support</span>
                  </li>
                </ul>
                
                <button className="btn-primary w-full py-2">Get Started</button>
              </div>
            </div>
            
            {/* Enterprise Plan */}
            <div className="card border hover:shadow-lg transition">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Enterprise</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-800">$199</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600 mb-6">For large organizations with advanced security and compliance needs.</p>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <LuCheck className="text-primary mr-2" />
                    <span className="text-gray-600">Unlimited team members</span>
                  </li>
                  <li className="flex items-center">
                    <LuCheck className="text-primary mr-2" />
                    <span className="text-gray-600">Enterprise-grade security</span>
                  </li>
                  <li className="flex items-center">
                    <LuCheck className="text-primary mr-2" />
                    <span className="text-gray-600">Custom integrations</span>
                  </li>
                  <li className="flex items-center">
                    <LuCheck className="text-primary mr-2" />
                    <span className="text-gray-600">Dedicated account manager</span>
                  </li>
                  <li className="flex items-center">
                    <LuCheck className="text-primary mr-2" />
                    <span className="text-gray-600">Unlimited storage</span>
                  </li>
                  <li className="flex items-center">
                    <LuCheck className="text-primary mr-2" />
                    <span className="text-gray-600">24/7 premium support</span>
                  </li>
                </ul>
                
                <button className="btn-outline w-full py-2">Contact Sales</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* About Us Section */}
      <section id="about" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">About CtrlX_Error</h2>
            <p className="text-gray-600 mb-4 max-w-3xl mx-auto">
              CtrlX_Error was founded in 2025 by a team of developers who were frustrated with existing bug tracking solutions. We set out to create a tool that would make bug tracking simple, intuitive, and effective.
            </p>
            <p className="text-gray-600 mb-4 max-w-3xl mx-auto">
              Our mission is to help development teams deliver higher quality software by providing them with the tools they need to track and resolve bugs efficiently.
            </p>
          </div>

          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Meet Our Team</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Dedicated professionals passionate about helping teams build better software.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Team Member 1 */}
            <div className="text-center">
              <img src="../src/assets/images/Naman.png" alt="Naman Chanana" className="w-48 h-48 rounded-full object-cover mx-auto mb-4 shadow-lg" />
              <h4 className="text-xl font-bold text-gray-800 mb-2">Naman Chanana</h4>
              <p className="text-primary font-medium mb-2">CEO & Co-Founder</p>
              <p className="text-gray-600 text-sm">
                Former software engineer with 15+ years of experience at leading tech companies, passionate about building tools that improve developer productivity.
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="text-center">
              <img src="../src/assets/images/Amulya.jpeg" alt="Amulya Jain" className="w-48 h-48 rounded-full object-cover mx-auto mb-4 shadow-lg" />
              <h4 className="text-xl font-bold text-gray-800 mb-2">Amulya Jain</h4>
              <p className="text-primary font-medium mb-2">CTO & Co-Founder</p>
              <p className="text-gray-600 text-sm">
                Full-stack developer who previously led engineering teams at startups and enterprises, focused on creating scalable and reliable software solutions.
              </p>
            </div>

            {/* Team Member 3 */}
            <div className="text-center">
              <img src="../src/assets/images/Soumya.jpeg" alt="Soumya Jain" className="w-48 h-48 rounded-full object-cover mx-auto mb-4 shadow-lg" />
              <h4 className="text-xl font-bold text-gray-800 mb-2">Soumya Jain</h4>
              <p className="text-primary font-medium mb-2">Head of Product</p>
              <p className="text-gray-600 text-sm">
                Product leader with extensive experience in developer tools and project management software, committed to user-centered design principles.
              </p>
            </div>

            {/* Team Member 4 */}
            <div className="text-center">
              <img src="../src/assets/images/Smriti.jpeg" alt="Smriti" className="w-48 h-48 rounded-full object-cover mx-auto mb-4 shadow-lg" />
              <h4 className="text-xl font-bold text-gray-800 mb-2">Smriti</h4>
              <p className="text-primary font-medium mb-2">QA Lead</p>
              <p className="text-gray-600 text-sm">
                Quality assurance expert with a passion for creating efficient testing processes and ensuring software reliability across multiple platforms.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Contact Us</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Have questions or need support? We're here to help!
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Get in Touch</h3>
              <p className="text-gray-600 mb-4">
                Email: support@ctrlxerror.com
              </p>
              <p className="text-gray-600 mb-4">
                Phone: +1 (555) 123-4567
              </p>
              <p className="text-gray-600">
                Office Hours: Monday - Friday, 9:00 AM - 5:00 PM EST
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="https://x.com/naman_chan09" target="_blank" className="text-gray-600 hover:text-primary">
                  <LuTwitter className="text-2xl" />
                </a>
                <a href="https://github.com/Rishy-09/CtrlX_Error" target="_blank" className="text-gray-600 hover:text-primary">
                  <LuGithub className="text-2xl" />
                </a>
                <a href="https://www.linkedin.com/in/amulya-jain04/" target="_blank" className="text-gray-600 hover:text-primary">
                  <LuLinkedin className="text-2xl" />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61571028873441" target="_blank" className="text-gray-600 hover:text-primary">
                  <LuFacebook className="text-2xl" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Policy Section */}
      <section id="privacy" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Privacy Policy</h2>
            <div className="prose max-w-none">
              <h3 className="text-xl font-bold text-gray-800 mb-4">1. Information We Collect</h3>
              <p className="text-gray-600 mb-4">
                We collect information that you provide directly to us, including your name, email address, and any other information you choose to provide when using our services.
              </p>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">2. How We Use Your Information</h3>
              <p className="text-gray-600 mb-4">
                We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to protect our services and users.
              </p>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">3. Data Security</h3>
              <p className="text-gray-600 mb-4">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms of Service Section */}
      <section id="terms" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Terms of Service</h2>
            <div className="prose max-w-none">
              <h3 className="text-xl font-bold text-gray-800 mb-4">1. Acceptance of Terms</h3>
              <p className="text-gray-600 mb-4">
                By accessing or using CtrlX_Error, you agree to be bound by these Terms of Service and all applicable laws and regulations.
              </p>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">2. Use License</h3>
              <p className="text-gray-600 mb-4">
                Permission is granted to temporarily use CtrlX_Error for personal or business purposes, subject to these Terms of Service.
              </p>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">3. User Responsibilities</h3>
              <p className="text-gray-600 mb-4">
                You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to improve your bug tracking workflow?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are already using CtrlX_Error to track and fix bugs faster.
          </p>
          <button 
            onClick={() => navigate('/signup')} 
            className="bg-white text-primary px-8 py-3 rounded-md hover:bg-blue-50 transition font-medium"
          >
            Start Your Free Trial
          </button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <LuBug className="text-primary text-2xl mr-2" />
                <span className="text-xl font-bold text-white">CtrlX_Error</span>
              </div>
              <p className="text-gray-400 mb-4">
                The bug tracking solution designed for modern development teams.
              </p>
              <div className="flex space-x-4">
                <a href="https://x.com/naman_chan09" target="_blank" className="text-gray-400 hover:text-primary">
                  <LuTwitter />
                </a>
                <a href="https://github.com/Rishy-09/CtrlX_Error" target="_blank" className="text-gray-400 hover:text-primary">
                  <LuGithub />
                </a>
                <a href="https://www.linkedin.com/in/amulya-jain04/" target="_blank" className="text-gray-400 hover:text-primary">
                  <LuLinkedin />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61571028873441" target="_blank" className="text-gray-400 hover:text-primary">
                  <LuFacebook />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-primary">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-primary">Pricing</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-primary">About Us</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#contact" className="text-gray-400 hover:text-primary">Contact</a></li>
                <li><a href="#privacy" className="text-gray-400 hover:text-primary">Privacy Policy</a></li>
                <li><a href="#terms" className="text-gray-400 hover:text-primary">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#about" className="text-gray-400 hover:text-primary">About</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-primary">Careers</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-primary">Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-sm text-gray-400 text-center">
            <p>&copy; {new Date().getFullYear()} CtrlX_Error. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 