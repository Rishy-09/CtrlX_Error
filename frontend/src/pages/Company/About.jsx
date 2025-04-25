import React from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';

const About = () => {
  const teamMembers = [
    {
      name: 'Alex Johnson',
      role: 'CEO & Founder',
      bio: 'Alex has over 15 years of experience in software development and project management. He founded Task Management System with the vision of making team collaboration seamless and efficient.',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        github: 'https://github.com'
      }
    },
    {
      name: 'Sarah Chen',
      role: 'CTO',
      bio: 'Sarah is an expert in cloud architecture and scalable systems. She leads our technical team and ensures our platform remains cutting-edge and secure.',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        github: 'https://github.com'
      }
    },
    {
      name: 'Michael Rodriguez',
      role: 'Head of Product',
      bio: 'Michael brings a user-centered approach to product development. His background in UX design helps ensure our platform is intuitive and accessible for all users.',
      image: 'https://randomuser.me/api/portraits/men/67.jpg',
      social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        github: 'https://github.com'
      }
    },
    {
      name: 'Priya Patel',
      role: 'Head of Customer Success',
      bio: 'Priya is dedicated to helping our customers get the most out of our platform. She leads our support team and oversees customer onboarding and training.',
      image: 'https://randomuser.me/api/portraits/women/63.jpg',
      social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        github: 'https://github.com'
      }
    }
  ];

  return (
    <MainLayout>
      <div className="bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <div className="bg-primary text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Us</h1>
            <p className="text-xl max-w-3xl mx-auto">
              We're on a mission to make team collaboration and task management simple and effective for organizations of all sizes.
            </p>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center dark:text-white">Our Story</h2>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Founded in 2018, Task Management System began with a simple idea: teams work better when they have the right tools. Our founder, Alex Johnson, experienced firsthand the challenges of managing complex projects across distributed teams and saw an opportunity to create something better.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                What started as a simple task tracking tool has evolved into a comprehensive platform used by thousands of teams worldwide. We've grown from a team of 3 working out of a small office to a diverse team of over 50 professionals passionate about creating the best task management experience possible.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Today, we continue to innovate and improve our platform based on customer feedback and industry best practices. Our mission remains the same: to help teams work smarter, collaborate better, and achieve their goals with less friction.
              </p>
            </div>
          </div>
        </div>

        {/* Our Values Section */}
        <div className="bg-gray-100 dark:bg-gray-800 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-center dark:text-white">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-3 dark:text-white">Simplicity</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We believe that the best tools get out of your way. We focus on creating intuitive interfaces that make complex work feel simple.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-3 dark:text-white">Transparency</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We promote open communication within our team and with our customers. We share our roadmap, listen to feedback, and admit when we make mistakes.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-3 dark:text-white">Continuous Improvement</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We're never satisfied with the status quo. We constantly seek ways to improve our product, our processes, and ourselves.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-10 text-center dark:text-white">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/400x400?text=Photo+Unavailable";
                  }}
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1 dark:text-white">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{member.bio}</p>
                  <div className="flex space-x-4">
                    <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
                      <FaLinkedin size={20} />
                    </a>
                    <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
                      <FaTwitter size={20} />
                    </a>
                    <a href={member.social.github} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
                      <FaGithub size={20} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-primary text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Join Our Team</h2>
            <p className="text-xl max-w-3xl mx-auto mb-8">
              We're always looking for talented individuals to join our mission. Check out our open positions and see if there's a fit for you.
            </p>
            <a 
              href="/careers" 
              className="bg-white text-primary hover:bg-gray-100 py-3 px-8 rounded-md font-medium transition-colors duration-300"
            >
              View Open Positions
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default About; 