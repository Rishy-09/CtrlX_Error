import React from 'react';
import MainLayout from '../../components/layouts/MainLayout';

const PrivacyPolicy = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Privacy Policy</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="prose dark:prose-invert max-w-none">
            <p className="lead">
              Your privacy is important to us. It is Task Management System's policy to respect your privacy regarding any information we may collect from you across our website and application.
            </p>
            
            <h2>Information We Collect</h2>
            <p>
              We only collect information about you if we have a reason to do so—for example, to provide our services, to communicate with you, or to make our services better.
            </p>
            <p>
              We collect information in the following ways:
            </p>
            <ul>
              <li>Information you provide to us directly: We ask for basic information from you in order to set up your account.</li>
              <li>Information we get when you use our services: We collect information about the actions you take while using our application.</li>
              <li>Cookies: We use cookies to help us identify and track visitors, their usage of our website, and their website access preferences.</li>
            </ul>
            
            <h2>How We Use Information</h2>
            <p>
              We use the information we collect in various ways, including to:
            </p>
            <ul>
              <li>Provide, operate, and maintain our services</li>
              <li>Improve, personalize, and expand our services</li>
              <li>Understand and analyze how you use our services</li>
              <li>Develop new products, services, features, and functionality</li>
              <li>Communicate with you, either directly or through one of our partners, to provide you with updates and other information relating to the service</li>
              <li>Process your transactions</li>
              <li>Send you emails</li>
              <li>Find and prevent fraud</li>
            </ul>
            
            <h2>Data Retention</h2>
            <p>
              We retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.
            </p>
            
            <h2>Data Protection</h2>
            <p>
              We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.
            </p>
            <p>
              We offer the use of a secure server. All supplied sensitive information is transmitted via Secure Socket Layer (SSL) technology and then encrypted into our payment gateway providers database only to be accessible by those authorized with special access rights to such systems, and are required to keep the information confidential.
            </p>
            
            <h2>Third-Party Services</h2>
            <p>
              We may employ third-party companies and individuals due to the following reasons:
            </p>
            <ul>
              <li>To facilitate our service</li>
              <li>To provide the service on our behalf</li>
              <li>To perform service-related services</li>
              <li>To assist us in analyzing how our service is used</li>
            </ul>
            <p>
              We want to inform our service users that these third parties have access to your personal information. The reason is to perform the tasks assigned to them on our behalf. However, they are obligated not to disclose or use the information for any other purpose.
            </p>
            
            <h2>Your Rights</h2>
            <p>
              You have the following data protection rights:
            </p>
            <ul>
              <li>The right to access, update or delete the information we have on you</li>
              <li>The right of rectification - the right to have your information rectified if that information is inaccurate or incomplete</li>
              <li>The right to object - the right to object to our processing of your personal data</li>
              <li>The right of restriction - the right to request that we restrict the processing of your personal information</li>
              <li>The right to data portability - the right to be provided with a copy of the information we have on you in a structured, machine-readable and commonly used format</li>
              <li>The right to withdraw consent - the right to withdraw your consent at any time where we relied on your consent to process your personal information</li>
            </ul>
            
            <h2>Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
            
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@taskmanagementsystem.com.
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

export default PrivacyPolicy; 