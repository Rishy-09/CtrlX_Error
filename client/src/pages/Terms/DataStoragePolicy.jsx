import React from 'react';
import MainLayout from '../../components/layouts/MainLayout';

const DataStoragePolicy = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Browser Data Storage Policy</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="prose dark:prose-invert max-w-none">
            <p className="lead">
              This Browser Data Storage Policy explains how Task Management System uses browser storage and similar technologies to recognize you when you visit our website or application. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>
            
            <h2>What Are Browser Storage Files?</h2>
            <p>
              Browser storage files are small data files that are placed on your computer or mobile device when you visit a website. These files are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
            </p>
            <p>
              Storage files set by the website owner (in this case, Task Management System) are called "first-party storage". Files set by parties other than the website owner are called "third-party storage". Third-party storage enables third-party features or functionality to be provided on or through the website (e.g., analytics, interactive content, and user preferences). The parties that set these third-party storage can recognize your computer both when it visits the website in question and also when it visits certain other websites.
            </p>
            
            <h2>Why Do We Use Browser Storage?</h2>
            <p>
              We use first-party and third-party storage for several reasons. Some storage is required for technical reasons in order for our website to operate, and we refer to these as "essential" or "strictly necessary" storage. Other storage also enable us to track and target the interests of our users to enhance the experience on our online properties. We may also use storage to analyze how our services are used.
            </p>
            
            <h2>Types of Browser Storage We Use</h2>
            <p>
              The specific types of first and third-party storage served through our website and the purposes they perform are described below:
            </p>
            
            <h3>Essential Website Storage</h3>
            <p>
              These storage files are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas. Because these files are strictly necessary to deliver the website, you cannot refuse them without impacting how our website functions.
            </p>
            
            <h3>Performance and Functionality Storage</h3>
            <p>
              These storage mechanisms are used to enhance the performance and functionality of our website but are non-essential to their use. However, without these storage options, certain functionality may become unavailable.
            </p>
            
            <h3>Analytics Storage</h3>
            <p>
              These storage mechanisms collect information that is used either in aggregate form to help us understand how our website is being used or how effective our marketing campaigns are, or to help us customize our website for you in order to enhance your experience.
            </p>
            
            <h3>Preference Storage</h3>
            <p>
              These storage mechanisms allow our website to remember choices you make when you use our website, such as your preferred language or the region you are in. These can also be used to remember changes you have made to text size, fonts, and other parts of web pages that you can customize.
            </p>
            
            <h2>Your Browser Storage Choices and Control</h2>
            <p>
              You have the right to decide whether to accept or reject browser storage. You can exercise your preferences in the following ways:
            </p>
            <ul>
              <li><strong>Browser Settings</strong>: You can set or amend your web browser controls to accept or refuse storage files. If you choose to reject storage, you may still use our website though your access to some functionality and areas may be restricted. As the means by which you can refuse storage through your web browser controls vary from browser to browser, you should visit your browser's help menu for more information.</li>
              <li><strong>Preference Manager</strong>: We provide a preference manager accessible from our website footer that allows you to selectively enable or disable categories of browser storage.</li>
              <li><strong>Do Not Track</strong>: Some browsers support a "Do Not Track" feature, which signals to websites you visit that you do not want to have your online activity tracked. Our site respects Do Not Track signals.</li>
            </ul>
            
            <h2>Updates to This Policy</h2>
            <p>
              We may update this Browser Data Storage Policy from time to time in order to reflect changes to the storage mechanisms we use or for other operational, legal, or regulatory reasons. Please therefore revisit this policy regularly to stay informed about our use of browser storage and related technologies.
            </p>
            <p>
              The date at the bottom of this policy indicates when it was last updated.
            </p>
            
            <h2>Contact Us</h2>
            <p>
              If you have any questions about our use of browser storage or other technologies, please email us at privacy@taskmanagementsystem.com.
            </p>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </MainLayout>
  );
};

export default DataStoragePolicy; 