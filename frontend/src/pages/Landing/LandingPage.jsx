import React from 'react';
import { Link } from 'react-router-dom';
import { FaTasks, FaBug, FaComments, FaUsers, FaBell, FaChartLine, FaLock, FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaTasks className="text-blue-600 text-2xl" />
            <span className="text-xl font-bold text-gray-800">CtrlX_Error</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600">Features</a>
            <a href="#about" className="text-gray-600 hover:text-blue-600">About</a>
            <a href="#testimonials" className="text-gray-600 hover:text-blue-600">Testimonials</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="px-4 py-2 rounded text-blue-600 hover:text-blue-800">Login</Link>
            <Link to="/signUp" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Sign Up</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-12 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Powerful Task Management for Teams</h1>
            <p className="text-xl mb-8">Streamline your workflow, track bugs effectively, and collaborate seamlessly with your team.</p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/signUp" className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 text-center">
                Get Started Free
              </Link>
              <a href="#features" className="px-6 py-3 border border-white rounded-lg font-medium hover:bg-white hover:bg-opacity-10 text-center">
                Learn More
              </a>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://placehold.co/600x400/3b82f6/ffffff?text=Task+Management" 
              alt="Task Management Dashboard Preview" 
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Comprehensive Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage projects, track bugs, and collaborate with your team.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <FaTasks className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Task Management</h3>
              <p className="text-gray-600">
                Create, assign, and track tasks with deadlines, priorities, and custom statuses to keep your team organized.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <FaBug className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Bug Tracking</h3>
              <p className="text-gray-600">
                Report, categorize, and resolve bugs efficiently with detailed tracking and integrated workflows.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <FaComments className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Chat & Collaboration</h3>
              <p className="text-gray-600">
                Real-time messaging, file sharing, and AI-powered chat assistance for seamless team communication.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <FaUsers className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">User Management</h3>
              <p className="text-gray-600">
                Organize team members with roles, permissions, and customizable access controls.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="bg-yellow-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <FaBell className="text-yellow-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Notifications & Reminders</h3>
              <p className="text-gray-600">
                Stay informed with customizable notifications and automated reminders for deadlines and updates.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="bg-indigo-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <FaChartLine className="text-indigo-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Reports & Analytics</h3>
              <p className="text-gray-600">
                Gain insights with comprehensive reporting tools and performance analytics dashboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">About TaskPro</h2>
            <p className="text-lg text-gray-600 mb-10">
              TaskPro is a comprehensive task management system designed for modern development teams. Built with focus on usability, 
              collaboration, and efficiency, our platform helps teams of all sizes streamline their workflows and deliver projects on time.
            </p>
            
            <div className="bg-white p-8 rounded-xl shadow-sm mb-10">
              <h3 className="text-xl font-semibold mb-4">Our Technology Stack</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">React</div>
                <div className="p-4 bg-gray-50 rounded-lg">Node.js</div>
                <div className="p-4 bg-gray-50 rounded-lg">Express</div>
                <div className="p-4 bg-gray-50 rounded-lg">MongoDB</div>
                <div className="p-4 bg-gray-50 rounded-lg">Tailwind CSS</div>
                <div className="p-4 bg-gray-50 rounded-lg">Socket.IO</div>
                <div className="p-4 bg-gray-50 rounded-lg">JWT Auth</div>
                <div className="p-4 bg-gray-50 rounded-lg">OpenRouter AI</div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <a 
                href="#" 
                className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 flex items-center"
              >
                <FaGithub className="mr-2" /> GitHub
              </a>
              <a 
                href="#" 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center"
              >
                <FaLock className="mr-2" /> Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trusted by development teams around the world.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full mr-4 flex items-center justify-center text-white font-bold">
                  JD
                </div>
                <div>
                  <h4 className="font-semibold">John Doe</h4>
                  <p className="text-gray-600 text-sm">Tech Lead, Acme Corp</p>
                </div>
              </div>
              <p className="text-gray-700">
                "TaskPro has completely transformed how our team manages projects. The bug tracking system is incredibly detailed and has helped us reduce our resolution time by 30%."
              </p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full mr-4 flex items-center justify-center text-white font-bold">
                  AS
                </div>
                <div>
                  <h4 className="font-semibold">Alice Smith</h4>
                  <p className="text-gray-600 text-sm">Project Manager, TechStart</p>
                </div>
              </div>
              <p className="text-gray-700">
                "The chat feature with AI assistance has been a game-changer for our remote team. It's like having a team member who's always available to answer questions and provide guidance."
              </p>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full mr-4 flex items-center justify-center text-white font-bold">
                  RJ
                </div>
                <div>
                  <h4 className="font-semibold">Robert Johnson</h4>
                  <p className="text-gray-600 text-sm">CTO, Innovate Inc</p>
                </div>
              </div>
              <p className="text-gray-700">
                "The analytics dashboard gives me instant visibility into our team's performance and project status. It's become an essential tool for our daily stand-ups and strategic planning."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of teams already using TaskPro to streamline their workflow.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              to="/signUp" 
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 text-center"
            >
              Sign Up for Free
            </Link>
            <Link 
              to="/login" 
              className="px-8 py-4 border border-white rounded-lg font-medium hover:bg-white hover:bg-opacity-10 text-center"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FaTasks className="text-blue-400 text-2xl" />
                <span className="text-xl font-bold">TaskPro</span>
              </div>
              <p className="text-gray-400 mb-4">
                Streamline your workflow, track bugs effectively, and collaborate seamlessly with your team.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <FaTwitter size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <FaLinkedin size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <FaGithub size={20} />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Integrations</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Changelog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">API References</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#about" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} TaskPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 