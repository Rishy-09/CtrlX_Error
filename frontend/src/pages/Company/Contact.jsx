import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [mapBlocked, setMapBlocked] = useState(false);

  // Check if map is blocked
  useEffect(() => {
    const checkMapLoaded = setTimeout(() => {
      const iframe = document.querySelector('#google-map-iframe');
      if (iframe) {
        try {
          // If we can't access contentWindow, it's likely blocked
          if (!iframe.contentWindow) {
            setMapBlocked(true);
          }
        } catch (e) {
          setMapBlocked(true);
        }
      }
    }, 1000);

    return () => clearTimeout(checkMapLoaded);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitResult({
        success: true,
        message: 'Thank you for your message! We will get back to you soon.'
      });
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setSubmitting(false);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt className="text-2xl text-primary" />,
      title: 'Our Location',
      details: [
        '123 Tech Avenue',
        'San Francisco, CA 94107',
        'United States'
      ]
    },
    {
      icon: <FaPhone className="text-2xl text-primary" />,
      title: 'Phone Numbers',
      details: [
        '+1 (555) 123-4567 (Sales)',
        '+1 (555) 765-4321 (Support)'
      ]
    },
    {
      icon: <FaEnvelope className="text-2xl text-primary" />,
      title: 'Email Us',
      details: [
        'info@taskmanagementsystem.com',
        'support@taskmanagementsystem.com'
      ]
    },
    {
      icon: <FaClock className="text-2xl text-primary" />,
      title: 'Business Hours',
      details: [
        'Monday - Friday: 9am to 6pm',
        'Saturday: 10am to 4pm',
        'Sunday: Closed'
      ]
    }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl max-w-3xl mx-auto">
            We'd love to hear from you! Reach out with questions, feedback, or inquiries and our team will respond promptly.
          </p>
        </div>
      </div>

      {/* Contact Form and Info */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Get In Touch</h2>
            
            <div className="space-y-8">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex">
                  <div className="mr-4 mt-1">
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 dark:text-white">{info.title}</h3>
                    {info.details.map((detail, i) => (
                      <p key={i} className="text-gray-600 dark:text-gray-400 mb-1">{detail}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6 dark:text-white">Send Us A Message</h2>
              
              {submitResult && (
                <div className={`mb-6 p-4 rounded-md ${submitResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {submitResult.message}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  ></textarea>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-md transition-colors duration-300 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="w-full h-96 my-16 relative">
        {mapBlocked ? (
          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center p-6 text-center border rounded-lg">
            <FaExclamationTriangle className="text-yellow-500 text-5xl mb-4" />
            <h3 className="text-xl font-bold mb-2 dark:text-white">Map Loading Blocked</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-lg">
              The map appears to be blocked by your browser or an extension (like an ad blocker). You can visit us at 123 Tech Avenue, San Francisco, CA 94107 or temporarily disable your content blocker to view the map.
            </p>
            <a 
              href="https://maps.google.com/?q=San+Francisco,+CA+94107" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition-colors"
            >
              Open in Google Maps
            </a>
          </div>
        ) : null}
        <iframe 
          id="google-map-iframe"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0968570608597!2d-122.40058018446096!3d37.78369977975895!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808f7fd68ae47f79%3A0xb33086f2e0fbc8b5!2sSan%20Francisco%2C%20CA%2094107!5e0!3m2!1sen!2sus!4v1647896458237!5m2!1sen!2sus" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen="" 
          loading="lazy"
          title="Office Location"
          onError={() => setMapBlocked(true)}
        ></iframe>
      </div>
    </MainLayout>
  );
};

export default Contact; 